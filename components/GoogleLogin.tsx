// components/GoogleLogin.tsx
import { GOOGLE_IOS_CLIENT_ID, GOOGLE_WEB_CLIENT_ID } from "@env";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { showMessage } from "react-native-flash-message";
import { useDispatch } from "react-redux";
import { loginWithGoogle } from "../api/authApi"; // Gọi API tới backend của bạn
import { login } from "../store/authSlice";
WebBrowser.maybeCompleteAuthSession();

export default function GoogleLogin() {
  const dispatch = useDispatch();

  const [request, response, promptAsync] = Google.useAuthRequest({
    iosClientId: GOOGLE_IOS_CLIENT_ID,
    webClientId: GOOGLE_WEB_CLIENT_ID,
  });

  const handleGoogleResponse = async () => {
    if (response?.type === "success") {
      const { authentication } = response;
      const idToken = authentication?.idToken;

      if (idToken) {
        try {
          const res = await loginWithGoogle(idToken); // res bây giờ chính là LoginResult
          dispatch(
            login({
              user: {
                id: res.id,
                name: res.name,
                avatar_link: res.avatar_link,
                role: res.role,
              },
              accessToken: res.accessToken,
              refreshToken: res.refreshToken,
            })
          );
        } catch (error: any) {
          console.error("❌ Google login error:", error);

          showMessage({
            message: "Login failed",
            description:
              error.message || "Unable to login with Google. Please try again.",
            type: "danger",
            icon: "danger",
            duration: 4000,
            position: "top",
            floating: true,
          });
        }
      }
    }
  };

  return (
    <View className="w-[100%] items-center">
      <TouchableOpacity
        onPress={() => {
          promptAsync().then(handleGoogleResponse);
        }}
        className="flex-row items-center bg-white shadow-black shadow-sm rounded-lg px-4 py-3 mb-4"
      >
        <Image
          source={require("../assets/images/google.png")}
          style={{ width: 24, height: 24, marginRight: 8 }}
        />
        <Text>Google</Text>
      </TouchableOpacity>
    </View>
  );
}
