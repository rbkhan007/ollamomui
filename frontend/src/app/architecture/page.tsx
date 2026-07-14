import type { Metadata } from "next";
import { SITE_URL } from "@/lib/config";
import { ArchitectureFlow, DeploymentFlow, AuthFlow, WaterfallSdlcFlow } from "./reactflow-diagram";

export const metadata: Metadata = {
  title: "Architecture — Request Lifecycle & RAG Pipeline",
  description: "Deep dive into OllamoMUI's architecture: how prompts flow through the FastAPI gateway, ACL middleware, provider router, and streaming response. RAG pipeline with hybrid vector+keyword search and cross-encoder reranking.",
  alternates: { canonical: `${SITE_URL}/architecture` },
  openGraph: {
    title: "Technical Deep Dive — OllamoMUI Architecture",
    description: "Interactive diagrams showing the full request lifecycle and RAG pipeline. FastAPI gateway, ACL middleware, provider router, and cross-encoder reranking.",
    url: `${SITE_URL}/architecture`,
    images: [{ url: `${SITE_URL}/og-image.png`, width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Technical Deep Dive — OllamoMUI Architecture",
    description: "Interactive diagrams: request lifecycle & RAG pipeline.",
    images: [`${SITE_URL}/og-image.png`],
  },
};

export default function ArchitecturePage() {
  return (
    <main style={{ maxWidth: "var(--container-max)", margin: "0 auto", padding: "64px 24px" }}>
      <h1 style={{ fontSize: "var(--text-h1)", fontWeight: 700, lineHeight: "var(--leading-heading)", marginBottom: 8, letterSpacing: "-0.02em", color: "var(--text)" }}>Technical Deep Dive</h1>
      <p style={{ color: "var(--text)", fontSize: "var(--text-body)", marginBottom: 48, maxWidth: "var(--text-max)", lineHeight: "var(--leading-body)" }}>
        How a single prompt travels from your keyboard through the FastAPI gateway, ACL middleware,
        provider router, and streaming response — plus how RAG retrieves and reranks context.
      </p>

      <section style={{ marginBottom: 48 }}>
        <ArchitectureFlow />
      </section>

      <section style={{ marginBottom: 48 }}>
        <h2 style={{ fontSize: "var(--text-h2)", fontWeight: 700, marginBottom: 8, color: "var(--text)" }}>Deployment Architecture</h2>
        <p style={{ color: "var(--text-muted)", fontSize: "var(--text-sm)", marginBottom: 24, maxWidth: "var(--text-max)", lineHeight: "var(--leading-small)" }}>
          How the frontend, backend, database, and client apps connect through Cloudflare, Vercel, Render, and NeonDB.
        </p>
        <DeploymentFlow />
      </section>

      <section style={{ marginBottom: 48 }}>
        <h2 style={{ fontSize: "var(--text-h2)", fontWeight: 700, marginBottom: 8, color: "var(--text)" }}>Auth &amp; Security Flow</h2>
        <p style={{ color: "var(--text-muted)", fontSize: "var(--text-sm)", marginBottom: 24, maxWidth: "var(--text-max)", lineHeight: "var(--leading-small)" }}>
          How every request is rate-limited, authenticated via session cookie or API key, authorized by role, and logged to the audit trail.
        </p>
        <AuthFlow />
      </section>

      <section>
        <h2 style={{ fontSize: "var(--text-h2)", fontWeight: 700, marginBottom: 8, color: "var(--text)" }}>Waterfall SDLC</h2>
        <p style={{ color: "var(--text-muted)", fontSize: "var(--text-sm)", marginBottom: 24, maxWidth: "var(--text-max)", lineHeight: "var(--leading-small)" }}>
          The sequential software development lifecycle that guided OllamoMUI from requirements through maintenance — with feedback arcs linking later phases back to earlier ones.
        </p>
        <WaterfallSdlcFlow />
      </section>
    </main>
  );
}
