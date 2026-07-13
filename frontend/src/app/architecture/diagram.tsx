"use client";

export function ArchitectureDiagram() {
  return (
    <div style={{
      background: "var(--surface)", borderRadius: 16, border: "1px solid var(--glass-border)",
      padding: "clamp(12px, 2vw, 20px)", overflow: "auto",
      boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
    }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/neural-proxy.svg"
        alt="OllamoMUI Neural Proxy — CLI Agents to Cloud Providers"
        style={{ width: "100%", height: "auto", display: "block" }}
      />
    </div>
  );
}

export function RagPipelineDiagram() {
  const accent1 = "var(--accent)";
  const accent2 = "var(--accent-2)";
  const accent3 = "var(--accent-3)";
  const accent4 = "var(--accent-4)";

  return (
    <div style={{
      background: "var(--surface)", borderRadius: 16, border: "1px solid var(--glass-border)",
      padding: "clamp(12px, 2vw, 20px)", overflow: "auto",
      boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
    }}>
      <svg viewBox="0 0 800 380" style={{ width: "100%", height: "auto", maxWidth: 800 }} xmlns="http://www.w3.org/2000/svg" fontFamily="var(--font-inter), system-ui, sans-serif">
        <defs>
          <marker id="rag-arr" viewBox="0 0 10 10" markerWidth="7" markerHeight="7" refX="9" refY="5" orient="auto">
            <path d="M0,0 L10,5 L0,10 Z" fill="var(--text-muted)" />
          </marker>
          <marker id="rag-acc" viewBox="0 0 10 10" markerWidth="7" markerHeight="7" refX="9" refY="5" orient="auto">
            <path d="M0,0 L10,5 L0,10 Z" fill="var(--text-muted)" />
          </marker>
          <marker id="rag-teal" viewBox="0 0 10 10" markerWidth="7" markerHeight="7" refX="9" refY="5" orient="auto">
            <path d="M0,0 L10,5 L0,10 Z" fill="var(--text-muted)" />
          </marker>
          <linearGradient id="rag-merge" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#6c5ce7" stopOpacity="0.06" /><stop offset="100%" stopColor="#00cec9" stopOpacity="0.10" /></linearGradient>
        </defs>

        {/* Dot grid background */}
        {Array.from({ length: 50 }, (_, i) => {
          const x = 16 + (i % 10) * 80;
          const y = 20 + Math.floor(i / 10) * 85;
          return <circle key={i} cx={x} cy={y} r="1" fill="var(--text-muted)" opacity="0.06" />;
        })}

        <text x="28" y="28" fontSize="11" fontWeight="700" fill="var(--text-muted)" letterSpacing="0.08em">
          RAG Pipeline
        </text>

        {/* User Query */}
        <g>
          <rect x={40} y={60} width={130} height={50} rx="10" fill="color-mix(in srgb, var(--accent) 8%, var(--surface))" stroke={accent1} strokeWidth="2" />
          <text x={105} y={90} fontSize="14" fontWeight="700" fill={accent1} textAnchor="middle" dominantBaseline="middle">User Query</text>
        </g>

        <line x1={170} y1={85} x2={215} y2={85} stroke="var(--text-muted)" strokeWidth="1.5" markerEnd="url(#rag-arr)" />

        {/* Parallel: Semantic + Keyword */}
        <g>
          <rect x={220} y={45} width={150} height={55} rx="10" fill="color-mix(in srgb, var(--accent-2) 8%, var(--surface))" stroke={accent2} strokeWidth="2" />
          <text x={295} y={66} fontSize="13" fontWeight="700" fill={accent2} textAnchor="middle" dominantBaseline="middle">Semantic Search</text>
          <text x={295} y={83} fontSize="11" fill={accent2} textAnchor="middle" dominantBaseline="middle" opacity="0.7">pgvector (cosine sim)</text>
        </g>
        <g>
          <rect x={220} y={115} width={150} height={55} rx="10" fill="color-mix(in srgb, var(--accent-3) 8%, var(--surface))" stroke={accent3} strokeWidth="2" />
          <text x={295} y={136} fontSize="13" fontWeight="700" fill={accent3} textAnchor="middle" dominantBaseline="middle">Keyword Search</text>
          <text x={295} y={153} fontSize="11" fill={accent3} textAnchor="middle" dominantBaseline="middle" opacity="0.7">pg_trgm (fuzzy match)</text>
        </g>

        <line x1={370} y1={72} x2={425} y2={95} stroke="var(--text-muted)" strokeWidth="1.5" markerEnd="url(#rag-arr)" />
        <line x1={370} y1={142} x2={425} y2={95} stroke="var(--text-muted)" strokeWidth="1.5" markerEnd="url(#rag-arr)" />

        {/* Merge & Rerank */}
        <g>
          <rect x={430} y={70} width={140} height={55} rx="10" fill="url(#rag-merge)" stroke={accent1} strokeWidth="2" />
          <text x={500} y={91} fontSize="13" fontWeight="700" fill={accent1} textAnchor="middle" dominantBaseline="middle">Merge &amp; Rerank</text>
          <text x={500} y={108} fontSize="11" fill={accent1} textAnchor="middle" dominantBaseline="middle" opacity="0.7">Cross-encoder</text>
        </g>

        <line x1={570} y1={97} x2={615} y2={97} stroke="var(--text-muted)" strokeWidth="1.5" markerEnd="url(#rag-arr)" />

        {/* LLM Context */}
        <g>
          <rect x={620} y={70} width={140} height={55} rx="10" fill="color-mix(in srgb, var(--accent-2) 8%, var(--surface))" stroke={accent2} strokeWidth="2" />
          <text x={690} y={91} fontSize="13" fontWeight="700" fill={accent2} textAnchor="middle" dominantBaseline="middle">LLM Context</text>
          <text x={690} y={108} fontSize="11" fill={accent2} textAnchor="middle" dominantBaseline="middle" opacity="0.7">Injection</text>
        </g>

        {/* Response */}
        <line x1={690} y1={125} x2={690} y2={185} stroke="var(--text-muted)" strokeWidth="1" strokeDasharray="4 4" markerEnd="url(#rag-arr)" />
        <g>
          <rect x={630} y={190} width={120} height={45} rx="10" fill="color-mix(in srgb, var(--accent-4) 8%, var(--surface))" stroke={accent4} strokeWidth="2" />
          <text x={690} y={217} fontSize="13" fontWeight="700" fill={accent4} textAnchor="middle" dominantBaseline="middle">Response</text>
        </g>

        {/* Upload / Ingest path */}
        <line x1={500} y1={125} x2={500} y2={250} stroke="var(--text-muted)" strokeWidth="1" strokeDasharray="4 4" />
        <g>
          <rect x={420} y={260} width={160} height={36} rx="8" fill="var(--surface)" stroke="var(--glass-border)" strokeWidth="1.5" />
          <text x={500} y={283} fontSize="12" fontWeight="500" fill="var(--text-muted)" textAnchor="middle" dominantBaseline="middle">PDF / TXT / CSV Upload</text>
        </g>
        <line x1={500} y1={296} x2={500} y2={315} stroke="var(--text-muted)" strokeWidth="1" />
        <g>
          <rect x={420} y={320} width={160} height={36} rx="8" fill="var(--surface)" stroke="var(--glass-border)" strokeWidth="1.5" />
          <text x={500} y={343} fontSize="12" fontWeight="500" fill="var(--text-muted)" textAnchor="middle" dominantBaseline="middle">Document Chunking &amp; Embedding</text>
        </g>
        <line x1={420} y1={338} x2={160} y2={338} stroke="var(--text-muted)" strokeWidth="1" strokeDasharray="4 4" markerEnd="url(#rag-arr)" />

        {/* Index DB */}
        <g>
          <rect x={60} y={310} width={100} height={45} rx="10" fill="color-mix(in srgb, var(--accent-3) 8%, var(--surface))" stroke={accent3} strokeWidth="2" />
          <text x={110} y={337} fontSize="13" fontWeight="700" fill={accent3} textAnchor="middle" dominantBaseline="middle">pgvector Index</text>
        </g>

        {/* Note */}
        <rect x={40} y={370} width={720} height={38} rx="8" fill="var(--bg)" stroke="var(--glass-border)" strokeWidth="1" strokeDasharray="4 4" />
        <text x="400" y="394" fontSize="11" fontWeight="500" fill="var(--text-muted)" textAnchor="middle" dominantBaseline="middle">
          Documents are chunked → embedded via pgvector → indexed with pg_trgm for keyword search
        </text>
        <line x1={160} y1={355} x2={400} y2={389} stroke="var(--text-muted)" strokeWidth="1" strokeDasharray="2 3" opacity="0.4" />
      </svg>
    </div>
  );
}