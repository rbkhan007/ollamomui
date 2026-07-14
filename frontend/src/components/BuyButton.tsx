"use client";

import { useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import { API_BASE } from "@/lib/config";

interface BuyButtonProps {
  plan: string;
  label: string;
}

export default function BuyButton({ plan, label }: BuyButtonProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleClick() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/payment/lemonsqueezy/create-checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user?.email || undefined, plan }),
      });
      const data = await res.json();
      if (!res.ok || !data.checkout_url) {
        throw new Error(data.detail || "Could not start checkout");
      }
      window.location.href = data.checkout_url;
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Checkout failed");
      setLoading(false);
    }
  }

  return (
    <>
      <button
        onClick={handleClick}
        disabled={loading}
        style={{
          display: "block",
          width: "100%",
          textAlign: "center",
          background: "var(--gradient-1)",
          color: "#fff",
          padding: "12px 24px",
          minHeight: "var(--click-target)",
          borderRadius: 12,
          border: "none",
          textDecoration: "none",
          fontWeight: 600,
          fontSize: 14,
          cursor: loading ? "wait" : "pointer",
        }}
      >
        {loading ? "Redirecting…" : label}
      </button>
      {error && <p role="alert" style={{ color: "var(--accent-2)", fontSize: "var(--text-sm)", lineHeight: "var(--leading-small)", marginTop: 8 }}>{error}</p>}
    </>
  );
}
