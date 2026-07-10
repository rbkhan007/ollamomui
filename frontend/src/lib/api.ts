const ENV_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "";

function getBase(): string {
  if (typeof window !== "undefined") {
    const stored = window.localStorage.getItem("ollama-emu-api-base");
    if (stored) return stored.replace(/\/+$/, "");
  }
  return ENV_BASE;
}

const MAX_RETRIES = 3;
const RETRY_DELAY = 400;

export async function api(path: string, opts?: RequestInit) {
  const BASE = getBase();
  let lastErr: Error | null = null;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const res = await fetch(`${BASE}${path}`, {
        headers: { "Content-Type": "application/json", ...opts?.headers },
        ...opts,
      });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`${res.status}: ${text || res.statusText}`);
      }
      return res;
    } catch (err) {
      lastErr = err instanceof Error ? err : new Error(String(err));
      if (attempt < MAX_RETRIES && isRetryable(lastErr)) {
        await new Promise(r => setTimeout(r, RETRY_DELAY * (attempt + 1)));
        continue;
      }
      throw lastErr;
    }
  }
  throw lastErr ?? new Error("Request failed");
}

function isRetryable(err: Error): boolean {
  const msg = err.message || "";
  return msg.includes("Failed to fetch") || msg.includes("NetworkError") || msg.includes("ERR_CONNECTION");
}

export async function apiJson<T = unknown>(path: string, opts?: RequestInit): Promise<T> {
  const res = await api(path, opts);
  return res.json();
}

export function toast(msg: string, isError = false) {
  const el = document.createElement("div");
  el.className = "toast" + (isError ? " toast-error" : "");
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 2400);
}

export function setApiBase(url: string) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem("ollama-emu-api-base", url.replace(/\/+$/, ""));
  }
}

export function getApiBase(): string {
  return getBase();
}

export function isApiConfigured(): boolean {
  return getBase().length > 0;
}
