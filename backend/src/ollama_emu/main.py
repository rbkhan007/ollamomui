"""
OllamoMUI v1.0.4 â€“ Free AI Gateway
====================================
Copyright (c) 2024-2026 Rhasan@dev.

Licensed under the MIT License. See the LICENSE file
for the full text. This software is provided "as is",
without warranty of any kind.
"""
import os
import sys
import json
import threading
import datetime
import uuid
import httpx
import uvicorn
import logging
from fastapi import FastAPI, Request, HTTPException, UploadFile, File, Form
from fastapi.responses import StreamingResponse, JSONResponse, FileResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.middleware.httpsredirect import HTTPSRedirectMiddleware
from fastapi.exceptions import RequestValidationError
from pydantic import BaseModel, Field, field_validator
from typing import Dict, Optional, List, Any
import re
import secrets
import ipaddress
import urllib.parse
import argparse
from ollama_emu import acl as _acl
from ollama_emu.payment import router as payment_router

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s", stream=sys.stdout)
log = logging.getLogger("ollama-emu")

ALLOWED_URL_SCHEMES = {"https", "http"}
MAX_TEXT_LENGTH = 100_000
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB

# Resolve these once at startup from env / CLI; used for binding + CORS policy.
BIND_HOST = "127.0.0.1"
BIND_PORT = 11434

# SSL / Security
# SSL enforcement is OFF by default so the app works over plain HTTP (local
# dev, LAN, or behind a TLS-terminating proxy). Enable per-deployment with env vars.
SSL_KEYFILE = os.environ.get("SSL_KEYFILE", "")
SSL_CERTFILE = os.environ.get("SSL_CERTFILE", "")
SSL_REDIRECT = os.environ.get("SSL_REDIRECT", "false").lower() in ("1", "true", "yes")
COOKIE_SECURE = os.environ.get("COOKIE_SECURE", "false").lower() in ("1", "true", "yes")


def validate_url(url: str, name: str = "URL") -> str:
    url = url.strip()
    if not re.match(r'^https?://[^\s/$.?#].[^\s]*$', url, re.IGNORECASE):
        raise HTTPException(status_code=400, detail=f"Invalid {name}: must be a valid http/https URL")
    if len(url) > 2048:
        raise HTTPException(status_code=400, detail=f"{name} too long (max 2048 chars)")
    parsed = urllib.parse.urlparse(url)
    if parsed.scheme not in ALLOWED_URL_SCHEMES:
        raise HTTPException(status_code=400, detail=f"Invalid {name}: unsupported scheme '{parsed.scheme}'")
    # SSRF guard: reject literal IPs that point at private/loopback/link-local/metadata ranges.
    host = parsed.hostname
    if host:
        try:
            ip = ipaddress.ip_address(host)
            if (
                ip.is_private
                or ip.is_loopback
                or ip.is_link_local
                or ip.is_reserved
                or ip.is_multicast
                or str(ip) == "169.254.169.254"
            ):
                raise HTTPException(
                    status_code=400,
                    detail=f"Invalid {name}: private/loopback/metadata addresses are not allowed",
                )
        except ValueError:
            pass  # hostname (not a literal IP) â€” allowed; DNS-based SSRF is mitigated by allow-listing schemes
    return url

def sanitize_filename(filename: str) -> str:
    name = os.path.basename(filename)
    name = re.sub(r'[^\w\-_. ]', '_', name)
    name = name[:255]
    return name

def mask_error(msg: str) -> str:
    return msg.replace(os.sep, "/").split("Traceback")[0].strip()[:200]

from ollama_emu.rag import RAGEngine
from ollama_emu.memory import MemorySystem
from ollama_emu.device_identity import ensure_device, get_device, now_local, local_now_iso, device_summary

VERSION = "1.0.4"

# ============================================================
# CONFIGURATION & PROVIDER DATABASE
# ============================================================
DEFAULT_PROVIDERS: Dict[str, Dict[str, Any]] = {
    "openai": {
        "url": "https://api.openai.com/v1/chat/completions",
        "models_url": "https://api.openai.com/v1/models",
        "auth_type": "bearer",
        "default_model": "gpt-3.5-turbo",
        "free_heuristic": False,
        "type": "openai",
    },
    "anthropic": {
        "url": "https://api.anthropic.com/v1/messages",
        "models_url": None,
        "auth_type": "header",
        "default_model": "claude-3-sonnet-20240229",
        "free_heuristic": False,
        "type": "anthropic",
    },
    "claude": {
        "url": "https://api.anthropic.com/v1/messages",
        "models_url": None,
        "auth_type": "header",
        "default_model": "claude-3-5-sonnet-20241022",
        "free_heuristic": False,
        "type": "anthropic",
    },
    "groq": {
        "url": "https://api.groq.com/openai/v1/chat/completions",
        "models_url": "https://api.groq.com/openai/v1/models",
        "auth_type": "bearer",
        "default_model": "llama3-70b-8192",
        "free_heuristic": True,
        "type": "openai",
    },
    "deepseek": {
        "url": "https://api.deepseek.com/chat/completions",
        "models_url": "https://api.deepseek.com/v1/models",
        "auth_type": "bearer",
        "default_model": "deepseek-chat",
        "free_heuristic": True,
        "type": "openai",
    },
    "gemini": {
        "url": "https://generativelanguage.googleapis.com/v1beta/models/{model}:streamGenerateContent?key={key}&alt=sse",
        "models_url": "https://generativelanguage.googleapis.com/v1/models?key={key}",
        "auth_type": "query",
        "default_model": "gemini-1.5-flash",
        "free_heuristic": True,
        "type": "gemini",
    },
    "openrouter": {
        "url": "https://openrouter.ai/api/v1/chat/completions",
        "models_url": "https://openrouter.ai/api/v1/models",
        "auth_type": "bearer",
        "default_model": "tencent/hy3:free",
        "free_heuristic": "api",
        "type": "openai",
    },
    "mistral": {
        "url": "https://api.mistral.ai/v1/chat/completions",
        "models_url": "https://api.mistral.ai/v1/models",
        "auth_type": "bearer",
        "default_model": "mistral-tiny",
        "free_heuristic": False,
        "type": "openai",
    },
    "together": {
        "url": "https://api.together.xyz/v1/chat/completions",
        "models_url": "https://api.together.xyz/v1/models",
        "auth_type": "bearer",
        "default_model": "meta-llama/Llama-3-70b-chat-hf",
        "free_heuristic": False,
        "type": "openai",
    },
}

# Comprehensive model catalog - used as fallback when API calls fail or no key is set
MODEL_CATALOG: Dict[str, List[Dict[str, Any]]] = {
    "openrouter": [
        {"name": "tencent/hy3:free", "free": True},
        {"name": "deepseek/deepseek-chat-v3-0324:free", "free": True},
        {"name": "deepseek/deepseek-r1-0528:free", "free": True},
        {"name": "google/gemma-3-12b-it:free", "free": True},
        {"name": "meta-llama/llama-4-maverick:free", "free": True},
        {"name": "meta-llama/llama-4-scout:free", "free": True},
        {"name": "microsoft/mai-ds-r1:free", "free": True},
        {"name": "qwen/qwen3-235b-a22b:free", "free": True},
        {"name": "qwen/qwen3-coder:free", "free": True},
        {"name": "nvidia/llama-3.1-nemotron-ultra-253b-v1:free", "free": True},
        {"name": "mistralai/mistral-small-3.2-24b-instruct:free", "free": True},
        {"name": "openai/gpt-4o-mini", "free": False},
        {"name": "anthropic/claude-3.5-sonnet", "free": False},
        {"name": "google/gemini-2.5-flash", "free": False},
    ],
    "groq": [
        {"name": "llama3-70b-8192", "free": True},
        {"name": "llama3-8b-8192", "free": True},
        {"name": "mixtral-8x7b-32768", "free": True},
        {"name": "gemma2-9b-it", "free": True},
        {"name": "llama-3.3-70b-versatile", "free": True},
        {"name": "llama-3.1-8b-instant", "free": True},
        {"name": "deepseek-r1-distill-llama-70b", "free": True},
    ],
    "deepseek": [
        {"name": "deepseek-chat", "free": True},
        {"name": "deepseek-reasoner", "free": True},
    ],
    "gemini": [
        {"name": "gemini-1.5-flash", "free": True},
        {"name": "gemini-1.5-pro", "free": True},
        {"name": "gemini-2.0-flash", "free": True},
        {"name": "gemini-2.5-flash", "free": True},
        {"name": "gemini-2.5-pro", "free": False},
    ],
    "openai": [
        {"name": "gpt-3.5-turbo", "free": False},
        {"name": "gpt-4o", "free": False},
        {"name": "gpt-4o-mini", "free": False},
        {"name": "gpt-4-turbo", "free": False},
        {"name": "o1-mini", "free": False},
        {"name": "o1-preview", "free": False},
    ],
    "anthropic": [
        {"name": "claude-3-sonnet-20240229", "free": False},
        {"name": "claude-3-5-sonnet-20241022", "free": False},
        {"name": "claude-3-5-haiku-20241022", "free": False},
        {"name": "claude-3-opus-20240229", "free": False},
    ],
    "claude": [
        {"name": "claude-3-5-sonnet-20241022", "free": False},
        {"name": "claude-3-5-haiku-20241022", "free": False},
        {"name": "claude-3-opus-20240229", "free": False},
    ],
    "mistral": [
        {"name": "mistral-tiny", "free": False},
        {"name": "mistral-small-latest", "free": False},
        {"name": "mistral-medium-latest", "free": False},
        {"name": "mistral-large-latest", "free": False},
        {"name": "open-mixtral-8x7b", "free": False},
        {"name": "open-mixtral-8x22b", "free": False},
    ],
    "together": [
        {"name": "meta-llama/Llama-3-70b-chat-hf", "free": False},
        {"name": "meta-llama/Llama-3-8b-chat-hf", "free": False},
        {"name": "mistralai/Mixtral-8x7B-Instruct-v0.1", "free": False},
        {"name": "deepseek-ai/DeepSeek-V3", "free": False},
        {"name": "Qwen/Qwen2.5-72B-Instruct-Turbo", "free": False},
    ],
}

# Thread-safe state
state_lock = threading.Lock()
API_KEYS: Dict[str, str] = {}
ACTIVE_PROVIDER: str = "openrouter"
MODEL_CACHE: List[Dict] = []

# ============================================================
# POSTGRESQL PERSISTENCE (providers, auth, RAG, memory)
# ============================================================
from ollama_emu import db as _db
from ollama_emu.memory_monitor import MemoryMonitor

FRONTEND_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "..", "frontend", "out")


def init_db():
    _db.init_pool(minconn=1, maxconn=10)
    _db.migrate_schema()
    _db.seed_default_providers(DEFAULT_PROVIDERS)
    _db.seed_demo_user()
    _db.save_model_catalog(MODEL_CATALOG)


def load_providers_from_db():
    return _db.load_providers()


def save_provider_db(name, cfg, api_key=""):
    with state_lock:
        _db.save_provider(name, cfg, api_key)


def delete_provider_db(name):
    _db.delete_provider(name)


hash_password = _db.hash_password
verify_password = _db.verify_password


def create_session(email: str) -> str:
    role = "admin" if email == _acl.ADMIN_EMAIL else "user"
    token = _acl.session_manager.create(email, role=role)
    _db.create_session(email, token)
    return token


def verify_session(token: str) -> Optional[str]:
    session_info = _acl.session_manager.verify(token)
    if session_info:
        return session_info["email"]
    row = _db.get_session(token)
    if not row:
        return None
    try:
        created = datetime.datetime.fromisoformat(str(row["created_at"]))
        if (datetime.datetime.now(datetime.UTC) - created).days > 30:
            _db.delete_session(token)
            return None
    except Exception:
        return None
    return row["email"]


def delete_session(token: str):
    _acl.session_manager.destroy(token)
    _db.delete_session(token)


def init_app_state():
    """Initialize DB-backed application state.

    Deferred from import time so the app can be imported (and uvicorn can bind)
    before a database is reachable. In the desktop EXE this runs inside the
    server startup event, after the bundled PostgreSQL has been bootstrapped.
    """
    global PROVIDER_CONFIGS, API_KEYS, ACTIVE_PROVIDER
    init_db()
    PROVIDER_CONFIGS, API_KEYS = load_providers_from_db()
    if ACTIVE_PROVIDER not in PROVIDER_CONFIGS and PROVIDER_CONFIGS:
        ACTIVE_PROVIDER = next(iter(PROVIDER_CONFIGS))
    if ACTIVE_PROVIDER not in API_KEYS and "openrouter" in API_KEYS:
        ACTIVE_PROVIDER = "openrouter"
    elif ACTIVE_PROVIDER not in API_KEYS:
        for _pname, _pkey in API_KEYS.items():
            ACTIVE_PROVIDER = _pname
            break
    log.info("Startup active provider: %s (has_key=%s)", ACTIVE_PROVIDER, bool(API_KEYS.get(ACTIVE_PROVIDER)))

