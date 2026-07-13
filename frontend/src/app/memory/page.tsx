"use client";

import { useEffect, useState } from "react";
import { useDb } from "@/lib/DbContext";
import { apiJson, toast } from "@/lib/api";
import { PageIcon } from "@/components/Icons";

type Stats = { messages: number; facts: number; sessions: number; buffered: number };
type Message = { id: string; role: string; content: string; model: string; provider: string; session_id: string; tokens: number; created_at: string };
type Fact = { id: string; fact: string; source: string; importance: string; session_id: string; created_at: string };
type Session = { id: string; name: string; model: string; provider: string; message_count: number; created_at: string; updated_at: string };

export default function MemoryPage() {
  const { databaseConnected, schema } = useDb();
  const [stats, setStats] = useState<Stats | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [facts, setFacts] = useState<Fact[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [factText, setFactText] = useState("");
  const [factSource, setFactSource] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Message[]>([]);
  const [tab, setTab] = useState<"messages" | "facts" | "sessions">("messages");

  async function load() {
    try {
      const [s, m, f, se] = await Promise.all([
        apiJson<Stats>("/api/memory/stats"),
        apiJson<Message[]>("/api/memory/messages?limit=100"),
        apiJson<Fact[]>("/api/memory/facts"),
        apiJson<Session[]>("/api/memory/sessions"),
      ]);
      setStats(s);
      setMessages(m);
      setFacts(f);
      setSessions(se);
    } catch (e) {
      toast("Failed to load memory data", true);
    }
  }

  useEffect(() => { load(); }, []);

  async function addFact() {
    if (!factText.trim()) { toast("Enter a fact", true); return; }
    try {
      await apiJson("/api/memory/facts", {
        method: "POST",
        body: JSON.stringify({ fact: factText, source: factSource || "manual" }),
      });
      toast("Fact added!");
      setFactText("");
      setFactSource("");
      load();
    } catch (e: any) {
      toast("Error: " + e.message, true);
    }
  }

  async function deleteFact(id: string) {
    try {
      await apiJson(`/api/memory/facts/${id}`, { method: "DELETE" });
      toast("Fact deleted");
      load();
    } catch (e: any) {
      toast("Error: " + e.message, true);
    }
  }

  async function searchMemory() {
    if (!searchQuery.trim()) return;
    try {
      const results = await apiJson<Message[]>("/api/memory/search", {
        method: "POST",
        body: JSON.stringify({ query: searchQuery, limit: 20 }),
      });
      setSearchResults(results);
      if (results.length === 0) toast("No matching messages found");
    } catch (e: any) {
      toast("Error: " + e.message, true);
    }
  }

  async function clearMemory(sessionId?: string) {
    if (!confirm("Clear memory for " + (sessionId ? `session "${sessionId}"` : "ALL sessions") + "? This cannot be undone.")) return;
    try {
      const body: Record<string, string> = {};
      if (sessionId) body.session_id = sessionId;
      await apiJson("/api/memory/clear", { method: "POST", body: JSON.stringify(body) });
      toast("Memory cleared");
      load();
    } catch (e: any) {
      toast("Error: " + e.message, true);
    }
  }

  async function exportFacts() {
    if (facts.length === 0) { toast("No facts to export", true); return; }
    const blob = new Blob([JSON.stringify(facts, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `memory-facts-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast("Facts exported");
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-header-icon" style={{ background: "rgba(0,206,201,0.1)" }}>
          <PageIcon type="brain" color="var(--accent-2)" />
        </div>
        <div>
          <h1>Memory</h1>
          <p>Conversation history, stored facts, and session management</p>
          {!databaseConnected && (
            <div style={{ marginTop: 8, padding: "6px 12px", background: "rgba(225,112,85,0.1)", borderRadius: 6, fontSize: 12, color: "var(--red)" }}>
              PostgreSQL not connected — memory features are unavailable
            </div>
          )}
          {databaseConnected && schema && !schema.synced && (
            <div style={{ marginTop: 8, padding: "6px 12px", background: "rgba(253,203,110,0.1)", borderRadius: 6, fontSize: 12, color: "var(--accent-4)" }}>
              Schema out of date (v{schema.db_version} vs v{schema.expected_version}) — run migration
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="stat-grid">
        {[
          { label: "Messages", value: stats?.messages ?? 0 },
          { label: "Facts", value: stats?.facts ?? 0 },
          { label: "Sessions", value: stats?.sessions ?? 0 },
          { label: "Buffered", value: stats?.buffered ?? 0 },
        ].map((s, i) => (
          <div key={s.label} className={`card stagger-${i + 1}`} style={{ textAlign: "center", padding: 16 }}>
            <div style={{ fontSize: 28, fontWeight: 700, marginBottom: 4 }}>{s.value}</div>
            <div style={{ fontSize: 13, color: "var(--text-muted)" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs + actions */}
      <div className="stagger-1" style={{ display: "flex", gap: 8, marginBottom: 16, alignItems: "center", justifyContent: "space-between", flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: 4 }}>
          {(["messages", "facts", "sessions"] as const).map(t => (
            <button key={t} className={`btn ${tab === t ? "btn-primary" : "btn-ghost"}`} onClick={() => setTab(t)}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn btn-ghost btn-sm" onClick={exportFacts}>Export Facts</button>
          <button className="btn btn-danger btn-sm" onClick={() => clearMemory()}>Clear All</button>
        </div>
      </div>

      {/* Search */}
      <div className="card stagger-2" style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 8 }}>
          <input aria-label="Search memory" placeholder="Search memory..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} onKeyDown={e => { if (e.key === "Enter") searchMemory(); }} />
          <button className="btn btn-primary" onClick={searchMemory}>Search</button>
        </div>
        {searchResults.length > 0 && (
          <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 6 }}>
            {searchResults.map((r, i) => (
              <div key={i} style={{ padding: 10, background: "var(--surface-2)", borderRadius: 8, fontSize: 13 }}>
                <span style={{ color: r.role === "user" ? "var(--accent)" : "var(--green)", fontWeight: 600 }}>
                  {r.role}
                </span>
                <span style={{ color: "var(--text-muted)", marginLeft: 8 }}>{r.model || ""}</span>
                <span style={{ color: "var(--text-muted)", marginLeft: 8, fontSize: 11 }}>{r.created_at}</span>
                <div style={{ marginTop: 4, color: "var(--text)" }}>{r.content.slice(0, 200)}{r.content.length > 200 ? "..." : ""}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Messages tab */}
      {tab === "messages" && (
        <div className="card stagger-3">
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Conversation Messages ({messages.length})</h2>
          {messages.length === 0 ? (
            <div className="empty-state">No messages yet. Start chatting in the Playground.</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 500, overflowY: "auto" }}>
              {messages.map((m, i) => (
                <div key={m.id || i} style={{ padding: "8px 12px", background: "var(--surface-2)", borderRadius: 8, fontSize: 13 }}>
                  <span style={{ color: m.role === "user" ? "var(--accent)" : "var(--green)", fontWeight: 600 }}>
                    {m.role}
                  </span>
                  <span style={{ color: "var(--text-muted)", marginLeft: 8, fontSize: 11 }}>{m.model || ""}</span>
                  <span style={{ color: "var(--text-muted)", marginLeft: 8, fontSize: 11 }}>{m.created_at || ""}</span>
                  <div style={{ marginTop: 4, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                    {m.content.slice(0, 300)}{m.content.length > 300 ? "..." : ""}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Facts tab */}
      {tab === "facts" && (
        <div>
          <div className="card stagger-3" style={{ marginBottom: 16 }}>
            <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Add Fact</h2>
            <div style={{ display: "flex", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
              <input aria-label="Fact to remember" placeholder="Fact to remember..." value={factText} onChange={e => setFactText(e.target.value)} style={{ flex: "2 1 200px", minWidth: 0 }} />
              <input aria-label="Source" placeholder="Source (optional)" value={factSource} onChange={e => setFactSource(e.target.value)} style={{ flex: "1 1 140px", minWidth: 0 }} />
              <button className="btn btn-primary" onClick={addFact}>Add</button>
            </div>
          </div>
          <div className="card">
            <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Stored Facts ({facts.length})</h2>
            {facts.length === 0 ? (
              <div className="empty-state">No facts stored yet. Add facts about user preferences or data.</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {facts.map(f => (
                <div key={f.id} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10,
                  padding: "10px 14px", background: "var(--surface-2)", borderRadius: 8,
                }}>
                  <div className="min-w-0" style={{ minWidth: 0, flex: "1 1 auto" }}>
                    <div className="break-all" style={{ fontWeight: 500, wordBreak: "break-word" }}>{f.fact}</div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)", overflowWrap: "anywhere" }}>
                      {f.source} &middot; {f.importance} &middot; {f.created_at}
                    </div>
                  </div>
                  <button className="btn btn-ghost btn-sm" onClick={() => deleteFact(f.id)} style={{ flexShrink: 0 }}>
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
      )}

      {/* Sessions tab */}
      {tab === "sessions" && (
        <div className="card stagger-3">
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Sessions ({sessions.length})</h2>
          {sessions.length === 0 ? (
            <div className="empty-state">No sessions yet. Start a conversation to create one.</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {sessions.map(s => (
                <div key={s.id} style={{
                  padding: "12px 14px", background: "var(--surface-2)", borderRadius: 8,
                  display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10,
                }}>
                  <div className="min-w-0" style={{ minWidth: 0, flex: "1 1 auto" }}>
                    <div className="break-all" style={{ fontWeight: 600, fontSize: 14, wordBreak: "break-word" }}>{s.name || s.id}</div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)", overflowWrap: "anywhere" }}>
                      {s.message_count} messages &middot; Model: {s.model || "any"} &middot; {s.created_at}
                    </div>
                  </div>
                  <button className="btn btn-ghost btn-sm" onClick={() => clearMemory(s.id)} style={{ flexShrink: 0 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                    Clear
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
