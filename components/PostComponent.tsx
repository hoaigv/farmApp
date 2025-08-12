import React, { useState } from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { AntDesign, FontAwesome } from "@expo/vector-icons";
import { createLike, deletePosts } from "@/api/likeApi";

export type PostType = {
  id: string;
  userAvatar: string;
  userName: string;
  createdAt: string; // ISO timestamp
  body: string;
  imageLink?: string | null;
  isLike: boolean;
  totalLike: number;
  totalComment: number;
};

type Props = {
  post: PostType;
  onComment: (id: string) => void;
  onImagePress: (uri: string) => void;
  isDetail?: boolean; // Optional prop to indicate if this is a detailed view
};

export default function PostComponent({
  post,
  onComment,
  onImagePress,
  isDetail = false,
}: Props) {
  const { id, userAvatar, userName, createdAt, body, imageLink, totalComment } =
    post;

  // compute timeAgo
  const delta = Date.now() - new Date(createdAt).getTime();
  const mins = Math.floor(delta / 1000 / 60);
  const timeAgo =
    mins < 60
      ? `${mins}m ago`
      : mins < 1440
      ? `${Math.floor(mins / 60)}h ago`
      : `${Math.floor(mins / 1440)}d ago`;

  // Local like state
  const [isLike, setIsLike] = useState(post.isLike);
  const [likeCount, setLikeCount] = useState(post.totalLike);

  const preview = isDetail
    ? body
    : body.length > 100
    ? body.slice(0, 100) + "..."
    : body;

  const handleLike = async () => {
    try {
      if (isLike) {
        await deletePosts(id);
        setIsLike(false);
        setLikeCount((prev) => prev - 1);
      } else {
        await createLike({ postId: id });
        setIsLike(true);
        setLikeCount((prev) => prev + 1);
      }
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Image
          source={{
            uri: userAvatar
              ? userAvatar
              : "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSZfYb4CWzn9zbn-jLTwei46uk0dMEgMsh3gQ&s",
          }}
          style={styles.avatar}
        />
        <View style={styles.headerText}>
          <Text style={styles.username}>{userName}</Text>
          <Text style={styles.time}>{timeAgo}</Text>
        </View>
      </View>

      <Text style={styles.content}>{preview}</Text>

      {imageLink ? (
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => onImagePress(imageLink)}
        >
          <Image source={{ uri: imageLink }} style={styles.postImage} />
        </TouchableOpacity>
      ) : null}

      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionBtn} onPress={handleLike}>
          <AntDesign
            name={isLike ? "heart" : "hearto"}
            size={24}
            color={isLike ? "red" : "#333"}
          />
          <Text style={styles.actionText}>{likeCount}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => onComment(id)}
        >
          <FontAwesome name="comment-o" size={24} color="#333" />
          <Text style={styles.actionText}>{totalComment}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    marginBottom: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  headerText: {
    marginLeft: 12,
  },
  username: {
    fontWeight: "600",
    fontSize: 16,
  },
  time: {
    color: "#999",
    fontSize: 12,
    marginTop: 2,
  },
  content: {
    fontSize: 14,
    color: "#333",
    marginBottom: 12,
    lineHeight: 20,
  },
  postImage: {
    width: "100%",
    height: 180,
    borderRadius: 12,
    marginBottom: 12,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-start",
    gap: 24,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
  },
  actionText: {
    marginLeft: 6,
    fontSize: 14,
    color: "#333",
  },
});
