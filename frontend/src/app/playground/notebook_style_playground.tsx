"use client";

import { useEffect, useMemo, useState } from "react";
import { Sun, Moon, Wifi, WifiOff, Loader2, Trash2, ArrowUp, Send, MessageSquare, Bot, User } from "lucide-react";
import { SourcesPanel, type Source } from "@/components/playground/SourcesPanel";
import { StudioPanel } from "@/components/playground/StudioPanel";
import { GlassCard, IconButton, IconChip, Pill } from "@/components/playground/playground-ui";
import { GradientOrbs } from "@/components/Background";
import { useChat, useModels, type ChatMessage } from "./chat-hooks";
import {
  createNote, fallbackGenerate, buildArtifact, STUDIO_PROMPTS,
  type StudioArtifact, type GenerateKind,
} from "./studio";

/* ------------------------------------------------------------------ */
/* Chat panel                                                          */
/* ------------------------------------------------------------------ */
function ChatPanel({
  messages, streaming, error, onSend, onStop, onReset, model, onModelChange, models, backendOnline,
}: {
  messages: ChatMessage[];
  streaming: boolean;
  error: string | null;
  onSend: (t: string) => void;
  onStop: () => void;
  onReset: () => void;
  model: string;
  onModelChange: (m: string) => void;
  models: { id: string; name: string }[];
  backendOnline: boolean;
}) {
  const [input, setInput] = useState("");

  const submit = () => {
    if (!input.trim() || streaming) return;
    onSend(input);
    setInput("");
  };

  return (
    <GlassCard className="flex-1 flex flex-col min-w-0">
      <header className="flex items-center justify-between gap-3 p-5 border-b" style={{ borderColor: "var(--glass-border)" }}>
        <div className="flex items-center gap-2 min-w-0">
          <IconChip color="var(--accent-2)"><MessageSquare className="w-4 h-4" /></IconChip>
          <div className="min-w-0">
            <h2 className="text-lg font-semibold leading-tight truncate" style={{ color: "var(--text)" }}>Untitled notebook</h2>
            <div className="flex items-center gap-1.5 text-xs" style={{ color: "var(--text-muted)" }}>
              {backendOnline ? (
                <><Wifi className="w-3 h-3 text-green-500" /> gateway online</>
              ) : (
                <><WifiOff className="w-3 h-3 text-red-400" /> gateway offline</>
              )}
              <span>·</span>
              <span>{messages.filter((m) => m.role === "user").length} messages</span>
            </div>
          </div>
        </div>
        <div className="relative shrink-0">
          <select
            value={model}
            onChange={(e) => onModelChange(e.target.value)}
            className="pg-input appearance-none rounded-xl pl-3 pr-9 py-2 text-xs font-medium outline-none cursor-pointer max-w-[230px] bg-[var(--bg-2)] border border-[var(--glass-border)]"
            style={{ color: "var(--text)" }}
          >
            {models.map((m) => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
          <svg className="w-3.5 h-3.5 absolute right-3 top-3 pointer-events-none" style={{ color: "var(--text-muted)" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </header>

      <div className="pg-scroll flex-1 overflow-y-auto p-5 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center gap-3" style={{ color: "var(--text-muted)" }}>
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{ background: "color-mix(in srgb, var(--accent-2) 12%, transparent)", border: "1px solid color-mix(in srgb, var(--accent-2) 25%, transparent)" }}
            >
              <Bot className="w-8 h-8" style={{ color: "var(--accent-2)" }} />
            </div>
            <p className="text-sm font-medium" style={{ color: "var(--text)" }}>Start your notebook</p>
            <p className="text-xs max-w-xs">Ask anything to begin. Responses stream live from your free gateway models.</p>
            {!backendOnline && (
              <Pill color="var(--accent-3)">Backend offline — start it for live replies</Pill>
            )}
          </div>
        ) : (
          messages.map((m) => {
            const isUser = m.role === "user";
            return (
              <div key={m.id} className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                  style={{
                    background: isUser ? "color-mix(in srgb, var(--accent-2) 16%, transparent)" : "color-mix(in srgb, var(--accent) 16%, transparent)",
                    border: `1px solid ${isUser ? "color-mix(in srgb, var(--accent-2) 30%, transparent)" : "color-mix(in srgb, var(--accent) 30%, transparent)"}`,
                  }}
                >
                  {isUser ? <User className="w-4 h-4" style={{ color: "var(--accent-2)" }} /> : <Bot className="w-4 h-4" style={{ color: "var(--accent)" }} />}
                </div>
                <div
                  className={`max-w-[78%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap leading-relaxed border ${
                    isUser
                      ? "bg-[var(--accent-2-alpha-10)] border-[color-mix(in_srgb,var(--accent-2)_35%,transparent)] text-[var(--text)]"
                      : m.error
                      ? "border-[var(--accent-3)] bg-[color-mix(in_srgb,var(--accent-3)_10%,transparent)]"
                      : "bg-[var(--bg-2)] border-[var(--glass-border)] text-[var(--text)]"
                  }`}
                >
                  {m.pending && !m.content ? (
                    <span className="inline-flex items-center gap-2" style={{ color: "var(--text-muted)" }}>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> thinking…
                    </span>
                  ) : (
                    m.content
                  )}
                </div>
              </div>
            );
          })
        )}
        {error && !backendOnline && <p className="text-xs text-center" style={{ color: "var(--accent-3)" }}>{error}</p>}
      </div>

      <div className="p-4 border-t" style={{ borderColor: "var(--glass-border)" }}>
        <div className="flex items-center gap-2 rounded-2xl p-2 bg-[var(--bg-2)] border border-[var(--glass-border)]">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && submit()}
            placeholder="Message your notebook…"
            className="pg-input flex-1 bg-transparent outline-none text-sm px-3"
            style={{ color: "var(--text)" }}
          />
          <IconButton onClick={onReset} title="Clear conversation" variant="ghost">
            <Trash2 className="w-4 h-4" />
          </IconButton>
          {streaming ? (
            <IconButton onClick={onStop} title="Stop" variant="danger">
              <Loader2 className="w-4 h-4 animate-spin" />
            </IconButton>
          ) : (
            <IconButton onClick={submit} title="Send" variant="accent" disabled={!input.trim()}>
              <ArrowUp className="w-4 h-4" />
            </IconButton>
          )}
        </div>
      </div>
    </GlassCard>
  );
}

