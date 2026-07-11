"""
RAG (Retrieval-Augmented Generation) Engine — PostgreSQL + pgvector
Copyright (c) 2024-2026 Rhasan@dev. All rights reserved.

Uses PostgreSQL full-text search + pgvector cosine similarity for retrieval.
Replaces the old SQLite FTS5 + in-memory TF-IDF approach.
"""
import os
import re
import json
import uuid
import hashlib
import logging
from typing import List, Dict, Optional

import numpy as np

from db import get_cursor, get_conn

log = logging.getLogger("ollama-emu.rag")

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

DIMENSION = 384


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
    text_exts = {
        ".txt", ".md", ".csv", ".json", ".py", ".js", ".ts", ".java", ".c",
        ".cpp", ".h", ".cs", ".go", ".rs", ".rb", ".php", ".sql", ".html",
        ".css", ".yaml", ".yml", ".toml", ".ini", ".cfg", ".conf", ".log",
        ".sh", ".bat", ".ps1",
    }
    if ext in text_exts:
        with open(file_path, "r", encoding="utf-8", errors="replace") as f:
            return f.read()
    return ""


def compute_tf_idf_embedding(tokens_list: List[List[str]]) -> np.ndarray:
    """Compute TF-IDF vectors and reduce to DIMENSION using PCA-like truncation."""
    from collections import Counter
    import math

    vocab_set = set()
    for tokens in tokens_list:
        vocab_set.update(tokens)
    vocab = sorted(vocab_set)
    term_idx = {t: i for i, t in enumerate(vocab)}

    doc_count = len(tokens_list)
    df = Counter()
    for tokens in tokens_list:
        df.update(set(tokens))
    idf = {}
    for term, freq in df.items():
        idf[term] = math.log((doc_count + 1) / (freq + 1)) + 1

    vectors = []
    for tokens in tokens_list:
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
        vectors.append(vec)

    if not vectors:
        return np.zeros((0, DIMENSION), dtype=np.float32)

    mat = np.array(vectors, dtype=np.float32)
    # Truncate or pad to DIMENSION
    if mat.shape[1] > DIMENSION:
        mat = mat[:, :DIMENSION]
    elif mat.shape[1] < DIMENSION:
        mat = np.pad(mat, ((0, 0), (0, DIMENSION - mat.shape[1])), mode="constant")
    return mat


