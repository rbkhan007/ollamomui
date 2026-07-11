"""
Memory System — PostgreSQL
Copyright (c) 2024-2026 Rhasan@dev. All rights reserved.

Auto-saves conversation history, facts, and summaries.
Provides searchable memory for RAG context enrichment.
"""
import time
import uuid
import threading
import logging
from typing import List, Dict, Optional
from collections import deque

from db import get_cursor, get_conn

log = logging.getLogger("ollama-emu.memory")

FLUSH_INTERVAL = 0.2


class MemorySystem:
    def __init__(self):
        self._buffer: deque = deque()
        self._lock = threading.Lock()
        self._running = True
        self._flusher = threading.Thread(target=self._flush_loop, daemon=True)
        self._flusher.start()
        log.info("Memory system initialized (PostgreSQL). Auto-flush every %.1fs.", FLUSH_INTERVAL)

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
            with get_cursor() as cur:
                psycopg2_extras = __import__("psycopg2.extras", fromlist=["execute_values"])
                from psycopg2.extras import execute_values
                execute_values(
                    cur,
                    "INSERT INTO memory_messages (id, role, content, model, provider, session_id, tokens, created_at) VALUES %s ON CONFLICT (id) DO NOTHING",
                    batch,
                    template="(%s, %s, %s, %s, %s, %s, %s, %s::timestamptz)",
                )
            log.debug("Flushed %d messages to PostgreSQL", len(batch))
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
            with get_cursor() as cur:
                cur.execute("SELECT id FROM memory_sessions WHERE id=%s", (session_id,))
                if not cur.fetchone():
                    cur.execute(
                        "INSERT INTO memory_sessions (id, name, model, provider) VALUES (%s,%s,%s,%s)",
                        (session_id, session_id, model, provider),
                    )
                else:
                    cur.execute(
                        "UPDATE memory_sessions SET message_count = message_count + 1, updated_at = NOW() WHERE id = %s",
                        (session_id,),
                    )
        except Exception:
            pass

    def get_messages(self, session_id: str = None, limit: int = 100, offset: int = 0) -> List[dict]:
        self._flush()
        with get_cursor(commit=False) as cur:
            if session_id:
                cur.execute(
                    "SELECT id, role, content, model, provider, session_id, tokens, created_at FROM memory_messages WHERE session_id=%s ORDER BY created_at DESC LIMIT %s OFFSET %s",
                    (session_id, limit, offset),
                )
            else:
                cur.execute(
                    "SELECT id, role, content, model, provider, session_id, tokens, created_at FROM memory_messages ORDER BY created_at DESC LIMIT %s OFFSET %s",
                    (limit, offset),
                )
            rows = cur.fetchall()
        return [
            {
                "id": r["id"], "role": r["role"], "content": r["content"],
                "model": r["model"], "provider": r["provider"],
                "session_id": r["session_id"], "tokens": r["tokens"],
                "created_at": str(r["created_at"]),
            }
            for r in reversed(rows)
        ]

    def search(self, query: str, limit: int = 20, session_id: str = None) -> List[dict]:
        self._flush()
        terms = [t for t in query.lower().split() if len(t) > 1]
        if not terms:
            return []
        with get_cursor(commit=False) as cur:
            conditions = " AND ".join(["content ILIKE %s"] * len(terms))
            params = [f"%{t}%" for t in terms]
            if session_id:
                conditions += " AND session_id = %s"
                params.append(session_id)
            params.append(limit)
            cur.execute(
                f"SELECT id, role, content, model, provider, session_id, tokens, created_at FROM memory_messages WHERE {conditions} ORDER BY created_at DESC LIMIT %s",
                params,
            )
            rows = cur.fetchall()
        return [
            {
                "id": r["id"], "role": r["role"], "content": r["content"],
                "model": r["model"], "provider": r["provider"],
                "session_id": r["session_id"], "tokens": r["tokens"],
                "created_at": str(r["created_at"]),
            }
            for r in reversed(rows)
        ]

    def add_fact(self, fact: str, source: str = "", importance: str = "normal", session_id: str = "default"):
        fid = f"fact_{uuid.uuid4().hex[:12]}"
        with get_cursor() as cur:
            cur.execute(
                "INSERT INTO memory_facts (id, fact, source, importance, session_id) VALUES (%s,%s,%s,%s,%s)",
                (fid, fact, source, importance, session_id),
            )
        return fid

    def get_facts(self, session_id: str = None, limit: int = 50) -> List[dict]:
        with get_cursor(commit=False) as cur:
            if session_id:
                cur.execute(
                    "SELECT id, fact, source, importance, session_id, created_at FROM memory_facts WHERE session_id=%s ORDER BY created_at DESC LIMIT %s",
                    (session_id, limit),
                )
            else:
                cur.execute(
                    "SELECT id, fact, source, importance, session_id, created_at FROM memory_facts ORDER BY created_at DESC LIMIT %s",
                    (limit,),
                )
            rows = cur.fetchall()
        return [
            {
                "id": r["id"], "fact": r["fact"], "source": r["source"],
                "importance": r["importance"], "session_id": r["session_id"],
                "created_at": str(r["created_at"]),
            }
            for r in rows
        ]

    def delete_fact(self, fact_id: str) -> bool:
        with get_cursor() as cur:
            cur.execute("DELETE FROM memory_facts WHERE id=%s", (fact_id,))
            return cur.rowcount > 0

    def get_sessions(self) -> List[dict]:
        self._flush()
        with get_cursor(commit=False) as cur:
            cur.execute("SELECT id, name, model, provider, message_count, created_at, updated_at FROM memory_sessions ORDER BY updated_at DESC")
            rows = cur.fetchall()
        return [
            {
                "id": r["id"], "name": r["name"], "model": r["model"],
                "provider": r["provider"], "message_count": r["message_count"],
                "created_at": str(r["created_at"]), "updated_at": str(r["updated_at"]),
            }
            for r in rows
        ]

    def stats(self) -> dict:
        self._flush()
        with get_cursor(commit=False) as cur:
            cur.execute("SELECT COUNT(*) FROM memory_messages")
            messages = cur.fetchone()["count"]
            cur.execute("SELECT COUNT(*) FROM memory_facts")
            facts = cur.fetchone()["count"]
            cur.execute("SELECT COUNT(*) FROM memory_sessions")
            sessions = cur.fetchone()["count"]
        return {"messages": messages, "facts": facts, "sessions": sessions, "buffered": len(self._buffer)}

    def clear(self, session_id: str = None):
        self._flush()
        with get_cursor() as cur:
            if session_id:
                cur.execute("DELETE FROM memory_messages WHERE session_id=%s", (session_id,))
                cur.execute("DELETE FROM memory_facts WHERE session_id=%s", (session_id,))
                cur.execute("DELETE FROM memory_sessions WHERE id=%s", (session_id,))
            else:
                cur.execute("DELETE FROM memory_messages")
                cur.execute("DELETE FROM memory_facts")
                cur.execute("DELETE FROM memory_summaries")
                cur.execute("DELETE FROM memory_sessions")
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