/* ------------------------------------------------------------------ */
/* Theme sync helper                                                   */
/* ------------------------------------------------------------------ */
function useAppTheme() {
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  useEffect(() => {
    const el = document.documentElement;
    setTheme((el.getAttribute("data-theme") as "light" | "dark") || "dark");
  }, []);
  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    try { localStorage.setItem("ollamomui-theme", next); } catch {}
    setTheme(next);
  };
  return { theme, toggle };
}

/* ------------------------------------------------------------------ */
/* Main workspace                                                      */
/* ------------------------------------------------------------------ */
export default function PlaygroundWorkspace() {
  const { theme, toggle } = useAppTheme();
  const { models, backendOnline, refresh } = useModels();
  const [selectedModel, setSelectedModel] = useState(models[0]?.id ?? "");
  const [sources, setSources] = useState<Source[]>([
    { id: "s1", label: "OllamoMUI docs", type: "doc" },
    { id: "s2", label: "Project notes", type: "note" },
  ]);
  const [artifacts, setArtifacts] = useState<StudioArtifact[]>([]);

  const { messages, streaming, error, send, generate, stop, reset } = useChat({
    model: selectedModel,
    onUserMessage: () => {},
  });
  const [generating, setGenerating] = useState<GenerateKind | null>(null);

  useEffect(() => { refresh(); }, [refresh]);

  const modelList = useMemo(() => models.map((m) => ({ id: m.id, name: m.name })), [models]);

  const createSource = (s: Source) => setSources((prev) => [...prev, s]);
  const updateSource = (s: Source) => setSources((prev) => prev.map((x) => (x.id === s.id ? s : x)));
  const deleteSource = (id: string) => setSources((prev) => prev.filter((x) => x.id !== id));

  const runGenerate = async (kind: GenerateKind) => {
    if (generating) return;
    setGenerating(kind);
    const ctx = lastUserContext(messages);
    const placeholder: StudioArtifact = {
      id: `${kind}-${Date.now()}`,
      kind,
      title: "Generating…",
      markdown: "_Generating with a free OpenRouter model…_",
      createdAt: Date.now(),
    };
    setArtifacts((prev) => [placeholder, ...prev]);
    try {
      const prompt = STUDIO_PROMPTS[kind](ctx);
      const text = await generate(prompt);
      const artifact = text.trim()
        ? buildArtifact(kind, text)
        : fallbackGenerate(kind, messages);
      setArtifacts((prev) => prev.map((a) => (a.id === placeholder.id ? artifact : a)));
    } catch {
      const artifact = fallbackGenerate(kind, messages);
      setArtifacts((prev) => prev.map((a) => (a.id === placeholder.id ? artifact : a)));
    } finally {
      setGenerating(null);
    }
  };
  const updateArtifact = (a: StudioArtifact) => setArtifacts((prev) => prev.map((x) => (x.id === a.id ? a : x)));
  const deleteArtifact = (id: string) => setArtifacts((prev) => prev.filter((x) => x.id !== id));
  const addNote = () => setArtifacts((prev) => [createNote(), ...prev]);

  return (
    <div className={`${theme === "dark" ? "dark" : ""} relative h-[calc(100vh-130px)]`}>
      <GradientOrbs />
      <div className="relative z-10 h-full w-full p-2" style={{ color: "var(--text)" }}>
        <div className="flex items-center justify-between mb-2 px-1">
          <div className="flex items-center gap-2">
            <IconChip color="var(--accent)"><Bot className="w-4 h-4" /></IconChip>
            <span className="text-xs font-semibold" style={{ color: "var(--text)" }}>
              Ollamo Studio
            </span>
            <span className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
              · free OpenRouter AI workspace
            </span>
          </div>
          <IconButton onClick={toggle} title="Toggle theme" variant="ghost">
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </IconButton>
        </div>

        <main className="flex h-[calc(100%-40px)] w-full gap-3 overflow-x-auto pg-scroll">
          <SourcesPanel sources={sources} onCreate={createSource} onUpdate={updateSource} onDelete={deleteSource} />
          <ChatPanel
            messages={messages}
            streaming={streaming}
            error={error}
            onSend={send}
            onStop={stop}
            onReset={reset}
            model={selectedModel}
            onModelChange={setSelectedModel}
            models={modelList}
            backendOnline={backendOnline}
          />
          <StudioPanel
            artifacts={artifacts}
            onGenerate={runGenerate}
            generating={generating}
            onUpdate={updateArtifact}
            onDelete={deleteArtifact}
            onAddNote={addNote}
          />
        </main>
      </div>
    </div>
  );
}

function lastUserContext(messages: ChatMessage[]): string {
  const parts = messages.filter((m) => m.role === "user").map((m) => m.content);
  const last = [...messages].reverse().find((m) => m.role === "assistant" && !m.error && m.content);
  const ctx = [...parts, last?.content ?? ""].join("\n\n").trim();
  return ctx || "Create a sample based on general knowledge.";
}