# ============================================================
# FASTAPI APP
# ============================================================
app = FastAPI(title="OllamoMUI – Free AI Gateway", version=VERSION)


@app.on_event("startup")
def _startup():
    import threading

    def _init_app_state_safe():
        try:
            init_app_state()
        except Exception as exc:  # noqa: BLE001
            log.error(
                "Application state initialization failed (is the database reachable?): %s",
                exc,
            )

    threading.Thread(target=_init_app_state_safe, daemon=True).start()


def _cors_origins() -> list:
    # Secure by default: only allow same-origin (the served SPA) and the
    # known local/mobile origins. When explicitly bound to a LAN address,
    # open CORS to all origins and log a warning.
    if BIND_HOST in ("127.0.0.1", "localhost", "::1", "0:0:0:0:0:0:0:1"):
        origins = [
            "http://localhost:11434",
            "http://127.0.0.1:11434",
            "http://localhost",
            "expo://localhost",
            "capacitor://localhost",
        ]
    else:
        origins = ["*"]

    # Always allow the hosted web frontend (Vercel) and any explicitly
    # configured extra origins via CORS_ORIGINS (comma-separated).
    # This is required because the web SPA is served from a different
    # origin than the backend (e.g. vercel.app -> onrender.com) and the
    # backend is launched as an imported module (uvicorn/gunicorn/Render),
    # so BIND_HOST is still the default localhost at import time.
    web_origins = [
        "https://ollamomui.vercel.app",
        "https://www.ollamomui.vercel.app",
    ]
    extra = os.getenv("CORS_ORIGINS", "").strip()
    if extra:
        web_origins.extend([o.strip() for o in extra.split(",") if o.strip()])

    if "*" in origins:
        return origins
    return origins + web_origins


_cors_configured = False


def configure_cors(application):
    global _cors_configured
    # Idempotent: also called at module import time so the middleware is
    # installed even when the app is launched as an imported module
    # (uvicorn/gunicorn/Render), not just via `python main.py`.
    if _cors_configured:
        return
    _cors_configured = True
    application.add_middleware(
        CORSMiddleware,
        allow_origins=_cors_origins(),
        allow_methods=["*"],
        allow_headers=["*"],
    )
    if SSL_REDIRECT or (SSL_KEYFILE and SSL_CERTFILE):
        application.add_middleware(HTTPSRedirectMiddleware)
    allowed = ["localhost", "127.0.0.1", "::1", "0.0.0.0"]
    app_url = os.getenv("APP_URL", "").strip()
    if app_url:
        try:
            from urllib.parse import urlparse
            host = urlparse(app_url).hostname
            if host:
                allowed.append(host)
        except Exception:
            pass
    extra = os.getenv("ALLOWED_HOSTS", "").strip()
    if extra:
        allowed.extend([h.strip() for h in extra.split(",") if h.strip()])
    allowed.append("*")
    application.add_middleware(
        TrustedHostMiddleware,
        allowed_hosts=allowed,
    )
    application.middleware("http")(_acl.create_acl_middleware(application))

app.include_router(payment_router)

# ============================================================
# RAG & MEMORY
# ============================================================
RAG = RAGEngine()
RAG_ENABLED = True
MEMORY = MemorySystem()
MEMORY_ENABLED = True

USAGE_LOCK = threading.Lock()
USAGE_LOG: List[Dict] = []
MAX_USAGE_LOG = 10000

def track_usage(model: str, provider: str, prompt_tokens: int, completion_tokens: int, success: bool, latency_ms: float):
    with USAGE_LOCK:
        USAGE_LOG.append({
            "model": model, "provider": provider,
            "prompt_tokens": prompt_tokens, "completion_tokens": completion_tokens,
            "total_tokens": prompt_tokens + completion_tokens,
            "success": success, "latency_ms": latency_ms,
            "timestamp": datetime.datetime.now(datetime.UTC).isoformat() + "Z",
        })
        if len(USAGE_LOG) > MAX_USAGE_LOG:
            USAGE_LOG.pop(0)

# ============================================================
# AUTH API ROUTES
# ============================================================

class AuthRequest(BaseModel):
    email: str
    password: str

    @field_validator("email")
    @classmethod
    def validate_auth_email(cls, v):
        v = v.strip().lower()
        if not v or len(v) > 254:
            raise ValueError("Invalid email address")
        return v

    @field_validator("password")
    @classmethod
    def validate_auth_password(cls, v):
        if not v or len(v) > 256:
            raise ValueError("Invalid password")
        return v

@app.post("/api/auth/register")
async def auth_register(request: Request, req: AuthRequest):
    ip = _acl._get_client_ip(request)
    if not _acl.rate_limit(request, "auth_register", max_requests=5, window=300):
        _acl.audit_log("rate_limited", ip=ip, details={"endpoint": "register"}, success=False)
        return _acl.rate_limit_response(request, "auth_register")
    email = req.email.strip().lower()
    if not _acl.validate_email(email):
        _acl.audit_log("register_failed", email=email, ip=ip, details={"reason": "invalid_email"}, success=False)
        raise HTTPException(status_code=400, detail="Invalid email address")
    valid, msg = _acl.validate_password(req.password)
    if not valid:
        _acl.audit_log("register_failed", email=email, ip=ip, details={"reason": msg}, success=False)
        raise HTTPException(status_code=400, detail=msg)
    pw_hash = hash_password(email, req.password)
    if not _db.create_user(email, pw_hash):
        _acl.audit_log("register_failed", email=email, ip=ip, details={"reason": "email_exists"}, success=False)
        raise HTTPException(status_code=409, detail="Email already registered")
    role = "admin" if email == _acl.ADMIN_EMAIL else "user"
    token = _acl.session_manager.create(email, role=role)
    _db.create_session(email, token)
    _acl.audit_log("register_success", email=email, ip=ip)
    resp = JSONResponse({"success": True, "token": token, "email": email, "role": role})
    resp.set_cookie(key="session_token", value=token, httponly=True, secure=COOKIE_SECURE, samesite="Lax")
    return resp

@app.post("/api/auth/login")
async def auth_login(request: Request, req: AuthRequest):
    ip = _acl._get_client_ip(request)
    if not _acl.rate_limit(request, "auth_login", max_requests=10, window=300):
        _acl.audit_log("rate_limited", ip=ip, details={"endpoint": "login"}, success=False)
        return _acl.rate_limit_response(request, "auth_login")
    email = req.email.strip().lower()
    user = _db.get_user(email)
    if not user or not verify_password(req.password, user["password_hash"]):
        _acl.audit_log("login_failed", email=email, ip=ip, details={"reason": "invalid_credentials"}, success=False)
        raise HTTPException(status_code=401, detail="Invalid email or password")
    role = "admin" if email == _acl.ADMIN_EMAIL else "user"
    token = _acl.session_manager.create(email, role=role)
    _db.create_session(email, token)
    _acl.audit_log("login_success", email=email, ip=ip, details={"role": role})
    resp = JSONResponse({"success": True, "token": token, "email": email, "role": role})
    resp.set_cookie(key="session_token", value=token, httponly=True, secure=COOKIE_SECURE, samesite="Lax")
    return resp

@app.post("/api/auth/logout")
async def auth_logout(request: Request):
    data = await request.json()
    token = data.get("token", "")
    ip = _acl._get_client_ip(request)
    if not token:
        token = request.cookies.get("session_token", "")
    if token:
        session_info = _acl.session_manager.verify(token)
        email = session_info.get("email") if session_info else None
        _acl.session_manager.destroy(token)
        _db.delete_session(token)
        _acl.audit_log("logout", email=email, ip=ip)
    resp = JSONResponse({"success": True})
    resp.delete_cookie(key="session_token")
    return resp

@app.get("/api/auth/verify")
async def auth_verify(request: Request, token: str = ""):
    if not token:
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header[len("Bearer "):]
    if not token:
        raise HTTPException(status_code=401, detail="No token provided")
    session_info = _acl.session_manager.verify(token)
    if not session_info:
        db_session = _db.get_session(token)
        if db_session:
            email = db_session["email"]
            role = "admin" if email == _acl.ADMIN_EMAIL else "user"
            return {"valid": True, "email": email, "role": role}
        raise HTTPException(status_code=401, detail="Invalid or expired session")
    return {"valid": True, "email": session_info["email"], "role": session_info.get("role", "user")}

@app.post("/api/auth/change-password")
async def auth_change_password(request: Request):
    data = await request.json()
    old_password = data.get("old_password", "")
    new_password = data.get("new_password", "")
    ip = _acl._get_client_ip(request)
    auth = _acl.get_auth_context(request)
    if not auth or not auth.get("authenticated"):
        raise HTTPException(status_code=401, detail="Not authenticated")
    email = auth["email"]
    user = _db.get_user(email)
    if not user or not verify_password(old_password, user["password_hash"]):
        _acl.audit_log("password_change_failed", email=email, ip=ip, success=False)
        raise HTTPException(status_code=401, detail="Current password is incorrect")
    valid, msg = _acl.validate_password(new_password)
    if not valid:
        raise HTTPException(status_code=400, detail=msg)
    new_hash = hash_password(email, new_password)
    if not _db.update_password(email, new_hash):
        raise HTTPException(status_code=404, detail="User not found")
    _acl.session_manager.destroy_all(email)
    _acl.audit_log("password_changed", email=email, ip=ip)
    return {"success": True, "message": "Password changed. Please login again."}

# ============================================================
# API KEY MANAGEMENT
# ============================================================

class ApiKeyRequest(BaseModel):
    name: str
    role: str = "user"
    scopes: List[str] = ["read", "write"]

@app.post("/api/auth/api-keys")
async def create_api_key(request: Request, req: ApiKeyRequest):
    auth = _acl.get_auth_context(request)
    if not auth or not auth.get("authenticated"):
        raise HTTPException(status_code=401, detail="Not authenticated")
    if not _acl.has_permission(auth.get("role", "guest"), _acl.Permission.ADMIN):
        raise HTTPException(status_code=403, detail="Admin permission required")
    result = _acl.create_api_key(name=req.name, role=req.role, email=auth.get("email"), scopes=req.scopes)
    _acl.audit_log("api_key_created", email=auth.get("email"), ip=_acl._get_client_ip(request), details={"key_id": result["id"]})
    return result

@app.get("/api/auth/api-keys")
async def list_api_keys(request: Request):
    auth = _acl.get_auth_context(request)
    if not auth or not auth.get("authenticated"):
        raise HTTPException(status_code=401, detail="Not authenticated")
    if not _acl.has_permission(auth.get("role", "guest"), _acl.Permission.ADMIN):
        raise HTTPException(status_code=403, detail="Admin permission required")
    return _acl.list_api_keys()

@app.delete("/api/auth/api-keys/{key_id}")
async def revoke_api_key(request: Request, key_id: str):
    auth = _acl.get_auth_context(request)
    if not auth or not auth.get("authenticated"):
        raise HTTPException(status_code=401, detail="Not authenticated")
    if not _acl.has_permission(auth.get("role", "guest"), _acl.Permission.ADMIN):
        raise HTTPException(status_code=403, detail="Admin permission required")
    if _acl.revoke_api_key(key_id):
        _acl.audit_log("api_key_revoked", email=auth.get("email"), ip=_acl._get_client_ip(request), details={"key_id": key_id})
        return {"success": True}
    raise HTTPException(status_code=404, detail="API key not found")

# ============================================================
# ACL & SECURITY STATS
# ============================================================

@app.get("/api/acl/stats")
async def acl_stats(request: Request):
    auth = _acl.get_auth_context(request)
    if not auth or not auth.get("authenticated"):
        raise HTTPException(status_code=401, detail="Not authenticated")
    if not _acl.has_permission(auth.get("role", "guest"), _acl.Permission.ADMIN):
        raise HTTPException(status_code=403, detail="Admin permission required")
    return _acl.get_acl_stats()

@app.get("/api/acl/audit-log")
async def audit_log_endpoint(request: Request, limit: int = 100, event: str = "", email: str = ""):
    auth = _acl.get_auth_context(request)
    if not auth or not auth.get("authenticated"):
        raise HTTPException(status_code=401, detail="Not authenticated")
    if not _acl.has_permission(auth.get("role", "guest"), _acl.Permission.ADMIN):
        raise HTTPException(status_code=403, detail="Admin permission required")
    return _acl.get_audit_log(limit=limit, event=event or None, email=email or None)

