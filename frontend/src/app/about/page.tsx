import Link from "next/link";
import type { Metadata } from "next";
import { JsonLd } from "@/components/JsonLd";
import { SITE_URL, REPO_URL } from "@/lib/config";

export const metadata: Metadata = {
  title: "About",
  description: "OllamoMUI is the best free Ollama alternative — a self-hosted AI gateway with 26 free LLMs, RAG knowledge base, persistent memory, desktop and mobile clients. Built by Rhasan@dev.",
  alternates: { canonical: `${SITE_URL}/about` },
  openGraph: {
    title: "About — Free Ollama Alternative",
    description: "The story behind the best free Ollama alternative. 26 free LLMs, RAG knowledge base, persistent memory, desktop EXE, mobile app — all self-hosted.",
    url: `${SITE_URL}/about`,
    images: [{ url: `${SITE_URL}/og-image.png`, width: 1200, height: 630, alt: "About OllamoMUI" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "About — Free Ollama Alternative",
    description: "The story behind the best free Ollama alternative. 26 free LLMs, RAG, memory, desktop & mobile.",
    images: [`${SITE_URL}/og-image.png`],
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
  const breadLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "About", item: `${SITE_URL}/about` },
    ],
  };
  return (
    <div style={{ position: "relative", overflow: "hidden" }}>
      <JsonLd data={breadLd} />
      <section style={{ padding: "clamp(64px, 6vw, 96px) 24px 64px", textAlign: "center", maxWidth: 900, margin: "0 auto" }}>
        <h1 style={{ fontSize: "var(--text-h1)", fontWeight: 700, marginBottom: 16, lineHeight: "var(--leading-heading)" }}>
          The story behind OllamoMUI
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "var(--text-body)", lineHeight: "var(--leading-body)", maxWidth: 640, margin: "0 auto" }}>
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
      <section style={{ padding: "64px 24px", maxWidth: 800, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 16 }}>
          {stats.map((s) => (
            <div key={s.label} className="spidey-panel" style={{
              textAlign: "center", padding: "20px 12px", borderRadius: 12,
              background: "var(--surface)", border: "1px solid var(--glass-border)",
            }}>
              <div style={{ fontSize: "2rem", fontWeight: 700, color: "var(--accent)" }}>{s.value}</div>
              <div style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Timeline */}
      <section style={{ padding: "64px 24px", maxWidth: 700, margin: "0 auto" }}>
        <h2 style={{ textAlign: "center", fontSize: "var(--text-h2)", fontWeight: 700, marginBottom: 28 }}>
          Timeline
        </h2>
        <div style={{ position: "relative", paddingLeft: "clamp(20px, 4vw, 28px)" }}>
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
              <div style={{ fontWeight: 700, fontSize: "var(--text-sm)", color: "var(--accent)", marginBottom: 4 }}>
                {t.year}
              </div>
              <div style={{ color: "var(--text-muted)", fontSize: "var(--text-sm)", lineHeight: "var(--leading-small)" }}>
                {t.event}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* What's Included */}
      <section style={{ padding: "64px 24px", maxWidth: 1000, margin: "0 auto" }}>
        <h2 style={{ textAlign: "center", fontSize: "var(--text-h2)", fontWeight: 700, marginBottom: 24 }}>
          What&apos;s included
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
          {[
            { title: "Backend (FastAPI)", items: ["26 free LLMs via OpenRouter", "RAG engine with hybrid search", "Persistent memory with summarization", "Multi-provider routing", "Lemon Squeezy payments", "License key generation & email", "Rate limiting & audit logging"] },
            { title: "Desktop (PySide6 + QML)", items: ["Dual dark/light theme", "Chat playground", "RAG & memory browsers", "Embedded terminal", "Auto-updater", "License activation screen"] },
            { title: "Mobile (React Native)", items: ["Chat, providers, RAG, memory", "License activation", "Usage analytics", "Dark theme UI", "Bottom navigation"] },
            { title: "Frontend (Next.js)", items: ["Marketing site with pricing", "Public playground demo", "RAG & memory demo pages", "Payment result pages", "SEO-optimized pages"] },
          ].map((section) => (
            <div key={section.title} className="spidey-panel" style={{
              padding: 20, borderRadius: 16, background: "var(--surface)", border: "1px solid var(--glass-border)",
            }}>
              <h3 style={{
                fontSize: "var(--text-h3)", fontWeight: 700, marginBottom: 10,
                background: "var(--gradient-h3)", WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent",
              }}>{section.title}</h3>
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {section.items.map((item) => (
                  <li key={item} style={{ padding: "3px 0", fontSize: "var(--text-sm)", color: "var(--text-muted)" }}>
                    ✓ {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Security Case Study */}
      <section style={{ padding: "64px 24px", maxWidth: 800, margin: "0 auto" }}>
        <div style={{
          background: "var(--surface)", borderRadius: 24, border: "1px solid var(--glass-border)",
          padding: "32px 28px",
        }}>
          <h2 style={{ fontSize: "var(--text-h2)", fontWeight: 700, marginBottom: 12 }}>🔒 Security Philosophy</h2>
          <p style={{ color: "var(--text-muted)", fontSize: "var(--text-sm)", lineHeight: 1.6 }}>
            When I built OllamoMUI, I started with a simple API wrapper. As the project grew, I realised that
            security couldn&apos;t be an afterthought. I implemented <strong style={{ color: "var(--text)" }}>PBKDF2-HMAC-SHA256</strong> password
            hashing with per-user salts, <strong style={{ color: "var(--text)" }}>Role-Based Access Control</strong> with fine-grained permissions,
            and <strong style={{ color: "var(--text)" }}>SSRF protection</strong> to block malicious requests. The desktop version bundles its own
            database, ensuring user data never leaves their machine. These security measures are not just
            features — they are part of a philosophy of data sovereignty and enterprise-grade protection.
            I am ready to bring this same level of architectural thinking to your remote team.
          </p>
          <div style={{ marginTop: 16 }}>
            <Link href="/security" style={{
              fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--accent)", textDecoration: "none",
            }}>
              View full security architecture →
            </Link>
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section style={{ padding: "64px 24px", maxWidth: 900, margin: "0 auto", textAlign: "center" }}>
        <h2 style={{ fontSize: "var(--text-h2)", fontWeight: 700, marginBottom: 20 }}>
          Built with
        </h2>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
           {["Python 3.14", "FastAPI", "PySide6", "QML", "Next.js", "React Native", "Expo", "PostgreSQL", "pgvector", "Docker", "Nginx", "Vercel", "Render", "NeonDB", "Lemon Squeezy", "Cloudflare"].map((tech) => (
            <span key={tech} className="tech-tag" style={{
              padding: "6px 14px", borderRadius: 24, fontSize: "var(--text-sm)", fontWeight: 600,
              background: "var(--surface)", border: "1px solid var(--glass-border)",
              color: "var(--text-muted)",
            }}>
              {tech}
            </span>
          ))}
        </div>
      </section>

      {/* Hire Me */}
      <section style={{ padding: "64px 24px", maxWidth: 720, margin: "0 auto", textAlign: "center" }}>
        <div style={{
          background: "var(--surface)", borderRadius: 24, border: "1px solid var(--glass-border)",
          padding: "40px 32px",
        }}>
          <h2 style={{ fontSize: "var(--text-h2)", fontWeight: 700, marginBottom: 12 }}>Hire Me</h2>
          <p style={{ color: "var(--text-muted)", fontSize: "var(--text-sm)", lineHeight: 1.6, marginBottom: 20, maxWidth: 500, marginLeft: "auto", marginRight: "auto" }}>
            I build full-stack applications, cross-platform desktop/mobile apps, AI/LLM integrations, and
            developer tools. If you have a project, an idea, or a problem to solve — let&apos;s talk.
          </p>
          <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
            <a href="mailto:rbkhan00009@gmail.com" style={{
              display: "inline-flex", alignItems: "center", gap: 6, padding: "12px 24px",
              borderRadius: 12, background: "var(--gradient-1)", color: "#fff",
              textDecoration: "none", fontWeight: 700, fontSize: "var(--text-sm)",
            }}>
              Email me
            </a>
            <a href="https://www.freelancer.com/u/Rakibul0007" target="_blank" rel="noopener noreferrer" style={{
              display: "inline-flex", alignItems: "center", gap: 6, padding: "12px 24px",
              borderRadius: 12, background: "var(--surface)", color: "var(--text)",
              border: "1px solid var(--glass-border)", textDecoration: "none", fontWeight: 600, fontSize: "var(--text-sm)",
            }}>
              Freelancer
            </a>
            <a href="https://wa.me/8801774471120" target="_blank" rel="noopener noreferrer" style={{
              display: "inline-flex", alignItems: "center", gap: 6, padding: "12px 24px",
              borderRadius: 12, background: "var(--surface)", color: "var(--text)",
              border: "1px solid var(--glass-border)", textDecoration: "none", fontWeight: 600, fontSize: "var(--text-sm)",
            }}>
              WhatsApp
            </a>
            <Link href="/resume" style={{
              display: "inline-flex", alignItems: "center", gap: 6, padding: "12px 24px",
              borderRadius: 12, background: "var(--surface)", color: "var(--text)",
              border: "1px solid var(--glass-border)", textDecoration: "none", fontWeight: 600, fontSize: "var(--text-sm)",
            }}>
              Resume
            </Link>
            <a href={REPO_URL} target="_blank" rel="noopener noreferrer" style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "12px 24px", borderRadius: 12,
              background: "var(--surface)", color: "var(--text)",
              border: "1px solid var(--glass-border)",
              textDecoration: "none", fontWeight: 600, fontSize: "var(--text-sm)",
            }}>
              GitHub
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
