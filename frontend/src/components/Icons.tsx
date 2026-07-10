"use client";

import { BrandIcon } from "@/components/BrandIcon";

export function LogoSvg({ size = 48 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="logoGrad" x1="0" y1="0" x2="48" y2="48">
          <stop offset="0%" stopColor="#6c5ce7" />
          <stop offset="100%" stopColor="#00cec9" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="14" fill="url(#logoGrad)" opacity="0.15" />
      <rect x="1" y="1" width="46" height="46" rx="13" stroke="url(#logoGrad)" strokeWidth="1" opacity="0.4" />
      <path d="M14 18C14 15.7909 15.7909 14 18 14H30C32.2091 14 34 15.7909 34 18V24C34 26.2091 32.2091 28 30 28H26L22 32V28H18C15.7909 28 14 26.2091 14 24V18Z" fill="url(#logoGrad)" />
      <circle cx="20" cy="21" r="2" fill="white" opacity="0.9" />
      <circle cx="28" cy="21" r="2" fill="white" opacity="0.9" />
      <path d="M20 25C20 25 22 27 24 27C26 27 28 25 28 25" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
    </svg>
  );
}

export function FeatureIcon({ type, size = 40 }: { type: string; size?: number }) {
  const icons: Record<string, React.JSX.Element> = {
    server: (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
        <rect x="4" y="4" width="40" height="40" rx="12" fill="#6c5ce7" opacity="0.1" />
        <rect x="12" y="14" width="24" height="6" rx="3" stroke="#6c5ce7" strokeWidth="2" fill="none" />
        <rect x="12" y="24" width="24" height="6" rx="3" stroke="#6c5ce7" strokeWidth="2" fill="none" />
        <circle cx="16" cy="17" r="1.5" fill="#6c5ce7" />
        <circle cx="16" cy="27" r="1.5" fill="#6c5ce7" />
        <path d="M28 17h4M28 27h4" stroke="#6c5ce7" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    key: (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
        <rect x="4" y="4" width="40" height="40" rx="12" fill="#fd79a8" opacity="0.1" />
        <circle cx="20" cy="20" r="6" stroke="#fd79a8" strokeWidth="2" fill="none" />
        <path d="M24.5 24.5L32 32" stroke="#fd79a8" strokeWidth="2" strokeLinecap="round" />
        <path d="M29 32l3-3M32 29l-3 3" stroke="#fd79a8" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
    terminal: (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
        <rect x="4" y="4" width="40" height="40" rx="12" fill="#00b894" opacity="0.1" />
        <path d="M14 18l6 6-6 6" stroke="#00b894" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M24 30h10" stroke="#00b894" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    ),
    brain: (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
        <rect x="4" y="4" width="40" height="40" rx="12" fill="#fdcb6e" opacity="0.1" />
        <path d="M24 12c-3 0-6 2-7 5s0 6 2 8c-2 1-4 3-4 6 0 2 1 4 3 5 1 0 2-1 3-2 1 1 2 2 3 2s2-1 3-2c1 1 2 2 3 2 2-1 3-3 3-5 0-3-2-5-4-6 2-2 4-5 2-8s-4-5-7-5z" stroke="#fdcb6e" strokeWidth="2" fill="none" />
        <circle cx="20" cy="20" r="1.5" fill="#fdcb6e" />
        <circle cx="28" cy="20" r="1.5" fill="#fdcb6e" />
        <circle cx="24" cy="26" r="1.5" fill="#fdcb6e" />
      </svg>
    ),
    chat: (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
        <rect x="4" y="4" width="40" height="40" rx="12" fill="#00cec9" opacity="0.1" />
        <path d="M10 12h28a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H16l-6 6V14a2 2 0 0 1 2-2z" stroke="#00cec9" strokeWidth="2" fill="none" />
        <circle cx="18" cy="22" r="2" fill="#00cec9" />
        <circle cx="24" cy="22" r="2" fill="#00cec9" />
        <circle cx="30" cy="22" r="2" fill="#00cec9" />
      </svg>
    ),
    shield: (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
        <rect x="4" y="4" width="40" height="40" rx="12" fill="#6c5ce7" opacity="0.1" />
        <path d="M24 8L12 14v8c0 8 5 15 12 17 7-2 12-9 12-17v-8L24 8z" stroke="#6c5ce7" strokeWidth="2" fill="none" />
        <path d="M18 24l4 4 8-8" stroke="#6c5ce7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    infinity: (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
        <rect x="4" y="4" width="40" height="40" rx="12" fill="#00cec9" opacity="0.1" />
        <path d="M32 18c0-3-2.5-5.5-5.5-5.5S21 15 21 18s2.5 5.5 5.5 5.5S32 21 32 18zM16 18c0-3 2.5-5.5 5.5-5.5S27 15 27 18s-2.5 5.5-5.5 5.5S16 21 16 18z" stroke="#00cec9" strokeWidth="2" fill="none" />
      </svg>
    ),
    lightning: (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
        <rect x="4" y="4" width="40" height="40" rx="12" fill="#fdcb6e" opacity="0.1" />
        <path d="M26 8L14 26h8l-2 14 12-18h-8l2-14z" fill="#fdcb6e" opacity="0.8" />
      </svg>
    ),
  };
  return icons[type] || icons.server;
}

export function PageIcon({ type, color }: { type: string; color: string }) {
  const icons: Record<string, React.JSX.Element> = {
    home: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
    chat: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        <path d="M8 10h8M8 14h4" />
      </svg>
    ),
    settings: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
    book: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        <line x1="8" y1="7" x2="16" y2="7" />
        <line x1="8" y1="11" x2="14" y2="11" />
      </svg>
    ),
    brain: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a5 5 0 0 0-5 5v2a4 4 0 0 0-4 4 4 4 0 0 0 2 3.5V18a5 5 0 0 0 5 5h4a5 5 0 0 0 5-5v-3.5A4 4 0 0 0 23 11a4 4 0 0 0-4-4V7a5 5 0 0 0-5-5z" />
        <circle cx="9.5" cy="12.5" r="1" fill={color} />
        <circle cx="14.5" cy="12.5" r="1" fill={color} />
        <path d="M10 17h4" />
      </svg>
    ),
    upload: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="17 8 12 3 7 8" />
        <line x1="12" y1="3" x2="12" y2="15" />
      </svg>
    ),
    search: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    ),
    doc: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    ),
    trash: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 6 5 6 21 6" />
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      </svg>
    ),
    plus: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
      </svg>
    ),
    save: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
        <polyline points="17 21 17 13 7 13 7 21" />
        <polyline points="7 3 7 8 15 8" />
      </svg>
    ),
    send: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="22" y1="2" x2="11" y2="13" />
        <polygon points="22 2 15 22 11 13 2 9 22 2" />
      </svg>
    ),
    refresh: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="23 4 23 10 17 10" />
        <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
      </svg>
    ),
    export: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
      </svg>
    ),
  };
  return icons[type] || null;
}

