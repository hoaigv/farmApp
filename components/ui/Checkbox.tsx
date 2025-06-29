import React from "react";
import { TouchableOpacity, StyleSheet, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

interface CheckboxProps {
  checked: boolean;
  onChange: () => void;
  size?: number;
  color?: string;
}

const Checkbox: React.FC<CheckboxProps> = ({
  checked,
  onChange,
  size = 24,
  color = "#007AFF",
}) => {
  return (
    <TouchableOpacity
      onPress={onChange}
      style={[styles.container, { width: size, height: size }]}
    >
      <View style={[styles.box, checked && { backgroundColor: color }]}>
        {checked && (
          <Ionicons name="checkmark" size={size * 0.8} color="#fff" />
        )}
      </View>
    </TouchableOpacity>
  );
};

export default Checkbox;

const styles = StyleSheet.create({
  container: {
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  box: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: "#ccc",
    justifyContent: "center",
    alignItems: "center",
  },
});
