"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import ThemeToggle from "./ThemeToggle";

// Unified Brand SVG Icons with high fidelity matching reference screenshots
const BRAND_ICONS: Record<string, React.ReactNode> = {
  claudeCode: (
    <svg height="16" viewBox="0 0 24 24" width="16" className="inline-block">
      <path clipRule="evenodd" d="M20.998 10.949H24v3.102h-3v3.028h-1.487V20H18v-2.921h-1.487V20H15v-2.921H9V20H7.488v-2.921H6V20H4.487v-2.921H3V14.05H0V10.95h3V5h17.998v5.949zM6 10.949h1.488V8.102H6v2.847zm10.51 0H18V8.102h-1.49v2.847z" fill="#D97757" fillRule="evenodd" />
    </svg>
  ),
  opencode: (
    <svg height="16" viewBox="0 0 24 24" width="16" className="inline-block">
      <title>opencode</title>
      <path d="M16 6H8v12h8V6zm4 16H4V2h16v20z" fill="#6c5ce7" />
    </svg>
  ),
  kilocode: (
    <svg height="16" viewBox="0 0 24 24" width="16" className="inline-block">
      <title>Kilo Code</title>
      <path d="M0 0v24h24V0H0zm22.222 22.222H1.778V1.778h20.444v20.444zm-7.555-4.964h2.222v1.778h-2.794L12.89 17.83v-2.794h1.778v2.222zm4 0h-1.778v-2.222h-2.222v-1.778h2.793l1.207 1.207v2.793zm-7.556-2.591H9.333v-1.778h1.778v1.778zm-5.778-1.778h1.778v4h4v1.778H6.54L5.333 17.46V12.89zm13.334-3.556v1.778h-5.778V9.333h1.987V7.111h-1.987V5.333h2.558l1.206 1.207v2.793h2.014zm-11.556-2h2.222l1.778 1.778v2H9.333v-2H7.111v2H5.333V5.333h1.778v2zm4 0H9.333v-2h1.778v2z" fill="#00b894" />
    </svg>
  ),
  codex: (
    <svg height="16" viewBox="0 0 24 24" width="16" className="inline-block">
      <defs>
        <linearGradient gradientUnits="userSpaceOnUse" id="codexGradient" x1="12" x2="12" y1="3" y2="21">
          <stop stopColor="#B1A7FF" />
          <stop offset=".5" stopColor="#7A9DFF" />
          <stop offset="1" stopColor="#3941FF" />
        </linearGradient>
      </defs>
      <title>Codex</title>
      <path d="M19.503 0H4.496A4.496 4.496 0 000 4.496v15.007A4.496 4.496 0 004.496 24h15.007A4.496 4.496 0 0024 19.503V4.496A4.496 4.496 0 0019.503 0z" fill="#10a37f" />
      <path d="M9.064 3.344a4.578 4.578 0 012.285-.312c1 .115 1.891.54 2.673 1.275.01.01.024.017.037.021a.09.09 0 00.043 0 4.55 4.55 0 013.046.275l.047.022.116.057a4.581 4.581 0 012.188 2.399c.209.51.313 1.041.315 1.595a4.24 4.24 0 01-.134 1.223.123.123 0 00.03.115c.594.607.988 1.33 1.183 2.17.289 1.425-.007 2.71-.887 3.854l-.136.166a4.548 4.548 0 01-2.201 1.388.123.123 0 00-.081.076c-.191.551-.383 1.023-.74 1.494-.9 1.187-2.222 1.846-3.711 1.838-1.187-.006-2.239-.44-3.157-1.302a.107.107 0 00-.105-.024c-.388.125-.78.143-1.204.138a4.441 4.441 0 01-1.945-.466 4.544 4.544 0 01-1.61-1.335c-.152-.202-.303-.392-.414-.617a5.81 5.81 0 01-.37-.961 4.582 4.582 0 01-.014-2.298.124.124 0 00.006-.056.085.085 0 00-.027-.048 4.467 4.467 0 01-1.034-1.651 3.896 3.896 0 01-.251-1.192 5.189 5.189 0 01.141-1.6c.337-1.112.982-1.985 1.933-2.618.212-.141.413-.251.601-.33.215-.089.43-.164.646-.227a.098.098 0 00.065-.066 4.51 4.51 0 01.829-1.615 4.535 4.535 0 011.837-1.388zm3.482 10.565a.637.637 0 000 1.272h3.636a.637.637 0 100-1.272h-3.636zM8.462 9.23a.637.637 0 00-1.106.631l1.272 2.224-1.266 2.136a.636.636 0 101.095.649l1.454-2.455a.636.636 0 00.005-.64L8.462 9.23z" fill="url(#codexGradient)" />
    </svg>
  ),
  ollama: (
    <svg height="16" viewBox="0 0 24 24" width="16" className="inline-block">
      <title>Ollama</title>
      <path d="M7.905 1.09c.216.085.411.225.588.41.295.306.544.744.734 1.263.191.522.315 1.1.362 1.68a5.054 5.054 0 012.049-.636l.051-.004c.87-.07 1.73.087 2.48.474.101.053.2.11.297.17.05-.569.172-1.134.36-1.644.19-.52.439-.957.733-1.264a1.67 1.67 0 01.589-.41c.257-.1.53-.118.796-.042.401.114.745.368 1.016.737.248.337.434.769.561 1.287.23.934.27 2.163.115 3.645l.053.04.026.019c.757.576 1.284 1.397 1.563 2.35.435 1.487.216 3.155-.534 4.088l-.018.021.002.003c.417.762.67 1.567.724 2.4l.002.03c.064 1.065-.2 2.137-.814 3.19l-.007.01.01.024c.472 1.157.62 2.322.438 3.486l-.006.039a.651.651 0 01-.747.536.648.648 0 01-.54-.742c.167-1.033.01-2.069-.48-3.123a.643.643 0 01.04-.617l.004-.006c.604-.924.854-1.83.8-2.72-.046-.779-.325-1.544-.8-2.273a.644.644 0 01.18-.886l.009-.006c.243-.159.467-.565.58-1.12a4.229 4.229 0 00-.095-1.974c-.205-.7-.58-1.284-1.105-1.683-.595-.454-1.383-.673-2.38-.61a.653.653 0 01-.632-.371c-.314-.665-.772-1.141-1.343-1.436a3.288 3.288 0 00-1.772-.332c-1.245.099-2.343.801-2.67 1.686a.652.652 0 01-.61.425c-1.067.002-1.893.252-2.497.703-.522.39-.878.935-1.066 1.588a4.07 4.07 0 00-.068 1.886c.112.558.331 1.02.582 1.269l.008.007c.212.207.257.53.109.785-.36.622-.629 1.549-.673 2.44-.05 1.018.186 1.902.719 2.536l.016.019a.643.643 0 01.095.69c-.576 1.236-.753 2.252-.562 3.052a.652.652 0 01-1.269.298c-.243-1.018-.078-2.184.473-3.498l.014-.035-.008-.012a4.339 4.339 0 01-.598-1.309l-.005-.019a5.764 5.764 0 01-.177-1.785c.044-.91.278-1.842.622-2.59l.012-.026-.002-.002c-.293-.418-.51-.953-.63-1.545l-.005-.024a5.352 5.352 0 01.093-2.49c.262-.915.777-1.701 1.536-2.269.06-.045.123-.09.186-.132-.159-1.493-.119-2.73.112-3.67.127-.518.314-.95.562-1.287.27-.368.614-.622 1.015-.737.266-.076.54-.059.797.042zm4.116 9.09c.936 0 1.8.313 2.446.855.63.527 1.005 1.235 1.005 1.94 0 .888-.406 1.58-1.133 2.022-.62.375-1.451.557-2.403.557-1.009 0-1.871-.259-2.493-.734-.617-.47-.963-1.13-.963-1.845 0-.707.398-1.417 1.056-1.946.668-.537 1.55-.849 2.485-.849zm0 .896a3.07 3.07 0 00-1.916.65c-.461.37-.722.835-.722 1.25 0 .428.21.829.61 1.134.455.347 1.124.548 1.943.548.799 0 1.473-.147 1.932-.426.463-.28.7-.686.7-1.257 0-.423-.246-.89-.683-1.256-.484-.405-1.14-.643-1.864-.643zm.662 1.21l.004.004c.12.151.095.37-.056.49l-.292.23v.446a.375.375 0 01-.376.373.375.375 0 01-.376-.373v-.46l-.271-.218a.347.347 0 01-.052-.49.353.353 0 01.494-.051l.215.172.22-.174a.353.353 0 01.49.051zm-5.04-1.919c.478 0 .867.39.867.871a.87.87 0 01-.868.871.87.87 0 01-.867-.87.87.87 0 01.867-.872zm8.706 0c.48 0 .868.39.868.871a.87.87 0 01-.868.871.87.87 0 01-.867-.87.87.87 0 01.867-.872zM7.44 2.3l-.003.002a.659.659 0 00-.285.238l-.005.006c-.138.189-.258.467-.348.832-.17.692-.216 1.631-.124 2.782.43-.128.899-.208 1.404-.237l.01-.001.019-.034c.046-.082.095-.161.148-.239.123-.771.022-1.692-.253-2.444-.134-.364-.297-.65-.453-.813a.628.628 0 00-.107-.09L7.44 2.3zm9.174.04l-.002.001a.628.628 0 00-.107.09c-.156.163-.32.45-.453.814-.29.794-.387 1.776-.23 2.572l.058.097.008.014h.03a5.184 5.184 0 011.466.212c.086-1.124.038-2.043-.128-2.722-.09-.365-.21-.643-.349-.832l-.004-.006a.659.659 0 00-.285-.239h-.004z" fill="#00cec9" />
    </svg>
  ),
};