class UserUpdateRequest(BaseModel):
    role: str

    @field_validator("role")
    @classmethod
    def validate_role(cls, v):
        v = v.strip().lower()
        if v not in ("guest", "user", "power_user", "admin"):
            raise ValueError("role must be 'guest', 'user', 'power_user', or 'admin'")
        return v

class MemoryClearRequest(BaseModel):
    session_id: Optional[str] = None

    @field_validator("session_id")
    @classmethod
    def validate_clear_session(cls, v):
        if v is not None and len(v) > 200:
            raise ValueError("session_id too long")
        return v

@app.get("/api/users")
async def list_users(request: Request):
    auth = _acl.get_auth_context(request)
    if not auth or not auth.get("authenticated"):
        raise HTTPException(status_code=401, detail="Not authenticated")
    if not _acl.has_permission(auth.get("role", "guest"), _acl.Permission.ADMIN):
        raise HTTPException(status_code=403, detail="Admin permission required")
    return _db.load_all_users()


@app.get("/api/users/{email}")
async def get_user_detail(email: str, request: Request):
    auth = _acl.get_auth_context(request)
    if not auth or not auth.get("authenticated"):
        raise HTTPException(status_code=401, detail="Not authenticated")
    if not _acl.has_permission(auth.get("role", "guest"), _acl.Permission.ADMIN):
        raise HTTPException(status_code=403, detail="Admin permission required")
    user = _db.get_user(email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {"email": user["email"], "role": user.get("role", "user"), "created_at": str(user["created_at"])}


@app.put("/api/users/{email}")
async def update_user_role_endpoint(request: Request, email: str, update_data: UserUpdateRequest):
    auth = _acl.get_auth_context(request)
    if not auth or not auth.get("authenticated"):
        raise HTTPException(status_code=401, detail="Not authenticated")
    if not _acl.has_permission(auth.get("role", "guest"), _acl.Permission.ADMIN):
        raise HTTPException(status_code=403, detail="Admin permission required")
    if update_data.role not in _acl.ROLE_HIERARCHY:
        raise HTTPException(status_code=400, detail=f"Invalid role. Must be one of: {', '.join(_acl.ROLE_HIERARCHY.keys())}")
    if not _db.update_user_role(email, update_data.role):
        raise HTTPException(status_code=404, detail="User not found")
    _acl.audit_log("user_role_updated", email=auth["email"], details={"target": email, "new_role": update_data.role})
    return {"status": "updated", "email": email, "role": update_data.role}


@app.delete("/api/users/{email}")
async def delete_user_endpoint(email: str, request: Request):
    auth = _acl.get_auth_context(request)
    if not auth or not auth.get("authenticated"):
        raise HTTPException(status_code=401, detail="Not authenticated")
    if not _acl.has_permission(auth.get("role", "guest"), _acl.Permission.ADMIN):
        raise HTTPException(status_code=403, detail="Admin permission required")
    if email == auth["email"]:
        raise HTTPException(status_code=400, detail="Cannot delete your own account")
    if not _db.delete_user(email):
        raise HTTPException(status_code=404, detail="User not found")
    _acl.audit_log("user_deleted", email=auth["email"], details={"target": email})
    return {"status": "deleted", "email": email}


@app.get("/api/acl/roles")
async def acl_roles(request: Request):
    auth = _acl.get_auth_context(request)
    if not auth or not auth.get("authenticated"):
        raise HTTPException(status_code=401, detail="Not authenticated")
    return {
        "roles": list(_acl.ROLE_HIERARCHY.keys()),
        "permissions": {role: sorted(perms) for role, perms in _acl.ROLE_HIERARCHY.items()},
    }

# ============================================================
# PYDANTIC MODELS
# ============================================================

class ConfigRequest(BaseModel):
    provider: str
    api_key: str = ""

    @field_validator("provider")
    @classmethod
    def validate_config_provider(cls, v):
        v = v.strip()
        if not v or len(v) > 100:
            raise ValueError("Provider name must be 1-100 chars")
        return v

class ProviderAddRequest(BaseModel):
    name: str
    url: str
    type: str
    models_url: Optional[str] = None
    auth_type: str = "bearer"
    default_model: str = ""
    free_heuristic: Any = False
    api_key: str = ""

    @field_validator("url")
    @classmethod
    def validate_url_field(cls, v):
        return validate_url(v, "Provider URL")

    @field_validator("models_url")
    @classmethod
    def validate_models_url(cls, v):
        if v:
            return validate_url(v, "Models URL")
        return v

    @field_validator("name")
    @classmethod
    def validate_add_name(cls, v):
        v = v.strip()
        if not v or len(v) > 100:
            raise ValueError("Provider name must be 1-100 chars")
        if not re.match(r"^[\w\- ]+$", v):
            raise ValueError(
                "Provider name can only contain letters, numbers, spaces, hyphens, underscores"
            )
        return v


class ProviderUpdateRequest(BaseModel):
    url: Optional[str] = None
    models_url: Optional[str] = None
    auth_type: Optional[str] = None
    default_model: Optional[str] = None
    free_heuristic: Any = None
    type: Optional[str] = None
    api_key: Optional[str] = None
    active: Optional[bool] = None

    @field_validator("url")
    @classmethod
    def validate_upd_url(cls, v):
        if v is not None:
            return validate_url(v, "Provider URL")
        return v

    @field_validator("models_url")
    @classmethod
    def validate_upd_models_url(cls, v):
        if v is not None and v:
            return validate_url(v, "Models URL")
        return v

    @field_validator("auth_type")
    @classmethod
    def validate_upd_auth_type(cls, v):
        if v is not None and v not in ("bearer", "header", "none", ""):
            raise ValueError("auth_type must be 'bearer', 'header', or 'none'")
        return v

    @field_validator("type")
    @classmethod
    def validate_upd_type(cls, v):
        if v is not None and v not in ("openai", "anthropic", "gemini", "custom"):
            raise ValueError("type must be 'openai', 'anthropic', 'gemini', or 'custom'")
        return v


class ProviderActivateRequest(BaseModel):
    name: str

    @field_validator("name")
    @classmethod
    def validate_activate_name(cls, v):
        v = v.strip()
        if not v or len(v) > 100:
            raise ValueError("Provider name must be 1-100 chars")
        if not re.match(r"^[\w\- ]+$", v):
            raise ValueError(
                "Provider name can only contain letters, numbers, spaces, hyphens, underscores"
            )
        return v

class RagAddTextRequest(BaseModel):
    text: str
    name: str = "pasted-text"
    collection: str = "default"

    @field_validator("text")
    @classmethod
    def validate_text(cls, v):
        if len(v) > MAX_TEXT_LENGTH:
            raise ValueError(f"Text too long (max {MAX_TEXT_LENGTH} chars)")
        return v

    @field_validator("name")
    @classmethod
    def validate_name(cls, v):
        return sanitize_filename(v)[:100]

    @field_validator("collection")
    @classmethod
    def validate_collection(cls, v):
        if v and len(v) > 100:
            raise ValueError("Collection name too long")
        return v

class RagSearchRequest(BaseModel):
    query: str
    top_k: int = 5
    collection: Optional[str] = None

    @field_validator("query")
    @classmethod
    def validate_query(cls, v):
        if len(v) > 5000:
            raise ValueError("Query too long (max 5000 chars)")
        return v

    @field_validator("top_k")
    @classmethod
    def validate_top_k(cls, v):
        return max(1, min(v, 100))

class RagClearRequest(BaseModel):
    collection: Optional[str] = None

class RagContextInjectRequest(BaseModel):
    messages: List[Dict[str, str]]
    max_tokens: int = 3000
    collection: Optional[str] = None

    @field_validator("max_tokens")
    @classmethod
    def validate_max_tokens(cls, v):
        return max(100, min(v, 100_000))

    @field_validator("messages")
    @classmethod
    def validate_messages(cls, v):
        if not v or len(v) > 200:
            raise ValueError("Messages must be 1-200 entries")
        for m in v:
            if len(str(m.get("content", ""))) > MAX_TEXT_LENGTH:
                raise ValueError("Message content too long")
        return v

class MemorySearchRequest(BaseModel):
    query: str
    limit: int = 20
    session_id: Optional[str] = None

    @field_validator("query")
    @classmethod
    def validate_mem_query(cls, v):
        v = v.strip()
        if len(v) > 5000:
            raise ValueError("Query too long (max 5000 chars)")
        return v

    @field_validator("limit")
    @classmethod
    def validate_mem_limit(cls, v):
        return max(1, min(v, 500))

class MemoryFactRequest(BaseModel):
    fact: str
    source: str = ""
    importance: str = "normal"
    session_id: str = "default"

    @field_validator("fact")
    @classmethod
    def validate_fact(cls, v):
        v = v.strip()
        if not v:
            raise ValueError("Fact cannot be empty")
        if len(v) > 10000:
            raise ValueError("Fact too long (max 10000 chars)")
        return v

    @field_validator("importance")
    @classmethod
    def validate_importance(cls, v):
        if v not in ("normal", "high", "low"):
            raise ValueError("importance must be 'normal', 'high', or 'low'")
        return v

    @field_validator("session_id")
    @classmethod
    def validate_mem_session(cls, v):
        if len(v) > 200:
            raise ValueError("session_id too long")
        return v

class MemoryMessageDeleteRequest(BaseModel):
    confirm: bool = False


class RagChunkUpdateRequest(BaseModel):
    content: str

    @field_validator("content")
    @classmethod
    def validate_chunk_content(cls, v):
        v = v.strip()
        if not v:
            raise ValueError("Content cannot be empty")
        if len(v) > MAX_TEXT_LENGTH:
            raise ValueError(f"Content too long (max {MAX_TEXT_LENGTH} chars)")
        return v

# ============================================================
# PROVIDER HELPERS
# ============================================================

def get_headers(provider: str, api_key: str) -> Dict[str, str]:
    cfg = PROVIDER_CONFIGS.get(provider)
    if not cfg:
        raise HTTPException(400, "Unknown provider")
    h: Dict[str, str] = {"Content-Type": "application/json"}
    if cfg["auth_type"] == "bearer":
        h["Authorization"] = f"Bearer {api_key}"
    elif cfg["auth_type"] == "header":
        h["x-api-key"] = api_key
        h["anthropic-version"] = "2023-06-01"
    return h


def _resolve_model(provider: str, requested_model: str) -> str:
    cfg = PROVIDER_CONFIGS.get(provider)
    if not cfg:
        raise HTTPException(400, "Unknown provider")
    if not requested_model or requested_model in ("openrouter/free", "default", ""):
        return cfg["default_model"]
    return requested_model


def _resolve_target(provider: str, api_key: str, model: str):
    cfg = PROVIDER_CONFIGS.get(provider)
    if not cfg:
        raise HTTPException(400, "Unknown provider")
    headers = get_headers(provider, api_key)
    url = cfg["url"]
    if cfg["type"] == "gemini":
        url = cfg["url"].replace("{model}", model).replace("{key}", api_key)
    return cfg, url, headers


def get_model_family(model_name: str) -> str:
    """Get the model family for a given model name"""
    model_lower = model_name.lower()
    if "llama" in model_lower:
        return "llama"
    elif "mistral" in model_lower or "mixtral" in model_lower:
        return "mistral"
    elif "gemini" in model_lower:
        return "gemini"
    elif "claude" in model_lower:
        return "claude"
    elif "gpt" in model_lower:
        return "gpt"
    elif "gemma" in model_lower:
        return "gemma"
    elif "phi" in model_lower:
        return "phi"
    elif "dbrx" in model_lower:
        return "dbrx"
    elif "starling" in model_lower:
        return "starling"
    elif "nemotron" in model_lower:
        return "nemotron"
    elif "command" in model_lower:
        return "command"
    elif "jais" in model_lower:
        return "jais"
    elif "stablelm" in model_lower:
        return "stablelm"
    elif "zephyr" in model_lower:
        return "zephyr"
    elif "openchat" in model_lower:
        return "openchat"
    elif "neural" in model_lower:
        return "neural"
    elif "deepseek" in model_lower:
        return "deepseek"
    elif "qwen" in model_lower:
        return "qwen"
    elif "yi" in model_lower:
        return "yi"
    else:
        return "llm"  # Generic fallback


def get_parameter_size(model_name: str) -> str:
    """Extract or estimate parameter size from model name"""
    model_lower = model_name.lower()
    
    # Look for explicit size patterns
    size_patterns = [
        (r'(\d+\.?\d*)b', lambda m: f"{m.group(1)}B"),  # 7b, 13b, 70b, etc.
        (r'(\d+\.?\d*)m', lambda m: f"{m.group(1)}m"),  # For small models
    ]
    
    for pattern, formatter in size_patterns:
        match = re.search(pattern, model_lower)
        if match:
            return formatter(match)
    
    # Default sizes based on common model naming conventions
    if any(x in model_lower for x in ["giant", "large"]):
        if "tiny" not in model_lower:  # Avoid "tiny" confusion
            return "3B"
    if any(x in model_lower for x in ["medium"]):
        return "1B"
    if any(x in model_lower for x in ["small", "tiny"]):
        return "100M"
    
    # Check for specific known model sizes
    if "7b" in model_lower or "seven" in model_lower:
        return "7B"
    elif "13b" in model_lower or "thirteen" in model_lower:
        return "13B"
    elif "70b" in model_lower or "seventy" in model_lower:
        return "70B"
    elif "30b" in model_lower or "thirty" in model_lower:
        return "30B"
    elif "8x" in model_lower or "8*7" in model_lower:  # Mixtral 8x7B
        return "47B"  # Effective parameters
    
    return "unknown"


def get_quantization_level(model_name: str) -> str:
    """Get quantization level for a model"""
    model_lower = model_name.lower()
    
    if any(x in model_lower for x in ["q4_0", "q4_k", "q4"]):
        return "Q4_0"
    elif any(x in model_lower for x in ["q5_0", "q5_k", "q5"]):
        return "Q5_0"
    elif any(x in model_lower for x in ["q6_0", "q6_k", "q6"]):
        return "Q6_0"
    elif any(x in model_lower for x in ["q8_0", "q8_k", "q8"]):
        return "Q8_0"
    elif any(x in model_lower for x in ["f16", "float16", "fp16"]):
        return "F16"
    elif any(x in model_lower for x in ["f32", "float32", "fp32"]):
        return "F32"
    
    # Default based on model type - most served models are not quantized
    return ""


def _now() -> int:
    return int(datetime.datetime.now().timestamp())


# ============================================================
# PAYLOAD BUILDERS
# ============================================================

def build_openai_payload(ollama_req: dict, model: str) -> dict:
    msgs = ollama_req.get("messages", [])
    if not msgs and "prompt" in ollama_req:
        msgs = [{"role": "user", "content": ollama_req["prompt"]}]
    payload: dict = {
        "messages": msgs,
        "model": model,
        "stream": True,
        "temperature": ollama_req.get("temperature", 0.7),
    }
    if "max_tokens" in ollama_req:
        payload["max_tokens"] = ollama_req["max_tokens"]
    return payload


def build_anthropic_payload(ollama_req: dict, model: str) -> dict:
    sys_prompt = ""
    msgs = []
    for m in ollama_req.get("messages", []):
        if m["role"] == "system":
            sys_prompt = m["content"]
        else:
            msgs.append({"role": m["role"], "content": m["content"]})
    if not msgs and "prompt" in ollama_req:
        msgs = [{"role": "user", "content": ollama_req["prompt"]}]
    payload: dict = {"model": model, "messages": msgs, "system": sys_prompt, "stream": True}
    payload["max_tokens"] = ollama_req.get("max_tokens", 4096)
    if "temperature" in ollama_req:
        payload["temperature"] = ollama_req["temperature"]
    return payload


def build_gemini_payload(ollama_req: dict, model: str) -> dict:
    msgs = []
    for m in ollama_req.get("messages", []):
        if m["role"] == "system":
            msgs.append({"role": "user", "parts": [{"text": f"[System instruction] {m['content']}"}]})
        else:
            role = "model" if m["role"] == "assistant" else "user"
            msgs.append({"role": role, "parts": [{"text": m["content"]}]})
    if not msgs and "prompt" in ollama_req:
        msgs = [{"role": "user", "parts": [{"text": ollama_req["prompt"]}]}]
    config: dict = {"temperature": ollama_req.get("temperature", 0.7)}
    if "max_tokens" in ollama_req:
        config["maxOutputTokens"] = ollama_req["max_tokens"]
    return {"contents": msgs, "generationConfig": config}


def _build_provider_payload(messages: list, model: str, provider_type: str, extra: dict = None) -> dict:
    ollama_like: Dict[str, Any] = {"messages": messages, "model": model, "temperature": 0.7}
    if extra:
        if extra.get("max_tokens"):
            ollama_like["max_tokens"] = extra["max_tokens"]
        if extra.get("temperature") is not None:
            ollama_like["temperature"] = extra["temperature"]
    if provider_type == "anthropic":
        return build_anthropic_payload(ollama_like, model)
    if provider_type == "gemini":
        return build_gemini_payload(ollama_like, model)
    return build_openai_payload(ollama_like, model)


# ============================================================
# STREAMING ENGINES
# ============================================================

async def events_openai(url: str, headers: dict, payload: dict, model_name: str):
    async with httpx.AsyncClient() as client:
        async with client.stream("POST", url, json=payload, headers=headers, timeout=120.0) as resp:
            if resp.status_code >= 400:
                err = (await resp.aread()).decode("utf-8", "replace")[:800]
                log.error("upstream openai %d: %s", resp.status_code, err)
                yield {"model": model_name, "message": {"role": "assistant", "content": f"[Error {resp.status_code}] {err}"}, "done": True, "error": err}
                return
            async for line in resp.aiter_lines():
                if line.startswith("data: ") and line.strip() != "data: [DONE]":
                    try:
                        data = json.loads(line[6:])
                        if "error" in data:
                            err_msg = data["error"]
                            if isinstance(err_msg, dict):
                                err_msg = err_msg.get("message", str(err_msg))
                            yield {"model": model_name, "message": {"role": "assistant", "content": f"[Error] {err_msg}"}, "done": True, "error": str(err_msg)}
                            return
                        content = data.get("choices", [{}])[0].get("delta", {}).get("content", "")
                        if content:
                            yield {"model": model_name, "message": {"role": "assistant", "content": content}, "done": False}
                    except Exception:
                        pass
    yield {"model": model_name, "message": {"role": "assistant", "content": ""}, "done": True}


async def events_anthropic(url: str, headers: dict, payload: dict, model_name: str):
    async with httpx.AsyncClient() as client:
        async with client.stream("POST", url, json=payload, headers=headers, timeout=120.0) as resp:
            if resp.status_code >= 400:
                err = (await resp.aread()).decode("utf-8", "replace")[:800]
                log.error("upstream anthropic %d: %s", resp.status_code, err)
                yield {"model": model_name, "message": {"role": "assistant", "content": f"[Error {resp.status_code}] {err}"}, "done": True, "error": err}
                return
            async for line in resp.aiter_lines():
                if line.startswith("data: "):
                    try:
                        data = json.loads(line[6:])
                        if "error" in data:
                            err_msg = data["error"]
                            if isinstance(err_msg, dict):
                                err_msg = err_msg.get("message", str(err_msg))
                            yield {"model": model_name, "message": {"role": "assistant", "content": f"[Error] {err_msg}"}, "done": True, "error": str(err_msg)}
                            return
                        if data.get("type") == "content_block_delta":
                            content = data.get("delta", {}).get("text", "")
                            if content:
                                yield {"model": model_name, "message": {"role": "assistant", "content": content}, "done": False}
                    except Exception:
                        pass
    yield {"model": model_name, "message": {"role": "assistant", "content": ""}, "done": True}


async def events_gemini(url: str, payload: dict, model_name: str):
    async with httpx.AsyncClient() as client:
        async with client.stream("POST", url, json=payload, timeout=120.0) as resp:
            if resp.status_code >= 400:
                err = (await resp.aread()).decode("utf-8", "replace")[:800]
                log.error("upstream gemini %d: %s", resp.status_code, err)
                yield {"model": model_name, "message": {"role": "assistant", "content": f"[Error {resp.status_code}] {err}"}, "done": True, "error": err}
                return
            async for line in resp.aiter_lines():
                if line.startswith("data: "):
                    try:
                        data = json.loads(line[6:])
                        content = data.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "")
                        if content:
                            yield {"model": model_name, "message": {"role": "assistant", "content": content}, "done": False}
                    except Exception:
                        pass
    yield {"model": model_name, "message": {"role": "assistant", "content": ""}, "done": True}


