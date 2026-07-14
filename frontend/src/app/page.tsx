import Link from "next/link";
import type { Metadata } from "next";
import { JsonLd } from "@/components/JsonLd";
import InteractiveWireframe from "@/components/InteractiveWireframe";
import FeatureMatchSection from "@/components/FeatureMatchSection";

import {
  REPO_URL,
  RELEASES_URL,
  DOWNLOAD_URL,
  EXE_URL,
  FREETIER_URL,
  SITE_URL,
} from "@/lib/config";

import { MessageSquare, Grid, Brain, Shield, Infinity, Zap, Terminal, Download, Star, Globe, Cloud, FolderOpen, Mail, Sparkles, ChevronRight } from "lucide-react";

export const metadata: Metadata = {
  title: "The #1 Ollama Alternative with 26 Free LLMs",
  description: "Stop paying $20/mo for ChatGPT. OllamoMUI is the best free Ollama alternative — a local LLM proxy that routes your prompts to 26 free models. RAG knowledge base, persistent AI memory, usage analytics, and a polished dashboard. Works with Claude Code, Cursor, OpenCode, Continue.dev.",
  alternates: { canonical: SITE_URL },
  openGraph: {
    title: "The #1 Ollama Alternative with 26 Free LLMs",
    description: "Best free Ollama alternative. 26 free LLMs, RAG knowledge base, persistent memory, and analytics. Works with Claude Code, Cursor, OpenCode.",
    url: SITE_URL,
  },
};

const features = [
  { icon: "chat", title: "Chat Playground", desc: "Stream any model in the browser with markdown rendering and real-time responses.", color: "var(--accent)", g1: "#0d9488", g2: "#14b8a6" },
  { icon: "models", title: "Models Browser", desc: "Browse and search all available models across connected providers. Filter by free or paid, search by name.", color: "var(--accent-2)", g1: "#d97706", g2: "#f59e0b" },
  { icon: "brain", title: "RAG Knowledge Base", desc: "Upload docs or paste text and get answers grounded in your own data via pgvector cosine similarity.", color: "var(--accent-3)", g1: "#e11d48", g2: "#fb7185" },
  { icon: "shield", title: "Persistent Memory", desc: "Every conversation auto-saves to PostgreSQL. Facts, sessions & context survive restarts.", color: "var(--accent-4)", g1: "#7c2d12", g2: "#d97706" },
  { icon: "infinity", title: "Multi-Provider", desc: "OpenRouter, OpenAI, Anthropic, Groq, DeepSeek, Gemini, Mistral, Together — one box.", color: "var(--green)", g1: "#059669", g2: "#34d399" },
  { icon: "lightning", title: "Zero Config", desc: "One Python file. Run it, paste a free API key, and point Claude Code or OpenCode at it.", color: "var(--accent)", g1: "#0d9488", g2: "#14b8a6" },
  { icon: "terminal", title: "Full Compatibility", desc: "Ollama, OpenAI, and Anthropic API formats — works with every major AI coding tool.", color: "var(--accent-2)", g1: "#d97706", g2: "#f59e0b" },
];

const iconFeatureMap: Record<string, React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>> = {
  chat: MessageSquare,
  models: Grid,
  brain: Brain,
  shield: Shield,
  infinity: Infinity,
  lightning: Zap,
  terminal: Terminal,
};

const clients = [
  { name: "Claude Code", color: "#d97706" },
  { name: "OpenCode", color: "#0d9488" },
  { name: "Cursor", color: "#e11d48" },
  { name: "Continue.dev", color: "#059669" },
  { name: "Ollama CLI", color: "#7c2d12" },
  { name: "OpenAI SDK", color: "#14b8a6" },
];

const steps = [
  { n: "download", title: "Download & run", desc: "Grab the single-file EXE (or run.bat / run.sh) — it opens http://localhost:11434 automatically.", color: "var(--accent)" },
  { n: "key", title: "Add a free key", desc: "Paste any free API key (OpenRouter, OpenAI, etc.) in Settings. 10+ free models are ready out of the box.", color: "var(--accent-2)" },
  { n: "tools", title: "Point your tools", desc: "Set ANTHROPIC_BASE_URL=http://localhost:11434 (or /v1 for OpenAI) and start coding with free LLMs.", color: "var(--accent-3)" },
];

