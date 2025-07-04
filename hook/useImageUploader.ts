// src/hooks/useImageUploader.ts
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import { Alert } from "react-native";
import { uploadFile, UploadFileResponse } from "@/api/fileImageApi";

export function useImageUploader() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const pickAndUpload = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission required",
        "You need to grant access to your photo library."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (result.canceled || result.assets.length === 0) return;

    try {
      setUploading(true);
      const asset = result.assets[0];
      const fileType = asset.uri.split(".").pop() || "jpg";
      const fileObj = {
        uri: asset.uri,
        name: `upload_${Date.now()}.${fileType}`,
        type: asset.type ? `${asset.type}/${fileType}` : `image/${fileType}`,
      } as any;

      // uploadFile returns { message: string; result: string } where result is URL
      const response: UploadFileResponse = await uploadFile(fileObj);
      const url = response.result;
      if (typeof url === "string") {
        setImageUrl(url);
      } else {
        console.error("Unexpected upload response", response);
        Alert.alert(
          "Upload error",
          "Failed to upload image. Please try again."
        );
      }
    } catch (err) {
      console.error("Upload failed", err);
      Alert.alert("Upload error", "Failed to upload image. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const clear = () => setImageUrl(null);

  return { imageUrl, uploading, pickAndUpload, clear };
}
