"use client";

import { useCallback, useEffect, useState } from "react";
import { api, apiJson, getApiBase, setApiBase, toast, saveDatabaseUrl, testDatabaseConnection, getDatabaseStatus } from "@/lib/api";
import { ProviderIcon } from "@/components/BrandIcon";

type Provider = {
  name: string;
  url: string;
  type: string;
  default_model: string;
  api_key_set: boolean;
  api_key_masked: string;
};

type NewProvider = {
  name: string;
  url: string;
  models_url: string;
  type: string;
  auth_type: string;
  default_model: string;
  api_key: string;
};

const EMPTY_NEW: NewProvider = {
  name: "",
  url: "",
  models_url: "",
  type: "openai",
  auth_type: "bearer",
  default_model: "",
  api_key: "",
};

export default function SettingsPage() {
  const [apiBase, setApiBaseInput] = useState("");
  const [connected, setConnected] = useState<boolean | null>(null);
  const [active, setActive] = useState("");
  const [providers, setProviders] = useState<Provider[]>([]);
  const [keys, setKeys] = useState<Record<string, string>>({});
  const [models, setModels] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string>("");
  const [detectKey, setDetectKey] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [np, setNp] = useState<NewProvider>(EMPTY_NEW);
  const [dbUrl, setDbUrl] = useState("");
  const [dbStatus, setDbStatus] = useState<{ database_url_set: boolean; connected: boolean; message: string } | null>(null);
  const [dbBusy, setDbBusy] = useState("");

  const refresh = useCallback(async () => {
    try {
      const status = await apiJson<{ active_provider: string }>("/api/status");
      setActive(status.active_provider || "");
      setConnected(true);
    } catch {
      setConnected(false);
      setProviders([]);
      return;
    }
    try {
      const list = await apiJson<Provider[]>("/api/providers/list");
      setProviders(list);
      setModels(Object.fromEntries(list.map((p) => [p.name, p.default_model || ""])));
    } catch {
      setProviders([]);
    }
  }, []);

  useEffect(() => {
    setApiBaseInput(getApiBase());
    refresh();
    getDatabaseStatus().then(setDbStatus).catch(() => {});
  }, [refresh]);

  function saveBase() {
    setApiBase(apiBase.trim());
    toast("Backend URL saved.");
    setConnected(null);
    refresh();
  }

  async function saveKey(name: string) {
    const key = (keys[name] || "").trim();
    if (!key) {
      toast("Paste an API key first.", true);
      return;
    }
    setBusy(name);
    try {
      await api(`/api/providers/${encodeURIComponent(name)}`, {
        method: "PUT",
        body: JSON.stringify({
          api_key: key,
          default_model: (models[name] || "").trim() || undefined,
          active: true,
        }),
      });
      toast(`Key saved for ${name} and set as active.`);
      setKeys((k) => ({ ...k, [name]: "" }));
      await refresh();
    } catch (e) {
      toast(e instanceof Error ? e.message : "Failed to save key", true);
    } finally {
      setBusy("");
    }
  }

  async function activate(name: string) {
    setBusy(name);
    try {
      await api("/api/providers/activate", {
        method: "POST",
        body: JSON.stringify({ name }),
      });
      toast(`${name} is now the active provider.`);
      await refresh();
    } catch (e) {
      toast(e instanceof Error ? e.message : "Failed to activate", true);
    } finally {
      setBusy("");
    }
  }

  async function clearKey(name: string) {
    setBusy(name);
    try {
      await api(`/api/providers/${encodeURIComponent(name)}`, {
        method: "PUT",
        body: JSON.stringify({ api_key: "" }),
      });
      toast(`Key removed for ${name}.`);
      await refresh();
    } catch (e) {
      toast(e instanceof Error ? e.message : "Failed to remove key", true);
    } finally {
      setBusy("");
    }
  }

  async function autoDetect() {
    const key = detectKey.trim();
    if (!key) {
      toast("Paste an API key to auto-detect.", true);
      return;
    }
    setBusy("__detect");
    try {
      const res = await apiJson<{ detected: boolean; provider?: string; message: string }>(
        "/api/auth/auto-detect",
        { method: "POST", body: JSON.stringify({ api_key: key }) },
      );
      if (res.detected) {
        toast(`Detected & configured: ${res.provider}`);
        setDetectKey("");
        await refresh();
      } else {
        toast(res.message || "Could not detect a provider for that key.", true);
      }
    } catch (e) {
      toast(e instanceof Error ? e.message : "Auto-detect failed", true);
    } finally {
      setBusy("");
    }
  }

  async function saveDb() {
    if (!dbUrl.trim()) {
      toast("Enter a database URL first.", true);
      return;
    }
    setDbBusy("save");
    try {
      await saveDatabaseUrl(dbUrl.trim());
      toast("Database URL saved to backend.");
      const status = await getDatabaseStatus();
      setDbStatus(status);
    } catch (e) {
      toast(e instanceof Error ? e.message : "Failed to save database URL", true);
    } finally {
      setDbBusy("");
    }
  }

  async function testDb() {
    setDbBusy("test");
    try {
      const res = await testDatabaseConnection();
      setDbStatus({ database_url_set: true, connected: res.connected, message: res.message });
      if (res.connected) {
        toast("Database connection successful.");
      } else {
        toast(`Connection failed: ${res.message}`, true);
      }
    } catch (e) {
      toast(e instanceof Error ? e.message : "Test failed", true);
    } finally {
      setDbBusy("");
    }
  }

  async function addCustom() {
    if (!np.name.trim() || !np.url.trim() || !np.type.trim()) {
      toast("Name, URL and type are required.", true);
      return;
    }
    setBusy("__add");
    try {
      await api("/api/providers/add", {
        method: "POST",
        body: JSON.stringify({
          name: np.name.trim(),
          url: np.url.trim(),
          models_url: np.models_url.trim() || undefined,
          type: np.type.trim(),
          auth_type: np.auth_type.trim() || "bearer",
          default_model: np.default_model.trim(),
          api_key: np.api_key.trim(),
        }),
      });
      toast(`Provider "${np.name.trim()}" added.`);
      setNp(EMPTY_NEW);
      setShowAdd(false);
      await refresh();
    } catch (e) {
      toast(e instanceof Error ? e.message : "Failed to add provider", true);
    } finally {
      setBusy("");
    }
  }

  return (
    <main style={{ maxWidth: 760, margin: "0 auto", padding: "clamp(24px, 5vw, 48px) clamp(16px, 4vw, 24px)" }}>
      <h1 style={{ fontSize: "var(--text-h1)", fontWeight: 700, marginBottom: 6 }}>Settings</h1>
      <p style={{ color: "var(--text-muted)", marginBottom: 28 }}>
        Connect to your gateway and add an API key for any model provider. Keys are stored
        by the backend you connect to — nothing is kept in this browser.
      </p>

      {/* ── Backend connection ── */}
      <section style={panel}>
        <h2 style={h2}>Backend connection</h2>
        <p style={hint}>
          Point the site at your OllamoMUI backend. Use{" "}
          <code style={code}>http://localhost:11434</code> for the desktop app, or your hosted
          backend URL. Leave blank to use the same origin.
        </p>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <input
            style={{ ...input, flex: 1, minWidth: 0 }}
            placeholder="http://localhost:11434"
            value={apiBase}
            onChange={(e) => setApiBaseInput(e.target.value)}
          />
          <button style={btn} onClick={saveBase}>Save</button>
        </div>
        <div style={{ marginTop: 12, fontSize: "var(--text-sm)" }}>
          {connected === null && <span style={{ color: "var(--text-muted)" }}>Checking…</span>}
          {connected === true && (
            <span style={{ color: "var(--green)" }}>
              ● Connected{active ? ` · active provider: ${active}` : ""}
            </span>
          )}
          {connected === false && (
            <span style={{ color: "var(--red)" }}>
              ● Not reachable — check the backend URL and that the server is running.
            </span>
          )}
        </div>
      </section>

      {/* ── Database connection ── */}
      <section style={panel}>
        <h2 style={h2}>Database connection</h2>
        <p style={hint}>
          Provide a PostgreSQL <code style={code}>DATABASE_URL</code> if you have your own database.
          Leave blank to use the backend&apos;s default. The URL is sent to the backend and stored in memory — not in this browser.
        </p>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <input
            style={{ ...input, flex: 1, minWidth: 0 }}
            type="password"
            placeholder="postgresql://user:pass@host:5432/db"
            value={dbUrl}
            onChange={(e) => setDbUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && saveDb()}
          />
          <button style={btn} onClick={saveDb} disabled={dbBusy === "save"}>
            {dbBusy === "save" ? "Saving…" : "Save"}
          </button>
          <button style={ghostBtn} onClick={testDb} disabled={dbBusy === "test"}>
            {dbBusy === "test" ? "Testing…" : "Test"}
          </button>
        </div>
        <div style={{ marginTop: 12, fontSize: "var(--text-sm)" }}>
          {dbStatus === null && <span style={{ color: "var(--text-muted)" }}>No status yet — save a URL or click Test.</span>}
          {dbStatus?.connected && (
            <span style={{ color: "var(--green)" }}>
              ● Connected{dbStatus.database_url_set ? " (custom database URL)" : " (default database URL)"}
            </span>
          )}
          {dbStatus && !dbStatus.connected && (
            <span style={{ color: "var(--red)" }}>
              ● {dbStatus.message || "Disconnected — check the URL and that the database is reachable."}
            </span>
          )}
        </div>
      </section>

      {/* ── Quick add (auto-detect) ── */}
      <section style={panel}>
        <h2 style={h2}>Add a key for any model</h2>
        <p style={hint}>
          Paste any provider key (OpenRouter, OpenAI, Anthropic, Groq, DeepSeek, Gemini, …).
          We&apos;ll detect the provider, verify it, and set it active automatically.
        </p>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <input
            style={{ ...input, flex: 1, minWidth: 0 }}
            type="password"
            placeholder="sk-… / sk-or-v1-… / gsk_… "
            value={detectKey}
            onChange={(e) => setDetectKey(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && autoDetect()}
          />
          <button style={btn} onClick={autoDetect} disabled={busy === "__detect"}>
            {busy === "__detect" ? "Detecting…" : "Detect & save"}
          </button>
        </div>
      </section>

      {/* ── Per-provider management ── */}
      <section style={panel}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
          <h2 style={{ ...h2, marginBottom: 0 }}>Providers</h2>
          <button style={ghostBtn} onClick={() => setShowAdd((s) => !s)}>
            {showAdd ? "Cancel" : "+ Custom provider"}
          </button>
        </div>

        {showAdd && (
          <div style={{ ...subPanel, marginTop: 12 }}>
            <div style={grid2}>
              <Field label="Name"><input style={input} placeholder="my-provider" value={np.name} onChange={(e) => setNp({ ...np, name: e.target.value })} /></Field>
              <Field label="Type"><input style={input} placeholder="openai | anthropic | ollama" value={np.type} onChange={(e) => setNp({ ...np, type: e.target.value })} /></Field>
              <Field label="Base URL"><input style={input} placeholder="https://api.example.com/v1/chat/completions" value={np.url} onChange={(e) => setNp({ ...np, url: e.target.value })} /></Field>
              <Field label="Models URL (optional)"><input style={input} placeholder="https://api.example.com/v1/models" value={np.models_url} onChange={(e) => setNp({ ...np, models_url: e.target.value })} /></Field>
              <Field label="Auth type"><input style={input} placeholder="bearer" value={np.auth_type} onChange={(e) => setNp({ ...np, auth_type: e.target.value })} /></Field>
              <Field label="Default model"><input style={input} placeholder="gpt-4o-mini" value={np.default_model} onChange={(e) => setNp({ ...np, default_model: e.target.value })} /></Field>
            </div>
            <Field label="API key"><input style={input} type="password" placeholder="paste key" value={np.api_key} onChange={(e) => setNp({ ...np, api_key: e.target.value })} /></Field>
            <button style={{ ...btn, marginTop: 12 }} onClick={addCustom} disabled={busy === "__add"}>
              {busy === "__add" ? "Adding…" : "Add provider"}
            </button>
          </div>
        )}

        {connected === false && (
          <p style={{ ...hint, marginTop: 12 }}>Connect to a backend above to manage providers.</p>
        )}

        {providers.length === 0 && connected && (
          <p style={{ ...hint, marginTop: 12 }}>No providers found.</p>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 12 }}>
          {providers.map((p) => {
            const isActive = p.name === active;
            const rowBusy = busy === p.name;
            return (
              <div key={p.name} style={{ ...subPanel, borderColor: isActive ? "rgba(13,148,136,0.4)" : "var(--glass-border)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10, flexWrap: "wrap" }}>
                  <ProviderIcon name={p.name} size={22} />
                  <div style={{ fontWeight: 700 }}>{p.name}</div>
                  <span style={badge}>{p.type}</span>
                  {isActive && <span style={{ ...badge, background: "rgba(13,148,136,0.15)", color: "var(--accent)" }}>active</span>}
                  {p.api_key_set ? (
                    <span style={{ ...badge, background: "rgba(0,184,148,0.15)", color: "var(--green)" }}>
                      key {p.api_key_masked}
                    </span>
                  ) : (
                    <span style={{ ...badge, color: "var(--text-muted)" }}>no key</span>
                  )}
                </div>

                <div style={grid2}>
                  <Field label="API key">
                    <input
                      style={input}
                      type="password"
                      placeholder={p.api_key_set ? "replace key…" : "paste key…"}
                      value={keys[p.name] || ""}
                      onChange={(e) => setKeys((k) => ({ ...k, [p.name]: e.target.value }))}
                      onKeyDown={(e) => e.key === "Enter" && saveKey(p.name)}
                    />
                  </Field>
                  <Field label="Default model">
                    <input
                      style={input}
                      placeholder={p.default_model || "model name"}
                      value={models[p.name] ?? ""}
                      onChange={(e) => setModels((m) => ({ ...m, [p.name]: e.target.value }))}
                    />
                  </Field>
                </div>

                <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
                  <button style={btn} onClick={() => saveKey(p.name)} disabled={rowBusy}>
                    {rowBusy ? "Saving…" : "Save key"}
                  </button>
                  {!isActive && (
                    <button style={ghostBtn} onClick={() => activate(p.name)} disabled={rowBusy}>
                      Set active
                    </button>
                  )}
                  {p.api_key_set && (
                    <button style={dangerBtn} onClick={() => clearKey(p.name)} disabled={rowBusy}>
                      Remove key
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: "block" }}>
      <span style={{ display: "block", fontSize: 12, color: "var(--text-muted)", marginBottom: 6, fontWeight: 600 }}>{label}</span>
      {children}
    </label>
  );
}

const panel: React.CSSProperties = {
  background: "var(--surface)",
  border: "1px solid var(--glass-border)",
  borderRadius: 12,
  padding: 24,
  marginBottom: 20,
};
const subPanel: React.CSSProperties = {
  background: "var(--nav-bg, rgba(0,0,0,0.02))",
  border: "1px solid var(--glass-border)",
  borderRadius: 12,
  padding: 16,
};
const h2: React.CSSProperties = { fontSize: "var(--text-h2)", fontWeight: 700, marginBottom: 6 };
const hint: React.CSSProperties = { color: "var(--text-muted)", fontSize: "var(--text-sm)", lineHeight: 1.6, marginBottom: 14 };
const input: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 8,
  border: "1px solid var(--glass-border)",
  background: "var(--surface)",
  color: "var(--text)",
  fontSize: 14,
};
const btn: React.CSSProperties = {
  background: "var(--gradient-1)",
  color: "#fff",
  border: "none",
  padding: "12px 24px",
  borderRadius: 12,
  fontWeight: 700,
  fontSize: 14,
  cursor: "pointer",
};
const ghostBtn: React.CSSProperties = {
  background: "var(--surface)",
  color: "var(--text)",
  border: "1px solid var(--glass-border)",
  padding: "12px 24px",
  borderRadius: 12,
  fontWeight: 600,
  fontSize: 14,
  cursor: "pointer",
};
const dangerBtn: React.CSSProperties = {
  background: "transparent",
  color: "var(--red)",
  border: "1px solid rgba(225,112,85,0.4)",
  padding: "12px 24px",
  borderRadius: 12,
  fontWeight: 600,
  fontSize: 14,
  cursor: "pointer",
};
const badge: React.CSSProperties = {
  fontSize: 12,
  padding: "3px 8px",
  borderRadius: 8,
  background: "var(--surface-2)",
  color: "var(--text-muted)",
  fontWeight: 600,
};
const grid2: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: 12,
};
const code: React.CSSProperties = { fontFamily: "var(--font-mono)", fontSize: 12 };
