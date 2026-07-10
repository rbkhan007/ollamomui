import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, RefreshControl, StyleSheet } from "react-native";
import { useApp } from "../lib/AppContext";
import * as api from "../lib/api";
import { COLORS, FONT_SIZE } from "../theme";
import { Card, SectionTitle } from "../components/ui";
import { BottomNav } from "../components/BottomNav";

export default function Usage() {
  const { connected } = useApp();
  const [stats, setStats] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      setStats(await api.getUsage());
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

  const fmtTime = (iso?: string) => {
    if (!iso) return "";
    try {
      return new Date(iso).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "";
    }
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
        <SectionTitle>Overview</SectionTitle>
        <View style={styles.grid}>
          <Stat label="Requests" value={stats?.total_requests ?? 0} />
          <Stat label="Tokens" value={stats?.total_tokens ?? 0} />
          <Stat label="Success" value={`${stats?.resonance ?? 100}%`} />
          <Stat label="Providers" value={Object.keys(stats?.by_model ?? {}).length} />
        </View>

        <SectionTitle>By model</SectionTitle>
        {Object.entries(stats?.by_model ?? {}).map(([name, c]: any) => (
          <Card key={name}>
            <View style={styles.rowBetween}>
              <Text style={styles.name}>{name}</Text>
              <Text style={styles.muted}>{c.requests} req</Text>
            </View>
            <Text style={styles.muted}>
              {c.total_tokens} tokens · avg {c.avg_latency}ms
            </Text>
          </Card>
        ))}

        <SectionTitle>Recent activity</SectionTitle>
        {(stats?.recent ?? []).map((e: any, i: number) => (
          <Card key={i} style={styles.mini}>
            <View style={styles.rowBetween}>
              <Text style={styles.name}>{e.model}</Text>
              <Text style={[styles.muted, e.success ? styles.ok : styles.err]}>
                {e.success ? "ok" : "fail"}
              </Text>
            </View>
            <Text style={styles.muted}>
              {e.provider} · {e.total_tokens} tok · {fmtTime(e.timestamp)}
            </Text>
          </Card>
        ))}
        {(stats?.recent ?? []).length === 0 && (
          <Text style={styles.muted}>No activity recorded yet.</Text>
        )}
      </ScrollView>
      <BottomNav />
    </View>
  );
}

function Stat({ label, value }: { label: string; value: any }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  content: { padding: 16 },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 8,
  },
  stat: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statValue: { color: COLORS.text, fontSize: 22, fontWeight: "800" },
  statLabel: {
    color: COLORS.muted,
    fontSize: FONT_SIZE.xs,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginTop: 4,
  },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  name: { color: COLORS.text, fontSize: FONT_SIZE.md, fontWeight: "700" },
  muted: { color: COLORS.muted, fontSize: FONT_SIZE.sm, marginTop: 2 },
  mini: { paddingVertical: 12, paddingHorizontal: 14 },
  ok: { color: COLORS.green },
  err: { color: COLORS.red },
});
