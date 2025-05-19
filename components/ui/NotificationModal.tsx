import React from "react";
import {
  FlatList,
  Image,
  Modal,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface NotificationModalProps {
  visible: boolean;
  onClose: () => void;
}

const notifications = [
  { id: "1", message: '🌿 Bạn đã hoàn thành "Tưới cây buổi sáng"' },
  { id: "2", message: "☀️ Ngày mai trời nắng, nên tưới cây sớm" },
  { id: "3", message: "🐛 Cảnh báo sâu bệnh ở cây cà chua" },
];

const NotificationModal: React.FC<NotificationModalProps> = ({
  visible,
  onClose,
}) => {
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View className="flex-1 bg-black/50 justify-center ">
        <View className="bg-white mx-4 rounded-2xl p-4">
          <View className="relative">
            <Text className="text-lg font-bold mb-2 text-center">
              Thông báo
            </Text>
            <TouchableOpacity className="absolute right-0 p-1 rounded-md shadow-sm border border-gray-500">
              <Text>Xoá tất cả</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={notifications}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View className=" flex-row items-center justify-between border-b border-gray-200 py-4">
                <Text className="text-base text-gray-800">
                  • {item.message}
                </Text>
                <TouchableOpacity>
                  <Image
                    source={require("../../assets/images/bin.png")}
                    style={{ width: 24, height: 24 }}
                  />
                </TouchableOpacity>
              </View>
            )}
          />

          <TouchableOpacity
            onPress={onClose}
            className="mt-4 bg-primary rounded-xl py-2 items-center"
          >
            <Text className="text-white font-semibold">Đóng</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default NotificationModal;
