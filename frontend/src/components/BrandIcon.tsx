"use client";

import {
  OpenAI,
  Anthropic,
  Google,
  Gemini,
  Groq,
  DeepSeek,
  Mistral,
  Together,
  OpenRouter,
  Meta,
  Qwen,
  Tencent,
  XAI,
  Perplexity,
  ClaudeCode,
  OpenCode,
  Ollama,
  Codex,
  KiloCode,
} from "@lobehub/icons";

type IconComp = React.ComponentType<{ size?: number | string }>;

const MAP: Record<string, IconComp> = {
  openai: OpenAI,
  anthropic: Anthropic,
  google: Google,
  gemini: Gemini,
  groq: Groq,
  deepseek: DeepSeek,
  mistral: Mistral,
  together: Together,
  openrouter: OpenRouter,
  meta: Meta,
  llama: Meta,
  qwen: Qwen,
  tencent: Tencent,
  xai: XAI,
  grok: XAI,
  perplexity: Perplexity,
  claudecode: ClaudeCode,
  opencode: OpenCode,
  ollama: Ollama,
  ollamacli: Ollama,
  codex: Codex,
  codexcli: Codex,
  kilocode: KiloCode,
};

function resolve(name: string): IconComp | null {
  const key = name.toLowerCase().replace(/[^a-z0-9]/g, "");
  const base = MAP[key];
  if (!base) return null;
  // Prefer an auto-colored icon; fall back to the tintable mono icon.
  const comp = (base as unknown as { Color?: IconComp; Mono?: IconComp }).Color ||
    (base as unknown as { Mono?: IconComp }).Mono ||
    base;
  return comp;
}

export function BrandIcon({
  name,
  size = 28,
  color,
}: {
  name: string;
  size?: number;
  color?: string;
}) {
  const Comp = resolve(name);
  if (!Comp) {
    const label = name.replace(/[^A-Za-z0-9]/g, "").slice(0, 2).toUpperCase() || "?";
    return (
      <div
        style={{
          width: size,
          height: size,
          borderRadius: size * 0.25,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "rgba(13,148,136,0.12)",
          color: "var(--text, #1a1a2e)",
          fontSize: size * 0.4,
          fontWeight: 700,
        }}
      >
        {label}
      </div>
    );
  }
  return (
    <span style={color ? { color, display: "inline-flex" } : { display: "inline-flex" }}>
      <Comp size={size} />
    </span>
  );
}

const PROVIDER_COLORS: Record<string, string> = {
  openrouter: "#6c5ce7",
  openai: "#00b894",
  anthropic: "#fd79a8",
  groq: "#fdcb6e",
  gemini: "#00cec9",
  deepseek: "#e17055",
  mistral: "#ff7000",
  together: "#0b8a4a",
  meta: "#1877f2",
  llama: "#1877f2",
  qwen: "#6a5acd",
  tencent: "#1f8fff",
  xai: "#111111",
  grok: "#111111",
  perplexity: "#20808d",
  ollama: "#00cec9",
  claude: "#fd79a8",
  codex: "#10a37f",
};

function providerKey(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, "");
}

/** Inline brand icon + name for a provider, with a sensible default accent. */
export function ProviderIcon({
  name,
  size = 18,
  showName = false,
}: {
  name: string;
  size?: number;
  showName?: boolean;
}) {
  const color = PROVIDER_COLORS[providerKey(name)] || "#0d9488";
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 8, color }}>
      <BrandIcon name={name} size={size} color={color} />
      {showName && <span style={{ fontWeight: 600, color: "var(--text)" }}>{name}</span>}
    </span>
  );
}
