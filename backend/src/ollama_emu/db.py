"""
PostgreSQL + pgvector Database Layer for OllamaEmu
Copyright (c) 2024-2026 Rhasan@dev. All rights reserved.

Provides a connection pool and schema migration for all subsystems:
  - Provider configs & API keys
  - Auth (users, sessions)
  - RAG (documents, chunks, pgvector embeddings)
  - Memory (messages, facts, summaries, sessions)

Configure via environment variables:
  PGHOST, PGPORT, PGUSER, PGPASSWORD, PGDATABASE

Or set OLLAMA_EMU_DATABASE_URL for a single connection string.
"""
import os
import hashlib
import hmac
import secrets
import logging
from contextlib import contextmanager
from typing import Dict, List, Optional, Tuple

from dotenv import load_dotenv
load_dotenv()

import psycopg2
import psycopg2.pool
import psycopg2.extras
import psycopg2.errors

log = logging.getLogger("ollama-emu.db")

# ============================================================
# CONNECTION POOL
# ============================================================

_pool: Optional[psycopg2.pool.ThreadedConnectionPool] = None
_connected: bool = False


def get_dsn() -> str:
    url = os.environ.get("OLLAMA_EMU_DATABASE_URL", "").strip()
    if url:
        return url
    host = os.environ.get("PGHOST", "127.0.0.1")
    port = os.environ.get("PGPORT", "5432")
    user = os.environ.get("PGUSER", "ollamaemu")
    password = os.environ.get("PGPASSWORD", "ollamaemu")
    dbname = os.environ.get("PGDATABASE", "ollamaemu")
    return f"host={host} port={port} user={user} password={password} dbname={dbname}"


def is_connected() -> bool:
    return _connected and _pool is not None


def init_pool(minconn: int = 1, maxconn: int = 10) -> bool:
    global _pool, _connected
    if _pool is not None:
        return True
    dsn = get_dsn()
    try:
        _pool = psycopg2.pool.ThreadedConnectionPool(minconn, maxconn, dsn)
        _connected = True
        log.info("PostgreSQL pool created (min=%d, max=%d)", minconn, maxconn)
        return True
    except Exception as e:
        _connected = False
        log.error("PostgreSQL connection failed: %s", e)
        log.warning("Server will start but database features (RAG, Memory, Auth) will be unavailable.")
        return False


def close_pool():
    global _pool, _connected
    if _pool:
        try:
            _pool.closeall()
        except Exception:
            pass
        _pool = None
        _connected = False
        log.info("PostgreSQL pool closed.")


@contextmanager
def get_conn():
    """Yield a connection from the pool. Auto-commits on success, rolls back on error."""
    if not _pool:
        raise RuntimeError("PostgreSQL pool not initialized")
    conn = _pool.getconn()
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        _pool.putconn(conn)


@contextmanager
def get_cursor(commit: bool = True):
    """Yield a RealDictCursor from a pooled connection."""
    with get_conn() as conn:
        cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        yield cur
        if commit:
            conn.commit()


# ============================================================
# PASSWORD HASHING (PBKDF2-HMAC-SHA256)
# ============================================================

def hash_password(email: str, password: str) -> str:
    salt = secrets.token_hex(16)
    dk = hashlib.pbkdf2_hmac(
        "sha256", f"{password}::ollamaemu".encode(), bytes.fromhex(salt), 200_000
    )
    return f"pbkdf2${salt}${dk.hex()}"


def verify_password(password: str, stored_hash: str) -> bool:
    try:
        algo, salt, dk = stored_hash.split("$")
        if algo != "pbkdf2":
            return False
        expected = hashlib.pbkdf2_hmac(
            "sha256", f"{password}::ollamaemu".encode(), bytes.fromhex(salt), 200_000
        ).hex()
        return hmac.compare_digest(expected, dk)
    except Exception:
        return False


# ============================================================
# SCHEMA MIGRATION
# ============================================================

