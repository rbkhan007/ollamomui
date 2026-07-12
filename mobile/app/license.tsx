import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, StyleSheet, Alert } from "react-native";
import { useApp } from "../lib/AppContext";
import * as api from "../lib/api";
import { COLORS, FONT_SIZE } from "../theme";
import { Card, SectionTitle, Input, PrimaryButton } from "../components/ui";
import { BottomNav } from "../components/BottomNav";
import { useResponsive } from "../lib/layout";

export default function License() {
  const responsive = useResponsive();
  const [key, setKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [license, setLicense] = useState<{
    plan: string;
    expires_at: string;
    activated: boolean;
  } | null>(null);

  const checkExisting = async () => {
    try {
      const data = await api.apiJson("/api/payment/license/current");
      if (data?.plan) {
        setLicense(data);
      }
    } catch {}
  };

  useEffect(() => {
    checkExisting();
  }, []);

  const activate = async () => {
    if (!key.trim()) return;
    setLoading(true);
    try {
      const res = await api.apiJson("/api/payment/activate", {
        method: "POST",
        body: JSON.stringify({ license_key: key.trim() }),
      });
      if (res.success) {
        setLicense({ plan: res.plan, expires_at: res.expires_at, activated: true });
        Alert.alert("License Activated", `Plan: ${res.plan}`);
      }
    } catch (e: any) {
      Alert.alert("Activation Failed", e.message || "Invalid license key");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1 }} removeClippedSubviews>
        <View style={responsive.inner}>
          <Text style={styles.title}>License</Text>

          {license ? (
            <Card>
              <Text style={styles.activeBadge}>✓ License Active</Text>
              <Text style={styles.planText}>Plan: {license.plan}</Text>
              <Text style={styles.dimText}>Expires: {license.expires_at}</Text>
            </Card>
          ) : (
            <>
              <Text style={styles.tag}>
                Enter your license key to unlock Pro features.
              </Text>

              <SectionTitle>License Key</SectionTitle>
              <Input
                value={key}
                onChangeText={setKey}
                placeholder="OLLAMOMUI-..."
                autoCapitalize="characters"
                autoCorrect={false}
              />

              <PrimaryButton
                title={loading ? "Activating…" : "Activate License"}
                onPress={activate}
                disabled={loading || !key.trim()}
              />

              <Text style={styles.tag}>
                No license yet? Visit ollamomui.com/pricing
              </Text>
            </>
          )}
        </View>
      </ScrollView>
      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  title: {
    color: COLORS.text,
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 16,
    marginTop: 8,
  },
  tag: {
    color: COLORS.muted,
    fontSize: FONT_SIZE.sm,
    marginTop: 16,
    textAlign: "center",
  },
  activeBadge: {
    color: "#2da44e",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
  },
  planText: {
    color: COLORS.text,
    fontSize: FONT_SIZE.md,
    fontWeight: "600",
    marginBottom: 4,
  },
  dimText: {
    color: COLORS.muted,
    fontSize: FONT_SIZE.sm,
  },
});
