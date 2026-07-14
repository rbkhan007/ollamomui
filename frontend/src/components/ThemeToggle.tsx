"use client";

import { useTheme } from "@/lib/ThemeContext";

export default function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      onClick={toggle}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      style={{
        position: "relative",
        width: 56,
        height: 30,
        borderRadius: 15,
        border: "1px solid var(--glass-border)",
        background: isDark
          ? "linear-gradient(135deg, #1a1a3e, #0f0f2a)"
          : "linear-gradient(135deg, #fde68a, #fbbf24)",
        cursor: "pointer",
        padding: 0,
        flexShrink: 0,
        transition: "background 0.4s cubic-bezier(0.16,1,0.3,1), border-color 0.3s",
        overflow: "hidden",
      }}
    >
      {/* Stars for dark mode */}
      <span
        style={{
          position: "absolute",
          top: 4,
          left: 6,
          width: 3,
          height: 3,
          borderRadius: "50%",
          background: "#fff",
          opacity: isDark ? 0.8 : 0,
          transition: "opacity 0.3s",
          boxShadow: "8px 2px 0 1px rgba(255,255,255,0.5), 4px 8px 0 0px rgba(255,255,255,0.3)",
        }}
      />
      {/* Sun rays for light mode */}
      <span
        style={{
          position: "absolute",
          top: 7,
          right: 7,
          width: 10,
          height: 10,
          opacity: isDark ? 0 : 0.9,
          transition: "opacity 0.3s",
        }}
      >
        <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="#92400e" strokeWidth="2.5" strokeLinecap="round">
          <line x1="12" y1="1" x2="12" y2="3" />
          <line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="3" y2="12" />
          <line x1="21" y1="12" x2="23" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </svg>
      </span>
      {/* Sliding knob */}
      <span
        style={{
          position: "absolute",
          top: 2,
          left: isDark ? 28 : 2,
          width: 24,
          height: 24,
          borderRadius: "50%",
          background: isDark
            ? "linear-gradient(135deg, #c4b5fd, #8b5cf6)"
            : "linear-gradient(135deg, #fff, #fef3c7)",
          boxShadow: isDark
            ? "0 0 12px rgba(139,92,246,0.5), 0 2px 4px rgba(0,0,0,0.3)"
            : "0 2px 8px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.05)",
          transition: "left 0.4s cubic-bezier(0.16,1,0.3,1), background 0.4s, box-shadow 0.4s",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Moon icon inside knob when dark */}
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          style={{
            opacity: isDark ? 1 : 0,
            transition: "opacity 0.3s",
            transform: isDark ? "rotate(0deg)" : "rotate(90deg)",
          }}
        >
          <path
            d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
            fill="#1e1b4b"
            stroke="#1e1b4b"
            strokeWidth="1"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        {/* Sun icon inside knob when light */}
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          style={{
            opacity: isDark ? 0 : 1,
            transition: "opacity 0.3s",
            transform: isDark ? "rotate(-90deg)" : "rotate(0deg)",
            position: "absolute",
          }}
        >
          <circle cx="12" cy="12" r="5" fill="#f59e0b" />
        </svg>
      </span>
    </button>
  );
}