async def stream_provider_events(url: str, headers: dict, payload: dict, cfg: dict, model_name: str):
    if cfg["type"] == "openai":
        async for ev in events_openai(url, headers, payload, model_name):
            yield ev
    elif cfg["type"] == "anthropic":
        async for ev in events_anthropic(url, headers, payload, model_name):
            yield ev
    elif cfg["type"] == "gemini":
        async for ev in events_gemini(url, payload, model_name):
            yield ev


# Ollama-compatible SSE formatters
async def _mem_wrap(gen, model="", provider=""):
    full_text = ""
    success = True
    t0 = datetime.datetime.now()
    async for chunk in gen:
        yield chunk
        if MEMORY_ENABLED:
            try:
                data = None
                if isinstance(chunk, dict):
                    data = chunk
                elif isinstance(chunk, str):
                    line = chunk.strip()
                    if not line or line == "data: [DONE]":
                        continue
                    if line.startswith("data: "):
                        line = line[6:].strip()
                    data = json.loads(line)
                if data is not None:
                    content = (data.get("message") or {}).get("content", "")
                    if content:
                        full_text += content
                    if data.get("error"):
                        success = False
            except Exception:
                pass
    latency = (datetime.datetime.now() - t0).total_seconds() * 1000
    track_usage(model, provider, 0, 0, success, round(latency))
    if MEMORY_ENABLED and full_text:
        MEMORY.add("assistant", full_text, model=model, provider=provider)


async def _ollama_stream(gen):
    """Normalize a generator of Ollama-style events (dicts or SSE/ndjson strings)
    into clean newline-delimited JSON (NDJSON) for the Ollama-native /api/chat endpoint."""
    async for ev in gen:
        if isinstance(ev, dict):
            yield json.dumps(ev) + "\n"
        elif isinstance(ev, str):
            s = ev.strip()
            if not s or s == "data: [DONE]":
                continue
            if s.startswith("data: "):
                s = s[6:].strip()
            if s:
                yield s + "\n"
        else:
            yield f"{ev}\n"


# ============================================================
# RAG CONTEXT INJECTION
# ============================================================

def _inject_rag_context(messages: list, max_tokens: int = 3000, collection: str = None) -> list:
    if not RAG_ENABLED:
        return messages
    last_user_msg = ""
    for m in reversed(messages):
        if m.get("role") == "user":
            last_user_msg = m.get("content", "")
            break
    if not last_user_msg or len(last_user_msg) < 3:
        return messages
    context = RAG.build_context(last_user_msg, max_tokens=max_tokens, collection=collection)
    if not context:
        return messages
    enhanced = []
    injected = False
    for m in messages:
        if m.get("role") == "system" and not injected:
            enhanced.append({"role": "system", "content": m["content"] + "\n\n" + context})
            injected = True
        elif m.get("role") == "user" and not injected:
            enhanced.append({"role": "system", "content": context})
            enhanced.append(m)
            injected = True
        else:
            enhanced.append(m)
    if not injected:
        enhanced.insert(0, {"role": "system", "content": context})
    return enhanced


def _anthropic_incoming_to_messages(body: dict) -> list:
    msgs = []
    sys = body.get("system")
    if sys:
        if isinstance(sys, list):
            sys = "".join(b.get("text", "") if isinstance(b, dict) else str(b) for b in sys)
        msgs.append({"role": "system", "content": sys})
    for m in body.get("messages", []):
        content = m.get("content", "")
        if isinstance(content, list):
            content = "".join(b.get("text", "") if isinstance(b, dict) else str(b) for b in content)
        msgs.append({"role": m["role"], "content": content})
    return msgs


# ============================================================
# REPLY HANDLERS (OpenAI-compatible & Anthropic-compatible)
# ============================================================