SCHEMA_SQL = """
-- Enable extensions
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ── Providers ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS providers (
    name        TEXT PRIMARY KEY,
    url         TEXT,
    models_url  TEXT,
    auth_type   TEXT,
    default_model TEXT,
    free_heuristic TEXT,
    type        TEXT,
    api_key     TEXT DEFAULT ''
);

-- ── Model Catalog ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS model_catalog (
    id          SERIAL PRIMARY KEY,
    provider    TEXT NOT NULL,
    model_name  TEXT NOT NULL,
    free        BOOLEAN DEFAULT false,
    active      BOOLEAN DEFAULT true,
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(provider, model_name)
);

-- ── Auth ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    email         TEXT PRIMARY KEY,
    password_hash TEXT NOT NULL,
    role          TEXT DEFAULT 'user',
    created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sessions (
    token      TEXT PRIMARY KEY,
    email      TEXT NOT NULL REFERENCES users(email),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── RAG ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS rag_documents (
    id          TEXT PRIMARY KEY,
    filename    TEXT NOT NULL,
    file_hash   TEXT NOT NULL,
    chunk_count INTEGER DEFAULT 0,
    collection  TEXT DEFAULT 'default',
    metadata    JSONB DEFAULT '{}',
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS rag_chunks (
    id           TEXT PRIMARY KEY,
    doc_id       TEXT NOT NULL REFERENCES rag_documents(id) ON DELETE CASCADE,
    chunk_index  INTEGER NOT NULL,
    content      TEXT NOT NULL,
    tokens       JSONB DEFAULT '[]',
    embedding    vector(384)
);

CREATE INDEX IF NOT EXISTS idx_chunks_doc ON rag_chunks(doc_id);

-- Full-text search on chunks
CREATE TABLE IF NOT EXISTS rag_fts (
    id      SERIAL PRIMARY KEY,
    doc_id  TEXT NOT NULL,
    content TSVECTOR NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_rag_fts_gin ON rag_fts USING gin(content);

-- ── Memory ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS memory_messages (
    id         TEXT PRIMARY KEY,
    role       TEXT NOT NULL,
    content    TEXT NOT NULL,
    model      TEXT DEFAULT '',
    provider   TEXT DEFAULT '',
    session_id TEXT DEFAULT 'default',
    tokens     INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    flushed    BOOLEAN DEFAULT FALSE
);
CREATE INDEX IF NOT EXISTS idx_mem_session ON memory_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_mem_created ON memory_messages(created_at);

CREATE TABLE IF NOT EXISTS memory_facts (
    id         TEXT PRIMARY KEY,
    fact       TEXT NOT NULL,
    source     TEXT DEFAULT '',
    importance TEXT DEFAULT 'normal',
    session_id TEXT DEFAULT 'default',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS memory_summaries (
    id            TEXT PRIMARY KEY,
    session_id    TEXT NOT NULL,
    summary       TEXT NOT NULL,
    message_count INTEGER DEFAULT 0,
    created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS memory_sessions (
    id            TEXT PRIMARY KEY,
    name          TEXT DEFAULT '',
    model         TEXT DEFAULT '',
    provider      TEXT DEFAULT '',
    message_count INTEGER DEFAULT 0,
    created_at    TIMESTAMPTZ DEFAULT NOW(),
    updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ── Schema Version (for frontend/backend sync) ──
CREATE TABLE IF NOT EXISTS schema_version (
    version     INTEGER PRIMARY KEY,
    prisma_hash TEXT NOT NULL DEFAULT '',
    updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── ACL (Access Control List) ─────────────────────────
CREATE TABLE IF NOT EXISTS api_keys (
    id         TEXT PRIMARY KEY,
    name       TEXT NOT NULL,
    key_hash   TEXT NOT NULL,
    role       TEXT DEFAULT 'user',
    email      TEXT,
    scopes     JSONB DEFAULT '["read","write"]',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_used  TIMESTAMPTZ,
    active     BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS audit_log (
    id         SERIAL PRIMARY KEY,
    timestamp  TIMESTAMPTZ DEFAULT NOW(),
    event      TEXT NOT NULL,
    email      TEXT,
    ip         TEXT,
    success    BOOLEAN DEFAULT TRUE,
    details    JSONB DEFAULT '{}'
);
CREATE INDEX IF NOT EXISTS idx_audit_event ON audit_log(event);
CREATE INDEX IF NOT EXISTS idx_audit_email ON audit_log(email);
CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON audit_log(timestamp);

CREATE TABLE IF NOT EXISTS ip_blocklist (
    ip         TEXT PRIMARY KEY,
    reason     TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ip_allowlist (
    ip         TEXT PRIMARY KEY,
    reason     TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS rate_limits (
    id           TEXT PRIMARY KEY,
    key          TEXT NOT NULL,
    count        INTEGER DEFAULT 1,
    window_start TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_rate_key ON rate_limits(key);

-- ── Payment & Licenses ──────────────────────────────
CREATE TABLE IF NOT EXISTS payment_sessions (
    id             SERIAL PRIMARY KEY,
    session_key    TEXT UNIQUE NOT NULL,
    user_id        TEXT NOT NULL,
    plan           TEXT NOT NULL,
    amount         REAL DEFAULT 0,
    currency       TEXT DEFAULT 'BDT',
    status         TEXT DEFAULT 'pending',
    transaction_id TEXT DEFAULT '',
    created_at     TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_payment_session_key ON payment_sessions(session_key);
CREATE INDEX IF NOT EXISTS idx_payment_user ON payment_sessions(user_id);

CREATE TABLE IF NOT EXISTS licenses (
    id           SERIAL PRIMARY KEY,
    user_id      TEXT NOT NULL,
    key_hash     TEXT NOT NULL,
    raw_key      TEXT NOT NULL,
    plan         TEXT NOT NULL,
    expiry_date  TIMESTAMPTZ NOT NULL,
    activated    BOOLEAN DEFAULT false,
    activated_at TIMESTAMPTZ,
    device_id    TEXT DEFAULT '',
    created_at   TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, plan)
);
CREATE INDEX IF NOT EXISTS idx_licenses_user ON licenses(user_id);
CREATE INDEX IF NOT EXISTS idx_licenses_key ON licenses(key_hash);

-- ── IVFFlat index for pgvector (requires data to exist) ──
-- Created after first documents are inserted.
"""


