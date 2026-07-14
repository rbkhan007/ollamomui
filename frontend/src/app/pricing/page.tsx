import { SITE_URL, REPO_URL } from "@/lib/config";
import type { Metadata } from "next";
import Link from "next/link";
import BuyButton from "@/components/BuyButton";

// Replace with your own number in international format (no + or spaces).
const WHATSAPP_NUMBER = "8801774471120";
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
  "Hi, I want to buy OllamoMUI Pro — please send me payment details."
)}`;


export const metadata: Metadata = {
  title: "Pricing",
  description: "Choose your plan: free tier with 26 LLMs, Web Pro ($9.99/mo), Desktop Pro ($4.99/mo), or Mobile Ultimate ($2.99/mo). Start free, upgrade anytime.",
  alternates: { canonical: `${SITE_URL}/pricing` },
  openGraph: {
    title: "Pricing Plans — Free to Pro",
    description: "Free AI coding assistant with 26 LLMs. Upgrade to Pro for unlimited RAG, memory sync, and higher rate limits.",
    url: `${SITE_URL}/pricing`,
    images: [{ url: `${SITE_URL}/og-image.png`, width: 1200, height: 630, alt: "OllamoMUI Pricing Plans" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Pricing Plans — Free to Pro",
    description: "Free AI coding assistant with 26 LLMs. Upgrade to Pro for unlimited RAG, memory sync, and higher rate limits.",
    images: [`${SITE_URL}/og-image.png`],
  },
};

export default function Pricing() {
  return (
    <main style={{ maxWidth: 1000, margin: "0 auto", padding: "clamp(64px, 5vw, 96px) clamp(16px, 4vw, 24px)" }}>
      <h1 style={{ fontSize: "var(--text-h1)", fontWeight: 700, textAlign: "center", marginBottom: 8, color: "var(--text)", lineHeight: "var(--leading-heading)" }}>
        Choose your plan
      </h1>
      <p style={{ textAlign: "center", color: "var(--text-muted)", marginBottom: 40 }}>
        Start free, upgrade when you need more.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 24 }}>
        <div className="spidey-panel" style={{
          background: "var(--surface)", padding: 24, borderRadius: 16, border: "1px solid var(--glass-border)",
        }}>
          <h2 style={{ fontSize: "var(--text-h2)", fontWeight: 700, marginBottom: 4 }}>Free</h2>
          <p style={{ fontSize: "2rem", fontWeight: 700, marginBottom: 12 }}>$0</p>
          <ul style={{ listStyle: "none", padding: 0, marginBottom: 20 }}>
            <li style={{ padding: "4px 0" }}>✅ 26 free models</li>
            <li style={{ padding: "4px 0" }}>✅ Playground demo</li>
            <li style={{ padding: "4px 0" }}>✅ RAG (limited)</li>
            <li style={{ padding: "4px 0" }}>⏳ 10 requests/day</li>
          </ul>
          <Link href="/playground" style={{ display: "block", textAlign: "center", background: "var(--gradient-1)", color: "#fff", padding: "12px 24px", borderRadius: 8, textDecoration: "none", fontWeight: 600 }}>Try now</Link>
        </div>

        <div className="spidey-panel" style={{
          background: "var(--surface)", padding: 24, borderRadius: 16, border: "2px solid var(--accent-2)", position: "relative",
        }}>
          <div style={{
            position: "absolute", top: -10, right: 16,
            background: "var(--accent-2)", color: "#fff",
            fontSize: 11, fontWeight: 700, padding: "3px 12px", borderRadius: 24,
            letterSpacing: "0.05em",
          }}>POPULAR</div>
          <h2 style={{ fontSize: "var(--text-h2)", fontWeight: 700, marginBottom: 4 }}>Web Pro</h2>
          <p style={{ fontSize: "2rem", fontWeight: 700, marginBottom: 12 }}>$9.99<small style={{ fontSize: "var(--text-sm)", fontWeight: 400, color: "var(--text-muted)" }}>/mo</small></p>
          <ul style={{ listStyle: "none", padding: 0, marginBottom: 20 }}>
            <li style={{ padding: "4px 0" }}>✅ Unlimited RAG storage</li>
            <li style={{ padding: "4px 0" }}>✅ Persistent memory sync</li>
            <li style={{ padding: "4px 0" }}>✅ Higher rate limits</li>
            <li style={{ padding: "4px 0" }}>✅ All 26 models</li>
          </ul>
          <BuyButton plan="web_pro" label="Subscribe" />
        </div>

        <div className="spidey-panel" style={{
          background: "var(--surface)", padding: 24, borderRadius: 16, border: "1px solid var(--glass-border)",
        }}>
          <h2 style={{ fontSize: "var(--text-h2)", fontWeight: 700, marginBottom: 4 }}>Desktop Pro</h2>
          <p style={{ fontSize: "2rem", fontWeight: 700, marginBottom: 12 }}>$4.99<small style={{ fontSize: "var(--text-sm)", fontWeight: 400, color: "var(--text-muted)" }}>/mo</small></p>
          <ul style={{ listStyle: "none", padding: 0, marginBottom: 20 }}>
            <li style={{ padding: "4px 0" }}>✅ Pre-built EXE</li>
            <li style={{ padding: "4px 0" }}>✅ Auto-updates</li>
            <li style={{ padding: "4px 0" }}>✅ Local RAG & memory</li>
            <li style={{ padding: "4px 0" }}>✅ Works offline</li>
          </ul>
          <BuyButton plan="desktop_pro" label="Buy now" />
        </div>

        <div className="spidey-panel" style={{
          background: "var(--surface)", padding: 24, borderRadius: 16, border: "1px solid var(--glass-border)",
        }}>
          <h2 style={{ fontSize: "var(--text-h2)", fontWeight: 700, marginBottom: 4 }}>Mobile Ultimate</h2>
          <p style={{ fontSize: "2rem", fontWeight: 700, marginBottom: 12 }}>$2.99<small style={{ fontSize: "var(--text-sm)", fontWeight: 400, color: "var(--text-muted)" }}>/mo</small></p>
          <ul style={{ listStyle: "none", padding: 0, marginBottom: 20 }}>
            <li style={{ padding: "4px 0" }}>✅ Play Store app</li>
            <li style={{ padding: "4px 0" }}>✅ Sync with desktop</li>
            <li style={{ padding: "4px 0" }}>✅ Mobile RAG</li>
            <li style={{ padding: "4px 0" }}>✅ Usage analytics</li>
          </ul>
          <BuyButton plan="mobile_ultimate" label="Subscribe" />
        </div>
      </div>

      <div className="spidey-panel" style={{ background: "var(--surface)", padding: 24, borderRadius: 16, border: "1px solid var(--glass-border)", marginTop: 32, textAlign: "center" }}>
        <h2 style={{ fontSize: "var(--text-h2)", fontWeight: 700, marginBottom: 8 }}>Prefer to pay directly?</h2>
        <p style={{ color: "var(--text-muted)", marginBottom: 16 }}>
          No automated checkout yet — message me and I&apos;ll send payment details (Bkash / Nagad / bank transfer) and your license key.
        </p>
        <a
          href={WHATSAPP_URL}
          target="_blank"
          rel="noopener noreferrer"
          style={{ display: "inline-block", background: "#25D366", color: "#fff", padding: "12px 24px", borderRadius: 12, textDecoration: "none", fontWeight: 700 }}
        >
          💬 Contact me on WhatsApp to buy
        </a>
      </div>

      <p style={{ textAlign: "center", marginTop: 40, color: "var(--text-muted)", fontSize: "var(--text-sm)" }}>
        All plans include the same 26 free models. Upgrade for convenience and extra features.
        <br />
        Questions? <a href={REPO_URL} target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent-2)" }}>Open an issue</a> on GitHub,
        or <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent-2)" }}>message me on WhatsApp</a>.
      </p>
    </main>
  );
}
