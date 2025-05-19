import { AntDesign, Entypo, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { SafeAreaView, StyleSheet, Text, View } from "react-native";
import useCustomFonts from "../../hook/FontLoader";
const MyPlantsScreen = () => {
  const router = useRouter();
  const [fontsLoaded] = useCustomFonts();
  if (!fontsLoaded) {
    return null; // or a loading indicator
  }
  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-row items-center justify-between px-4  pb-4 ">
        <View className="flex-col items-start gap-1">
          <View className="flex-row items-center gap-2">
            <View className="bg-primary rounded-full">
              <Entypo name="location-pin" size={24} color="white" />
            </View>
            <Text style={{ fontSize: 16, fontFamily: "PoetsenOne-Regular" }}>
              Đà Nẵng
            </Text>
            <MaterialIcons name="keyboard-arrow-down" size={24} color="black" />
          </View>
          <Text style={{ fontSize: 12 }}>30°C , beautiful sunny weather</Text>
        </View>
        <AntDesign name="pluscircle" size={32} color="#00C897" />
      </View>
    </SafeAreaView>
  );
};

export default MyPlantsScreen;

const styles = StyleSheet.create({});
