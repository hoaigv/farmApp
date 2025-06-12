import { Stack } from "expo-router";
import React from "react";

export default function GardenDetailLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="chart" options={{ headerShown: false }} />
    </Stack>
  );
}
