"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import ThemeToggle from "./ThemeToggle";

/* ─── Brand Icons (inline SVGs) ─── */
const BRAND_ICONS: Record<string, React.ReactNode> = {
  claudeCode: (
    <svg height="16" viewBox="0 0 24 24" width="16" xmlns="http://www.w3.org/2000/svg">
      <path clipRule="evenodd" d="M20.998 10.949H24v3.102h-3v3.028h-1.487V20H18v-2.921h-1.487V20H15v-2.921H9V20H7.488v-2.921H6V20H4.487v-2.921H3V14.05H0V10.95h3V5h17.998v5.949zM6 10.949h1.488V8.102H6v2.847zm10.51 0H18V8.102h-1.49v2.847z" fill="#D97757" fillRule="evenodd" />
    </svg>
  ),
  opencode: (
    <svg height="16" viewBox="0 0 24 24" width="16" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 6H8v12h8V6zm4 16H4V2h16v20z" fill="currentColor" />
    </svg>
  ),
  kilocode: (
    <svg height="16" viewBox="0 0 24 24" width="16" xmlns="http://www.w3.org/2000/svg">
      <path d="M0 0v24h24V0H0zm22.222 22.222H1.778V1.778h20.444v20.444zm-7.555-4.964h2.222v1.778h-2.794L12.89 17.83v-2.794h1.778v2.222zm4 0h-1.778v-2.222h-2.222v-1.778h2.793l1.207 1.207v2.793zm-7.556-2.591H9.333v-1.778h1.778v1.778zm-5.778-1.778h1.778v4h4v1.778H6.54L5.333 17.46V12.89zm13.334-3.556v1.778h-5.778V9.333h1.987V7.111h-1.987V5.333h2.558l1.206 1.207v2.793h2.014zm-11.556-2h2.222l1.778 1.778v2H9.333v-2H7.111v2H5.333V5.333h1.778v2zm4 0H9.333v-2h1.778v2z" fill="currentColor" />
    </svg>
  ),
  codex: (
    <svg height="16" viewBox="0 0 24 24" width="16" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient gradientUnits="userSpaceOnUse" id="codexGrad" x1="12" x2="12" y1="3" y2="21">
          <stop stopColor="#B1A7FF" />
          <stop offset=".5" stopColor="#7A9DFF" />
          <stop offset="1" stopColor="#3941FF" />
        </linearGradient>
      </defs>
      <path d="M19.503 0H4.496A4.496 4.496 0 000 4.496v15.007A4.496 4.496 0 004.496 24h15.007A4.496 4.496 0 0024 19.503V4.496A4.496 4.496 0 0019.503 0z" fill="currentColor" />
      <path d="M9.064 3.344a4.578 4.578 0 012.285-.312c1 .115 1.891.54 2.673 1.275.01.01.024.017.037.021a.09.09 0 00.043 0 4.55 4.55 0 013.046.275l.047.022.116.057a4.581 4.581 0 012.188 2.399c.209.51.313 1.041.315 1.595a4.24 4.24 0 01-.134 1.223.123.123 0 00.03.115c.594.607.988 1.33 1.183 2.17.289 1.425-.007 2.71-.887 3.854l-.136.166a4.548 4.548 0 01-2.201 1.388.123.123 0 00-.081.076c-.191.551-.383 1.023-.74 1.494-.9 1.187-2.222 1.846-3.711 1.838-1.187-.006-2.239-.44-3.157-1.302a.107.107 0 00-.105-.024c-.388.125-.78.143-1.204.138a4.441 4.441 0 01-1.945-.466 4.544 4.544 0 01-1.61-1.335c-.152-.202-.303-.392-.414-.617a5.81 5.81 0 01-.37-.961 4.582 4.582 0 01-.014-2.298.124.124 0 00.006-.056.085.085 0 00-.027-.048 4.467 4.467 0 01-1.034-1.651 3.896 3.896 0 01-.251-1.192 5.189 5.189 0 01.141-1.6c.337-1.112.982-1.985 1.933-2.618.212-.141.413-.251.601-.33.215-.089.43-.164.646-.227a.098.098 0 00.065-.066 4.51 4.51 0 01.829-1.615 4.535 4.535 0 011.837-1.388zm3.482 10.565a.637.637 0 000 1.272h3.636a.637.637 0 100-1.272h-3.636zM8.462 9.23a.637.637 0 00-1.106.631l1.272 2.224-1.266 2.136a.636.636 0 101.095.649l1.454-2.455a.636.636 0 00.005-.64L8.462 9.23z" fill="url(#codexGrad)" />
    </svg>
  ),
  ollama: (
    <svg height="16" viewBox="0 0 24 24" width="16" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 18c-4.418 0-8-3.582-8-8s3.582-8 8-8 8 3.582 8 8-3.582 8-8 8zm-2-6l4-2-4-2v4z" fill="currentColor" />
    </svg>
  ),
};

