import { useRouter } from "expo-router";
import React from "react";
import { SafeAreaView, StyleSheet, Text, View } from "react-native";
import useCustomFonts from "../../hook/FontLoader";

const ForumScreen = () => {
  const router = useRouter();
  const [fontsLoaded] = useCustomFonts();
  if (!fontsLoaded) {
    return null; // or a loading indicator
  }
  return (
    <SafeAreaView className="flex-1 bg-background">
      <View>
        <Text>My Plants</Text>
      </View>
    </SafeAreaView>
  );
};

export default ForumScreen;

const styles = StyleSheet.create({});
