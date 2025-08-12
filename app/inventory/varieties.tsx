// src/screens/VarietyDetailScreen.tsx

import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  StyleSheet,
  TextInput,
  FlatList,
  View,
  Text,
  Image,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
} from "react-native";
import type { ListRenderItem } from "react-native";
import Header from "../../components/Header";
import { getVarieties, Variety } from "../../api/varietyApi";
import { useRouter } from "expo-router";
const TYPE_OPTIONS = [
  { label: "All Types", value: "ALL" },
  { label: "Vegetable", value: "VEGETABLE" },
  { label: "Herb", value: "HERB" },
];

const VarietyDetailScreen: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedType, setSelectedType] = useState<string>("ALL");
  const [data, setData] = useState<Variety[]>([]);
  const [filteredData, setFilteredData] = useState<Variety[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const router = useRouter();

  // 1) Fetch data from API whenever selectedType changes
  useEffect(() => {
    const fetchVarieties = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await getVarieties({ type: selectedType });
        setData(result);
        // if no searchQuery, show all; else will be filtered below
        setFilteredData(result);
      } catch (e: any) {
        setError(e.message || "Failed to load varieties");
      } finally {
        setLoading(false);
      }
    };

    fetchVarieties();
  }, [selectedType]);

  // 2) Filter client-side by searchQuery
  useEffect(() => {
    if (!searchQuery) {
      setFilteredData(data);
      return;
    }
    const q = searchQuery.toLowerCase();
    setFilteredData(data.filter((item) => item.name.toLowerCase().includes(q)));
  }, [searchQuery, data]);

  const renderItem: ListRenderItem<Variety> = ({ item }) => (
    <TouchableOpacity
      onPress={() => router.push(`/inventory/${item.id}`)}
      style={styles.itemContainer}
    >
      <Image source={{ uri: item.iconLink }} style={styles.icon} />
      <View style={styles.textContainer}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.type}>{item.plantType}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Plant Varieties" />

      {/* Search + Filter Bar */}
      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInputRow}
          placeholder="Search plant varieties..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
          clearButtonMode="while-editing"
        />
        <TouchableOpacity
          style={styles.filterButtonRow}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.filterButtonText}>
            {TYPE_OPTIONS.find((opt) => opt.value === selectedType)?.label}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Loading / Error */}
      {loading && <ActivityIndicator size="large" color="#00aa00" />}
      {error && <Text style={styles.errorText}>{error}</Text>}

      {/* Results List */}
      {!loading && !error && (
        <FlatList<Variety>
          data={filteredData}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          ListEmptyComponent={() => (
            <Text style={styles.emptyText}>No results found</Text>
          )}
        />
      )}

      {/* Filter Modal */}
      <Modal
        transparent
        animationType="slide"
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {TYPE_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                style={styles.modalItem}
                onPress={() => {
                  setSelectedType(opt.value);
                  setModalVisible(false);
                }}
              >
                <Text style={styles.modalItemText}>{opt.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default VarietyDetailScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", paddingHorizontal: 16 },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 12,
  },
  searchInputRow: {
    flex: 1,
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
  },
  filterButtonRow: {
    marginLeft: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
  },
  filterButtonText: { fontSize: 14, color: "#333" },
  list: { paddingBottom: 20 },
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  icon: { width: 50, height: 50, borderRadius: 25, marginRight: 12 },
  textContainer: { flex: 1 },
  name: { fontSize: 16, fontWeight: "600" },
  type: { fontSize: 14, color: "#666", marginTop: 4 },
  emptyText: { textAlign: "center", marginTop: 20, color: "#999" },
  errorText: { textAlign: "center", marginTop: 20, color: "red" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
  },
  modalItem: { paddingVertical: 12 },
  modalItemText: { fontSize: 16, textAlign: "center" },
});
