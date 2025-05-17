import { Stack } from "expo-router";
import "../global.css";
export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="(tabs)"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="diary/[id]"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="chat/[roomId]"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="chat/history"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}
