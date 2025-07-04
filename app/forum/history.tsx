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

type HistoryItem = PostSummary & {
  type: "post" | "liked" | "commented";
};

const HistoryScreen = () => {
  const [activeFilter, setActiveFilter] = useState<string>("posts");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [data, setData] = useState<PostSummary[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    setLoading(true);
    const loadHistory = async () => {
      try {
        // Chuẩn bị filter cho API (không bao gồm sort)
        const filters: MyPostsFilters = {};
        if (activeFilter === "liked") {
          filters.isLike = true;
        } else if (activeFilter === "commented") {
          filters.isComment = true;
        }

        // Gọi API với query params
        const { result } = await fetchMyPosts(filters);

        // Sort tại client theo createdAt
        const sortedItems = result.sort((a, b) => {
          const timeA = new Date(a.createdAt).getTime();
          const timeB = new Date(b.createdAt).getTime();
          return sortOrder === "newest" ? timeB - timeA : timeA - timeB;
        });

        setData(sortedItems);
      } catch (err) {
        console.error("Error fetching history:", err);
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, [activeFilter, sortOrder]);

  // Gán type cho từng item
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

  const renderItem = ({ item }: { item: HistoryItem }) => (
    <TouchableOpacity
      onPress={() => router.push(`/forum/${item.id}`)}
      style={styles.card}
    >
      {item.imageLink && (
        <Image source={{ uri: item.imageLink }} style={styles.thumbnail} />
      )}
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{item.title}</Text>
        <Text numberOfLines={2} style={styles.cardBody}>
          {item.body}
        </Text>
        <View style={styles.cardFooter}>
          <Text style={styles.cardTime}>
            {new Date(item.createdAt).toLocaleDateString()}
          </Text>
        </View>
      </View>
      <TouchableOpacity style={styles.moreBtn}>
        <SimpleLineIcons name="options-vertical" size={20} color="#2E7D32" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

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
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F1F8E9", paddingHorizontal: 4 },
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
  cardTitle: { fontSize: 16, fontWeight: "600", color: "#2E7D32" },
  cardBody: { fontSize: 14, color: "#424242", marginTop: 4 },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  cardTime: { fontSize: 12, color: "#757575" },
  stats: { flexDirection: "row", alignItems: "center" },
  statText: { marginLeft: 4, fontSize: 12, color: "#757575" },
  moreBtn: { padding: 8, justifyContent: "center" },
});

export default HistoryScreen;