def migrate_schema():
    """Create all tables and indexes if they don't exist."""
    if not is_connected():
        return
    with get_conn() as conn:
        cur = conn.cursor()
        cur.execute(SCHEMA_SQL)
        conn.commit()
    # ALTER TABLE for existing databases that predate new columns
    ALTER_SQL = """
ALTER TABLE users ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';
ALTER TABLE users ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS last_activity TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS ip TEXT DEFAULT '';
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'free';
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_expiry TIMESTAMPTZ;
    """
    try:
        with get_conn() as conn:
            cur = conn.cursor()
            cur.execute(ALTER_SQL)
            conn.commit()
    except Exception as e:
        log.debug("ALTER TABLE migrations skipped: %s", e)
    log.info("Database schema migrated (PostgreSQL + pgvector).")


def create_embedding_index():
    """Create IVFFlat index after data exists (can't be in migration if table is empty)."""
    if not is_connected():
        return
    try:
        with get_conn() as conn:
            cur = conn.cursor()
            cur.execute("""
                SELECT COUNT(*) FROM rag_chunks WHERE embedding IS NOT NULL
            """)
            count = cur.fetchone()[0]
            if count >= 100:
                cur.execute("""
                    CREATE INDEX IF NOT EXISTS idx_chunks_embedding
                    ON rag_chunks USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100)
                """)
                conn.commit()
                log.info("IVFFlat embedding index created (%d vectors).", count)
    except Exception as e:
        log.debug("Could not create embedding index: %s", e)


# ============================================================
# SCHEMA VERSION (for frontend/backend sync)
# ============================================================

# Increment this when the schema changes. Must match frontend PRISMA_VERSION.
PRISMA_VERSION = 1


def get_schema_version() -> dict:
    """Return the current schema version from the database."""
    if not is_connected():
        return {"version": 0, "prisma_hash": "", "connected": False}
    with get_cursor(commit=False) as cur:
        cur.execute("SELECT version, prisma_hash, updated_at FROM schema_version ORDER BY version DESC LIMIT 1")
        row = cur.fetchone()
    if row:
        return {"version": row["version"], "prisma_hash": row["prisma_hash"], "updated_at": str(row["updated_at"]), "connected": True}
    return {"version": 0, "prisma_hash": "", "connected": True}


