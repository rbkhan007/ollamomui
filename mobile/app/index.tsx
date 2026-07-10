import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import { useApp } from "../lib/AppContext";
import { COLORS } from "../theme";
import { Input, PrimaryButton } from "../components/ui";

export default function Connect() {
  const router = useRouter();
  const { baseUrl, testConnection } = useApp();
  const [url, setUrl] = useState(baseUrl || "http://192.168.1.100:11434");
  const [loading, setLoading] = useState(false);

  const connect = async () => {
    const u = url.trim();
    if (!u) return;
    setLoading(true);
    const ok = await testConnection(u);
    setLoading(false);
    if (ok) router.replace("/chat");
    else
      Alert.alert(
        "Connection failed",
        "Could not reach the Ollama Emulator server. Make sure the desktop app is running and use your computer's LAN IP (not localhost) when connecting over Wi-Fi."
      );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.logo}>
          <Text style={styles.glyph}>{">"}_</Text>
        </View>
        <Text style={styles.title}>OllamaEmu</Text>
        <Text style={styles.subtitle}>Connect your phone to the desktop emulator</Text>

        <Text style={styles.label}>Server address</Text>
        <Input
          value={url}
          onChangeText={setUrl}
          placeholder="http://192.168.1.100:11434"
          keyboardType="url"
        />

        <PrimaryButton title="Connect" onPress={connect} loading={loading} />

        <Text style={styles.hint}>
          The desktop app serves on http://localhost:11434. To connect from your
          phone, use your computer's local IP (e.g. 192.168.1.x) and ensure both
          devices are on the same Wi-Fi network.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: COLORS.bg,
    padding: 28,
    justifyContent: "center",
  },
  logo: {
    width: 72,
    height: 72,
    borderRadius: 18,
    backgroundColor: COLORS.surface2,
    borderWidth: 1,
    borderColor: COLORS.accent,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: 16,
  },
  glyph: { color: COLORS.accent2, fontSize: 30, fontWeight: "800" },
  title: {
    color: COLORS.text,
    fontSize: 28,
    fontWeight: "800",
    textAlign: "center",
    letterSpacing: -0.5,
  },
  subtitle: {
    color: COLORS.muted,
    fontSize: 14,
    textAlign: "center",
    marginBottom: 28,
  },
  label: {
    color: COLORS.muted,
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  hint: {
    color: COLORS.muted,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 24,
  },
});
