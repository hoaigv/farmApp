import {
  AntDesign,
  Feather,
  FontAwesome5,
  MaterialIcons,
} from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const CreatePostScreen = () => {
  const [content, setContent] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const router = useRouter();

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled && result.assets.length > 0) {
      setImage(result.assets[0].uri);
    }
  };

  const handlePost = () => {
    if (!content.trim()) return;
    Alert.alert("Posted", "Your post has been shared!");
    setContent("");
    setImage(null);
  };

  return (
    <SafeAreaView className="flex-1 bg-white px-4">
      {/* Header */}
      <View className="flex-row justify-between items-center py-4">
        <TouchableOpacity onPress={() => router.back()}>
          <AntDesign name="arrowleft" size={24} color="black" />
        </TouchableOpacity>
        <Text className="text-lg font-bold">New Post</Text>
        <TouchableOpacity onPress={handlePost} disabled={!content.trim()}>
          <Text
            className={`text-base font-semibold ${
              content.trim() ? "text-[#3797EF]" : "text-gray-400"
            }`}
          >
            Post
          </Text>
        </TouchableOpacity>
      </View>

      {/* User Info */}
      <View className="flex-row items-center mb-3">
        <Image
          source={{
            uri: "https://randomuser.me/api/portraits/men/1.jpg",
          }}
          className="w-10 h-10 rounded-full mr-3"
        />
        <View>
          <Text className="font-semibold text-base">Your Profile</Text>
          <View className="flex-row items-center">
            <Feather name="globe" size={14} color="#888" />
            <Text className="text-gray-500 text-xs ml-1">Public</Text>
          </View>
        </View>
      </View>

      {/* Caption Input */}
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

        {/* Image Preview */}
        {image && (
          <View className="relative mb-4">
            <Image
              source={{ uri: image }}
              className="w-full h-72 rounded-2xl"
              resizeMode="cover"
            />
            <TouchableOpacity
              className="absolute top-2 right-2 bg-white/80 p-1 rounded-full"
              onPress={() => setImage(null)}
            >
              <AntDesign name="close" size={18} color="black" />
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Action Bar (Instagram-like) */}
      <View className="flex-row justify-around items-center py-3 border-t border-gray-200">
        <TouchableOpacity onPress={handlePickImage} className="items-center">
          <Feather name="image" size={22} color="#3797EF" />
          <Text className="text-xs text-gray-600 mt-1">Photo</Text>
        </TouchableOpacity>
        <TouchableOpacity className="items-center">
          <MaterialIcons name="video-call" size={22} color="#F56040" />
          <Text className="text-xs text-gray-600 mt-1">Video</Text>
        </TouchableOpacity>
        <TouchableOpacity className="items-center">
          <FontAwesome5 name="hashtag" size={18} color="#A030F5" />
          <Text className="text-xs text-gray-600 mt-1">Tags</Text>
        </TouchableOpacity>
        <TouchableOpacity className="items-center">
          <Feather name="map-pin" size={20} color="#ED4956" />
          <Text className="text-xs text-gray-600 mt-1">Location</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default CreatePostScreen;