/* ─── Data ─── */
interface Agent { id: string; name: string; color: string; icon: string; desc: string; defaultProvider: string; setupCmd: string; }
interface Provider { id: string; name: string; color: string; envKey: string; latency: number; cost: number; models: string[]; }

const AGENTS: Agent[] = [
  { id: "ollamomui", name: "OllamoMUI", color: "var(--accent-4)", icon: "ollama", desc: "Secure Neural Proxy bridge & routing broker gateway.", defaultProvider: "openrouter", setupCmd: "ollamomui serve --secure" },
  { id: "claude-code", name: "ClaudeCode", color: "var(--accent-3)", icon: "claudeCode", desc: "Anthropic agentic terminal interface.", defaultProvider: "anthropic", setupCmd: "claude" },
  { id: "opencode", name: "OpenCode", color: "var(--accent)", icon: "opencode", desc: "Local opensource programming companion.", defaultProvider: "openrouter", setupCmd: "opencode start" },
  { id: "kilocode", name: "KiloCode", color: "var(--green)", icon: "kilocode", desc: "Sleek background compiler & diagnostic runner.", defaultProvider: "deepseek", setupCmd: "kilocode audit" },
  { id: "codex", name: "CodexCLI", color: "#10a37f", icon: "codex", desc: "Integrated workspace multi-agent runner.", defaultProvider: "openai", setupCmd: "codex auth" },
  { id: "ollama-cli", name: "Ollama CLI", color: "var(--accent-2)", icon: "ollama", desc: "Offline local orchestration runner.", defaultProvider: "gemini", setupCmd: "ollama run codegemma" },
];

const PROVIDERS: Provider[] = [
  { id: "openai", name: "OpenAI", color: "#10a37f", envKey: "OPENAI_API_KEY", latency: 45, cost: 2.5, models: ["gpt-4o", "o1-pro", "gpt-4-turbo"] },
  { id: "anthropic", name: "Anthropic", color: "var(--accent-3)", envKey: "ANTHROPIC_API_KEY", latency: 68, cost: 3.0, models: ["claude-3-7-sonnet", "claude-3-5-haiku"] },
  { id: "groq", name: "Groq", color: "var(--accent-4)", envKey: "GROQ_API_KEY", latency: 15, cost: 0.59, models: ["llama-3.3-70b", "mixtral-8x7b"] },
  { id: "deepseek", name: "DeepSeek", color: "#4D6BFE", envKey: "DEEPSEEK_API_KEY", latency: 240, cost: 0.14, models: ["deepseek-v3", "deepseek-reasoner"] },
  { id: "gemini", name: "Gemini", color: "#3186FF", envKey: "GEMINI_API_KEY", latency: 110, cost: 1.25, models: ["gemini-2.5-pro", "gemini-2.5-flash"] },
  { id: "openrouter", name: "OpenRouter", color: "var(--accent)", envKey: "OPENROUTER_API_KEY", latency: 165, cost: 1.8, models: ["claude-3.7-sonnet", "llama-3.1-405b"] },
  { id: "mistral", name: "Mistral", color: "#ff7000", envKey: "MISTRAL_API_KEY", latency: 85, cost: 1.5, models: ["mistral-large", "codestral"] },
];

type PipelineStatus = "idle" | "connecting" | "routing" | "streaming" | "complete" | "error";

