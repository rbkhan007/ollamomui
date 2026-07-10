import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Particles, GradientOrbs, MeshGrid } from "@/components/Background";
import { ThemeProvider } from "@/lib/ThemeContext";
import { AuthProvider } from "@/lib/AuthContext";
import MobileSetup from "@/components/MobileSetup";

const themeScript = `
(function(){try{var t=localStorage.getItem('ollama-emu-theme');if(t==='light'||t==='dark')document.documentElement.setAttribute('data-theme',t);else if(window.matchMedia('(prefers-color-scheme:dark)').matches)document.documentElement.setAttribute('data-theme','dark');else document.documentElement.setAttribute('data-theme','light');}catch(e){}})()
window.addEventListener('unhandledrejection',function(e){var m=(e.reason||'').toString();if(m.includes('listener indicated')||m.includes('message channel closed'))e.preventDefault();});
window.addEventListener('error',function(e){var m=(e.error||'').toString();if(m.includes('listener indicated')||m.includes('message channel closed'))e.preventDefault();});
`;

export const metadata: Metadata = {
  title: "Ollama Emulator Desktop Ultimate - Free Local LLM Proxy with RAG & Memory",
  description: "Emulates the Ollama API locally and routes your prompts to real, free LLM models via OpenRouter, OpenAI, Anthropic, Groq, DeepSeek, Gemini and more. Built-in RAG knowledge base with TF-IDF search, persistent SQLite memory, and a polished Next.js dashboard. Works with Claude Code, OpenCode, and any Ollama-compatible AI coding tool.",
  applicationName: "Ollama Emulator Desktop Ultimate",
  keywords: "ollama emulator, local LLM, free AI models, RAG knowledge base, TF-IDF search, AI coding assistant, Claude Code, OpenCode, multi-provider AI, OpenRouter free models, local AI proxy, AI chat playground, persistent memory, SQLite AI memory",
  authors: [{ name: "Rhasan@dev" }],
  robots: "index, follow",
  openGraph: {
    title: "Ollama Emulator Desktop Ultimate",
    description: "Free & Open Source fake Ollama server with RAG, memory, and multi-provider support. Run locally on port 11434.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
        <head>
          <link rel="icon" type="image/x-icon" href="/favicon.ico" />
          <link rel="icon" type="image/vnd.microsoft.icon" href="/brand-mark.ico" />
          <link rel="apple-touch-icon" href="/brand-mark.ico" />
          <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <meta name="theme-color" content="#f8f9fc" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#06060e" media="(prefers-color-scheme: dark)" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
      </head>
      <body>
        <MobileSetup />
        <ThemeProvider>
          <AuthProvider>
            <Particles count={18} />
            <GradientOrbs />
            <MeshGrid />
            <div style={{ position: "relative", zIndex: 1, minHeight: "100vh", display: "flex", flexDirection: "column" }}>
              <Navbar />
              <main style={{ flex: 1 }}>
                {children}
              </main>
              <Footer />
            </div>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
