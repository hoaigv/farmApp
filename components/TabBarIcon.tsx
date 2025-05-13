// components/TabBarIcon.tsx
import { AntDesign, FontAwesome, Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

type IconSet = "AntDesign" | "Ionicons" | "FontAwesome";

const ICON_SETS = {
  AntDesign,
  Ionicons,
  FontAwesome,
};

interface TabBarIconProps {
  iconSet?: IconSet;
  name: string;
  color?: string;
  size: number;
  label?: string;
  focused?: boolean;
}

export default function TabBarIcon({
  iconSet = "AntDesign",
  name,
  size,
  label,
  focused = false,
}: TabBarIconProps) {
  const IconComponent = ICON_SETS[iconSet];

  const activeColor = "white";
  const inactiveColor = "#00C897";
  const backgroundColor = focused ? "#00C897" : "transparent";

  return (
    <View style={styles.wrapper}>
      <View
        style={[
          styles.iconContainer,
          focused && styles.focusedContainer,
          { backgroundColor },
        ]}
      >
        <IconComponent
          name={name as any}
          size={size}
          color={focused ? activeColor : inactiveColor}
        />
      </View>
      {label && (
        <Text
          style={[
            styles.label,
            {
              color: focused ? "#00C897" : "#00C897", // bạn có thể thay đổi nếu muốn active khác inactive
              fontWeight: focused ? "bold" : "normal",
            },
          ]}
        >
          {label}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: "center",
    justifyContent: "center",
    width: 60,
    height: 60,
  },
  iconContainer: {
    padding: 10,
    borderRadius: 25,
  },
  focusedContainer: {
    backgroundColor: "#00C897",
  },
  label: {
    fontSize: 12,
    marginTop: 4,
  },
});
