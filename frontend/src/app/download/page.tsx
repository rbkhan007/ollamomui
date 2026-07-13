import { SITE_URL, REPO_URL, RELEASES_URL } from "@/lib/config";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Download",
  description: "Download the free Ollama alternative. Pre-built Windows EXE (single file, no install), Android mobile app, or build from source on GitHub. macOS/Linux via run.sh.",
  alternates: { canonical: `${SITE_URL}/download` },
  openGraph: {
    title: "Download — Free Ollama Alternative",
    description: "Download the pre-built Windows EXE, Android mobile app, or build from source. The best free Ollama alternative with 26 LLMs, RAG, and memory.",
    url: `${SITE_URL}/download`,
    images: [{ url: `${SITE_URL}/og-image.png`, width: 1200, height: 630, alt: "Download OllamoMUI" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Download — Free Ollama Alternative",
    description: "Download the pre-built Windows EXE, Android mobile app, or build from source.",
    images: [`${SITE_URL}/og-image.png`],
  },
};

const downloadItems = [
  {
    title: "Windows EXE",
    desc: "Single file, no install required. Includes the GUI and server.",
    href: RELEASES_URL,
    label: "Download latest",
    btnStyle: "primary",
    svg: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 16l4.5-4.5L12 14l3.5-2.5L20 16" /><path d="M20 4l-4.5 4.5L12 6l-3.5 2.5L4 4" /><path d="M4 20l4.5-4.5L12 18l3.5-2.5L20 20" /></svg>,
  },
  {
    title: "Mobile App",
    desc: "Android app with full sync and mobile-optimized UI.",
    href: "https://play.google.com/store/apps/details?id=com.ollamomui.app",
    label: "Get it on Play Store",
    btnStyle: "primary",
    svg: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2" /><line x1="12" y1="18" x2="12.01" y2="18" /></svg>,
  },
  {
    title: "Source Code",
    desc: "Self-host with Docker, or build from source.",
    href: REPO_URL,
    label: "View on GitHub",
    btnStyle: "ghost",
    svg: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg>,
  },
];

export default function Download() {
  return (
    <main style={{ maxWidth: 800, margin: "0 auto", padding: "clamp(24px, 5vw, 48px) clamp(16px, 4vw, 24px)" }}>
      <h1 style={{ fontSize: "clamp(1.8rem, 5vw, 2.5rem)", fontWeight: 800, textAlign: "center", marginBottom: 8, color: "var(--text)" }}>Download OllamoMUI</h1>
      <p style={{ textAlign: "center", color: "var(--text)", marginBottom: 40, fontSize: "clamp(0.95rem, 2vw, 1.05rem)" }}>
        Get the pre-built EXE, the mobile app, or build from source.
      </p>

      <div style={{ display: "grid", gap: 20 }}>
        {downloadItems.map((item) => (
          <div key={item.title} className="card-hover" style={{
            display: "flex", alignItems: "center", gap: 18,
            padding: "20px 24px", borderRadius: 16,
            background: "var(--surface)", border: "1px solid var(--glass-border)",
          }}>
            <div style={{
              width: 52, height: 52, borderRadius: 14, flexShrink: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
              background: item.btnStyle === "primary" ? "rgba(108,92,231,0.1)" : "rgba(128,128,128,0.06)",
              color: item.btnStyle === "primary" ? "var(--accent)" : "var(--text-muted)",
            }}>
              {item.svg}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: 4 }}>{item.title}</h2>
              <p style={{ color: "var(--text-muted)", fontSize: 14, margin: 0 }}>{item.desc}</p>
            </div>
            <a href={item.href} style={{
              flexShrink: 0, display: "inline-flex", alignItems: "center", gap: 6,
              padding: "10px 20px", borderRadius: 10, fontSize: 14, fontWeight: 600,
              textDecoration: "none", whiteSpace: "nowrap",
              background: item.btnStyle === "primary" ? "var(--gradient-1)" : "var(--surface)",
              color: item.btnStyle === "primary" ? "#fff" : "var(--text)",
              border: item.btnStyle === "ghost" ? "1px solid var(--glass-border)" : "none",
            }}>
              {item.label} &rarr;
            </a>
          </div>
        ))}
      </div>

      {/* Deploy Buttons */}
      <section style={{ marginTop: 48 }}>
        <h2 style={{ fontSize: "1.3rem", fontWeight: 700, textAlign: "center", marginBottom: 8 }}>Deploy Your Own Instance</h2>
        <p style={{ textAlign: "center", color: "var(--text-muted)", fontSize: 14, marginBottom: 20 }}>
          One-click deployment to your preferred cloud provider.
        </p>
        <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
          <a href="https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Frbkhan007%2Followomui%2Ftree%2Fmain&project-name=ollamomui&repository-name=ollamomui" target="_blank" rel="noopener noreferrer" style={{
            display: "inline-flex", alignItems: "center", gap: 10, padding: "12px 24px",
            borderRadius: 12, background: "var(--surface)", border: "1px solid var(--glass-border)",
            color: "var(--text)", textDecoration: "none", fontWeight: 600, fontSize: 14,
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg>
            Deploy to Vercel
          </a>
          <a href="https://render.com/deploy?repo=https://github.com/rbkhan007/ollamomui" target="_blank" rel="noopener noreferrer" style={{
            display: "inline-flex", alignItems: "center", gap: 10, padding: "12px 24px",
            borderRadius: 12, background: "var(--surface)", border: "1px solid var(--glass-border)",
            color: "var(--text)", textDecoration: "none", fontWeight: 600, fontSize: 14,
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></svg>
            Deploy to Render
          </a>
          <a href="https://railway.app/template/ollamomui?referralCode=ollamomui" target="_blank" rel="noopener noreferrer" style={{
            display: "inline-flex", alignItems: "center", gap: 10, padding: "12px 24px",
            borderRadius: 12, background: "var(--surface)", border: "1px solid var(--glass-border)",
            color: "var(--text)", textDecoration: "none", fontWeight: 600, fontSize: 14,
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" /></svg>
            Deploy to Railway
          </a>
        </div>
      </section>
    </main>
  );
}