async def _openai_reply(url, headers, payload, cfg, model, stream, mode="chat"):
    if not stream:
        full = ""
        err = None
        async for ev in stream_provider_events(url, headers, payload, cfg, model):
            if ev.get("error"):
                err = ev["error"]
            full += (ev.get("message") or {}).get("content", "")
        if err:
            return JSONResponse({"error": {"message": err, "type": "upstream_error"}}, status_code=502)
        if mode == "text":
            return JSONResponse({
                "id": f"cmpl-{uuid.uuid4().hex}", "object": "text_completion", "created": _now(), "model": model,
                "choices": [{"text": full, "finish_reason": "stop"}],
                "usage": {"prompt_tokens": 0, "completion_tokens": 0, "total_tokens": 0},
            })
        return JSONResponse({
            "id": f"chatcmpl-{uuid.uuid4().hex}", "object": "chat.completion", "created": _now(), "model": model,
            "choices": [{"index": 0, "message": {"role": "assistant", "content": full}, "finish_reason": "stop"}],
            "usage": {"prompt_tokens": 0, "completion_tokens": 0, "total_tokens": 0},
        })

    async def gen():
        cid = f"chatcmpl-{uuid.uuid4().hex}" if mode == "chat" else f"cmpl-{uuid.uuid4().hex}"
        errored = False
        async for ev in stream_provider_events(url, headers, payload, cfg, model):
            if ev.get("error"):
                errored = True
                yield f"data: {json.dumps({'error': {'message': ev['error'], 'type': 'upstream_error'}})}\n\n"
                return
            content = (ev.get("message") or {}).get("content", "")
            if content:
                if mode == "text":
                    yield f"data: {json.dumps({'id': cid, 'object': 'text_completion.chunk', 'created': _now(), 'model': model, 'choices': [{'text': content, 'finish_reason': None}]})}\n\n"
                else:
                    yield f"data: {json.dumps({'id': cid, 'object': 'chat.completion.chunk', 'created': _now(), 'model': model, 'choices': [{'index': 0, 'delta': {'role': 'assistant', 'content': content}, 'finish_reason': None}]})}\n\n"
        if not errored:
            if mode == "text":
                yield f"data: {json.dumps({'id': cid, 'object': 'text_completion.chunk', 'created': _now(), 'model': model, 'choices': [{'text': '', 'finish_reason': 'stop'}]})}\n\n"
            else:
                yield f"data: {json.dumps({'id': cid, 'object': 'chat.completion.chunk', 'created': _now(), 'model': model, 'choices': [{'index': 0, 'delta': {}, 'finish_reason': 'stop'}]})}\n\n"
            yield "data: [DONE]\n\n"

    return StreamingResponse(gen(), media_type="text/event-stream")


async def _openai_reply_mem(url, headers, payload, cfg, model, stream, mode="chat"):
    if not stream:
        resp = await _openai_reply(url, headers, payload, cfg, model, stream=False, mode=mode)
        if MEMORY_ENABLED and isinstance(resp, JSONResponse) and resp.status_code == 200:
            try:
                d = json.loads(resp.body.decode())
                content = ""
                if mode == "text":
                    content = d.get("choices", [{}])[0].get("text", "")
                else:
                    content = d.get("choices", [{}])[0].get("message", {}).get("content", "")
                if content:
                    MEMORY.add("assistant", content, model=model, provider=cfg.get("type", ""))
            except Exception:
                pass
        return resp

    async def gen():
        full_text = ""
        errored = False
        async for ev in stream_provider_events(url, headers, payload, cfg, model):
            if ev.get("error"):
                errored = True
                yield f"data: {json.dumps({'error': {'message': ev['error'], 'type': 'upstream_error'}})}\n\n"
                return
            content = (ev.get("message") or {}).get("content", "")
            if content:
                full_text += content
                cid = f"cmpl-{uuid.uuid4().hex}" if mode == "text" else f"chatcmpl-{uuid.uuid4().hex}"
                if mode == "text":
                    yield f"data: {json.dumps({'id': cid, 'object': 'text_completion.chunk', 'created': _now(), 'model': model, 'choices': [{'text': content, 'finish_reason': None}]})}\n\n"
                else:
                    yield f"data: {json.dumps({'id': cid, 'object': 'chat.completion.chunk', 'created': _now(), 'model': model, 'choices': [{'index': 0, 'delta': {'role': 'assistant', 'content': content}, 'finish_reason': None}]})}\n\n"
        if not errored:
            cid = f"chatcmpl-{uuid.uuid4().hex}" if mode == "chat" else f"cmpl-{uuid.uuid4().hex}"
            if mode == "text":
                yield f"data: {json.dumps({'id': cid, 'object': 'text_completion.chunk', 'created': _now(), 'model': model, 'choices': [{'text': '', 'finish_reason': 'stop'}]})}\n\n"
            else:
                yield f"data: {json.dumps({'id': cid, 'object': 'chat.completion.chunk', 'created': _now(), 'model': model, 'choices': [{'index': 0, 'delta': {}, 'finish_reason': 'stop'}]})}\n\n"
            yield "data: [DONE]\n\n"
        if MEMORY_ENABLED and full_text:
            MEMORY.add("assistant", full_text, model=model, provider=cfg.get("type", ""))

    return StreamingResponse(gen(), media_type="text/event-stream")


async def _anthropic_reply(url, headers, payload, cfg, model, stream):
    if not stream:
        full = ""
        err = None
        async for ev in stream_provider_events(url, headers, payload, cfg, model):
            if ev.get("error"):
                err = ev["error"]
            full += (ev.get("message") or {}).get("content", "")
        if err:
            return JSONResponse({"type": "error", "error": {"type": "upstream_error", "message": err}}, status_code=502)
        return JSONResponse({
            "id": f"msg_{uuid.uuid4().hex}", "type": "message", "role": "assistant", "model": model,
            "content": [{"type": "text", "text": full}], "stop_reason": "end_turn", "stop_sequence": None,
            "usage": {"input_tokens": 0, "output_tokens": 0},
        })

    async def gen():
        mid = f"msg_{uuid.uuid4().hex}"
        yield "event: message_start\ndata: " + json.dumps({
            "type": "message_start", "message": {"id": mid, "type": "message", "role": "assistant", "model": model, "content": [], "stop_reason": None, "stop_sequence": None, "usage": {"input_tokens": 0, "output_tokens": 0}},
        }) + "\n\n"
        yield "event: content_block_start\ndata: " + json.dumps({
            "type": "content_block_start", "index": 0, "content_block": {"type": "text", "text": ""},
        }) + "\n\n"
        errored = False
        any_content = False
        async for ev in stream_provider_events(url, headers, payload, cfg, model):
            if ev.get("error"):
                errored = True
                err_raw = ev["error"]
                try:
                    err_data = json.loads(err_raw) if err_raw.startswith("{") else None
                    err_text = err_data["error"].get("message", str(err_data["error"])) if err_data and "error" in err_data else err_raw[:200]
                except Exception:
                    err_text = err_raw[:200]
                yield "event: content_block_delta\ndata: " + json.dumps({
                    "type": "content_block_delta", "index": 0, "delta": {"type": "text_delta", "text": f"[Upstream Error: {err_text}]"},
                }) + "\n\n"
                any_content = True
                break
            content = (ev.get("message") or {}).get("content", "")
            if content:
                any_content = True
                yield "event: content_block_delta\ndata: " + json.dumps({
                    "type": "content_block_delta", "index": 0, "delta": {"type": "text_delta", "text": content},
                }) + "\n\n"
        if not errored and not any_content:
            yield "event: content_block_delta\ndata: " + json.dumps({
                "type": "content_block_delta", "index": 0, "delta": {"type": "text_delta", "text": "[Emulator Error: Upstream returned no content. Check API key and provider settings.]"},
            }) + "\n\n"
        yield "event: content_block_stop\ndata: " + json.dumps({"type": "content_block_stop", "index": 0}) + "\n\n"
        yield "event: message_delta\ndata: " + json.dumps({
            "type": "message_delta", "delta": {"stop_reason": "end_turn", "stop_sequence": None}, "usage": {"output_tokens": 0},
        }) + "\n\n"
        yield "event: message_stop\ndata: " + json.dumps({"type": "message_stop"}) + "\n\n"

    return StreamingResponse(gen(), media_type="text/event-stream")


async def _anthropic_reply_mem(url, headers, payload, cfg, model, stream):
    if not stream:
        resp = await _anthropic_reply(url, headers, payload, cfg, model, stream=False)
        if MEMORY_ENABLED and isinstance(resp, JSONResponse) and resp.status_code == 200:
            try:
                d = json.loads(resp.body.decode())
                text = "".join(b.get("text", "") for b in d.get("content", []) if b.get("type") == "text")
                if text:
                    MEMORY.add("assistant", text, model=model, provider=cfg.get("type", ""))
            except Exception:
                pass
        return resp

    async def gen():
        mid = f"msg_{uuid.uuid4().hex}"
        yield "event: message_start\ndata: " + json.dumps({
            "type": "message_start", "message": {"id": mid, "type": "message", "role": "assistant", "model": model, "content": [], "stop_reason": None, "stop_sequence": None, "usage": {"input_tokens": 0, "output_tokens": 0}},
        }) + "\n\n"
        yield "event: content_block_start\ndata: " + json.dumps({
            "type": "content_block_start", "index": 0, "content_block": {"type": "text", "text": ""},
        }) + "\n\n"
        errored = False
        any_content = False
        full_text = ""
        async for ev in stream_provider_events(url, headers, payload, cfg, model):
            if ev.get("error"):
                errored = True
                err_raw = ev["error"]
                try:
                    err_data = json.loads(err_raw) if err_raw.startswith("{") else None
                    err_text = err_data["error"].get("message", str(err_data["error"])) if err_data and "error" in err_data else err_raw[:200]
                except Exception:
                    err_text = err_raw[:200]
                yield "event: content_block_delta\ndata: " + json.dumps({
                    "type": "content_block_delta", "index": 0, "delta": {"type": "text_delta", "text": f"[Upstream Error: {err_text}]"},
                }) + "\n\n"
                any_content = True
                break
            content = (ev.get("message") or {}).get("content", "")
            if content:
                any_content = True
                full_text += content
                yield "event: content_block_delta\ndata: " + json.dumps({
                    "type": "content_block_delta", "index": 0, "delta": {"type": "text_delta", "text": content},
                }) + "\n\n"
        if not errored and not any_content:
            yield "event: content_block_delta\ndata: " + json.dumps({
                "type": "content_block_delta", "index": 0, "delta": {"type": "text_delta", "text": "[Emulator Error: Upstream returned no content. Check API key and provider settings.]"},
            }) + "\n\n"
        yield "event: content_block_stop\ndata: " + json.dumps({"type": "content_block_stop", "index": 0}) + "\n\n"
        yield "event: message_delta\ndata: " + json.dumps({
            "type": "message_delta", "delta": {"stop_reason": "end_turn", "stop_sequence": None}, "usage": {"output_tokens": 0},
        }) + "\n\n"
        yield "event: message_stop\ndata: " + json.dumps({"type": "message_stop"}) + "\n\n"
        if MEMORY_ENABLED and full_text:
            MEMORY.add("assistant", full_text, model=model, provider=cfg.get("type", ""))

    return StreamingResponse(gen(), media_type="text/event-stream")


class _FakeRequest:
    def __init__(self, data):
        self._data = data

    async def json(self):
        return self._data


# ============================================================
# STATIC FILE SERVING (Next.js frontend)
# ============================================================

SPA_ROUTES = {"", "settings", "playground", "rag", "memory", "login", "usage"}


@app.get("/api/version")
async def api_version():
    return {"version": VERSION}


@app.get("/api/db/schema")
async def api_db_schema():
    """Return schema version and sync status for frontend verification."""
    return {
        "version": VERSION,
        "schema": _db.check_schema_sync(),
        "database": {"connected": _db.is_connected()},
    }


@app.get("/api/status")
async def api_status():
    with state_lock:
        provider = ACTIVE_PROVIDER
        has_key = bool(API_KEYS.get(provider))
        model_count = len(MODEL_CACHE)
    return {
        "active_provider": provider,
        "api_key_set": has_key,
        "model_count": model_count,
        **device_summary(),
    }


@app.get("/api/device")
async def api_device():
    d = get_device()
    return {
        "device_id": d.get("device_id", ""),
        "user": d.get("user", "unknown"),
        "created_at": d.get("created_at", ""),
        "timezone": now_local().tzname() or "UTC",
        "server_local_time": local_now_iso(),
        "key_hint": (d.get("key", "")[:6] + "â€¦") if d.get("key") else "",
    }


@app.get("/api/providers")
async def get_providers():
    return PROVIDER_CONFIGS


@app.post("/api/config")
async def save_config(body: ConfigRequest):
    global ACTIVE_PROVIDER
    log.info("POST /api/config provider=%s key_len=%d", body.provider, len(body.api_key))
    with state_lock:
        API_KEYS[body.provider] = body.api_key
        ACTIVE_PROVIDER = body.provider
    if body.provider in PROVIDER_CONFIGS:
        save_provider_db(body.provider, PROVIDER_CONFIGS[body.provider], body.api_key)
    return {"status": "saved"}


