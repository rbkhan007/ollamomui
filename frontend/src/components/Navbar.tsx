"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "@/lib/ThemeContext";
import { useAuth } from "@/lib/AuthContext";
import { LogoSvg } from "./Icons";
import { BrandIcon } from "./BrandIcon";

const links = [
  { href: "/", label: "Home", icon: "home" },
  { href: "/playground", label: "Playground", icon: "chat" },
  { href: "/usage", label: "Usage", icon: "usage" },
  { href: "/settings", label: "Settings", icon: "settings" },
  { href: "/rag", label: "Knowledge", icon: "book" },
  { href: "/memory", label: "Memory", icon: "brain" },
  { href: "/about", label: "About", icon: "info" },
];

function NavIcon({ type }: { type: string }) {
  const s = 16;
  const icons: Record<string, React.JSX.Element> = {
    home: (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
    chat: (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
    settings: (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
    book: (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      </svg>
    ),
    brain: (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a4 4 0 0 0-4 4v1a3 3 0 0 0-3 3 3 3 0 0 0 1 2.24V15a4 4 0 0 0 4 4h4a4 4 0 0 0 4-4v-2.76A3 3 0 0 0 23 11a3 3 0 0 0-3-3V6a4 4 0 0 0-4-4h-4z" />
        <circle cx="9.5" cy="11.5" r="1" fill="currentColor" />
        <circle cx="14.5" cy="11.5" r="1" fill="currentColor" />
        <path d="M9 16h6" />
      </svg>
    ),
    usage: (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
    star: (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
    info: (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="16" x2="12" y2="12" />
        <line x1="12" y1="8" x2="12.01" y2="8" />
      </svg>
    ),
  };
  return icons[type] || null;
}

function SunIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

export default function Navbar() {
  const path = usePathname();
  const { theme, toggle } = useTheme();
  const { user, logout, isAuthenticated } = useAuth();

  return (
    <nav style={{
      position: "sticky",
      top: 0,
      zIndex: 100,
      display: "flex",
      alignItems: "center",
      gap: 6,
      padding: "12px 32px",
      background: "var(--nav-bg)",
      backdropFilter: "blur(20px) saturate(180%)",
      borderBottom: "1px solid var(--glass-border)",
    }}>
      <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, marginRight: 20 }}>
        <BrandIcon name="Ollama" size={30} color="#00cec9" />
        <span style={{
          fontWeight: 700,
          fontSize: 16,
          letterSpacing: "-0.02em",
          background: "linear-gradient(135deg, #6c5ce7, #00cec9)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}>
          OllamaEmu
        </span>
        <span style={{
          fontSize: 10,
          padding: "2px 8px",
          borderRadius: 6,
          background: "rgba(108,92,231,0.12)",
          color: "#6c5ce7",
          fontWeight: 600,
          letterSpacing: "0.05em",
        }}>v1.0.0</span>
      </Link>
      <div style={{ flex: 1 }} />
      {links.map((l) => {
        const active = path === l.href || (l.href !== "/" && path.startsWith(l.href));
        return (
          <Link key={l.href} href={l.href} style={{
            padding: "7px 14px",
            borderRadius: 10,
            fontSize: 13,
            fontWeight: 500,
            display: "flex",
            alignItems: "center",
            gap: 6,
            background: active ? "rgba(108,92,231,0.12)" : "transparent",
            color: active ? "#6c5ce7" : "var(--text-muted)",
            border: active ? "1px solid rgba(108,92,231,0.2)" : "1px solid transparent",
            transition: "all 0.2s",
          }}>
            <NavIcon type={l.icon} />
            {l.label}
          </Link>
        );
      })}
      <button
        onClick={toggle}
        title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          border: "1px solid var(--glass-border)",
          background: "var(--surface)",
          color: "var(--text-muted)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "all 0.2s",
        }}
      >
        {theme === "dark" ? <SunIcon /> : <MoonIcon />}
      </button>

      {isAuthenticated ? (
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: 6 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: "var(--gradient-1)", color: "white",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 13, fontWeight: 700,
          }}>
            {user?.email?.charAt(0).toUpperCase() || "U"}
          </div>
          <button
            onClick={logout}
            title="Sign out"
            style={{
              padding: "6px 10px", borderRadius: 8, fontSize: 12, fontWeight: 500,
              border: "1px solid var(--glass-border)", background: "var(--surface)",
              color: "var(--text-muted)", cursor: "pointer",
              fontFamily: "inherit", transition: "all 0.2s",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: "middle" }}>
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            {" Sign Out"}
          </button>
        </div>
      ) : (
        <Link
          href="/login"
          style={{
            marginLeft: 8,
            padding: "7px 14px", borderRadius: 10, fontSize: 13, fontWeight: 600,
            background: "var(--gradient-1)", color: "white",
            display: "flex", alignItems: "center", gap: 6,
            boxShadow: "0 4px 16px rgba(108,92,231,0.3)",
            transition: "all 0.2s",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
            <polyline points="10 17 15 12 10 7" />
            <line x1="15" y1="12" x2="3" y2="12" />
          </svg>
          Sign In
        </Link>
      )}
    </nav>
  );
}