def set_schema_version(version: int, prisma_hash: str = ""):
    """Update the schema version in the database."""
    if not is_connected():
        return
    with get_cursor() as cur:
        cur.execute(
            "INSERT INTO schema_version (version, prisma_hash) VALUES (%s, %s) ON CONFLICT (version) DO UPDATE SET prisma_hash=%s, updated_at=NOW()",
            (version, prisma_hash, prisma_hash),
        )


def check_schema_sync() -> dict:
    """Check if the database schema matches the expected version."""
    info = get_schema_version()
    if not info["connected"]:
        return {"synced": False, "reason": "database_not_connected", **info}
    if info["version"] == 0:
        set_schema_version(PRISMA_VERSION)
        info["version"] = PRISMA_VERSION
    synced = info["version"] >= PRISMA_VERSION
    return {
        "synced": synced,
        "db_version": info["version"],
        "expected_version": PRISMA_VERSION,
        "reason": "ok" if synced else "schema_outdated",
        "prisma_hash": info.get("prisma_hash", ""),
    }


def seed_demo_user():
    """Insert the demo account if it doesn't exist."""
    if not is_connected():
        return
    email = os.environ.get("OLLAMA_EMU_ADMIN_EMAIL", "admin@localhost")
    password = os.environ.get("OLLAMA_EMU_DEMO_PASSWORD", "changeme123")
    pw_hash = hash_password(email, password)
    with get_cursor() as cur:
        cur.execute(
            "INSERT INTO users (email, password_hash, role) VALUES (%s, %s, 'admin') ON CONFLICT (email) DO UPDATE SET password_hash=%s, role='admin'",
            (email, pw_hash, pw_hash),
        )


# ============================================================
# PROVIDER DB OPERATIONS
# ============================================================

def load_providers() -> Tuple[Dict, Dict]:
    if not is_connected():
        return {}, {}
    with get_cursor(commit=False) as cur:
        cur.execute("SELECT name, url, models_url, auth_type, default_model, free_heuristic, type, api_key FROM providers")
        rows = cur.fetchall()
    pc, keys = {}, {}
    for r in rows:
        fh = r["free_heuristic"]
        if fh == "api":
            fh_val = "api"
        elif str(fh).lower() == "true":
            fh_val = True
        else:
            fh_val = False
        pc[r["name"]] = {
            "url": r["url"],
            "models_url": r["models_url"],
            "auth_type": r["auth_type"],
            "default_model": r["default_model"],
            "free_heuristic": fh_val,
            "type": r["type"],
        }
        if r["api_key"]:
            keys[r["name"]] = r["api_key"]
    return pc, keys


def save_provider(name: str, cfg: dict, api_key: str = ""):
    if not is_connected():
        return
    with get_cursor() as cur:
        cur.execute(
            """INSERT INTO providers (name, url, models_url, auth_type, default_model, free_heuristic, type, api_key)
               VALUES (%s,%s,%s,%s,%s,%s,%s,%s)
               ON CONFLICT (name) DO UPDATE SET
                 url=EXCLUDED.url, models_url=EXCLUDED.models_url, auth_type=EXCLUDED.auth_type,
                 default_model=EXCLUDED.default_model, free_heuristic=EXCLUDED.free_heuristic,
                 type=EXCLUDED.type, api_key=EXCLUDED.api_key""",
            (name, cfg.get("url"), cfg.get("models_url"), cfg.get("auth_type"),
             cfg.get("default_model"), str(cfg.get("free_heuristic", False)), cfg.get("type"), api_key),
        )


def get_provider(name: str) -> Optional[dict]:
    if not is_connected():
        return None
    with get_cursor(commit=False) as cur:
        cur.execute("SELECT name, url, models_url, auth_type, default_model, free_heuristic, type, api_key FROM providers WHERE name=%s", (name,))
        row = cur.fetchone()
        if row:
            return {
                "name": row["name"],
                "url": row["url"],
                "models_url": row["models_url"],
                "auth_type": row["auth_type"],
                "default_model": row["default_model"],
                "free_heuristic": row["free_heuristic"],
                "type": row["type"],
                "api_key": row["api_key"] or "",
            }
        return None


