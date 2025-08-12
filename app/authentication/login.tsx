// src/screens/authentication/LoginScreen.tsx
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import GoogleLogin from "../../components/GoogleLogin";
import { useDispatch } from "react-redux";
import { login as loginAction } from "../../store/authSlice";
import {
  loginWithEmail,
  LoginCredentials,
  LoginResponse,
} from "../../api/authApi";
import { showMessage } from "react-native-flash-message";

const MIN_PASSWORD_LENGTH = 6;

const LoginScreen = () => {
  const router = useRouter();
  const dispatch = useDispatch();

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const validateEmail = (value: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(value);
  };

  const handleLogin = async () => {
    setErrorMessage("");

    // Basic validations
    if (!email.trim() || !password.trim()) {
      setErrorMessage("Please enter both email and password.");
      return;
    }
    if (!validateEmail(email.trim())) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      setErrorMessage(
        `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`
      );
      return;
    }

    const payload: LoginCredentials = {
      email: email.trim(),
      password,
    };

    try {
      setLoading(true);
      const res: LoginResponse = await loginWithEmail(payload);

      // expected response: { result: { id, accessToken, refreshToken, name, avatar_link, role }, ... }
      const result = res.result;
      if (!result || !result.accessToken) {
        throw new Error("Invalid response from server.");
      }

      // Dispatch to redux using the AuthState shape your slice expects
      dispatch(
        loginAction({
          user: {
            id: result.id,
            name: result.name || "",
            avatar_link: result.avatar_link,
            role: result.role,
          },
          accessToken: result.accessToken,
          refreshToken: result.refreshToken || null,
        })
      );

      showMessage({
        message: "Login successful",
        type: "success",
        duration: 1200,
      });

      // Navigate to home (adjust path as needed)
      router.push("/home");
    } catch (error: any) {
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        "Login failed. Please check your credentials and try again.";

      setErrorMessage(msg);

      // Chỉ hiển thị nếu không phải lỗi 401
      if (error?.response?.status !== 401) {
        showMessage({
          message: "Login failed",
          description: msg,
          type: "danger",
          icon: "danger",
          duration: 3500,
          position: "top",
          floating: true,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1 bg-white"
      >
        <View className="flex-1 justify-center items-center px-6">
          {/* Title */}
          <Text className="text-3xl font-bold text-green-700 mb-8">Login</Text>

          {/* Error message (if any) */}
          {errorMessage ? (
            <Text className="text-red-600 mb-4">{errorMessage}</Text>
          ) : null}

          {/* Email Input */}
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="Enter your email"
            placeholderTextColor="#999"
            keyboardType="email-address"
            autoCapitalize="none"
            className="w-full bg-white border border-green-500 rounded-lg px-4 py-3 mb-4 text-base text-gray-800"
            editable={!loading}
            returnKeyType="next"
          />

          {/* Password Input */}
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Enter your password"
            placeholderTextColor="#999"
            secureTextEntry
            className="w-full bg-white border border-green-500 rounded-lg px-4 py-3 mb-6 text-base text-gray-800"
            editable={!loading}
            returnKeyType="done"
            onSubmitEditing={handleLogin}
          />

          {/* Login Button */}
          <TouchableOpacity
            onPress={handleLogin}
            activeOpacity={0.7}
            className="w-full bg-green-600 rounded-lg py-3 mb-4"
            disabled={loading}
          >
            <View style={{ alignItems: "center", justifyContent: "center" }}>
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-center text-white text-lg font-medium">
                  Login
                </Text>
              )}
            </View>
          </TouchableOpacity>

          {/* Sign Up Link */}
          <View className="flex-row mt-2">
            <Text className="text-gray-600">Don`t have an account? </Text>
            <TouchableOpacity
              onPress={() => router.push("/authentication/signup")}
              activeOpacity={0.7}
            >
              <Text className="text-green-600 underline">Sign up</Text>
            </TouchableOpacity>
          </View>

          {/* Divider */}
          <View style={styles.containerLine}>
            <View style={styles.line} />
            <Text style={styles.text}>or Login with</Text>
            <View style={styles.line} />
          </View>

          {/* Google Login */}
          <View className="flex items-center justify-center">
            <GoogleLogin />
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  containerLine: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 16,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: "#ccc",
  },
  text: {
    marginHorizontal: 10,
    color: "#777",
    fontSize: 14,
  },
});

export default LoginScreen;