const MESH: number[][] = [
  [60, 70], [150, 36], [720, 72], [770, 210], [44, 300], [120, 452],
  [300, 40], [520, 28], [690, 470], [400, 476], [86, 210], [748, 330],
  [230, 484], [580, 56], [40, 140], [760, 420],
];
const MESH_LINES: number[][][] = (() => {
  const lines: number[][][] = [];
  for (let a = 0; a < MESH.length; a++) {
    for (let b = a + 1; b < MESH.length; b++) {
      const dx = MESH[a][0] - MESH[b][0];
      const dy = MESH[a][1] - MESH[b][1];
      if (Math.hypot(dx, dy) < 190) lines.push([MESH[a], MESH[b]]);
    }
  }
  return lines;
})();

function Pulse({ x, y, color, delay }: { x: number; y: number; color: string; delay: number }) {
  return (
    <circle cx={x} cy={y} r="6" fill="none" stroke={color} strokeWidth="1" opacity="0.6">
      <animate attributeName="r" values="6;24" dur="2.6s" begin={`${delay}s`} repeatCount="indefinite" />
      <animate attributeName="opacity" values="0.6;0" dur="2.6s" begin={`${delay}s`} repeatCount="indefinite" />
    </circle>
  );
}

export function HeroIllustration() {
  const leftNodes = [
    { n: "ClaudeCode", c: "#fd79a8" },
    { n: "OpenCode", c: "#6c5ce7" },
    { n: "KiloCode", c: "#00b894" },
    { n: "CodexCLI", c: "#10a37f" },
    { n: "Ollama CLI", c: "#00cec9" },
  ];
  const rightNodes = [
    { n: "OpenAI", c: "#10a37f" },
    { n: "Anthropic", c: "#fd79a8" },
    { n: "Groq", c: "#fdcb6e" },
    { n: "DeepSeek", c: "#e17055" },
    { n: "Gemini", c: "#4285f4" },
    { n: "OpenRouter", c: "#6c5ce7" },
    { n: "Mistral", c: "#ff7000" },
  ];
  const cx = 400, cy = 250, coreInX = 350, coreOutX = 450, leftX = 110, rightX = 690;
  const ORBIT: [number, string][] = [[0, "#00f0ff"], [120, "#ec4899"], [240, "#8b5cf6"]];
  return (
    <svg width="800" height="500" viewBox="0 0 800 500" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ maxWidth: "100%", height: "auto", background: "#0d0d1a", borderRadius: 16 }}>
      <defs>
        <linearGradient id="bgGrad" x1="0" y1="0" x2="800" y2="500">
          <stop offset="0%" stopColor="#0d0d1a" />
          <stop offset="50%" stopColor="#1a1a2e" />
          <stop offset="100%" stopColor="#0d0d1a" />
        </linearGradient>
        <radialGradient id="coreGrad">
          <stop offset="0%" stopColor="#00f0ff" stopOpacity="0.55" />
          <stop offset="60%" stopColor="#8b5cf6" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#ec4899" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="glowCyan" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#00f0ff" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#00f0ff" stopOpacity="0.2" />
        </linearGradient>
        <linearGradient id="glowPurple" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.2" />
        </linearGradient>
        <linearGradient id="glowMagenta" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ec4899" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#ec4899" stopOpacity="0.2" />
        </linearGradient>
        <filter id="glow"><feGaussianBlur stdDeviation="4" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
        <filter id="softGlow"><feGaussianBlur stdDeviation="12" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
      </defs>
      <style>{`@keyframes flow{0%{stroke-dashoffset:120}100%{stroke-dashoffset:0}}@keyframes pulse{0%,100%{opacity:.25}50%{opacity:.85}}@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-14px)}}.data-line{stroke-dasharray:8 7;animation:flow 2.4s linear infinite;stroke-width:1.6;fill:none}.node-pulse{animation:pulse 2.4s ease-in-out infinite}.orb{animation:float 6s ease-in-out infinite}`}</style>
      <rect width="800" height="500" fill="url(#bgGrad)" />

      {/* Neural mesh backdrop */}
      <g>
        {MESH_LINES.map(([a, b], i) => (
          <line key={i} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke="rgba(139,92,246,0.07)" strokeWidth="0.5" />
        ))}
        {MESH.map((p, i) => (
          <circle key={i} cx={p[0]} cy={p[1]} r="1.6" fill="#8b5cf6" opacity="0.3" className="orb" style={{ animationDelay: `${-(i % 5)}s` }} />
        ))}
      </g>

      {/* Ambient orbs */}
      <circle cx="100" cy="100" r="80" fill="#00f0ff" opacity="0.04" filter="url(#softGlow)" className="orb" />
      <circle cx="700" cy="400" r="120" fill="#8b5cf6" opacity="0.04" filter="url(#softGlow)" className="orb" style={{ animationDelay: "-3s" }} />
      <circle cx="400" cy="250" r="100" fill="#ec4899" opacity="0.03" filter="url(#softGlow)" className="orb" style={{ animationDelay: "-1.5s" }} />

      {/* LEFT: CLI AGENTS */}
      <text x={leftX} y="44" fill="#94a3b8" fontSize="12" fontWeight="600" textAnchor="middle" letterSpacing="2">CLI AGENTS</text>
      {leftNodes.map((node, i) => {
        const ly = 72 + i * 38;
        return (
          <g key={node.n}>
            <Pulse x={leftX} y={ly} color={node.c} delay={i * 0.4} />
            <rect x={leftX - 64} y={ly - 13} width="128" height="26" rx="13" fill="rgba(0,240,255,0.08)" stroke={node.c} strokeOpacity="0.35" strokeWidth="0.5" />
            <foreignObject x={leftX - 59} y={ly - 11} width="22" height="22">
              <div {...({ xmlns: "http://www.w3.org/1999/xhtml" } as Record<string, unknown>)} style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
                <BrandIcon name={node.n} size={16} color={node.c} />
              </div>
            </foreignObject>
            <text x={leftX - 30} y={ly + 4} fill={node.c} fontSize="11" fontWeight="500" textAnchor="start">{node.n}</text>
          </g>
        );
      })}

      {/* RIGHT: CLOUD PROVIDERS */}
      <text x={rightX} y="40" fill="#94a3b8" fontSize="12" fontWeight="600" textAnchor="middle" letterSpacing="2">CLOUD PROVIDERS</text>
      {rightNodes.map((node, i) => {
        const ry = 56 + i * 36;
        return (
          <g key={node.n}>
            <Pulse x={rightX} y={ry} color={node.c} delay={i * 0.35} />
            <rect x={rightX - 64} y={ry - 13} width="128" height="26" rx="13" fill="rgba(139,92,246,0.08)" stroke={node.c} strokeOpacity="0.35" strokeWidth="0.5" />
            <foreignObject x={rightX - 59} y={ry - 11} width="22" height="22">
              <div {...({ xmlns: "http://www.w3.org/1999/xhtml" } as Record<string, unknown>)} style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
                <BrandIcon name={node.n} size={16} color={node.c} />
              </div>
            </foreignObject>
            <text x={rightX - 30} y={ry + 4} fill={node.c} fontSize="11" fontWeight="500" textAnchor="start">{node.n}</text>
          </g>
        );
      })}

      {/* CONNECTING LINES: CLI AGENTS -> CORE */}
      <g stroke="#00f0ff" fill="none" className="data-line">
        {leftNodes.map((_, i) => {
          const ly = 72 + i * 38;
          const ey = 250 + (i - 2) * 15;
          return <path key={i} d={`M ${leftX} ${ly} C 240 ${ly}, 300 ${ey}, ${coreInX} ${ey}`} />;
        })}
      </g>
      {leftNodes.map((_, i) => {
        const ly = 72 + i * 38;
        const ey = 250 + (i - 2) * 15;
        return (
          <circle key={i} r="3" fill="#00f0ff" filter="url(#glow)">
            <animateMotion dur={`${1.8 + i * 0.25}s`} repeatCount="indefinite" path={`M ${leftX} ${ly} C 240 ${ly}, 300 ${ey}, ${coreInX} ${ey}`} />
          </circle>
        );
      })}

      {/* CONNECTING LINES: CORE -> CLOUD PROVIDERS */}
      <g stroke="#8b5cf6" fill="none" className="data-line">
        {rightNodes.map((_, i) => {
          const ry = 56 + i * 36;
          const ey = 250 + (i - 3) * 13;
          return <path key={i} d={`M ${coreOutX} ${ey} C 500 ${ey}, 560 ${ry}, ${rightX} ${ry}`} />;
        })}
      </g>
      {rightNodes.map((_, i) => {
        const ry = 56 + i * 36;
        const ey = 250 + (i - 3) * 13;
        return (
          <circle key={i} r="3" fill="#8b5cf6" filter="url(#glow)">
            <animateMotion dur={`${2 + i * 0.22}s`} repeatCount="indefinite" path={`M ${coreOutX} ${ey} C 500 ${ey}, 560 ${ry}, ${rightX} ${ry}`} />
          </circle>
        );
      })}

      {/* CENTER: NEURAL PROXY CORE */}
      <circle cx={cx} cy={cy} r="100" fill="url(#coreGrad)" opacity="0.18" filter="url(#softGlow)" className="node-pulse" />
      <circle cx={cx} cy={cy} r="84" fill="none" stroke="url(#glowCyan)" strokeWidth="1.5" strokeDasharray="6 10" opacity="0.7">
        <animateTransform attributeName="transform" type="rotate" from={`0 ${cx} ${cy}`} to={`360 ${cx} ${cy}`} dur="22s" repeatCount="indefinite" />
      </circle>
      <circle cx={cx} cy={cy} r="66" fill="none" stroke="url(#glowPurple)" strokeWidth="1.5" strokeDasharray="4 12" opacity="0.7">
        <animateTransform attributeName="transform" type="rotate" from={`360 ${cx} ${cy}`} to={`0 ${cx} ${cy}`} dur="30s" repeatCount="indefinite" />
      </circle>
      {/* orbiting sub-nodes (RAG / Memory / Stream) */}
      <g>
        <animateTransform attributeName="transform" type="rotate" from={`0 ${cx} ${cy}`} to={`360 ${cx} ${cy}`} dur="14s" repeatCount="indefinite" />
        {ORBIT.map(([deg, col], i) => {
          const a = (deg * Math.PI) / 180;
          const ox = cx + 104 * Math.cos(a);
          const oy = cy + 104 * Math.sin(a);
          return <circle key={i} cx={ox} cy={oy} r="5" fill={col} filter="url(#glow)" />;
        })}
      </g>
      <polygon points="400,198 445,224 445,276 400,302 355,276 355,224" fill="rgba(12,12,26,0.92)" stroke="url(#glowCyan)" strokeWidth="2" filter="url(#glow)" />
      <polygon points="400,210 435,230 435,270 400,290 365,270 365,230" fill="none" stroke="rgba(236,72,153,0.4)" strokeWidth="1" />
      <text x={cx} y={cy - 8} fill="#00f0ff" fontSize="16" fontWeight="700" textAnchor="middle">{">"}_</text>
      <text x={cx} y={cy + 12} fill="#ffffff" fontSize="13" fontWeight="600" textAnchor="middle">OllamaEmu</text>
      <text x={cx} y={cy + 26} fill="#94a3b8" fontSize="8" textAnchor="middle" letterSpacing="1">NEURAL PROXY</text>
      <circle cx={cx} cy={cy} r="10" fill="none" stroke="#00f0ff" strokeWidth="1.2" opacity="0.6">
        <animate attributeName="r" values="10;48" dur="2.4s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.6;0" dur="2.4s" repeatCount="indefinite" />
      </circle>

      {/* Footer */}
      <text x={cx} y="484" fill="#94a3b8" fontSize="10" fontWeight="300" textAnchor="middle" letterSpacing="1">http://localhost:11434  ·  CLI → OllamaEmu → any cloud model</text>
    </svg>
  );
}

