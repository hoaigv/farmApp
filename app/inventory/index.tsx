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
import React, { useState, useEffect } from "react";
import Header from "@/components/Header";
import { useRouter } from "expo-router";
import {
  getMyPlantInventories,
  PlantInventory,
  deletePlantInventories,
} from "@/api/plantIventoryApi";
import {
  showError,
  showSuccess,
  showWarning,
} from "@/utils/flashMessageService";
const { width } = Dimensions.get("window");

const BunkerScreen: React.FC = () => {
  const router = useRouter();
  const rows = 6;
  const cols = 5;
  const maxCells = rows * cols;

  // grid holds one “icon” per cell (here we’ll use the inventory.name)
  const [grid, setGrid] = useState<Array<PlantInventory | null>>(
    Array(maxCells).fill(null)
  );
  const [action, setAction] = useState<"remove" | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadInventories = async () => {
      try {
        const inventories: PlantInventory[] = await getMyPlantInventories(); // 2️⃣
        // Map each inventory to its name, then pad with nulls
        // const icons = inventories.map((inv) => inv.imageUrl);
        const icons = inventories;
        setGrid([...icons, ...Array(maxCells - icons.length).fill(null)]);
      } catch (err) {
        Alert.alert("Error", "Could not load your plant inventories.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadInventories();
  }, []);

  // show spinner while loading
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

  // existing logic to insert “Add” button after the last filled cell
  const lastFilledIndex = grid.reduce(
    (last, cell, idx) => (cell ? idx : last),
    -1
  );
  const insertIndex = lastFilledIndex + 1;
  const gridData = [
    ...grid.slice(0, insertIndex),
    "ADD_BUTTON",
    ...grid.slice(insertIndex),
  ].slice(0, maxCells);

  // Navigate to “create new inventory” screen
  const handleAddPress = () => {
    router.push({
      pathname: "/inventory/edit",
      params: { mode: "create" },
    });
  };

  // Navigate to “view/edit” screen for a given inventory item
  // Ở màn list
  const handleDetailInvenPress = (item: PlantInventory) => {
    router.push({
      pathname: "/inventory/edit",
      params: {
        mode: "read",
        // JSON.stringify() thành một chuỗi
        inventory: JSON.stringify(item),
      },
    });
  };

  const handleDeletePress = async (id: string) => {
    if (!id) return;

    /* your existing long-press logic… */

    try {
      const msg = await deletePlantInventories([id]);
      showSuccess(msg);
      setGrid((prev) =>
        prev.map((cell) => (cell && cell.id === id ? null : cell))
      );
    } catch (err) {
      showError("Failed to delete inventory item.");
    }
  };

  const toggleAction = (key: "remove") => {
    setAction((prev) => (prev === key ? null : key));
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Plant Inventory" showBack />
      <View style={styles.toolbar}>
        <Text>
          Total: {gridData.filter((c) => c !== null).length - 1} / {maxCells}
        </Text>
        <TouchableOpacity
          style={[
            styles.actionItem,
            action === "remove" && styles.actionActive,
          ]}
          onPress={() => toggleAction("remove")}
        >
          <Text style={styles.actionText}>Remove</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={gridData}
        renderItem={({ item, index }) => {
          if (item === "ADD_BUTTON") {
            return (
              <TouchableOpacity
                style={[styles.cell, { width: cellSize, height: cellSize }]}
                onPress={() => handleAddPress()}
                activeOpacity={0.7}
              >
                <Text style={styles.addIcon}>+</Text>
              </TouchableOpacity>
            );
          }
          const icon = grid[index];
          const seq = icon
            ? grid.slice(0, index + 1).filter((c) => c).length
            : null;
          return (
            <Pressable
              key={index}
              style={[styles.cell, { width: cellSize, height: cellSize }]}
              // onPress={() => handleCellPress(index)}
              // onLongPress={() => handleCellLongPress(index)}
            >
              {icon && (
                <>
                  <TouchableOpacity
                    onPress={() => {
                      if (action !== "remove") handleDetailInvenPress(icon);
                      else {
                        handleDeletePress(icon.id);
                      }
                    }}
                    style={styles.iconWrapper}
                  >
                    <Image
                      source={{ uri: icon.imageUrl }}
                      style={{ width: "100%", height: "100%", borderRadius: 8 }}
                    />
                    <Text
                      className="absolute right-0 top-0 "
                      style={{
                        fontSize: 18,
                        fontWeight: "bold",
                        color: "white",
                      }}
                    >
                      X {icon.inventoryQuantity}
                    </Text>
                    <Text className="absolute color-zinc-50 font-bold bottom-0">
                      {icon.name}
                    </Text>
                  </TouchableOpacity>
                </>
              )}
            </Pressable>
          );
        }}
        keyExtractor={(_, idx) => idx.toString()}
        numColumns={cols}
        contentContainerStyle={styles.grid}
      />
    </SafeAreaView>
  );
};

export default BunkerScreen;

// your existing StyleSheet stays exactly the same
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  toolbar: {
    flexDirection: "row",
    padding: 8,
    backgroundColor: "#f8f8f8",
    alignItems: "center",
    justifyContent: "space-between",
  },
  actionItem: {
    padding: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  actionText: { fontSize: 16, color: "#333" },
  actionActive: { backgroundColor: "#ddd", borderRadius: 4 },
  grid: { alignItems: "center" },
  cell: {
    borderWidth: 1,
    borderColor: "#ccc",
    alignItems: "center",
    justifyContent: "center",
    margin: 2,
  },
  iconWrapper: {
    width: "90%",
    height: "90%",
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
  },
  iconText: { fontSize: 28 },
  seqText: {
    position: "absolute",
    bottom: 4,
    right: 4,
    fontSize: 12,
    fontWeight: "bold",
    color: "#333",
  },
  addIcon: { fontSize: 36, color: "#007bff" },
});
