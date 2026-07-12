"""
Access Control List (ACL), Rate Limiting & Security Policies
Copyright (c) 2024-2026 Rhasan@dev. All rights reserved.

Provides:
- Role-based access control (RBAC) with granular permissions
- Rate limiting (per-IP, per-user, per-endpoint)
- API key authentication
- Session management with expiry and rotation
- Input sanitization and request validation
- Audit logging
- IP allowlist/blocklist
- Security headers
"""
import os
import re
import time
import uuid
import secrets
import hashlib
import logging
import threading
from collections import defaultdict
from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, List, Set, Callable
from functools import wraps
from starlette.requests import Request

log = logging.getLogger("ollama-emu.acl")

# ============================================================
# CONFIGURATION
# ============================================================

RATE_LIMIT_REQUESTS = int(os.environ.get("OLLAMA_EMU_RATE_LIMIT", "60"))
RATE_LIMIT_WINDOW = int(os.environ.get("OLLAMA_EMU_RATE_WINDOW", "60"))
SESSION_EXPIRY_HOURS = int(os.environ.get("OLLAMA_EMU_SESSION_EXPIRY", "720"))
MAX_SESSIONS_PER_USER = int(os.environ.get("OLLAMA_EMU_MAX_SESSIONS", "5"))
API_KEY_HEADER = "X-API-Key"
ADMIN_EMAIL = os.environ.get("OLLAMA_EMU_ADMIN_EMAIL", "admin@localhost")
IP_BLOCKLIST = set(filter(None, os.environ.get("OLLAMA_EMU_IP_BLOCKLIST", "").split(",")))
IP_ALLOWLIST = set(filter(None, os.environ.get("OLLAMA_EMU_IP_ALLOWLIST", "").split(",")))
COOKIE_SECURE = os.environ.get("COOKIE_SECURE", "true").lower() in ("1", "true", "yes")

# ============================================================
# ROLES & PERMISSIONS
# ============================================================

class Permission:
    READ = "read"
    WRITE = "write"
    DELETE = "delete"
    ADMIN = "admin"
    RAG_READ = "rag.read"
    RAG_WRITE = "rag.write"
    RAG_DELETE = "rag.delete"
    MEMORY_READ = "memory.read"
    MEMORY_WRITE = "memory.write"
    MEMORY_DELETE = "memory.delete"
    PROVIDER_MANAGE = "provider.manage"
    USER_MANAGE = "user.manage"
    SYSTEM_ADMIN = "system.admin"

ALL_PERMISSIONS = {getattr(Permission, p) for p in dir(Permission) if not p.startswith("_") and p.isupper()}

ROLE_HIERARCHY: Dict[str, Set[str]] = {
    "guest": set(),
    "user": {
        Permission.READ, Permission.WRITE,
        Permission.RAG_READ, Permission.RAG_WRITE,
        Permission.MEMORY_READ, Permission.MEMORY_WRITE,
    },
    "power_user": {
        Permission.READ, Permission.WRITE, Permission.DELETE,
        Permission.RAG_READ, Permission.RAG_WRITE, Permission.RAG_DELETE,
        Permission.MEMORY_READ, Permission.MEMORY_WRITE, Permission.MEMORY_DELETE,
    },
    "admin": ALL_PERMISSIONS,
}

_ROLE_CACHE: Dict[str, Set[str]] = {}


def get_role_permissions(role: str) -> Set[str]:
    if role in _ROLE_CACHE:
        return _ROLE_CACHE[role]
    perms = set()
    for r in ROLE_HIERARCHY.get(role, set()):
        perms.add(r)
    _ROLE_CACHE[role] = perms
    return perms


def has_permission(role: str, permission: str) -> bool:
    perms = get_role_permissions(role)
    return permission in perms or Permission.ADMIN in perms or Permission.SYSTEM_ADMIN in perms


