import { Entypo, MaterialIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import WeatherModal from "./ui/WeatherModal";

const WeatherCard = () => {
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <>
      <TouchableOpacity
        className="flex-row items-center bg-white px-3 py-1 rounded-lg "
        onPress={() => setModalVisible(true)}
      >
        <View className="bg-primary rounded-full p-1 mr-2">
          <Entypo name="location-pin" size={24} color="white" />
        </View>
        <View className="flex-col">
          <Text
            className="text-base font-bold text-gray-800"
            style={{ fontFamily: "PoetsenOne-Regular" }}
          >
            Đà Nẵng
          </Text>
          <Text className="text-sm text-gray-600">☀️ 30°C - Sunny</Text>
        </View>
        <MaterialIcons
          name="keyboard-arrow-down"
          size={20}
          color="#333"
          className="ml-1"
        />
      </TouchableOpacity>

      <WeatherModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
      />
    </>
  );
};

export default WeatherCard;
