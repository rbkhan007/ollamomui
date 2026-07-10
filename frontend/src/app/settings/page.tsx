"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { apiJson, toast } from "@/lib/api";
import { PageIcon } from "@/components/Icons";
import { ProviderIcon } from "@/components/BrandIcon";

type Provider = {
  name: string;
  url: string;
  type: string;
  default_model: string;
  api_key_set: boolean;
  api_key_masked: string;
};

export default function SettingsPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [providers, setProviders] = useState<Provider[]>([]);
  const [activeProvider, setActiveProvider] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [loading, setLoading] = useState(false);

  const [newName, setNewName] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [newType, setNewType] = useState("openai");
  const [newKey, setNewKey] = useState("");
  const [newDefault, setNewDefault] = useState("");

  async function load() {
    try {
      const [list, status] = await Promise.all([
        apiJson<Provider[]>("/api/providers/list"),
        apiJson<{ active_provider: string }>("/api/status"),
      ]);
      setProviders(list);
      setActiveProvider(status.active_provider);
    } catch (e: any) {
      toast("Failed to load providers: " + e.message, true);
    }
  }

  useEffect(() => { if (!isAuthenticated) { router.push("/login"); return; } load(); }, [isAuthenticated, router]);

  async function saveConfig() {
    if (!activeProvider) return;
    setLoading(true);
    try {
      const body: Record<string, string> = { provider: activeProvider };
      if (apiKey) body.api_key = apiKey;
      await apiJson("/api/config", { method: "POST", body: JSON.stringify(body) });
      toast("Configuration saved!");
      setApiKey("");
      load();
    } catch (e: any) {
      toast("Error: " + e.message, true);
    } finally {
      setLoading(false);
    }
  }

  async function addProvider() {
    if (!newName || !newUrl) { toast("Name and URL are required", true); return; }
    try {
      await apiJson("/api/providers/add", {
        method: "POST",
        body: JSON.stringify({
          name: newName, url: newUrl, type: newType,
          api_key: newKey || undefined,
          default_model: newDefault || undefined,
        }),
      });
      toast("Provider added!");
      setNewName(""); setNewUrl(""); setNewKey(""); setNewDefault("");
      load();
    } catch (e: any) {
      toast("Error: " + e.message, true);
    }
  }

  async function deleteProvider(name: string) {
    if (!confirm(`Delete provider "${name}"?`)) return;
    try {
      await apiJson(`/api/providers/${name}`, { method: "DELETE" });
      toast("Provider deleted");
      load();
    } catch (e: any) {
      toast("Error: " + e.message, true);
    }
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-header-icon" style={{ background: "rgba(108,92,231,0.1)" }}>
          <PageIcon type="settings" color="#6c5ce7" />
        </div>
        <div>
          <h1>Settings</h1>
          <p>Configure providers and API keys</p>
        </div>
      </div>

      {/* Active provider config */}
      <div className="card stagger-1" style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Active Provider</h2>
        <div style={{ display: "flex", gap: 12, alignItems: "end", flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <label style={{ fontSize: 13, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Provider</label>
            <select value={activeProvider} onChange={e => setActiveProvider(e.target.value)}>
              {providers.map(p => (
                <option key={p.name} value={p.name}>
                  {p.name} ({p.type}) {p.api_key_set ? "Key set" : "No key"}
                </option>
              ))}
            </select>
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <label style={{ fontSize: 13, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>API Key</label>
            <input
              type="password"
              placeholder={providers.find(p => p.name === activeProvider)?.api_key_set ? "Change API key..." : "Enter API key..."}
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
            />
          </div>
          <button className="btn btn-primary" onClick={saveConfig} disabled={loading}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
              <polyline points="17 21 17 13 7 13 7 21" />
              <polyline points="7 3 7 8 15 8" />
            </svg>
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>

      {/* Provider list */}
      <div className="card stagger-2" style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Configured Providers ({providers.length})</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {providers.length === 0 && (
            <p style={{ color: "var(--text-muted)", fontSize: 14 }}>No providers configured yet.</p>
          )}
          {providers.map(p => (
            <div key={p.name} style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "12px 16px", borderRadius: 8, background: "var(--surface-2)",
              border: p.name === activeProvider ? "1px solid var(--accent)" : "1px solid transparent"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <ProviderIcon name={p.name} size={20} />
                <span style={{ fontWeight: 600 }}>{p.name}</span>
                <span style={{ fontSize: 12, color: "var(--text-muted)", marginLeft: 8 }}>{p.type}</span>
                {p.name === activeProvider && (
                  <span style={{ fontSize: 11, background: "var(--accent)", color: "white", padding: "2px 8px", borderRadius: 4, marginLeft: 8 }}>
                    ACTIVE
                  </span>
                )}
                <span style={{ fontSize: 11, color: "var(--text-muted)", marginLeft: 8 }}>{p.url}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 12, color: p.api_key_set ? "var(--green)" : "var(--red)" }}>
                  {p.api_key_set ? p.api_key_masked : "No key"}
                </span>
                <button className="btn btn-ghost btn-sm" onClick={() => deleteProvider(p.name)}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add new provider */}
      <div className="card stagger-3">
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Add Custom Provider</h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <label style={{ fontSize: 13, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Name</label>
            <input placeholder="my-provider" value={newName} onChange={e => setNewName(e.target.value)} />
          </div>
          <div>
            <label style={{ fontSize: 13, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>API URL</label>
            <input placeholder="https://api.example.com/v1/chat/completions" value={newUrl} onChange={e => setNewUrl(e.target.value)} />
          </div>
          <div>
            <label style={{ fontSize: 13, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Type</label>
            <select value={newType} onChange={e => setNewType(e.target.value)}>
              <option value="openai">OpenAI</option>
              <option value="anthropic">Anthropic</option>
              <option value="gemini">Gemini</option>
            </select>
          </div>
          <div>
            <label style={{ fontSize: 13, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Default Model</label>
            <input placeholder="gpt-4o" value={newDefault} onChange={e => setNewDefault(e.target.value)} />
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            <label style={{ fontSize: 13, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>API Key</label>
            <input type="password" placeholder="sk-..." value={newKey} onChange={e => setNewKey(e.target.value)} />
          </div>
        </div>
        <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={addProvider}>
          Add Provider
        </button>
      </div>
    </div>
  );
}
