import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Alert,
  Pressable,
  ActivityIndicator,
  Image,
} from "react-native";
import React, { useState, useCallback } from "react";
import Header from "@/components/Header";
import { useRouter } from "expo-router";
import {
  getMyPlantInventories,
  PlantInventoryEntry,
} from "../../api/plantIventoryApi";
import { useFocusEffect } from "@react-navigation/native";
import { showError } from "@/utils/flashMessageService";

const { width } = Dimensions.get("window");

const BunkerScreen: React.FC = () => {
  const router = useRouter();
  const rows = 6;
  const cols = 5;
  const maxCells = rows * cols;

  // grid holds one PlantInventoryEntry per cell (or null)
  const [grid, setGrid] = useState<Array<PlantInventoryEntry | null>>(
    Array(maxCells).fill(null)
  );
  const [loading, setLoading] = useState<boolean>(true);
  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const loadInventories = async () => {
        try {
          setLoading(true);
          const inventories = await getMyPlantInventories(); // PlantInventoryEntry[]
          if (!isActive) return;
          setGrid([
            ...inventories,
            ...Array(maxCells - inventories.length).fill(null),
          ]);
        } catch (err) {
          Alert.alert("Error", "Không tải được dữ liệu từ kho.");
          console.error(err);
        } finally {
          if (isActive) setLoading(false);
        }
      };

      loadInventories();

      return () => {
        // cleanup khi màn hình mất focus
        isActive = false;
      };
    }, [])
  );

  if (loading) {
    return (
      <SafeAreaView
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }

  const cellSize = (width / cols) * 0.97;

  // chèn nút ADD ngay sau cell cuối cùng có dữ liệu
  const lastFilledIndex = grid.reduce(
    (last, cell, idx) => (cell ? idx : last),
    -1
  );
  const insertIndex = lastFilledIndex + 1;
  const gridData = [
    ...grid.slice(0, insertIndex),
    "ADD_BUTTON" as any,
    ...grid.slice(insertIndex),
  ].slice(0, maxCells);

  const handleAddPress = () => {
    router.push({
      pathname: "/inventory/varieties",
      params: { mode: "create" },
    });
  };

  const handleDetailPress = (item: PlantInventoryEntry) => {
    router.push(`/inventory/${item.plantVariety.id}`);
  };
  const total = grid.filter((c) => c !== null).length;
  return (
    <SafeAreaView style={styles.container}>
      <Header title="Plant Inventory" showBack />
      <View style={styles.toolbar}>
        <Text>
          Total: {total} / {maxCells}
        </Text>
      </View>

      <FlatList
        data={gridData}
        numColumns={cols}
        keyExtractor={(_, idx) => idx.toString()}
        contentContainerStyle={styles.grid}
        renderItem={({ item, index }) => {
          // nút thêm mới
          if (item === ("ADD_BUTTON" as any) && maxCells > total) {
            return (
              <TouchableOpacity
                style={[styles.cell, { width: cellSize, height: cellSize }]}
                onPress={handleAddPress}
                activeOpacity={0.7}
              >
                <Text style={styles.addIcon}>+</Text>
              </TouchableOpacity>
            );
          }

          const entry = grid[index];
          if (!entry) {
            return (
              <View
                style={[styles.cell, { width: cellSize, height: cellSize }]}
              />
            );
          }

          const { plantVariety, numberOfVariety } = entry;
          return (
            <Pressable
              style={[styles.cell, { width: cellSize, height: cellSize }]}
              onPress={() => handleDetailPress(entry)}
            >
              <View style={styles.iconWrapper}>
                <Image
                  source={{ uri: plantVariety.iconLink }}
                  style={{
                    width: "100%",
                    height: "100%",
                    borderRadius: 8,
                  }}
                />
                <Text style={styles.quantityBadge}>X {numberOfVariety}</Text>
              </View>
            </Pressable>
          );
        }}
      />
    </SafeAreaView>
  );
};

export default BunkerScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  toolbar: {
    flexDirection: "row",
    padding: 8,
    backgroundColor: "#f8f8f8",
    alignItems: "center",
    justifyContent: "space-between",
  },
  grid: { alignItems: "center" },
  cell: {
    borderWidth: 1,
    borderColor: "#ccc",
    margin: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  iconWrapper: {
    width: "90%",
    height: "90%",
    backgroundColor: "#000",

    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  addIcon: { fontSize: 36, color: "#007bff" },
  quantityBadge: {
    position: "absolute",
    top: 4,
    right: 4,
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: 4,
    borderRadius: 4,
  },
  nameLabel: {
    position: "absolute",
    bottom: 4,
    left: 4,
    fontSize: 12,
    fontWeight: "bold",
    color: "#fff",
  },
});
