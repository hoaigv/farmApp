import { SafeAreaView, StyleSheet, Text, TouchableOpacity } from "react-native";
import React from "react";
import { useRouter } from "expo-router";

const GardenListScreen = () => {
  const router = useRouter();
  return (
    <SafeAreaView>
      <TouchableOpacity onPress={() => router.push("/garden/create")}>
        <Text>Create Gardent Screen</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => router.push(`/garden/123`)}>
        <Text>Garden Detail Screen</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default GardenListScreen;

const styles = StyleSheet.create({});
