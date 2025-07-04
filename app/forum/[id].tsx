import Header from "@/components/Header";
import React, { useEffect, useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  SafeAreaView,
  Image,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { fetchPostById } from "@/api/postApi";
import {
  createComment,
  CommentResponse,
  fetchComments,
} from "@/api/commentApi";
import PostComponent, { PostType } from "@/components/PostComponent";
import { useAppSelector } from "@/store/hooks";

const PostDetailScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const currentUser = useAppSelector((s) => s.auth.user);
  const [post, setPost] = useState<PostType | null>(null);
  const [newComment, setNewComment] = useState("");
  const [listComment, setListComment] = useState<CommentResponse[]>([]);
  const timeAgo = (dateString: string): string => {
    const now = new Date();
    const past = new Date(dateString);
    const diff = Math.floor((now.getTime() - past.getTime()) / 1000); // in seconds

    if (diff < 60) return `${diff} giây trước`;
    if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
    if (diff < 2592000) return `${Math.floor(diff / 86400)} ngày trước`;
    if (diff < 31536000) return `${Math.floor(diff / 2592000)} tháng trước`;
    return `${Math.floor(diff / 31536000)} năm trước`;
  };

  useEffect(() => {
    if (id) {
      fetchPostById(id)
        .then(({ result }) => {
          setPost({
            id: result.id,
            userAvatar:
              "https://crowd-literature.eu/wp-content/uploads/2015/01/no-avatar.gif",
            userName: result.userName || "Unknown",
            createdAt: result.createdAt,
            body: result.body,
            imageLink: result.imageLink || null,
            isLike: false,
            totalLike: 0,
            totalComment: result.commentCount,
          });
        })
        .catch((error) => {
          console.error("Error fetching post:", error);
        });
      fetchComments(id as string)
        .then(({ result }) => {
          setListComment(
            result.map((c) => ({
              id: c.id,
              postId: c.postId,
              userName: c.userName || "Anonymous",
              userLink: c.userLink || "",
              content: c.content,
              createdAt: c.createdAt,
            }))
          );
        })
        .catch((error) => {
          console.error("Error fetching comments:", error);
        });
    }
  }, [id]);

  const handleAddComment = async () => {
    const trimmed = newComment.trim();
    if (trimmed) {
      const response = await createComment({
        postId: id as string,
        content: trimmed,
      });
      const newCommentResponse: CommentResponse = {
        id: response.id,
        postId: id as string,
        userName: currentUser?.name || "Anonymous",
        userLink: currentUser?.avatar_link || "",
        content: trimmed,
        createdAt: new Date().toISOString(),
      };
      setListComment((prev) => [...prev, newCommentResponse]);
      // sẽ bổ sung khi triển khai comment
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
      <Header title="Post Details" />
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View className="flex-1 px-4 pt-4">
            <PostComponent
              post={post}
              onComment={() => {}}
              onImagePress={(uri) => {}}
            />

            {/* Hiding comments until ready */}
            {/* <Text className="text-base font-semibold mb-2">Comments</Text>
            ... */}
            <ScrollView
              className="flex-1"
              contentContainerStyle={{ paddingBottom: 20 }}
              showsVerticalScrollIndicator={false}
            >
              {listComment.map((comment) => (
                <View key={comment.id} className="flex-row items-start mb-4">
                  <Image
                    source={{
                      uri:
                        comment.userLink ||
                        "https://ui-avatars.com/api/?name=Anonymous",
                    }}
                    style={styles.avatarSmall}
                  />
                  <View className="ml-2 flex-1">
                    <Text className="font-semibold">{comment.userName}</Text>
                    <Text className="text-gray-700">{comment.content}</Text>
                    <Text className="text-xs text-gray-500">
                      {timeAgo(comment.createdAt)}
                    </Text>
                  </View>
                </View>
              ))}
            </ScrollView>

            <View className="flex-row items-center border border-gray-300 rounded-full px-4 py-2 mx-4 mb-4 bg-white">
              <Image
                source={{
                  uri:
                    currentUser?.avatar_link ||
                    "https://ui-avatars.com/api/?name=You",
                }}
                style={styles.avatarSmall}
              />
              <TextInput
                className="flex-1 ml-2"
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

const styles = {
  avatarSmall: { width: 32, height: 32, borderRadius: 16 },
};
