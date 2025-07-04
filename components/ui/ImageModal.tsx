import React from "react";
import { Modal, Image, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface ImageModalProps {
  visible: boolean;
  imageUri: string;
  onClose: () => void;
}

const ImageModal: React.FC<ImageModalProps> = ({
  visible,
  imageUri,
  onClose,
}) => {
  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View className="flex-1 bg-black/60 justify-center items-center px-4">
        <View className="relative bg-white rounded-2xl w-full max-w-md overflow-hidden">
          {/* Close button ở góc phải trên cùng */}
          <TouchableOpacity
            onPress={onClose}
            className="absolute top-3 right-3 z-10 bg-black/20 rounded-full p-2"
          >
            <Text className="text-white text-lg font-bold">×</Text>
          </TouchableOpacity>

          {/* Image hiển thị */}
          <Image
            source={{ uri: imageUri }}
            className="w-full h-80 bg-gray-200"
            resizeMode="contain"
          />
        </View>
      </View>
    </Modal>
  );
};

export default ImageModal;
