-- ================================================================
-- OllamoMUI — PostgreSQL + pgvector Database Setup
-- ================================================================
-- Copyright (c) 2024-2026 Rhasan@dev. All rights reserved.
--
-- IMPORTANT: Run in TWO steps in pgAdmin4:
--   Step 1: Run this script on your default "postgres" database
--           (or any database) to create the user.
--   Step 2: Disconnect, connect to "ollamaemu" database, run again.
--
-- Or run from psql which handles CREATE DATABASE outside transactions.
-- ================================================================

-- ── Create user (skip if exists) ──────────────────────
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'ollamaemu') THEN
        CREATE USER ollamaemu WITH PASSWORD 'ollamaemu' SUPERUSER;
        RAISE NOTICE 'User ollamaemu created.';
    ELSE
        RAISE NOTICE 'User ollamaemu already exists.';
    END IF;
END
$$;

-- ── Create database (skip if exists) ──────────────────
-- NOTE: If you get "CREATE DATABASE cannot run inside a transaction block",
-- run this line directly in a separate query window:
--   CREATE DATABASE ollamaemu OWNER ollamaemu;
-- Then reconnect to ollamaemu and run the rest of this script.
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_database WHERE datname = 'ollamaemu') THEN
        -- This will fail inside a transaction in pgAdmin4.
        -- If it fails, run: CREATE DATABASE ollamaemu OWNER ollamaemu; separately.
        EXECUTE 'CREATE DATABASE ollamaemu OWNER ollamaemu';
        RAISE NOTICE 'Database ollamaemu created.';
    ELSE
        RAISE NOTICE 'Database ollamaemu already exists.';
    END IF;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Could not create database inside transaction. Run manually: CREATE DATABASE ollamaemu OWNER ollamaemu;';
END
$$;

-- ================================================================
-- From here on, you should be connected to the "ollamaemu" database.
-- ================================================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ================================================================
-- PROVIDERS
-- ================================================================
CREATE TABLE IF NOT EXISTS providers (
    name          TEXT PRIMARY KEY,
    url           TEXT,
    models_url    TEXT,
    auth_type     TEXT,
    default_model TEXT,
    free_heuristic TEXT,
    type          TEXT,
    api_key       TEXT DEFAULT ''
);

