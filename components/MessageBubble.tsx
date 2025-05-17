import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface MessageBubbleProps {
  message: string;
  fromUser?: boolean;
}

export default function MessageBubble({
  message,
  fromUser = false,
}: MessageBubbleProps) {
  return (
    <View
      style={[styles.bubble, fromUser ? styles.userBubble : styles.botBubble]}
    >
      <Text style={fromUser ? styles.userText : styles.botText}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  bubble: {
    padding: 12,
    borderRadius: 12,
    marginVertical: 6,
    maxWidth: "80%",
  },
  botBubble: {
    backgroundColor: "#FFF6B0",
    alignSelf: "flex-start",
  },
  userBubble: {
    backgroundColor: "#FFF6B0",
    alignSelf: "flex-end",
  },
  botText: {
    color: "#000",
  },
  userText: {
    color: "#000",
  },
});
