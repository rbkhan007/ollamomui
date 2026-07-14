"use client";

import { useEffect, useState, useCallback } from "react";

type CheckResult = {
  label: string;
  status: "loading" | "ok" | "error";
  detail: string;
  endpoint: string;
};

const INITIAL: CheckResult[] = [
  { label: "Backend API", status: "loading", detail: "Checking...", endpoint: "/api/providers" },
  { label: "Database", status: "loading", detail: "Checking...", endpoint: "/api/settings/database/status" },
  { label: "RAG Engine", status: "loading", detail: "Checking...", endpoint: "/api/rag/collections" },
  { label: "Memory System", status: "loading", detail: "Checking...", endpoint: "/api/memory?session_id=_health" },
  { label: "Provider Configuration", status: "loading", detail: "Checking...", endpoint: "/api/providers" },
];

function StatusIcon({ status }: { status: "loading" | "ok" | "error" }) {
  if (status === "loading") {
    return (
      <span style={{ display: "inline-block", width: 12, height: 12, borderRadius: "50%", background: "var(--text-muted)", opacity: 0.4 }} />
    );
  }
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      width: 22, height: 22, borderRadius: "50%",
      background: status === "ok" ? "rgba(13,148,136,0.15)" : "rgba(248,113,113,0.15)",
      color: status === "ok" ? "var(--accent)" : "var(--red)",
      fontSize: 12, fontWeight: 700,
    }}>
      {status === "ok" ? "✓" : "✗"}
    </span>
  );
}

async function checkEndpoint(url: string): Promise<{ ok: boolean; detail: string }> {
  try {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(id);
    if (res.ok) {
      return { ok: true, detail: `${res.status} — reachable` };
    }
    return { ok: false, detail: `HTTP ${res.status} ${res.statusText}` };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("abort") || msg.includes("Abort")) {
      return { ok: false, detail: "Timed out (8s)" };
    }
    if (msg.includes("fetch")) {
      return { ok: false, detail: "Backend unreachable — is the server running?" };
    }
    return { ok: false, detail: msg };
  }
}

export function StatusDashboard() {
  const [results, setResults] = useState<CheckResult[]>(INITIAL);
  const [refreshing, setRefreshing] = useState(false);

  const runAll = useCallback(async () => {
    setRefreshing(true);
    setResults((prev) => prev.map((r) => ({ ...r, status: "loading" as const, detail: "Checking..." })));

    const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost:8080";
    const updates = await Promise.all(
      INITIAL.map(async (item) => {
        const { ok, detail } = await checkEndpoint(`${origin}${item.endpoint}`);
        return { ...item, status: ok ? ("ok" as const) : ("error" as const), detail };
      }),
    );

    setResults(updates);
    setRefreshing(false);
  }, []);

  useEffect(() => { runAll(); }, [runAll]);

  const okCount = results.filter((r) => r.status === "ok").length;
  const allDone = results.every((r) => r.status !== "loading");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{
        background: "var(--surface)", borderRadius: 16, border: "1px solid var(--glass-border)",
        padding: 24, display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div>
          <div style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)", fontWeight: 500, marginBottom: 4 }}>Overall Status</div>
          <div style={{ fontSize: "var(--text-h2)", fontWeight: 700, letterSpacing: "-0.02em" }}>
            {allDone
              ? (okCount === results.length ? "All Systems Operational" : `${okCount}/${results.length} Services Healthy`)
              : "Running Checks..."}
          </div>
        </div>
        <button
          onClick={runAll}
          disabled={refreshing}
          style={{
            padding: "12px 24px", borderRadius: 12, fontSize: "var(--text-sm)", fontWeight: 600,
            border: "1px solid var(--glass-border)", background: "var(--surface)",
            color: "var(--text)", cursor: refreshing ? "not-allowed" : "pointer",
            opacity: refreshing ? 0.5 : 1, minHeight: "var(--click-target)",
          }}
        >
          {refreshing ? "Refreshing..." : "Refresh All"}
        </button>
      </div>

      {results.map((r) => (
        <div key={r.label} style={{
          background: "var(--surface)", borderRadius: 12, border: "1px solid var(--glass-border)",
          padding: "16px 20px", display: "flex", alignItems: "center", gap: 14,
        }}>
          <StatusIcon status={r.status} />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, fontSize: "var(--text-sm)" }}>{r.label}</div>
            <div style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)", marginTop: 2 }}>{r.detail}</div>
          </div>
          <code style={{
            fontSize: 12, color: "var(--text-muted)", fontFamily: "monospace",
            background: "rgba(0,0,0,0.15)", padding: "4px 8px", borderRadius: 8,
          }}>
            {r.endpoint}
          </code>
        </div>
      ))}
    </div>
  );
}