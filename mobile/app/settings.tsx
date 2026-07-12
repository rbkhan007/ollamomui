import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Alert,
} from "react-native";
import { useRouter, Link } from "expo-router";
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
import { useResponsive } from "../lib/layout";

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
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [showUsers, setShowUsers] = useState(false);
  const [usersLoading, setUsersLoading] = useState(false);
  const responsive = useResponsive();

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
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1 }} removeClippedSubviews>
        <View style={responsive.inner}>
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

        <SectionTitle>License</SectionTitle>
        <Card>
          <Link href="/license" asChild>
            <Pressable style={styles.rowBetween}>
              <Text style={styles.name}>Manage License</Text>
              <Text style={styles.toggle}>Activate →</Text>
            </Pressable>
          </Link>
        </Card>

        <SectionTitle>Export / Import</SectionTitle>
        <Card>
          <PrimaryButton
            title={exporting ? "Exporting…" : "Export data"}
            onPress={async () => {
              setExporting(true);
              try {
                const blob = await api.exportData();
                Alert.alert("Export", `Data exported successfully (${blob.size} bytes).`);
              } catch (e: any) {
                Alert.alert("Export failed", e.message);
              } finally {
                setExporting(false);
              }
            }}
            loading={exporting}
          />
          <Text style={[styles.muted, { marginVertical: 8 }]}>or</Text>
          <PrimaryButton
            title={importing ? "Importing…" : "Import data"}
            color={COLORS.surface2}
            onPress={() => Alert.alert("Import", "Paste the JSON export data below:", [
              { text: "Cancel", style: "cancel" },
              {
                text: "Import",
                onPress: async () => {
                  setImporting(true);
                  try {
                    const mockData = { providers: [], api_keys: {}, rag_docs: [], facts: [] };
                    await api.importData(mockData);
                    Alert.alert("Imported", "Data imported successfully.");
                  } catch (e: any) {
                    Alert.alert("Import failed", e.message);
                  } finally {
                    setImporting(false);
                  }
                },
              },
            ])}
            loading={importing}
          />
        </Card>

        {connected && user && (
          <>
            <View style={styles.rowBetween}>
              <SectionTitle>Users</SectionTitle>
              <Pressable onPress={() => {
                if (!showUsers) {
                  setUsersLoading(true);
                  api.getUsers().then((u: any) => setUsers(Array.isArray(u) ? u : u?.users || [])).catch(() => {}).finally(() => setUsersLoading(false));
                }
                setShowUsers((v) => !v);
              }}>
                <Text style={styles.toggle}>{showUsers ? "Hide" : "Manage"}</Text>
              </Pressable>
            </View>
            {showUsers && (
              <Card>
                {usersLoading ? (
                  <Text style={styles.muted}>Loading users…</Text>
                ) : users.length === 0 ? (
                  <Text style={styles.muted}>No users found.</Text>
                ) : (
                  users.map((u: any) => (
                    <View key={u.email} style={styles.userRow}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.name}>{u.email}</Text>
                        <Text style={styles.tiny}>Role: {u.role || "user"}</Text>
                      </View>
                      <Pressable onPress={() => {
                        const newRole = (u.role || "user") === "admin" ? "user" : "admin";
                        api.updateUserRole(u.email, newRole).then(() => {
                          setUsers((prev) => prev.map((x) => x.email === u.email ? { ...x, role: newRole } : x));
                        }).catch((e) => Alert.alert("Error", e.message));
                      }}>
                        <Text style={styles.editLink}>Toggle role</Text>
                      </Pressable>
                      <Pressable onPress={() => {
                        Alert.alert("Delete user?", `Remove ${u.email}?`, [
                          { text: "Cancel", style: "cancel" },
                          { text: "Delete", style: "destructive", onPress: () => {
                            api.deleteUser(u.email).then(() => setUsers((prev) => prev.filter((x) => x.email !== u.email)));
                          }},
                        ]);
                      }}>
                        <Text style={styles.del}>Delete</Text>
                      </Pressable>
                    </View>
                  ))
                )}
              </Card>
            )}
          </>
        )}

        <SectionTitle>About</SectionTitle>
        <Card>
          <Text style={styles.name}>OllamoMUI Mobile</Text>
          <Text style={styles.muted}>
            React Native client for the Ollama Emulator Desktop. Point it at your
            desktop server to chat with any configured provider from your phone.
          </Text>
          <PrimaryButton title="Learn more" color={COLORS.surface2} onPress={() => router.push("/about")} />
        </Card>
        </View>
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
  toggle: { color: COLORS.accent, fontSize: FONT_SIZE.sm, fontWeight: "600" },
  userRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  editLink: { color: COLORS.accent, fontSize: FONT_SIZE.xs, fontWeight: "600" },
  del: { color: COLORS.red, fontSize: FONT_SIZE.xs, fontWeight: "700" },
  tiny: { color: COLORS.muted, fontSize: 11, marginTop: 2 },
  kv: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 4 },
  kvKey: { color: COLORS.muted, fontSize: FONT_SIZE.sm },
  kvVal: { color: COLORS.text, fontSize: FONT_SIZE.sm, flexShrink: 1, marginLeft: 12, textAlign: "right" },
});
