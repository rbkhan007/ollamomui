"""
Local Memory System for Ollama Emulator Desktop
Copyright (c) 2024-2026 Rhasan@dev. All rights reserved.

Auto-saves conversation history, facts, and summaries to SQLite every 0.2s.
Provides searchable memory for RAG context enrichment.
"""
import os
import json
import time
import uuid
import sqlite3
import threading
import logging
from typing import List, Dict, Optional
from collections import deque

log = logging.getLogger("ollama-emu.memory")

MEMORY_DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "memory.db")
FLUSH_INTERVAL = 0.2

class MemorySystem:
    def __init__(self, db_path: str = MEMORY_DB_PATH):
        self.db_path = db_path
        self._buffer: deque = deque()
        self._lock = threading.Lock()
        self._running = True
        self._init_db()
        self._flusher = threading.Thread(target=self._flush_loop, daemon=True)
        self._flusher.start()
        log.info("Memory system initialized. Auto-flush every %.1fs.", FLUSH_INTERVAL)

    def _conn(self):
        c = sqlite3.connect(self.db_path)
        c.execute("PRAGMA journal_mode=WAL")
        return c

    def _init_db(self):
        conn = self._conn()
        conn.executescript("""
            CREATE TABLE IF NOT EXISTS memory_messages (
                id TEXT PRIMARY KEY,
                role TEXT NOT NULL,
                content TEXT NOT NULL,
                model TEXT DEFAULT '',
                provider TEXT DEFAULT '',
                session_id TEXT DEFAULT 'default',
                tokens INTEGER DEFAULT 0,
                created_at TEXT DEFAULT (datetime('now','subsec')),
                flushed INTEGER DEFAULT 0
            );
            CREATE INDEX IF NOT EXISTS idx_mem_session ON memory_messages(session_id);
            CREATE INDEX IF NOT EXISTS idx_mem_created ON memory_messages(created_at);

            CREATE TABLE IF NOT EXISTS memory_facts (
                id TEXT PRIMARY KEY,
                fact TEXT NOT NULL,
                source TEXT DEFAULT '',
                importance TEXT DEFAULT 'normal',
                session_id TEXT DEFAULT 'default',
                created_at TEXT DEFAULT (datetime('now','subsec'))
            );

            CREATE TABLE IF NOT EXISTS memory_summaries (
                id TEXT PRIMARY KEY,
                session_id TEXT NOT NULL,
                summary TEXT NOT NULL,
                message_count INTEGER DEFAULT 0,
                created_at TEXT DEFAULT (datetime('now','subsec'))
            );

            CREATE TABLE IF NOT EXISTS memory_sessions (
                id TEXT PRIMARY KEY,
                name TEXT DEFAULT '',
                model TEXT DEFAULT '',
                provider TEXT DEFAULT '',
                message_count INTEGER DEFAULT 0,
                created_at TEXT DEFAULT (datetime('now','subsec')),
                updated_at TEXT DEFAULT (datetime('now','subsec'))
            );
        """)
        conn.commit()
        conn.close()

    def _flush_loop(self):
        while self._running:
            time.sleep(FLUSH_INTERVAL)
            self._flush()

    def _flush(self):
        if not self._buffer:
            return
        with self._lock:
            batch = list(self._buffer)
            self._buffer.clear()
        if not batch:
            return
        try:
            conn = self._conn()
            conn.executemany(
                "INSERT OR IGNORE INTO memory_messages (id, role, content, model, provider, session_id, tokens, created_at) VALUES (?,?,?,?,?,?,?,?)",
                batch
            )
            conn.commit()
            conn.close()
            log.debug("Flushed %d messages to memory.db", len(batch))
        except Exception as e:
            log.error("Memory flush error: %s", e)
            with self._lock:
                self._buffer.extendleft(batch)

    def add(self, role: str, content: str, model: str = "", provider: str = "", session_id: str = "default", tokens: int = 0):
        if not content or not content.strip():
            return
        mid = f"mem_{uuid.uuid4().hex[:12]}"
        ts = time.strftime("%Y-%m-%d %H:%M:%S") + f".{int(time.time()*1000)%1000:03d}"
        with self._lock:
            self._buffer.append((mid, role, content[:10000], model, provider, session_id, tokens, ts))
        self._ensure_session(session_id, model, provider)

    def _ensure_session(self, session_id: str, model: str, provider: str):
        try:
            conn = self._conn()
            existing = conn.execute("SELECT id FROM memory_sessions WHERE id=?", (session_id,)).fetchone()
            if not existing:
                conn.execute("INSERT INTO memory_sessions (id, name, model, provider) VALUES (?,?,?,?)",
                              (session_id, session_id, model, provider))
            else:
                conn.execute("UPDATE memory_sessions SET message_count=message_count+1, updated_at=datetime('now','subsec') WHERE id=?", (session_id,))
            conn.commit()
            conn.close()
        except Exception:
            pass

    def get_messages(self, session_id: str = None, limit: int = 100, offset: int = 0) -> List[dict]:
        self._flush()
        conn = self._conn()
        if session_id:
            rows = conn.execute(
                "SELECT id, role, content, model, provider, session_id, tokens, created_at FROM memory_messages WHERE session_id=? ORDER BY created_at DESC LIMIT ? OFFSET ?",
                (session_id, limit, offset)
            ).fetchall()
        else:
            rows = conn.execute(
                "SELECT id, role, content, model, provider, session_id, tokens, created_at FROM memory_messages ORDER BY created_at DESC LIMIT ? OFFSET ?",
                (limit, offset)
            ).fetchall()
        conn.close()
        return [{"id": r[0], "role": r[1], "content": r[2], "model": r[3], "provider": r[4], "session_id": r[5], "tokens": r[6], "created_at": r[7]} for r in reversed(rows)]

    def search(self, query: str, limit: int = 20, session_id: str = None) -> List[dict]:
        self._flush()
        conn = self._conn()
        terms = [t for t in query.lower().split() if len(t) > 1]
        if not terms:
            conn.close()
            return []
        conditions = " AND ".join(["content LIKE ?"] * len(terms))
        params = [f"%{t}%" for t in terms]
        if session_id:
            conditions += " AND session_id=?"
            params.append(session_id)
        params.append(limit)
        rows = conn.execute(
            f"SELECT id, role, content, model, provider, session_id, tokens, created_at FROM memory_messages WHERE {conditions} ORDER BY created_at DESC LIMIT ?",
            params
        ).fetchall()
        conn.close()
        return [{"id": r[0], "role": r[1], "content": r[2], "model": r[3], "provider": r[4], "session_id": r[5], "tokens": r[6], "created_at": r[7]} for r in reversed(rows)]

    def add_fact(self, fact: str, source: str = "", importance: str = "normal", session_id: str = "default"):
        fid = f"fact_{uuid.uuid4().hex[:12]}"
        conn = self._conn()
        conn.execute("INSERT INTO memory_facts (id, fact, source, importance, session_id) VALUES (?,?,?,?,?)",
                      (fid, fact, source, importance, session_id))
        conn.commit()
        conn.close()
        return fid

    def get_facts(self, session_id: str = None, limit: int = 50) -> List[dict]:
        conn = self._conn()
        if session_id:
            rows = conn.execute("SELECT id, fact, source, importance, session_id, created_at FROM memory_facts WHERE session_id=? ORDER BY created_at DESC LIMIT ?", (session_id, limit)).fetchall()
        else:
            rows = conn.execute("SELECT id, fact, source, importance, session_id, created_at FROM memory_facts ORDER BY created_at DESC LIMIT ?", (limit,)).fetchall()
        conn.close()
        return [{"id": r[0], "fact": r[1], "source": r[2], "importance": r[3], "session_id": r[4], "created_at": r[5]} for r in rows]

    def delete_fact(self, fact_id: str) -> bool:
        conn = self._conn()
        cur = conn.execute("DELETE FROM memory_facts WHERE id=?", (fact_id,))
        conn.commit()
        deleted = cur.rowcount > 0
        conn.close()
        return deleted

    def get_sessions(self) -> List[dict]:
        self._flush()
        conn = self._conn()
        rows = conn.execute("SELECT id, name, model, provider, message_count, created_at, updated_at FROM memory_sessions ORDER BY updated_at DESC").fetchall()
        conn.close()
        return [{"id": r[0], "name": r[1], "model": r[2], "provider": r[3], "message_count": r[4], "created_at": r[5], "updated_at": r[6]} for r in rows]

    def stats(self) -> dict:
        self._flush()
        conn = self._conn()
        messages = conn.execute("SELECT COUNT(*) FROM memory_messages").fetchone()[0]
        facts = conn.execute("SELECT COUNT(*) FROM memory_facts").fetchone()[0]
        sessions = conn.execute("SELECT COUNT(*) FROM memory_sessions").fetchone()[0]
        buffered = len(self._buffer)
        conn.close()
        return {"messages": messages, "facts": facts, "sessions": sessions, "buffered": buffered}

    def clear(self, session_id: str = None):
        self._flush()
        conn = self._conn()
        if session_id:
            conn.execute("DELETE FROM memory_messages WHERE session_id=?", (session_id,))
            conn.execute("DELETE FROM memory_facts WHERE session_id=?", (session_id,))
            conn.execute("DELETE FROM memory_sessions WHERE id=?", (session_id,))
        else:
            conn.executescript("DELETE FROM memory_messages; DELETE FROM memory_facts; DELETE FROM memory_summaries; DELETE FROM memory_sessions;")
        conn.commit()
        conn.close()
        log.info("Memory cleared (session=%s)", session_id or "ALL")

    def build_context(self, query: str = "", max_tokens: int = 2000, session_id: str = None) -> str:
        parts = []
        total = 0

        facts = self.get_facts(session_id=session_id, limit=10)
        if facts:
            fact_text = "Known facts from previous conversations:\n" + "\n".join(f"- {f['fact']}" for f in facts)
            parts.append(fact_text)
            total += len(fact_text.split()) * 1.3

        if query and total < max_tokens:
            msgs = self.search(query, limit=10, session_id=session_id)
            if msgs:
                conv_lines = []
                for m in msgs:
                    prefix = "User" if m["role"] == "user" else "Assistant"
                    conv_lines.append(f"{prefix}: {m['content'][:300]}")
                conv_text = "Relevant conversation history:\n" + "\n".join(conv_lines)
                parts.append(conv_text)
                total += len(conv_text.split()) * 1.3

        if not parts:
            return ""
        header = "The following is from the user's local conversation memory. Use it for context if relevant.\n\n"
        result = header + "\n\n".join(parts)
        est_tokens = len(result.split()) * 1.3
        if est_tokens > max_tokens:
            result = result[:int(max_tokens * 2.5)]
        return result

    def shutdown(self):
        self._running = False
        self._flush()
