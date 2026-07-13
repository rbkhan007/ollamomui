"use client";

const platforms = [
  {
    name: "Desktop (Windows, macOS, Linux)",
    icon: "💻",
    tech: "Tauri + React + FastAPI",
    features: ["Native file system access for RAG document uploads", "System tray integration for background operation", "Auto-updater with differential updates", "Custom title bar with native window controls", "Local-first: backend runs as a sidecar process"],
    challenges: ["Packaging Python backend for each OS", "Cross-compiling PyInstaller binaries for ARM/Intel", "Managing auto-update signatures across platforms"],
  },
  {
    name: "Mobile (Android, iOS)",
    icon: "📱",
    tech: "React Native + FastAPI",
    features: ["Biometric authentication (Face ID / fingerprint)", "Push notifications for long-running tasks", "Offline message queue with sync on reconnect", "Share sheet integration for quick prompts", "Haptic feedback on streaming responses"],
    challenges: ["Gesture conflict between swipe and scroll", "Keyboard avoidance in chat input", "Memory pressure on large conversation histories"],
  },
  {
    name: "Web (PWA)",
    icon: "🌐",
    tech: "Next.js + FastAPI",
    features: ["Service worker for offline fallback pages", "Responsive layout: desktop navbar to mobile bottom sheet", "SSR/SSG for SEO-optimized marketing pages", "Web Share API for cross-tab prompts", "Dark mode with system preference detection"],
    challenges: ["CORS and CSP configuration for mixed origins", "Streaming API compatibility across browsers", "Service worker cache invalidation on deploy"],
  },
];

const metrics = [
  { label: "Code Reuse", value: "~85%", detail: "Shared TypeScript types, API client, auth logic" },
  { label: "Time to Ship v1", value: "6 weeks", detail: "One developer, full stack + mobile + desktop" },
  { label: "Startup Time", value: "<1.5s", detail: "Desktop: Tauri + bundled Python backend" },
  { label: "Bundle Size", value: "~45MB", detail: "Desktop installer (includes Python runtime)" },
  { label: "Mobile APK", value: "~8MB", detail: "React Native with Hermes + tree shaking" },
  { label: "Web Lighthouse", value: "96", detail: "Performance score on desktop Next.js build" },
];

export function CaseStudyContent() {
  return (
    <>
      <section style={{ marginBottom: 48 }}>
        <h2 style={{ fontSize: "1.3rem", fontWeight: 700, marginBottom: 16 }}>Platform Breakdown</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {platforms.map((p) => (
            <div key={p.name} style={{
              background: "var(--surface)", borderRadius: 16, border: "1px solid var(--glass-border)", padding: 24,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <span style={{ fontSize: 24 }}>{p.icon}</span>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 700, margin: 0 }}>{p.name}</h3>
              </div>
              <div style={{ fontSize: 13, color: "var(--accent)", fontWeight: 600, marginBottom: 16 }}>
                {p.tech}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 8 }}>Features</div>
                  <ul style={{ margin: 0, paddingLeft: 18, color: "var(--text-muted)", fontSize: 13, lineHeight: 1.8 }}>
                    {p.features.map((f) => (<li key={f}>{f}</li>))}
                  </ul>
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 8 }}>Challenges</div>
                  <ul style={{ margin: 0, paddingLeft: 18, color: "var(--text-muted)", fontSize: 13, lineHeight: 1.8 }}>
                    {p.challenges.map((c) => (<li key={c}>{c}</li>))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 style={{ fontSize: "1.3rem", fontWeight: 700, marginBottom: 16 }}>Key Metrics</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 14 }}>
          {metrics.map((m) => (
            <div key={m.label} style={{
              background: "var(--surface)", borderRadius: 12, border: "1px solid var(--glass-border)",
              padding: "16px 20px",
            }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                {m.label}
              </div>
              <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--accent)", letterSpacing: "-0.02em", marginBottom: 4 }}>
                {m.value}
              </div>
              <div style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.4 }}>
                {m.detail}
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
