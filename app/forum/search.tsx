import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  Keyboard,
  ImageBackground,
} from "react-native";
import { useRouter } from "expo-router";
import { fetchPosts, ListPostsParams, PostSummary } from "@/api/postApi";
import Header from "@/components/Header";

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debounced;
}

// Max characters to show in the body preview
const MAX_BODY_LENGTH = 100;

export default function SearchPostScreen() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 500);
  const [posts, setPosts] = useState<PostSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = useCallback(async (text: string) => {
    if (!text.trim()) {
      setError(null);
      setPosts([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const params: ListPostsParams & { body: string } = {
        page: 0,
        size: 10,
        sortBy: "createdAt",
        sortDir: "desc",
        body: text.trim(),
      };
      const response = await fetchPosts(params);
      const raw: PostSummary[] = response.result;
      if (raw.length === 0) {
        setError(`No results found for “${text}”.`);
        setPosts([]);
      } else {
        setPosts(raw);
      }
    } catch {
      setError("An error occurred. Please try again.");
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    handleSearch(debouncedQuery);
  }, [debouncedQuery, handleSearch]);

  const renderItem = useCallback(
    ({ item }: { item: PostSummary }) => {
      const fullBody = item.communityPostResponse.body;
      const truncatedBody =
        fullBody.length > MAX_BODY_LENGTH
          ? `${fullBody.slice(0, MAX_BODY_LENGTH)}…`
          : fullBody;

      return (
        <TouchableOpacity
          onPress={() => router.push(`/forum/${item.communityPostResponse.id}`)}
          style={styles.card}
        >
          {/* Title / Body preview */}
          <Text style={styles.bodyText} numberOfLines={1} ellipsizeMode="tail">
            {truncatedBody}
          </Text>

          {/* Meta info */}
          <Text style={styles.metaText}>
            by @{item.communityPostResponse.userName} •{" "}
            {new Date(
              item.communityPostResponse.createdAt
            ).toLocaleDateString()}
          </Text>

          {/* Snippet (also truncated to avoid overflow) */}
          <Text style={styles.snippet} numberOfLines={2} ellipsizeMode="tail">
            {truncatedBody}
          </Text>
        </TouchableOpacity>
      );
    },
    [router]
  );

  const ListEmpty = () => {
    if (loading) {
      // Show skeleton while loading
      return Array.from({ length: 4 }).map((_, i) => (
        <View key={i} style={styles.skeleton} />
      ));
    }
    if (error) {
      // Show error or "no results" message
      return (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>{error}</Text>
        </View>
      );
    }
    // If no input yet, show nothing
    return null;
  };

  return (
    <ImageBackground
      source={require("../../assets/images/backgournd.png")}
      className="flex-1"
      resizeMode="cover"
    >
      <SafeAreaView style={styles.container}>
        <Header title="Search Posts" showBack />
        <FlatList
          data={posts}
          keyExtractor={(item) => item.communityPostResponse.id}
          renderItem={renderItem}
          ListHeaderComponent={
            <View style={styles.searchBox}>
              <TextInput
                style={styles.input}
                placeholder="Search posts..."
                value={query}
                onChangeText={setQuery}
                returnKeyType="search"
              />
              {query.length > 0 && (
                <TouchableOpacity
                  style={styles.clearButton}
                  onPress={() => setQuery("")}
                >
                  <Text style={styles.clearText}>✕</Text>
                </TouchableOpacity>
              )}
            </View>
          }
          stickyHeaderIndices={[0]}
          ListEmptyComponent={ListEmpty}
          contentContainerStyle={styles.listContent}
        />
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchBox: {
    flexDirection: "row",
    backgroundColor: "#fff",
    margin: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#DDD",
    alignItems: "center",
    paddingHorizontal: 12,
  },
  input: {
    flex: 1,
    height: 40,
  },
  clearButton: {
    padding: 4,
  },
  clearText: {
    fontSize: 16,
    color: "#888",
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    marginVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  bodyText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#4A4A4A",
  },
  metaText: {
    fontSize: 12,
    color: "#888",
    marginTop: 4,
  },
  snippet: {
    fontSize: 14,
    color: "#555",
    marginTop: 8,
  },
  skeleton: {
    height: 80,
    backgroundColor: "#EEE",
    borderRadius: 8,
    marginHorizontal: 16,
    marginVertical: 8,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    marginTop: 64,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
  },
});
