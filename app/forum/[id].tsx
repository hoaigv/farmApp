import Header from "@/components/Header";
import React, { useEffect, useState } from "react";
import {
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type PostTypes = {
  id: string;
  user: {
    name: string;
    avatar: string;
  };
  content: string;
  image: any;
  time: string;
};

const mockPost: PostTypes = {
  id: "1",
  user: {
    name: "John Doe",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
  },
  content:
    "My tomato plant is wilting. Does anyone know why this might be happening?",
  image: {
    uri: "https://images.unsplash.com/photo-1602524201344-8244f9d8d10e?auto=format&fit=crop&w=800&q=80",
  },
  time: "3 hours ago",
};

const PostDetailScreen = () => {
  const [post, setPost] = useState<PostTypes | null>(null);
  const [comments, setComments] = useState<string[]>([]);
  const [newComment, setNewComment] = useState("");

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setPost(mockPost);
      setComments([
        "Looks like it's lacking water.",
        "Check if the soil is waterlogged.",
      ]);
    }, 500);
  }, []);

  const handleAddComment = () => {
    const trimmed = newComment.trim();
    if (trimmed.length > 0) {
      setComments([...comments, trimmed]);
      setNewComment("");
    }
  };

  if (!post) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-white">
        <Text className="text-base text-gray-500">Loading post...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <Header title="Post Details" />
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View className="flex-1 px-4 pt-4">
            {/* Post content */}
            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={{ paddingBottom: 20 }}
              showsVerticalScrollIndicator={false}
            >
              <View className="bg-white rounded-xl shadow p-4 mb-4 border border-gray-100">
                <View className="flex-row items-center mb-2">
                  <Image
                    source={{ uri: post.user.avatar }}
                    className="w-10 h-10 rounded-full mr-2"
                  />
                  <View>
                    <Text className="font-semibold">{post.user.name}</Text>
                    <Text className="text-xs text-gray-500">{post.time}</Text>
                  </View>
                </View>

                <Text className="text-sm mb-3">{post.content}</Text>

                <Image
                  source={post.image}
                  className="w-full h-48 rounded-lg mb-3"
                  resizeMode="cover"
                />
              </View>

              {/* Comments section */}
              <Text className="text-base font-semibold mb-2">Comments</Text>
              {comments.map((comment, index) => (
                <Text key={index} className="text-gray-800 mb-2">
                  • {comment}
                </Text>
              ))}
            </ScrollView>

            {/* Input section */}
            <View className="flex-row items-center border border-gray-300 rounded-full px-4 py-2 mx-4 mb-4 bg-white">
              <TextInput
                className="flex-1"
                placeholder="Write a comment..."
                value={newComment}
                onChangeText={setNewComment}
                onSubmitEditing={handleAddComment}
                returnKeyType="send"
              />
              <TouchableOpacity onPress={handleAddComment}>
                <Text className="text-blue-600 font-medium ml-2">Send</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default PostDetailScreen;
