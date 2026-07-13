"use client";

import { REPO_URL } from "@/lib/config";

const SOCIAL_LINKS = [
  { label: "Email", href: "mailto:rbkhan00009@gmail.com", icon: "email" },
  { label: "Freelancer", href: "https://www.freelancer.com/u/Rakibul0007", icon: "freelancer" },
  { label: "GitHub", href: REPO_URL, icon: "github" },
  { label: "Facebook", href: "https://www.facebook.com/rakibul.hassan.269825", icon: "facebook" },
  { label: "WhatsApp", href: "https://wa.me/8801774471120", icon: "whatsapp" },
  { label: "Portfolio", href: "https://rhasan-dev-bd-com.vercel.app", icon: "portfolio" },
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
        padding: "28px 24px 20px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 14,
      }}>
        <div style={{
          display: "flex",
          gap: 8,
          flexWrap: "wrap",
          justifyContent: "center",
        }}>
          {SOCIAL_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: "var(--text-muted)",
                fontWeight: 500,
                fontSize: 13,
                textDecoration: "none",
                padding: "6px 14px",
                borderRadius: 8,
                border: "1px solid var(--glass-border)",
                background: "var(--surface)",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "var(--accent)";
                e.currentTarget.style.borderColor = "rgba(108,92,231,0.3)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "var(--text-muted)";
                e.currentTarget.style.borderColor = "var(--glass-border)";
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
          fontSize: 12,
          color: "var(--text-muted)",
          lineHeight: 1.6,
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
