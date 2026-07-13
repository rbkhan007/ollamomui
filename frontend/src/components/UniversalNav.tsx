"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "@/lib/ThemeContext";
import { REPO_URL } from "@/lib/config";
import styles from "./UniversalNav.module.css";

interface NavLink {
  label: string;
  href: string;
}

const PRIMARY_LINKS: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "Playground", href: "/playground" },
  { label: "Knowledge", href: "/rag" },
  { label: "Memory", href: "/memory" },
  { label: "Status", href: "/status" },
  { label: "Case Study", href: "/case-study" },
];

const MORE_LINKS: NavLink[] = [
  { label: "Architecture", href: "/architecture" },
  { label: "API Docs", href: "/api-docs" },
  { label: "Security", href: "/security" },
  { label: "Pricing", href: "/pricing" },
  { label: "Download", href: "/download" },
  { label: "Resume", href: "/resume" },
  { label: "About", href: "/about" },
  { label: "Settings", href: "/settings" },
  { label: "Admin", href: "/admin" },
];

const ALL_LINKS = [...PRIMARY_LINKS, ...MORE_LINKS];

export default function UniversalNav() {
  const pathname = usePathname();
  const { theme, toggle } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [ddOpen, setDdOpen] = useState(false);
  const ddRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setIsOpen(false); }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (ddRef.current && !ddRef.current.contains(e.target as Node)) {
      setDdOpen(false);
    }
  }, []);

  useEffect(() => {
    if (ddOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [ddOpen, handleClickOutside]);

  const isActive = (href: string) =>
    pathname === href || (href !== "/" && pathname.startsWith(href));

  return (
    <nav className={styles.nav}>
      <div className={styles.container}>
        <Link href="/" className={styles.brand} onClick={() => { setIsOpen(false); setDdOpen(false); }}>
          <div className={styles.brandLogo}>
            <svg width="28" height="28" viewBox="0 0 64 64" fill="none" role="img" aria-label="OllamoMUI logo" style={{ display: 'block' }}>
              <defs>
                <linearGradient id="brandCyan" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#00f0ff" />
                  <stop offset="100%" stopColor="#00bcd4" />
                </linearGradient>
                <linearGradient id="brandPurple" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#8b5cf6" />
                  <stop offset="100%" stopColor="#6366f1" />
                </linearGradient>
                <linearGradient id="boltGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#00f0ff" />
                  <stop offset="55%" stopColor="#8b5cf6" />
                  <stop offset="100%" stopColor="#6366f1" />
                </linearGradient>
                <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="2" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              <g transform="translate(32, 32)">
                <polygon points="0,-24 21,-12 21,12 0,24 -21,12 -21,-12" fill="none" stroke="url(#brandCyan)" strokeWidth="2" filter="url(#glow)" />
                <polygon points="0,-18 16,-9 16,9 0,18 -16,9 -16,-9" fill="none" stroke="url(#brandPurple)" strokeWidth="1" opacity="0.6" />
                <path d="M -6,-10 L 6,-10 L 3,-2 L 8,-2 L -6,12 L -3,3 L -9,3 Z" fill="url(#boltGrad)" filter="url(#glow)" />
                <circle cx="0" cy="-24" r="2" fill="url(#brandCyan)" filter="url(#glow)" />
                <circle cx="21" cy="-12" r="2" fill="url(#brandPurple)" filter="url(#glow)" />
                <circle cx="21" cy="12" r="2" fill="url(#brandCyan)" filter="url(#glow)" />
                <circle cx="0" cy="24" r="2" fill="url(#brandPurple)" filter="url(#glow)" />
                <circle cx="-21" cy="12" r="2" fill="url(#brandCyan)" filter="url(#glow)" />
                <circle cx="-21" cy="-12" r="2" fill="url(#brandPurple)" filter="url(#glow)" />
                <circle cx="0" cy="0" r="3" fill="url(#brandCyan)" opacity="0.8" filter="url(#glow)" />
              </g>
            </svg>
          </div>
          <span className={styles.brandText}>OllamoMUI</span>
          <span className={styles.badge}>v1.0.4</span>
        </Link>

        {/* Desktop: inline primary links */}
        <div className={styles.desktopNav}>
          {PRIMARY_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`${styles.navLink} ${isActive(link.href) ? styles.navLinkActive : ""}`}
            >
              {link.label}
            </Link>
          ))}

          {/* More dropdown */}
          <div className={styles.dropdownWrap} ref={ddRef}>
            <button
              className={styles.dropdownBtn}
              onClick={() => setDdOpen((o) => !o)}
              aria-expanded={ddOpen}
              aria-haspopup="true"
            >
              More
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transition: "transform 0.2s", transform: ddOpen ? "rotate(180deg)" : "" }}>
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
            {ddOpen && (
              <div className={styles.dropdownPanel}>
                {MORE_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`${styles.ddLink} ${isActive(link.href) ? styles.ddLinkActive : ""}`}
                    onClick={() => setDdOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Mobile: burger menu */}
        <div className={`${styles.menu} ${isOpen ? styles.menuOpen : ""}`}>
          {ALL_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`${styles.link} ${isActive(link.href) ? styles.linkActive : ""}`}
              onClick={() => setIsOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <div className={styles.menuActions}>
            <button
              onClick={toggle}
              className={styles.menuActionBtn}
              aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            >
              {theme === "dark" ? <SunIcon /> : <MoonIcon />}
              <span>{theme === "dark" ? "Light" : "Dark"}</span>
            </button>
            <a
              href={REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.menuActionBtn}
            >
              <StarIcon /> Star
            </a>
          </div>
        </div>

        <div className={styles.actions}>
          <button
            onClick={toggle}
            className={styles.desktopBtn}
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === "dark" ? <SunIcon /> : <MoonIcon />}
          </button>
          <a
            href={REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.desktopBtn}
          >
            <StarIcon /> Star
          </a>
          <button
            className={`${styles.burger} ${isOpen ? styles.burgerOpen : ""}`}
            onClick={() => setIsOpen((o) => !o)}
            aria-expanded={isOpen}
            aria-label="Toggle navigation menu"
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>
    </nav>
  );
}

function SunIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 .5C5.7.5.5 5.7.5 12c0 5.1 3.3 9.4 7.9 10.9.6.1.8-.2.8-.5v-2c-3.2.7-3.9-1.4-3.9-1.4-.5-1.3-1.3-1.7-1.3-1.7-1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.7 1.3 3.4 1 .1-.8.4-1.3.7-1.6-2.6-.3-5.3-1.3-5.3-5.7 0-1.3.5-2.3 1.2-3.1-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0c2.3-1.5 3.3-1.2 3.3-1.2.6 1.6.2 2.8.1 3.1.8.8 1.2 1.8 1.2 3.1 0 4.4-2.7 5.4-5.3 5.7.4.4.8 1.1.8 2.2v3.3c0 .3.2.6.8.5A11.5 11.5 0 0 0 23.5 12C23.5 5.7 18.3.5 12 .5z" />
    </svg>
  );
}