def delete_provider(name: str):
    if not is_connected():
        return
    with get_cursor() as cur:
        cur.execute("DELETE FROM providers WHERE name=%s", (name,))


def update_provider(name: str, data: dict):
    """Partial update of a provider's fields. Only sets non-None keys."""
    if not is_connected():
        return {"status": "skipped", "reason": "db not connected"}
    fields = []
    values = []
    for key in ("url", "models_url", "auth_type", "default_model", "type", "api_key"):
        if key in data and data[key] is not None:
            fields.append(f"{key}=%s")
            values.append(data[key])
    if "free_heuristic" in data and data["free_heuristic"] is not None:
        fields.append("free_heuristic=%s")
        values.append(str(data["free_heuristic"]))
    if not fields:
        return {"status": "no_changes"}
    values.append(name)
    sql = f"UPDATE providers SET {', '.join(fields)} WHERE name=%s"
    with get_cursor() as cur:
        cur.execute(sql, tuple(values))
        return {"status": "updated", "rowcount": cur.rowcount}


def seed_default_providers(defaults: dict):
    """Insert default providers only if the table is empty."""
    if not is_connected():
        return
    with get_cursor() as cur:
        cur.execute("SELECT COUNT(*) FROM providers")
        count = cur.fetchone()["count"]
        if count == 0:
            for name, cfg in defaults.items():
                cur.execute(
                    """INSERT INTO providers (name, url, models_url, auth_type, default_model, free_heuristic, type, api_key)
                       VALUES (%s,%s,%s,%s,%s,%s,%s,'')""",
                    (name, cfg.get("url"), cfg.get("models_url"), cfg.get("auth_type"),
                     cfg.get("default_model"), str(cfg.get("free_heuristic", False)), cfg.get("type")),
                )


# ============================================================
# MODEL CATALOG DB OPERATIONS
# ============================================================

def save_model_catalog(catalog: dict):
    """Save model catalog to database. catalog = {provider: [{name, free}, ...]}"""
    if not is_connected():
        return
    with get_cursor() as cur:
        for provider, models in catalog.items():
            for m in models:
                cur.execute(
                    """INSERT INTO model_catalog (provider, model_name, free)
                       VALUES (%s, %s, %s)
                       ON CONFLICT (provider, model_name) DO UPDATE SET free=%s, active=true""",
                    (provider, m["name"], m["free"], m["free"]),
                )


def load_model_catalog() -> dict:
    """Load model catalog from database. Returns {provider: [{name, free}, ...]}"""
    if not is_connected():
        return {}
    catalog = {}
    with get_cursor(commit=False) as cur:
        cur.execute("SELECT provider, model_name, free FROM model_catalog WHERE active=true ORDER BY provider, model_name")
        for r in cur.fetchall():
            p = r["provider"]
            if p not in catalog:
                catalog[p] = []
            catalog[p].append({"name": r["model_name"], "free": r["free"]})
    return catalog


def get_all_api_keys() -> dict:
    """Get all API keys from providers table. Returns {provider_name: api_key}"""
    if not is_connected():
        return {}
    keys = {}
    with get_cursor(commit=False) as cur:
        cur.execute("SELECT name, api_key FROM providers WHERE api_key != ''")
        for r in cur.fetchall():
            keys[r["name"]] = r["api_key"]
    return keys


# ============================================================
# AUTH DB OPERATIONS
# ============================================================

def create_user(email: str, pw_hash: str) -> bool:
    if not is_connected():
        return False
    with get_cursor() as cur:
        try:
            cur.execute("INSERT INTO users (email, password_hash) VALUES (%s,%s)", (email, pw_hash))
            return True
        except psycopg2.errors.UniqueViolation:
            return False


def update_password(email: str, new_hash: str) -> bool:
    """Update a user's password hash. Returns True if updated."""
    if not is_connected():
        return False
    with get_cursor() as cur:
        cur.execute("UPDATE users SET password_hash=%s WHERE email=%s", (new_hash, email))
        return cur.rowcount > 0


def get_user(email: str) -> Optional[dict]:
    if not is_connected():
        return None
    with get_cursor(commit=False) as cur:
        cur.execute("SELECT email, password_hash, created_at FROM users WHERE email=%s", (email,))
        return cur.fetchone()