# ============================================================
# RAG ENGINE
# ============================================================
class RAGEngine:
    def __init__(self):
        log.info("RAG engine initialized (PostgreSQL + pgvector). %d documents, %d chunks indexed.",
                 self.stats()["documents"], self.stats()["chunks"])

    def add_document(self, file_path: str, collection: str = "default", metadata: dict = None) -> dict:
        filename = os.path.basename(file_path)
        content = read_file_content(file_path)
        if not content.strip():
            return {"error": f"Could not read or empty file: {filename}"}
        file_hash = hashlib.md5(content.encode()).hexdigest()

        with get_cursor() as cur:
            cur.execute("SELECT id FROM rag_documents WHERE file_hash=%s", (file_hash,))
            existing = cur.fetchone()
            if existing:
                return {"warning": f"Document already indexed: {filename}", "doc_id": existing["id"]}

            doc_id = str(uuid.uuid4())[:12]
            chunks = chunk_text(chunk_size=512, overlap=64, text=content)
            cur.execute(
                "INSERT INTO rag_documents (id, filename, file_hash, chunk_count, collection, metadata) VALUES (%s,%s,%s,%s,%s,%s)",
                (doc_id, filename, file_hash, len(chunks), collection, json.dumps(metadata or {})),
            )

            # Insert chunks + FTS
            tokens_all = []
            for i, chunk in enumerate(chunks):
                chunk_id = f"{doc_id}_{i:04d}"
                tokens = tokenize(chunk)
                tokens_all.append(tokens)
                cur.execute(
                    "INSERT INTO rag_chunks (id, doc_id, chunk_index, content, tokens) VALUES (%s,%s,%s,%s,%s)",
                    (chunk_id, doc_id, i, chunk, json.dumps(tokens)),
                )
                # Full-text search entry
                cur.execute(
                    "INSERT INTO rag_fts (doc_id, content) VALUES (%s, to_tsvector('english', %s))",
                    (doc_id, chunk),
                )

            # Compute embeddings and store
            embeddings = compute_tf_idf_embedding(tokens_all)
            for i, chunk in enumerate(chunks):
                chunk_id = f"{doc_id}_{i:04d}"
                vec = embeddings[i].tolist() if i < len(embeddings) else [0.0] * DIMENSION
                cur.execute(
                    "UPDATE rag_chunks SET embedding = %s::vector WHERE id = %s",
                    (str(vec), chunk_id),
                )

        log.info("Indexed document '%s' → %d chunks (collection: %s)", filename, len(chunks), collection)
        return {"doc_id": doc_id, "filename": filename, "chunks": len(chunks), "collection": collection}

    def add_text(self, text: str, name: str = "text", collection: str = "default", metadata: dict = None) -> dict:
        tmp_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), f"_tmp_{uuid.uuid4().hex[:8]}.txt")
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

        # Build TF-IDF query vector
        q_embedding = compute_tf_idf_embedding([query_tokens])[0]
        q_vec_str = str(q_embedding.tolist())

        with get_cursor(commit=False) as cur:
            # pgvector cosine search
            collection_filter = ""
            params = [q_vec_str, top_k * 3]
            if collection:
                collection_filter = "AND d.collection = %s"
                params.append(collection)

            cur.execute(f"""
                SELECT c.id AS chunk_id, c.content, c.chunk_index, c.doc_id,
                       d.filename, d.collection,
                       1 - (c.embedding <=> %s::vector) AS score
                FROM rag_chunks c
                JOIN rag_documents d ON c.doc_id = d.id
                WHERE c.embedding IS NOT NULL {collection_filter}
                ORDER BY c.embedding <=> %s::vector
                LIMIT %s
            """, [q_vec_str] + params[1:] + [q_vec_str, params[1]] if collection else [q_vec_str, top_k * 3])

            for row in cur.fetchall():
                score = float(row["score"])
                if score < min_score:
                    break
                results.append({
                    "chunk_id": row["chunk_id"],
                    "content": row["content"],
                    "chunk_index": row["chunk_index"],
                    "doc_id": row["doc_id"],
                    "filename": row["filename"],
                    "collection": row["collection"],
                    "score": round(score, 4),
                    "source": f"{row['filename']}#chunk{row['chunk_index']}",
                })

            # Fallback to FTS if no vector results
            if not results:
                tsquery = " & ".join(query_tokens[:20])
                fts_params = [tsquery, top_k]
                if collection:
                    cur.execute("""
                        SELECT f.doc_id, f.content, c.id AS chunk_id, c.content, c.chunk_index,
                               d.filename, d.collection, ts_rank_cd(f.content, plainto_tsquery('english', %s)) AS rank
                        FROM rag_fts f
                        JOIN rag_chunks c ON f.doc_id = c.doc_id
                        JOIN rag_documents d ON c.doc_id = d.id
                        WHERE f.content @@ plainto_tsquery('english', %s) %s
                        ORDER BY rank DESC
                        LIMIT %s
                    """, (query, query, f"AND d.collection = '{collection}'" if collection else "", top_k))
                else:
                    cur.execute("""
                        SELECT f.doc_id, f.content, c.id AS chunk_id, c.content, c.chunk_index,
                               d.filename, d.collection, ts_rank_cd(f.content, plainto_tsquery('english', %s)) AS rank
                        FROM rag_fts f
                        JOIN rag_chunks c ON f.doc_id = c.doc_id
                        JOIN rag_documents d ON c.doc_id = d.id
                        WHERE f.content @@ plainto_tsquery('english', %s)
                        ORDER BY rank DESC
                        LIMIT %s
                    """, (query, query, top_k))

                for row in cur.fetchall():
                    if not any(r["chunk_id"] == row["chunk_id"] for r in results):
                        results.append({
                            "chunk_id": row["chunk_id"],
                            "content": row["content"],
                            "chunk_index": row["chunk_index"],
                            "doc_id": row["doc_id"],
                            "filename": row["filename"],
                            "collection": row["collection"],
                            "score": 0.5,
                            "source": f"{row['filename']}#chunk{row['chunk_index']}",
                        })

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
        with get_cursor() as cur:
            cur.execute("SELECT filename FROM rag_documents WHERE id=%s", (doc_id,))
            doc = cur.fetchone()
            if not doc:
                return {"error": "Document not found"}
            cur.execute("DELETE FROM rag_chunks WHERE doc_id=%s", (doc_id,))
            cur.execute("DELETE FROM rag_fts WHERE doc_id=%s", (doc_id,))
            cur.execute("DELETE FROM rag_documents WHERE id=%s", (doc_id,))
        log.info("Deleted document '%s' (id=%s)", doc["filename"], doc_id)
        return {"deleted": doc["filename"], "doc_id": doc_id}

    def list_documents(self, collection: str = None) -> List[dict]:
        with get_cursor(commit=False) as cur:
            if collection:
                cur.execute(
                    "SELECT id, filename, chunk_count, collection, metadata, created_at FROM rag_documents WHERE collection=%s ORDER BY created_at DESC",
                    (collection,),
                )
            else:
                cur.execute("SELECT id, filename, chunk_count, collection, metadata, created_at FROM rag_documents ORDER BY created_at DESC")
            rows = cur.fetchall()
        return [
            {
                "id": r["id"], "filename": r["filename"], "chunks": r["chunk_count"],
                "collection": r["collection"],
                "metadata": r["metadata"] if isinstance(r["metadata"], dict) else json.loads(r["metadata"] or "{}"),
                "created_at": str(r["created_at"]),
            }
            for r in rows
        ]

    def list_collections(self) -> List[dict]:
        with get_cursor(commit=False) as cur:
            cur.execute(
                "SELECT collection, COUNT(*) AS doc_count, SUM(chunk_count) AS total_chunks FROM rag_documents GROUP BY collection"
            )
            rows = cur.fetchall()
        return [{"name": r["collection"], "documents": r["doc_count"], "chunks": r["total_chunks"] or 0} for r in rows]

    def stats(self) -> dict:
        with get_cursor(commit=False) as cur:
            cur.execute("SELECT COUNT(*) FROM rag_documents")
            docs = cur.fetchone()["count"]
            cur.execute("SELECT COUNT(*) FROM rag_chunks")
            chunks = cur.fetchone()["count"]
            cur.execute("SELECT COUNT(DISTINCT collection) FROM rag_documents")
            collections = cur.fetchone()["count"]
        return {"documents": docs, "chunks": chunks, "collections": collections, "indexed": chunks > 0}

    def clear(self, collection: str = None) -> dict:
        with get_cursor() as cur:
            if collection:
                cur.execute("DELETE FROM rag_chunks WHERE doc_id IN (SELECT id FROM rag_documents WHERE collection=%s)", (collection,))
                cur.execute("DELETE FROM rag_fts WHERE doc_id IN (SELECT id FROM rag_documents WHERE collection=%s)", (collection,))
                cur.execute("DELETE FROM rag_documents WHERE collection=%s", (collection,))
            else:
                cur.execute("DELETE FROM rag_chunks")
                cur.execute("DELETE FROM rag_fts")
                cur.execute("DELETE FROM rag_documents")
        log.info("Cleared RAG index (collection=%s)", collection or "ALL")
        return {"cleared": True, "collection": collection or "all"}
