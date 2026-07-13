import Link from "next/link";
import type { Metadata } from "next";
import { SITE_URL } from "@/lib/config";

export const metadata: Metadata = {
  title: "Payment Cancelled – OllamoMUI",
  description: "Your payment was cancelled. No charges were made.",
  robots: { index: false },
  alternates: { canonical: `${SITE_URL}/cancel` },
};

export default function CancelPage() {
  return (
    <main style={{ maxWidth: 600, margin: "0 auto", padding: "80px 24px", textAlign: "center" }}>
      <div style={{ fontSize: 64, marginBottom: 16 }}>🤷</div>
      <h1 style={{ fontSize: "2rem", fontWeight: 800, marginBottom: 8 }}>Payment Cancelled</h1>
      <p style={{ color: "var(--text-muted)", marginBottom: 32, lineHeight: 1.6 }}>
        No worries – no charges were made. You can still use the free tier anytime,
        or come back when you&apos;re ready to upgrade.
      </p>
      <div className="cta-row" style={{ display: "flex", gap: 12, justifyContent: "center" }}>
        <Link href="/pricing" style={{
          display: "inline-block", padding: "12px 24px", borderRadius: 10,
          background: "var(--gradient-1)", color: "white", textDecoration: "none",
          fontWeight: 700, fontSize: 15,
        }}>
          Back to Pricing
        </Link>
        <Link href="/playground" style={{
          display: "inline-block", padding: "12px 24px", borderRadius: 10,
          background: "var(--surface)", color: "var(--text)", textDecoration: "none",
          fontWeight: 600, fontSize: 15, border: "1px solid var(--glass-border)",
        }}>
          Try Free Demo
        </Link>
      </div>
    </main>
  );
}
