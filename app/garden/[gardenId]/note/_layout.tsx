import { Stack } from "expo-router";
import React from "react";

export default function NoteLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{ title: "Notes", headerShown: false }}
      />
      <Stack.Screen
        name="create"
        options={{ title: "Create Note", headerShown: false }}
      />
      <Stack.Screen
        name="[noteId]"
        options={{ title: "Note Details", headerShown: false }}
      />
    </Stack>
  );
}
