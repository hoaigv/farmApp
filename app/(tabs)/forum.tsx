import React, { useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  RefreshControl,
  ImageBackground,
  SafeAreaView,
} from "react-native";
import AntDesign from "@expo/vector-icons/AntDesign";
import { useRouter } from "expo-router";
import ImageModal from "@/components/ui/ImageModal";
import { fetchPosts, ListPostsParams, PostSummary } from "@/api/postApi";
import { useAppSelector } from "@/store/hooks";
import Header from "@/components/Header";
import PostComponent, { PostType } from "@/components/PostComponent";

type RawPost = PostSummary;

export default function SocialCommunityScreen() {
  const router = useRouter();
  const currentUser = useAppSelector((s) => s.auth.user);

  const [posts, setPosts] = useState<PostType[]>([]);
  const [page, setPage] = useState(0);
  const [size] = useState(3);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [visibleImage, setVisibleImage] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const loadPosts = useCallback(
    async (nextPage = 0) => {
      // nextPage === 0 => initial load or refresh
      if (nextPage === 0) setLoading(true);
      else setLoadingMore(true);

      try {
        const params: ListPostsParams = {
          page: nextPage,
          size,
          sortBy: "createdAt",
          sortDir: "desc",
        };
        const response = await fetchPosts(params);
        const rawPosts: RawPost[] = response.result;

        const mapped: PostType[] = rawPosts.map((p) => {
          const c = p.communityPostResponse;
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

        if (nextPage === 0) {
          setPosts(mapped);
        } else {
          setPosts((prev) => [...prev, ...mapped]);
        }

        setHasMore(mapped.length === size);
        setPage(nextPage);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
        setRefreshing(false);
        setLoadingMore(false);
      }
    },
    [size]
  );

  // Reload posts each time screen gains focus
  useFocusEffect(
    useCallback(() => {
      loadPosts(0);
    }, [loadPosts])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadPosts(0);
  }, [loadPosts]);

  const loadMorePosts = useCallback(() => {
    if (!loadingMore && hasMore) {
      loadPosts(page + 1);
    }
  }, [loadingMore, hasMore, loadPosts, page]);

  return (
    <ImageBackground
      source={require("../../assets/images/backgournd.png")}
      style={styles.flex1}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.container}>
        <Header title="Community" showBack={false} />
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
          <TouchableOpacity
            onPress={() => router.push("/forum/search")}
            style={styles.iconButton}
          >
            <AntDesign name="search1" size={24} color="black" />
          </TouchableOpacity>
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
            onEndReached={loadMorePosts}
            onEndReachedThreshold={0.5}
            ListFooterComponent={() =>
              loadingMore ? (
                <ActivityIndicator style={styles.loaderMore} />
              ) : null
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
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  flex1: { flex: 1 },
  container: { flex: 1 },
  createPost: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
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
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  inputPlaceholder: { color: "#666", fontSize: 16 },
  iconButton: { paddingHorizontal: 16 },
  listContent: { paddingBottom: 80, paddingHorizontal: 16 },
  separator: { height: 12 },
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },
  loaderMore: { marginVertical: 16 },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 50,
  },
  emptyText: { color: "#999", fontSize: 16 },
});
