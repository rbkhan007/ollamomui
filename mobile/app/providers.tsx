import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, RefreshControl, StyleSheet } from "react-native";
import { useApp } from "../lib/AppContext";
import * as api from "../lib/api";
import { COLORS, FONT_SIZE } from "../theme";
import { Card, SectionTitle, Chip } from "../components/ui";
import { BottomNav } from "../components/BottomNav";

export default function Providers() {
  const { connected } = useApp();
  const [providers, setProviders] = useState<any[]>([]);
  const [models, setModels] = useState<string[]>([]);
  const [active, setActive] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const [p, m, s] = await Promise.all([
        api.getProviders(),
        api.getModels(),
        api.getStatus(),
      ]);
      setProviders(p || []);
      setModels((m.models || []).map((x: any) => x.name));
      setActive(s.active_provider || "");
    } catch {
      /* ignore */
    }
  };

  useEffect(() => {
    if (connected) load();
  }, [connected]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.accent}
          />
        }
      >
        <SectionTitle>Active provider</SectionTitle>
        <Card>
          <Text style={styles.active}>{active || "none"}</Text>
          <Text style={styles.muted}>
            {models.length} model{models.length === 1 ? "" : "s"} available
          </Text>
        </Card>

        <SectionTitle>Configured providers</SectionTitle>
        {providers.map((p) => (
          <Card key={p.name} style={p.name === active && styles.activeCard}>
            <View style={styles.rowBetween}>
              <Text style={styles.name}>{p.name}</Text>
              {p.name === active && <Text style={styles.badge}>ACTIVE</Text>}
            </View>
            <Text style={styles.muted}>{p.type}</Text>
            <Text style={styles.muted} numberOfLines={1}>
              {p.url}
            </Text>
            <Text style={[styles.muted, { marginTop: 6 }]}>
              {p.api_key_set ? "API key set" : "No API key"}
            </Text>
          </Card>
        ))}

        <SectionTitle>Models</SectionTitle>
        <View style={styles.chipWrap}>
          {models.map((m) => (
            <Chip key={m} label={m} />
          ))}
          {models.length === 0 && (
            <Text style={styles.muted}>No models loaded yet.</Text>
          )}
        </View>
      </ScrollView>
      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  content: { padding: 16 },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  active: { color: COLORS.text, fontSize: FONT_SIZE.lg, fontWeight: "700" },
  name: { color: COLORS.text, fontSize: FONT_SIZE.md, fontWeight: "700" },
  muted: { color: COLORS.muted, fontSize: FONT_SIZE.sm, marginTop: 2 },
  badge: {
    color: "#fff",
    backgroundColor: COLORS.accent,
    fontSize: FONT_SIZE.xs,
    fontWeight: "700",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  activeCard: { borderColor: COLORS.accent },
  chipWrap: { flexDirection: "row", flexWrap: "wrap" },
});