def require_permission(permission: str):
    """Decorator: check that the request has the required permission."""
    def decorator(func: Callable):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            request = kwargs.get("request") or (args[0] if args and hasattr(args[0], "headers") else None)
            if not request:
                from fastapi import Request as Req
                for a in args:
                    if isinstance(a, Req):
                        request = a
                        break
            if not request:
                raise PermissionError("No request context")
            auth = get_auth_context(request)
            if not auth or not has_permission(auth.get("role", "guest"), permission):
                from fastapi import HTTPException
                raise HTTPException(status_code=403, detail=f"Permission denied: requires '{permission}'")
            return await func(*args, **kwargs)
        return wrapper
    return decorator


# ============================================================
# AUTH CONTEXT
# ============================================================

_auth_context_var = threading.local()


def get_auth_context(request) -> Optional[dict]:
    return getattr(request.state, "auth_context", None)


def set_auth_context(request, ctx: dict):
    request.state.auth_context = ctx


def extract_auth(request) -> dict:
    """Extract auth from request: session token, API key, or basic auth."""
    from ollama_emu.db import get_session, get_user

    auth = {"authenticated": False, "role": "guest", "email": None, "method": None}

    # 1. Session token (cookie or header)
    token = request.cookies.get("session_token") or request.headers.get("Authorization", "").removeprefix("Bearer ").strip()
    if token and len(token) == 64:
        session = get_session(token)
        if session:
            user = get_user(session["email"])
            role = "admin" if session["email"] == ADMIN_EMAIL else "user"
            auth.update({"authenticated": True, "role": role, "email": session["email"], "method": "session", "token": token})
            return auth

    # 2. API key
    api_key = request.headers.get(API_KEY_HEADER, "").strip()
    if api_key:
        key_info = _verify_api_key(api_key)
        if key_info:
            auth.update({"authenticated": True, "role": key_info.get("role", "user"), "email": key_info.get("email"), "method": "api_key", "api_key_id": key_info.get("id")})
            return auth

    # 3. Basic auth (for Ollama-compatible endpoints)
    basic = request.headers.get("Authorization", "")
    if basic.startswith("Basic "):
        import base64
        try:
            decoded = base64.b64decode(basic[6:]).decode("utf-8")
            email, password = decoded.split(":", 1)
            user = get_user(email)
            if user:
                from ollama_emu.db import verify_password
                if verify_password(password, user["password_hash"]):
                    role = "admin" if email == ADMIN_EMAIL else "user"
                    auth.update({"authenticated": True, "role": role, "email": email, "method": "basic"})
                    return auth
        except Exception:
            pass

    return auth


# ============================================================
# RATE LIMITING
# ============================================================

class RateLimiter:
    def __init__(self, max_requests: int = RATE_LIMIT_REQUESTS, window: int = RATE_LIMIT_WINDOW):
        self.max_requests = max_requests
        self.window = window
        self._requests: Dict[str, List[float]] = defaultdict(list)
        self._lock = threading.Lock()

    def _cleanup(self, key: str, now: float):
        cutoff = now - self.window
        self._requests[key] = [t for t in self._requests[key] if t > cutoff]

    def check(self, key: str) -> bool:
        now = time.time()
        with self._lock:
            self._cleanup(key, now)
            if len(self._requests[key]) >= self.max_requests:
                return False
            self._requests[key].append(now)
            return True

    def remaining(self, key: str) -> int:
        now = time.time()
        with self._lock:
            self._cleanup(key, now)
            return max(0, self.max_requests - len(self._requests[key]))

    def reset(self, key: str):
        with self._lock:
            self._requests.pop(key, None)

    def get_retry_after(self, key: str) -> int:
        now = time.time()
        with self._lock:
            self._cleanup(key, now)
            if not self._requests[key]:
                return 0
            oldest = self._requests[key][0]
            return max(1, int(self.window - (now - oldest)))


_global_limiter = RateLimiter()
_endpoint_limiters: Dict[str, RateLimiter] = {}


