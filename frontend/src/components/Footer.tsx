"use client";

import { REPO_URL } from "@/lib/config";

const SOCIAL_LINKS = [
  { label: "Email", href: "mailto:rbkhan00009@gmail.com" },
  { label: "Freelancer", href: "https://www.freelancer.com/u/Rakibul0007" },
  { label: "GitHub", href: REPO_URL },
  { label: "Facebook", href: "https://www.facebook.com/rakibul.hassan.269825" },
  { label: "WhatsApp", href: "https://wa.me/8801774471120" },
  { label: "Portfolio", href: "https://rhasan-dev-bd-com.vercel.app" },
];

export default function Footer() {
  return (
    <footer style={{
      borderTop: "1px solid var(--glass-border)",
      marginTop: "auto",
    }}>
      <div style={{
        maxWidth: 1100,
        margin: "0 auto",
        padding: "clamp(20px, 3vw, 28px) clamp(12px, 3vw, 24px) clamp(16px, 2.5vw, 20px)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 14,
      }}>
        <div style={{
          display: "flex",
          gap: "clamp(4px, 1vw, 8px)",
          flexWrap: "wrap",
          justifyContent: "center",
        }}>
          {SOCIAL_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="footer-link"
              style={{
                color: "var(--text-muted)",
                fontWeight: 500,
                fontSize: "clamp(12px, 1.2vw, 13px)",
                textDecoration: "none",
                padding: "clamp(5px, 0.6vw, 6px) clamp(10px, 1.2vw, 14px)",
                borderRadius: 8,
                border: "1px solid var(--glass-border)",
                background: "var(--surface)",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                transition: "all 0.2s",
                whiteSpace: "nowrap",
              }}
            >
              {link.label}
            </a>
          ))}
        </div>
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 4,
          fontSize: "clamp(11px, 1.2vw, 12px)",
          color: "var(--text-muted)",
          lineHeight: 1.6,
          textAlign: "center",
          padding: "0 12px",
        }}>
          <span style={{ fontWeight: 600, color: "var(--text)", letterSpacing: "0.01em" }}>
            &copy; 2024-2026 Rhasan@dev. All rights reserved.
          </span>
          <span>
            Built with{" "}
            <span style={{ color: "var(--accent-3)" }}>&#9829;</span> by{" "}
            <a
              href="https://rhasan-dev-bd-com.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "var(--accent)", fontWeight: 600, textDecoration: "none" }}
            >
              Rhasan
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
}
