import type { Metadata } from "next";
import { SITE_URL } from "@/lib/config";
import { CaseStudyContent } from "./content";

export const metadata: Metadata = {
  title: "Cross-Platform Case Study — Desktop, Mobile & Web",
  description: "How OllamoMUI delivers a unified AI experience across Windows, macOS, Linux, Android, iOS, and Web. Architecture decisions, code reuse, platform-specific optimizations, and performance benchmarks.",
  alternates: { canonical: `${SITE_URL}/case-study` },
  openGraph: {
    title: "Cross-Platform Case Study — OllamoMUI",
    description: "Unified AI experience across Windows, macOS, Linux, Android, iOS, and Web. Architecture decisions, code reuse, platform-specific optimizations.",
    url: `${SITE_URL}/case-study`,
    images: [{ url: `${SITE_URL}/og-image.png`, width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Cross-Platform Case Study — OllamoMUI",
    description: "Unified AI experience across all platforms: desktop, mobile & web.",
    images: [`${SITE_URL}/og-image.png`],
  },
};

export default function CaseStudyPage() {
  return (
    <main style={{ maxWidth: 960, margin: "0 auto", padding: "clamp(24px, 5vw, 48px) clamp(16px, 4vw, 24px)" }}>
      <h1 style={{ fontSize: "clamp(1.6rem, 4vw, 2.2rem)", fontWeight: 800, marginBottom: 8, letterSpacing: "-0.02em", color: "var(--text)" }}>Cross-Platform Case Study</h1>
      <p style={{ color: "var(--text)", fontSize: "clamp(0.95rem, 2vw, 1.05rem)", marginBottom: 40, maxWidth: 640, lineHeight: 1.7 }}>
        How OllamoMUI delivers a unified AI experience across Windows, macOS, Linux, Android, iOS, and
        Web — with a single backend and platform-tailored frontends.
      </p>
      <CaseStudyContent />
    </main>
  );
}
