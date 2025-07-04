// app/_layout.tsx
import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import FlashMessage from "react-native-flash-message";
import { Provider as PaperProvider } from "react-native-paper";
import { Provider, useSelector } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "../global.css";
import { persistor, RootState, store } from "../store";

function AuthRedirectWrapper({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const segments = useSegments();
  const auth = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    const inAuthGroup = segments[0] === "authentication";

    if (!auth.user && !inAuthGroup) {
      router.replace("/authentication/login");
    }

    if (auth.user && inAuthGroup) {
      router.replace("/(tabs)");
    }
  }, [auth.user, segments, router]);

  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PaperProvider>
        <Provider store={store}>
          <PersistGate
            loading={
              <View
                style={{
                  flex: 1,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <ActivityIndicator size="large" />
              </View>
            }
            persistor={persistor}
          >
            <FlashMessage position="top" />
            <AuthRedirectWrapper>
              <Stack>
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="forum" options={{ headerShown: false }} />
                <Stack.Screen
                  name="chat/[roomId]"
                  options={{ headerShown: false }}
                />
                <Stack.Screen
                  name="chat/history"
                  options={{ headerShown: false }}
                />

                <Stack.Screen name="garden" options={{ headerShown: false }} />
                <Stack.Screen
                  name="inventory"
                  options={{ title: "inventory", headerShown: false }}
                />
                <Stack.Screen
                  name="authentication/login"
                  options={{ headerShown: false }}
                />
                <Stack.Screen
                  name="authentication/signup"
                  options={{ headerShown: false }}
                />
              </Stack>
            </AuthRedirectWrapper>
          </PersistGate>
        </Provider>
      </PaperProvider>
    </GestureHandlerRootView>
  );
}