// Generic functional icon rendering component
const Icon = ({ name, className = "w-4 h-4", color = "currentColor" }: { name: string; className?: string; color?: string }) => {
  const icons: Record<string, React.ReactNode> = {
    route: (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="6" cy="19" r="3" />
        <circle cx="18" cy="5" r="3" />
        <path d="M9 19h4a4 4 0 0 0 4-4v-4a4 4 0 0 1 4-4h1" />
      </svg>
    ),
    terminal: (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="4 17 10 11 4 5" />
        <line x1="12" y1="19" x2="20" y2="19" />
      </svg>
    ),
    play: (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="5 3 19 12 5 21 5 3" />
      </svg>
    ),
  };
  return icons[name] || <span className="text-xs">?</span>;
};

// Seed Agents Data
const INITIAL_AGENTS = [
  { id: "ollamomui", name: "OllamoMUI", color: "#f59e0b", icon: "ollama", desc: "Secure Neural Proxy bridge & routing broker gateway.", defaultProvider: "openrouter", setupCmd: "ollamomui serve --secure" },
  { id: "claude-code", name: "ClaudeCode", color: "#fd79a8", icon: "claudeCode", desc: "Anthropic agentic terminal interface.", defaultProvider: "anthropic", setupCmd: "npm install -g @anthropic-ai/claude-code && claude" },
  { id: "opencode", name: "OpenCode", color: "#6c5ce7", icon: "opencode", desc: "Local opensource programming companion.", defaultProvider: "openrouter", setupCmd: "pip install opencode-cli && opencode start" },
  { id: "kilocode", name: "KiloCode", color: "#00b894", icon: "kilocode", desc: "Sleek background compiler & diagnostic runner.", defaultProvider: "deepseek", setupCmd: "npm i -g kilocode && kilocode audit" },
  { id: "codex", name: "CodexCLI", color: "#10a37f", icon: "codex", desc: "Integrated workspace multi-agent runner.", defaultProvider: "openai", setupCmd: "npx codex-cli auth" },
  { id: "ollama-cli", name: "Ollama CLI", color: "#00cec9", icon: "ollama", desc: "Offline local orchestration runner.", defaultProvider: "gemini", setupCmd: "ollama run codegemma" },
];