@app.post("/api/auth/auto-detect")
async def auto_detect_api_key(body: dict):
    """Auto-detect provider from API key and configure it."""
    api_key = body.get("api_key", "").strip()
    if not api_key:
        return JSONResponse({"error": "No API key provided"}, status_code=400)

    detected_provider = None
    test_results = {}

    # Test each provider's API with the key
    for pname, cfg in PROVIDER_CONFIGS.items():
        if not cfg.get("models_url"):
            continue
        try:
            url = cfg["models_url"].replace("{key}", api_key) if "{key}" in cfg["models_url"] else cfg["models_url"]
            headers = get_headers(pname, api_key)
            async with httpx.AsyncClient() as client:
                resp = await client.get(url, headers=headers, timeout=8.0)
                if resp.status_code == 200:
                    data = resp.json()
                    models = data.get("data", data.get("models", []))
                    if models:
                        detected_provider = pname
                        test_results[pname] = {"status": "ok", "models_count": len(models)}
                        break
                else:
                    test_results[pname] = {"status": "failed", "code": resp.status_code}
        except Exception as e:
            test_results[pname] = {"status": "error", "error": str(e)[:100]}

    if detected_provider:
        with state_lock:
            API_KEYS[detected_provider] = api_key
            ACTIVE_PROVIDER = detected_provider
        save_provider_db(detected_provider, PROVIDER_CONFIGS[detected_provider], api_key)
        return {
            "detected": True,
            "provider": detected_provider,
            "message": f"API key verified and configured for {detected_provider}",
        }

    return {
        "detected": False,
        "message": "Could not verify API key with any provider",
        "results": test_results,
    }


@app.get("/api/providers/list")
async def list_providers():
    with state_lock:
        return [
            {
                "name": n,
                "url": PROVIDER_CONFIGS[n]["url"],
                "type": PROVIDER_CONFIGS[n]["type"],
                "default_model": PROVIDER_CONFIGS[n]["default_model"],
                "api_key_set": bool(API_KEYS.get(n)),
                "api_key_masked": ("****" + API_KEYS[n][-4:]) if API_KEYS.get(n) else "",
            }
            for n in PROVIDER_CONFIGS
        ]


@app.post("/api/providers/add")
async def add_provider(body: ProviderAddRequest):
    if not body.name or not body.url or not body.type:
        return JSONResponse({"error": "name, url and type are required"}, status_code=400)
    validate_url(body.url, "provider URL")
    if body.models_url:
        validate_url(body.models_url, "models URL")
    cfg = {
        "url": body.url,
        "models_url": body.models_url,
        "auth_type": body.auth_type,
        "default_model": body.default_model,
        "free_heuristic": body.free_heuristic,
        "type": body.type,
    }
    with state_lock:
        PROVIDER_CONFIGS[body.name] = cfg
        if body.api_key:
            API_KEYS[body.name] = body.api_key
    save_provider_db(body.name, cfg, body.api_key)
    return {"status": "added", "name": body.name}


@app.get("/api/providers/{name}")
async def get_provider_detail(name: str):
    with state_lock:
        if name not in PROVIDER_CONFIGS:
            return JSONResponse({"error": "provider not found"}, status_code=404)
        cfg = PROVIDER_CONFIGS[name]
        return {
            "name": name,
            "url": cfg["url"],
            "models_url": cfg.get("models_url", ""),
            "auth_type": cfg["auth_type"],
            "default_model": cfg["default_model"],
            "free_heuristic": cfg["free_heuristic"],
            "type": cfg["type"],
            "api_key_set": bool(API_KEYS.get(name)),
            "api_key_masked": ("****" + API_KEYS[name][-4:]) if API_KEYS.get(name) else "",
        }


@app.put("/api/providers/{name}")
async def update_provider_endpoint(name: str, body: ProviderUpdateRequest):
    global ACTIVE_PROVIDER
    with state_lock:
        if name not in PROVIDER_CONFIGS:
            return JSONResponse({"error": "provider not found"}, status_code=404)
        cfg = PROVIDER_CONFIGS[name]
        if body.url is not None:
            validate_url(body.url, "Provider URL")
            cfg["url"] = body.url
        if body.models_url is not None:
            validate_url(body.models_url, "Models URL")
            cfg["models_url"] = body.models_url
        if body.auth_type is not None:
            cfg["auth_type"] = body.auth_type
        if body.default_model is not None:
            cfg["default_model"] = body.default_model
        if body.free_heuristic is not None:
            cfg["free_heuristic"] = body.free_heuristic
        if body.type is not None:
            cfg["type"] = body.type
        if body.api_key is not None:
            if body.api_key:
                API_KEYS[name] = body.api_key
            else:
                API_KEYS.pop(name, None)
        if body.active is not None and body.active:
            ACTIVE_PROVIDER = name
    update_data = body.model_dump(exclude_unset=True)
    _db.update_provider(name, update_data)
    return {"status": "updated", "name": name}


@app.delete("/api/providers/{name}")
async def del_provider(name: str):
    global ACTIVE_PROVIDER
    with state_lock:
        if name not in PROVIDER_CONFIGS:
            return JSONResponse({"error": "provider not found"}, status_code=404)
        PROVIDER_CONFIGS.pop(name, None)
        API_KEYS.pop(name, None)
        if ACTIVE_PROVIDER == name:
            ACTIVE_PROVIDER = next(iter(PROVIDER_CONFIGS), "")
    delete_provider_db(name)
    return {"status": "deleted", "name": name}


@app.post("/api/providers/activate")
async def activate_provider(body: ProviderActivateRequest):
    global ACTIVE_PROVIDER
    with state_lock:
        if body.name not in PROVIDER_CONFIGS:
            return JSONResponse({"error": "provider not found"}, status_code=404)
        ACTIVE_PROVIDER = body.name
    return {"status": "activated", "active_provider": ACTIVE_PROVIDER}


@app.get("/api/models")
async def get_models():
    global MODEL_CACHE
    with state_lock:
        provider = ACTIVE_PROVIDER
        api_key = API_KEYS.get(provider, "")
    cfg = PROVIDER_CONFIGS.get(provider, {})
    catalog = MODEL_CATALOG.get(provider, [])

    if not api_key:
        if catalog:
            with state_lock:
                MODEL_CACHE = [{"name": m["name"], "free": m["free"]} for m in catalog]
            return {"models": MODEL_CACHE[:]}
        return {"models": []}

    if not cfg.get("models_url"):
        return {"models": [{"name": cfg["default_model"], "free": cfg["free_heuristic"]}]}
    try:
        url = cfg["models_url"].replace("{key}", api_key) if "{key}" in cfg["models_url"] else cfg["models_url"]
        headers = get_headers(provider, api_key)
        async with httpx.AsyncClient() as client:
            resp = await client.get(url, headers=headers, timeout=10.0)
            data = resp.json()
            models = []
            for m in data.get("data", data.get("models", [])):
                mid = m.get("id", m.get("name", ""))
                pricing = m.get("pricing", {})
                if not isinstance(pricing, dict):
                    pricing = {}
                is_free = bool(cfg["free_heuristic"]) if cfg["free_heuristic"] != "api" else pricing.get("prompt", "1") == "0"
                if "free" in mid.lower():
                    is_free = True
                models.append({"name": mid, "free": is_free})
            with state_lock:
                MODEL_CACHE = models
        return {"models": models}
    except Exception as e:
        if catalog:
            with state_lock:
                MODEL_CACHE = [{"name": m["name"], "free": m["free"]} for m in catalog]
            return {"models": MODEL_CACHE[:]}
        return {"models": [], "error": str(e)}


@app.get("/api/models/all")
async def get_all_models():
    """Fetch models from ALL configured providers. Uses catalog as fallback."""
    results = []
    seen = set()
    with state_lock:
        providers = dict(PROVIDER_CONFIGS)
        keys = dict(API_KEYS)
        active = ACTIVE_PROVIDER

    for pname, cfg in providers.items():
        api_key = keys.get(pname, "")
        catalog = MODEL_CATALOG.get(pname, [])

        if not api_key and not cfg.get("free_heuristic") and not catalog:
            continue

        live_models = []
        if cfg.get("models_url") and (api_key or cfg.get("free_heuristic")):
            try:
                url = cfg["models_url"].replace("{key}", api_key) if "{key}" in cfg["models_url"] else cfg["models_url"]
                headers = get_headers(pname, api_key)
                async with httpx.AsyncClient() as client:
                    resp = await client.get(url, headers=headers, timeout=10.0)
                    data = resp.json()
                    for m in data.get("data", data.get("models", [])):
                        mid = m.get("id", m.get("name", ""))
                        pricing = m.get("pricing", {})
                        if not isinstance(pricing, dict):
                            pricing = {}
                        is_free = bool(cfg["free_heuristic"]) if cfg["free_heuristic"] != "api" else pricing.get("prompt", "1") == "0"
                        if "free" in mid.lower():
                            is_free = True
                        live_models.append({"name": mid, "free": is_free})
            except Exception:
                pass

        if live_models:
            for m in live_models:
                key = f"{pname}:{m['name']}"
                if key not in seen:
                    seen.add(key)
                    results.append({
                        "name": m["name"],
                        "free": m["free"],
                        "provider": pname,
                        "type": cfg["type"],
                    })
        elif catalog:
            for m in catalog:
                key = f"{pname}:{m['name']}"
                if key not in seen:
                    seen.add(key)
                    results.append({
                        "name": m["name"],
                        "free": m["free"],
                        "provider": pname,
                        "type": cfg["type"],
                    })
        elif cfg.get("models_url") is None:
            results.append({
                "name": cfg["default_model"],
                "free": bool(cfg["free_heuristic"]),
                "provider": pname,
                "type": cfg["type"],
            })

    return {"models": results, "active_provider": active}# ============================================================
# OLLAMA-NATIVE COMPATIBLE ENDPOINTS
# ============================================================

@app.get("/api/tags")
async def ollama_tags():
    with state_lock:
        models = MODEL_CACHE[:]
    return {"models": [{"name": m["name"], "model": m["name"], "modified_at": datetime.datetime.now().isoformat(), "size": 0} for m in models]}


@app.get("/api/show")
async def ollama_show(request: Request):
    # Get model name from query parameter, default to None
    model_name = request.query_params.get("name")
    
    with state_lock:
        provider = ACTIVE_PROVIDER
        api_key = API_KEYS.get(provider, "")
    
    if not api_key:
        # Return minimal info if no API key
        model_to_show = model_name or "unknown"
        return {
            "name": model_to_show,
            "model": model_to_show,
            "modified_at": datetime.datetime.now().isoformat(),
            "size": 0,
            "digest": "unknown",
            "details": {
                "parent_model": "",
                "format": "",
                "family": "",
                "families": None,
                "parameter_size": "",
                "quantization_level": ""
            }
        }
    
    # Determine which model to show information for
    cfg = PROVIDER_CONFIGS[provider]
    if not model_name or model_name in ("", None):
        # Use the resolved model (similar to other endpoints)
        model_to_show = _resolve_model(provider, "")
    else:
        model_to_show = model_name
    
    # Return model information
    # Note: Since we don't have access to actual model files, we return
    # plausible defaults based on the model/provider
    return {
        "name": model_to_show,
        "model": model_to_show,
        "modified_at": datetime.datetime.now().isoformat(),
        "size": 0,  # Unknown in emulator context
        "digest": "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",  # Empty file hash
        "details": {
            "parent_model": "",
            "format": "",
            "family": get_model_family(model_to_show),
            "families": None,
            "parameter_size": get_parameter_size(model_to_show),
            "quantization_level": get_quantization_level(model_to_show)
        }
    }


@app.post("/api/chat")
async def ollama_chat(request: Request):
    body = await request.json()
    with state_lock:
        provider = ACTIVE_PROVIDER
        api_key = API_KEYS.get(provider, "")
    if not api_key:
        return JSONResponse({"error": "No API key set."}, status_code=401)
    cfg = PROVIDER_CONFIGS[provider]
    model = _resolve_model(provider, body.get("model", cfg["default_model"]))
    user_msg = ""
    for m in reversed(body.get("messages", [])):
        if m.get("role") == "user":
            user_msg = m.get("content", "")
            break
    if user_msg and MEMORY_ENABLED:
        MEMORY.add("user", user_msg, model=model, provider=provider)
    if body.get("messages"):
        body["messages"] = _inject_rag_context(body["messages"])
    headers = get_headers(provider, api_key)
    if cfg["type"] == "openai":
        gen = _mem_wrap(events_openai(cfg["url"], headers, build_openai_payload(body, model), model), model=model, provider=provider)
        return StreamingResponse(_ollama_stream(gen), media_type="application/x-ndjson")
    elif cfg["type"] == "anthropic":
        gen = _mem_wrap(events_anthropic(cfg["url"], headers, build_anthropic_payload(body, model), model), model=model, provider=provider)
        return StreamingResponse(_ollama_stream(gen), media_type="application/x-ndjson")
    elif cfg["type"] == "gemini":
        url = cfg["url"].replace("{model}", model).replace("{key}", api_key)
        gen = _mem_wrap(events_gemini(url, build_gemini_payload(body, model), model), model=model, provider=provider)
        return StreamingResponse(_ollama_stream(gen), media_type="application/x-ndjson")
    return JSONResponse({"error": "Unsupported provider type"}, status_code=400)


