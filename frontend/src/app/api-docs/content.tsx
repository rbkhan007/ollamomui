"use client";

import { useState } from "react";

const endpoints = [
  {
    method: "GET", path: "/api/tags", section: "Ollama Compatible",
    description: "List all available models. Returns model names, sizes, and metadata.",
    code: `curl ${typeof window !== "undefined" ? window.location.origin : "http://localhost:8080"}/api/tags`,
  },
  {
    method: "POST", path: "/api/chat", section: "Ollama Compatible",
    description: "Chat completion streaming endpoint. Drop-in replacement for Ollama's /api/chat.",
    code: `curl -X POST ${typeof window !== "undefined" ? window.location.origin : "http://localhost:8080"}/api/chat \\
  -H "Content-Type: application/json" \\
  -d '{"model":"gpt-4o-mini","messages":[{"role":"user","content":"Hello"}]}'`,
  },
  {
    method: "POST", path: "/api/generate", section: "Ollama Compatible",
    description: "Text generation endpoint. Drop-in replacement for Ollama's /api/generate.",
    code: `curl -X POST ${typeof window !== "undefined" ? window.location.origin : "http://localhost:8080"}/api/generate \\
  -H "Content-Type: application/json" \\
  -d '{"model":"gpt-4o-mini","prompt":"Hello"}'`,
  },
  {
    method: "POST", path: "/v1/chat/completions", section: "OpenAI Compatible",
    description: "OpenAI-compatible chat completions. Use any OpenAI SDK/curl with the OllamoMUI base URL.",
    code: `curl -X POST ${typeof window !== "undefined" ? window.location.origin : "http://localhost:8080"}/v1/chat/completions \\
  -H "Content-Type: application/json" \\
  -d '{"model":"gpt-4o-mini","messages":[{"role":"user","content":"Hello"}]}'`,
  },
  {
    method: "GET", path: "/v1/models", section: "OpenAI Compatible",
    description: "List models in OpenAI-compatible format.",
    code: `curl ${typeof window !== "undefined" ? window.location.origin : "http://localhost:8080"}/v1/models`,
  },
  {
    method: "POST", path: "/api/rag/query", section: "RAG",
    description: "Query the RAG knowledge base. Optionally specify a collection. Returns chunk matches with similarity scores.",
    code: `curl -X POST ${typeof window !== "undefined" ? window.location.origin : "http://localhost:8080"}/api/rag/query \\
  -H "Content-Type: application/json" \\
  -d '{"query":"What is RAG?","top_k":5}'`,
  },
  {
    method: "POST", path: "/api/rag/upload", section: "RAG",
    description: "Upload a document (PDF, TXT, CSV, MD, JSON, DOCX) for ingestion into the RAG pipeline.",
    code: `curl -X POST ${typeof window !== "undefined" ? window.location.origin : "http://localhost:8080"}/api/rag/upload \\
  -F "file=@document.pdf"`,
  },
  {
    method: "GET", path: "/api/rag/collections", section: "RAG",
    description: "List all RAG collections with document counts.",
    code: `curl ${typeof window !== "undefined" ? window.location.origin : "http://localhost:8080"}/api/rag/collections`,
  },
  {
    method: "DELETE", path: "/api/rag/collections/{id}", section: "RAG",
    description: "Delete a RAG collection and all its documents.",
    code: `curl -X DELETE ${typeof window !== "undefined" ? window.location.origin : "http://localhost:8080"}/api/rag/collections/1`,
  },
  {
    method: "GET", path: "/api/memory", section: "Memory",
    description: "Retrieve conversation memory history with pagination.",
    code: `curl ${typeof window !== "undefined" ? window.location.origin : "http://localhost:8080"}/api/memory?session_id=abc123`,
  },
  {
    method: "POST", path: "/api/memory/clear", section: "Memory",
    description: "Clear memory for a session or all sessions.",
    code: `curl -X POST ${typeof window !== "undefined" ? window.location.origin : "http://localhost:8080"}/api/memory/clear \\
  -H "Content-Type: application/json" \\
  -d '{"session_id":"abc123"}'`,
  },
  {
    method: "GET", path: "/api/providers", section: "Settings",
    description: "List all configured LLM providers and their status.",
    code: `curl ${typeof window !== "undefined" ? window.location.origin : "http://localhost:8080"}/api/providers`,
  },
  {
    method: "PUT", path: "/api/providers/{name}", section: "Settings",
    description: "Update an LLM provider's configuration (API key, model, endpoint).",
    code: `curl -X PUT ${typeof window !== "undefined" ? window.location.origin : "http://localhost:8080"}/api/providers/gpt-4o-mini \\
  -H "Content-Type: application/json" \\
  -d '{"api_key":"sk-...","model":"gpt-4o-mini"}'`,
  },
  {
    method: "GET", path: "/api/settings/database", section: "Settings",
    description: "Get current database URL configuration.",
    code: `curl ${typeof window !== "undefined" ? window.location.origin : "http://localhost:8080"}/api/settings/database`,
  },
  {
    method: "PUT", path: "/api/settings/database", section: "Settings",
    description: "Update database connection URL and reconnect.",
    code: `curl -X PUT ${typeof window !== "undefined" ? window.location.origin : "http://localhost:8080"}/api/settings/database \\
  -H "Content-Type: application/json" \\
  -d '{"database_url":"postgresql://user:pass@host:5432/db"}'`,
  },
  {
    method: "GET", path: "/api/settings/database/test", section: "Settings",
    description: "Test database connectivity without applying changes.",
    code: `curl ${typeof window !== "undefined" ? window.location.origin : "http://localhost:8080"}/api/settings/database/test?url=postgresql://...`,
  },
];

