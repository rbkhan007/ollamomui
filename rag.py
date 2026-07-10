"""
RAG (Retrieval-Augmented Generation) Engine for Ollama Emulator Desktop
Copyright (c) 2024-2026 Rhasan@dev. All rights reserved.

Zero-extra-dependency RAG: SQLite FTS5 for text search + TF-IDF vectors for similarity.
"""
import os
import re
import math
import json
import uuid
import sqlite3
import hashlib
import logging
from typing import List, Dict, Optional, Tuple
from collections import Counter

import numpy as np

log = logging.getLogger("ollama-emu.rag")

RAG_DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "rag.db")

# ============================================================
# TEXT PROCESSING
# ============================================================
STOP_WORDS = frozenset(
    "a an the is are was were be been being have has had do does did will would shall should "
    "can could may might must am i me my we us our you your he him his she her it its they them "
    "their this that these those of in on at to for with by from as into through during before "
    "after above below between out off over under again further then once here there when where "
    "why how all any both each few more most other some such no not only own same so than too "
    "very just don now d ll m o re ve y ain aren couldn didn doesn hadn hasn haven isn ma "
    "mightn mustn needn shan shouldn wasn weren won wouldn".split()
)

def tokenize(text: str) -> List[str]:
    text = text.lower()
    text = re.sub(r"[^a-z0-9\s]", " ", text)
    tokens = text.split()
    return [t for t in tokens if len(t) > 1 and t not in STOP_WORDS]

def chunk_text(text: str, chunk_size: int = 512, overlap: int = 64) -> List[str]:
    paragraphs = [p.strip() for p in re.split(r"\n{2,}", text) if p.strip()]
    chunks = []
    current = ""
    for para in paragraphs:
        if len(current) + len(para) > chunk_size and current:
            chunks.append(current.strip())
            words = current.split()
            overlap_text = " ".join(words[-overlap:]) if overlap else ""
            current = overlap_text + "\n\n" + para
        else:
            current = (current + "\n\n" + para).strip() if current else para
        while len(current) > chunk_size:
            words = current.split()
            mid = len(words) // 2
            chunks.append(" ".join(words[:mid + overlap]))
            current = " ".join(words[mid - overlap:])
    if current.strip():
        chunks.append(current.strip())
    return chunks if chunks else [text[:chunk_size]]

def read_file_content(file_path: str) -> str:
    ext = os.path.splitext(file_path)[1].lower()
    if ext in (".txt", ".md", ".csv", ".json", ".py", ".js", ".ts", ".java", ".c", ".cpp", ".h", ".cs", ".go", ".rs", ".rb", ".php", ".sql", ".html", ".css", ".yaml", ".yml", ".toml", ".ini", ".cfg", ".conf", ".log", ".sh", ".bat", ".ps1"):
        with open(file_path, "r", encoding="utf-8", errors="replace") as f:
            return f.read()
    elif ext == ".json":
        with open(file_path, "r", encoding="utf-8", errors="replace") as f:
            data = json.load(f)
            return json.dumps(data, indent=2)
    return ""

def compute_tf_idf(corpus_tokens: List[List[str]]) -> Tuple[Dict[str, float], List[Dict[str, float]]]:
    doc_count = len(corpus_tokens)
    df = Counter()
    for tokens in corpus_tokens:
        df.update(set(tokens))
    idf = {}
    for term, freq in df.items():
        idf[term] = math.log((doc_count + 1) / (freq + 1)) + 1
    tfidf_vectors = []
    vocab = sorted(set(t for tokens in corpus_tokens for t in tokens))
    term_idx = {t: i for i, t in enumerate(vocab)}
    for tokens in corpus_tokens:
        tf = Counter(tokens)
        max_tf = max(tf.values()) if tf else 1
        vec = np.zeros(len(vocab), dtype=np.float32)
        for term, count in tf.items():
            if term in term_idx:
                tf_val = 0.5 + 0.5 * (count / max_tf)
                vec[term_idx[term]] = tf_val * idf.get(term, 1.0)
        norm = np.linalg.norm(vec)
        if norm > 0:
            vec /= norm
        tfidf_vectors.append(vec)
    return {"vocab": vocab, "idf": idf}, tfidf_vectors

