import { Stack } from "expo-router";
import React from "react";

export default function ChartLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="chart"
        options={{ title: " Chart", headerShown: false }}
      />
    </Stack>
  );
}
