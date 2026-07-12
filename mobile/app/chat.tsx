import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { useApp } from "../lib/AppContext";
import * as api from "../lib/api";
import { COLORS } from "../theme";
import { MessageBubble } from "../components/MessageBubble";
import { Chip } from "../components/ui";
import { BottomNav } from "../components/BottomNav";
import { useResponsive } from "../lib/layout";

type Msg = { role: "user" | "assistant"; content: string };

export default function Chat() {
  const router = useRouter();
  const { connected, baseUrl } = useApp();
  const [msgs, setMsgs] = useState<Msg[]>([
    { role: "assistant", content: "Connected to OllamoMUI. Ask me anything." },
  ]);
  const [input, setInput] = useState("");
  const [models, setModels] = useState<string[]>([]);
  const [model, setModel] = useState("");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<any>(null);
  const scrollRef = useRef<ScrollView>(null);
  const abortRef = useRef<AbortController | null>(null);
  const responsive = useResponsive();

  useEffect(() => {
    if (!connected) {
      router.replace("/");
      return;
    }
    (async () => {
      try {
        const s = await api.getStatus();
        setStatus(s);
      } catch {
        /* ignore */
      }
      try {
        const d = await api.getModels();
        const names = (d.models || []).map((m: any) => m.name).filter(Boolean);
        setModels(names);
        if (names.length && !model) setModel(names[0]);
      } catch {
        /* ignore */
      }
    })();
  }, []);

  const scrollToEnd = () =>
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 30);

  const send = async () => {
    const text = input.trim();
    if (!text || busy) return;
    const history = [...msgs, { role: "user", content: text } as Msg];
    setMsgs([...history, { role: "assistant", content: "" }]);
    setInput("");
    setBusy(true);
    const aiIndex = history.length;
    const controller = new AbortController();
    abortRef.current = controller;
    try {
      const stream = api.streamChat(history, model, controller.signal);
      for await (const ev of stream) {
        const c = api.extractContent(ev);
        if (c) {
          setMsgs((m) =>
            m.map((m2, i) => (i === aiIndex ? { ...m2, content: m2.content + c } : m2))
          );
          scrollToEnd();
        }
        if (ev.error) {
          setMsgs((m) =>
            m.map((m2, i) =>
              i === aiIndex ? { ...m2, content: m2.content + `\n[${ev.error}]` } : m2
            )
          );
        }
      }
    } catch (e: any) {
      if (e.name !== "AbortError") {
        setMsgs((m) =>
          m.map((m2, i) =>
            i === aiIndex ? { ...m2, content: m2.content + `\n[Error] ${e.message}` } : m2
          )
        );
      }
    } finally {
      setBusy(false);
      abortRef.current = null;
      scrollToEnd();
    }
  };

  const stop = () => {
    abortRef.current?.abort();
    setBusy(false);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1 }}
    >
      <View style={styles.container}>
        {status && (
          <View style={styles.statusBar}>
            <Text style={styles.statusText}>
              {status.active_provider || "no provider"}
              {status.api_key_set ? "" : " · no key"}
            </Text>
            <Text style={styles.statusText}>{models.length} models</Text>
          </View>
        )}

        <ScrollView
          ref={scrollRef}
          style={styles.scroll}
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          removeClippedSubviews
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
        >
          <View style={[responsive.inner, { paddingVertical: 8 }]}>
            {msgs.map((m, i) => (
              <MessageBubble key={i} role={m.role} content={m.content} />
            ))}
            {busy && (
              <View style={styles.typing}>
                <ActivityIndicator size="small" color={COLORS.accent2} />
              </View>
            )}
          </View>
        </ScrollView>

        {models.length > 1 && (
          <ScrollView
            horizontal
            style={styles.modelBar}
            contentContainerStyle={styles.modelBarContent}
          >
            {models.map((m) => (
              <Chip
                key={m}
                label={m}
                active={m === model}
                onPress={() => setModel(m)}
              />
            ))}
          </ScrollView>
        )}

        <View style={styles.inputBar}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Message OllamoMUI…"
            placeholderTextColor={COLORS.muted}
            multiline
            onSubmitEditing={send}
          />
          {busy ? (
            <Pressable style={styles.sendBtn} onPress={stop}>
              <Text style={styles.sendText}>■</Text>
            </Pressable>
          ) : (
            <Pressable style={styles.sendBtn} onPress={send}>
              <Text style={styles.sendText}>↑</Text>
            </Pressable>
          )}
        </View>
      </View>
      <BottomNav />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  statusBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
  },
  statusText: { color: COLORS.muted, fontSize: 12 },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 8 },
  typing: { paddingLeft: 4, marginTop: 4 },
  modelBar: { maxHeight: 52, borderTopWidth: 1, borderColor: COLORS.border },
  modelBarContent: { padding: 10, paddingBottom: 4 },
  inputBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    padding: 12,
    borderTopWidth: 1,
    borderColor: COLORS.border,
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.surface2,
    color: COLORS.text,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    maxHeight: 120,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORS.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  sendText: { color: "#fff", fontSize: 20, fontWeight: "700" },
});
