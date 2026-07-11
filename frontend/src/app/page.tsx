import Link from "next/link";
import {
  REPO_URL,
  RELEASES_URL,
  DOWNLOAD_URL,
  EXE_URL,
  FREETIER_URL,
  SITE_URL,
} from "@/lib/config";

const features = [
  { icon: "chat", title: "Chat Playground", desc: "Stream any model in the browser with markdown rendering and real-time responses.", color: "#6c5ce7" },
  { icon: "brain", title: "RAG Knowledge Base", desc: "Upload docs or paste text and get answers grounded in your own data via TF-IDF search.", color: "#fd79a8" },
  { icon: "shield", title: "Persistent Memory", desc: "Every conversation auto-saves to SQLite. Facts, sessions & context survive restarts.", color: "#00cec9" },
  { icon: "infinity", title: "Multi-Provider", desc: "OpenRouter, OpenAI, Anthropic, Groq, DeepSeek, Gemini, Mistral, Together — one box.", color: "#fdcb6e" },
  { icon: "lightning", title: "Zero Config", desc: "One Python file. Run it, paste a free API key, and point Claude Code or OpenCode at it.", color: "#e17055" },
  { icon: "terminal", title: "Full Compatibility", desc: "Ollama, OpenAI, and Anthropic API formats — works with every major AI coding tool.", color: "#00b894" },
];

const clients = ["Claude Code", "OpenCode", "Cursor", "Continue.dev", "Ollama CLI", "OpenAI SDK"];

const steps = [
  { n: "1", title: "Download & run", desc: "Grab the single-file EXE (or run.bat / run.sh) — it opens http://localhost:11434 automatically." },
  { n: "2", title: "Add a free key", desc: "Paste any free API key (OpenRouter, OpenAI, etc.) in Settings. 10+ free models are ready out of the box." },
  { n: "3", title: "Point your tools", desc: "Set ANTHROPIC_BASE_URL=http://localhost:11434 (or /v1 for OpenAI) and start coding with free LLMs." },
];

const compares = [
  { name: "Ollama", free: "Partial", note: "Great local models, but no free hosted API and no built-in RAG/memory dashboard." },
  { name: "LM Studio", free: "Partial", note: "Local model runner; no Ollama-compatible cloud proxy or multi-provider routing." },
  { name: "Jan", free: "Partial", note: "Local-first chat; lacks a public API gateway for coding tools and free cloud models." },
  { name: "GPT4All", free: "Partial", note: "Local models only; no routing to free cloud providers or RAG UI." },
  { name: "OllamaEmu", free: "Yes", note: "Routes to 100% free cloud LLMs, emulates Ollama/OpenAI/Anthropic APIs, ships RAG + memory + dashboard in one file." },
];

