"use client";

import React, { memo } from "react";
import ReactFlow, {
  Node,
  Edge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  MarkerType,
  NodeProps,
  ConnectionLineComponent,
  EdgeProps,
  BaseEdge,
  getBezierPath,
  Panel,
} from "reactflow";
import "reactflow/dist/style.css";

/* ─── Custom Connection Line (while dragging) ─── */
const ConnectionLine: ConnectionLineComponent = ({ fromX, fromY, toX, toY }) => {
  const path = `M${fromX},${fromY} C ${fromX} ${(fromY + toY) / 2} ${toX} ${(fromY + toY) / 2} ${toX},${toY}`;
  return (
    <g>
      <path fill="none" stroke="var(--accent)" strokeWidth={2} className="animated" d={path} />
      <circle cx={toX} cy={toY} fill="var(--accent)" r={4} stroke="#fff" strokeWidth={1.5} />
    </g>
  );
};

/* ─── Custom Edge Component ─── */
const CustomEdge = memo(function CustomEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style,
  markerEnd,
  label,
  animated,
}: EdgeProps) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <g>
      <BaseEdge id={id} path={edgePath} style={style} markerEnd={markerEnd} />
      {animated && (
        <path
          fill="none"
          stroke={(style as React.CSSProperties)?.stroke || "var(--accent)"}
          strokeWidth={2}
          strokeDasharray="4 4"
          className="animated"
          d={edgePath}
          style={{ animation: "react-flow-edge-dash 1s linear infinite" }}
        />
      )}
      {label && (
        <text
          x={labelX}
          y={labelY}
          fill="var(--text-muted)"
          fontSize={11}
          fontWeight={500}
          textAnchor="middle"
          dominantBaseline="middle"
          style={{ pointerEvents: "none" }}
        >
          {label}
        </text>
      )}
    </g>
  );
});

const edgeTypes = {
  custom: CustomEdge,
};

/* ─── Custom Node Components ─── */

const nodeColor = (type: string, data: Record<string, unknown>): string => {
  if (data.color) return data.color as string;
  switch (type) {
    case "client": return "var(--green)";
    case "gateway": return "var(--accent)";
    case "middleware": return "var(--accent-3)";
    case "storage": return "var(--accent-4)";
    default: return "var(--accent-2)";
  }
};

const BaseNode = memo(function BaseNode({ type, data }: { type: string; data: Record<string, unknown> }) {
  const color = nodeColor(type, data);
  const label = typeof data.label === "string" ? data.label : "";
  const sub = typeof data.sub === "string" ? data.sub : null;
  return (
    <div style={{
      padding: "12px 20px",
      borderRadius: 12,
      background: `color-mix(in srgb, ${color} 10%, var(--surface))`,
      border: `2px solid ${color}`,
      minWidth: 160,
      textAlign: "center",
    }}>
      <div style={{ fontSize: 14, fontWeight: 700, color }}>{label}</div>
      {sub && <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>{sub}</div>}
    </div>
  );
});

const GatewayNode = memo(function GatewayNode({ data }: NodeProps) {
  return <BaseNode type="gateway" data={data} />;
});

const MiddlewareNode = memo(function MiddlewareNode({ data }: NodeProps) {
  return <BaseNode type="middleware" data={data} />;
});

const ProviderNode = memo(function ProviderNode({ data }: NodeProps) {
  return <BaseNode type="provider" data={data} />;
});

const StorageNode = memo(function StorageNode({ data }: NodeProps) {
  return <BaseNode type="storage" data={data} />;
});

const ClientNode = memo(function ClientNode({ data }: NodeProps) {
  return <BaseNode type="client" data={data} />;
});

const nodeTypes = {
  gateway: GatewayNode,
  middleware: MiddlewareNode,
  provider: ProviderNode,
  storage: StorageNode,
  client: ClientNode,
};

/* ─── Adaptive edge factory ─── */
const arrowClsd = { type: MarkerType.ArrowClosed, width: 18, height: 18 } as const;

