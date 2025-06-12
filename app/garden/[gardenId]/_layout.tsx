import { Stack } from "expo-router";
import React from "react";

export default function GardenDetailLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="[plantId]"
        options={{ title: "Plant", headerShown: false }}
      />

      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="create" options={{ headerShown: false }} />
    </Stack>
  );
}
