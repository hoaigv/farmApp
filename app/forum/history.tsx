// src/screens/HistoryScreen.tsx
import Header from "@/components/Header";
import { AntDesign, SimpleLineIcons } from "@expo/vector-icons";
import React, { useState, useEffect } from "react";
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { fetchMyPosts, MyPostsFilters, PostSummary } from "@/api/postApi";
import { useRouter } from "expo-router";

const FILTERS = [
  { key: "posts", label: "Your Posts" },
  { key: "liked", label: "Liked" },
  { key: "commented", label: "Commented" },
];

const SORT_OPTIONS = [
  { key: "newest", label: "Newest" },
  { key: "oldest", label: "Oldest" },
];

type RawPost = {
  id: string;
  body: string;
  imageLink?: string;
  isLike?: boolean;
  totalComment?: number;
  totalLike?: number;
  userName?: string;
  userLink?: string;
  createdAt: string;
};

type HistoryItem = RawPost & {
  type: "post" | "liked" | "commented";
};

const HistoryScreen = () => {
  const [activeFilter, setActiveFilter] = useState<string>("posts");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [data, setData] = useState<RawPost[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    setLoading(true);
    const loadHistory = async () => {
      try {
        const filters: MyPostsFilters = {
          sortBy: "createdAt",
          sortDir: sortOrder === "newest" ? "desc" : "asc",
        };
        if (activeFilter === "liked") filters.isLike = true;
        else if (activeFilter === "commented") filters.isComment = true;

        const response = await fetchMyPosts(filters);
        setData(response.result as unknown as RawPost[]);
      } catch (err) {
        console.error("Error fetching history:", err);
      } finally {
        setLoading(false);
      }
    };
    loadHistory();
  }, [activeFilter, sortOrder]);

  const historyItems: HistoryItem[] = data.map((post) => ({
    ...post,
    type:
      activeFilter === "liked"
        ? "liked"
        : activeFilter === "commented"
        ? "commented"
        : "post",
  }));

  const renderFilter = ({ label, key }: any) => (
    <TouchableOpacity
      key={key}
      style={[styles.filterBtn, activeFilter === key && styles.filterBtnActive]}
      onPress={() => setActiveFilter(key)}
    >
      <Text
        style={[
          styles.filterText,
          activeFilter === key && styles.filterTextActive,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderSort = ({ label, key }: any) => (
    <TouchableOpacity
      key={key}
      style={styles.sortOption}
      onPress={() => setSortOrder(key)}
    >
      <Text style={styles.sortText}>{label}</Text>
      {sortOrder === key && (
        <AntDesign name="check" size={16} color="#2E7D32" />
      )}
    </TouchableOpacity>
  );

  const renderItem = ({ item }: { item: HistoryItem }) => {
    const post = item; // RawPost
    return (
      <TouchableOpacity
        onPress={() => router.push(`/forum/${post.id}`)}
        style={styles.card}
      >
        {post.imageLink && (
          <Image source={{ uri: post.imageLink }} style={styles.thumbnail} />
        )}
        <View style={styles.cardContent}>
          <Text numberOfLines={2} style={styles.cardBody}>
            {post.body}
          </Text>
          <View style={styles.cardFooter}>
            <Text style={styles.cardTime}>
              {new Date(post.createdAt).toLocaleDateString()}
            </Text>
            <View style={styles.stats}>
              <AntDesign name="like2" size={14} color="#757575" />
              <Text style={styles.statText}>{post.totalLike ?? 0}</Text>
              <SimpleLineIcons name="bubble" size={14} color="#757575" />
              <Text style={styles.statText}>{post.totalComment ?? 0}</Text>
            </View>
          </View>
        </View>
        <TouchableOpacity style={styles.moreBtn}>
          <SimpleLineIcons name="options-vertical" size={20} color="#2E7D32" />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="History" />
      <View style={styles.filterContainer}>{FILTERS.map(renderFilter)}</View>
      <View style={styles.sortContainer}>{SORT_OPTIONS.map(renderSort)}</View>
      {loading ? (
        <ActivityIndicator size="large" color="#2E7D32" style={{ flex: 1 }} />
      ) : (
        <FlatList
          data={historyItems}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 20 }}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No items found</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F1F8E9", paddingHorizontal: 8 },
  filterContainer: { flexDirection: "row", marginBottom: 12, marginTop: 8 },
  filterBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: "white",
    borderRadius: 20,
    marginRight: 8,
  },
  filterBtnActive: { backgroundColor: "#A5D6A7" },
  filterText: { color: "#2E7D32" },
  filterTextActive: { color: "white", fontWeight: "bold" },
  sortContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  sortOption: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
  },
  sortText: { color: "#2E7D32", marginRight: 4 },
  card: {
    flexDirection: "row",
    backgroundColor: "white",
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 12,
    elevation: 2,
  },
  thumbnail: { width: 80, height: 80 },
  cardContent: { flex: 1, padding: 8, justifyContent: "space-between" },
  cardBody: { fontSize: 14, color: "#424242", marginTop: 4 },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  cardTime: { fontSize: 12, color: "#757575" },
  stats: { flexDirection: "row", alignItems: "center" },
  statText: { marginLeft: 4, marginRight: 12, fontSize: 12, color: "#757575" },
  moreBtn: { padding: 8, justifyContent: "center" },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 40,
  },
  emptyText: { color: "#757575", fontSize: 16 },
});

export default HistoryScreen;
