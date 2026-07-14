"use client";

import { useState } from "react";
import { getApiBase, toast } from "@/lib/api";

const PLANS = ["web_pro", "desktop_pro", "mobile_ultimate"];

export default function AdminLicense() {
  const [token, setToken] = useState("");
  const [email, setEmail] = useState("");
  const [plan, setPlan] = useState(PLANS[1]);
  const [days, setDays] = useState(30);
  const [result, setResult] = useState("");
  const [busy, setBusy] = useState(false);

  async function generate() {
    if (!token.trim() || !email.trim()) {
      toast("Enter your admin token and the customer email.", true);
      return;
    }
    setBusy(true);
    setResult("");
    try {
      const BASE = getApiBase();
      const res = await fetch(`${BASE}/api/payment/admin/license`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token.trim()}`,
        },
        body: JSON.stringify({ email: email.trim(), plan, days }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.detail || `Error ${res.status}`);
      }
      setResult(data.license as string);
      toast("License generated — copy and send it to the customer.");
    } catch (e) {
      toast(e instanceof Error ? e.message : "Request failed", true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main style={{ maxWidth: 640, margin: "0 auto", padding: "clamp(24px, 5vw, 48px) clamp(16px, 4vw, 24px)" }}>
      <h1 style={{ fontSize: "var(--text-h1)", fontWeight: 700, marginBottom: 8 }}>Manual License Issuer</h1>
      <p style={{ color: "var(--text-muted)", marginBottom: 24 }}>
        Direct sales (WhatsApp / Bkash / bank). Paste your <b>admin</b> Bearer token
        (from logging in as the admin user), enter the customer&apos;s email, and generate a key.
      </p>

      <div className="card" style={{ padding: 24 }}>
        <label style={labelStyle}>Admin token (Bearer)</label>
        <input style={inputStyle} type="password" placeholder="paste JWT from admin login"
          value={token} onChange={(e) => setToken(e.target.value)} />

        <label style={labelStyle}>Customer email</label>
        <input style={inputStyle} type="email" placeholder="customer@example.com"
          value={email} onChange={(e) => setEmail(e.target.value)} />

        <label style={labelStyle}>Plan</label>
        <select style={inputStyle} value={plan} onChange={(e) => setPlan(e.target.value)}>
          {PLANS.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>

        <label style={labelStyle}>Valid for (days)</label>
        <input style={inputStyle} type="number" min={1} value={days}
          onChange={(e) => setDays(Number(e.target.value) || 30)} />

        <button className="btn btn-primary" onClick={generate} disabled={busy}
          style={{ marginTop: 12, width: "100%", opacity: busy ? 0.6 : 1 }}>
          {busy ? "Generating…" : "Generate license"}
        </button>
      </div>

      {result && (
        <div className="card" style={{ marginTop: 24, padding: 16 }}>
          <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 6 }}>License key</div>
          <code style={{ fontSize: 14, wordBreak: "break-all" }}>{result}</code>
          <button className="btn btn-primary" onClick={() => navigator.clipboard.writeText(result)}
            style={{ marginTop: 12, background: "var(--accent-2)" }}>
            Copy key
          </button>
        </div>
      )}
    </main>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block", marginTop: 16, marginBottom: 6, fontWeight: 600, fontSize: 14,
};
const inputStyle: React.CSSProperties = {
  width: "100%", padding: "10px 12px", borderRadius: 8,
  border: "1px solid var(--glass-border)", background: "var(--surface)", color: "var(--text)",
  fontSize: 14,
};
const buttonStyle: React.CSSProperties = {
  display: "inline-block", background: "var(--gradient-1)", color: "#fff",
  border: "none", padding: "12px 24px", borderRadius: 8, fontWeight: 700, cursor: "pointer",
};
