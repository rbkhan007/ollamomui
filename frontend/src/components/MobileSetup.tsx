"use client";

import { useEffect, useState } from "react";
import { setApiBase, isApiConfigured } from "@/lib/api";

function isCapacitor(): boolean {
  return typeof window !== "undefined" && !!(window as unknown as { Capacitor?: unknown }).Capacitor;
}

export default function MobileSetup() {
  const [show, setShow] = useState(false);
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (isCapacitor() && !isApiConfigured()) {
      setShow(true);
    }
  }, []);

  if (!show) return null;

  const save = () => {
    let value = url.trim();
    if (!/^https?:\/\//.test(value)) {
      setError("Enter the full URL, e.g. http://192.168.1.50:11434");
      return;
    }
    setApiBase(value);
    window.location.reload();
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "linear-gradient(135deg, #0d0d1a, #1a1a2e)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 28,
        color: "#fff",
        fontFamily: "Inter, system-ui, sans-serif",
      }}
    >
      <div style={{ width: "100%", maxWidth: 360 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 6, textAlign: "center" }}>
          Ollama Emulator
        </h1>
        <p style={{ fontSize: 13, color: "#94a3b8", textAlign: "center", marginBottom: 24, lineHeight: 1.6 }}>
          Enter the address of the desktop server running Ollama Emulator (same Wi-Fi network).
        </p>
        <input
          aria-label="Server URL"
          value={url}
          onChange={(e) => {
            setUrl(e.target.value);
            setError("");
          }}
          placeholder="http://192.168.1.50:11434"
          inputMode="url"
          autoCapitalize="none"
          autoCorrect="off"
          style={{
            width: "100%",
            padding: "14px 16px",
            borderRadius: 12,
            border: "1px solid rgba(255,255,255,0.15)",
            background: "rgba(255,255,255,0.06)",
            color: "#fff",
            fontSize: 15,
            outline: "none",
          }}
        />
        {error ? (
          <p style={{ color: "#f87171", fontSize: 12, marginTop: 8 }}>{error}</p>
        ) : null}
        <button
          onClick={save}
          style={{
            width: "100%",
            marginTop: 18,
            padding: "14px",
            borderRadius: 12,
            border: "none",
            background: "linear-gradient(135deg, #6c5ce7, #00cec9)",
            color: "#fff",
            fontSize: 15,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Connect
        </button>
      </div>
    </div>
  );
}
