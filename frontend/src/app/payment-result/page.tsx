"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function PaymentResultInner() {
  const params = useSearchParams();
  const status = params.get("status");
  const key = params.get("key") || "";
  const plan = params.get("plan") || "";
  const message = params.get("message") || "";

  return (
    <main style={{ maxWidth: 600, margin: "40px auto", padding: 24, textAlign: "center" }}>
      {status === "success" && (
        <>
          <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
          <h1 style={{ fontSize: "1.8rem", fontWeight: 800, marginBottom: 8 }}>
            Payment Successful!
          </h1>
          <p style={{ color: "var(--text-muted)", marginBottom: 16 }}>
            {plan ? `Your ${plan} plan is now active.` : "Your plan is now active."}
          </p>

          <div style={{
            background: "#0a0a0f", border: "1px solid var(--glass-border)",
            borderRadius: 12, padding: 20, marginBottom: 20, textAlign: "left",
          }}>
            <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Your License Key
            </p>
            <pre style={{
              fontFamily: "var(--font-mono, monospace)", fontSize: 14,
              color: "#00cec9", wordBreak: "break-all", whiteSpace: "pre-wrap",
              margin: 0, lineHeight: 1.5,
            }}>{key}</pre>
          </div>

          <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 24, lineHeight: 1.6 }}>
            Copy this key and paste it into the activation screen of the EXE or mobile app.
            We&apos;ve also emailed it to you.
          </p>

          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/download" style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "12px 24px", borderRadius: 10,
              background: "var(--gradient-1)", color: "white", textDecoration: "none",
              fontWeight: 700, fontSize: 15,
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Download the EXE
            </Link>
            <Link href="/playground" style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "12px 24px", borderRadius: 10,
              background: "var(--surface)", color: "var(--text)", textDecoration: "none",
              fontWeight: 600, fontSize: 15, border: "1px solid var(--glass-border)",
            }}>
              Try Web Demo
            </Link>
          </div>
        </>
      )}

      {status === "fail" && (
        <>
          <div style={{ fontSize: 64, marginBottom: 16 }}>❌</div>
          <h1 style={{ fontSize: "1.8rem", fontWeight: 800, marginBottom: 8 }}>
            Payment Failed
          </h1>
          <p style={{ color: "var(--text-muted)", marginBottom: 24 }}>
            {message || "Something went wrong. Please try again or contact support."}
          </p>
          <Link href="/pricing" style={{
            display: "inline-block", padding: "12px 24px", borderRadius: 10,
            background: "var(--gradient-1)", color: "white", textDecoration: "none",
            fontWeight: 700, fontSize: 15,
          }}>
            Back to Pricing
          </Link>
        </>
      )}

      {status === "cancel" && (
        <>
          <div style={{ fontSize: 64, marginBottom: 16 }}>⚠️</div>
          <h1 style={{ fontSize: "1.8rem", fontWeight: 800, marginBottom: 8 }}>
            Payment Cancelled
          </h1>
          <p style={{ color: "var(--text-muted)", marginBottom: 24 }}>
            You can resume checkout anytime. No charges were made.
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
        </>
      )}

      {(!status || status === "error") && (
        <>
          <div style={{ fontSize: 64, marginBottom: 16 }}>🤷</div>
          <h1 style={{ fontSize: "1.8rem", fontWeight: 800, marginBottom: 8 }}>
            Something Went Wrong
          </h1>
          <p style={{ color: "var(--text-muted)", marginBottom: 24 }}>
            {message || "We couldn't process that request. Please try again."}
          </p>
          <Link href="/pricing" style={{
            display: "inline-block", padding: "12px 24px", borderRadius: 10,
            background: "var(--gradient-1)", color: "white", textDecoration: "none",
            fontWeight: 700, fontSize: 15,
          }}>
            Back to Pricing
          </Link>
        </>
      )}
    </main>
  );
}

export default function PaymentResult() {
  return (
    <Suspense fallback={<div style={{ padding: 40, textAlign: "center" }}>Loading...</div>}>
      <PaymentResultInner />
    </Suspense>
  );
}
