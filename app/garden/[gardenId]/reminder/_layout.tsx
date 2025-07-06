import { Stack } from "expo-router";
import React from "react";

export default function NoteLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{ title: "Reminders", headerShown: false }}
      />
      <Stack.Screen
        name="create"
        options={{ title: "Reminders", headerShown: false }}
      />

      <Stack.Screen
        name="[reminderId]"
        options={{ title: "Reminder Details", headerShown: false }}
      />
    </Stack>
  );
}
