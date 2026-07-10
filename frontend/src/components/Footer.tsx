"use client";

export default function Footer() {
  return (
    <footer style={{
      padding: "24px 24px 20px", borderTop: "1px solid var(--glass-border)",
      textAlign: "center", marginTop: "auto",
    }}>
      <div style={{
        display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
        fontSize: 12, color: "var(--text-muted)", lineHeight: 1.6,
      }}>
        <span style={{ fontWeight: 600, color: "var(--text)", letterSpacing: "0.01em" }}>
          &copy; 2024-2026 Rhasan@dev. All rights reserved.
        </span>
        <span>
          Developed by{" "}
          <a
            href="https://rhasan-dev-bd-com.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: "var(--accent-2)", fontWeight: 600, textDecoration: "none",
            }}
          >
            Rhasan
          </a>
        </span>
      </div>
    </footer>
  );
}