function colorOf(nodes: Node[], id: string): string {
  const n = nodes.find((x) => x.id === id);
  if (!n) return "var(--accent)";
  return nodeColor(n.type || "gateway", n.data as Record<string, unknown>);
}

function createEdge(
  id: string,
  source: string,
  target: string,
  nodes: Node[],
  opts?: { animated?: boolean; label?: string; dashed?: boolean },
): Edge {
  const c = colorOf(nodes, source);
  return {
    id,
    source,
    target,
    type: "custom",
    animated: opts?.animated,
    style: { stroke: c, ...(opts?.dashed ? { strokeDasharray: "5 5" } : {}) },
    markerEnd: { ...arrowClsd, color: c },
    ...(opts?.label ? { label: opts.label } : {}),
  };
}

/* ─── Unified nodes combining both systems ─── */

const initialNodes: Node[] = [
  /* ── Request Lifecycle ── */
  { id: "cli", type: "client", position: { x: 50, y: 180 }, data: { label: "CLI Client", sub: "Claude Code / Cursor" } },
  { id: "proxy", type: "gateway", position: { x: 300, y: 180 }, data: { label: "OllamoMUI Proxy", sub: "localhost:11434" } },
  { id: "memory", type: "storage", position: { x: 300, y: 320 }, data: { label: "PostgreSQL", sub: "Memory & Sessions" } },
  { id: "acl", type: "middleware", position: { x: 580, y: 80 }, data: { label: "ACL Middleware", sub: "Auth & Rate Limiting" } },
  { id: "router", type: "gateway", position: { x: 580, y: 190 }, data: { label: "Provider Router", sub: "Smart Model Selection" } },
  { id: "stream", type: "gateway", position: { x: 580, y: 300 }, data: { label: "Stream Handler", sub: "SSE Response Buffer" } },
  { id: "openai", type: "provider", position: { x: 850, y: 40 }, data: { label: "OpenAI", sub: "gpt-4o, o1-pro", color: "#10a37f" } },
  { id: "anthropic", type: "provider", position: { x: 850, y: 110 }, data: { label: "Anthropic", sub: "claude-3.7-sonnet", color: "var(--accent-3)" } },
  { id: "groq", type: "provider", position: { x: 850, y: 180 }, data: { label: "Groq", sub: "llama-3.3-70b", color: "#f59e0b" } },
  { id: "deepseek", type: "provider", position: { x: 850, y: 250 }, data: { label: "DeepSeek", sub: "deepseek-v3", color: "var(--accent)" } },
  { id: "gemini", type: "provider", position: { x: 850, y: 320 }, data: { label: "Gemini", sub: "gemini-2.5-pro", color: "var(--accent-2)" } },

  /* ── RAG Pipeline (Ingestion) ── */
  { id: "upload", type: "client", position: { x: 1200, y: 320 }, data: { label: "Document Upload", sub: "PDF / TXT / CSV" } },
  { id: "chunk", type: "gateway", position: { x: 1450, y: 320 }, data: { label: "Chunking", sub: "Split into Passages" } },
  { id: "embed", type: "gateway", position: { x: 1700, y: 320 }, data: { label: "Embedding", sub: "Vector Representation" } },
  { id: "pgvector", type: "storage", position: { x: 1980, y: 260 }, data: { label: "pgvector Index", sub: "Cosine Similarity" } },
  { id: "pgtrgm", type: "storage", position: { x: 1980, y: 370 }, data: { label: "pg_trgm Index", sub: "Fuzzy Keyword Match" } },

  /* ── RAG Pipeline (Query) ── */
  { id: "query", type: "client", position: { x: 1200, y: 90 }, data: { label: "User Query", sub: "Natural Language" } },
  { id: "semantic", type: "provider", position: { x: 1450, y: 40 }, data: { label: "Semantic Search", sub: "Vector Cosine Sim", color: "var(--accent-2)" } },
  { id: "keyword", type: "provider", position: { x: 1450, y: 140 }, data: { label: "Keyword Search", sub: "pg_trgm Fuzzy", color: "var(--accent-3)" } },
  { id: "merge", type: "gateway", position: { x: 1720, y: 90 }, data: { label: "Merge & Rerank", sub: "Cross-Encoder" } },
  { id: "llm", type: "gateway", position: { x: 1980, y: 90 }, data: { label: "LLM Provider", sub: "Context Injection" } },
];

