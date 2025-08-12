import React, { useState } from "react";
import { View, StyleSheet, Text, Alert, Image } from "react-native";
import { Portal, Modal, Button, RadioButton } from "react-native-paper";
import * as ImagePicker from "expo-image-picker";
import { uploadFile } from "@/api/fileImageApi";

interface UpdateCellModalProps {
  visible: boolean;
  onDismiss: () => void;
  onActionSelect: (updateAction: string) => void; // nhận action key hoặc image URL
  setImage?: (imageUrl: string) => void; // optional for image updates
}

const UpdateCellModal: React.FC<UpdateCellModalProps> = ({
  visible,
  onDismiss,
  onActionSelect,
  setImage,
}) => {
  const [action, setAction] = useState<
    "position" | "growStage" | "healthStatus" | "image"
  >("position");
  const [imageUrl, setImageUrl] = useState<string>("");

  // khi action đổi
  const handleActionChange = async (value: string) => {
    const val = value as "position" | "growStage" | "healthStatus" | "image";
    setAction(val);
    onActionSelect(val); // luôn thông báo action key
    // nếu chọn image, mở picker và upload
    if (val === "image") {
      await pickAndUploadImage();
    }
  };

  // chọn ảnh và upload
  const pickAndUploadImage = async () => {
    try {
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.7,
      });
      if (res.canceled || !res.assets.length) {
        // nếu huỷ, quay về position
        setAction("position");
        onActionSelect("position");
        return;
      }
      const asset = res.assets[0];
      const uri = asset.uri;
      const name = uri.split("/").pop() || `photo.jpg`;

      // xác định MIME type
      const ext = name.split(".").pop()?.toLowerCase();
      const mimeType =
        ext === "png"
          ? "image/png"
          : ext === "jpg" || ext === "jpeg"
          ? "image/jpeg"
          : "application/octet-stream";

      const file = { uri, name, type: mimeType };
      const { result: url } = await uploadFile(file);
      setImageUrl(url);
      setImage?.(url); // chỉ gọi setImage với link
    } catch (err) {
      console.error("Image upload failed:", err);
      Alert.alert("Error", "Failed to pick or upload image.");
      setAction("position");
      onActionSelect("position");
    }
  };

  // đóng modal với kiểm tra image
  const handleClose = () => {
    if (action === "image" && !imageUrl) {
      Alert.alert("Validation", "Please select and upload an image first.");
      return;
    }
    onDismiss();
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={handleClose}
        contentContainerStyle={styles.container}
      >
        <Text style={styles.title}>Choose Update Action</Text>

        <RadioButton.Group onValueChange={handleActionChange} value={action}>
          <View style={styles.row}>
            <RadioButton value="position" />
            <Text>Position</Text>
          </View>
          <View style={styles.row}>
            <RadioButton value="growStage" />
            <Text>Grow Stage</Text>
          </View>
          <View style={styles.row}>
            <RadioButton value="healthStatus" />
            <Text>Health Status</Text>
          </View>
          <View style={styles.row}>
            <RadioButton value="image" />
            <Text>Image</Text>
          </View>
        </RadioButton.Group>

        {action === "image" && imageUrl ? (
          <View style={styles.imagePicker}>
            <Image source={{ uri: imageUrl }} style={styles.preview} />
          </View>
        ) : null}

        <Button mode="outlined" onPress={handleClose} style={styles.closeBtn}>
          Close
        </Button>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    margin: 20,
    padding: 24,
    borderRadius: 12,
  },
  title: {
    marginBottom: 16,
    fontSize: 16,
    fontWeight: "bold",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 6,
  },
  imagePicker: {
    height: 160,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 8,
    overflow: "hidden",
  },
  preview: {
    width: "100%",
    height: "100%",
  },
  closeBtn: {
    marginTop: 20,
  },
});

export default UpdateCellModal;
