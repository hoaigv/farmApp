// CommentItem.tsx
import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";

interface CommentItemProps {
  userName: string;
  userLink?: string;
  content: string;
  createdAt: string;
}

const timeAgo = (timestamp: string): string => {
  const now = new Date();
  const created = new Date(timestamp);
  const diffSec = Math.floor((now.getTime() - created.getTime()) / 1000);
  if (diffSec < 60) return `${diffSec} giây trước`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} phút trước`;
  const diffHrs = Math.floor(diffMin / 60);
  if (diffHrs < 24) return `${diffHrs} giờ trước`;
  const diffDays = Math.floor(diffHrs / 24);
  return `${diffDays} ngày trước`;
};

const CommentItem: React.FC<CommentItemProps> = ({
  userName,
  userLink,
  content,
  createdAt,
}) => {
  const avatarUri = userLink?.trim() || "";
  return (
    <View style={styles.container}>
      <Image
        source={{
          uri: avatarUri || "https://ui-avatars.com/api/?name=Anonymous",
        }}
        style={styles.avatar}
      />
      <View style={styles.textWrapper}>
        <Text style={styles.author}>{userName}</Text>
        <Text style={styles.content}>{content}</Text>
        <Text style={styles.time}>{timeAgo(createdAt)}</Text>
      </View>
    </View>
  );
};

export default React.memo(CommentItem);

const styles = StyleSheet.create({
  container: { flexDirection: "row", marginVertical: 8, paddingHorizontal: 10 },
  avatar: { width: 40, height: 40, borderRadius: 20, marginRight: 10 },
  textWrapper: { flex: 1 },
  author: { fontWeight: "bold", fontSize: 14 },
  content: { fontSize: 14, marginVertical: 2 },
  time: { fontSize: 12, color: "gray" },
});
