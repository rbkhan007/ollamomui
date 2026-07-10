"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/AuthContext";
import { FeatureIcon, HeroIllustration, ProviderLogos, CodeSnippet } from "@/components/Icons";
import { BrandIcon, ProviderIcon } from "@/components/BrandIcon";

type Status = { active_provider: string; api_key_set: boolean; model_count: number };

const features = [
  { icon: "chat", title: "Chat Playground", desc: "Test any model directly in the browser with real-time streaming responses and markdown rendering.", color: "#6c5ce7" },
  { icon: "brain", title: "RAG Knowledge Base", desc: "Upload documents, paste text, and get AI answers grounded in your own data via TF-IDF search.", color: "#fd79a8" },
  { icon: "shield", title: "Persistent Memory", desc: "Auto-saves every conversation to SQLite. Facts, sessions, and context persist across restarts.", color: "#00cec9" },
  { icon: "infinity", title: "Multi-Provider", desc: "OpenRouter, OpenAI, Anthropic, Groq, DeepSeek, Gemini, Mistral, Together \u2014 all in one place.", color: "#fdcb6e" },
  { icon: "lightning", title: "Zero Config", desc: "One Python file. Run it, paste your API key, and start using Claude Code or OpenCode instantly.", color: "#e17055" },
  { icon: "terminal", title: "Full Compatibility", desc: "Ollama, OpenAI, and Anthropic API formats \u2014 works with every major AI coding tool.", color: "#00b894" },
];

const clients = [
  { name: "Claude Code", key: "ClaudeCode", color: "#fd79a8", cmd: "claude --provider-url localhost:11434" },
  { name: "OpenCode", key: "OpenCode", color: "#6c5ce7", cmd: "OLLAMA_BASE_URL=localhost:11434" },
  { name: "Ollama CLI", key: "Ollama", color: "#00cec9", cmd: "OLLAMA_HOST=localhost:11434 ollama run llama3" },
  { name: "OpenAI SDK", key: "OpenAI", color: "#00b894", cmd: 'base_url="http://localhost:11434/v1"' },
];

