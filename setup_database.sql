-- OllamaEmu — PostgreSQL + pgvector Database Setup
-- Run this in pgAdmin4 or psql to create the database and user.
--
-- Usage:
--   1. Open pgAdmin4
--   2. Open Query Tool
--   3. Paste this entire file
--   4. Execute (F5)

-- ── Create user and database ──────────────────────────
CREATE USER ollamaemu WITH PASSWORD 'ollamaemu' SUPERUSER;
CREATE DATABASE ollamaemu OWNER ollamaemu;

-- ── Connect to the new database ───────────────────────
-- (Run these after connecting to ollamaemu database)

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

-- ── RAG (Retrieval-Augmented Generation) ───────────────
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

-- ── Memory System ──────────────────────────────────────
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

-- ── Seed default providers ─────────────────────────────
INSERT INTO providers (name, url, models_url, auth_type, default_model, free_heuristic, type, api_key) VALUES
    ('openrouter', 'https://openrouter.ai/api/v1/chat/completions', 'https://openrouter.ai/api/v1/models', 'bearer', 'openrouter/auto', 'true', 'openai', '')
ON CONFLICT (name) DO NOTHING;

INSERT INTO providers (name, url, models_url, auth_type, default_model, free_heuristic, type, api_key) VALUES
    ('openai', 'https://api.openai.com/v1/chat/completions', 'https://api.openai.com/v1/models', 'bearer', 'gpt-3.5-turbo', 'false', 'openai', '')
ON CONFLICT (name) DO NOTHING;

INSERT INTO providers (name, url, models_url, auth_type, default_model, free_heuristic, type, api_key) VALUES
    ('anthropic', 'https://api.anthropic.com/v1/messages', 'https://api.anthropic.com/v1/models', 'x-api-key', 'claude-3-5-sonnet-20241022', 'false', 'anthropic', '')
ON CONFLICT (name) DO NOTHING;

INSERT INTO providers (name, url, models_url, auth_type, default_model, free_heuristic, type, api_key) VALUES
    ('gemini', 'https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent', 'https://generativelanguage.googleapis.com/v1beta/models', 'bearer', 'gemini-2.0-flash', 'false', 'gemini', '')
ON CONFLICT (name) DO NOTHING;

INSERT INTO providers (name, url, models_url, auth_type, default_model, free_heuristic, type, api_key) VALUES
    ('groq', 'https://api.groq.com/openai/v1/chat/completions', 'https://api.groq.com/openai/v1/models', 'bearer', 'llama-3.3-70b-versatile', 'false', 'openai', '')
ON CONFLICT (name) DO NOTHING;

INSERT INTO providers (name, url, models_url, auth_type, default_model, free_heuristic, type, api_key) VALUES
    ('deepseek', 'https://api.deepseek.com/chat/completions', 'https://api.deepseek.com/models', 'bearer', 'deepseek-chat', 'false', 'openai', '')
ON CONFLICT (name) DO NOTHING;

INSERT INTO providers (name, url, models_url, auth_type, default_model, free_heuristic, type, api_key) VALUES
    ('mistral', 'https://api.mistral.ai/v1/chat/completions', 'https://api.mistral.ai/v1/models', 'bearer', 'mistral-small-latest', 'false', 'openai', '')
ON CONFLICT (name) DO NOTHING;

INSERT INTO providers (name, url, models_url, auth_type, default_model, free_heuristic, type, api_key) VALUES
    ('together', 'https://api.together.xyz/v1/chat/completions', 'https://api.together.xyz/v1/models', 'bearer', 'meta-llama/Llama-3.3-70B-Instruct-Turbo', 'false', 'openai', '')
ON CONFLICT (name) DO NOTHING;

-- ── Seed demo user ─────────────────────────────────────
-- Password: 12345678 (PBKDF2-HMAC-SHA256 hash)
-- NOTE: The app will overwrite this hash on first run.
-- This is just a placeholder so you can inspect the table.
