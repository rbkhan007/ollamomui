"use client";

import React, { useMemo } from "react";
import {
  ReactFlow, ReactFlowProvider, useNodesState, useEdgesState,
  Position, BaseEdge, getBezierPath,
  type Node, type Edge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

const FEATURES_DATA = [
  { id: "f1", label: "Chat Playground", benefit: "Stream any model in the browser — markdown, real-time, no setup.", color: "#2dd4bf" },
  { id: "f2", label: "Models Browser", benefit: "Browse & search every model across all connected providers.", color: "#f59e0b" },
  { id: "f3", label: "RAG Knowledge Base", benefit: "Upload docs, get answers grounded in your own data via pgvector.", color: "#f43f5e" },
  { id: "f4", label: "Persistent Memory", benefit: "Conversations, facts & context survive restarts in PostgreSQL.", color: "#a78bfa" },
  { id: "f5", label: "Multi-Provider", benefit: "OpenRouter, OpenAI, Anthropic, Groq, DeepSeek, Gemini — one box.", color: "#10b981" },
  { id: "f6", label: "Zero Config", benefit: "One file. Run it, paste a free key, point your tools at it.", color: "#06b6d4" },
  { id: "f7", label: "Full Compatibility", benefit: "Ollama, OpenAI & Anthropic formats — works with every AI tool.", color: "#f59e0b" },
];

function CustomConnectorEdge({ id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, style }: {
  id: string; sourceX: number; sourceY: number; targetX: number; targetY: number;
  sourcePosition: Position; targetPosition: Position; style?: React.CSSProperties;
}) {
  const [edgePath] = getBezierPath({ sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition });
  return (
    <>
      <BaseEdge path={edgePath} style={{ ...style, strokeDasharray: "6 6", strokeWidth: 2 }} />
      <circle cx={sourceX} cy={sourceY} r={4} fill={(style?.stroke as string) || "#000"} />
    </>
  );
}

function FeatureFlow() {
  const initialNodes: Node[] = useMemo(() => {
    const features: Node[] = FEATURES_DATA.map((f, i) => ({
      id: f.id,
      type: "default",
      position: { x: 0, y: i * 100 },
      data: { label: f.label },
      sourcePosition: Position.Right,
      style: {
        width: 200, background: "var(--surface)", border: "1px solid var(--border)",
        borderRadius: 12, padding: "12px 16px", color: "var(--text)", fontSize: 14, fontWeight: 600,
      },
    }));
    const benefits: Node[] = FEATURES_DATA.map((f, i) => ({
      id: `b-${f.id}`,
      type: "default",
      position: { x: 450, y: i * 100 },
      data: { label: f.benefit },
      targetPosition: Position.Left,
      style: {
        width: 380, background: "color-mix(in srgb, var(--surface) 70%, transparent)",
        border: "1px solid var(--border)", borderRadius: 12, padding: "12px 16px",
        color: "var(--text-muted)", fontSize: 13, lineHeight: 1.4,
      },
    }));
    return [...features, ...benefits];
  }, []);

  const initialEdges: Edge[] = useMemo(() => FEATURES_DATA.map((f) => ({
    id: `e-${f.id}`,
    source: f.id,
    target: `b-${f.id}`,
    type: "customEdge",
    animated: true,
    style: { stroke: f.color },
  })), []);

  const [, , onNodesChange] = useNodesState(initialNodes);
  const [, , onEdgesChange] = useEdgesState(initialEdges);

  return (
    <div style={{ width: "100%", height: 750 }}>
      <ReactFlow
        nodes={initialNodes}
        edges={initialEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodesDraggable={false}
        nodesConnectable={false}
        zoomOnScroll={false}
        panOnScroll={false}
        panOnDrag={false}
        fitView
        edgeTypes={{ customEdge: CustomConnectorEdge }}
        proOptions={{ hideAttribution: true }}
      />
    </div>
  );
}

export default function FeatureBenefitSection() {
  return (
    <section style={{ padding: "var(--space-3xl) 24px", maxWidth: 1000, margin: "0 auto" }}>
      <h2 style={{
        textAlign: "center", fontSize: "var(--text-h2)", fontWeight: 700,
        letterSpacing: "-0.02em", marginBottom: 8,
      }}>
        Features → Benefits
      </h2>
      <p style={{
        textAlign: "center", color: "var(--text-muted)", marginBottom: 24,
        fontSize: "var(--text-body)",
      }}>
        Every feature maps to a real outcome.
      </p>
      <ReactFlowProvider>
        <FeatureFlow />
      </ReactFlowProvider>
    </section>
  );
}