// Seed Cloud Engines Data
const INITIAL_PROVIDERS = [
  { id: "openai", name: "OpenAI", color: "#10a37f", envKey: "OPENAI_API_KEY", latency: 45, cost: 2.5, models: ["gpt-4o", "o1-pro", "gpt-4-turbo"] },
  { id: "anthropic", name: "Anthropic", color: "#fd79a8", envKey: "ANTHROPIC_API_KEY", latency: 68, cost: 3.0, models: ["claude-3-7-sonnet", "claude-3-5-haiku"] },
  { id: "groq", name: "Groq", color: "#fdcb6e", envKey: "GROQ_API_KEY", latency: 15, cost: 0.59, models: ["llama-3.3-70b-specdec", "mixtral-8x7b"] },
  { id: "deepseek", name: "DeepSeek", color: "#4D6BFE", envKey: "DEEPSEEK_API_KEY", latency: 240, cost: 0.14, models: ["deepseek-v3", "deepseek-reasoner"] },
  { id: "gemini", name: "Gemini", color: "#3186FF", envKey: "GEMINI_API_KEY", latency: 110, cost: 1.25, models: ["gemini-2.5-pro", "gemini-2.5-flash"] },
  { id: "openrouter", name: "OpenRouter", color: "#6c5ce7", envKey: "OPENROUTER_API_KEY", latency: 165, cost: 1.8, models: ["anthropic/claude-3.7-sonnet", "meta-llama/llama-3.1-405b"] },
  { id: "mistral", name: "Mistral", color: "#ff7000", envKey: "MISTRAL_API_KEY", latency: 85, cost: 1.5, models: ["mistral-large-latest", "codestral-latest"] },
];

