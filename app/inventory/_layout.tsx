import { Stack } from "expo-router";
import React from "react";

export default function BunkerLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{ title: "Inventory", headerShown: false }}
      />
      <Stack.Screen
        name="edit"
        options={{ title: "Inventory Detail", headerShown: false }}
      />
    </Stack>
  );
}