function FeatureGlyph({ type, color }: { type: string; color: string }) {
  const s = 22;
  const common = { width: s, height: s, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  const map: Record<string, React.JSX.Element> = {
    chat: <svg {...common}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>,
    brain: <svg {...common}><path d="M12 2a4 4 0 0 0-4 4v1a3 3 0 0 0-3 3 3 3 0 0 0 1 2.24V15a4 4 0 0 0 4 4h4a4 4 0 0 0 4-4v-2.76A3 3 0 0 0 23 11a3 3 0 0 0-3-3V6a4 4 0 0 0-4-4z" /></svg>,
    shield: <svg {...common}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>,
    infinity: <svg {...common}><path d="M18 9a4 4 0 1 0-3 6.6" /><path d="M6 15a4 4 0 1 0 3-6.6" /></svg>,
    lightning: <svg {...common}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>,
    terminal: <svg {...common}><polyline points="4 17 10 11 4 5" /><line x1="12" y1="19" x2="20" y2="19" /></svg>,
  };
  return map[type] || null;
}

export default function Home() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "OllamaEmu",
    operatingSystem: "Windows, macOS, Linux, Android",
    applicationCategory: "DeveloperApplication",
    author: { "@type": "Person", name: "Rhasan@dev" },
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    url: SITE_URL,
    downloadUrl: EXE_URL,
  };
  return (
    <div style={{ position: "relative", overflow: "hidden" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {/* Hero */}
      <section style={{
        padding: "88px 24px 64px", textAlign: "center",
      }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          padding: "8px 20px", borderRadius: 50,
          background: "rgba(108,92,231,0.08)", border: "1px solid rgba(108,92,231,0.15)",
          fontSize: 13, color: "var(--text-muted)", marginBottom: 28, fontWeight: 500,
        }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#00b894", boxShadow: "0 0 10px #00b894" }} />
          v1.0.0 &middot; Free &amp; Open Source &middot; 100% Local
        </div>

        <h1 className="spidey-title" style={{
          fontWeight: 800, lineHeight: 1.08, letterSpacing: "-0.03em",
          fontSize: "clamp(2.4rem, 6vw, 4.2rem)", margin: "0 auto 20px", maxWidth: 900,
        }}>
          <span style={{
            background: "linear-gradient(135deg, var(--text) 0%, #6c5ce7 45%, #00cec9 75%, var(--text) 100%)",
            backgroundSize: "200% auto", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            animation: "shimmer 4s linear infinite",
          }}>
            Your free LLMs,
          </span>
          <br />
          <span style={{ color: "var(--text-muted)" }}>one local server.</span>
        </h1>

        <p style={{
          maxWidth: 620, margin: "0 auto 36px", fontSize: "1.15rem",
          color: "var(--text-muted)", lineHeight: 1.6,
        }}>
          OllamaEmu emulates the Ollama API and silently routes your prompts to real,
          <b style={{ color: "var(--text)" }}> 100% free</b> models — then gives you RAG, memory,
          analytics, and a polished dashboard.
        </p>

        <div style={{
          display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap", marginBottom: 14,
        }}>
          <a href={REPO_URL} target="_blank" rel="noopener noreferrer" style={{
            padding: "13px 22px", borderRadius: 12, fontSize: 15, fontWeight: 700,
            background: "var(--gradient-1)", color: "white", textDecoration: "none",
            display: "inline-flex", alignItems: "center", gap: 8,
            boxShadow: "0 6px 22px rgba(108,92,231,0.35)",
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .5C5.7.5.5 5.7.5 12c0 5.1 3.3 9.4 7.9 10.9.6.1.8-.2.8-.5v-2c-3.2.7-3.9-1.4-3.9-1.4-.5-1.3-1.3-1.7-1.3-1.7-1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.7 1.3 3.4 1 .1-.8.4-1.3.7-1.6-2.6-.3-5.3-1.3-5.3-5.7 0-1.3.5-2.3 1.2-3.1-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0c2.3-1.5 3.3-1.2 3.3-1.2.6 1.6.2 2.8.1 3.1.8.8 1.2 1.8 1.2 3.1 0 4.4-2.7 5.4-5.3 5.7.4.4.8 1.1.8 2.2v3.3c0 .3.2.6.8.5A11.5 11.5 0 0 0 23.5 12C23.5 5.7 18.3.5 12 .5z" /></svg>
            Star on GitHub
          </a>
          <a href={DOWNLOAD_URL} target="_blank" rel="noopener noreferrer" style={{
            padding: "13px 22px", borderRadius: 12, fontSize: 15, fontWeight: 700,
            background: "var(--surface)", color: "var(--text)", textDecoration: "none",
            border: "1px solid var(--glass-border)",
            display: "inline-flex", alignItems: "center", gap: 8,
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
            Download for Windows
          </a>
          <a href={FREETIER_URL} target="_blank" rel="noopener noreferrer" style={{
            padding: "13px 22px", borderRadius: 12, fontSize: 15, fontWeight: 700,
            background: "rgba(0,206,201,0.12)", color: "#00cec9", textDecoration: "none",
            border: "1px solid rgba(0,206,201,0.3)",
            display: "inline-flex", alignItems: "center", gap: 8,
          }}>
            🌐 Try Free Tier
          </a>
        </div>
        <div style={{ fontSize: 13, color: "var(--text-muted)" }}>
          or <a href={RELEASES_URL} target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent-2)" }}>browse all releases</a> &middot; macOS / Linux via <code style={{ fontFamily: "var(--font-mono)" }}>run.sh</code>
        </div>

        <div style={{ position: "relative", maxWidth: 760, margin: "48px auto 0" }}>
          <img
            src="/neural-proxy.svg"
            alt="OllamaEmu neural proxy — routes your prompts to free LLMs"
            className="spidey-panel"
            style={{ width: "100%", height: "auto", display: "block", borderRadius: 22, animation: "floatSlow 7s ease-in-out infinite" }}
          />
          <div className="spidey-burst" style={{ position: "absolute", top: -16, left: -8, width: 92, height: 92, fontSize: 12, transform: "rotate(-10deg)" }}>
            FREE<br />LOCAL<br />AI
          </div>
        </div>
      </section>

      {/* Works with */}
      <section style={{ padding: "0 24px 24px", textAlign: "center" }}>
        <p style={{ fontSize: 13, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 18 }}>
          Works with your favorite tools
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          {clients.map((c) => (
            <span key={c} style={{
              padding: "8px 16px", borderRadius: 10, fontSize: 14, fontWeight: 600,
              background: "var(--surface)", border: "1px solid var(--glass-border)", color: "var(--text-muted)",
            }}>
              {c}
            </span>
          ))}
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: "56px 24px", maxWidth: 1100, margin: "0 auto" }}>
        <h2 style={{ textAlign: "center", fontSize: "2rem", fontWeight: 800, letterSpacing: "-0.02em", marginBottom: 8 }}>
          Everything you need, nothing you pay for
        </h2>
        <p style={{ textAlign: "center", color: "var(--text-muted)", marginBottom: 40, fontSize: "1.05rem" }}>
          A complete local AI gateway — proxies, brains, and a dashboard in a single 1.4k-line server.
        </p>
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 18,
        }}>
           {features.map((f) => (
              <div key={f.title} className="spidey-panel" style={{
                padding: 24, borderRadius: 16, background: "var(--surface)",
                border: "1px solid var(--glass-border)",
              }}>
               <div style={{
                 width: 44, height: 44, borderRadius: 12, marginBottom: 16,
                 display: "flex", alignItems: "center", justifyContent: "center",
                 background: `${f.color}1a`, border: `1px solid ${f.color}33`,
               }}>
                 <FeatureGlyph type={f.icon} color={f.color} />
               </div>
               <h3 style={{ margin: "0 0 8px", fontSize: "1.1rem", fontWeight: 700 }}>{f.title}</h3>
               <p style={{ margin: 0, color: "var(--text-muted)", fontSize: 14, lineHeight: 1.6 }}>{f.desc}</p>
             </div>
           ))}
        </div>
      </section>

      {/* How it works */}
      <section style={{ padding: "24px 24px 56px", maxWidth: 1000, margin: "0 auto" }}>
        <h2 style={{ textAlign: "center", fontSize: "2rem", fontWeight: 800, letterSpacing: "-0.02em", marginBottom: 40 }}>
          Live in 60 seconds
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20 }}>
           {steps.map((s) => (
              <div key={s.n} className="spidey-panel" style={{
                padding: 24, borderRadius: 16, background: "var(--surface)",
                border: "1px solid var(--glass-border)", textAlign: "center",
              }}>
               <div style={{
                 width: 40, height: 40, borderRadius: "50%", margin: "0 auto 14px",
                 background: "var(--gradient-1)", color: "white", fontWeight: 800, fontSize: 18,
                 display: "flex", alignItems: "center", justifyContent: "center",
               }}>{s.n}</div>
               <h3 style={{ margin: "0 0 8px", fontSize: "1.1rem", fontWeight: 700 }}>{s.title}</h3>
               <p style={{ margin: 0, color: "var(--text-muted)", fontSize: 14, lineHeight: 1.6 }}>{s.desc}</p>
             </div>
           ))}
        </div>
      </section>

      {/* Comparison — go viral */}
      <section style={{ padding: "0 24px 56px", maxWidth: 1000, margin: "0 auto" }}>
        <h2 style={{ textAlign: "center", fontSize: "2rem", fontWeight: 800, letterSpacing: "-0.02em", marginBottom: 8 }}>
          Why OllamaEmu wins
        </h2>
        <p style={{ textAlign: "center", color: "var(--text-muted)", marginBottom: 28, fontSize: "1.05rem" }}>
          The only option that is <b style={{ color: "var(--green)" }}>100% free</b> <i>and</i> gives you a coding-tool-ready API gateway.
        </p>
        <div style={{ display: "grid", gap: 12 }}>
          {compares.map((c) => {
            const isUs = c.name === "OllamaEmu";
            return (
              <div key={c.name} className={isUs ? "spidey-panel" : ""} style={{
                padding: "16px 22px", borderRadius: 14,
                display: "grid", gridTemplateColumns: "160px 90px 1fr", gap: 16, alignItems: "center",
                background: isUs ? "linear-gradient(135deg, rgba(108,92,231,0.12), rgba(0,206,201,0.10))" : "var(--surface)",
                border: isUs ? "1px solid rgba(108,92,231,0.35)" : "1px solid var(--glass-border)",
              }}>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{c.name}</div>
                <div>
                  <span className={`badge ${c.free === "Yes" ? "badge-green" : "badge-amber"}`}>{c.free === "Yes" ? "Free" : "Partial"}</span>
                </div>
                <div style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.5 }}>{c.note}</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Free tier CTA */}
      <section style={{ padding: "0 24px 72px", maxWidth: 900, margin: "0 auto" }}>
        <div style={{
          padding: "40px 32px", borderRadius: 20, textAlign: "center",
          background: "linear-gradient(135deg, rgba(108,92,231,0.12), rgba(0,206,201,0.12))",
          border: "1px solid var(--glass-border)",
        }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>🌐</div>
          <h2 style={{ margin: "0 0 12px", fontSize: "1.7rem", fontWeight: 800, letterSpacing: "-0.02em" }}>
            Zero-setup Free Tier
          </h2>
          <p style={{ margin: "0 auto 24px", maxWidth: 560, color: "var(--text-muted)", fontSize: "1.05rem", lineHeight: 1.6 }}>
            Don&apos;t want to run anything? The hosted gateway gives you 10+ free models with one click.
            No install, no API key required to try.
          </p>
          <a href={FREETIER_URL} target="_blank" rel="noopener noreferrer" style={{
            padding: "13px 26px", borderRadius: 12, fontSize: 15, fontWeight: 700,
            background: "var(--gradient-1)", color: "white", textDecoration: "none",
            display: "inline-flex", alignItems: "center", gap: 8,
            boxShadow: "0 6px 22px rgba(108,92,231,0.35)",
          }}>
            Open Free Tier &rarr;
          </a>
        </div>
      </section>

      {/* Final CTA */}
      <section style={{ padding: "0 24px 80px", textAlign: "center" }}>
        <h2 style={{ fontSize: "2rem", fontWeight: 800, letterSpacing: "-0.02em", marginBottom: 12 }}>
          Stop paying for AI. Run it free, locally.
        </h2>
        <p style={{ color: "var(--text-muted)", marginBottom: 28, fontSize: "1.05rem" }}>
          ⭐ Star the repo and share it — virality is the only price.
        </p>
        <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
          <a href={REPO_URL} target="_blank" rel="noopener noreferrer" style={{
            padding: "13px 22px", borderRadius: 12, fontSize: 15, fontWeight: 700,
            background: "var(--surface)", color: "var(--text)", textDecoration: "none",
            border: "1px solid var(--glass-border)", display: "inline-flex", alignItems: "center", gap: 8,
          }}>
            ⭐ Star on GitHub
          </a>
          <Link href="/playground" style={{
            padding: "13px 22px", borderRadius: 12, fontSize: 15, fontWeight: 700,
            background: "var(--gradient-1)", color: "white", textDecoration: "none",
            display: "inline-flex", alignItems: "center", gap: 8,
          }}>
            Open the App &rarr;
          </Link>
        </div>
      </section>
    </div>
  );
}