export default React.memo(function InteractiveWireframe() {
  const [agents] = useState(INITIAL_AGENTS);
  const [providers] = useState(INITIAL_PROVIDERS);
  const [selectedAgent, setSelectedAgent] = useState("ollamomui");
  const [selectedProvider, setSelectedProvider] = useState("openrouter");

  const [isSimulating, setIsSimulating] = useState(false);
  const [terminalLogs, setTerminalLogs] = useState<{ text: string; color: string }[]>([]);
  const [activeModel, setActiveModel] = useState("anthropic/claude-3.7-sonnet");

  const terminalEndRef = useRef<HTMLDivElement>(null);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  // Sync provider selection with active default model
  useEffect(() => {
    const prov = providers.find((p) => p.id === selectedProvider);
    if (prov && prov.models.length > 0) {
      setActiveModel(prov.models[0]);
    }
  }, [selectedProvider, providers]);

  // Keep terminal pinned to bottom on outputs
  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [terminalLogs]);

  useEffect(() => {
    return () => { timersRef.current.forEach(clearTimeout); timersRef.current = []; };
  }, []);

  const runSimulation = () => {
    if (isSimulating) return;
    setIsSimulating(true);
    setTerminalLogs([]);

    const agentObj = agents.find((a) => a.id === selectedAgent) || agents[0];
    const providerObj = providers.find((p) => p.id === selectedProvider) || providers[0];

    const logLines = [
      { text: `~ % ${agentObj.setupCmd}`, color: "text-amber-400 font-bold" },
      { text: "[OLLAMOMUI] Initiating Neural Proxy gateway (CLI ↔ OLLAMOMUI ↔ ANY CLOUD MODEL)...", color: "text-amber-300 font-semibold" },
      { text: "[OLLAMOMUI] Local Broker mapping secure tunnel listener on http://localhost:8080", color: "text-slate-400" },
      { text: `[SYSTEM] Loaded API auth target security: process.env.${providerObj.envKey}`, color: "text-purple-400" },
      { text: "[NEURAL PROXY] Intercepting Client Prompt vector mappings...", color: "text-cyan-400" },
      { text: `[ROUTER] Mapping optimal wire to: ${providerObj.name} using [SMART PROXY] strategy`, color: "text-emerald-400" },
      { text: `[OLLAMOMUI] Tunneling context (3,105 tokens) to downstream endpoint model: "${activeModel}"`, color: "text-amber-200" },
      { text: `⚡ Handshake completed: Central Hub latency is ${providerObj.latency}ms`, color: "text-green-400" },
      { text: "📡 Dispatched proxy tokens. Stream buffer established.", color: "text-slate-300" },
      { text: "⏱️ Decrypted responses received in center proxy, forwarded securely to terminal console.", color: "text-cyan-300" },
      { text: `💎 Run metrics: Estimated proxy token cost: $${((providerObj.cost / 1e6) * 3105).toFixed(5)}`, color: "text-amber-300 font-mono" },
      { text: "✨ Connection closed safely. OLLAMOMUI Neural Proxy listening for subsequent requests.", color: "text-green-400 font-bold" },
    ];

    logLines.forEach((line, index) => {
      const id = setTimeout(() => {
        setTerminalLogs((prev) => [...prev, line]);
        if (index === logLines.length - 1) {
          setIsSimulating(false);
        }
      }, index * 300);
      timersRef.current.push(id);
    });
  };

  const activeAgentObj = agents.find((a) => a.id === selectedAgent) || agents[0];
  const activeProviderObj = providers.find((p) => p.id === selectedProvider) || providers[0];

  return (
    <div className="min-h-screen bg-[#040409] text-slate-100 flex flex-col justify-center selection:bg-amber-500/20 selection:text-amber-300 font-jakarta">
      {/* Embedded styles for animation pipelines & design system scale */}
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500;600&family=Inter:wght@400;500;600;700&display=swap');
        .font-jakarta { font-family: 'Inter', sans-serif; }
        .font-mono-code { font-family: 'Fira Code', monospace; }
        @keyframes flow { 0% { stroke-dashoffset: 120; } 100% { stroke-dashoffset: 0; } }
        @keyframes passive-flow { 0% { stroke-dashoffset: 60; } 100% { stroke-dashoffset: 0; } }
        @keyframes pulse { 0%, 100% { opacity: 0.25; } 50% { opacity: 0.85; } }
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        .data-line { stroke-dasharray: 8 7; animation: flow 2.2s linear infinite; stroke-width: 2.2; fill: none; }
        .passive-data-line { stroke-dasharray: 4 6; animation: passive-flow 6s linear infinite; stroke-width: 0.8; fill: none; }
        .node-pulse { animation: pulse 2.4s ease-in-out infinite; }
        .orb { animation: float 6s ease-in-out infinite; }
      ` }} />

      {/* Main Content Workspace */}
      <main className="max-w-5xl mx-auto w-full px-4 py-8 flex flex-col gap-6 flex-grow justify-center font-jakarta">
        <section className="flex flex-col gap-6">
          <div className="bg-slate-950/40 border border-slate-800/80 rounded-3xl p-6 backdrop-blur-md relative overflow-hidden flex flex-col items-center">
            {/* Interactive glow background elements */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(245,158,11,0.04),transparent_60%)] pointer-events-none" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_75%,rgba(139,92,246,0.04),transparent_60%)] pointer-events-none" />

            <div className="w-full flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 z-10">
              <div>
                <h2 className="text-sm font-bold tracking-wider text-slate-400 uppercase">Interactive Wireframe Engine</h2>
                <p className="text-xs text-slate-500">Recalculating Bezier curve linkages across independent proxy layers. Click nodes to switch targets.</p>
              </div>
              <div className="flex items-center gap-3">
                <ThemeToggle />
                <button
                  onClick={runSimulation}
                  disabled={isSimulating}
                  className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-lg transition-all ${
                    isSimulating
                      ? "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700"
                      : "bg-gradient-to-r from-amber-400 via-yellow-500 to-orange-600 hover:from-amber-300 hover:to-orange-500 text-slate-950 transform active:scale-95"
                  }`}
                >
                  {isSimulating ? (
                    <>
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                      Executing Proxy Handshake...
                    </>
                  ) : (
                    <>
                      <Icon name="play" className="w-3.5 h-3.5 fill-current" color="#090914" />
                      Simulate Agent Run
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Interactive SVG Canvas */}
            <div className="w-full relative bg-[#090914] rounded-2xl border border-slate-900/80 p-2 overflow-hidden shadow-inner">
              <svg viewBox="0 0 800 500" className="w-full h-auto max-h-[500px] select-none block">
                <defs>
                  <linearGradient id="gradientActiveAgent" x1="184" y1="250" x2="400" y2="250" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#F59E0B" />
                    <stop offset="100%" stopColor="#10B981" />
                  </linearGradient>
                  <linearGradient id="gradientActiveProvider" x1="400" y1="250" x2="616" y2="250" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#10B981" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                </defs>

                {/* Ambient visual effects */}
                {/* Removed complex filters and animations for simpler visual */}
                <circle cx="400" cy="250" r="160" fill="#090914" />

                {/* Constellation lines backplane */}
                <g id="constellation-network-mesh">
                  {agents.map((ag, aIndex) => {
                    const startY = 72 + aIndex * 46;
                    const path = `M 184 ${startY} C 292 ${startY}, 292 250, 400 250`;
                    const isActive = ag.id === selectedAgent;
                    return (
                      <g key={`mesh-agent-${ag.id}`}>
                        <path d={path} stroke={ag.color} strokeWidth={isActive ? "1.5" : "0.8"} opacity={isActive ? "0.2" : "0.08"} fill="none" />
                        {!isActive && <path d={path} stroke={ag.color} className="passive-data-line" opacity="0.15" />}
                      </g>
                    );
                  })}
                  {providers.map((prov, pIndex) => {
                    const endY = 56 + pIndex * 44;
                    const path = `M 400 250 C 508 250, 508 ${endY}, 616 ${endY}`;
                    const isActive = prov.id === selectedProvider;
                    return (
                      <g key={`mesh-provider-${prov.id}`}>
                        <path d={path} stroke={prov.color} strokeWidth={isActive ? "1.5" : "0.8"} opacity={isActive ? "0.2" : "0.08"} fill="none" />
                        {!isActive && <path d={path} stroke={prov.color} className="passive-data-line" opacity="0.15" />}
                      </g>
                    );
                  })}
                </g>

                {/* Active highlight overlay */}
                {/* Simplified to single colored path without animation */}
                <path stroke={activeAgentObj.color} strokeWidth="4" opacity="0.4" fill="none" />
                <path stroke="url(#gradientActiveAgent)" strokeWidth="2" opacity="0.8" fill="none" />
                <path stroke={activeProviderObj.color} strokeWidth="4" opacity="0.4" fill="none" />
                <path stroke="url(#gradientActiveProvider)" strokeWidth="2" opacity="0.8" fill="none" />

                {/* Central Hub */}
                <div className="z-30">
                  <rect x="380" y="230" width="40" height="40" fill="#090914" />
                  <rect x="380" y="230" width="20" height="20" fill="none" stroke="#10B981" strokeWidth="1.5" opacity="0.6" />
                  <circle r="30" fill="#090914" />
                  <text x="0" y="-38" fill="#F59E0B" fontSize="10" fontWeight="bold" textAnchor="middle" letterSpacing="1">OLLAMOMUI</text>
                  <text x="0" y="44" fill="#94a3b8" fontSize="9" fontWeight="500" textAnchor="middle" letterSpacing="0.5">NEURAL PROXY HUB</text>
                </div>

                {/* Column Titles */}
                {/* Removed text labels */}

                {/* Left Side: CLI Agents */}
                {agents.map((agent, index) => {
                  const yPos = 72 + index * 46;
                  const isSelected = selectedAgent === agent.id;
                  const x = 32, w = 152, h = 32, o = 6;
                  return (
                    <g key={`agent-${agent.id}`} className="cursor-pointer" onClick={() => setSelectedAgent(agent.id)}>
                      {isSelected && (
                        <circle cx="110" cy={yPos} r="6" fill="none" stroke={agent.color} strokeWidth="1" opacity="0.5">
                          <animate attributeName="r" values="6;22" dur="2.4s" begin="0s" repeatCount="indefinite" />
                          <animate attributeName="opacity" values="0.5;0" dur="2.4s" begin="0s" repeatCount="indefinite" />
                        </circle>
                      )}
                      <path
                        d={`M ${x} ${yPos - h / 2} H ${x + w} V ${yPos + h / 2} H ${x} Z M ${x + o} ${yPos - h / 2 - o} H ${x + w + o} V ${yPos + h / 2 - o} H ${x + o} Z M ${x} ${yPos - h / 2} L ${x + o} ${yPos - h / 2 - o} M ${x + w} ${yPos - h / 2} L ${x + w + o} ${yPos - h / 2 - o} M ${x + w} ${yPos + h / 2} L ${x + w + o} ${yPos + h / 2 - o} M ${x} ${yPos + h / 2} L ${x + o} ${yPos + h / 2 - o}`}
                        fill={isSelected ? "rgba(245, 158, 11, 0.08)" : "rgba(13, 13, 26, 0.4)"}
                        stroke={isSelected ? agent.color : "rgba(255, 255, 255, 0.1)"}
                        strokeOpacity={isSelected ? "0.9" : "0.5"}
                        strokeWidth={isSelected ? "1.5" : "0.5"}
                      />
                      <foreignObject x="40" y={yPos - 11} width="22" height="22">
                        <div className="flex items-center justify-center h-full">
                          <span style={{ color: agent.color, display: "inline-flex" }}>{BRAND_ICONS[agent.icon]}</span>
                        </div>
                      </foreignObject>
                      <text x="68" y={yPos + 4} fill={isSelected ? agent.color : "#94a3b8"} fontSize="11" fontWeight={isSelected ? "600" : "400"} textAnchor="start">
                        {agent.name}
                      </text>
                    </g>
                  );
                })}

                {/* Right Side: Cloud Providers */}
                {providers.map((provider, index) => {
                  const yPos = 56 + index * 44;
                  const isSelected = selectedProvider === provider.id;
                  const x = 616, w = 152, h = 32, o = 6;
                  return (
                    <g key={`provider-${provider.id}`} className="cursor-pointer" onClick={() => setSelectedProvider(provider.id)}>
{isSelected && (
                         <circle cx="690" cy={yPos} r="6" fill="none" stroke={provider.color} strokeWidth="1" opacity="0.5" />
                       )}
                      <path
                        d={`M ${x} ${yPos - h / 2} H ${x + w} V ${yPos + h / 2} H ${x} Z M ${x + o} ${yPos - h / 2 - o} H ${x + w + o} V ${yPos + h / 2 - o} H ${x + o} Z M ${x} ${yPos - h / 2} L ${x + o} ${yPos - h / 2 - o} M ${x + w} ${yPos - h / 2} L ${x + w + o} ${yPos - h / 2 - o} M ${x + w} ${yPos + h / 2} L ${x + w + o} ${yPos + h / 2 - o} M ${x} ${yPos + h / 2} L ${x + o} ${yPos + h / 2 - o}`}
                        fill={isSelected ? "rgba(139, 92, 246, 0.08)" : "rgba(13, 13, 26, 0.4)"}
                        stroke={isSelected ? provider.color : "rgba(255, 255, 255, 0.1)"}
                        strokeOpacity={isSelected ? "0.9" : "0.5"}
                        strokeWidth={isSelected ? "1.5" : "0.5"}
                      />
                      <foreignObject x="624" y={yPos - 11} width="22" height="22">
                        <div className="flex items-center justify-center h-full">
                          <span style={{ color: provider.color, display: "inline-flex" }}>{BRAND_ICONS[provider.id] || <Icon name="route" color={provider.color} />}</span>
                        </div>
                      </foreignObject>
                      <text x="652" y={yPos + 4} fill={isSelected ? provider.color : "#94a3b8"} fontSize="11" fontWeight={isSelected ? "600" : "400"} textAnchor="start">
                        {provider.name}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Real-Time Console */}
            <div className="w-full bg-[#030309]/95 border border-slate-900/90 rounded-2xl overflow-hidden mt-6 shadow-2xl">
              <div className="bg-slate-950/90 px-4 py-2.5 flex items-center justify-between border-b border-slate-900/60 text-xs font-mono-code">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
                  <span className="text-slate-400 font-medium ml-2 select-none">Execution Console (zsh)</span>
                </div>
                <span className="text-slate-500 select-none">API Client Pipeline Status</span>
              </div>
              <div className="p-4 h-52 overflow-y-auto font-mono-code text-[11px] leading-relaxed space-y-1 bg-[#040409] text-slate-300 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
                {terminalLogs.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-500 gap-2">
                    <Icon name="terminal" className="w-5 h-5 opacity-40 animate-pulse" color="#64748b" />
                    <p>Trigger &quot;Simulate Agent Run&quot; to observe real-time proxy dispatch sequences.</p>
                  </div>
                ) : (
                  terminalLogs.map((log, i) => (
                    <div key={i} className={`${log.color} transition-all duration-300 animate-fadeIn`}>{log.text}</div>
                  ))
                )}
                <div ref={terminalEndRef} />
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
});
