import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { useApp } from "../lib/AppContext";
import * as api from "../lib/api";
import { COLORS, FONT_SIZE } from "../theme";
import {
  Card,
  SectionTitle,
  Input,
  PrimaryButton,
} from "../components/ui";
import { BottomNav } from "../components/BottomNav";

export default function Settings() {
  const router = useRouter();
  const { baseUrl, connected, user, testConnection, login, register, logout } =
    useApp();
  const [url, setUrl] = useState(baseUrl);
  const [saving, setSaving] = useState(false);
  const [device, setDevice] = useState<any>(null);

  const [authOpen, setAuthOpen] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setDevice(await api.getDevice());
      } catch {
        /* ignore */
      }
    })();
  }, []);

  const saveServer = async () => {
    setSaving(true);
    const ok = await testConnection(url.trim());
    setSaving(false);
    Alert.alert(ok ? "Connected" : "Could not connect", ok ? "" : "Check the address and that the desktop app is running.");
  };

  const submitAuth = async () => {
    if (!email || password.length < 6) {
      Alert.alert("Invalid", "Enter a valid email and a password of at least 6 characters.");
      return;
    }
    setAuthLoading(true);
    const ok = isRegister
      ? await register(email, password)
      : await login(email, password);
    setAuthLoading(false);
    if (ok) {
      setAuthOpen(false);
      setEmail("");
      setPassword("");
    } else {
      Alert.alert("Failed", isRegister ? "Registration failed." : "Invalid email or password.");
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.content}>
        <SectionTitle>Server</SectionTitle>
        <Card>
          <Text style={styles.muted}>Connected: {connected ? "yes" : "no"}</Text>
          <Text style={styles.label}>Server address</Text>
          <Input value={url} onChangeText={setUrl} placeholder="http://192.168.1.100:11434" keyboardType="url" />
          <PrimaryButton title="Save & reconnect" onPress={saveServer} loading={saving} />
        </Card>

        <SectionTitle>Account</SectionTitle>
        <Card>
          {user ? (
            <View style={styles.rowBetween}>
              <Text style={styles.name}>{user}</Text>
              <PrimaryButton
                title="Log out"
                color={COLORS.red}
                onPress={async () => {
                  await logout();
                }}
              />
            </View>
          ) : (
            <PrimaryButton title="Sign in / Register" onPress={() => setAuthOpen(true)} />
          )}
        </Card>

        {authOpen && (
          <Card>
            <View style={styles.rowBetween}>
              <Text style={styles.name}>{isRegister ? "Register" : "Sign in"}</Text>
              <PrimaryButton
                title={isRegister ? "Sign in" : "Register"}
                color={COLORS.surface2}
                onPress={() => setIsRegister((v) => !v)}
              />
            </View>
            <Text style={styles.label}>Email</Text>
            <Input value={email} onChangeText={setEmail} placeholder="you@example.com" keyboardType="email-address" />
            <Text style={styles.label}>Password</Text>
            <Input value={password} onChangeText={setPassword} placeholder="••••••••" secure />
            <PrimaryButton
              title={isRegister ? "Create account" : "Sign in"}
              onPress={submitAuth}
              loading={authLoading}
            />
          </Card>
        )}

        <SectionTitle>Device</SectionTitle>
        <Card>
          {device ? (
            <>
              <KV k="User" v={device.user} />
              <KV k="Device ID" v={(device.device_id || "").slice(0, 12) + "…"} />
              <KV k="Timezone" v={device.timezone} />
              <KV k="Local time" v={device.server_local_time} />
              <KV k="Key hint" v={device.key_hint} />
            </>
          ) : (
            <Text style={styles.muted}>Device info unavailable.</Text>
          )}
        </Card>

        <SectionTitle>About</SectionTitle>
        <Card>
          <Text style={styles.name}>OllamaEmu Mobile</Text>
          <Text style={styles.muted}>
            React Native client for the Ollama Emulator Desktop. Point it at your
            desktop server to chat with any configured provider from your phone.
          </Text>
        </Card>
      </ScrollView>
      <BottomNav />
    </View>
  );
}

function KV({ k, v }: { k: string; v: string }) {
  return (
    <View style={styles.kv}>
      <Text style={styles.kvKey}>{k}</Text>
      <Text style={styles.kvVal}>{v}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  content: { padding: 16 },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 10 },
  label: {
    color: COLORS.muted,
    fontSize: FONT_SIZE.xs,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 6,
    marginTop: 12,
  },
  name: { color: COLORS.text, fontSize: FONT_SIZE.md, fontWeight: "700" },
  muted: { color: COLORS.muted, fontSize: FONT_SIZE.sm, lineHeight: 18 },
  kv: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 4 },
  kvKey: { color: COLORS.muted, fontSize: FONT_SIZE.sm },
  kvVal: { color: COLORS.text, fontSize: FONT_SIZE.sm, flexShrink: 1, marginLeft: 12, textAlign: "right" },
});