export default function Home() {
  const { isAuthenticated } = useAuth();
  const [status, setStatus] = useState<Status | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
    fetch("/api/status").then(r => r.json()).then(setStatus).catch(error => {
      console.error("Failed to fetch status:", error);
      // Optionally set an error state to show in UI
    });
  }, []);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Ollama Emulator Desktop Ultimate",
    "operatingSystem": "Windows, macOS, Linux, Android",
    "applicationCategory": "DeveloperApplication",
    "author": { "@type": "Person", "name": "Rhasan@dev" },
    "description":
      "A local server that emulates the Ollama API and routes prompts to real, free LLM models via OpenRouter, OpenAI, Anthropic, Groq, DeepSeek, and Gemini. Includes built-in RAG, persistent memory, and a Next.js dashboard.",
    "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
  };

  return (
    <div style={{ position: "relative", minHeight: "100vh" }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero */}
      <section style={{
        padding: "80px 32px 60px", textAlign: "center", position: "relative", overflow: "hidden",
        opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(30px)",
        transition: "all 0.8s cubic-bezier(0.16,1,0.3,1)",
      }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          padding: "8px 20px", borderRadius: 50,
          background: "rgba(108,92,231,0.08)", border: "1px solid rgba(108,92,231,0.15)",
          fontSize: 13, color: "var(--text-muted)", marginBottom: 32, fontWeight: 500,
        }}>
          <span className={`status-dot ${status?.api_key_set ? "status-dot-green" : "status-dot-red"}`} />
          v0.6.0 &middot; Free &amp; Open Source
        </div>

        <h1 className="hero-title" style={{
          fontWeight: 800, lineHeight: 1.1,
          marginBottom: 24, letterSpacing: "-0.03em",
          maxWidth: 800, margin: "0 auto 24px",
        }}>
          <span style={{
            background: "linear-gradient(135deg, var(--text) 0%, #6c5ce7 40%, #00cec9 70%, var(--text) 100%)",
            backgroundSize: "200% auto",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            animation: "shimmer 4s linear infinite",
          }}>
            Ollama Emulator
          </span>
          <br />
          <span style={{ color: "var(--text-muted)", fontSize: "1.875rem", fontWeight: 600 }}>
            Desktop Ultimate
          </span>
        </h1>

        <p style={{ fontSize: "1.125rem", color: "var(--text-muted)", maxWidth: 640, margin: "0 auto 40px", lineHeight: 1.7 }}>
          A local server that emulates the Ollama API and routes your prompts to{" "}
          <span style={{ color: "var(--accent-2)", fontWeight: 600 }}>real, free LLM models</span> —
          OpenRouter, OpenAI, Anthropic, Groq, DeepSeek, Gemini, and more. Includes a
          built-in RAG knowledge base, persistent memory, and a polished chat playground.
        </p>

        <div style={{ display: "flex", gap: 12, justifyContent: "center", marginBottom: 40, flexWrap: "wrap" }}>
          {isAuthenticated ? (
            <>
              <Link href="/playground" className="btn btn-primary btn-lg" style={{ fontSize: 15 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                Open Playground
              </Link>
              <Link href="/settings" className="btn btn-ghost btn-lg">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                </svg>
                Configure Provider
              </Link>
            </>
          ) : (
            <>
              <Link href="/register" className="btn btn-primary btn-lg" style={{ fontSize: 15 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="8.5" cy="7" r="4" />
                  <line x1="20" y1="8" x2="20" y2="14" />
                  <line x1="23" y1="11" x2="17" y2="11" />
                </svg>
                Get Started
              </Link>
              <Link href="/login" className="btn btn-ghost btn-lg">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                  <polyline points="10 17 15 12 10 7" />
                  <line x1="15" y1="12" x2="3" y2="12" />
                </svg>
                Sign In
              </Link>
            </>
          )}
        </div>

        <ProviderLogos />
        <div style={{ marginTop: 60, animation: "floatSlow 6s ease-in-out infinite" }}>
          <HeroIllustration />
        </div>
      </section>

      {/* Stats */}
      {status && (
        <section style={{ padding: "0 32px", maxWidth: 1000, margin: "0 auto 60px" }}>
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1,
            background: "var(--surface)", borderRadius: 16,
            border: "1px solid var(--glass-border)", overflow: "hidden",
          }}>
            {[
              { label: "Active Provider", value: status.active_provider, color: "#6c5ce7" },
              { label: "API Key", value: status.api_key_set ? "Configured" : "Not Set", color: status.api_key_set ? "var(--green)" : "var(--red)" },
              { label: "Models Loaded", value: String(status.model_count), color: "var(--accent-2)" },
            ].map((s) => (
              <div key={s.label} style={{ padding: "20px 24px", textAlign: "center" }}>
                <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>
                  {s.label}
                </div>
                <div style={{ fontSize: 18, fontWeight: 700, color: s.color }}>
                  {s.value}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Features */}
      <section style={{ padding: "60px 32px", maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <h2 style={{ fontSize: "1.875rem", fontWeight: 800, marginBottom: 12, letterSpacing: "-0.02em" }}>
            Everything you need
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: "1.125rem", lineHeight: 1.6 }}>
            One server, every provider, full API compatibility.
          </p>
        </div>
        <div className="feature-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          {features.map((f, i) => (
            <div key={f.title} className="card card-glow" style={{
              padding: 28,
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(20px)",
              transition: `all 0.6s cubic-bezier(0.16,1,0.3,1) ${0.1 + i * 0.08}s`,
            }}>
              <div style={{ marginBottom: 16 }}>
                {f.icon === "infinity" ? (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
                    {["OpenRouter", "OpenAI", "Anthropic", "Groq", "DeepSeek", "Gemini", "Mistral", "Together"].map((b) => (
                      <ProviderIcon key={b} name={b} size={26} />
                    ))}
                  </div>
                ) : (
                  <FeatureIcon type={f.icon} size={44} />
                )}
              </div>
              <h3 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: 8, color: "var(--text)" }}>
                {f.title}
              </h3>
              <p style={{ fontSize: "0.9375rem", color: "var(--text-muted)", lineHeight: 1.6 }}>
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Quick Start */}
      <section style={{ padding: "60px 32px", maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40, alignItems: "center" }} className="code-grid">
          <div>
            <div style={{
              display: "inline-block", padding: "6px 14px", borderRadius: 8,
              background: "rgba(108,92,231,0.1)", color: "#6c5ce7",
              fontSize: 12, fontWeight: 600, marginBottom: 16, letterSpacing: "0.05em",
            }}>
              QUICK START
            </div>
            <h2 style={{ fontSize: "1.875rem", fontWeight: 800, marginBottom: 16, letterSpacing: "-0.02em", lineHeight: 1.2 }}>
              Up and running in{" "}
              <span style={{ color: "var(--accent-2)" }}>60 seconds</span>
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {[
                { step: "1", title: "Launch the server", desc: "Run: python ollama_emu_desktop.py" },
                { step: "2", title: "Add your API key", desc: "Open Settings and choose a provider (OpenRouter offers a free tier)" },
                { step: "3", title: "Connect your tools", desc: "Point Claude Code, OpenCode, or curl at http://localhost:11434" },
              ].map((s) => (
                <div key={s.step} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 10,
                    background: "rgba(108,92,231,0.1)", border: "1px solid rgba(108,92,231,0.2)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 14, fontWeight: 700, color: "#6c5ce7", flexShrink: 0,
                  }}>
                    {s.step}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>{s.title}</div>
                    <div style={{ fontSize: 13, color: "var(--text-muted)" }}>{s.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <CodeSnippet />
        </div>
      </section>

      {/* Clients */}
      <section style={{ padding: "60px 32px", maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <h2 style={{ fontSize: "1.875rem", fontWeight: 800, marginBottom: 12, letterSpacing: "-0.02em" }}>
            Works with your favorite tools
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: "1.125rem" }}>
            Drop-in replacement for any Ollama-compatible client
          </p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }} className="feature-grid">
          {clients.map((c) => (
            <div key={c.name} className="card card-glow" style={{ padding: 24, textAlign: "center" }}>
              <div style={{
                width: 48, height: 48, borderRadius: 14, margin: "0 auto 16px",
                background: `${c.color}15`, border: `1px solid ${c.color}25`,
                display: "flex", alignItems: "center", justifyContent: "center",
                color: c.color,
              }}>
                <BrandIcon name={c.key} size={28} color={c.color} />
              </div>
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 8 }}>{c.name}</h3>
              <code style={{
                display: "block", fontSize: 10, color: c.color,
                background: `${c.color}08`, padding: "6px 10px", borderRadius: 6,
                fontFamily: "'JetBrains Mono', monospace", wordBreak: "break-all", lineHeight: 1.5,
              }}>
                {c.cmd}
              </code>
            </div>
          ))}
        </div>
      </section>

      {/* API Formats */}
      <section style={{ padding: "60px 32px", maxWidth: 900, margin: "0 auto" }}>
        <div className="card" style={{
          padding: 40, textAlign: "center",
          background: "linear-gradient(135deg, rgba(108,92,231,0.06), rgba(0,206,201,0.04))",
          border: "1px solid rgba(108,92,231,0.12)",
        }}>
          <h2 style={{ fontSize: "1.875rem", fontWeight: 800, marginBottom: 24 }}>Three APIs in One</h2>
          <div style={{ display: "flex", gap: 20, justifyContent: "center", flexWrap: "wrap" }}>
            {[
              { name: "Ollama", paths: ["/api/chat", "/api/tags", "/api/generate"], color: "var(--accent-2)" },
              { name: "OpenAI", paths: ["/v1/chat/completions", "/v1/models"], color: "var(--green)" },
              { name: "Anthropic", paths: ["/v1/messages"], color: "#fd79a8" },
            ].map((a) => (
              <div key={a.name} style={{
                padding: "16px 24px", borderRadius: 12, minWidth: 200,
                background: `${a.color}08`, border: `1px solid ${a.color}20`, textAlign: "left",
              }}>
                <div style={{ fontWeight: 700, color: a.color, marginBottom: 8, fontSize: 14 }}>{a.name} API</div>
                {a.paths.map((p) => (
                  <div key={p} style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "'JetBrains Mono', monospace", marginBottom: 3 }}>
                    {p}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