def get_limiter(endpoint: str = "global", max_requests: int = None, window: int = None) -> RateLimiter:
    if endpoint == "global":
        return _global_limiter
    if endpoint not in _endpoint_limiters:
        _endpoint_limiters[endpoint] = RateLimiter(
            max_requests=max_requests or RATE_LIMIT_REQUESTS,
            window=window or RATE_LIMIT_WINDOW,
        )
    return _endpoint_limiters[endpoint]


def rate_limit(request, endpoint: str = "global", max_requests: int = None, window: int = None) -> bool:
    """Check rate limit. Returns True if allowed, False if blocked."""
    if os.environ.get("OLLAMA_EMU_DISABLE_RATE_LIMIT", "").lower() in ("1", "true", "yes"):
        return True
    ip = _get_client_ip(request)
    auth = get_auth_context(request)
    user_id = auth.get("email", ip) if auth else ip
    limiter = get_limiter(endpoint, max_requests, window)
    key = f"{endpoint}:{user_id}"
    return limiter.check(key)


def rate_limit_response(request, endpoint: str = "global"):
    """Build a 429 response with retry-after header."""
    from fastapi.responses import JSONResponse
    ip = _get_client_ip(request)
    auth = get_auth_context(request)
    user_id = auth.get("email", ip) if auth else ip
    limiter = get_limiter(endpoint)
    key = f"{endpoint}:{user_id}"
    retry = limiter.get_retry_after(key)
    return JSONResponse(
        status_code=429,
        content={"error": "Rate limit exceeded", "retry_after": retry},
        headers={"Retry-After": str(retry), "X-RateLimit-Limit": str(limiter.max_requests), "X-RateLimit-Remaining": "0"},
    )


# ============================================================
# API KEY MANAGEMENT
# ============================================================

_api_keys: Dict[str, dict] = {}
_api_key_lock = threading.Lock()


def create_api_key(name: str, role: str = "user", email: str = None, scopes: List[str] = None) -> dict:
    key = f"oe_{secrets.token_hex(32)}"
    key_id = f"ak_{uuid.uuid4().hex[:12]}"
    info = {
        "id": key_id,
        "name": name,
        "key_hash": hashlib.sha256(key.encode()).hexdigest(),
        "role": role,
        "email": email,
        "scopes": scopes or ["read", "write"],
        "created_at": datetime.now(timezone.utc).isoformat(),
        "last_used": None,
        "active": True,
    }
    with _api_key_lock:
        _api_keys[key_id] = info
    log.info("API key created: %s (name=%s, role=%s)", key_id, name, role)
    return {"id": key_id, "key": key, "name": name, "role": role}


def _verify_api_key(key: str) -> Optional[dict]:
    if not key.startswith("oe_"):
        return None
    key_hash = hashlib.sha256(key.encode()).hexdigest()
    with _api_key_lock:
        for kid, info in _api_keys.items():
            if info["key_hash"] == key_hash and info["active"]:
                info["last_used"] = datetime.now(timezone.utc).isoformat()
                return info
    return None


def revoke_api_key(key_id: str) -> bool:
    with _api_key_lock:
        if key_id in _api_keys:
            _api_keys[key_id]["active"] = False
            log.info("API key revoked: %s", key_id)
            return True
    return False


def list_api_keys() -> List[dict]:
    with _api_key_lock:
        return [
            {"id": k["id"], "name": k["name"], "role": k["role"], "scopes": k["scopes"],
             "created_at": k["created_at"], "last_used": k["last_used"], "active": k["active"]}
            for k in _api_keys.values()
        ]


# ============================================================
# SESSION MANAGEMENT
# ============================================================