def create_session(email: str, token: str):
    if not is_connected():
        return
    with get_cursor() as cur:
        cur.execute("INSERT INTO sessions (token, email) VALUES (%s,%s)", (token, email))


def get_session(token: str) -> Optional[dict]:
    if not is_connected():
        return None
    with get_cursor(commit=False) as cur:
        cur.execute("SELECT email, created_at FROM sessions WHERE token=%s", (token,))
        return cur.fetchone()


def delete_session(token: str):
    if not is_connected():
        return
    with get_cursor() as cur:
        cur.execute("DELETE FROM sessions WHERE token=%s", (token,))


def load_all_users() -> List[dict]:
    """List all users. Admin only."""
    if not is_connected():
        return []
    with get_cursor(commit=False) as cur:
        cur.execute("SELECT email, role, created_at FROM users ORDER BY created_at DESC")
        return [dict(r) for r in cur.fetchall()]


def update_user_role(email: str, role: str) -> bool:
    """Update a user's role. Admin only."""
    if not is_connected():
        return False
    with get_cursor() as cur:
        cur.execute("UPDATE users SET role=%s WHERE email=%s", (role, email))
        return cur.rowcount > 0


def delete_user(email: str) -> bool:
    """Delete a user and their sessions. Admin only."""
    if not is_connected():
        return False
    with get_cursor() as cur:
        cur.execute("DELETE FROM sessions WHERE email=%s", (email,))
        cur.execute("DELETE FROM users WHERE email=%s", (email,))
        return cur.rowcount > 0


def get_memory_message(msg_id: str) -> Optional[dict]:
    """Get a single memory message by ID."""
    if not is_connected():
        return None
    with get_cursor(commit=False) as cur:
        cur.execute("SELECT id, role, content, model, provider, session_id, tokens, created_at FROM memory_messages WHERE id=%s", (msg_id,))
        row = cur.fetchone()
        return dict(row) if row else None


def delete_memory_message(msg_id: str) -> bool:
    """Delete a single memory message by ID."""
    if not is_connected():
        return False
    with get_cursor() as cur:
        cur.execute("DELETE FROM memory_messages WHERE id=%s", (msg_id,))
        return cur.rowcount > 0


def clear_all_messages() -> bool:
    """Delete all memory messages."""
    if not is_connected():
        return False
    with get_cursor() as cur:
        cur.execute("DELETE FROM memory_messages")
        return True


def get_rag_document(doc_id: str) -> Optional[dict]:
    """Get a single RAG document by ID."""
    if not is_connected():
        return None
    with get_cursor(commit=False) as cur:
        cur.execute("SELECT id, filename, file_hash, chunk_count, collection, metadata, created_at FROM rag_documents WHERE id=%s", (doc_id,))
        row = cur.fetchone()
        return dict(row) if row else None


def list_rag_chunks(doc_id: str) -> List[dict]:
    """List all chunks for a document."""
    if not is_connected():
        return []
    with get_cursor(commit=False) as cur:
        cur.execute("SELECT id, chunk_index, content, tokens FROM rag_chunks WHERE doc_id=%s ORDER BY chunk_index", (doc_id,))
        return [dict(r) for r in cur.fetchall()]


def update_rag_chunk(chunk_id: str, content: str) -> bool:
    """Update a chunk's text content. Embedding must be re-computed by the caller."""
    if not is_connected():
        return False
    with get_cursor() as cur:
        cur.execute("UPDATE rag_chunks SET content=%s WHERE id=%s", (content, chunk_id))
        return cur.rowcount > 0


def get_usage_stats() -> dict:
    """Aggregate usage stats from memory_messages."""
    if not is_connected():
        return {"total_messages": 0, "total_tokens": 0}
    with get_cursor(commit=False) as cur:
        cur.execute("SELECT COUNT(*) as total, COALESCE(SUM(tokens),0) as tokens FROM memory_messages")
        row = cur.fetchone()
        return {"total_messages": row["total"], "total_tokens": row["tokens"]}


def logout_all_sessions(email: str):
    if not is_connected():
        return
    with get_cursor() as cur:
        cur.execute("DELETE FROM sessions WHERE email=%s", (email,))
