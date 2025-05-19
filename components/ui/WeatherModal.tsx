import React from "react";
import { Modal, Text, TouchableOpacity, View } from "react-native";

interface WeatherModalProps {
  visible: boolean;
  onClose: () => void;
}

const WeatherModal: React.FC<WeatherModalProps> = ({ visible, onClose }) => {
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View className="flex-1 bg-black/40 justify-center items-center px-4">
        <View className="bg-white rounded-2xl w-full p-5">
          <Text className="text-lg font-bold text-center mb-3">
            Thời tiết hôm nay
          </Text>

          <View className="flex-col space-y-2">
            <Text>🌡️ Nhiệt độ: 30°C</Text>
            <Text>💧 Độ ẩm: 65%</Text>
            <Text>🌬️ Gió: 12 km/h</Text>
            <Text>🌅 Mặt trời mọc: 5:30 AM</Text>
            <Text>🌇 Mặt trời lặn: 6:10 PM</Text>
          </View>

          <TouchableOpacity
            onPress={onClose}
            className="mt-4 bg-primary py-2 rounded-xl items-center"
          >
            <Text className="text-white font-semibold">Đóng</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default WeatherModal;
