import { Stack } from "expo-router";
import { Provider } from "react-redux";
import "../global.css";
import { store } from "../store";
export default function RootLayout() {
  return (
    <Provider store={store}>
      <Stack>
        <Stack.Screen
          name="(tabs)"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="forum/[id]"
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
    </Provider>
  );
}
