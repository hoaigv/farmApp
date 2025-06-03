import Header from "@/components/Header";
import { AntDesign, SimpleLineIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const FILTERS = [
  { key: "posts", label: "Your Posts" },
  { key: "liked", label: "Liked" },
  { key: "commented", label: "Commented" },
  { key: "shared", label: "Shared" },
];

const SORT_OPTIONS = [
  { key: "newest", label: "Newest" },
  { key: "oldest", label: "Oldest" },
];

type HistoryItem = {
  id: string;
  type: "post" | "liked" | "commented" | "shared";
  title: string;
  time: string;
  image: any;
};

const mockHistory: HistoryItem[] = [
  {
    id: "1",
    type: "post",
    title: "My new tomato harvest",
    time: "May 24, 2025",
    image: {
      uri: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSD4_wSuFLI5i2-_mcVehfdnPdN9kbijPqJ8Q&s",
    },
  },
  {
    id: "2",
    type: "liked",
    title: "Sunflower growth tips",
    time: "May 23, 2025",
    image: {
      uri: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSD4_wSuFLI5i2-_mcVehfdnPdN9kbijPqJ8Q&s",
    },
  },
  {
    id: "3",
    type: "commented",
    title: "Pest control methods",
    time: "May 22, 2025",
    image: {
      uri: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSD4_wSuFLI5i2-_mcVehfdnPdN9kbijPqJ8Q&s",
    },
  },
  {
    id: "4",
    type: "shared",
    title: "Garden layout ideas",
    time: "May 20, 2025",
    image: {
      uri: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSD4_wSuFLI5i2-_mcVehfdnPdN9kbijPqJ8Q&s",
    },
  },
];

const HistoryScreen = () => {
  const [activeFilter, setActiveFilter] = useState("posts");
  const [sortOrder, setSortOrder] = useState("newest");

  const filteredData = mockHistory
    .filter((item) => item.type === activeFilter)
    .sort((a, b) => {
      const dateA = new Date(a.time);
      const dateB = new Date(b.time);
      return sortOrder === "newest"
        ? dateB.getTime() - dateA.getTime()
        : dateA.getTime() - dateB.getTime();
    });

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
    <View style={styles.card}>
      <Image source={item.image} style={styles.thumbnail} />
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{item.title}</Text>
        <Text style={styles.cardTime}>{item.time}</Text>
      </View>
      <TouchableOpacity style={styles.moreBtn}>
        <SimpleLineIcons name="options-vertical" size={20} color="#2E7D32" />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Header title="History" />
      <View style={styles.filterContainer}>{FILTERS.map(renderFilter)}</View>
      <View style={styles.sortContainer}>{SORT_OPTIONS.map(renderSort)}</View>
      <FlatList
        data={filteredData}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F1F8E9", paddingHorizontal: 4 },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2E7D32",
    marginBottom: 16,
  },
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
  cardContent: { flex: 1, padding: 8, justifyContent: "center" },
  cardTitle: { fontSize: 16, fontWeight: "600", color: "#2E7D32" },
  cardTime: { fontSize: 12, color: "#757575", marginTop: 4 },
  moreBtn: { padding: 8, justifyContent: "center" },
});

export default HistoryScreen;
