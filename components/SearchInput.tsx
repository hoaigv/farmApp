// components/SearchInput.tsx
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { TextInput, TouchableOpacity, View } from "react-native";

interface SearchInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onClear: () => void;
}

const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChangeText,
  onClear,
}) => {
  return (
    <View>
      {/* Search box */}
      <View className="bg-gray-100  p-4 rounded-lg min-w-80 flex-row gap-2">
        <Ionicons name="search" size={18} color="gray" />
        <TextInput
          className=""
          placeholder="What are you looking for?"
          placeholderTextColor="#999"
          value={value}
          onChangeText={onChangeText}
          returnKeyType="search"
        />
        {value.length > 0 && (
          <TouchableOpacity onPress={onClear}>
            <Ionicons name="close-circle" size={18} color="#aaa" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default SearchInput;
