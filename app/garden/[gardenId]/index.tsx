import { SafeAreaView, StyleSheet, TouchableOpacity, Text } from "react-native";
import React from "react";
import Header from "@/components/Header";
import { useRouter } from "expo-router";
const GardenDetailScreen = () => {
  const router = useRouter();
  return (
    <SafeAreaView>
      <Header title="Garden Detail" showBack={true} />
      <TouchableOpacity onPress={() => router.push("/garden/123/132")}>
        <Text>Plant crop</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default GardenDetailScreen;

const styles = StyleSheet.create({});
