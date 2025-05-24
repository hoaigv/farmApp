import { Stack } from "expo-router";
import React from "react";

export default function ReminderLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="[reminderId]"
        options={{ title: " Reminder form", headerShown: false }}
      />
    </Stack>
  );
}
