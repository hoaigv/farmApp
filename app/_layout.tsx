import { Stack } from "expo-router";
import { Provider as PaperProvider } from "react-native-paper";
import { Provider } from "react-redux";
import "../global.css";
import { store } from "../store";
export default function RootLayout() {
  return (
    <PaperProvider>
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
          <Stack.Screen
            name="plants/[plantId]"
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="plants/create"
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="plants/[plantId]/reminder"
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="plants/[plantId]/chart"
            options={{
              headerShown: false,
            }}
          />
        </Stack>
      </Provider>
    </PaperProvider>
  );
}
