"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { apiJson, toast } from "@/lib/api";
import { PageIcon } from "@/components/Icons";

type Doc = { id: string; filename: string; chunks: number; collection: string };
type Stats = { documents: number; chunks: number; collections: number };
type Collection = { name: string; documents: number; chunks: number };
type SearchResult = { source: string; score: number; content: string };

export default function RagPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [docs, setDocs] = useState<Doc[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [activeCollection, setActiveCollection] = useState("default");
  const [textInput, setTextInput] = useState("");
  const [textName, setTextName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function load() {
    try {
      const [s, d, c] = await Promise.all([
        apiJson<Stats>("/api/rag/stats"),
        apiJson<Doc[]>("/api/rag/documents"),
        apiJson<Collection[]>("/api/rag/collections"),
      ]);
      setStats(s);
      setDocs(d);
      setCollections(c);
      if (c.length > 0 && !c.find(col => col.name === activeCollection)) {
        setActiveCollection(c[0].name);
      }
    } catch (e) {
      toast("Failed to load RAG data", true);
    }
  }

  useEffect(() => { if (!isAuthenticated) { router.push("/login"); return; } load(); }, [isAuthenticated, router]);

  async function uploadFile() {
    const file = fileRef.current?.files?.[0];
    if (!file) { toast("Select a file first", true); return; }
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("collection", activeCollection);
      const res = await fetch("/api/rag/upload", { method: "POST", body: form });
      if (!res.ok) throw new Error(await res.text());
      toast("File indexed successfully!");
      if (fileRef.current) fileRef.current.value = "";
      load();
    } catch (e: any) {
      toast("Error: " + e.message, true);
    } finally {
      setUploading(false);
    }
  }

  async function addText() {
    if (!textInput.trim()) { toast("Enter text content", true); return; }
    try {
      await apiJson("/api/rag/add-text", {
        method: "POST",
        body: JSON.stringify({ text: textInput, name: textName || undefined, collection: activeCollection }),
      });
      toast("Text indexed!");
      setTextInput("");
      setTextName("");
      load();
    } catch (e: any) {
      toast("Error: " + e.message, true);
    }
  }

  async function search() {
    if (!searchQuery.trim()) return;
    try {
      const results = await apiJson<SearchResult[]>("/api/rag/search", {
        method: "POST",
        body: JSON.stringify({ query: searchQuery, top_k: 5, collection: activeCollection }),
      });
      setSearchResults(results);
      if (results.length === 0) toast("No results found");
    } catch (e: any) {
      toast("Error: " + e.message, true);
    }
  }

  async function deleteDoc(id: string) {
    try {
      await apiJson(`/api/rag/documents/${id}`, { method: "DELETE" });
      toast("Document deleted");
      load();
    } catch (e: any) {
      toast("Error: " + e.message, true);
    }
  }

  async function clearAll() {
    if (!confirm("Clear all indexed documents? This cannot be undone.")) return;
    try {
      await apiJson("/api/rag/clear", { method: "POST", body: JSON.stringify({}) });
      toast("Knowledge base cleared");
      load();
    } catch (e: any) {
      toast("Error: " + e.message, true);
    }
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-header-icon" style={{ background: "rgba(253,121,168,0.1)" }}>
          <PageIcon type="book" color="#fd79a8" />
        </div>
        <div>
          <h1>Knowledge Base (RAG)</h1>
          <p>Upload documents, paste text, and search your indexed content</p>
        </div>
      </div>

      {/* Stats */}
      <div className="stat-grid">
        {[
          { label: "Documents", value: stats?.documents ?? 0 },
          { label: "Chunks", value: stats?.chunks ?? 0 },
          { label: "Collections", value: stats?.collections ?? 0 },
        ].map((s, i) => (
          <div key={s.label} className={`card stagger-${i + 1}`} style={{ textAlign: "center", padding: 16 }}>
            <div style={{ fontSize: 28, fontWeight: 700, marginBottom: 4 }}>{s.value}</div>
            <div style={{ fontSize: 13, color: "var(--text-muted)" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Collection selector + actions */}
      <div className="stagger-1" style={{ display: "flex", gap: 12, marginBottom: 24, alignItems: "center", flexWrap: "wrap", justifyContent: "space-between" }}>
        <div style={{ display: "flex", gap: 12, alignItems: "end" }}>
          <div>
            <label style={{ fontSize: 13, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Collection</label>
            <select value={activeCollection} onChange={e => setActiveCollection(e.target.value)} style={{ width: 220 }}>
              {collections.length === 0 && <option value="default">default</option>}
              {collections.map(c => <option key={c.name} value={c.name}>{c.name} ({c.chunks} chunks, {c.documents} docs)</option>)}
            </select>
          </div>
        </div>
        <button className="btn btn-danger btn-sm" onClick={clearAll}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          </svg>
          Clear All
        </button>
      </div>

      {/* Upload & Paste */}
      <div className="stagger-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 24 }}>
        <div className="card">
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <PageIcon type="upload" color="var(--accent)" />
            <h2 style={{ fontSize: 16, fontWeight: 600 }}>Upload File</h2>
          </div>
          <input type="file" ref={fileRef} style={{ marginBottom: 12 }} />
          <button className="btn btn-primary" onClick={uploadFile} disabled={uploading} style={{ fontSize: 13 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            {uploading ? "Indexing..." : "Upload & Index"}
          </button>
        </div>

        <div className="card">
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <PageIcon type="doc" color="var(--accent-2)" />
            <h2 style={{ fontSize: 16, fontWeight: 600 }}>Paste Text</h2>
          </div>
          <input placeholder="Document name (optional)" value={textName} onChange={e => setTextName(e.target.value)} style={{ marginBottom: 8 }} />
          <textarea placeholder="Paste your text content here..." value={textInput} onChange={e => setTextInput(e.target.value)} rows={4} style={{ marginBottom: 8, fontFamily: "'JetBrains Mono', monospace", fontSize: 13 }} />
          <button className="btn btn-primary" onClick={addText}>Add Text</button>
        </div>
      </div>

      {/* Search */}
      <div className="card stagger-3" style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <PageIcon type="search" color="var(--accent-4)" />
          <h2 style={{ fontSize: 16, fontWeight: 600 }}>Search Knowledge Base</h2>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <input placeholder="Search query..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} onKeyDown={e => { if (e.key === "Enter") search(); }} />
          <button className="btn btn-primary" onClick={search}>Search</button>
        </div>
        {searchResults.length > 0 && (
          <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
            {searchResults.map((r, i) => (
              <div key={i} style={{ padding: 12, background: "var(--surface-2)", borderRadius: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "var(--accent)" }}>{r.source}</span>
                  <span style={{ fontSize: 12, color: "var(--accent-2)" }}>score: {(r.score * 100).toFixed(1)}%</span>
                </div>
                <div style={{ fontSize: 13, color: "var(--text)", whiteSpace: "pre-wrap", lineHeight: 1.5 }}>{r.content}</div>
              </div>
            ))}
          </div>
        )}
        {searchResults.length === 0 && searchQuery && (
          <p style={{ marginTop: 12, color: "var(--text-muted)", fontSize: 13 }}>No results found for &quot;{searchQuery}&quot;</p>
        )}
      </div>

      {/* Documents list */}
      <div className="card stagger-4">
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <PageIcon type="doc" color="var(--accent-3)" />
          <h2 style={{ fontSize: 16, fontWeight: 600 }}>Indexed Documents ({docs.length})</h2>
        </div>
        {docs.length === 0 ? (
          <div className="empty-state">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" style={{ marginBottom: 12, opacity: 0.4 }}>
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
            <div>No documents indexed yet</div>
            <div style={{ fontSize: 13, marginTop: 4 }}>Upload a file or paste text above to get started.</div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {docs.map(d => (
              <div key={d.id} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "10px 14px", background: "var(--surface-2)", borderRadius: 8,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                  <div>
                    <span style={{ fontWeight: 600, fontSize: 14 }}>{d.filename}</span>
                    <span style={{ fontSize: 12, color: "var(--text-muted)", marginLeft: 8 }}>
                      {d.chunks} chunks &middot; {d.collection}
                    </span>
                  </div>
                </div>
                <button className="btn btn-ghost btn-sm" onClick={() => deleteDoc(d.id)}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