/* ─── Edges auto-derived from node colors ─── */

const initialEdges: Edge[] = [
  /* ── Request Lifecycle ── */
  createEdge("l1", "cli", "proxy", initialNodes, { animated: true }),
  createEdge("l2", "proxy", "memory", initialNodes, { dashed: true, label: "Auto-save" }),
  createEdge("l3", "proxy", "acl", initialNodes),
  createEdge("l4", "acl", "router", initialNodes, { label: "Allow" }),
  createEdge("l5", "router", "stream", initialNodes),
  createEdge("l6", "router", "openai", initialNodes),
  createEdge("l7", "router", "anthropic", initialNodes),
  createEdge("l8", "router", "groq", initialNodes),
  createEdge("l9", "router", "deepseek", initialNodes),
  createEdge("l10", "router", "gemini", initialNodes),
  createEdge("l11", "openai", "stream", initialNodes),
  createEdge("l12", "anthropic", "stream", initialNodes),
  createEdge("l13", "groq", "stream", initialNodes),
  createEdge("l14", "deepseek", "stream", initialNodes),
  createEdge("l15", "gemini", "stream", initialNodes),
  createEdge("l16", "stream", "cli", initialNodes, { animated: true, label: "SSE Stream" }),

  /* ── RAG Ingestion ── */
  createEdge("r1", "upload", "chunk", initialNodes),
  createEdge("r2", "chunk", "embed", initialNodes),
  createEdge("r3", "embed", "pgvector", initialNodes, { label: "Vector index" }),
  createEdge("r4", "chunk", "pgtrgm", initialNodes, { label: "Keyword index" }),

  /* ── RAG Query ── */
  createEdge("r5", "query", "semantic", initialNodes),
  createEdge("r6", "query", "keyword", initialNodes),
  createEdge("r7", "semantic", "pgvector", initialNodes, { dashed: true }),
  createEdge("r8", "keyword", "pgtrgm", initialNodes, { dashed: true }),
  createEdge("r9", "pgvector", "merge", initialNodes, { label: "Results" }),
  createEdge("r10", "pgtrgm", "merge", initialNodes, { label: "Results" }),
  createEdge("r11", "merge", "llm", initialNodes, { animated: true }),
];

/* ─── Exported unified diagram ─── */

const minimapStyle = {
  height: 80,
  width: 120,
  background: "var(--surface)",
  border: "1px solid var(--glass-border)",
  borderRadius: 8,
};

export function ArchitectureFlow() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  return (
    <div style={{
      background: "var(--surface)", borderRadius: 16, border: "1px solid var(--glass-border)",
      overflow: "hidden", height: 520,
    }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        connectionLineComponent={ConnectionLine}
        fitView
        fitViewOptions={{ padding: 0.15 }}
        attributionPosition="bottom-left"
        proOptions={{ hideAttribution: true }}
      >
        <Background color="var(--text-muted)" gap={24} size={1} />
        <Controls style={{ background: "var(--surface)", borderRadius: 8, border: "1px solid var(--glass-border)" }} />
        <MiniMap style={minimapStyle} />
        <Panel position="top-left" style={{
          background: "color-mix(in srgb, var(--surface) 85%, transparent)",
          padding: "8px 14px", borderRadius: 8, margin: 8,
          backdropFilter: "blur(4px)",
        }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>
            🔄 Request Lifecycle
          </span>
        </Panel>
        <Panel position="top-right" style={{
          background: "color-mix(in srgb, var(--surface) 85%, transparent)",
          padding: "8px 14px", borderRadius: 8, margin: 8,
          backdropFilter: "blur(4px)",
        }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>
            📚 Hybrid RAG Pipeline
          </span>
        </Panel>
      </ReactFlow>
    </div>
  );
}
