import { Stack } from "expo-router";
import React from "react";

export default function GardenDetailLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="create" options={{ headerShown: false }} />
      <Stack.Screen name="chart" options={{ headerShown: false }} />
      <Stack.Screen
        name="note"
        options={{ title: "Notes", headerShown: false }}
      />
      <Stack.Screen
        name="reminder"
        options={{ title: "Materials", headerShown: false }}
      />
    </Stack>
  );
}
