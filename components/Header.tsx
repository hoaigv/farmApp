import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View, Image } from "react-native";
import { images } from "@/data/image"; // Adjust the import path as necessary
type HeaderProps = {
  title: string;
  showBack?: boolean;
  onBack?: () => void;
  rightElement?: React.ReactNode;
};

export default function Header({
  title,
  showBack = true,
  onBack,
  rightElement,
}: HeaderProps) {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {showBack && (
        <TouchableOpacity
          onPress={onBack ? onBack : () => router.back()}
          style={styles.backIcon}
        >
          <Image source={images.close} style={{ width: 30, height: 30 }} />
        </TouchableOpacity>
      )}
      <Text style={styles.title}>{title}</Text>
      <View style={styles.rightElement}>{rightElement}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 8,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  backIcon: {
    position: "absolute",
    left: 10,
    padding: 4,
  },
  title: {
    fontSize: 22,
    fontFamily: "PoetsenOne-Regular",
  },
  rightElement: {
    position: "absolute",
    right: 12,
    bottom: 2,
  },
});
