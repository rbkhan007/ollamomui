import type { Metadata } from "next";
import { SITE_URL } from "@/lib/config";
import { ArchitectureDiagram, RagPipelineDiagram } from "./diagram";

export const metadata: Metadata = {
  title: "Architecture — Request Lifecycle & RAG Pipeline",
  description: "Deep dive into OllamoMUI's architecture: how prompts flow through the FastAPI gateway, ACL middleware, provider router, and streaming response. RAG pipeline with hybrid vector+keyword search and cross-encoder reranking.",
  alternates: { canonical: `${SITE_URL}/architecture` },
  openGraph: {
    title: "Technical Deep Dive — OllamoMUI Architecture",
    description: "Interactive Mermaid diagrams showing the full request lifecycle and RAG pipeline. FastAPI gateway, ACL middleware, provider router, and cross-encoder reranking.",
    url: `${SITE_URL}/architecture`,
    images: [{ url: `${SITE_URL}/og-image.png`, width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Technical Deep Dive — OllamoMUI Architecture",
    description: "Interactive Mermaid diagrams: request lifecycle & RAG pipeline.",
    images: [`${SITE_URL}/og-image.png`],
  },
};

export default function ArchitecturePage() {
  return (
    <main style={{ maxWidth: 960, margin: "0 auto", padding: "clamp(24px, 5vw, 48px) clamp(16px, 4vw, 24px)" }}>
      <h1 style={{ fontSize: "clamp(1.6rem, 4vw, 2.2rem)", fontWeight: 800, marginBottom: 8, letterSpacing: "-0.02em", color: "var(--text)" }}>Technical Deep Dive</h1>
      <p style={{ color: "var(--text)", fontSize: "clamp(0.95rem, 2vw, 1.05rem)", marginBottom: 40, maxWidth: 640, lineHeight: 1.7 }}>
        How a single prompt travels from your keyboard through the FastAPI gateway, ACL middleware,
        provider router, and streaming response — plus how RAG retrieves and reranks context.
      </p>

      <section style={{ marginBottom: 48 }}>
        <h2 style={{ fontSize: "clamp(1.2rem, 3vw, 1.4rem)", fontWeight: 700, marginBottom: 6, color: "var(--text)" }}>Request Lifecycle</h2>
        <p style={{ color: "var(--text-muted)", fontSize: "clamp(13px, 1.5vw, 14px)", marginBottom: 20, lineHeight: 1.7 }}>
          Every prompt passes through five layers: validation, auth/rate-limiting, provider routing,
          upstream LLM call, and streaming response. The system supports OpenAI, Anthropic, and
          Gemini wire formats simultaneously.
        </p>
        <ArchitectureDiagram />
      </section>

      <section>
        <h2 style={{ fontSize: "clamp(1.2rem, 3vw, 1.4rem)", fontWeight: 700, marginBottom: 6, color: "var(--text)" }}>RAG Pipeline</h2>
        <p style={{ color: "var(--text-muted)", fontSize: "clamp(13px, 1.5vw, 14px)", marginBottom: 20, lineHeight: 1.7 }}>
          Documents are chunked, embedded via pgvector, and indexed with pg_trgm for keyword search.
          On query, results are merged and reranked by a cross-encoder model before injection into the
          LLM context.
        </p>
        <RagPipelineDiagram />
      </section>
    </main>
  );
}

