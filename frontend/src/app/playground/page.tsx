"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { apiJson, toast } from "@/lib/api";
import { PageIcon } from "@/components/Icons";
import { ProviderIcon } from "@/components/BrandIcon";

type Msg = { role: "user" | "assistant" | "error"; content: string };
type Model = { name: string; free: boolean };

export default function PlaygroundPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [models, setModels] = useState<Model[]>([]);
  const [model, setModel] = useState("");
  const [freeOnly, setFreeOnly] = useState(true);
  const [loading, setLoading] = useState(false);
  const [provider, setProvider] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isAuthenticated) { router.push("/login"); return; }
    apiJson<{ models: Model[] }>("/api/models").then(d => {
      const filtered = freeOnly ? d.models.filter(m => m.free) : d.models;
      setModels(filtered);
      if (filtered.length && !model) setModel(filtered[0].name);
    }).catch(() => {});
    apiJson<{ active_provider: string }>("/api/status").then(d => setProvider(d.active_provider)).catch(() => {});
  }, [freeOnly, isAuthenticated, router]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function newChat() {
    setMessages([]);
    setInput("");
  }

  async function send() {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    const userMsg: Msg = { role: "user", content: text };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const chatMsgs = [...messages, userMsg].map(m => ({ role: m.role === "error" ? "user" : m.role, content: m.content }));
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: model || undefined, messages: chatMsgs, stream: true }),
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

  function renderMarkdown(text: string) {
    const parts = text.split(/(```[\s\S]*?```)/g);
    return parts.map((part, i) => {
      if (part.startsWith("```")) {
        const code = part.replace(/^```\w*\n?/, "").replace(/\n?```$/, "");
        return (
          <pre key={i} style={{
            background: "var(--bg)", padding: 12, borderRadius: 8,
            overflow: "auto", fontSize: 13, margin: "8px 0"
          }}>
            <code>{code}</code>
          </pre>
        );
      }
      const lines = part.split("\n");
      return lines.map((line, j) => {
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
    <div className="page-container" style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 140px)" }}>
      {/* Header bar */}
      <div className="stagger-1" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div className="page-header-icon" style={{ background: "rgba(0,206,201,0.1)" }}>
            <PageIcon type="chat" color="var(--accent-2)" />
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 700 }}>Chat Playground</h1>
          <span style={{
            fontSize: 12, padding: "3px 10px", borderRadius: 6,
            background: "var(--surface-2)", color: "var(--text-muted)",
            display: "inline-flex", alignItems: "center", gap: 6
          }}>
            {provider ? <ProviderIcon name={provider} size={14} /> : null}
            {provider || "Loading..."}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <label style={{ fontSize: 13, color: "var(--text-muted)", cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
            <input type="checkbox" checked={freeOnly} onChange={e => setFreeOnly(e.target.checked)} style={{ width: "auto" }} />
            Free only
          </label>
          <select value={model} onChange={e => setModel(e.target.value)} style={{ width: 240 }}>
            {models.length === 0 && <option value="">No models loaded</option>}
            {models.map(m => (
              <option key={m.name} value={m.name}>{m.name} {m.free ? "Free" : ""}</option>
            ))}
          </select>
          <button className="btn btn-ghost btn-sm" onClick={newChat}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 4 23 10 17 10" />
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
            </svg>
            New Chat
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="stagger-2" style={{
        flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 12,
        padding: 16, background: "var(--surface)", borderRadius: 12, border: "1px solid var(--border)",
        marginBottom: 12
      }}>
        {messages.length === 0 && (
          <div className="empty-state" style={{ padding: "60px 0" }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" style={{ marginBottom: 16, opacity: 0.4 }}>
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            <div style={{ fontSize: 15 }}>Start a conversation</div>
            <div style={{ fontSize: 13, marginTop: 4 }}>Type a message and press Enter to chat with any LLM provider.</div>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} style={{ maxWidth: "80%", alignSelf: msg.role === "user" ? "flex-end" : "flex-start" }}>
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
      <div className="stagger-3" style={{ display: "flex", gap: 8 }}>
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
          placeholder="Type a message..."
          rows={2}
          disabled={loading}
        />
        <button className="btn btn-primary" onClick={send} disabled={loading || !input.trim()} style={{ alignSelf: "flex-end", minWidth: 80 }}>
          {loading ? "Thinking..." : "Send"}
        </button>
      </div>

      <style>{`@keyframes blink { 0%,100% { opacity: 1; } 50% { opacity: 0; } }`}</style>
    </div>
  );
}