function MethodBadge({ method }: { method: string }) {
  const colors: Record<string, { bg: string; text: string }> = {
    GET: { bg: "rgba(0,206,201,0.12)", text: "#00cec9" },
    POST: { bg: "rgba(108,92,231,0.12)", text: "#6c5ce7" },
    PUT: { bg: "rgba(253,121,168,0.12)", text: "#fd79a8" },
    DELETE: { bg: "rgba(255,107,107,0.12)", text: "#ff6b6b" },
  };
  const c = colors[method] || { bg: "rgba(255,255,255,0.08)", text: "var(--text-muted)" };
  return (
    <span style={{
      display: "inline-block", padding: "2px 10px", borderRadius: 6, fontSize: 12, fontWeight: 700,
      background: c.bg, color: c.text, fontFamily: "monospace", letterSpacing: "0.03em",
    }}>
      {method}
    </span>
  );
}

export function ApiDocsContent() {
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const sections = [...new Set(endpoints.map((e) => e.section))];

  const copy = async (idx: number, code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedIdx(idx);
      setTimeout(() => setCopiedIdx(null), 2000);
    } catch { /* noop */ }
  };

  return (
    <>
      {sections.map((section) => (
        <section key={section} style={{ marginBottom: 40 }}>
          <h2 style={{ fontSize: "1.3rem", fontWeight: 700, marginBottom: 16, paddingBottom: 8, borderBottom: "1px solid var(--glass-border)", color: "var(--text)" }}>
            {section}
          </h2>
          {endpoints.filter((e) => e.section === section).map((ep, i) => {
            const globalIdx = endpoints.indexOf(ep);
            return (
              <div key={ep.path} style={{
                background: "var(--surface)", borderRadius: 12, border: "1px solid var(--glass-border)",
                padding: 20, marginBottom: 12,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8, flexWrap: "wrap" }}>
                  <MethodBadge method={ep.method} />
                  <code style={{ fontSize: 15, fontWeight: 600, color: "var(--text)", fontFamily: "monospace" }}>
                    {ep.path}
                  </code>
                </div>
                <p style={{ color: "var(--text-muted)", fontSize: 14, marginBottom: 12, lineHeight: 1.5 }}>
                  {ep.description}
                </p>
                <div style={{ position: "relative" }}>
                  <pre style={{
                    background: "rgba(0,0,0,0.3)", borderRadius: 8, padding: 14, fontSize: 13,
                    overflow: "auto", fontFamily: "monospace", color: "#a5b4fc", lineHeight: 1.5,
                  }}>
                    <code>{ep.code}</code>
                  </pre>
                  <button
                    onClick={() => copy(globalIdx, ep.code)}
                    style={{
                      position: "absolute", top: 8, right: 8, padding: "4px 10px", borderRadius: 6,
                      fontSize: 11, fontWeight: 600, border: "1px solid var(--glass-border)",
                      background: "var(--surface)", color: "var(--text-muted)", cursor: "pointer",
                    }}
                  >
                    {copiedIdx === globalIdx ? "Copied!" : "Copy"}
                  </button>
                </div>
              </div>
            );
          })}
        </section>
      ))}
    </>
  );
}
