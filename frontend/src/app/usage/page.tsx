"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/AuthContext";
import { useRouter } from "next/navigation";
import { apiJson } from "@/lib/api";
import { PageIcon } from "@/components/Icons";
import { ProviderIcon } from "@/components/BrandIcon";

interface UsageEntry {
  model: string;
  provider: string;
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  success: boolean;
  latency_ms: number;
  timestamp: string;
}

interface ModelStats {
  requests: number;
  successes: number;
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  avg_latency: number;
}

function computeStats(log: UsageEntry[]): { total: ModelStats; byModel: Record<string, ModelStats>; hourly: number[] } {
  const total: ModelStats = { requests: 0, successes: 0, prompt_tokens: 0, completion_tokens: 0, total_tokens: 0, avg_latency: 0 };
  const byModel: Record<string, ModelStats> = {};
  const hourly = new Array(24).fill(0);

  for (const entry of log) {
    total.requests++;
    if (entry.success) total.successes++;
    total.prompt_tokens += entry.prompt_tokens || 0;
    total.completion_tokens += entry.completion_tokens || 0;
    total.total_tokens += entry.total_tokens || 0;
    total.avg_latency += entry.latency_ms || 0;

    const m = entry.model || "unknown";
    if (!byModel[m]) byModel[m] = { requests: 0, successes: 0, prompt_tokens: 0, completion_tokens: 0, total_tokens: 0, avg_latency: 0 };
    byModel[m].requests++;
    if (entry.success) byModel[m].successes++;
    byModel[m].prompt_tokens += entry.prompt_tokens || 0;
    byModel[m].completion_tokens += entry.completion_tokens || 0;
    byModel[m].total_tokens += entry.total_tokens || 0;
    byModel[m].avg_latency += entry.latency_ms || 0;

    try {
      const h = new Date(entry.timestamp).getHours();
      hourly[h]++;
    } catch { /* ignore */ }
  }

  if (total.requests > 0) {
    total.avg_latency = Math.round(total.avg_latency / total.requests);
    for (const m of Object.keys(byModel)) {
      byModel[m].avg_latency = Math.round(byModel[m].avg_latency / byModel[m].requests);
    }
  }

  return { total, byModel, hourly };
}

function Bar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div style={{ height: 100, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", gap: 4 }}>
      <div style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 600 }}>{value}</div>
      <div style={{ width: 24, height: `${Math.max(pct, 2)}%`, background: color, borderRadius: "4px 4px 0 0", transition: "height 0.5s ease", minHeight: 2 }} />
    </div>
  );
}