@app.post("/api/generate")
async def ollama_generate(request: Request):
    body = await request.json()
    chat_body = {"model": body.get("model"), "messages": [{"role": "user", "content": body.get("prompt", "")}], "stream": body.get("stream", True)}
    return await ollama_chat(request=_FakeRequest(chat_body))


@app.post("/api/pull")
async def api_pull():
    return {"status": "success"}


@app.post("/api/push")
async def api_push():
    return {"status": "success"}


@app.post("/api/delete")
async def api_delete():
    return {"status": "success"}


@app.post("/api/create")
async def api_create():
    return {"status": "success"}


@app.post("/api/copy")
async def api_copy():
    return {"status": "success"}


@app.get("/api/ps")
async def api_ps():
    with state_lock:
        models = MODEL_CACHE[:]
    return {"models": [{"name": m["name"], "model": m["name"], "size": 0, "processor": "cpu", "until": None} for m in models]}


# ============================================================
# OPENAI / ANTHROPIC COMPATIBLE PROXY LAYER
# ============================================================

@app.get("/v1/models")
async def v1_models(request: Request):
    with state_lock:
        models = MODEL_CACHE[:]
    if request.headers.get("anthropic-version") or request.headers.get("x-api-key"):
        return {"data": [{"id": m["name"], "type": "model", "created": _now()} for m in models], "has_more": False}
    return {"object": "list", "data": [{"id": m["name"], "object": "model", "created": _now(), "owned_by": "ollama-emu"} for m in models]}


@app.post("/v1/chat/completions")
async def v1_chat_completions(request: Request):
    body = await request.json()
    log.debug("POST /v1/chat/completions model=%s stream=%s", body.get("model"), body.get("stream"))
    with state_lock:
        provider = ACTIVE_PROVIDER
        api_key = API_KEYS.get(provider, "")
    if not api_key:
        return JSONResponse({"error": {"message": "No API key set. Go to Settings.", "type": "auth_error"}}, status_code=401)
    cfg, url, headers = _resolve_target(provider, api_key, _resolve_model(provider, body.get("model", "")))
    model = _resolve_model(provider, body.get("model", cfg["default_model"]))
    messages = body.get("messages", [])
    if MEMORY_ENABLED:
        for m in messages:
            if m.get("role") == "user":
                MEMORY.add("user", m.get("content", ""), model=model, provider=provider)
                break
    messages = _inject_rag_context(messages)
    payload = _build_provider_payload(messages, model, cfg["type"], extra={"max_tokens": body.get("max_tokens"), "temperature": body.get("temperature")})
    return await _openai_reply_mem(url, headers, payload, cfg, model, body.get("stream", True), mode="chat")


@app.post("/v1/completions")
async def v1_completions(request: Request):
    body = await request.json()
    with state_lock:
        provider = ACTIVE_PROVIDER
        api_key = API_KEYS.get(provider, "")
    if not api_key:
        return JSONResponse({"error": {"message": "No API key set. Go to Settings.", "type": "auth_error"}}, status_code=401)
    cfg, url, headers = _resolve_target(provider, api_key, _resolve_model(provider, body.get("model", "")))
    model = _resolve_model(provider, body.get("model", cfg["default_model"]))
    prompt = body.get("prompt", "")
    if isinstance(prompt, list):
        prompt = "\n".join(prompt)
    payload = _build_provider_payload([{"role": "user", "content": prompt}], model, cfg["type"], extra={"max_tokens": body.get("max_tokens"), "temperature": body.get("temperature")})
    return await _openai_reply(url, headers, payload, cfg, model, body.get("stream", True), mode="text")


@app.post("/v1/messages")
async def v1_messages(request: Request):
    body = await request.json()
    raw_model = body.get("model", "")
    log.debug("POST /v1/messages model=%s stream=%s", raw_model, body.get("stream"))
    with state_lock:
        provider = ACTIVE_PROVIDER
        api_key = API_KEYS.get(provider, "")
    if not api_key:
        return JSONResponse({"type": "error", "error": {"type": "authentication_error", "message": "No API key set. Go to Settings."}}, status_code=401)
    resolved_model = _resolve_model(provider, raw_model)
    cfg, url, headers = _resolve_target(provider, api_key, resolved_model)
    messages = _anthropic_incoming_to_messages(body)
    if MEMORY_ENABLED:
        for m in messages:
            if m.get("role") == "user":
                MEMORY.add("user", m.get("content", ""), model=resolved_model, provider=provider)
                break
    messages = _inject_rag_context(messages)
    payload = _build_provider_payload(messages, resolved_model, cfg["type"], extra={"max_tokens": body.get("max_tokens"), "temperature": body.get("temperature")})
    return await _anthropic_reply_mem(url, headers, payload, cfg, resolved_model, body.get("stream", True))


# ============================================================
# RAG API ENDPOINTS
# ============================================================

@app.get("/api/rag/stats")
async def rag_stats():
    stats = RAG.stats()
    from ollama_emu.rag import vector_stats
    stats["vector"] = vector_stats()
    return stats


@app.get("/api/rag/documents")
async def rag_documents(collection: str = None):
    return RAG.list_documents(collection)


@app.get("/api/rag/collections")
async def rag_collections():
    return RAG.list_collections()


@app.post("/api/rag/upload")
async def rag_upload(file: UploadFile = File(...), collection: str = Form("default")):
    if not file.filename:
        return JSONResponse({"error": "No file provided"}, status_code=400)
    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        return JSONResponse({"error": f"File too large (max {MAX_FILE_SIZE // (1024*1024)}MB)"}, status_code=400)
    safe_name = sanitize_filename(file.filename)
    tmp_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "_rag_tmp")
    os.makedirs(tmp_dir, exist_ok=True)
    tmp_path = os.path.join(tmp_dir, f"{secrets.token_hex(8)}_{safe_name}")
    try:
        with open(tmp_path, "wb") as f:
            f.write(content)
        result = RAG.add_document(tmp_path, collection=collection, metadata={"original_name": safe_name, "size": len(content)})
    finally:
        try:
            if os.path.isfile(tmp_path):
                os.remove(tmp_path)
        except OSError:
            pass
    return result


@app.post("/api/rag/add-text")
async def rag_add_text(body: RagAddTextRequest):
    if not body.text.strip():
        return JSONResponse({"error": "text is required"}, status_code=400)
    return RAG.add_text(body.text, name=body.name, collection=body.collection)


@app.post("/api/rag/search")
async def rag_search(body: RagSearchRequest):
    if not body.query.strip():
        return JSONResponse({"error": "query is required"}, status_code=400)
    return RAG.search(body.query, top_k=body.top_k, collection=body.collection, hybrid=True)


@app.post("/api/rag/search/vector")
async def rag_search_vector(body: RagSearchRequest):
    if not body.query.strip():
        return JSONResponse({"error": "query is required"}, status_code=400)
    return RAG.search_vector(body.query, top_k=body.top_k, collection=body.collection)


@app.post("/api/rag/search/fts")
async def rag_search_fts(body: RagSearchRequest):
    if not body.query.strip():
        return JSONResponse({"error": "query is required"}, status_code=400)
    return RAG.search_fts(body.query, top_k=body.top_k, collection=body.collection)


@app.get("/api/rag/context")
async def rag_context(query: str, max_tokens: int = 3000, collection: str = None, hybrid: bool = True):
    ctx = RAG.build_context(query, max_tokens=max_tokens, collection=collection, hybrid=hybrid)
    return {"context": ctx, "has_context": bool(ctx)}


@app.delete("/api/rag/documents/{doc_id}")
async def rag_delete_document(doc_id: str):
    return RAG.delete_document(doc_id)


@app.post("/api/rag/reindex/{doc_id}")
async def rag_reindex(doc_id: str):
    return RAG.reindex_document(doc_id)


@app.post("/api/rag/clear")
async def rag_clear(body: RagClearRequest = None):
    collection = body.collection if body else None
    return RAG.clear(collection)


@app.get("/api/rag/vector-stats")
async def rag_vector_stats():
    from ollama_emu.rag import vector_stats
    return vector_stats()


@app.post("/api/rag/rebuild-index")
async def rag_rebuild_index():
    from ollama_emu.rag import drop_embedding_index, create_embedding_index
    drop_embedding_index()
    create_embedding_index()
    return {"success": True, "message": "Vector index rebuilt"}


@app.post("/api/rag/context-inject")
async def rag_context_inject(body: RagContextInjectRequest):
    messages = body.messages
    last_user_msg = ""
    for m in reversed(messages):
        if m.get("role") == "user":
            last_user_msg = m.get("content", "")
            break
    if not last_user_msg:
        return {"messages": messages, "rag_applied": False}
    context = RAG.build_context(last_user_msg, max_tokens=body.max_tokens, collection=body.collection)
    if not context:
        return {"messages": messages, "rag_applied": False}
    enhanced_messages = []
    system_injected = False
    for m in messages:
        if m.get("role") == "system" and not system_injected:
            enhanced_messages.append({"role": "system", "content": m["content"] + "\n\n" + context})
            system_injected = True
        elif m.get("role") == "user" and not system_injected:
            enhanced_messages.append({"role": "system", "content": context})
            enhanced_messages.append(m)
            system_injected = True
        else:
            enhanced_messages.append(m)
    if not system_injected:
        enhanced_messages.insert(0, {"role": "system", "content": context})
    return {"messages": enhanced_messages, "rag_applied": True, "context_length": len(context)}


# ============================================================
# MEMORY API ENDPOINTS
# ============================================================

@app.get("/api/memory/stats")
async def memory_stats():
    return MEMORY.stats()


@app.get("/api/memory/messages")
async def memory_messages(session_id: str = None, limit: int = 100, offset: int = 0):
    return MEMORY.get_messages(session_id=session_id, limit=limit, offset=offset)


@app.post("/api/memory/search")
async def memory_search(body: MemorySearchRequest):
    if not body.query.strip():
        return JSONResponse({"error": "query is required"}, status_code=400)
    return MEMORY.search(body.query, limit=body.limit, session_id=body.session_id)


@app.get("/api/memory/sessions")
async def memory_sessions():
    return MEMORY.get_sessions()


@app.post("/api/memory/facts")
async def memory_add_fact(body: MemoryFactRequest):
    if not body.fact.strip():
        return JSONResponse({"error": "fact is required"}, status_code=400)
    fid = MEMORY.add_fact(body.fact, source=body.source, importance=body.importance, session_id=body.session_id)
    return {"id": fid, "status": "added"}


@app.get("/api/memory/facts")
async def memory_list_facts(session_id: str = None, limit: int = 50):
    return MEMORY.get_facts(session_id=session_id, limit=limit)


@app.delete("/api/memory/facts/{fact_id}")
async def memory_delete_fact(fact_id: str):
    deleted = MEMORY.delete_fact(fact_id)
    if not deleted:
        return JSONResponse({"error": "fact not found"}, status_code=404)
    return {"deleted": fact_id}


@app.post("/api/memory/clear")
async def memory_clear(body: MemoryClearRequest = None):
    session_id = body.session_id if body else None
    MEMORY.clear(session_id)
    return {"cleared": True, "session": session_id or "all"}


@app.get("/api/memory/context")
async def memory_context(query: str = "", max_tokens: int = 2000, session_id: str = None):
    ctx = MEMORY.build_context(query=query, max_tokens=max_tokens, session_id=session_id)
    return {"context": ctx, "has_context": bool(ctx)}


@app.get("/api/memory/messages/{msg_id}")
async def memory_get_message(msg_id: str):
    msg = _db.get_memory_message(msg_id)
    if not msg:
        raise HTTPException(status_code=404, detail="Message not found")
    return msg


@app.delete("/api/memory/messages/{msg_id}")
async def memory_delete_message(msg_id: str):
    if not _db.delete_memory_message(msg_id):
        raise HTTPException(status_code=404, detail="Message not found")
    return {"status": "deleted", "id": msg_id}


@app.delete("/api/memory/messages")
async def memory_clear_messages(body: MemoryMessageDeleteRequest = None):
    confirm = body.confirm if body else False
    if not confirm:
        raise HTTPException(status_code=400, detail="Set confirm=true to clear all messages")
    _db.clear_all_messages()
    return {"status": "cleared"}