export function ProviderLogos() {
  const providers = [
    { name: "OpenRouter", key: "OpenRouter", color: "#6c5ce7" },
    { name: "OpenAI", key: "OpenAI", color: "#00b894" },
    { name: "Anthropic", key: "Anthropic", color: "#fd79a8" },
    { name: "Groq", key: "Groq", color: "#fdcb6e" },
    { name: "Gemini", key: "Gemini", color: "#00cec9" },
    { name: "DeepSeek", key: "DeepSeek", color: "#e17055" },
    { name: "Mistral", key: "Mistral", color: "#ff7000" },
    { name: "Together", key: "Together", color: "#0b8a4a" },
  ];
  return (
    <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
      {providers.map((p) => (
        <div key={p.name} style={{
          display: "flex", alignItems: "center", gap: 8,
          padding: "6px 14px", borderRadius: 10, fontSize: 13, fontWeight: 600,
          background: `${p.color}10`, border: `1px solid ${p.color}30`,
          color: p.color, letterSpacing: "0.02em",
        }}>
          <BrandIcon name={p.key} size={18} color={p.color} />
          {p.name}
        </div>
      ))}
    </div>
  );
}

export function CodeSnippet() {
  return (
    <div style={{
      background: "var(--bg-2)", borderRadius: 16, border: "1px solid var(--glass-border)",
      padding: 20, fontFamily: "'JetBrains Mono', 'Fira Code', monospace", fontSize: 13,
      lineHeight: 1.7, overflow: "hidden", position: "relative",
    }}>
      <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
        <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#e17055" }} />
        <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#fdcb6e" }} />
        <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#00b894" }} />
        <span style={{ marginLeft: 12, color: "var(--text-muted)", fontSize: 11 }}>terminal</span>
      </div>
      <div>
        <span style={{ color: "var(--green)" }}>$</span>{" "}
        <span style={{ color: "var(--accent-2)" }}>curl</span>{" "}
        <span style={{ color: "var(--text-muted)" }}>localhost:11434/api/chat</span>
        <span style={{ color: "var(--text-muted)" }}> \</span>
      </div>
      <div style={{ paddingLeft: 16 }}>
        <span style={{ color: "var(--text-muted)" }}>-d &apos;{`{"model": "tencent/hy3:free"}`}&apos;</span>
      </div>
      <div style={{ marginTop: 12 }}>
        <span style={{ color: "var(--green)" }}>$</span>{" "}
        <span style={{ color: "var(--accent-2)" }}>claude</span>{" "}
        <span style={{ color: "var(--text-muted)" }}>--provider-url</span>{" "}
        <span style={{ color: "var(--accent-4)" }}>localhost:11434</span>
      </div>
      <div style={{ marginTop: 12 }}>
        <span style={{ color: "var(--green)" }}>$</span>{" "}
        <span style={{ color: "var(--accent-2)" }}>python</span>{" "}
        <span style={{ color: "var(--text-muted)" }}>ollama_emu_desktop.py</span>
      </div>
      <div style={{ marginTop: 8, color: "var(--text-muted)", fontSize: 11 }}>
        <span style={{ color: "var(--green)" }}>{">"}</span> Server running on http://localhost:11434
      </div>
    </div>
  );
}
