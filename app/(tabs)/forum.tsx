import React, { useState, useEffect, useCallback } from "react";
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Fontisto } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import ImageModal from "@/components/ui/ImageModal";
import { fetchPosts, ListPostsParams, PostSummary } from "@/api/postApi";
import { useAppSelector } from "@/store/hooks";

// Import PostComponent
import PostComponent, { PostType } from "@/components/PostComponent";

type RawPost = PostSummary;

export default function SocialCommunityScreen() {
  const router = useRouter();
  const currentUser = useAppSelector((s) => s.auth.user);

  const [posts, setPosts] = useState<PostType[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [visibleImage, setVisibleImage] = useState<string | null>(null);

  const loadPosts = useCallback(async () => {
    setLoading(true);
    try {
      const params: ListPostsParams = {
        page: 0,
        size: 10,
        sortBy: "createdAt",
        sortDir: "desc",
      };
      const response = await fetchPosts(params);
      const rawPosts: RawPost[] = response.result;

      const mapped: PostType[] = rawPosts.map((p) => {
        const c = p.communityPostResponse;
        // calculate timeAgo based on createdAt
        const delta = Date.now() - new Date(c.createdAt).getTime();
        const mins = Math.floor(delta / 1000 / 60);
        const timeAgo =
          mins < 60
            ? `${mins}m ago`
            : mins < 1440
            ? `${Math.floor(mins / 60)}h ago`
            : `${Math.floor(mins / 1440)}d ago`;

        return {
          id: c.id,
          body: c.body,
          imageLink: c.imageLink,
          isLike: c.isLike,
          totalComment: c.totalComment,
          totalLike: c.totalLike,
          userName: c.userName || "Unknown",
          userAvatar:
            c.userLink ||
            "https://crowd-literature.eu/wp-content/uploads/2015/01/no-avatar.gif",
          userLink: c.userLink,
          createdAt: c.createdAt,
          timeAgo,
        } as PostType;
      });

      setPosts(mapped);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadPosts();
    } finally {
      setRefreshing(false);
    }
  }, [loadPosts]);

  const renderHeader = () => <></>;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <Text style={styles.title}>Social Community</Text>
        <TouchableOpacity onPress={() => router.push("/forum/history")}>
          <Text style={styles.link}>History</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.createPost}>
        <Image
          source={{
            uri:
              currentUser?.avatar_link ||
              "https://ui-avatars.com/api/?name=You",
          }}
          style={styles.avatarSmall}
        />
        <TouchableOpacity
          style={styles.inputWrapper}
          activeOpacity={0.7}
          onPress={() => router.push("/forum/create")}
        >
          <Text style={styles.inputPlaceholder}>What’s on your mind?</Text>
        </TouchableOpacity>
        <Fontisto
          name="plus-a"
          size={28}
          color="#333"
          onPress={() => router.push("/forum/create")}
        />
      </View>
      <View style={styles.separator} />
      {loading && !refreshing ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" />
        </View>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <PostComponent
              post={item}
              onComment={(id) => router.push(`/forum/${id}`)}
              onImagePress={(uri) => setVisibleImage(uri)}
            />
          )}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No posts available.</Text>
            </View>
          )}
        />
      )}

      <ImageModal
        visible={!!visibleImage}
        imageUri={visibleImage!}
        onClose={() => setVisibleImage(null)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fafafa" },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  title: { fontSize: 22, fontWeight: "700" },
  link: { color: "#0288D1", fontSize: 16 },

  createPost: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 8,
    marginHorizontal: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  avatarSmall: { width: 36, height: 36, borderRadius: 18, marginRight: 8 },
  inputWrapper: {
    flex: 1,
    backgroundColor: "#f0f0f0",
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  inputPlaceholder: { color: "#666", fontSize: 16 },

  listContent: { paddingBottom: 80, paddingHorizontal: 16 },
  separator: { height: 12 },

  loader: { flex: 1, justifyContent: "center", alignItems: "center" },

  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 50,
  },
  emptyText: { color: "#999", fontSize: 16 },
});