@app.get("/api/rag/documents/{doc_id}")
async def rag_get_document(doc_id: str):
    doc = _db.get_rag_document(doc_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return doc


@app.get("/api/rag/chunks/{doc_id}")
async def rag_list_chunks(doc_id: str):
    return _db.list_rag_chunks(doc_id)


@app.put("/api/rag/chunks/{chunk_id}")
async def rag_update_chunk(chunk_id: str, body: RagChunkUpdateRequest):
    if not body.content.strip():
        raise HTTPException(status_code=400, detail="Content is required")
    if not _db.update_rag_chunk(chunk_id, body.content):
        raise HTTPException(status_code=404, detail="Chunk not found")
    try:
        from ollama_emu.rag import RAG
        RAG.reembed_chunk(chunk_id, body.content)
    except Exception as e:
        log.warning("Re-embedding failed for chunk %s: %s", chunk_id, e)
    return {"status": "updated", "id": chunk_id}


# ============================================================
# USAGE & AUTH API
# ============================================================

@app.post("/api/usage/clear")
async def clear_usage():
    global USAGE_LOG
    USAGE_LOG = []
    return {"status": "cleared"}


@app.get("/api/usage/stats")
async def get_usage_stats():
    with USAGE_LOCK:
        total_requests = len(USAGE_LOG)
        total_tokens = sum(e["total_tokens"] for e in USAGE_LOG)
        successes = sum(1 for e in USAGE_LOG if e["success"])
        by_model: Dict[str, Dict] = {}
        hourly = [0] * 24
        for e in USAGE_LOG:
            m = e["model"]
            if m not in by_model:
                by_model[m] = {"requests": 0, "successes": 0, "prompt_tokens": 0, "completion_tokens": 0, "total_tokens": 0, "latency_sum": 0}
            by_model[m]["requests"] += 1
            if e["success"]:
                by_model[m]["successes"] += 1
            by_model[m]["prompt_tokens"] += e["prompt_tokens"]
            by_model[m]["completion_tokens"] += e["completion_tokens"]
            by_model[m]["total_tokens"] += e["total_tokens"]
            by_model[m]["latency_sum"] += e["latency_ms"]
            try:
                h = datetime.datetime.fromisoformat(e["timestamp"].rstrip("Z")).hour
                hourly[h] += 1
            except ValueError:
                pass
        for m in by_model:
            c = by_model[m]
            c["avg_latency"] = round(c["latency_sum"] / c["requests"]) if c["requests"] > 0 else 0
            del c["latency_sum"]
        resonance = round((successes / total_requests * 100), 1) if total_requests > 0 else 100.0
        return {
            "total_requests": total_requests,
            "total_tokens": total_tokens,
            "successes": successes,
            "resonance": resonance,
            "by_model": by_model,
            "hourly": hourly,
            "recent": USAGE_LOG[-50:][::-1],
        }

# ============================================================
# EXPORT / IMPORT
# ============================================================

@app.get("/api/export")
async def export_all_data():
    """Export all providers, memory, RAG documents, and chat history as JSON."""
    with state_lock:
        providers = [
            {"name": n, **{k: cfg[k] for k in ("url", "models_url", "auth_type", "default_model", "free_heuristic", "type")},
             "api_key": API_KEYS.get(n, "")}
            for n, cfg in PROVIDER_CONFIGS.items()
        ]
    facts = []
    sessions = []
    messages = []
    try:
        facts = MEMORY.get_facts()
        sessions = MEMORY.get_sessions()
        messages = MEMORY.get_messages(limit=100000)
    except Exception:
        pass
    docs = []
    try:
        for d in RAG.list_documents():
            texts = []
            try:
                chunks = _db.list_rag_chunks(d["id"])
                texts = [c.get("content", "") for c in chunks if c.get("content")]
            except Exception:
                pass
            doc = {k: d[k] for k in ("id", "filename", "collection", "metadata") if k in d}
            doc["texts"] = texts
            docs.append(doc)
    except Exception:
        pass
    return {
        "version": VERSION,
        "exported_at": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "providers": providers,
        "memory_facts": facts,
        "memory_sessions": sessions,
        "memory_messages": messages,
        "rag_documents": docs,
    }


@app.post("/api/import")
async def import_all_data(data: dict):
    """Import providers, memory, RAG documents, and chat history."""
    imported = {"providers": 0, "facts": 0, "messages": 0, "documents": 0}
    with state_lock:
        for prov in data.get("providers", []):
            name = prov.get("name", "")
            if not name:
                continue
            cfg = {k: prov.get(k) for k in ("url", "models_url", "auth_type", "default_model", "free_heuristic", "type")}
            cfg = {k: v for k, v in cfg.items() if v is not None}
            PROVIDER_CONFIGS[name] = cfg
            if prov.get("api_key"):
                API_KEYS[name] = prov["api_key"]
            save_provider_db(name, cfg, prov.get("api_key", ""))
            imported["providers"] += 1
        for fact_data in data.get("memory_facts", []):
            fact = fact_data.get("fact", "")
            if not fact:
                continue
            try:
                MEMORY.add_fact(fact, source=fact_data.get("source", ""),
                                importance=fact_data.get("importance", "normal"),
                                session_id=fact_data.get("session_id", "default"))
                imported["facts"] += 1
            except Exception:
                pass
    for msg in data.get("memory_messages", []):
        content = msg.get("content", "")
        if not content:
            continue
        try:
            MEMORY.add(
                role=msg.get("role", "user"),
                content=content,
                model=msg.get("model", ""),
                provider=msg.get("provider", ""),
                session_id=msg.get("session_id", "default"),
                tokens=int(msg.get("tokens", 0) or 0),
            )
            imported["messages"] += 1
        except Exception:
            pass
    for doc in data.get("rag_documents", []):
        texts = doc.get("texts") or []
        full = "\n\n".join(t for t in texts if t)
        if not full:
            continue
        try:
            RAG.add_text(full, name=doc.get("filename", "imported"),
                         collection=doc.get("collection", "default"))
            imported["documents"] += 1
        except Exception:
            pass
    return {"status": "imported", **imported}


@app.get("/api/models/free")
async def free_models():
    """Return cached list of free models from OpenRouter."""
    return {"models": FREE_MODEL_CACHE}


FREE_MODEL_CACHE: list = []
FREE_MODEL_LOCK = threading.Lock()


def _refresh_free_models():
    """Background task: fetch free models from OpenRouter."""
    global FREE_MODEL_CACHE
    try:
        import httpx
        resp = httpx.get("https://openrouter.ai/api/v1/models", timeout=15.0)
        data = resp.json()
        free_models = []
        for m in data.get("data", []):
            pricing = m.get("pricing", {})
            prompt_price = float(pricing.get("prompt", "1"))
            completion_price = float(pricing.get("completion", "1"))
            if prompt_price == 0 and completion_price == 0:
                free_models.append({
                    "id": m.get("id", ""),
                    "name": m.get("name", ""),
                    "description": (m.get("description") or "")[:200],
                })
        with FREE_MODEL_LOCK:
            FREE_MODEL_CACHE = free_models
        log.info("Refreshed free models: %d free models cached", len(free_models))
    except Exception as e:
        log.warning("Failed to refresh free models: %s", e)


# ── Start background refresh ──
def _start_free_model_refresh():
    _refresh_free_models()
    def _loop():
        while True:
            import time
            time.sleep(3600)  # refresh every hour
            _refresh_free_models()
    t = threading.Thread(target=_loop, daemon=True)
    t.start()


# ============================================================
# SPA FALLBACK - serve Next.js static frontend
# ============================================================

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = exc.errors()
    detail = "; ".join(f"{'.'.join(str(p) for p in e.get('loc', []))}: {e.get('msg', '')}" for e in errors)
    log.warning("Validation error: %s", detail[:200])
    return JSONResponse({"detail": detail or "Validation error"}, status_code=422)

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    if isinstance(exc, HTTPException):
        return JSONResponse({"detail": exc.detail}, status_code=exc.status_code)
    if isinstance(exc, ValueError):
        return JSONResponse({"detail": str(exc)}, status_code=400)
    if isinstance(exc, (ConnectionError, TimeoutError)):
        return JSONResponse({"detail": "Service temporarily unavailable"}, status_code=503)
    log.error("Unhandled exception: %s", mask_error(str(exc)))
    return JSONResponse({"detail": "Internal server error"}, status_code=500)

@app.get("/{full_path:path}")
async def serve_spa(full_path: str):
    if full_path.startswith("api/") or full_path.startswith("v1/"):
        return JSONResponse({"error": "not found"}, status_code=404)

    base = os.path.join(FRONTEND_DIR, full_path)
    base_real = os.path.realpath(base)
    frontend_real = os.path.realpath(FRONTEND_DIR)
    if os.path.commonpath([base_real, frontend_real]) != frontend_real:
        return JSONResponse({"error": "not found"}, status_code=404)

    if os.path.isfile(base):
        return FileResponse(base)

    if os.path.isfile(base + ".html"):
        return FileResponse(base + ".html")

    if os.path.isdir(base):
        idx = os.path.join(base, "index.html")
        if os.path.isfile(idx):
            return FileResponse(idx)

    index_html = os.path.join(FRONTEND_DIR, "index.html")
    if os.path.isfile(index_html):
        return FileResponse(index_html)

    return JSONResponse({"error": "Frontend not built. Run: cd frontend && npm run build"}, status_code=404)


# ============================================================
# ENTRY POINT
# ============================================================

if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="OllamoMUI – Free AI Gateway")
    parser.add_argument("--host", default=os.environ.get("OLLAMA_EMU_BIND", "127.0.0.1"),
                        help="Bind host. Default 127.0.0.1 (local only). Use 0.0.0.0 to expose on the LAN (less secure).")
    parser.add_argument("--port", type=int, default=int(os.environ.get("OLLAMA_EMU_PORT", "11434")),
                        help="Bind port. Default 11434.")
    parser.add_argument("--no-browser", action="store_true", help="Do not open the browser on startup.")
    args = parser.parse_args()

    BIND_HOST = args.host
    BIND_PORT = args.port
    configure_cors(app)

    dev = ensure_device()
    log.info("[device] id=%s user=%s tz=%s", dev.get("device_id", "")[:8], dev.get("user"), now_local().tzname() or "UTC")

    env_provider = os.environ.get("OLLAMA_EMU_PROVIDER", "").strip()
    env_key = os.environ.get("OLLAMA_EMU_API_KEY", "").strip()
    if env_key:
        with state_lock:
            p = env_provider if env_provider in PROVIDER_CONFIGS else ACTIVE_PROVIDER
            API_KEYS[p] = env_key
            ACTIVE_PROVIDER = p
            log.info("[init] Loaded API key for provider '%s' from environment.", p)
    else:
        log.warning("[init] No OLLAMA_EMU_API_KEY env var. Active provider '%s' has key=%s", ACTIVE_PROVIDER, bool(API_KEYS.get(ACTIVE_PROVIDER)))

    if BIND_HOST not in ("127.0.0.1", "localhost", "::1"):
        log.warning("[security] Binding to %s â€” the server is reachable on the local network and CORS is open to all origins.", BIND_HOST)

    if not args.no_browser:
        try:
            import webbrowser
            threading.Thread(target=webbrowser.open, args=(f"http://{BIND_HOST}:{BIND_PORT}",), daemon=True).start()
        except Exception:
            pass

    log.info("[db] PostgreSQL connected via %s", _db.get_dsn().split("@")[-1] if "@" in _db.get_dsn() else "default")

    _start_free_model_refresh()

    # ── Memory monitor ──
    monitor = MemoryMonitor(
        threshold_percent=float(os.getenv("OLLAMA_EMU_MEMORY_THRESHOLD", "35.0")),
        interval_seconds=int(os.getenv("OLLAMA_EMU_MEMORY_INTERVAL", "30"))
    )
    monitor.start()

    try:
        ssl_kwargs = {}
        if SSL_KEYFILE and SSL_CERTFILE:
            ssl_kwargs["ssl_keyfile"] = SSL_KEYFILE
            ssl_kwargs["ssl_certfile"] = SSL_CERTFILE
            log.info("[ssl] HTTPS enabled (keyfile=%s, certfile=%s)", SSL_KEYFILE, SSL_CERTFILE)
        uvicorn.run(app, host=BIND_HOST, port=BIND_PORT, **ssl_kwargs)
    finally:
        MEMORY.shutdown()
        _db.close_pool()

# ── Always configure middleware on import ──
# When the backend is launched as an imported module (uvicorn/gunicorn/Render,
# e.g. `uvicorn ollama_emu.main:app`), the `if __name__ == "__main__"` block
# below never runs, so CORS + ACL middleware would otherwise never be installed.
# Configuring at import time guarantees they are always present.
configure_cors(app)


