import Link from "next/link";
import type { Metadata } from "next";
import { SITE_URL, REPO_URL } from "@/lib/config";

export const metadata: Metadata = {
  title: "About — OllamoMUI",
  description: "OllamoMUI is a free, self-hosted AI gateway with 26 free LLMs, RAG, memory, desktop and mobile clients. Built by Rhasan@dev.",
  alternates: { canonical: `${SITE_URL}/about` },
  openGraph: {
    title: "About OllamoMUI — Free AI Gateway",
    description: "26 free LLMs, RAG knowledge base, persistent memory, desktop EXE, mobile app — all in one self-hosted platform.",
    url: `${SITE_URL}/about`,
  },
};

const timeline = [
  { year: "2024", event: "Project started as a simple Ollama API emulator for free OpenRouter models." },
  { year: "2025", event: "Added RAG engine with pgvector, persistent memory system, and the first desktop GUI prototype." },
  { year: "2026", event: "Full rebrand to OllamoMUI. Mobile app, Lemon Squeezy payments, license management, and marketing site launched." },
];

const stats = [
  { value: "26", label: "Free LLMs" },
  { value: "181", label: "Source Files" },
  { value: "13", label: "Test Suites" },
  { value: "3", label: "Platforms" },
];

export default function About() {
  return (
    <div style={{ position: "relative", overflow: "hidden" }}>
      {/* Hero */}
      <section style={{ padding: "72px 24px 40px", textAlign: "center", maxWidth: 900, margin: "0 auto" }}>
        <h1 style={{ fontSize: "clamp(2rem, 5vw, 3.4rem)", fontWeight: 800, marginBottom: 16 }}>
          The story behind OllamoMUI
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "1.1rem", lineHeight: 1.6, maxWidth: 640, margin: "0 auto" }}>
          OllamoMUI started as a simple idea: <b>why pay $20/mo for ChatGPT when free models are just as good?</b>
          <br /><br />
          We built a lightweight API gateway that emulates Ollama, OpenAI, and Anthropic formats — routing every prompt
          to the best <b style={{ color: "var(--text)" }}>completely free</b> LLM available. Then we added RAG, memory,
          a desktop app, a mobile app, and a full payment/licensing system. All open-source.
        </p>
        <div style={{ marginTop: 24 }}>
          <a href={REPO_URL} target="_blank" rel="noopener noreferrer"
             style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 24px",
                      borderRadius: 12, background: "var(--gradient-1)", color: "#fff",
                      textDecoration: "none", fontWeight: 700, fontSize: 15 }}>
            Star on GitHub ★
          </a>
        </div>
      </section>

      {/* Stats */}
      <section style={{ padding: "24px", maxWidth: 800, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 16 }}>
          {stats.map((s) => (
            <div key={s.label} className="spidey-panel" style={{
              textAlign: "center", padding: "20px 12px", borderRadius: 14,
              background: "var(--surface)", border: "1px solid var(--glass-border)",
            }}>
              <div style={{ fontSize: "2rem", fontWeight: 800, color: "var(--accent)" }}>{s.value}</div>
              <div style={{ fontSize: 13, color: "var(--text-muted)" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Timeline */}
      <section style={{ padding: "40px 24px", maxWidth: 700, margin: "0 auto" }}>
        <h2 style={{ textAlign: "center", fontSize: "1.6rem", fontWeight: 800, marginBottom: 28 }}>
          Timeline
        </h2>
        <div style={{ position: "relative", paddingLeft: 28 }}>
          <div style={{
            position: "absolute", left: 8, top: 0, bottom: 0, width: 2,
            background: "var(--accent-2)", opacity: 0.3,
          }} />
          {timeline.map((t) => (
            <div key={t.year} style={{ position: "relative", marginBottom: 24 }}>
              <div style={{
                position: "absolute", left: -24, top: 4, width: 12, height: 12,
                borderRadius: "50%", background: "var(--accent)",
              }} />
              <div style={{ fontWeight: 800, fontSize: 14, color: "var(--accent)", marginBottom: 4 }}>
                {t.year}
              </div>
              <div style={{ color: "var(--text-muted)", fontSize: 14, lineHeight: 1.6 }}>
                {t.event}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* What's Included */}
      <section style={{ padding: "24px 24px 48px", maxWidth: 1000, margin: "0 auto" }}>
        <h2 style={{ textAlign: "center", fontSize: "1.6rem", fontWeight: 800, marginBottom: 24 }}>
          What's included
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
          {[
            { title: "Backend (FastAPI)", items: ["26 free LLMs via OpenRouter", "RAG engine with hybrid search", "Persistent memory with summarization", "Multi-provider routing", "Lemon Squeezy payments", "License key generation & email", "Rate limiting & audit logging"] },
            { title: "Desktop (PySide6 + QML)", items: ["Dual dark/light theme", "Chat playground", "RAG & memory browsers", "Embedded terminal", "Auto-updater", "License activation screen"] },
            { title: "Mobile (React Native)", items: ["Chat, providers, RAG, memory", "License activation", "Usage analytics", "Dark theme UI", "Bottom navigation"] },
            { title: "Frontend (Next.js)", items: ["Marketing site with pricing", "Public playground demo", "RAG & memory demo pages", "Payment result pages", "SEO-optimized pages"] },
          ].map((section) => (
            <div key={section.title} className="spidey-panel" style={{
              padding: 20, borderRadius: 14, background: "var(--surface)", border: "1px solid var(--glass-border)",
            }}>
              <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: 10 }}>{section.title}</h3>
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {section.items.map((item) => (
                  <li key={item} style={{ padding: "3px 0", fontSize: 13, color: "var(--text-muted)" }}>
                    ✓ {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Tech Stack */}
      <section style={{ padding: "24px 24px 48px", maxWidth: 900, margin: "0 auto", textAlign: "center" }}>
        <h2 style={{ fontSize: "1.6rem", fontWeight: 800, marginBottom: 20 }}>
          Built with
        </h2>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center" }}>
           {["Python 3.14", "FastAPI", "PySide6", "QML", "Next.js", "React Native", "Expo", "PostgreSQL", "pgvector", "Docker", "Nginx", "Vercel", "Render", "NeonDB", "Lemon Squeezy", "Cloudflare"].map((tech) => (
            <span key={tech} style={{
              padding: "6px 14px", borderRadius: 20, fontSize: 13, fontWeight: 600,
              background: "var(--surface)", border: "1px solid var(--glass-border)",
              color: "var(--text-muted)",
            }}>
              {tech}
            </span>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "0 24px 72px", textAlign: "center" }}>
        <Link href="/pricing" style={{
          display: "inline-flex", alignItems: "center", gap: 10, padding: "14px 26px",
          borderRadius: 14, textDecoration: "none", fontWeight: 700, fontSize: 15,
          background: "var(--gradient-1)", color: "white",
        }}>
          View Pricing →
        </Link>
        <br /><br />
        <a href={REPO_URL} target="_blank" rel="noopener noreferrer" className="break-all" style={{
          color: "var(--text-muted)", fontSize: 13, wordBreak: "break-all", overflowWrap: "anywhere",
        }}>
          GitHub → {REPO_URL}
        </a>
      </section>
    </div>
  );
}
