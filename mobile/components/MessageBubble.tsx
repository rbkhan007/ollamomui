import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { COLORS } from "../theme";

export function MessageBubble({
  role,
  content,
}: {
  role: "user" | "assistant";
  content: string;
}) {
  const isUser = role === "user";
  return (
    <View style={[styles.row, isUser ? styles.rowUser : styles.rowAi]}>
      <View style={[styles.bubble, isUser ? styles.user : styles.ai]}>
        <Text style={styles.text}>{content || (isUser ? "" : "…")}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", marginBottom: 10 },
  rowUser: { justifyContent: "flex-end" },
  rowAi: { justifyContent: "flex-start" },
  bubble: {
    maxWidth: "82%",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 16,
  },
  user: {
    backgroundColor: COLORS.userBubble,
    borderBottomRightRadius: 4,
  },
  ai: {
    backgroundColor: COLORS.aiBubble,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderBottomLeftRadius: 4,
  },
  text: { color: COLORS.text, fontSize: 15, lineHeight: 21 },
});
