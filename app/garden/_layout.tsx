import { Stack } from "expo-router";
import React from "react";

export default function GardenDetailLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="[gardenId]"
        options={{ title: "Plant", headerShown: false }}
      />
      <Stack.Screen
        name="create"
        options={{ title: "Create Plant", headerShown: false }}
      />
    </Stack>
  );
}
