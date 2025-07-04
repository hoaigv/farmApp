import React, { useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  AntDesign,
  Feather,
  FontAwesome5,
  MaterialIcons,
} from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";

import { useImageUploader } from "@/hook/useImageUploader";
import { useCreatePost } from "@/hook/useCreatePost";

export default function CreatePostScreen() {
  const [content, setContent] = useState("");
  const router = useRouter();

  const {
    imageUrl,
    uploading,
    pickAndUpload,
    clear: clearImage,
  } = useImageUploader();
  const { posting, makePost } = useCreatePost();

  const onSubmit = async () => {
    if (!content.trim()) return;
    const success = await makePost(content.trim(), imageUrl || undefined);
    if (success) {
      setContent("");
      clearImage();
      router.back();
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white px-4">
      {/* Header */}
      <View className="flex-row justify-between items-center py-4">
        <TouchableOpacity onPress={() => router.back()}>
          <AntDesign name="arrowleft" size={24} color="black" />
        </TouchableOpacity>
        <Text className="text-lg font-bold">New Post</Text>
        <TouchableOpacity
          onPress={onSubmit}
          disabled={!content.trim() || posting || uploading}
        >
          <Text
            className={`text-base font-semibold ${
              content.trim() && !posting && !uploading
                ? "text-[#3797EF]"
                : "text-gray-400"
            }`}
          >
            {posting ? <ActivityIndicator /> : "Post"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Caption Input & Preview */}
      <ScrollView className="flex-1">
        <TextInput
          className="text-lg text-black mb-4"
          placeholder="Write a caption..."
          placeholderTextColor="#aaa"
          value={content}
          onChangeText={setContent}
          multiline
          style={{ minHeight: 120, lineHeight: 22 }}
        />

        {imageUrl && (
          <View className="relative mb-4">
            <Image
              source={{ uri: imageUrl }}
              className="w-full h-72 rounded-2xl"
              resizeMode="cover"
            />
            <TouchableOpacity
              onPress={clearImage}
              className="absolute top-2 right-2 bg-white/80 p-1 rounded-full"
            >
              <AntDesign name="close" size={18} color="black" />
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Action Bar */}
      <View className="flex-row justify-around items-center py-3 border-t border-gray-200">
        <TouchableOpacity
          onPress={pickAndUpload}
          disabled={uploading || posting}
          className="items-center"
        >
          <Feather name="image" size={22} color="#3797EF" />
          <Text className="text-xs text-gray-600 mt-1">Photo </Text>
          {uploading && <ActivityIndicator size="small" />}
        </TouchableOpacity>
        <TouchableOpacity
          disabled={uploading || posting}
          className="items-center"
        >
          <MaterialIcons name="video-call" size={22} color="#F56040" />
          <Text className="text-xs text-gray-600 mt-1">Video</Text>
        </TouchableOpacity>
        <TouchableOpacity
          disabled={uploading || posting}
          className="items-center"
        >
          <FontAwesome5 name="hashtag" size={18} color="#A030F5" />
          <Text className="text-xs text-gray-600 mt-1">Tags</Text>
        </TouchableOpacity>
        <TouchableOpacity
          disabled={uploading || posting}
          className="items-center"
        >
          <Feather name="map-pin" size={20} color="#ED4956" />
          <Text className="text-xs text-gray-600 mt-1">Location</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