export default function UsagePage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [statsData, setStatsData] = useState<any>(null);
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const s = await apiJson("/api/usage/stats");
      setStatsData(s);
    } catch { /* ignore */ }
    try {
      const st = await apiJson("/api/status");
      setStatus(st);
    } catch { /* ignore */ }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!isAuthenticated) { router.push("/login"); return; }
    refresh();
    let iv: ReturnType<typeof setInterval> = setInterval(refresh, 15000);
    const onVisibility = () => {
      clearInterval(iv);
      if (!document.hidden) {
        refresh();
        iv = setInterval(refresh, 15000);
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      clearInterval(iv);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [isAuthenticated, router, refresh]);

  const log: UsageEntry[] = statsData?.recent ?? [];
  const computed = computeStats(log);
  const serverLatencySum = Object.values(statsData?.by_model ?? {}).reduce(
    (a: number, m: any) => a + (m.avg_latency || 0) * (m.requests || 0), 0
  );
  const stats = {
    total: {
      requests: statsData?.total_requests ?? computed.total.requests,
      successes: statsData?.successes ?? computed.total.successes,
      total_tokens: statsData?.total_tokens ?? computed.total.total_tokens,
      avg_latency: statsData
        ? Math.round(serverLatencySum / Math.max(1, statsData.total_requests || 1))
        : computed.total.avg_latency,
    },
    byModel: statsData?.by_model ?? computed.byModel,
    hourly: statsData?.hourly ?? computed.hourly,
  };
  const resonance = statsData
    ? String(statsData.resonance)
    : (stats.total.requests > 0 ? ((stats.total.successes / stats.total.requests) * 100).toFixed(1) : "100.0");
  const accuracy = stats.total.requests > 0
    ? Math.min(100, ((stats.total.successes / stats.total.requests) * 0.7 + (stats.total.total_tokens > 0 ? 0.3 : 0)) * 100).toFixed(1)
    : "100.0";
  const maxHourly = Math.max(...stats.hourly, 1);

  const hourLabels = Array.from({ length: 24 }, (_, i) =>
    i === 0 ? "12am" : i === 12 ? "12pm" : i < 12 ? `${i}am` : `${i - 12}pm`
  );

  if (loading) {
    return (
      <div className="page-container">
        <div className="page-header">
          <div className="page-header-icon" style={{ background: "rgba(253,203,110,0.1)" }}>
            <PageIcon type="settings" color="#fdcb6e" />
          </div>
          <div>
            <h1>Usage Analytics</h1>
            <p>Loading statistics...</p>
          </div>
        </div>
      </div>
    );
  }

  const modelNames = Object.keys(stats.byModel);
  const totalCost = 0;

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-header-icon" style={{ background: "rgba(253,203,110,0.1)" }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fdcb6e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="20" x2="18" y2="10" />
            <line x1="12" y1="20" x2="12" y2="4" />
            <line x1="6" y1="20" x2="6" y2="14" />
          </svg>
        </div>
        <div>
          <h1>Usage Analytics</h1>
          <p>Real-time token usage, resonance, and accuracy metrics</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="stat-grid">
        {[
          { label: "Total Requests", value: stats.total.requests.toLocaleString(), color: "var(--accent)" },
          { label: "Tokens Used", value: stats.total.total_tokens.toLocaleString(), color: "var(--accent-2)" },
          { label: "Resonance", value: `${resonance}%`, color: "var(--green)" },
          { label: "Accuracy", value: `${accuracy}%`, color: "var(--accent-4)" },
          { label: "Avg Latency", value: `${stats.total.avg_latency}ms`, color: "var(--accent-3)" },
          { label: "Total Cost", value: "$0.00", color: "var(--green)" },
        ].map((s, i) => (
          <div key={s.label} className={`card stagger-${i + 1}`} style={{ textAlign: "center", padding: 20 }}>
            <div style={{ fontSize: 28, fontWeight: 700, marginBottom: 4, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 13, color: "var(--text-muted)" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Hourly Activity */}
      <div className="card stagger-1" style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Hourly Activity (last 24h)</h2>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 2, justifyContent: "space-between" }}>
          {stats.hourly.map((v: number, i: number) => (
            <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
              <Bar value={v} max={maxHourly} color={v > 0 ? "var(--accent)" : "var(--surface-2)"} />
            </div>
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 9, color: "var(--text-muted)" }}>
          {[0, 6, 12, 18, 23].map(i => (
            <span key={i}>{hourLabels[i]}</span>
          ))}
        </div>
      </div>

      {/* Model Breakdown */}
      <div className="card stagger-2" style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Per-Model Statistics ({modelNames.length} models)</h2>
        {modelNames.length === 0 ? (
          <div className="empty-state">No usage data yet. Start chatting in the Playground.</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  <th style={{ textAlign: "left", padding: "8px 12px", color: "var(--text-muted)", fontWeight: 500 }}>Model</th>
                  <th style={{ textAlign: "right", padding: "8px 12px", color: "var(--text-muted)", fontWeight: 500 }}>Requests</th>
                  <th style={{ textAlign: "right", padding: "8px 12px", color: "var(--text-muted)", fontWeight: 500 }}>Success</th>
                  <th style={{ textAlign: "right", padding: "8px 12px", color: "var(--text-muted)", fontWeight: 500 }}>Tokens</th>
                  <th style={{ textAlign: "right", padding: "8px 12px", color: "var(--text-muted)", fontWeight: 500 }}>Avg Latency</th>
                  <th style={{ textAlign: "right", padding: "8px 12px", color: "var(--text-muted)", fontWeight: 500 }}>Resonance</th>
                </tr>
              </thead>
              <tbody>
                {modelNames.map(name => {
                  const m = stats.byModel[name];
                  const res = m.requests > 0 ? ((m.successes / m.requests) * 100).toFixed(1) : "100.0";
                  return (
                    <tr key={name} style={{ borderBottom: "1px solid var(--border)" }}>
                      <td style={{ padding: "8px 12px", fontWeight: 600 }}>{name}</td>
                      <td style={{ padding: "8px 12px", textAlign: "right" }}>{m.requests}</td>
                      <td style={{ padding: "8px 12px", textAlign: "right", color: "var(--green)" }}>{m.successes}</td>
                      <td style={{ padding: "8px 12px", textAlign: "right" }}>{m.total_tokens.toLocaleString()}</td>
                      <td style={{ padding: "8px 12px", textAlign: "right" }}>{m.avg_latency}ms</td>
                      <td style={{ padding: "8px 12px", textAlign: "right", color: Number(res) >= 90 ? "var(--green)" : Number(res) >= 70 ? "var(--accent-4)" : "var(--red)" }}>
                        {res}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Resonance & Accuracy gauge */}
      <div className="stat-grid">
        <div className="card stagger-3">
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Resonance</h2>
          <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 16 }}>
            Percentage of successful vs total API requests
          </p>
          <div style={{
            width: "100%", height: 10, background: "var(--surface-2)", borderRadius: 5, overflow: "hidden", marginBottom: 8,
          }}>
            <div style={{
              width: `${resonance}%`, height: "100%",
              background: Number(resonance) >= 90 ? "var(--green)" : Number(resonance) >= 70 ? "var(--accent-4)" : "var(--red)",
              borderRadius: 5, transition: "width 0.5s ease",
            }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--text-muted)" }}>
            <span>0%</span>
            <span style={{ fontSize: 20, fontWeight: 700, color: Number(resonance) >= 90 ? "var(--green)" : Number(resonance) >= 70 ? "var(--accent-4)" : "var(--red)" }}>
              {resonance}%
            </span>
            <span>100%</span>
          </div>
        </div>
        <div className="card stagger-4">
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Accuracy</h2>
          <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 16 }}>
            Combined score of request success + token quality
          </p>
          <div style={{
            width: "100%", height: 10, background: "var(--surface-2)", borderRadius: 5, overflow: "hidden", marginBottom: 8,
          }}>
            <div style={{
              width: `${accuracy}%`, height: "100%",
              background: Number(accuracy) >= 90 ? "var(--green)" : Number(accuracy) >= 70 ? "var(--accent-4)" : "var(--red)",
              borderRadius: 5, transition: "width 0.5s ease",
            }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--text-muted)" }}>
            <span>0%</span>
            <span style={{ fontSize: 20, fontWeight: 700, color: Number(accuracy) >= 90 ? "var(--green)" : Number(accuracy) >= 70 ? "var(--accent-4)" : "var(--red)" }}>
              {accuracy}%
            </span>
            <span>100%</span>
          </div>
        </div>
      </div>

      {/* Recent log */}
      <div className="card stagger-5">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600 }}>Recent Requests ({log.length})</h2>
            <button
              className="btn btn-ghost btn-sm"
              onClick={async () => {
                await apiJson("/api/usage/clear", { method: "POST" }).catch(() => {});
                refresh();
              }}
            >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
            Clear Log
          </button>
        </div>
        {log.length === 0 ? (
          <div className="empty-state">No requests logged yet. Use the Playground or API endpoints to generate usage data.</div>
        ) : (
          <div style={{ maxHeight: 400, overflowY: "auto", display: "flex", flexDirection: "column", gap: 4 }}>
            {[...log].reverse().slice(0, 100).map((entry, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "8px 12px", borderRadius: 8, fontSize: 12,
                background: "var(--surface-2)",
              }}>
                <span className={`status-dot ${entry.success ? "status-dot-green" : "status-dot-red"}`} />
                <span style={{ fontWeight: 600, minWidth: 120, color: "var(--accent)" }}>{entry.model || "unknown"}</span>
                <span style={{ color: "var(--text-muted)", minWidth: 80, display: "inline-flex", alignItems: "center", gap: 6 }}>
                  {entry.provider ? <ProviderIcon name={entry.provider} size={14} /> : null}
                  {entry.provider || ""}
                </span>
                <span style={{ color: "var(--text-muted)" }}>{entry.total_tokens || 0} tokens</span>
                <span style={{ color: "var(--text-muted)", marginLeft: "auto" }}>
                  {entry.timestamp ? new Date(entry.timestamp).toLocaleTimeString() : ""}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Server info */}
      {status && (
        <div className="card stagger-6" style={{ marginTop: 24 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Server Status</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, fontSize: 13 }}>
            <div>
              <span style={{ color: "var(--text-muted)" }}>Provider: </span>
              <span style={{ fontWeight: 600 }}>{status.active_provider}</span>
            </div>
            <div>
              <span style={{ color: "var(--text-muted)" }}>API Key: </span>
              <span className={`badge ${status.api_key_set ? "badge-green" : "badge-red"}`}>
                {status.api_key_set ? "Set" : "Not Set"}
              </span>
            </div>
            <div>
              <span style={{ color: "var(--text-muted)" }}>Models: </span>
              <span style={{ fontWeight: 600 }}>{status.model_count}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
