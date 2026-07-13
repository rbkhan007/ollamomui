import type { Metadata } from "next";
import { SITE_URL } from "@/lib/config";
import { ArchitectureDiagram } from "./diagram";

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

function RagPipelineDiagram() {
  return (
    <div style={{
      background: "var(--surface)", borderRadius: 16, border: "1px solid var(--glass-border)",
      padding: "clamp(16px, 3vw, 24px)", overflow: "auto",
    }}>
      <svg viewBox="0 0 800 320" style={{ width: "100%", height: "auto", maxWidth: 800 }} xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#6c5ce7"/><stop offset="100%" stopColor="#00cec9"/></linearGradient>
          <linearGradient id="g2" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#fd79a8"/><stop offset="100%" stopColor="#6c5ce7"/></linearGradient>
          <linearGradient id="g3" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#00cec9"/><stop offset="100%" stopColor="#fdcb6e"/></linearGradient>
        </defs>
        <rect x="20" y="10" width="760" height="300" rx="12" fill="none" stroke="var(--glass-border)" strokeWidth="1" />
        <text x="40" y="38" fontSize="13" fontWeight="bold" fill="var(--text-muted)">RAG Pipeline</text>
        <rect x="50" y="60" width="140" height="50" rx="10" fill="rgba(108,92,231,0.12)" stroke="#6c5ce7" strokeWidth="1.5" />
        <text x="120" y="90" fontSize="13" fontWeight="600" fill="#6c5ce7" textAnchor="middle">User Query</text>
        <line x1="190" y1="85" x2="250" y2="85" stroke="var(--text-muted)" strokeWidth="1.5" markerEnd="url(#arrow)" />
        <rect x="250" y="60" width="140" height="50" rx="10" fill="rgba(0,206,201,0.12)" stroke="#00cec9" strokeWidth="1.5" />
        <text x="320" y="85" fontSize="13" fontWeight="600" fill="#00cec9" textAnchor="middle">Semantic Search</text>
        <text x="320" y="100" fontSize="11" fill="#00cec9" textAnchor="middle" opacity="0.7">pgvector</text>
        <line x1="250" y1="115" x2="320" y2="135" stroke="var(--text-muted)" strokeWidth="1.5" />
        <rect x="250" y="120" width="140" height="50" rx="10" fill="rgba(253,121,168,0.12)" stroke="#fd79a8" strokeWidth="1.5" />
        <text x="320" y="145" fontSize="13" fontWeight="600" fill="#fd79a8" textAnchor="middle">Keyword Search</text>
        <text x="320" y="160" fontSize="11" fill="#fd79a8" textAnchor="middle" opacity="0.7">pg_trgm</text>
        <line x1="390" y1="85" x2="460" y2="85" stroke="var(--text-muted)" strokeWidth="1.5" />
        <line x1="390" y1="145" x2="460" y2="145" stroke="var(--text-muted)" strokeWidth="1.5" />
        <rect x="460" y="70" width="120" height="50" rx="10" fill="rgba(108,92,231,0.12)" stroke="#6c5ce7" strokeWidth="1.5" />
        <text x="520" y="95" fontSize="13" fontWeight="600" fill="#6c5ce7" textAnchor="middle">Merge &amp; Rerank</text>
        <text x="520" y="110" fontSize="11" fill="#6c5ce7" textAnchor="middle" opacity="0.7">Cross-encoder</text>
        <line x1="580" y1="95" x2="640" y2="95" stroke="var(--text-muted)" strokeWidth="1.5" />
        <rect x="640" y="70" width="120" height="50" rx="10" fill="rgba(0,206,201,0.12)" stroke="#00cec9" strokeWidth="1.5" />
        <text x="700" y="95" fontSize="13" fontWeight="600" fill="#00cec9" textAnchor="middle">LLM Context</text>
        <text x="700" y="110" fontSize="11" fill="#00cec9" textAnchor="middle" opacity="0.7">Injection</text>
        <line x1="580" y1="145" x2="640" y2="220" stroke="var(--text-muted)" strokeWidth="1" strokeDasharray="4" />
        <rect x="640" y="200" width="120" height="40" rx="8" fill="rgba(253,203,110,0.12)" stroke="#fdcb6e" strokeWidth="1.5" />
        <text x="700" y="225" fontSize="12" fontWeight="600" fill="#fdcb6e" textAnchor="middle">Response</text>
        <line x1="520" y1="120" x2="520" y2="260" stroke="var(--text-muted)" strokeWidth="1" strokeDasharray="4" />
        <rect x="440" y="240" width="160" height="40" rx="8" fill="rgba(108,92,231,0.08)" stroke="var(--glass-border)" strokeWidth="1" />
        <text x="520" y="265" fontSize="12" fontWeight="500" fill="var(--text-muted)" textAnchor="middle">PDF / TXT / CSV Upload</text>
        <line x1="520" y1="280" x2="520" y2="290" stroke="var(--text-muted)" strokeWidth="1" />
        <rect x="50" y="230" width="140" height="40" rx="8" fill="rgba(108,92,231,0.08)" stroke="var(--glass-border)" strokeWidth="1" />
        <text x="120" y="255" fontSize="12" fontWeight="500" fill="var(--text-muted)" textAnchor="middle">Document Chunking</text>
        <line x1="120" y1="270" x2="120" y2="290" stroke="var(--text-muted)" strokeWidth="1" />
        <line x1="120" y1="290" x2="520" y2="290" stroke="var(--text-muted)" strokeWidth="1" strokeDasharray="4" />
      </svg>
    </div>
  );
}