class SessionManager:
    def __init__(self):
        self._sessions: Dict[str, dict] = {}
        self._lock = threading.Lock()
        self._cleanup_thread = threading.Thread(target=self._cleanup_loop, daemon=True)
        self._cleanup_thread.start()

    def _cleanup_loop(self):
        while True:
            time.sleep(300)
            self._cleanup_expired()

    def _cleanup_expired(self):
        now = datetime.now(timezone.utc)
        with self._lock:
            expired = [
                token for token, info in self._sessions.items()
                if now - datetime.fromisoformat(info["created_at"]) > timedelta(hours=SESSION_EXPIRY_HOURS)
            ]
            for token in expired:
                del self._sessions[token]
            if expired:
                log.info("Cleaned up %d expired sessions", len(expired))

    def create(self, email: str, role: str = "user") -> str:
        token = secrets.token_hex(32)
        now = datetime.now(timezone.utc).isoformat()
        with self._lock:
            user_sessions = [t for t, s in self._sessions.items() if s["email"] == email]
            if len(user_sessions) >= MAX_SESSIONS_PER_USER:
                oldest = min(user_sessions, key=lambda t: self._sessions[t]["created_at"])
                del self._sessions[oldest]
            self._sessions[token] = {
                "email": email,
                "role": role,
                "created_at": now,
                "last_activity": now,
                "ip": None,
            }
        return token

    def verify(self, token: str) -> Optional[dict]:
        with self._lock:
            info = self._sessions.get(token)
            if not info:
                return None
            created = datetime.fromisoformat(info["created_at"])
            if datetime.now(timezone.utc) - created > timedelta(hours=SESSION_EXPIRY_HOURS):
                del self._sessions[token]
                return None
            info["last_activity"] = datetime.now(timezone.utc).isoformat()
            return info

    def destroy(self, token: str):
        with self._lock:
            self._sessions.pop(token, None)

    def destroy_all(self, email: str):
        with self._lock:
            to_delete = [t for t, s in self._sessions.items() if s["email"] == email]
            for t in to_delete:
                del self._sessions[t]

    def count(self, email: str = None) -> int:
        with self._lock:
            if email:
                return sum(1 for s in self._sessions.values() if s["email"] == email)
            return len(self._sessions)


session_manager = SessionManager()


# ============================================================
# INPUT SANITIZATION
# ============================================================

_DANGEROUS_PATTERNS = [
    re.compile(r"<script[^>]*>", re.IGNORECASE),
    re.compile(r"javascript:", re.IGNORECASE),
    re.compile(r"on\w+\s*=", re.IGNORECASE),
    re.compile(r"data:text/html", re.IGNORECASE),
    re.compile(r"vbscript:", re.IGNORECASE),
    re.compile(r"\beval\s*\(", re.IGNORECASE),
    re.compile(r"\bexec\s*\(", re.IGNORECASE),
]


def sanitize_input(text: str, max_length: int = 10000) -> str:
    if not isinstance(text, str):
        return ""
    text = text.strip()
    if len(text) > max_length:
        text = text[:max_length]
    for pattern in _DANGEROUS_PATTERNS:
        text = pattern.sub("", text)
    return text


def sanitize_filename(filename: str) -> str:
    filename = os.path.basename(filename)
    filename = re.sub(r'[^\w\-.]', '_', filename)
    filename = re.sub(r'_+', '_', filename).strip('_')
    if not filename:
        filename = "unnamed"
    return filename[:255]


