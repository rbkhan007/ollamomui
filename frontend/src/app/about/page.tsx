import Link from "next/link";

const pages = [
  { href: "/", title: "Home", desc: "Hero, features, quick start, comparison, and the live neural-proxy diagram." },
  { href: "/playground", title: "Playground", desc: "Stream any model in the browser with markdown rendering and live responses." },
  { href: "/usage", title: "Usage", desc: "Requests, tokens, per-model stats, and recent activity analytics." },
  { href: "/settings", title: "Settings", desc: "Pick a provider, paste a free API key, configure the gateway." },
  { href: "/rag", title: "Knowledge", desc: "Upload documents or paste text; get answers grounded in your data via TF-IDF." },
  { href: "/memory", title: "Memory", desc: "Browse every saved conversation and fact from the persistent SQLite store." },
  { href: "/login", title: "Sign In", desc: "Log into your local account (optional — the server already holds the key)." },
  { href: "/register", title: "Get Started", desc: "Create a local account to sync identity across devices." },
];

const compares = [
  { name: "Ollama", free: "Partial", note: "Great local models, but no free hosted API and no built-in RAG/memory dashboard." },
  { name: "LM Studio", free: "Partial", note: "Local model runner; no Ollama-compatible cloud proxy or multi-provider routing." },
  { name: "Jan", free: "Partial", note: "Local-first chat; lacks a public API gateway for coding tools and free cloud models." },
  { name: "GPT4All", free: "Partial", note: "Local models only; no routing to free cloud providers or RAG UI." },
  { name: "OllamaEmu", free: "Yes", note: "Routes to 100% free cloud LLMs, emulates Ollama/OpenAI/Anthropic APIs, ships RAG + memory + dashboard in one file." },
];

export default function About() {
  return (
    <div style={{ position: "relative", overflow: "hidden" }}>
      <section style={{ padding: "72px 24px 40px", textAlign: "center", maxWidth: 900, margin: "0 auto" }}>
        <div className="spidey-burst" style={{ width: 84, height: 84, fontSize: 12, margin: "0 auto 20px", transform: "rotate(-6deg)" }}>
          ABOUT<br />THIS<br />REPO
        </div>
        <h1 className="spidey-title" style={{ fontSize: "clamp(2rem, 5vw, 3.4rem)", marginBottom: 16 }}>
          One server. Every page. Free.
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "1.1rem", lineHeight: 1.6, maxWidth: 640, margin: "0 auto" }}>
          <b>OllamaEmu</b> emulates the Ollama API and silently routes your prompts to real,
          <b style={{ color: "var(--text)" }}> 100% free</b> LLMs — then gives you RAG, memory, analytics,
          and a polished dashboard. Below is the full map of the app.
        </p>
        <div className="spidey-rule" />
      </section>

      {/* All pages */}
      <section style={{ padding: "24px 24px 40px", maxWidth: 1000, margin: "0 auto" }}>
        <h2 style={{ textAlign: "center", fontSize: "1.6rem", fontWeight: 800, letterSpacing: "-0.02em", marginBottom: 28 }}>
          Explore every page
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
          {pages.map((p) => (
            <Link key={p.href} href={p.href} className="spidey-panel" style={{
              padding: 22, borderRadius: 16, textDecoration: "none", color: "inherit",
              display: "block", background: "var(--surface)", border: "1px solid var(--glass-border)",
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                <h3 style={{ margin: 0, fontSize: "1.15rem", fontWeight: 700 }}>{p.title}</h3>
                <span style={{ fontSize: 18, color: "var(--accent)" }}>→</span>
              </div>
              <p style={{ margin: 0, color: "var(--text-muted)", fontSize: 14, lineHeight: 1.55 }}>{p.desc}</p>
              <code style={{ display: "block", marginTop: 10, fontSize: 11, color: "var(--accent-2)", fontFamily: "var(--font-mono)" }}>
                {p.href === "/" ? "/  (index)" : p.href}
              </code>
            </Link>
          ))}
        </div>
      </section>

      {/* Comparison */}
      <section style={{ padding: "24px 24px 56px", maxWidth: 1000, margin: "0 auto" }}>
        <h2 style={{ textAlign: "center", fontSize: "1.6rem", fontWeight: 800, letterSpacing: "-0.02em", marginBottom: 8 }}>
          How it compares
        </h2>
        <p style={{ textAlign: "center", color: "var(--text-muted)", marginBottom: 28, fontSize: "1rem" }}>
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

      {/* CTA */}
      <section style={{ padding: "0 24px 72px", textAlign: "center" }}>
        <Link href="/" className="spidey-panel" style={{
          display: "inline-flex", alignItems: "center", gap: 10, padding: "14px 26px",
          borderRadius: 14, textDecoration: "none", fontWeight: 700, fontSize: 15,
          background: "var(--gradient-1)", color: "white",
        }}>
          Go to the Homepage →
        </Link>
      </section>
    </div>
  );
}
