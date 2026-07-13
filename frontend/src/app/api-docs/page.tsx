import type { Metadata } from "next";
import { SITE_URL } from "@/lib/config";
import { ApiDocsContent } from "./content";

export const metadata: Metadata = {
  title: "API Documentation — Ollama-Compatible & Custom Endpoints",
  description: "Full API reference for OllamoMUI. Ollama-compatible routes for drop-in client migration plus custom endpoints for RAG, memory, settings, and multi-provider management.",
  alternates: { canonical: `${SITE_URL}/api-docs` },
  openGraph: {
    title: "API Documentation — OllamoMUI",
    description: "Ollama-compatible API + custom RAG, memory, settings, and provider management endpoints.",
    url: `${SITE_URL}/api-docs`,
    images: [{ url: `${SITE_URL}/og-image.png`, width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "API Documentation — OllamoMUI",
    description: "Ollama-compatible API + custom RAG, memory, settings, and provider management endpoints.",
    images: [`${SITE_URL}/og-image.png`],
  },
};

export default function ApiDocsPage() {
  return (
    <main style={{ maxWidth: 960, margin: "0 auto", padding: "clamp(24px, 5vw, 48px) clamp(16px, 4vw, 24px)" }}>
      <h1 style={{ fontSize: "clamp(1.6rem, 4vw, 2.2rem)", fontWeight: 800, marginBottom: 8, letterSpacing: "-0.02em", color: "var(--text)" }}>API Documentation</h1>
      <p style={{ color: "var(--text)", fontSize: "clamp(0.95rem, 2vw, 1.05rem)", marginBottom: 40, maxWidth: 640, lineHeight: 1.7 }}>
        OllamoMUI is a drop-in Ollama replacement — all standard Ollama endpoints work unmodified.
        Plus, we add custom endpoints for RAG, memory, settings, and provider management.
      </p>

      <ApiDocsContent />
    </main>
  );
}