def validate_email(email: str) -> bool:
    return bool(re.match(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$', email))


def validate_password(password: str) -> tuple[bool, str]:
    if len(password) < 8:
        return False, "Password must be at least 8 characters"
    if len(password) > 128:
        return False, "Password too long (max 128 characters)"
    if not re.search(r'[A-Z]', password):
        return False, "Password must contain at least one uppercase letter"
    if not re.search(r'[a-z]', password):
        return False, "Password must contain at least one lowercase letter"
    if not re.search(r'\d', password):
        return False, "Password must contain at least one digit"
    return True, ""


def validate_json_body(data: dict, required_fields: list, optional_fields: list = None) -> dict:
    errors = []
    for field in required_fields:
        if field not in data:
            errors.append(f"Missing required field: {field}")
    if optional_fields is None:
        optional_fields = []
    allowed = set(required_fields + optional_fields)
    extra = set(data.keys()) - allowed
    if extra:
        errors.append(f"Unexpected fields: {', '.join(extra)}")
    if errors:
        raise ValueError("; ".join(errors))
    return data


# ============================================================
# IP FILTERING
# ============================================================

def _get_client_ip(request) -> str:
    forwarded = request.headers.get("X-Forwarded-For", "")
    if forwarded:
        return forwarded.split(",")[0].strip()
    real_ip = request.headers.get("X-Real-IP", "")
    if real_ip:
        return real_ip.strip()
    if hasattr(request, "client") and request.client:
        return request.client.host
    return "127.0.0.1"


def is_ip_allowed(ip: str) -> bool:
    if IP_BLOCKLIST and ip in IP_BLOCKLIST:
        return False
    if IP_ALLOWLIST and ip not in IP_ALLOWLIST:
        return False
    return True


# ============================================================
# AUDIT LOGGING
# ============================================================

_audit_log: List[dict] = []
_audit_lock = threading.Lock()
MAX_AUDIT_ENTRIES = 10000


def audit_log(event: str, email: str = None, ip: str = None, details: dict = None, success: bool = True):
    entry = {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "event": event,
        "email": email,
        "ip": ip,
        "success": success,
        "details": details or {},
    }
    with _audit_lock:
        _audit_log.append(entry)
        if len(_audit_log) > MAX_AUDIT_ENTRIES:
            _audit_log.pop(0)
    level = logging.INFO if success else logging.WARNING
    log.log(level, "AUDIT: %s email=%s ip=%s success=%s", event, email, ip, success)


def get_audit_log(limit: int = 100, event: str = None, email: str = None) -> List[dict]:
    with _audit_lock:
        entries = list(_audit_log)
    if event:
        entries = [e for e in entries if e["event"] == event]
    if email:
        entries = [e for e in entries if e["email"] == email]
    return entries[-limit:]


# ============================================================
# SECURITY HEADERS
# ============================================================

SECURITY_HEADERS = {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "X-XSS-Protection": "1; mode=block",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
    "X-Request-ID": None,  # filled per-request
}


def get_security_headers(request=None) -> dict:
    headers = dict(SECURITY_HEADERS)
    headers["X-Request-ID"] = uuid.uuid4().hex[:16]
    return headers


# ============================================================
# ACL MIDDLEWARE FACTORY
# ============================================================

def create_acl_middleware(app):
    """Create an ACL middleware function for FastAPI."""
    async def acl_middleware(request: Request, call_next):
        ip = _get_client_ip(request)

        if not is_ip_allowed(ip):
            audit_log("ip_blocked", ip=ip)
            from fastapi.responses import JSONResponse
            return JSONResponse(status_code=403, content={"error": "Access denied"})

        auth = extract_auth(request)
        set_auth_context(request, auth)

        if not rate_limit(request):
            audit_log("rate_limited", email=auth.get("email"), ip=ip, success=False)
            return rate_limit_response(request)

        response = await call_next(request)

        for key, value in get_security_headers(request).items():
            response.headers[key] = value

        if auth.get("authenticated"):
            response.headers["X-Auth-Method"] = auth.get("method", "unknown")
            response.headers["X-Auth-Role"] = auth.get("role", "guest")

        return response
    return acl_middleware


# ============================================================
# PUBLIC API
# ============================================================

def get_acl_stats() -> dict:
    return {
        "active_sessions": session_manager.count(),
        "api_keys": len([k for k in _api_keys.values() if k["active"]]),
        "rate_limit": {
            "max_requests": RATE_LIMIT_REQUESTS,
            "window_seconds": RATE_LIMIT_WINDOW,
        },
        "session_expiry_hours": SESSION_EXPIRY_HOURS,
        "max_sessions_per_user": MAX_SESSIONS_PER_USER,
        "ip_blocklist_size": len(IP_BLOCKLIST),
        "ip_allowlist_size": len(IP_ALLOWLIST),
        "audit_entries": len(_audit_log),
    }
