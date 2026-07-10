import React from "react";
import { View, Pressable, Text, StyleSheet } from "react-native";
import { useRouter, usePathname } from "expo-router";
import { COLORS } from "../theme";

const TABS = [
  { name: "Chat", path: "/chat", icon: "💬" },
  { name: "Providers", path: "/providers", icon: "🔌" },
  { name: "Usage", path: "/usage", icon: "📊" },
  { name: "Settings", path: "/settings", icon: "⚙️" },
];

export function BottomNav() {
  const router = useRouter();
  const path = usePathname();
  return (
    <View style={styles.bar}>
      {TABS.map((t) => {
        const active = path === t.path;
        return (
          <Pressable
            key={t.path}
            style={styles.tab}
            onPress={() => router.push(t.path as any)}
          >
            <Text style={[styles.icon, active && styles.active]}>{t.icon}</Text>
            <Text style={[styles.label, active && styles.active]}>{t.name}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderColor: COLORS.border,
    paddingBottom: 6,
    paddingTop: 8,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  icon: { fontSize: 18, opacity: 0.55 },
  label: { color: COLORS.muted, fontSize: 11 },
  active: { opacity: 1, color: COLORS.accent },
});
