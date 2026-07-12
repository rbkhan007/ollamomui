import React from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView, StyleSheet, View } from "react-native";
import { AppProvider } from "../lib/AppContext";
import { COLORS } from "../theme";

export default function RootLayout() {
  return (
    <AppProvider>
      <StatusBar style="light" />
      <SafeAreaView style={styles.safe}>
        <View style={styles.flex}>
          <Stack
            screenOptions={{
              headerStyle: { backgroundColor: COLORS.bg },
              headerTintColor: COLORS.text,
              headerTitleStyle: { fontWeight: "700" },
              contentStyle: { backgroundColor: COLORS.bg },
            }}
          >
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="chat" options={{ title: "Chat" }} />
            <Stack.Screen name="knowledge" options={{ title: "Knowledge" }} />
            <Stack.Screen name="memory" options={{ title: "Memory" }} />
            <Stack.Screen name="providers" options={{ title: "Providers" }} />
            <Stack.Screen name="usage" options={{ title: "Usage" }} />
            <Stack.Screen name="settings" options={{ title: "Settings" }} />
            <Stack.Screen name="about" options={{ title: "About" }} />
            <Stack.Screen name="license" options={{ title: "License" }} />
          </Stack>
        </View>
      </SafeAreaView>
    </AppProvider>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  flex: { flex: 1 },
});