const PIPELINE_STEPS: { key: PipelineStatus; label: string; dotClass: string }[] = [
  { key: "idle", label: "Idle", dotClass: "waiting" },
  { key: "connecting", label: "Connecting", dotClass: "processing" },
  { key: "routing", label: "Routing", dotClass: "processing" },
  { key: "streaming", label: "Streaming", dotClass: "active" },
  { key: "complete", label: "Complete", dotClass: "success" },
  { key: "error", label: "Error", dotClass: "error" },
];

interface LogEntry { text: string; color: string; ts: number; }

const COLOR_MAP: Record<string, string> = {
  "amber": "var(--accent-4)",
  "slate": "var(--text-muted)",
  "purple": "var(--accent)",
  "cyan": "var(--accent-2)",
  "emerald": "var(--green)",
  "green": "var(--green)",
  "indigo": "var(--accent)",
  "pink": "var(--accent-3)",
  "yellow": "var(--accent-4)",
  "red": "var(--red)",
};

function resolveColor(cls: string): string {
  for (const [key, val] of Object.entries(COLOR_MAP)) {
    if (cls.includes(key)) return val;
  }
  return "var(--text-muted)";
}

function formatTime(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

/* ─── Main Component ─── */
export default function InteractiveWireframe() {
  const [selectedAgent, setSelectedAgent] = useState("ollamomui");
  const [selectedProvider, setSelectedProvider] = useState("openrouter");
  const [pipelineStatus, setPipelineStatus] = useState<PipelineStatus>("idle");
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [stats, setStats] = useState({ tokens: 0, latency: 0, requests: 0 });
  const terminalEndRef = useRef<HTMLDivElement>(null);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const activeAgent = AGENTS.find((a) => a.id === selectedAgent) || AGENTS[0];
  const activeProvider = PROVIDERS.find((p) => p.id === selectedProvider) || PROVIDERS[0];
  const activeModel = activeProvider.models[0];

  const addLog = useCallback((text: string, color: string) => {
    setLogs((prev) => [...prev, { text, color, ts: Date.now() }]);
  }, []);

  const clearLogs = useCallback(() => {
    setLogs([]);
    setStats({ tokens: 0, latency: 0, requests: 0 });
    setPipelineStatus("idle");
  }, []);

  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs]);

  useEffect(() => {
    return () => { timersRef.current.forEach(clearTimeout); timersRef.current = []; };
  }, []);

  const runSimulation = () => {
    if (pipelineStatus !== "idle" && pipelineStatus !== "complete" && pipelineStatus !== "error") return;
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    setLogs([]);
    setStats({ tokens: 0, latency: 0, requests: 0 });

    const steps: { delay: number; status: PipelineStatus; log: string; color: string }[] = [
      { delay: 0, status: "connecting", log: `~ % ${activeAgent.setupCmd}`, color: "amber" },
      { delay: 400, status: "connecting", log: `[SYSTEM] Bootstrapping dependencies...`, color: "cyan" },
      { delay: 800, status: "routing", log: `[ENV] process.env.${activeProvider.envKey}`, color: "purple" },
      { delay: 1200, status: "routing", log: `[ROUTER] Mapping to ${activeProvider.name}...`, color: "emerald" },
      { delay: 1600, status: "streaming", log: `[API] Model: "${activeModel}"`, color: "indigo" },
      { delay: 2000, status: "streaming", log: `TLS v1.3 established. Latency: ${activeProvider.latency}ms`, color: "green" },
      { delay: 2400, status: "streaming", log: `Dispatching tokens...`, color: "cyan" },
      { delay: 3000, status: "streaming", log: `Response in ${activeProvider.latency + 22}ms. Tokens: 844`, color: "green" },
      { delay: 3400, status: "complete", log: `Token cost: $${((activeProvider.cost / 1e6) * 3949).toFixed(5)}`, color: "amber" },
      { delay: 3600, status: "complete", log: `Session closed. Code 0.`, color: "green" },
    ];

    steps.forEach(({ delay, status, log, color }) => {
      const id = setTimeout(() => {
        setPipelineStatus(status);
        addLog(log, color);
        if (status === "complete") {
          setStats({
            tokens: 3949,
            latency: activeProvider.latency + 22,
            requests: 1,
          });
        }
      }, delay);
      timersRef.current.push(id);
    });
  };

  const currentStepIndex = PIPELINE_STEPS.findIndex((s) => s.key === pipelineStatus);

  return (
    <section style={{ padding: "0 24px 56px", maxWidth: 1100, margin: "0 auto" }}>
      <div className="wireframe-container">
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes flow { 0% { stroke-dashoffset: 120; } 100% { stroke-dashoffset: 0; } }
          @keyframes passive-flow { 0% { stroke-dashoffset: 60; } 100% { stroke-dashoffset: 0; } }
          @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
          @keyframes rotateHub { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
          .data-line { stroke-dasharray: 8 7; animation: flow 2.2s linear infinite; stroke-width: 2.2; fill: none; }
          .passive-data-line { stroke-dasharray: 4 6; animation: passive-flow 6s linear infinite; stroke-width: 0.8; fill: none; }
          .node-pulse { animation: pulse 2.4s ease-in-out infinite; }
          .orb { animation: float 6s ease-in-out infinite; }
          .rotating-ring { transform-origin: center; animation: rotateHub 25s linear infinite; }
        `}} />

        {/* ─── Header ─── */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div>
            <h2 style={{ fontSize: "var(--text-h2)", fontWeight: 700, color: "var(--text)", margin: 0 }}>Interactive Wireframe Engine</h2>
            <p style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)", lineHeight: "var(--leading-small)", margin: "4px 0 0" }}>
              Click agents and providers to see routing paths. Simulate to watch data flow.
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <ThemeToggle />
            <button
              onClick={runSimulation}
              disabled={pipelineStatus !== "idle" && pipelineStatus !== "complete" && pipelineStatus !== "error"}
              className="btn btn-primary"
              style={{ fontSize: 13, padding: "10px 20px" }}
            >
              {(pipelineStatus !== "idle" && pipelineStatus !== "complete" && pipelineStatus !== "error") ? (
                <>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--accent-4)", animation: "pulse 1s infinite", display: "inline-block" }} />
                  Running...
                </>
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3" /></svg>
                  Simulate
                </>
              )}
            </button>
          </div>
        </div>

        {/* ─── Stats Dashboard ─── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 20 }}>
          <div className="stat-card">
            <div className="stat-value" style={{ color: "var(--accent)" }}>{stats.tokens.toLocaleString()}</div>
            <div className="stat-label">Tokens Processed</div>
          </div>
          <div className="stat-card">
            <div className="stat-value" style={{ color: "var(--accent-2)" }}>{stats.latency > 0 ? `${stats.latency}ms` : "—"}</div>
            <div className="stat-label">Avg Latency</div>
          </div>
          <div className="stat-card">
            <div className="stat-value" style={{ color: "var(--green)" }}>{stats.requests}</div>
            <div className="stat-label">Requests</div>
          </div>
        </div>

        {/* ─── Pipeline Status ─── */}
        <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 20, padding: "10px 14px", background: "var(--glass)", borderRadius: 12, border: "1px solid var(--glass-border)", overflowX: "auto" }}>
          {PIPELINE_STEPS.map((step, i) => {
            const isActive = step.key === pipelineStatus;
            const isPast = i < currentStepIndex;
            const dotColor = isPast ? "success" : isActive ? step.dotClass : "waiting";
            const textColor = isPast || isActive ? "var(--text)" : "var(--text-muted)";
            const fontWeight = isActive ? 600 : 400;
            return (
              <React.Fragment key={step.key}>
                {i > 0 && (
                  <div style={{ flex: 1, minWidth: 16, height: 1, background: isPast ? "var(--green)" : "var(--border)", transition: "background 0.3s" }} />
                )}
                <div className="pipeline-step" style={{ flexShrink: 0, color: textColor, fontWeight }}>
                  <span className={`pipeline-dot ${dotColor} ${isActive ? "active" : ""}`} />
                  {step.label}
                </div>
              </React.Fragment>
            );
          })}
        </div>

        {/* ─── Agent & Provider Cards + SVG ─── */}
        <div className="wf-grid">
          {/* Agents Column */}
          <div className="wf-col">
            <div className="wf-section-label">CLI Agents</div>
            {AGENTS.map((agent) => {
              const isSelected = agent.id === selectedAgent;
              const status: "online" | "pending" | "offline" = isSelected ? "online" : "offline";
              return (
                <div
                  key={agent.id}
                  className={`agent-card ${isSelected ? "active" : ""}`}
                  style={{ "--agent-color": agent.color } as React.CSSProperties}
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelectedAgent(agent.id)}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setSelectedAgent(agent.id); } }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ color: agent.color, display: "flex", alignItems: "center", flexShrink: 0 }}>
                      {BRAND_ICONS[agent.icon]}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ fontSize: 13, fontWeight: isSelected ? 600 : 500, color: isSelected ? agent.color : "var(--text)" }}>
                          {agent.name}
                        </span>
                        <span className={`agent-status ${status}`} />
                      </div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)", lineHeight: 1.4, marginTop: 2 }}>
                        {agent.desc}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Providers Column */}
          <div className="wf-col">
            <div className="wf-section-label">Cloud Providers</div>
            {PROVIDERS.map((prov) => {
              const isSelected = prov.id === selectedProvider;
              return (
                <div
                  key={prov.id}
                  className={`agent-card ${isSelected ? "active" : ""}`}
                  style={{ "--agent-color": prov.color } as React.CSSProperties}
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelectedProvider(prov.id)}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setSelectedProvider(prov.id); } }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: prov.color, flexShrink: 0, boxShadow: isSelected ? `0 0 8px ${prov.color}` : "none" }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ fontSize: 13, fontWeight: isSelected ? 600 : 500, color: isSelected ? prov.color : "var(--text)" }}>
                          {prov.name}
                        </span>
                        <span style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                          {prov.latency}ms
                        </span>
                      </div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)", lineHeight: 1.4, marginTop: 2, fontFamily: "var(--font-mono)" }}>
                        {prov.models[0]}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ─── SVG Visualization ─── */}
        <div style={{ background: "var(--surface)", borderRadius: 16, border: "1px solid var(--glass-border)", padding: 8, marginTop: 20 }}>
          <svg viewBox="0 0 800 300" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "auto", maxHeight: 300, display: "block" }}>
            <defs>
              <linearGradient id="gradAgent" x1="184" y1="150" x2="400" y2="150" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor={activeAgent.color} />
                <stop offset="100%" stopColor="var(--green)" />
              </linearGradient>
              <linearGradient id="gradProvider" x1="400" y1="150" x2="616" y2="150" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="var(--green)" />
                <stop offset="100%" stopColor={activeProvider.color} />
              </linearGradient>
              <filter id="softGlow"><feGaussianBlur stdDeviation="12" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
              <filter id="glow"><feGaussianBlur stdDeviation="4" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
            </defs>

            {/* Passive connections */}
            {AGENTS.map((ag, i) => {
              const y = 40 + i * 40;
              const path = `M 184 ${y} C 292 ${y}, 292 150, 400 150`;
              return <path key={`pa-${ag.id}`} d={path} stroke={ag.color} className="passive-data-line" opacity={ag.id === selectedAgent ? 0.3 : 0.08} />;
            })}
            {PROVIDERS.map((p, i) => {
              const y = 15 + i * 38;
              const path = `M 400 150 C 508 150, 508 ${y}, 616 ${y}`;
              return <path key={`pp-${p.id}`} d={path} stroke={p.color} className="passive-data-line" opacity={p.id === selectedProvider ? 0.3 : 0.08} />;
            })}

            {/* Active connection */}
            {(() => {
              const ai = AGENTS.findIndex((a) => a.id === selectedAgent);
              const pi = PROVIDERS.findIndex((p) => p.id === selectedProvider);
              if (ai === -1 || pi === -1) return null;
              const ay = 40 + ai * 40;
              const py = 15 + pi * 38;
              const p1 = `M 184 ${ay} C 292 ${ay}, 292 150, 400 150`;
              const p2 = `M 400 150 C 508 150, 508 ${py}, 616 ${py}`;
              return (
                <g>
                  <path d={p1} stroke="url(#gradAgent)" strokeWidth="4" opacity="0.2" fill="none" filter="url(#softGlow)" />
                  <path d={p1} stroke="url(#gradAgent)" strokeWidth="1.8" fill="none" />
                  <path d={p1} stroke={activeAgent.color} className="data-line" filter="url(#glow)" />
                  <path d={p2} stroke="url(#gradProvider)" strokeWidth="4" opacity="0.2" fill="none" filter="url(#softGlow)" />
                  <path d={p2} stroke="url(#gradProvider)" strokeWidth="1.8" fill="none" />
                  <path d={p2} stroke={activeProvider.color} className="data-line" filter="url(#glow)" />
                </g>
              );
            })()}

            {/* Central hub */}
            <g transform="translate(400, 150)">
              <circle r="28" fill="var(--bg)" />
              <circle r="26" fill="none" stroke={activeAgent.color} strokeWidth="1" strokeDasharray="5 3" className="rotating-ring" opacity="0.7" />
              <circle r="18" fill="none" stroke="var(--green)" strokeWidth="1.2" opacity="0.5" className="node-pulse" />
              <circle r="12" fill="var(--bg)" stroke={activeAgent.color} strokeWidth="2" filter="url(#glow)" />
              <circle r="5" fill="var(--green)" />
              <text y="-34" fill={activeAgent.color} fontSize="9" fontWeight="bold" textAnchor="middle" letterSpacing="1">OLLAMOMUI</text>
              <text y="36" fill="var(--text-muted)" fontSize="8" fontWeight="500" textAnchor="middle" letterSpacing="0.5">NEURAL PROXY</text>
            </g>

            {/* Agent labels */}
            {AGENTS.map((ag, i) => {
              const y = 40 + i * 40;
              const isSel = ag.id === selectedAgent;
              return (
                <g key={`al-${ag.id}`} onClick={() => setSelectedAgent(ag.id)} style={{ cursor: "pointer" }}>
                  <text x="170" y={y + 4} fill={isSel ? ag.color : "var(--text-muted)"} fontSize="10" fontWeight={isSel ? 600 : 400} textAnchor="end">
                    {ag.name}
                  </text>
                  {isSel && <circle cx="178" cy={y} r="4" fill={ag.color} opacity="0.8" />}
                </g>
              );
            })}

            {/* Provider labels */}
            {PROVIDERS.map((p, i) => {
              const y = 15 + i * 38;
              const isSel = p.id === selectedProvider;
              return (
                <g key={`pl-${p.id}`} onClick={() => setSelectedProvider(p.id)} style={{ cursor: "pointer" }}>
                  {isSel && <circle cx="622" cy={y} r="4" fill={p.color} opacity="0.8" />}
                  <text x="632" y={y + 4} fill={isSel ? p.color : "var(--text-muted)"} fontSize="10" fontWeight={isSel ? 600 : 400} textAnchor="start">
                    {p.name}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* ─── Console Log ─── */}
        <div className="console-container" style={{ marginTop: 20 }}>
          <div className="console-header">
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--red)", opacity: 0.7 }} />
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--accent-4)", opacity: 0.7 }} />
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--green)", opacity: 0.7 }} />
              <span style={{ color: "var(--text-muted)", marginLeft: 8 }}>Execution Console</span>
            </div>
            <button className="console-clear-btn" onClick={clearLogs}>Clear</button>
          </div>
          <div className="console-body">
            {logs.length === 0 ? (
              <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "var(--text-muted)" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.4, marginBottom: 8 }}><polyline points="4 17 10 11 4 5" /><line x1="12" y1="19" x2="20" y2="19" /></svg>
                <p style={{ margin: 0, fontSize: 12 }}>Click &quot;Simulate&quot; to observe real-time proxy dispatch.</p>
              </div>
            ) : (
              logs.map((log, i) => (
                <div key={i} className="console-line">
                  <span className="console-timestamp">{formatTime(log.ts)}</span>
                  <span className="console-text" style={{ color: resolveColor(log.color) }}>{log.text}</span>
                </div>
              ))
            )}
            <div ref={terminalEndRef} />
          </div>
        </div>
      </div>
    </section>
  );
}
