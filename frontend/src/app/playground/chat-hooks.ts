import { useCallback, useRef, useState } from "react";

export type ChatRole = "user" | "assistant" | "system";

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  pending?: boolean;
  error?: boolean;
  sources?: string[];
}

export interface FreeModel {
  id: string;
  name: string;
  provider: string;
  free: boolean;
}

export const DEFAULT_MODELS: FreeModel[] = [
  { id: "tencent/hunyuan-t1-latest:free", name: "Tencent Hunyuan T1 (Free)", provider: "OpenRouter", free: true },
  { id: "deepseek/deepseek-r1-distill-llama-70b:free", name: "DeepSeek R1 Distill 70B (Free)", provider: "OpenRouter", free: true },
  { id: "meta-llama/llama-3.3-70b-instruct:free", name: "Llama 3.3 70B (Free)", provider: "OpenRouter", free: true },
  { id: "google/gemma-2-9b-it:free", name: "Gemma 2 9B (Free)", provider: "OpenRouter", free: true },
  { id: "mistralai/mistral-7b-instruct:free", name: "Mistral 7B (Free)", provider: "OpenRouter", free: true },
  { id: "qwen/qwen2.5-72b-instruct:free", name: "Qwen2.5 72B (Free)", provider: "OpenRouter", free: true },
];

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "";

async function loadModelsFromBackend(): Promise<FreeModel[] | null> {
  try {
    const res = await fetch(`${API_BASE}/api/tags`, { headers: { accept: "application/json" } });
    if (!res.ok) return null;
    const data = await res.json();
    const models: string[] = Array.isArray(data?.models)
      ? data.models.map((m: { name?: string }) => m.name).filter(Boolean)
      : [];
    if (!models.length) return null;
    return models.map((name) => ({
      id: name,
      name,
      provider: "Gateway",
      free: true,
    }));
  } catch {
    return null;
  }
}

export function useModels() {
  const [models, setModels] = useState<FreeModel[]>(DEFAULT_MODELS);
  const [loaded, setLoaded] = useState(false);
  const [backendOnline, setBackendOnline] = useState(true);

  const refresh = useCallback(async () => {
    const remote = await loadModelsFromBackend();
    if (remote && remote.length) {
      setModels(remote);
      setBackendOnline(true);
    } else {
      setBackendOnline(false);
    }
    setLoaded(true);
  }, []);

  return { models, setModels, loaded, backendOnline, refresh };
}

interface UseChatOptions {
  model: string;
  onUserMessage?: (text: string) => void;
}

export function useChat({ model, onUserMessage }: UseChatOptions) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  /* Core streaming call — returns accumulated text. Does not touch visible chat. */
  const streamOnce = useCallback(
    async (prompt: string): Promise<string> => {
      const payload = {
        model,
        messages: [{ role: "user", content: prompt }],
        stream: true,
      };
      const controller = new AbortController();
      abortRef.current = controller;
      try {
        const res = await fetch(`${API_BASE}/api/chat`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });
        if (!res.ok || !res.body) throw new Error(`Gateway returned ${res.status}`);
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let acc = "";
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";
          for (const line of lines) {
            const clean = line.trim();
            if (!clean) continue;
            try {
              const json = JSON.parse(clean);
              const piece =
                json?.message?.content ??
                json?.choices?.[0]?.delta?.content ??
                json?.response ??
                "";
              if (piece) acc += piece;
              if (json?.done) break;
            } catch {
              /* ignore keep-alive / partial */
            }
          }
        }
        return acc;
      } finally {
        abortRef.current = null;
      }
    },
    [model]
  );

  const send = useCallback(
    async (text: string, systemPrompt?: string) => {
      const trimmed = text.trim();
      if (!trimmed || streaming) return;

      const userMsg: ChatMessage = {
        id: `u-${Date.now()}`,
        role: "user",
        content: trimmed,
      };
      const assistantMsg: ChatMessage = {
        id: `a-${Date.now()}`,
        role: "assistant",
        content: "",
        pending: true,
      };

      const history = [...messages, userMsg];
      setMessages([...history, assistantMsg]);
      setStreaming(true);
      setError(null);
      onUserMessage?.(trimmed);

      const payload = {
        model,
        messages: [
          ...(systemPrompt ? [{ role: "system", content: systemPrompt }] : []),
          ...history.map((m) => ({ role: m.role, content: m.content })),
        ],
        stream: true,
      };

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const res = await fetch(`${API_BASE}/api/chat`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });

        if (!res.ok || !res.body) {
          throw new Error(`Gateway returned ${res.status}`);
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let acc = "";

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";
          for (const line of lines) {
            const clean = line.trim();
            if (!clean) continue;
            try {
              const json = JSON.parse(clean);
              const piece =
                json?.message?.content ??
                json?.choices?.[0]?.delta?.content ??
                json?.response ??
                "";
              if (piece) {
                acc += piece;
                setMessages((prev) =>
                  prev.map((m) => (m.id === assistantMsg.id ? { ...m, content: acc } : m))
                );
              }
              if (json?.done) break;
            } catch {
              /* ignore keep-alive / partial */
            }
          }
        }

        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsg.id ? { ...m, content: acc || "(no content)", pending: false } : m
          )
        );
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Unknown error";
        setError(`Gateway offline or unavailable (${msg}). Start the OllamoMUI backend to chat.`);
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsg.id
              ? {
                  ...m,
                  content:
                    "⚠️ Could not reach the OllamoMUI gateway. Make sure the backend is running (npm run dev in /backend) and reachable at /api/chat.",
                  pending: false,
                  error: true,
                }
              : m
          )
        );
      } finally {
        setStreaming(false);
        abortRef.current = null;
      }
    },
    [messages, model, streaming, onUserMessage, streamOnce]
  );

  /* Silent generation for Studio artifacts — streams from the model without touching the chat. */
  const generate = useCallback(
    async (prompt: string): Promise<string> => {
      if (streaming) throw new Error("Busy");
      setStreaming(true);
      try {
        return await streamOnce(prompt);
      } finally {
        setStreaming(false);
      }
    },
    [streaming, streamOnce]
  );

  const stop = useCallback(() => {
    abortRef.current?.abort();
    setStreaming(false);
  }, []);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    setMessages([]);
    setError(null);
    setStreaming(false);
  }, []);

  return { messages, streaming, error, send, generate, stop, reset };
}