const compares = [
  { name: "Ollama", free: "Partial", note: "Great local models, but no free hosted API and no built-in RAG/memory dashboard." },
  { name: "LM Studio", free: "Partial", note: "Local model runner; no Ollama-compatible cloud proxy or multi-provider routing." },
  { name: "Jan", free: "Partial", note: "Local-first chat; lacks a public API gateway for coding tools and free cloud models." },
  { name: "GPT4All", free: "Partial", note: "Local models only; no routing to free cloud providers or RAG UI." },
  { name: "OllamoMUI", free: "Yes", note: "Routes to 100% free cloud LLMs, emulates Ollama/OpenAI/Anthropic APIs, ships RAG + memory + dashboard in one file." },
];

const stepIconMap: Record<string, React.ComponentType<{ size?: number }>> = {
  download: Download,
  key: Shield,
  tools: Terminal,
};

export default function Home() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "OllamoMUI",
    operatingSystem: "Windows, macOS, Linux, Android",
    applicationCategory: "DeveloperApplication",
    author: { "@type": "Person", name: "Rhasan@dev" },
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    url: SITE_URL,
    downloadUrl: EXE_URL,
  };
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      { question: "What is OllamoMUI?", answer: "OllamoMUI is a free, open-source local server that emulates the Ollama API and silently routes your prompts to real, 100% free LLMs from OpenRouter, OpenAI, Anthropic, Groq, DeepSeek, Gemini and more." },
      { question: "Is OllamoMUI really free?", answer: "Yes. OllamoMUI is 100% free and open source. It connects to free model tiers (such as OpenRouter's free models) so you can code and chat without paying for a subscription." },
      { question: "Which AI coding tools work with OllamoMUI?", answer: "Any Ollama- or OpenAI-compatible tool works, including Claude Code, OpenCode, Cursor, Continue.dev, the Ollama CLI, and the OpenAI SDK." },
      { question: "Does OllamoMUI keep my data private?", answer: "Yes. Your API keys, documents, conversations, and memory are stored locally in PostgreSQL on your machine. Nothing is sent anywhere except the LLM providers you explicitly configure." },
      { question: "Do I need to install anything to try it?", answer: "You can download the single-file Windows EXE, or run it from source with run.bat / run.sh. On macOS and Linux use run.sh. No Docker required." },
    ],
  };
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
    ],
  };

  return (
    <div style={{ position: "relative", overflow: "hidden" }}>
      <JsonLd data={jsonLd} />
      <JsonLd data={faqLd} />
      <JsonLd data={breadcrumbLd} />
      {/* Hero */}
      <section style={{
        padding: "var(--space-4xl) 24px var(--space-3xl)", textAlign: "center",
      }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          padding: "8px 24px", borderRadius: 50,
          background: "rgba(13,148,136,0.08)", border: "1px solid rgba(13,148,136,0.15)",
          fontSize: "var(--text-sm)", color: "var(--text-muted)", marginBottom: 24, fontWeight: 500,
        }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--green)", boxShadow: "0 0 10px var(--green)" }} />
          v1.0.4 &middot; Free &amp; Open Source &middot; 100% Local
        </div>

        <h1 className="spidey-title" style={{
          fontWeight: 700, lineHeight: "var(--leading-heading)", letterSpacing: "-0.03em",
          fontSize: "var(--text-h1)", margin: "0 auto 24px", maxWidth: "var(--text-max)",
        }}>
          <span style={{
            background: "linear-gradient(135deg, var(--text) 0%, var(--accent) 45%, var(--accent-2) 75%, var(--text) 100%)",
            backgroundSize: "200% auto", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            animation: "shimmer 4s linear infinite",
          }}>
            Your free LLMs,
          </span>
          <br />
          <span style={{ color: "var(--text-muted)" }}>one local server.</span>
        </h1>

        <p style={{
          maxWidth: 620, margin: "0 auto 48px", fontSize: "var(--text-body)",
          color: "var(--text-muted)", lineHeight: "var(--leading-body)",
        }}>
          OllamoMUI emulates the Ollama API and silently routes your prompts to real,
          <b style={{ color: "var(--text)" }}> 100% free</b> models — then gives you RAG, memory,
          analytics, and a polished dashboard.
        </p>

        <div className="hero-cta" style={{
          display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap", marginBottom: 16, minWidth: 0,
        }}>
          <a href={REPO_URL} target="_blank" rel="noopener noreferrer" style={{
            padding: "12px 24px", borderRadius: 12, fontSize: 15, fontWeight: 700,
            background: "var(--gradient-1)", color: "white", textDecoration: "none",
            display: "inline-flex", alignItems: "center", gap: 8, minHeight: "var(--click-target)",
            boxShadow: "0 6px 24px rgba(13,148,136,0.35)",
          }}>
            <Star size={18} fill="currentColor" />
            Star on GitHub
          </a>
          <a href={DOWNLOAD_URL} target="_blank" rel="noopener noreferrer" style={{
            padding: "12px 24px", borderRadius: 12, fontSize: 15, fontWeight: 700,
            background: "var(--surface)", color: "var(--text)", textDecoration: "none",
            border: "1px solid var(--glass-border)", minHeight: "var(--click-target)",
            display: "inline-flex", alignItems: "center", gap: 8,
          }}>
            <Download size={18} />
            Download for Windows
          </a>
          <a href={FREETIER_URL} target="_blank" rel="noopener noreferrer" style={{
            padding: "12px 24px", borderRadius: 12, fontSize: 15, fontWeight: 700,
            background: "rgba(13,148,136,0.12)", color: "var(--accent-2)", textDecoration: "none",
            border: "1px solid rgba(13,148,136,0.3)", minHeight: "var(--click-target)",
            display: "inline-flex", alignItems: "center", gap: 8,
          }}>
            <Globe size={18} />
            Try Free Tier
          </a>
        </div>
        <div style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)" }}>
          or <a href={RELEASES_URL} target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent-2)" }}>browse all releases</a> &middot; macOS / Linux via <code style={{ fontFamily: "var(--font-mono)" }}>run.sh</code>
        </div>

      </section>

      {/* Interactive Wireframe */}
      <InteractiveWireframe />

      {/* Works with */}
      <section className="lazy-section" style={{ padding: "0 24px 24px", textAlign: "center" }}>
        <p style={{ fontSize: "var(--text-sm)", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 16 }}>
          Works with your favorite tools
        </p>
        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
          {clients.map((c) => (
            <li key={c.name} style={{
              padding: "8px 16px", borderRadius: 8, fontSize: 14, fontWeight: 600,
              background: "var(--surface)", border: "1px solid var(--glass-border)", color: "var(--text-muted)",
              display: "inline-flex", alignItems: "center", gap: 8,
            }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: c.color, boxShadow: `0 0 8px ${c.color}66`, flexShrink: 0 }} />
              {c.name}
            </li>
          ))}
        </ul>
      </section>

      {/* Features */}
      <section className="lazy-section" style={{ padding: "var(--space-3xl) 24px", maxWidth: 1100, margin: "0 auto" }}>
        <h2 style={{ textAlign: "center", fontSize: "var(--text-h2)", fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 8 }}>
          Everything you need, nothing you pay for
        </h2>
        <p style={{ textAlign: "center", color: "var(--text-muted)", marginBottom: 48, fontSize: "var(--text-body)" }}>
          A complete local AI gateway — proxies, brains, and a dashboard in a single 1.4k-line server.
        </p>
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16,
        }}>
           {features.map((f) => {
             const Icon = iconFeatureMap[f.icon];
             return (
               <div key={f.title} className="spidey-panel" style={{
                padding: 24, borderRadius: 16, background: "var(--surface)",
                border: "1px solid var(--glass-border)",
              }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12, marginBottom: 16,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: `${f.color}1a`, border: `1px solid ${f.color}33`,
                  color: f.color,
                }}>
                  {Icon && <Icon size={22} strokeWidth={1.8} />}
                </div>
                <h3 style={{ margin: "0 0 8px", fontSize: "var(--text-h3)", fontWeight: 600, background: "var(--gradient-h3)", WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent" }}>{f.title}</h3>
                <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "var(--text-sm)", lineHeight: "var(--leading-small)" }}>{f.desc}</p>
              </div>
            );
           })}
        </div>
      </section>

      <FeatureMatchSection />

      {/* How it works */}
      <section className="lazy-section" style={{ padding: "24px 24px var(--space-3xl)", maxWidth: 1000, margin: "0 auto" }}>
        <h2 style={{ textAlign: "center", fontSize: "var(--text-h2)", fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 48 }}>
          Live in 60 seconds
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 24 }}>
           {steps.map((s) => (
               <div key={s.n} className="spidey-panel" style={{
                 padding: 24, borderRadius: 16, background: "var(--surface)",
                 border: "1px solid var(--glass-border)", textAlign: "center",
               }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12, margin: "0 auto 16px",
                  background: `${s.color}1a`, border: `1px solid ${s.color}33`,
                  color: s.color, display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {(() => { const I = stepIconMap[s.n]; return I ? <I size={20} /> : null; })()}
                </div>
                <h3 style={{ margin: "0 0 8px", fontSize: "var(--text-h3)", fontWeight: 600, background: "var(--gradient-h3)", WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent" }}>{s.title}</h3>
                <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "var(--text-sm)", lineHeight: "var(--leading-small)" }}>{s.desc}</p>
              </div>
            ))}
        </div>
      </section>

      {/* Comparison — go viral */}
      <section className="lazy-section" style={{ padding: "0 24px var(--space-3xl)", maxWidth: 1000, margin: "0 auto" }}>
        <h2 style={{ textAlign: "center", fontSize: "var(--text-h2)", fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 8 }}>
          Why OllamoMUI wins
        </h2>
        <p style={{ textAlign: "center", color: "var(--text-muted)", marginBottom: 24, fontSize: "var(--text-body)" }}>
          The only option that is <b style={{ color: "var(--green)" }}>100% free</b> <i>and</i> gives you a coding-tool-ready API gateway.
        </p>
        <div style={{ display: "grid", gap: 16 }}>
          {compares.map((c) => {
            const isUs = c.name === "OllamoMUI";
            return (
              <div key={c.name} className={isUs ? "spidey-panel compare-row" : "compare-row"} style={{
                padding: "16px 24px", borderRadius: 16,
                background: isUs ? "linear-gradient(135deg, rgba(13,148,136,0.12), rgba(13,148,136,0.10))" : "var(--surface)",
                border: isUs ? "1px solid rgba(13,148,136,0.35)" : "1px solid var(--glass-border)",
              }}>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{c.name}</div>
                <div>
                  <span className={`badge ${c.free === "Yes" ? "badge-green" : "badge-amber"}`}>{c.free === "Yes" ? "Free" : "Partial"}</span>
                </div>
                <div style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)", lineHeight: "var(--leading-small)" }}>{c.note}</div>
              </div>
            );
          })}
        </div>
      </section>

        {/* Free tier CTA */}
      <section className="lazy-section" style={{ padding: "0 24px var(--space-3xl)", maxWidth: 900, margin: "0 auto" }}>
        <div style={{
          padding: "48px 32px", borderRadius: 16, textAlign: "center",
          background: "linear-gradient(135deg, rgba(13,148,136,0.12), rgba(13,148,136,0.12))",
          border: "1px solid var(--glass-border)",
        }}>
          <div style={{ marginBottom: 8, display: "flex", justifyContent: "center", color: "var(--accent)" }}>
            <Cloud size={36} strokeWidth={1.5} />
          </div>
          <h2 style={{ margin: "0 0 16px", fontSize: "var(--text-h2)", fontWeight: 700, letterSpacing: "-0.02em" }}>
            Zero-setup Free Tier
          </h2>
          <p style={{ margin: "0 auto 24px", maxWidth: 560, color: "var(--text-muted)", fontSize: "var(--text-body)", lineHeight: "var(--leading-body)" }}>
            Don&apos;t want to run anything? The hosted gateway gives you 10+ free models with one click.
            No install, no API key required to try.
          </p>
          <a href={FREETIER_URL} target="_blank" rel="noopener noreferrer" style={{
            padding: "12px 24px", borderRadius: 12, fontSize: 15, fontWeight: 700,
            background: "var(--gradient-1)", color: "white", textDecoration: "none",
            display: "inline-flex", alignItems: "center", gap: 8, minHeight: "var(--click-target)",
            boxShadow: "0 6px 24px rgba(13,148,136,0.35)",
          }}>
            <Globe size={18} />
            Open Free Tier &rarr;
          </a>
        </div>
      </section>

      {/* Hire Me CTA */}
      <section className="lazy-section" style={{ padding: "0 24px var(--space-3xl)", maxWidth: 600, margin: "0 auto" }}>
        <div style={{
          padding: "32px 24px", borderRadius: 16, textAlign: "center",
          background: "var(--surface)", border: "1px solid var(--glass-border)",
        }}>
          <div style={{ marginBottom: 12, display: "flex", justifyContent: "center", color: "var(--accent-2)" }}>
            <FolderOpen size={32} strokeWidth={1.5} />
          </div>
          <p style={{ margin: "0 0 16px", fontSize: "var(--text-sm)", color: "var(--text-muted)", lineHeight: "var(--leading-small)" }}>
            <strong style={{ color: "var(--text)" }}>I built this.</strong> Full-stack developer specializing in
            AI/LLM, cross-platform desktop/mobile, and developer tools. Available for remote roles.
          </p>
          <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/about" style={{
              padding: "12px 24px", borderRadius: 12, fontSize: "var(--text-sm)", fontWeight: 700,
              background: "var(--gradient-1)", color: "white", textDecoration: "none",
              display: "inline-flex", alignItems: "center", gap: 6, minHeight: "var(--click-target)",
            }}>
              <FolderOpen size={16} />
              View Portfolio &rarr;
            </Link>
            <a href="mailto:rbkhan00009@gmail.com" style={{
              padding: "12px 24px", borderRadius: 12, fontSize: "var(--text-sm)", fontWeight: 600,
              background: "var(--surface)", color: "var(--text)", textDecoration: "none",
              border: "1px solid var(--glass-border)", display: "inline-flex", alignItems: "center", gap: 6,
              minHeight: "var(--click-target)",
            }}>
              <Mail size={16} />
              Contact Me
            </a>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="lazy-section" style={{ padding: "0 24px var(--space-4xl)", textAlign: "center" }}>
        <div style={{ marginBottom: 16, display: "flex", justifyContent: "center", color: "var(--accent)" }}>
          <Sparkles size={40} strokeWidth={1.5} />
        </div>
        <h2 style={{ fontSize: "var(--text-h2)", fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 16 }}>
          Stop paying for AI. Run it free, locally.
        </h2>
        <p style={{ color: "var(--text-muted)", marginBottom: 24, fontSize: "var(--text-body)" }}>
          Star the repo and share it — virality is the only price.
        </p>
        <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
          <a href={REPO_URL} target="_blank" rel="noopener noreferrer" style={{
            padding: "12px 24px", borderRadius: 12, fontSize: 15, fontWeight: 700,
            background: "var(--surface)", color: "var(--text)", textDecoration: "none",
            border: "1px solid var(--glass-border)", display: "inline-flex", alignItems: "center", gap: 8,
            minHeight: "var(--click-target)",
          }}>
            <Star size={18} fill="currentColor" />
            Star on GitHub
          </a>
          <Link href="/playground" style={{
            padding: "12px 24px", borderRadius: 12, fontSize: 15, fontWeight: 700,
            background: "var(--gradient-1)", color: "white", textDecoration: "none",
            display: "inline-flex", alignItems: "center", gap: 8, minHeight: "var(--click-target)",
          }}>
            <MessageSquare size={18} />
            Open the App &rarr;
          </Link>
        </div>
      </section>
    </div>
  );
}
