"use client";

import React, { useRef, useEffect, useState } from "react";
import { MessageSquare, Grid, Brain, Shield, Infinity, Zap, Terminal } from "lucide-react";

const features = [
  { id: "chat", icon: MessageSquare, title: "Chat Playground", benefit: "Stream any model in the browser \u2014 markdown, real-time, no setup.", color: "#0d9488" },
  { id: "models", icon: Grid, title: "Models Browser", benefit: "Browse & search every model across all connected providers.", color: "#d97706" },
  { id: "rag", icon: Brain, title: "RAG Knowledge Base", benefit: "Upload docs, get answers grounded in your own data via pgvector.", color: "#e11d48" },
  { id: "memory", icon: Shield, title: "Persistent Memory", benefit: "Conversations, facts & context survive restarts in PostgreSQL.", color: "#7c2d12" },
  { id: "providers", icon: Infinity, title: "Multi-Provider", benefit: "OpenRouter, OpenAI, Anthropic, Groq, DeepSeek, Gemini \u2014 one box.", color: "#059669" },
  { id: "config", icon: Zap, title: "Zero Config", benefit: "One file. Run it, paste a free key, point your tools at it.", color: "#0d9488" },
  { id: "compat", icon: Terminal, title: "Full Compatibility", benefit: "Ollama, OpenAI & Anthropic formats \u2014 works with every AI tool.", color: "#d97706" },
];

interface ConnectorPoint {
  id: string;
  left: number;
  top: number;
  right: number;
  bottom: number;
  color: string;
}

export default function FeatureMatchSection() {
  const gridRef = useRef<HTMLDivElement>(null);
  const [points, setPoints] = useState<ConnectorPoint[]>([]);

  useEffect(() => {
    function measure() {
      const grid = gridRef.current;
      if (!grid) return;
      const gridLeft = grid.getBoundingClientRect().left;
      const gridTop = grid.getBoundingClientRect().top;

      const result: ConnectorPoint[] = [];
      for (const f of features) {
        const leftEl = document.getElementById(`feat-${f.id}`);
        const rightEl = document.getElementById(`ben-${f.id}`);
        if (!leftEl || !rightEl) continue;

        const lr = leftEl.getBoundingClientRect();
        const rr = rightEl.getBoundingClientRect();
        result.push({
          id: f.id,
          left: lr.right - gridLeft,
          top: lr.top + lr.height / 2 - gridTop,
          right: rr.left - gridLeft,
          bottom: rr.top + rr.height / 2 - gridTop,
          color: f.color,
        });
      }
      setPoints(result);
    }

    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  return (
    <section className="lazy-section" style={{
      padding: "var(--space-3xl) 24px", maxWidth: 1000, margin: "0 auto",
    }}>
      <h2 style={{
        textAlign: "center", fontSize: "var(--text-h2)", fontWeight: 700,
        letterSpacing: "-0.02em", marginBottom: 8,
      }}>
        Features → Benefits
      </h2>
      <p style={{
        textAlign: "center", color: "var(--text-muted)", marginBottom: 48,
        fontSize: "var(--text-body)",
      }}>
        Every feature maps to a real outcome.
      </p>

      <div ref={gridRef} style={{
        display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12,
        position: "relative",
      }}>
        {/* Left column — features */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.id} id={`feat-${f.id}`} style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "12px 16px", borderRadius: 12,
                background: "var(--surface)", border: "1px solid var(--glass-border)",
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: `${f.color}1a`, border: `1px solid ${f.color}33`,
                  color: f.color,
                }}>
                  <Icon size={18} strokeWidth={1.8} />
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>{f.title}</div>
              </div>
            );
          })}
        </div>

        {/* Right column — benefits */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {features.map((f) => (
            <div key={f.id} id={`ben-${f.id}`} style={{
              padding: "12px 16px", borderRadius: 12,
              background: "color-mix(in srgb, var(--surface) 70%, transparent)",
              border: "1px solid var(--glass-border)",
              fontSize: 13, color: "var(--text-muted)", lineHeight: 1.4,
              minHeight: 36, display: "flex", alignItems: "center",
            }}>
              {f.benefit}
            </div>
          ))}
        </div>

        {/* SVG overlay with connector lines */}
        <svg
          style={{
            position: "absolute", inset: 0, width: "100%", height: "100%",
            pointerEvents: "none", zIndex: 1,
          }}
        >
          {points.map((p) => {
            const midX = (p.left + p.right) / 2;
            const d = `M ${p.left} ${p.top} C ${midX} ${p.top} ${midX} ${p.bottom} ${p.right} ${p.bottom}`;
            return (
              <g key={p.id}>
                <path d={d} fill="none" stroke={p.color} strokeWidth={2} opacity={0.3} />
                <path d={d} fill="none" stroke={p.color} strokeWidth={2} strokeDasharray="5 4" opacity={0.6}>
                  <animate attributeName="strokeDashoffset" from="18" to="0" dur="1.2s" repeatCount="indefinite" />
                </path>
                <circle cx={p.right} cy={p.bottom} r={4} fill={p.color} />
              </g>
            );
          })}
        </svg>
      </div>
    </section>
  );
}
