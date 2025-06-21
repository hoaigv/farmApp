import React from "react";
import { TouchableOpacity, Text } from "react-native";
import { AntDesign } from "@expo/vector-icons";

interface FloatingButtonProps {
  text: string;
  onPress: () => void;
}

const FloatingButton: React.FC<FloatingButtonProps> = ({ text, onPress }) => {
  return (
    <TouchableOpacity
      className="flex-row items-center gap-2 bg-primary  mx-3 p-3 rounded-md"
      onPress={onPress}
    >
      <AntDesign name="plus" size={24} color="white" />
      <Text className="text-white font-bold text-lg">{text}</Text>
    </TouchableOpacity>
  );
};

export default FloatingButton;
