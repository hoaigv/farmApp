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
  onClearAll?: () => void;
  onDeleteItem?: (id: string) => void;
}

const NotificationModal: React.FC<NotificationModalProps> = ({
  visible,
  onClose,
  onClearAll,
  onDeleteItem,
}) => {
  // Empty list by default
  const notifications: { id: string; message: string }[] = [];

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View className="flex-1 bg-black/60 justify-center items-center">
        <View className="bg-white w-11/12 max-h-3/4 rounded-2xl p-6 shadow-lg">
          {/* Header */}
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-xl font-semibold text-gray-900">
              Notifications
            </Text>
            <TouchableOpacity
              onPress={onClearAll}
              className="px-3 py-1 rounded-md border border-gray-300 bg-gray-100"
            >
              <Text className="text-sm text-gray-700">Clear All</Text>
            </TouchableOpacity>
          </View>

          {/* Notification List or Empty State */}
          {notifications.length === 0 ? (
            <View className="py-10 items-center">
              <Text className="text-gray-500">No notifications</Text>
            </View>
          ) : (
            <FlatList
              data={notifications}
              keyExtractor={(item) => item.id}
              className="flex-grow"
              renderItem={({ item }) => (
                <View className="flex-row items-center justify-between border-b border-gray-200 py-3">
                  <Text className="flex-1 text-base text-gray-800">
                    • {item.message}
                  </Text>
                  <TouchableOpacity onPress={() => onDeleteItem?.(item.id)}>
                    <Image
                      source={require("../../assets/images/bin.png")}
                      style={{ width: 20, height: 20 }}
                    />
                  </TouchableOpacity>
                </View>
              )}
            />
          )}

          {/* Close Button */}
          <TouchableOpacity
            onPress={onClose}
            className="mt-6 bg-blue-600 rounded-lg py-3 items-center"
          >
            <Text className="text-white text-base font-medium">Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default NotificationModal;
