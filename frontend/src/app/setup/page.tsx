"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { LogoSvg } from "@/components/Icons";
import { ProviderIcon } from "@/components/BrandIcon";
import { toast } from "@/lib/api";
import { apiJson } from "@/lib/api";

export default function SetupPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [provider, setProvider] = useState("openrouter");
  const [apiKey, setApiKey] = useState("");
  const [providers, setProviders] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    apiJson<{ providers: string[] }>("/api/providers/list").then(data => {
      setProviders(data.providers || []);
      setChecking(false);
    }).catch(() => {
      setChecking(false);
    });
  }, [isAuthenticated, router]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!apiKey.trim()) {
      toast("Please enter an API key", true);
      return;
    }
    setLoading(true);
    try {
      await apiJson("/api/config", {
        method: "POST",
        body: JSON.stringify({ provider, api_key: apiKey.trim() }),
      });
      toast("Configuration saved!");
      router.push("/playground");
    } catch {
      toast("Failed to save configuration", true);
    } finally {
      setLoading(false);
    }
  }

  if (checking || !isAuthenticated) return null;

  return (
    <div className="page-container" style={{ maxWidth: 520, margin: "0 auto", paddingTop: 80 }}>
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
          <LogoSvg size={56} />
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 8 }}>
          Welcome, {user?.email}
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: 14 }}>
          Set up your API provider to get started
        </p>
      </div>

      <form onSubmit={handleSubmit} className="card" style={{ padding: 32 }}>
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 13, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 8, marginBottom: 6, fontWeight: 500 }}>
            Provider
            {provider && <ProviderIcon name={provider} size={16} />}
          </label>
          <select
            value={provider}
            onChange={e => setProvider(e.target.value)}
            style={{ fontSize: 15, padding: "12px 16px", width: "100%" }}
          >
            {providers.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: 24 }}>
          <label style={{ fontSize: 13, color: "var(--text-muted)", display: "block", marginBottom: 6, fontWeight: 500 }}>
            API Key
          </label>
          <input
            type="password"
            placeholder="sk-..."
            value={apiKey}
            onChange={e => setApiKey(e.target.value)}
            required
            autoFocus
            style={{ fontSize: 15, padding: "12px 16px", fontFamily: "'JetBrains Mono', monospace" }}
          />
          <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 6 }}>
            For a free tier, get an API key from{" "}
            <a href="https://openrouter.ai/keys" target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent)" }}>
              OpenRouter
            </a>
          </p>
        </div>

        <button
          type="submit"
          className="btn btn-primary btn-lg"
          disabled={loading}
          style={{ width: "100%", justifyContent: "center", fontSize: 15, padding: "14px 24px" }}
        >
          {loading ? "Saving..." : "Save & Continue"}
        </button>
      </form>
    </div>
  );
}
