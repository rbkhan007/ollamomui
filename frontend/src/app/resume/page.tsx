import type { Metadata } from "next";
import { SITE_URL, REPO_URL } from "@/lib/config";
import Link from "next/link";
import { PrintButton } from "./print-button";

export const metadata: Metadata = {
  title: "Resume — Rhasan@dev — Full-Stack Developer",
  description: "Full-stack developer specializing in AI/LLM, cross-platform desktop/mobile, and developer tools. FastAPI, Next.js, React Native, PySide6, PostgreSQL, Docker.",
  alternates: { canonical: `${SITE_URL}/resume` },
  openGraph: {
    title: "Resume — Rhasan@dev",
    description: "Full-stack developer · AI/LLM · Cross-platform · FastAPI, Next.js, React Native, PySide6, PostgreSQL, Docker.",
    url: `${SITE_URL}/resume`,
    images: [{ url: `${SITE_URL}/og-image.png`, width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Resume — Rhasan@dev",
    description: "Full-stack developer · AI/LLM · Cross-platform",
    images: [`${SITE_URL}/og-image.png`],
  },
};

const skills = [
  { category: "Backend", items: ["Python 3.14", "FastAPI", "SQLAlchemy", "PostgreSQL + pgvector", "REST API design", "JWT / OAuth", "Rate limiting", "Audit logging"] },
  { category: "Frontend", items: ["Next.js 15", "TypeScript", "React 19", "SSR / SSG", "CSS design systems", "Responsive design", "PWA", "SEO / structured data"] },
  { category: "Desktop", items: ["PySide6", "QML", "Tauri", "Auto-updaters", "System tray", "Cross-compilation"] },
  { category: "Mobile", items: ["React Native", "Expo", "Hermes", "Push notifications", "Biometric auth", "Offline-first"] },
  { category: "DevOps", items: ["Docker", "Nginx", "Cloudflare Tunnel", "Vercel", "Render", "NeonDB", "GitHub Actions"] },
  { category: "Security", items: ["PBKDF2-HMAC-SHA256", "JWT auth", "RBAC", "SSRF protection", "CSP / HSTS", "CSRF", "Input sanitization"] },
];

const FREELANCER = "https://www.freelancer.com/u/Rakibul0007";
const WHATSAPP = "https://wa.me/8801774471120";
const PERSONAL_SITE = "https://rhasan-dev-bd-com.vercel.app";
const FACEBOOK = "https://www.facebook.com/rakibul.hassan.269825";

export default function ResumePage() {
  return (
    <main style={{ maxWidth: 880, margin: "0 auto", padding: "clamp(24px, 5vw, 48px) clamp(16px, 4vw, 24px)" }}>
      <style>{`
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .no-print { display: none !important; }
          main { padding: 0 !important; }
          a { text-decoration: none !important; color: #000 !important; }
        }
      `}</style>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32, flexWrap: "wrap", gap: 16 }}>
        <div>
          <h1 style={{ fontSize: "2rem", fontWeight: 800, margin: 0, letterSpacing: "-0.02em" }}>Rhasan@dev</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "1rem", margin: "4px 0 0" }}>
            Full-Stack Developer · AI/LLM · Cross-Platform
          </p>
        </div>
        <div className="no-print" style={{ display: "flex", gap: 10 }}>
          <a href="mailto:rbkhan00009@gmail.com" style={{
            padding: "10px 18px", borderRadius: 10, fontSize: 13, fontWeight: 600,
            background: "var(--gradient-1)", color: "white", textDecoration: "none",
          }}>
            Email Me
          </a>
          <a href={`${REPO_URL}/raw/main/resources/CV_Rakibul_Hasan.md`} target="_blank" rel="noopener noreferrer" style={{
            padding: "10px 18px", borderRadius: 10, fontSize: 13, fontWeight: 600,
            background: "var(--surface)", color: "var(--text)", textDecoration: "none",
            border: "1px solid var(--glass-border)",
          }}>
            Download CV
          </a>
          <PrintButton />
        </div>
      </div>

      <section style={{ marginBottom: 36 }}>
        <p style={{ color: "var(--text-muted)", fontSize: 14, lineHeight: 1.7, margin: 0 }}>
          I build full-stack applications, cross-platform desktop/mobile apps, AI/LLM integrations, and
          developer tools. I care about security, performance, and user experience at every layer of the
          stack — from database schema design to CSS animations. Available for remote roles.
        </p>
      </section>

      <section style={{ marginBottom: 36 }}>
        <h2 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: 16, paddingBottom: 8, borderBottom: "1px solid var(--glass-border)" }}>Skills</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 14 }}>
          {skills.map((group) => (
            <div key={group.category} style={{
              background: "var(--surface)", borderRadius: 12, border: "1px solid var(--glass-border)", padding: 16,
            }}>
              <h3 style={{ fontSize: 13, fontWeight: 700, color: "#6c5ce7", margin: "0 0 8px", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                {group.category}
              </h3>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {group.items.map((item) => (
                  <span key={item} style={{
                    fontSize: 12, padding: "3px 10px", borderRadius: 6,
                    background: "rgba(108,92,231,0.08)", color: "var(--text-muted)", fontWeight: 500,
                  }}>
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ marginBottom: 36 }}>
        <h2 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: 16, paddingBottom: 8, borderBottom: "1px solid var(--glass-border)" }}>Featured Project</h2>
        <div style={{
          background: "var(--surface)", borderRadius: 16, border: "1px solid var(--glass-border)", padding: 24,
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, flexWrap: "wrap", gap: 8 }}>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, margin: 0 }}>OllamoMUI</h3>
            <div className="no-print" style={{ display: "flex", gap: 10 }}>
              <a href="https://ollamomui.vercel.app" target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: "#6c5ce7", fontWeight: 600, textDecoration: "none" }}>Live Site</a>
              <a href={REPO_URL} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: "var(--text-muted)", fontWeight: 600, textDecoration: "none" }}>Source</a>
            </div>
          </div>
          <p style={{ color: "var(--text-muted)", fontSize: 14, lineHeight: 1.6, margin: "0 0 12px" }}>
            Full-stack AI gateway: 23 static pages, 26 free LLMs, RAG pipeline with hybrid vector+keyword search,
            persistent memory system, cross-platform desktop (PySide6) and mobile (React Native) clients.
            Enterprise-grade security with 4-pillar architecture (PBKDF2, RBAC, SSRF protection, audit logging).
          </p>
          <ul style={{ color: "var(--text-muted)", fontSize: 13, lineHeight: 1.8, margin: "0 0 12px", paddingLeft: 18 }}>
            <li>FastAPI backend with middleware chain (auth, rate limiting, RAG context fetch, memory injection)</li>
            <li>Next.js 15 frontend with SSR/SSG, 23 static pages, SEO structured data, PWA support</li>
            <li>PostgreSQL + pgvector for RAG and pg_trgm for keyword search with cross-encoder reranking</li>
            <li>4-pillar security: data sovereignty, PBKDF2 auth, SSRF guard, CSP/HSTS headers, audit logging</li>
            <li>Cross-platform: desktop (PySide6/QML), mobile (React Native/Expo), web (Next.js)</li>
            <li>Docker, Vercel, Render deployment with Cloudflare Tunnel support</li>
          </ul>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {["FastAPI", "Next.js", "TypeScript", "React Native", "PySide6", "PostgreSQL", "pgvector", "Docker"].map((tech) => (
              <span key={tech} style={{
                fontSize: 12, padding: "3px 10px", borderRadius: 6,
                background: "rgba(0,206,201,0.08)", color: "#00cec9", fontWeight: 500,
              }}>
                {tech}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section style={{ marginBottom: 36 }}>
        <h2 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: 16, paddingBottom: 8, borderBottom: "1px solid var(--glass-border)" }}>Education</h2>
        <div style={{
          background: "var(--surface)", borderRadius: 12, border: "1px solid var(--glass-border)", padding: 16,
        }}>
          <div style={{ fontWeight: 600, fontSize: 14 }}>Computer Science & Engineering</div>
          <div style={{ color: "var(--text-muted)", fontSize: 13 }}>Self-taught, project-based learning · 2024–2026</div>
        </div>
      </section>

      <section className="no-print" style={{ marginBottom: 36 }}>
        <h2 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: 16, paddingBottom: 8, borderBottom: "1px solid var(--glass-border)" }}>Portfolio Deep Dives</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 10 }}>
          {[
            { href: "/architecture", label: "Architecture", desc: "Request lifecycle & RAG pipeline" },
            { href: "/security", label: "Security", desc: "4-pillar enterprise security" },
            { href: "/api-docs", label: "API Docs", desc: "16-endpoint reference" },
            { href: "/status", label: "Status", desc: "Live health dashboard" },
            { href: "/case-study", label: "Case Study", desc: "Cross-platform analysis" },
          ].map((link) => (
            <Link key={link.href} href={link.href} style={{
              padding: "14px 16px", borderRadius: 10, textDecoration: "none",
              background: "var(--surface)", border: "1px solid var(--glass-border)",
              transition: "all 0.2s",
            }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", marginBottom: 2 }}>{link.label}</div>
              <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{link.desc}</div>
            </Link>
          ))}
        </div>
      </section>

      <section style={{ textAlign: "center", padding: "24px 0", borderTop: "1px solid var(--glass-border)" }}>
        <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap", fontSize: 13, color: "var(--text-muted)", marginBottom: 8 }}>
          <a href="mailto:rbkhan00009@gmail.com" style={{ color: "#6c5ce7", fontWeight: 600, textDecoration: "none" }}>Email</a>
          <a href={FREELANCER} target="_blank" rel="noopener noreferrer" style={{ color: "#6c5ce7", fontWeight: 600, textDecoration: "none" }}>Freelancer</a>
          <a href={REPO_URL} target="_blank" rel="noopener noreferrer" style={{ color: "#6c5ce7", fontWeight: 600, textDecoration: "none" }}>GitHub</a>
          <a href={FACEBOOK} target="_blank" rel="noopener noreferrer" style={{ color: "#6c5ce7", fontWeight: 600, textDecoration: "none" }}>Facebook</a>
          <a href={WHATSAPP} target="_blank" rel="noopener noreferrer" style={{ color: "#6c5ce7", fontWeight: 600, textDecoration: "none" }}>WhatsApp</a>
          <a href={PERSONAL_SITE} target="_blank" rel="noopener noreferrer" style={{ color: "#6c5ce7", fontWeight: 600, textDecoration: "none" }}>Portfolio</a>
        </div>
        <p className="no-print" style={{ color: "var(--text-muted)", fontSize: 12, margin: 0 }}>
          Use the <strong>Print / Save PDF</strong> button above to save as a PDF resume.
        </p>
      </section>
    </main>
  );
}
