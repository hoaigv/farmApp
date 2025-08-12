// SignUpScreen.tsx
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { showMessage } from "react-native-flash-message";
import GoogleLogin from "../../components/GoogleLogin";
import { register, RegisterRequest } from "../../api/signin";

const SignUpScreen: React.FC = () => {
  const router = useRouter();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const handleSignUp = async () => {
    // validate trước khi call API
    if (!email || !password || !confirmPassword) {
      setErrorMessage("Please fill all fields");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match");
      return;
    }

    try {
      setErrorMessage("");
      const payload: RegisterRequest = { email, password, confirmPassword };
      const res = await register(payload);

      showMessage({
        message: res.message || "Registered successfully!",
        type: "success",
      });

      // chuyển sang màn hình login
      router.push("/authentication/login");
    } catch (error: any) {
      const serverMsg =
        error?.response?.data?.message || "Registration failed!";
      setErrorMessage(serverMsg);
      showMessage({
        message: serverMsg,
        type: "danger",
      });
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
          <Text className="text-3xl font-bold text-green-700 mb-8">
            Register
          </Text>

          {/* Error message */}
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
          />

          {/* Password Input */}
          <TextInput
            autoComplete="off"
            textContentType="none"
            value={password}
            onChangeText={setPassword}
            placeholder="Enter your password"
            placeholderTextColor="#999"
            secureTextEntry
            className="w-full bg-white border border-green-500 rounded-lg px-4 py-3 mb-4 text-base text-gray-800"
          />

          {/* Confirm Password Input */}
          <TextInput
            autoComplete="off"
            textContentType="none"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Confirm your password"
            placeholderTextColor="#999"
            secureTextEntry
            className="w-full bg-white border border-green-500 rounded-lg px-4 py-3 mb-6 text-base text-gray-800"
          />

          {/* Sign Up Button */}
          <TouchableOpacity
            onPress={handleSignUp}
            activeOpacity={0.7}
            className="w-full bg-green-600 rounded-lg py-3 mb-4"
          >
            <Text className="text-center text-white text-lg font-medium">
              Sign Up
            </Text>
          </TouchableOpacity>

          {/* Redirect to Login */}
          <View className="flex-row mt-2">
            <Text className="text-gray-600">Already have an account? </Text>
            <TouchableOpacity
              onPress={() => router.push("/authentication/login")}
              activeOpacity={0.7}
            >
              <Text className="text-green-600 underline">Login</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.containerLine}>
            <View style={styles.line} />
            <Text style={styles.text}>or Login with</Text>
            <View style={styles.line} />
          </View>

          <View>
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

export default SignUpScreen;
