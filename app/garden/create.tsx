import { SafeAreaView, StyleSheet, Text, View } from "react-native";
import React from "react";
import Header from "@/components/Header";
const CreateGradenScreen = () => {
  return (
    <SafeAreaView>
      <Header title="Create Garden" showBack={true} />
      <Text>CreateGradenScreen</Text>
    </SafeAreaView>
  );
};

export default CreateGradenScreen;

const styles = StyleSheet.create({});
