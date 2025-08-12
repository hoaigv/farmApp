// PostDetailScreen.tsx
import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Keyboard,
  Platform,
  SafeAreaView,
  ImageBackground,
  ActivityIndicator,
  StyleSheet,
  VirtualizedList,
} from "react-native";
import Header from "@/components/Header";
import PostComponent, { PostType } from "@/components/PostComponent";
import { useLocalSearchParams } from "expo-router";
import { useAppSelector } from "@/store/hooks";
import { fetchPostById, CommunityPostResponse } from "@/api/postApi";
import {
  fetchComments,
  createComment,
  CommentResponse,
} from "@/api/commentApi";

// Utility tính "time ago"
const timeAgo = (dateString: string): string => {
  const now = Date.now();
  const past = new Date(dateString).getTime();
  const diffSec = Math.floor((now - past) / 1000);
  if (diffSec < 60) return `${diffSec} giây trước`;
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)} phút trước`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)} giờ trước`;
  if (diffSec < 2592000) return `${Math.floor(diffSec / 86400)} ngày trước`;
  if (diffSec < 31536000) return `${Math.floor(diffSec / 2592000)} tháng trước`;
  return `${Math.floor(diffSec / 31536000)} năm trước`;
};

type WrappedItem =
  | { type: "header"; post: PostType }
  | { type: "comment"; comment: CommentResponse };

const PostDetailScreen: React.FC = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const currentUser = useAppSelector((s) => s.auth.user);

  const [post, setPost] = useState<PostType | null>(null);
  const [comments, setComments] = useState<CommentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");

  // Load post + comment
  useEffect(() => {
    if (!id) return;
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const pRes: CommunityPostResponse = await fetchPostById(id);
        const cRes = await fetchComments(id);
        if (!mounted) return;

        setPost({
          id: pRes.result.id,
          userAvatar: pRes.result.userLink || "",
          userName: pRes.result.userName || "Unknown",
          createdAt: pRes.result.createdAt,
          body: pRes.result.body || "",
          imageLink:
            pRes.result.imageLink ||
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSZfYb4CWzn9zbn-jLTwei46uk0dMEgMsh3gQ&s",
          isLike: pRes.result.isLike || false,
          totalLike: pRes.result.totalLike || 0,
          totalComment: cRes.result.length,
        });

        const formattedComments = cRes.result
          .map((c) => ({
            ...c,
            userName: c.userName || "Anonymous",
            userLink: c.userLink || "",
          }))
          .sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        setComments(formattedComments);
      } catch (err) {
        console.error(err);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [id]);

  // Thêm comment mới
  const handleAddComment = useCallback(async () => {
    if (!post || !newComment.trim()) return;
    try {
      const resp = await createComment({
        postId: post.id,
        content: newComment.trim(),
      });

      setComments((prev) => [
        {
          ...resp,
          content: newComment.trim(),
          userName: currentUser?.name || "Anonymous",
          userLink: currentUser?.avatar_link || "",
          createdAt: new Date().toISOString(),
        },
        ...prev,
      ]);

      setNewComment("");
    } catch (err) {
      console.error(err);
    }
  }, [newComment, post, currentUser]);

  // VirtualizedList helpers
  const getItemCount = (data: CommentResponse[]) =>
    post ? data.length + 1 : 0;

  const getItem = (data: CommentResponse[], index: number): WrappedItem => {
    if (index === 0) {
      return { type: "header", post: post! };
    }
    return { type: "comment", comment: data[index - 1] };
  };

  // Render từng item (header hoặc comment)
  const renderItem = ({ item }: { item: WrappedItem }) => {
    if (item.type === "header") {
      return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.headerContainer}>
            <PostComponent
              post={item.post}
              onComment={() => {}}
              onImagePress={() => {}}
              isDetail
            />
          </View>
        </TouchableWithoutFeedback>
      );
    } else {
      const c = item.comment;
      return (
        <View style={styles.commentContainer}>
          <Image
            source={{
              uri: c.userLink || "https://ui-avatars.com/api/?name=Anonymous",
            }}
            style={styles.avatarSmall}
          />
          <View style={styles.commentTextWrapper}>
            <Text style={styles.commentAuthor}>{c.userName}</Text>
            <Text style={styles.commentContent}>{c.content}</Text>
            <Text style={styles.commentTime}>{timeAgo(c.createdAt)}</Text>
          </View>
        </View>
      );
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loaderContainer}>
        <ActivityIndicator size="large" />
        <Text>Loading post...</Text>
      </SafeAreaView>
    );
  }

  return (
    <ImageBackground
      source={require("../../assets/images/backgournd.png")}
      style={styles.background}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.flex1}>
        <Header title="Post Details" />
        <KeyboardAvoidingView
          style={styles.flex1}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <VirtualizedList<WrappedItem>
            data={comments}
            initialNumToRender={10}
            getItemCount={getItemCount}
            getItem={getItem}
            keyExtractor={(item, index) =>
              item.type === "header"
                ? "post-header"
                : item.comment.id + "-" + index
            }
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            keyboardShouldPersistTaps="handled"
          />

          {/* Input thêm comment */}
          <View style={styles.commentInputContainer}>
            <Image
              source={{
                uri:
                  currentUser?.avatar_link ||
                  "https://ui-avatars.com/api/?name=You",
              }}
              style={styles.avatarSmall}
            />
            <TextInput
              style={styles.input}
              placeholder="Write a comment..."
              value={newComment}
              onChangeText={setNewComment}
              onSubmitEditing={handleAddComment}
              returnKeyType="send"
            />
            <TouchableOpacity onPress={handleAddComment}>
              <Text style={styles.sendText}>Send</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ImageBackground>
  );
};

export default React.memo(PostDetailScreen);

const styles = StyleSheet.create({
  flex1: { flex: 1 },
  background: { flex: 1 },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  headerContainer: { padding: 16 },
  listContent: { paddingBottom: 80 },
  commentContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 12,
    borderRadius: 8,
  },
  avatarSmall: { width: 32, height: 32, borderRadius: 16 },
  commentTextWrapper: { marginLeft: 8, flex: 1 },
  commentAuthor: { fontWeight: "600" },
  commentContent: { marginTop: 4 },
  commentTime: { marginTop: 4, fontSize: 12, color: "#888" },
  commentInputContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderColor: "black",
    marginHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  input: { flex: 1, marginHorizontal: 8, paddingVertical: 8 },
  sendText: { color: "#007AFF", fontWeight: "600" },
});