-- ================================================================
-- AUTH (users + sessions)
-- ================================================================
CREATE TABLE IF NOT EXISTS users (
    email         TEXT PRIMARY KEY,
    password_hash TEXT NOT NULL,
    created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sessions (
    token         TEXT PRIMARY KEY,
    email         TEXT NOT NULL REFERENCES users(email) ON DELETE CASCADE,
    created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sessions_email ON sessions(email);

-- ================================================================
-- RAG (Retrieval-Augmented Generation) + pgvector
-- ================================================================
CREATE TABLE IF NOT EXISTS rag_documents (
    id          TEXT PRIMARY KEY,
    filename    TEXT NOT NULL,
    file_hash   TEXT NOT NULL,
    chunk_count INTEGER DEFAULT 0,
    collection  TEXT DEFAULT 'default',
    metadata    JSONB DEFAULT '{}',
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rag_docs_collection ON rag_documents(collection);
CREATE INDEX IF NOT EXISTS idx_rag_docs_hash ON rag_documents(file_hash);

CREATE TABLE IF NOT EXISTS rag_chunks (
    id           TEXT PRIMARY KEY,
    doc_id       TEXT NOT NULL REFERENCES rag_documents(id) ON DELETE CASCADE,
    chunk_index  INTEGER NOT NULL,
    content      TEXT NOT NULL,
    tokens       JSONB DEFAULT '[]',
    embedding    vector(384)
);

CREATE INDEX IF NOT EXISTS idx_chunks_doc ON rag_chunks(doc_id);

-- Vector index created conditionally (needs 100+ vectors).
-- The app creates it automatically. To create manually:
--   SELECT create_vector_index('hnsw');

CREATE TABLE IF NOT EXISTS rag_fts (
    id      SERIAL PRIMARY KEY,
    doc_id  TEXT NOT NULL,
    content TSVECTOR NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_rag_fts_gin ON rag_fts USING gin(content);

-- ================================================================
-- MEMORY SYSTEM
-- ================================================================
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
CREATE INDEX IF NOT EXISTS idx_facts_session ON memory_facts(session_id);

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

-- ================================================================
-- SCHEMA VERSION (frontend/backend sync)
-- ================================================================
CREATE TABLE IF NOT EXISTS schema_version (
    version     INTEGER PRIMARY KEY,
    prisma_hash TEXT NOT NULL DEFAULT '',
    updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================================
-- ACL (Access Control List)
-- ================================================================
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
CREATE INDEX IF NOT EXISTS idx_api_keys_hash ON api_keys(key_hash);
CREATE INDEX IF NOT EXISTS idx_api_keys_email ON api_keys(email);

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

-- ================================================================
-- HELPER FUNCTION: Create vector index
-- ================================================================
CREATE OR REPLACE FUNCTION create_vector_index(index_type TEXT DEFAULT 'hnsw')
RETURNS void AS $$
DECLARE
    vec_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO vec_count FROM rag_chunks WHERE embedding IS NOT NULL;

    IF vec_count = 0 THEN
        RAISE NOTICE 'No embeddings found. Index will be created after documents are inserted.';
        RETURN;
    END IF;

    IF index_type = 'hnsw' THEN
        EXECUTE format(
            'CREATE INDEX IF NOT EXISTS idx_chunks_embedding_hnsw ON rag_chunks USING hnsw (embedding vector_cosine_ops) WITH (m = 16, ef_construction = 200)'
        );
        RAISE NOTICE 'HNSW index created (% vectors)', vec_count;
    ELSE
        EXECUTE format(
            'CREATE INDEX IF NOT EXISTS idx_chunks_embedding_ivfflat ON rag_chunks USING ivfflat (embedding vector_cosine_ops) WITH (lists = %s)',
            GREATEST(100, vec_count / 10)
        );
        RAISE NOTICE 'IVFFlat index created (% vectors, lists=%s)', vec_count, GREATEST(100, vec_count / 10);
    END IF;
END;
$$ LANGUAGE plpgsql;

-- ================================================================
-- SEED DATA (must match DEFAULT_PROVIDERS in ollama_emu_desktop.py)
-- ================================================================
INSERT INTO providers (name, url, models_url, auth_type, default_model, free_heuristic, type, api_key) VALUES
    ('openrouter', 'https://openrouter.ai/api/v1/chat/completions', 'https://openrouter.ai/api/v1/models', 'bearer', 'tencent/hy3:free', 'api', 'openai', '')
ON CONFLICT (name) DO NOTHING;

INSERT INTO providers (name, url, models_url, auth_type, default_model, free_heuristic, type, api_key) VALUES
    ('openai', 'https://api.openai.com/v1/chat/completions', 'https://api.openai.com/v1/models', 'bearer', 'gpt-3.5-turbo', 'false', 'openai', '')
ON CONFLICT (name) DO NOTHING;

INSERT INTO providers (name, url, models_url, auth_type, default_model, free_heuristic, type, api_key) VALUES
    ('anthropic', 'https://api.anthropic.com/v1/messages', NULL, 'header', 'claude-3-sonnet-20240229', 'false', 'anthropic', '')
ON CONFLICT (name) DO NOTHING;

INSERT INTO providers (name, url, models_url, auth_type, default_model, free_heuristic, type, api_key) VALUES
    ('claude', 'https://api.anthropic.com/v1/messages', NULL, 'header', 'claude-3-5-sonnet-20241022', 'false', 'anthropic', '')
ON CONFLICT (name) DO NOTHING;

INSERT INTO providers (name, url, models_url, auth_type, default_model, free_heuristic, type, api_key) VALUES
    ('gemini', 'https://generativelanguage.googleapis.com/v1beta/models/{model}:streamGenerateContent?key={key}&alt=sse', 'https://generativelanguage.googleapis.com/v1/models?key={key}', 'query', 'gemini-1.5-flash', 'true', 'gemini', '')
ON CONFLICT (name) DO NOTHING;

INSERT INTO providers (name, url, models_url, auth_type, default_model, free_heuristic, type, api_key) VALUES
    ('groq', 'https://api.groq.com/openai/v1/chat/completions', 'https://api.groq.com/openai/v1/models', 'bearer', 'llama3-70b-8192', 'true', 'openai', '')
ON CONFLICT (name) DO NOTHING;

INSERT INTO providers (name, url, models_url, auth_type, default_model, free_heuristic, type, api_key) VALUES
    ('deepseek', 'https://api.deepseek.com/chat/completions', 'https://api.deepseek.com/v1/models', 'bearer', 'deepseek-chat', 'true', 'openai', '')
ON CONFLICT (name) DO NOTHING;

INSERT INTO providers (name, url, models_url, auth_type, default_model, free_heuristic, type, api_key) VALUES
    ('mistral', 'https://api.mistral.ai/v1/chat/completions', 'https://api.mistral.ai/v1/models', 'bearer', 'mistral-tiny', 'false', 'openai', '')
ON CONFLICT (name) DO NOTHING;

INSERT INTO providers (name, url, models_url, auth_type, default_model, free_heuristic, type, api_key) VALUES
    ('together', 'https://api.together.xyz/v1/chat/completions', 'https://api.together.xyz/v1/models', 'bearer', 'meta-llama/Llama-3-70b-chat-hf', 'false', 'openai', '')
ON CONFLICT (name) DO NOTHING;

-- ── Payment & Licenses ──────────────────────────────────────────
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

ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'free';
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_expiry TIMESTAMPTZ;

INSERT INTO schema_version (version, prisma_hash) VALUES (1, '')
ON CONFLICT (version) DO NOTHING;

-- ================================================================
-- DONE! Now run: python ollama_emu_desktop.py
-- ================================================================
