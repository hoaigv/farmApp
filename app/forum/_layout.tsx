import { Stack } from "expo-router";
import React from "react";

export default function BunkerLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="[id]"
        options={{ title: "Forum Detail", headerShown: false }}
      />
      <Stack.Screen
        name="create"
        options={{ title: "Create Post", headerShown: false }}
      />
      <Stack.Screen
        name="history"
        options={{ title: "History", headerShown: false }}
      />
    </Stack>
  );
}
