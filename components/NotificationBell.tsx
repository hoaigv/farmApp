import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import NotificationModal from "./ui/NotificationModal";

const NotificationBell = () => {
  const [visible, setVisible] = useState(false);

  return (
    <>
      <TouchableOpacity onPress={() => setVisible(true)}>
        <View className="bg-primary rounded-full px-2 py-2 relative mr-2 border-gray-300 shadow-sm">
          <MaterialCommunityIcons name="bell" size={22} color="white" />
          <View
            className="absolute bg-red-600 rounded-full items-center justify-center"
            style={{
              top: -6,
              right: -6,
              minWidth: 18,
              height: 18,
              paddingHorizontal: 2,
            }}
          >
            <Text className="text-[10px] text-white font-bold">0</Text>
          </View>
        </View>
      </TouchableOpacity>

      <NotificationModal visible={visible} onClose={() => setVisible(false)} />
    </>
  );
};

export default NotificationBell;
