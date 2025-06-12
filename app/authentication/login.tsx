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
} from "react-native";
import GoogleLogin from "../../components/GoogleLogin";
const LoginScreen = () => {
  const router = useRouter();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const handleLogin = () => {
    // Simple validation example
    if (!email.trim() || !password.trim()) {
      setErrorMessage("Please enter both email and password.");
      return;
    }
    // Here you would call your authentication API
    // On success:
    // navigation.navigate('Home');
    // On failure:
    // setErrorMessage('Invalid email or password.');
    Alert.alert("Login", "Login successful (simulated)!");
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
          />

          {/* Password Input */}
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Enter your password"
            placeholderTextColor="#999"
            secureTextEntry
            className="w-full bg-white border border-green-500 rounded-lg px-4 py-3 mb-6 text-base text-gray-800"
          />

          {/* Login Button */}
          <TouchableOpacity
            onPress={handleLogin}
            activeOpacity={0.7}
            className="w-full bg-green-600 rounded-lg py-3 mb-4"
          >
            <Text className="text-center text-white text-lg font-medium">
              Login
            </Text>
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
          <View style={styles.containerLine}>
            <View style={styles.line} />
            <Text style={styles.text}>or Login with</Text>
            <View style={styles.line} />
          </View>
          <View className=" flex items-center justify-center">
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