def cosine_similarity(a: np.ndarray, b: np.ndarray) -> float:
    dot = np.dot(a, b)
    na, nb = np.linalg.norm(a), np.linalg.norm(b)
    if na == 0 or nb == 0:
        return 0.0
    return float(dot / (na * nb))

# ============================================================
# RAG ENGINE
# ============================================================
class RAGEngine:
    def __init__(self, db_path: str = RAG_DB_PATH):
        self.db_path = db_path
        self._init_db()
        self._rebuild_index()
        log.info("RAG engine initialized. %d documents, %d chunks indexed.",
                 self.stats()["documents"], self.stats()["chunks"])

    def _conn(self):
        return sqlite3.connect(self.db_path)

    def _init_db(self):
        conn = self._conn()
        conn.executescript("""
            CREATE TABLE IF NOT EXISTS rag_documents (
                id TEXT PRIMARY KEY,
                filename TEXT NOT NULL,
                file_hash TEXT NOT NULL,
                chunk_count INTEGER DEFAULT 0,
                collection TEXT DEFAULT 'default',
                metadata TEXT DEFAULT '{}',
                created_at TEXT DEFAULT (datetime('now'))
            );
            CREATE TABLE IF NOT EXISTS rag_chunks (
                id TEXT PRIMARY KEY,
                doc_id TEXT NOT NULL,
                chunk_index INTEGER NOT NULL,
                content TEXT NOT NULL,
                tokens TEXT NOT NULL,
                tfidf BLOB,
                FOREIGN KEY (doc_id) REFERENCES rag_documents(id) ON DELETE CASCADE
            );
            CREATE INDEX IF NOT EXISTS idx_chunks_doc ON rag_chunks(doc_id);
        """)
        try:
            conn.execute("CREATE VIRTUAL TABLE IF NOT EXISTS rag_fts USING fts5(doc_id, content, tokenize='porter unicode61')")
        except sqlite3.OperationalError:
            pass
        conn.commit()
        conn.close()

    def _rebuild_index(self):
        conn = self._conn()
        rows = conn.execute("SELECT id, content FROM rag_chunks ORDER BY doc_id, chunk_index").fetchall()
        conn.close()
        if not rows:
            self._tfidf_index = None
            self._tfidf_vocab = None
            self._chunk_ids = []
            return
        self._chunk_ids = [r[0] for r in rows]
        corpus_tokens = [tokenize(r[1]) for r in rows]
        index, vectors = compute_tf_idf(corpus_tokens)
        self._tfidf_index = np.array(vectors, dtype=np.float32) if vectors else np.zeros((0, 0), dtype=np.float32)
        self._tfidf_vocab = index

    def add_document(self, file_path: str, collection: str = "default", metadata: dict = None) -> dict:
        filename = os.path.basename(file_path)
        content = read_file_content(file_path)
        if not content.strip():
            return {"error": f"Could not read or empty file: {filename}"}
        file_hash = hashlib.md5(content.encode()).hexdigest()
        conn = self._conn()
        existing = conn.execute("SELECT id FROM rag_documents WHERE file_hash=?", (file_hash,)).fetchone()
        if existing:
            conn.close()
            return {"warning": f"Document already indexed: {filename}", "doc_id": existing[0]}
        doc_id = str(uuid.uuid4())[:12]
        chunks = chunk_text(chunk_size=512, overlap=64, text=content)
        conn.execute("INSERT INTO rag_documents (id, filename, file_hash, chunk_count, collection, metadata) VALUES (?,?,?,?,?,?)",
                      (doc_id, filename, file_hash, len(chunks), collection, json.dumps(metadata or {})))
        tokens_list = []
        for i, chunk in enumerate(chunks):
            chunk_id = f"{doc_id}_{i:04d}"
            tokens = tokenize(chunk)
            tokens_list.append(tokens)
            conn.execute("INSERT INTO rag_chunks (id, doc_id, chunk_index, content, tokens) VALUES (?,?,?,?,?)",
                          (chunk_id, doc_id, i, chunk, json.dumps(tokens)))
            try:
                conn.execute("INSERT INTO rag_fts (doc_id, content) VALUES (?,?)", (doc_id, chunk))
            except sqlite3.OperationalError:
                pass
        conn.commit()
        conn.close()
        self._rebuild_index()
        log.info("Indexed document '%s' → %d chunks (collection: %s)", filename, len(chunks), collection)
        return {"doc_id": doc_id, "filename": filename, "chunks": len(chunks), "collection": collection}

    def add_text(self, text: str, name: str = "text", collection: str = "default", metadata: dict = None) -> dict:
        tmp_path = os.path.join(os.path.dirname(self.db_path), f"_tmp_{uuid.uuid4().hex[:8]}.txt")
        with open(tmp_path, "w", encoding="utf-8") as f:
            f.write(text)
        try:
            result = self.add_document(tmp_path, collection, metadata)
            if "filename" in result:
                result["filename"] = name
        finally:
            try:
                os.remove(tmp_path)
            except OSError:
                pass
        return result

    def search(self, query: str, top_k: int = 5, collection: str = None, min_score: float = 0.0) -> List[dict]:
        results = []
        query_tokens = tokenize(query)
        if not query_tokens:
            return results
        conn = self._conn()
        fts_results = {}
        try:
            fts_query = " OR ".join(query_tokens[:20])
            rows = conn.execute("SELECT doc_id, content FROM rag_fts WHERE rag_fts MATCH ? LIMIT 50", (fts_query,)).fetchall()
            for doc_id, content in rows:
                fts_results[content[:100]] = doc_id
        except sqlite3.OperationalError:
            pass
        if self._tfidf_index is not None and len(self._tfidf_index) > 0 and self._tfidf_vocab:
            vocab = self._tfidf_vocab["vocab"]
            idf = self._tfidf_vocab["idf"]
            term_idx = {t: i for i, t in enumerate(vocab)}
            q_vec = np.zeros(len(vocab), dtype=np.float32)
            q_tf = Counter(query_tokens)
            q_max_tf = max(q_tf.values()) if q_tf else 1
            for term, count in q_tf.items():
                if term in term_idx:
                    tf_val = 0.5 + 0.5 * (count / q_max_tf)
                    q_vec[term_idx[term]] = tf_val * idf.get(term, 1.0)
            q_norm = np.linalg.norm(q_vec)
            if q_norm > 0:
                q_vec /= q_norm
            scores = np.dot(self._tfidf_index, q_vec)
            top_indices = np.argsort(scores)[::-1][:top_k * 3]
            for idx in top_indices:
                score = float(scores[idx])
                if score < min_score:
                    break
                chunk_id = self._chunk_ids[idx]
                chunk_row = conn.execute(
                    "SELECT c.id, c.content, c.chunk_index, c.doc_id, d.filename, d.collection "
                    "FROM rag_chunks c JOIN rag_documents d ON c.doc_id = d.id WHERE c.id = ?", (chunk_id,)
                ).fetchone()
                if chunk_row and (collection is None or chunk_row[5] == collection):
                    results.append({
                        "chunk_id": chunk_row[0],
                        "content": chunk_row[1],
                        "chunk_index": chunk_row[2],
                        "doc_id": chunk_row[3],
                        "filename": chunk_row[4],
                        "collection": chunk_row[5],
                        "score": round(score, 4),
                        "source": f"{chunk_row[4]}#chunk{chunk_row[2]}"
                    })
        if not results:
            for content_snippet, doc_id in fts_results.items():
                chunk_row = conn.execute(
                    "SELECT c.id, c.content, c.chunk_index, c.doc_id, d.filename, d.collection "
                    "FROM rag_chunks c JOIN rag_documents d ON c.doc_id = d.id WHERE c.doc_id = ? AND c.content LIKE ? LIMIT ?",
                    (doc_id, f"%{content_snippet[:50]}%", top_k)
                ).fetchall()
                for row in chunk_row:
                    if not any(r["chunk_id"] == row[0] for r in results):
                        results.append({
                            "chunk_id": row[0], "content": row[1], "chunk_index": row[2],
                            "doc_id": row[3], "filename": row[4], "collection": row[5],
                            "score": 0.5, "source": f"{row[4]}#chunk{row[2]}"
                        })
        conn.close()
        results.sort(key=lambda x: x["score"], reverse=True)
        return results[:top_k]

    def build_context(self, query: str, max_tokens: int = 3000, top_k: int = 5, collection: str = None) -> str:
        results = self.search(query, top_k=top_k, collection=collection)
        if not results:
            return ""
        context_parts = []
        total_len = 0
        for r in results:
            text = f"[Source: {r['source']}]\n{r['content']}"
            est_tokens = len(text.split()) * 1.3
            if total_len + est_tokens > max_tokens:
                break
            context_parts.append(text)
            total_len += est_tokens
        if not context_parts:
            return ""
        return (
            "The following context was retrieved from the user's documents to help answer the question. "
            "Use it if relevant, otherwise answer from your own knowledge.\n\n"
            "--- Retrieved Context ---\n"
            + "\n\n---\n\n".join(context_parts)
            + "\n--- End Context ---\n\n"
        )

    def delete_document(self, doc_id: str) -> dict:
        conn = self._conn()
        doc = conn.execute("SELECT filename FROM rag_documents WHERE id=?", (doc_id,)).fetchone()
        if not doc:
            conn.close()
            return {"error": "Document not found"}
        conn.execute("DELETE FROM rag_chunks WHERE doc_id=?", (doc_id,))
        try:
            conn.execute("DELETE FROM rag_fts WHERE doc_id=?", (doc_id,))
        except sqlite3.OperationalError:
            pass
        conn.execute("DELETE FROM rag_documents WHERE id=?", (doc_id,))
        conn.commit()
        conn.close()
        self._rebuild_index()
        log.info("Deleted document '%s' (id=%s)", doc[0], doc_id)
        return {"deleted": doc[0], "doc_id": doc_id}

    def list_documents(self, collection: str = None) -> List[dict]:
        conn = self._conn()
        if collection:
            rows = conn.execute(
                "SELECT id, filename, chunk_count, collection, metadata, created_at FROM rag_documents WHERE collection=? ORDER BY created_at DESC",
                (collection,)
            ).fetchall()
        else:
            rows = conn.execute(
                "SELECT id, filename, chunk_count, collection, metadata, created_at FROM rag_documents ORDER BY created_at DESC"
            ).fetchall()
        conn.close()
        return [{"id": r[0], "filename": r[1], "chunks": r[2], "collection": r[3], "metadata": json.loads(r[4] or "{}"), "created_at": r[5]} for r in rows]

    def list_collections(self) -> List[dict]:
        conn = self._conn()
        rows = conn.execute(
            "SELECT collection, COUNT(*) as doc_count, SUM(chunk_count) as total_chunks FROM rag_documents GROUP BY collection"
        ).fetchall()
        conn.close()
        return [{"name": r[0], "documents": r[1], "chunks": r[2] or 0} for r in rows]

    def stats(self) -> dict:
        conn = self._conn()
        docs = conn.execute("SELECT COUNT(*) FROM rag_documents").fetchone()[0]
        chunks = conn.execute("SELECT COUNT(*) FROM rag_chunks").fetchone()[0]
        collections = conn.execute("SELECT COUNT(DISTINCT collection) FROM rag_documents").fetchone()[0]
        conn.close()
        return {"documents": docs, "chunks": chunks, "collections": collections, "indexed": self._tfidf_index is not None and len(self._chunk_ids) > 0}

    def clear(self, collection: str = None) -> dict:
        conn = self._conn()
        if collection:
            doc_ids = [r[0] for r in conn.execute("SELECT id FROM rag_documents WHERE collection=?", (collection,)).fetchall()]
            for did in doc_ids:
                conn.execute("DELETE FROM rag_chunks WHERE doc_id=?", (did,))
                try:
                    conn.execute("DELETE FROM rag_fts WHERE doc_id=?", (did,))
                except sqlite3.OperationalError:
                    pass
            conn.execute("DELETE FROM rag_documents WHERE collection=?", (collection,))
        else:
            conn.executescript("DELETE FROM rag_chunks; DELETE FROM rag_documents;")
            try:
                conn.execute("DELETE FROM rag_fts")
            except sqlite3.OperationalError:
                pass
        conn.commit()
        conn.close()
        self._rebuild_index()
        log.info("Cleared RAG index (collection=%s)", collection or "ALL")
        return {"cleared": True, "collection": collection or "all"}
