import React from "react";
import { View, Text, ScrollView, StyleSheet, Pressable, Linking } from "react-native";
import { COLORS, FONT_SIZE } from "../theme";
import { Card, SectionTitle, PrimaryButton } from "../components/ui";
import { BottomNav } from "../components/BottomNav";
import { useResponsive } from "../lib/layout";

const SITE = "https://ollamomui.vercel.app";

const FEATURES = [
  ["💸", "100% free tier", "Routes to real free LLMs via OpenRouter, Groq, DeepSeek and more."],
  ["🧩", "Drop-in replacement", "Speaks Ollama, OpenAI and Anthropic APIs from one port."],
  ["🧠", "RAG + Memory", "Local knowledge base and persistent PostgreSQL memory with pgvector."],
  ["📊", "Analytics", "Token usage, per-model stats and recent activity."],
  ["🔒", "Private by design", "Keys and docs never leave your machine."],
  ["📱", "Mobile client", "This app — full parity with the desktop, on any device."],
];

const TOOLS = ["Claude Code", "OpenCode", "Cursor", "Continue.dev", "Any Ollama client"];

export default function About() {
  const responsive = useResponsive();
  return (
    <View style={styles.container}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1 }} removeClippedSubviews>
        <View style={responsive.inner}>
          <View style={styles.hero}>
            <Text style={styles.logo}>🧠</Text>
            <Text style={styles.title}>OllamoMUI</Text>
            <Text style={styles.tag}>
              Free, private, unified AI gateway — running on your desktop, in your pocket.
            </Text>
          </View>

          <SectionTitle>What it does</SectionTitle>
          {FEATURES.map(([icon, title, desc]) => (
            <Card key={title} style={styles.feature}>
              <Text style={styles.fIcon}>{icon}</Text>
              <View style={styles.fBody}>
                <Text style={styles.fTitle}>{title}</Text>
                <Text style={styles.fDesc}>{desc}</Text>
              </View>
            </Card>
          ))}

          <SectionTitle>Works with</SectionTitle>
          <View style={styles.chips}>
            {TOOLS.map((t) => (
              <View key={t} style={styles.tool}>
                <Text style={styles.toolText}>{t}</Text>
              </View>
            ))}
          </View>

          <SectionTitle>This app</SectionTitle>
          <Card>
            <Text style={styles.fDesc}>
              OllamoMUI Mobile is the phone client for the Ollama Emulator Desktop. Connect it to
              your server over Wi-Fi to chat, manage knowledge (RAG), browse memory, switch
              providers, and view usage — the same features as the desktop app, on any device.
            </Text>
          </Card>

          <Pressable style={styles.link} onPress={() => Linking.openURL(SITE)}>
            <Text style={styles.linkText}>Open free web app ↗</Text>
          </Pressable>

          <Text style={styles.footer}>OllamoMUI · v1.0.0 · by Rhasan@dev</Text>
        </View>
      </ScrollView>
      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  hero: { alignItems: "center", paddingVertical: 12, paddingBottom: 8 },
  logo: { fontSize: 56 },
  title: { color: COLORS.text, fontSize: 30, fontWeight: "800", marginTop: 6 },
  tag: {
    color: COLORS.muted,
    fontSize: FONT_SIZE.sm,
    textAlign: "center",
    marginTop: 6,
    paddingHorizontal: 8,
    lineHeight: 19,
  },
  feature: { flexDirection: "row", alignItems: "flex-start", gap: 12, paddingVertical: 14 },
  fIcon: { fontSize: 22, marginTop: 1 },
  fBody: { flex: 1 },
  fTitle: { color: COLORS.text, fontSize: FONT_SIZE.md, fontWeight: "700" },
  fDesc: { color: COLORS.muted, fontSize: FONT_SIZE.sm, marginTop: 2, lineHeight: 18 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  tool: {
    backgroundColor: COLORS.surface2,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  toolText: { color: COLORS.text, fontSize: FONT_SIZE.sm, fontWeight: "600" },
  link: { alignItems: "center", marginTop: 16 },
  linkText: { color: COLORS.accent, fontSize: FONT_SIZE.md, fontWeight: "700" },
  footer: {
    color: COLORS.muted,
    fontSize: FONT_SIZE.xs,
    textAlign: "center",
    marginTop: 20,
    marginBottom: 8,
  },
});
