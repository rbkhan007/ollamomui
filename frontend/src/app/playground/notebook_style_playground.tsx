"use client";

import { useEffect, useMemo, useState } from "react";
import { Sun, Moon, Wifi, WifiOff, Loader2, Trash2, ArrowRight } from "lucide-react";
import { SourcesPanel, type Source } from "@/components/playground/SourcesPanel";
import { StudioPanel, type GenerateKind } from "@/components/playground/StudioPanel";
import { useChat, useModels, type ChatMessage } from "./chat-hooks";
import {
  downloadMarkdown, generateFlashcards, generateMindMap, generateQuiz, generateReport,
  type StudioArtifact,
} from "./studio";

/* ------------------------------------------------------------------ */
/* Chat panel (inline)                                                 */
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
    <div className="flex-1 rounded-xl flex flex-col shadow-sm overflow-hidden bg-[var(--surface)] border border-[var(--border)]">
      <div className="p-6 border-b flex justify-between items-center" style={{ borderColor: "var(--border)" }}>
        <div>
          <h2 className="text-2xl font-semibold" style={{ color: "var(--text)" }}>Untitled notebook</h2>
          <p className="text-sm flex items-center gap-1.5" style={{ color: "var(--text-muted)" }}>
            {backendOnline ? (
              <><Wifi className="w-3 h-3 text-green-500" /> gateway online</>
            ) : (
              <><WifiOff className="w-3 h-3 text-red-400" /> gateway offline</>
            )}
            {" · "}{messages.filter((m) => m.role === "user").length} messages
          </p>
        </div>
        <div className="relative">
          <select
            value={model}
            onChange={(e) => onModelChange(e.target.value)}
            className="appearance-none rounded-lg pl-3 pr-8 py-2 text-xs font-medium outline-none cursor-pointer max-w-[220px] bg-[var(--bg-2)] border border-[var(--border)]"
            style={{ color: "var(--text)" }}
          >
            {models.map((m) => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
          <ArrowRight className="w-3 h-3 absolute right-2 top-3 pointer-events-none hidden" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-sm gap-2" style={{ color: "var(--text-muted)" }}>
            <Loader2 className="w-8 h-8 opacity-40" />
            <p>Ask anything to start your notebook.</p>
            {!backendOnline && (
              <p className="text-xs max-w-xs text-center" style={{ color: "var(--accent-3)" }}>
                Backend not detected — start it to get real streamed replies.
              </p>
            )}
          </div>
        ) : (
          messages.map((m) => {
            const isUser = m.role === "user";
            return (
              <div key={m.id} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap leading-relaxed border ${
                    isUser
                      ? "bg-[var(--accent-2-alpha-10)] border-[var(--accent-2)] text-[var(--text)]"
                      : m.error
                      ? "bg-[color-mix(in_srgb,var(--accent-3)_10%,transparent)] border-[var(--accent-3)]"
                      : "bg-[var(--bg-2)] border-[var(--border)] text-[var(--text)]"
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
        {error && !backendOnline && <p className="text-xs" style={{ color: "var(--accent-3)" }}>{error}</p>}
      </div>

      <div className="p-4 border-t" style={{ borderColor: "var(--border)" }}>
        <div className="rounded-xl p-2 flex items-center gap-2 bg-[var(--bg-2)] border border-[var(--border)]">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder="Start typing…"
            className="flex-1 bg-transparent outline-none text-sm px-2"
            style={{ color: "var(--text)" }}
          />
          <button
            onClick={onReset}
            title="Clear conversation"
            className="p-1.5 rounded-full hover:bg-[var(--surface)]"
            style={{ color: "var(--text-muted)" }}
          >
            <Trash2 className="w-4 h-4" />
          </button>
          {streaming ? (
            <button onClick={onStop} className="p-1.5 rounded-full text-white" style={{ background: "var(--accent-3)" }} title="Stop">
              <Loader2 className="w-4 h-4 animate-spin" />
            </button>
          ) : (
            <button
              onClick={submit}
              className="p-1.5 rounded-full text-white disabled:opacity-50"
              style={{ background: "var(--accent-2)" }}
              disabled={!input.trim()}
              title="Send"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
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

  const { messages, streaming, error, send, stop, reset } = useChat({
    model: selectedModel,
    onUserMessage: () => {},
  });

  useEffect(() => { refresh(); }, [refresh]);

  const modelList = useMemo(() => models.map((m) => ({ id: m.id, name: m.name })), [models]);

  /* ---- CRUD: sources ---- */
  const createSource = (s: Source) => setSources((prev) => [...prev, s]);
  const updateSource = (s: Source) => setSources((prev) => prev.map((x) => (x.id === s.id ? s : x)));
  const deleteSource = (id: string) => setSources((prev) => prev.filter((x) => x.id !== id));

  /* ---- CRUD: studio artifacts ---- */
  const generate = (kind: GenerateKind) => {
    const fn = { mindmap: generateMindMap, report: generateReport, flashcards: generateFlashcards, quiz: generateQuiz }[kind];
    setArtifacts((prev) => [fn(messages), ...prev]);
  };
  const updateArtifact = (a: StudioArtifact) => setArtifacts((prev) => prev.map((x) => (x.id === a.id ? a : x)));
  const deleteArtifact = (id: string) => setArtifacts((prev) => prev.filter((x) => x.id !== id));

  return (
    <div className={`${theme === "dark" ? "dark" : ""} h-[calc(100vh-120px)]`}>
      <div
        className="h-full w-full font-sans transition-colors duration-300 p-2"
        style={{ background: "var(--bg)", color: "var(--text)" }}
      >
        <div className="flex items-center justify-between mb-2 px-1">
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>Notebook-style AI workspace</span>
          <button
            onClick={toggle}
            className="p-2 rounded-lg hover:bg-[var(--bg-2)] border border-[var(--border)]"
            style={{ color: "var(--text)" }}
            title="Toggle theme"
          >
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>

        <main className="flex h-[calc(100%-36px)] w-full gap-2">
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
          <StudioPanel artifacts={artifacts} onGenerate={generate} onUpdate={updateArtifact} onDelete={deleteArtifact} />
        </main>
      </div>
    </div>
  );
}
