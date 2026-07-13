"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { apiJson, toast } from "@/lib/api";
import { PageIcon } from "@/components/Icons";
import { ProviderIcon } from "@/components/BrandIcon";

type Msg = { role: "user" | "assistant" | "error"; content: string };
type Model = { name: string; free: boolean };

const SUGGESTS = [
  "Draw a flowchart of how DNS works using Mermaid",
  "Generate an image of a futuristic city skyline at night",
  "Explain quantum computing in simple terms",
  "Write a Python script to analyze CSV data",
  "Create a sequence diagram for a REST API call",
  "What are the best free LLMs available today?",
];

const STORAGE_KEY = "ollamomui-playground";

export default function PlaygroundPage() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [models, setModels] = useState<Model[]>([]);
  const [model, setModel] = useState("");
  const [freeOnly, setFreeOnly] = useState(true);
  const [loading, setLoading] = useState(false);
  const [provider, setProvider] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [systemPrompt, setSystemPrompt] = useState("You are a helpful AI assistant. When asked to draw diagrams, use Mermaid markdown syntax. When asked to generate images, respond with a markdown image link.");
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(2048);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const messagesRef = useRef<HTMLDivElement>(null);

  const scrollBottom = useCallback(() => {
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
  }, []);

  useEffect(() => {
    apiJson<{ models: Model[] }>("/api/models").then(d => {
      const filtered = freeOnly ? d.models.filter(m => m.free) : d.models;
      setModels(filtered);
      if (filtered.length && !model) setModel(filtered[0].name);
    }).catch(() => {});
    apiJson<{ active_provider: string }>("/api/status").then(d => setProvider(d.active_provider)).catch(() => {});
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.messages?.length) setMessages(parsed.messages);
        if (parsed.systemPrompt) setSystemPrompt(parsed.systemPrompt);
        if (parsed.temperature) setTemperature(parsed.temperature);
        if (parsed.maxTokens) setMaxTokens(parsed.maxTokens);
      } catch {}
    }
  }, []);

  useEffect(() => { scrollBottom(); }, [messages]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const parent = document.getElementById("playground-messages");
    if (!parent) return;
    const blocks = parent.querySelectorAll<HTMLElement>(".mermaid-svg");
    if (!blocks.length) return;
    import("mermaid").then(mermaid => {
      mermaid.default.initialize({ theme: "base", themeVariables: { background: "transparent", primaryColor: "#6c5ce7", secondaryColor: "#00cec9", tertiaryColor: "#fd79a8", primaryTextColor: "#111827", lineColor: "#6c5ce7" } });
      blocks.forEach(el => {
        const code = el.getAttribute("data-code");
        const id = el.id;
        if (code && !el.querySelector("svg")) {
          mermaid.default.render(id, code).then(({ svg }) => { el.innerHTML = svg; }).catch(() => {});
        }
      });
    }).catch(() => {});
  }, [messages]);

  function saveToStorage(msgs: Msg[]) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ messages: msgs.slice(-50), systemPrompt, temperature, maxTokens }));
    } catch {}
  }

  function newChat() {
    setMessages([]);
    setInput("");
    localStorage.removeItem(STORAGE_KEY);
  }

  function useSuggest(text: string) {
    setInput(text);
  }

  async function send() {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    setShowSuggestions(false);
    const userMsg: Msg = { role: "user", content: text };
    const newMsgs = [...messages, userMsg];
    setMessages(newMsgs);
    setLoading(true);

    try {
      const chatMsgs = [
        ...(systemPrompt.trim() ? [{ role: "system" as const, content: systemPrompt.trim() }] : []),
        ...newMsgs.map(m => ({ role: (m.role === "error" ? "user" : m.role) as "user" | "assistant", content: m.content })),
      ];
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: model || undefined,
          messages: chatMsgs,
          stream: true,
          temperature,
          max_tokens: maxTokens,
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        setMessages(prev => [...prev, { role: "error", content: `HTTP ${res.status}: ${errText}` }]);
        setLoading(false);
        return;
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let assistantContent = "";
      setMessages(prev => [...prev, { role: "assistant", content: "" }]);

      if (reader) {
        let buffer = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";
          for (const line of lines) {
            if (!line.trim()) continue;
            try {
              const obj = JSON.parse(line);
              if (obj.error) {
                setMessages(prev => {
                  const copy = [...prev];
                  copy[copy.length - 1] = { role: "error", content: obj.error.message || JSON.stringify(obj.error) };
                  return copy;
                });
                toast("API error", true);
                return;
              }
              if (obj.message?.content) {
                assistantContent += obj.message.content;
                setMessages(prev => {
                  const copy = [...prev];
                  copy[copy.length - 1] = { role: "assistant", content: assistantContent };
                  return copy;
                });
              }
            } catch {}
          }
        }
      }

      const finalMsgs = [...newMsgs];
      if (assistantContent) finalMsgs.push({ role: "assistant", content: assistantContent });
      saveToStorage(finalMsgs);

      if (!assistantContent && messages[messages.length - 1]?.role !== "error") {
        setMessages(prev => {
          const copy = [...prev];
          copy[copy.length - 1] = { role: "error", content: "Empty response from model. Check your API key and provider settings." };
          return copy;
        });
      }
    } catch (e: any) {
      setMessages(prev => [...prev, { role: "error", content: e.message }]);
      toast("Network error", true);
    } finally {
      setLoading(false);
    }
  }

  function exportChat() {
    const text = messages.map(m => `## ${m.role.toUpperCase()}\n${m.content}`).join("\n\n");
    navigator.clipboard.writeText(text).then(() => toast("Conversation copied to clipboard.")).catch(() => toast("Failed to copy", true));
  }

  function renderMarkdown(text: string) {
    const parts = text.split(/(```[\s\S]*?```)/g);
    return parts.map((part, i) => {
      if (part.startsWith("```")) {
        const match = part.match(/^```(\w*)\n?([\s\S]*?)\n?```$/);
        if (!match) return null;
        const lang = match[1].toLowerCase();
        const code = match[2];
        if (lang === "mermaid") {
          const id = `mermaid-${Date.now()}-${i}`;
          return (
            <div key={i} className="mermaid-svg" id={id} data-code={code}
              style={{ background: "var(--bg)", padding: 16, borderRadius: 10, margin: "8px 0", overflow: "auto", minHeight: 60, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ color: "var(--text-muted)", fontSize: 13 }}>Rendering diagram...</span>
            </div>
          );
        }
        if (lang === "image" || lang === "img") {
          return (
            <div key={i} style={{ margin: "8px 0", textAlign: "center" }}>
              <img src={code.trim()} alt="Generated image" style={{ maxWidth: "100%", borderRadius: 12, border: "1px solid var(--border)" }}
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
            </div>
          );
        }
        return (
          <pre key={i} style={{ background: "var(--bg)", padding: 12, borderRadius: 8, overflow: "auto", fontSize: 13, margin: "8px 0" }}>
            <code>{code}</code>
          </pre>
        );
      }
      const lines = part.split("\n");
      return lines.map((line, j) => {
        const imgMatch = line.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
        if (imgMatch) {
          return (
            <div key={`${i}-${j}`} style={{ margin: "8px 0", textAlign: "center" }}>
              <img src={imgMatch[2]} alt={imgMatch[1]} style={{ maxWidth: "100%", borderRadius: 12, border: "1px solid var(--border)" }}
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
            </div>
          );
        }
        if (line.startsWith("### ")) return <h3 key={`${i}-${j}`} style={{ fontSize: 16, fontWeight: 600, margin: "8px 0 4px" }}>{line.slice(4)}</h3>;
        if (line.startsWith("## ")) return <h2 key={`${i}-${j}`} style={{ fontSize: 18, fontWeight: 600, margin: "8px 0 4px" }}>{line.slice(3)}</h2>;
        if (line.startsWith("# ")) return <h1 key={`${i}-${j}`} style={{ fontSize: 20, fontWeight: 700, margin: "8px 0 4px" }}>{line.slice(2)}</h1>;
        if (line.startsWith("- ") || line.startsWith("• ")) return <li key={`${i}-${j}`} style={{ marginLeft: 16 }}>{line.slice(2)}</li>;
        if (line.trim() === "") return <br key={`${i}-${j}`} />;
        return <p key={`${i}-${j}`} style={{ margin: "2px 0" }}>{line}</p>;
      });
    });
  }

  return (
    <div className="page-container" style={{ display: "flex", flexDirection: "column", height: "calc(100dvh - 140px)", minHeight: 0 }}>
      {/* Header bar */}
      <div className="stagger-1" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div className="page-header-icon" style={{ background: "rgba(0,206,201,0.1)" }}>
            <PageIcon type="chat" color="var(--accent-2)" />
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 700 }}>AI Playground</h1>
          <span style={{
            fontSize: 12, padding: "3px 10px", borderRadius: 6,
            background: "var(--surface-2)", color: "var(--text-muted)",
            display: "inline-flex", alignItems: "center", gap: 6
          }}>
            {provider ? <ProviderIcon name={provider} size={14} /> : null}
            {provider || "Loading..."}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <label style={{ fontSize: 13, color: "var(--text-muted)", cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
            <input type="checkbox" checked={freeOnly} onChange={e => setFreeOnly(e.target.checked)} style={{ width: "auto" }} />
            Free only
          </label>
          <select value={model} onChange={e => setModel(e.target.value)} style={{ flex: "1 1 180px", minWidth: 0, maxWidth: 240 }}>
            {models.length === 0 && <option value="">No models loaded</option>}
            {models.map(m => (
              <option key={m.name} value={m.name}>{m.name} {m.free ? "Free" : ""}</option>
            ))}
          </select>
          <button className="btn btn-ghost btn-sm" onClick={() => setShowSettings(s => !s)} title="Chat settings">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
            Settings
          </button>
          <button className="btn btn-ghost btn-sm" onClick={exportChat} title="Export conversation" disabled={!messages.length}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Export
          </button>
          <button className="btn btn-ghost btn-sm" onClick={newChat}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 4 23 10 17 10" />
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
            </svg>
            New Chat
          </button>
        </div>
      </div>

      {/* Settings panel */}
      {showSettings && (
        <div className="stagger-1" style={{
          padding: 16, marginBottom: 12, borderRadius: 12,
          background: "var(--surface)", border: "1px solid var(--border)",
          display: "flex", flexDirection: "column", gap: 12,
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <h2 style={{ fontSize: 14, fontWeight: 700 }}>Chat Settings</h2>
            <button className="btn btn-ghost btn-sm" onClick={() => setShowSettings(false)}>Close</button>
          </div>

          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-muted)", marginBottom: 4 }}>
              System Prompt
            </label>
            <textarea
              value={systemPrompt}
              onChange={e => setSystemPrompt(e.target.value)}
              rows={3}
              style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--bg)", color: "var(--text)", fontSize: 13, fontFamily: "inherit", resize: "vertical" }}
            />
          </div>

          <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 180 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-muted)", marginBottom: 4 }}>
                Temperature: {temperature.toFixed(1)}
              </label>
              <input
                type="range" min={0} max={2} step={0.1} value={temperature}
                onChange={e => setTemperature(parseFloat(e.target.value))}
                style={{ width: "100%", accentColor: "var(--accent)" }}
              />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--text-muted)" }}>
                <span>Precise (0)</span>
                <span>Creative (2)</span>
              </div>
            </div>
            <div style={{ flex: 1, minWidth: 120 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-muted)", marginBottom: 4 }}>
                Max Tokens
              </label>
              <input
                type="number" min={64} max={8192} step={64} value={maxTokens}
                onChange={e => setMaxTokens(Number(e.target.value) || 2048)}
                style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--bg)", color: "var(--text)", fontSize: 13 }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Messages */}
      <div id="playground-messages" className="stagger-2" style={{
        flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 12,
        padding: 16, background: "var(--surface)", borderRadius: 12, border: "1px solid var(--border)",
        marginBottom: 12,
      }}>
        {messages.length === 0 && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" style={{ marginBottom: 16, opacity: 0.4 }}>
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            <div style={{ fontSize: 15, color: "var(--text-muted)" }}>Start a conversation</div>
            <div style={{ fontSize: 13, marginTop: 4, color: "var(--text-muted)", textAlign: "center", maxWidth: 400 }}>
              Ask me anything — I can write code, draw diagrams with Mermaid, generate images, and more.
            </div>

            {showSuggestions && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", marginTop: 24, maxWidth: 500 }}>
                {SUGGESTS.map(s => (
                  <button key={s} onClick={() => useSuggest(s)} style={{
                    padding: "8px 14px", borderRadius: 20, fontSize: 12, fontWeight: 500,
                    background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text-muted)",
                    cursor: "pointer", transition: "all 0.2s",
                  }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.color = "var(--accent)"; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-muted)"; }}
                  >
                    {s.length > 45 ? s.slice(0, 45) + "…" : s}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} style={{
            maxWidth: "85%", alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
            animation: "fadeSlideUp 0.3s ease-out both",
            animationDelay: `${(i * 0.05).toFixed(2)}s`,
          }}>
            <div style={{
              padding: "12px 16px", borderRadius: 12, fontSize: 14, lineHeight: 1.6,
              background: msg.role === "user" ? "var(--accent)" : msg.role === "error" ? "var(--red)" : "var(--surface-2)",
              color: msg.role === "user" ? "white" : msg.role === "error" ? "white" : "var(--text)",
              border: msg.role === "assistant" ? "1px solid var(--border)" : "none",
              whiteSpace: "pre-wrap", wordBreak: "break-word",
            }}>
              {msg.role === "assistant" ? renderMarkdown(msg.content) : msg.content}
              {msg.role === "assistant" && loading && i === messages.length - 1 && !msg.content && (
                <span style={{ animation: "blink 1s infinite" }}>▌</span>
              )}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="stagger-3" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <textarea
          aria-label="Message"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
          placeholder="Ask me to code, draw diagrams, generate images..."
          rows={2}
          disabled={loading}
          style={{
            flex: 1, minWidth: 0, width: "100%", padding: "10px 12px", borderRadius: 10,
            border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text)",
            fontSize: 14, fontFamily: "inherit", resize: "none",
          }}
        />
        <button className="btn btn-primary" onClick={send} disabled={loading || !input.trim()} style={{ alignSelf: "flex-end", minWidth: 80 }}>
          {loading ? "Thinking..." : "Send"}
        </button>
      </div>
    </div>
  );
}
