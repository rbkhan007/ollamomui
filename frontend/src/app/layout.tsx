import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { GradientOrbs, MeshGrid } from "@/components/Background";
import { ThemeProvider } from "@/lib/ThemeContext";
import { AuthProvider } from "@/lib/AuthContext";
import { DbProvider } from "@/lib/DbContext";
import { SITE_URL, ASSET_BASE } from "@/lib/config";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  preload: true,
  fallback: ["system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
  preload: false,
  fallback: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
});

const themeScript = `
(function(){try{var t=localStorage.getItem('ollamomui-theme');if(t==='light'||t==='dark')document.documentElement.setAttribute('data-theme',t);else if(window.matchMedia('(prefers-color-scheme:dark)').matches)document.documentElement.setAttribute('data-theme','dark');else document.documentElement.setAttribute('data-theme','light');}catch(e){}})()
window.addEventListener('unhandledrejection',function(e){var m=(e.reason||'').toString();if(m.includes('listener indicated')||m.includes('message channel closed'))e.preventDefault();});
window.addEventListener('error',function(e){var m=(e.error||'').toString();if(m.includes('listener indicated')||m.includes('message channel closed'))e.preventDefault();});
`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "OllamoMUI — Free Local LLM Proxy with RAG & Memory",
    template: "%s · OllamoMUI",
  },
  description: "OllamoMUI emulates the Ollama API locally and silently routes your prompts to real, 100% FREE LLMs — OpenRouter, OpenAI, Anthropic, Groq, DeepSeek, Gemini and more. Built-in RAG knowledge base, persistent PostgreSQL memory with pgvector, usage analytics, and a polished dashboard. Works with Claude Code, OpenCode, Cursor, Continue.dev and any Ollama-compatible AI coding tool.",
  applicationName: "OllamoMUI",
  keywords: [
    "ollama emulator", "ollama alternative", "local LLM", "free AI models", "free LLM proxy",
    "free AI coding assistant", "RAG knowledge base", "retrieval augmented generation",
    "TF-IDF search", "vector search", "AI coding assistant", "Claude Code", "OpenCode", "Cursor", "Continue.dev",
    "multi-provider AI", "OpenRouter free models", "OpenAI compatible", "Anthropic compatible",
    "local AI proxy", "AI chat playground", "persistent memory", "PostgreSQL AI memory",
    "LM Studio alternative", "run free models locally", "open source AI gateway",
    "fake ollama server", "ollama api emulator", "local gpt proxy", "free chatgpt alternative",
    "private AI", "self-hosted LLM", "offline AI proxy", "free github copilot alternative",
    "ai agent proxy", "llm load balancer", "streaming chat completions",
  ],
  authors: [{ name: "Rhasan@dev" }, { name: "rbkhan007" }],
  creator: "Rhasan@dev",
  publisher: "OllamoMUI",
  category: "technology",
  alternates: { canonical: SITE_URL },
  manifest: `${ASSET_BASE}/manifest.webmanifest`,
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "OllamoMUI",
  },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 } },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: "OllamoMUI",
    title: "OllamoMUI — Free Local LLM Proxy with RAG & Memory",
    description: "Free & Open Source local Ollama API emulator that silently routes your prompts to real, 100% free LLMs. RAG, memory, analytics, and a polished dashboard in one file.",
    images: [{ url: `${ASSET_BASE}/og-image.png`, width: 1200, height: 630, alt: "OllamoMUI — free local LLM proxy" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "OllamoMUI — Free Local LLM Proxy with RAG & Memory",
    description: "Free & Open Source local Ollama API emulator routing prompts to 100% free LLMs. RAG, memory, analytics in one file.",
    images: [`${ASSET_BASE}/og-image.png`],
    creator: "@rbkhan007",
  },
  icons: {
    icon: [`${ASSET_BASE}/favicon.ico`, { url: `${ASSET_BASE}/icon-192.png`, type: "image/png", sizes: "192x192" }],
    apple: `${ASSET_BASE}/apple-touch-icon.png`,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8f9fc" },
    { media: "(prefers-color-scheme: dark)", color: "#06060e" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${jetbrains.variable}`}>
        <head>
          <link rel="icon" type="image/x-icon" href={`${ASSET_BASE}/favicon.ico`} />
          <link rel="icon" type="image/vnd.microsoft.icon" href={`${ASSET_BASE}/brand-mark.ico`} />
          <link rel="apple-touch-icon" href={`${ASSET_BASE}/brand-mark.ico`} />
          <script dangerouslySetInnerHTML={{ __html: themeScript }} />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "SoftwareApplication",
                name: "OllamoMUI",
                applicationCategory: "DeveloperApplication",
                operatingSystem: "Windows, macOS, Linux, Web, Android",
                url: SITE_URL,
                description:
                  "Free, self-hosted AI gateway that emulates the Ollama API and routes prompts to 26 free LLMs with RAG, memory, desktop and mobile clients.",
                offers: [
                  { "@type": "Offer", name: "Free", price: "0", priceCurrency: "USD" },
                  { "@type": "Offer", name: "Desktop Pro", price: "4.99", priceCurrency: "USD" },
                  { "@type": "Offer", name: "Mobile Ultimate", price: "2.99", priceCurrency: "USD" },
                  { "@type": "Offer", name: "Web Pro", price: "9.99", priceCurrency: "USD" },
                ],
              }),
            }}
          />
        </head>
      <body>
        <ThemeProvider>
          <AuthProvider>
            <DbProvider>
              <GradientOrbs />
              <MeshGrid />
              <div style={{ position: "relative", zIndex: 1, minHeight: "100vh", display: "flex", flexDirection: "column" }}>
                <Navbar />
                <main style={{ flex: 1 }}>
                  {children}
                </main>
                <Footer />
              </div>
            </DbProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
