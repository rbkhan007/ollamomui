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
import json
import logging
import datetime
from contextlib import contextmanager
from typing import Any, Dict, List, Optional, Tuple

import psycopg2
import psycopg2.pool
import psycopg2.extras

log = logging.getLogger("ollama-emu.db")

# ============================================================
# CONNECTION POOL
# ============================================================

_pool: Optional[psycopg2.pool.ThreadedConnectionPool] = None


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


def init_pool(minconn: int = 1, maxconn: int = 10):
    global _pool
    if _pool is not None:
        return
    dsn = get_dsn()
    try:
        _pool = psycopg2.pool.ThreadedConnectionPool(minconn, maxconn, dsn)
        log.info("PostgreSQL pool created (min=%d, max=%d)", minconn, maxconn)
    except Exception as e:
        log.error("Failed to create PostgreSQL pool: %s", e)
        raise


def close_pool():
    global _pool
    if _pool:
        _pool.closeall()
        _pool = None
        log.info("PostgreSQL pool closed.")


@contextmanager
def get_conn():
    """Yield a connection from the pool. Auto-commits on success, rolls back on error."""
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
    """Yield a cursor from a pooled connection."""
    with get_conn() as conn:
        cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        yield cur
        if commit:
            conn.commit()


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

-- ── Auth ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    email         TEXT PRIMARY KEY,
    password_hash TEXT NOT NULL,
    created_at    TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS sessions (
    token      TEXT PRIMARY KEY,
    email      TEXT NOT NULL REFERENCES users(email),
    created_at TEXT NOT NULL
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
CREATE INDEX IF NOT EXISTS idx_chunks_embedding ON rag_chunks USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

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
"""


def migrate_schema():
    """Create all tables and indexes if they don't exist."""
    with get_conn() as conn:
        cur = conn.cursor()
        cur.execute(SCHEMA_SQL)
        conn.commit()
    log.info("Database schema migrated (PostgreSQL + pgvector).")


def seed_demo_user():
    """Insert the demo account if it doesn't exist."""
    email = "example@gmail.com"
    password = "12345678"
    # Import here to avoid circular import
    from ollama_emu_desktop import hash_password
    pw_hash = hash_password(email, password)
    now = datetime.datetime.now(datetime.UTC).isoformat()
    with get_cursor() as cur:
        cur.execute(
            "INSERT INTO users (email, password_hash, created_at) VALUES (%s, %s, %s) ON CONFLICT (email) DO UPDATE SET password_hash=%s",
            (email, pw_hash, now, pw_hash),
        )


# ============================================================
# PROVIDER DB OPERATIONS
# ============================================================

def load_providers() -> Tuple[Dict, Dict]:
    with get_cursor(commit=False) as cur:
        cur.execute("SELECT name, url, models_url, auth_type, default_model, free_heuristic, type, api_key FROM providers")
        rows = cur.fetchall()
    pc, keys = {}, {}
    for r in rows:
        pc[r["name"]] = {
            "url": r["url"],
            "models_url": r["models_url"],
            "auth_type": r["auth_type"],
            "default_model": r["default_model"],
            "free_heuristic": str(r["free_heuristic"]).lower() == "true" if r["free_heuristic"] else False,
            "type": r["type"],
        }
        if r["api_key"]:
            keys[r["name"]] = r["api_key"]
    return pc, keys


def save_provider(name: str, cfg: dict, api_key: str = ""):
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


def delete_provider(name: str):
    with get_cursor() as cur:
        cur.execute("DELETE FROM providers WHERE name=%s", (name,))


def seed_default_providers(defaults: dict):
    """Insert default providers only if the table is empty."""
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
# AUTH DB OPERATIONS
# ============================================================

def create_user(email: str, pw_hash: str) -> bool:
    now = datetime.datetime.now(datetime.UTC).isoformat()
    with get_cursor() as cur:
        try:
            cur.execute("INSERT INTO users (email, password_hash, created_at) VALUES (%s,%s,%s)", (email, pw_hash, now))
            return True
        except psycopg2.errors.UniqueViolation:
            return False


def get_user(email: str) -> Optional[dict]:
    with get_cursor(commit=False) as cur:
        cur.execute("SELECT email, password_hash, created_at FROM users WHERE email=%s", (email,))
        return cur.fetchone()


def create_session(email: str, token: str):
    now = datetime.datetime.now(datetime.UTC).isoformat()
    with get_cursor() as cur:
        cur.execute("INSERT INTO sessions (token, email, created_at) VALUES (%s,%s,%s)", (token, email, now))


def get_session(token: str) -> Optional[dict]:
    with get_cursor(commit=False) as cur:
        cur.execute("SELECT email, created_at FROM sessions WHERE token=%s", (token,))
        return cur.fetchone()


def delete_session(token: str):
    with get_cursor() as cur:
        cur.execute("DELETE FROM sessions WHERE token=%s", (token,))


def logout_all_sessions(email: str):
    with get_cursor() as cur:
        cur.execute("DELETE FROM sessions WHERE email=%s", (email,))
