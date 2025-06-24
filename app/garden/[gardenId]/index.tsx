import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Image,
  ActivityIndicator,
} from "react-native";
import {
  fetchGardenCells,
  GardenCell,
  UpsertGardenCell,
  upsertGardenCells,
  deleteGardenCells,
  updateGardenCellsBatch,
  UpdateGardenCellsRequest,
  UpdateGardenCellRequest,
} from "@/api/gardenCellApi";
import React, { useState, useEffect, useCallback } from "react";
import Header from "@/components/Header";
import { images } from "../../../data/image";
import { useRouter, useLocalSearchParams } from "expo-router";
import InventoryModal from "@/components/InventoryModal";
import { PlantInventory } from "@/api/plantIventoryApi";
import {
  showError,
  showSuccess,
  showWarning,
} from "@/utils/flashMessageService";
import { FontAwesome5 } from "@expo/vector-icons";
import { crops } from "../../../data/image";
const { width } = Dimensions.get("window");
type HealthCellStatus = "NORMAL" | "DISEASED" | "DEAD";
const CreateGardenLayout = () => {
  const router = useRouter();
  const { gardenId } = useLocalSearchParams<{ gardenId: string }>();

  // === UI & Modal States ===
  const [modalVisible, setModalVisible] = useState<boolean>(false); // controls "Add Plant" modal
  const [action, setAction] = useState<
    "add" | "remove" | "edit" | "position" | null
  >("position"); // current user mode
  const [loading, setLoading] = useState<boolean>(true); // spinner visibility during data fetch
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  // === Grid Dimensions & Layout ===
  const [rows, setRows] = useState<number>(0); // number of grid rows
  const [cols, setCols] = useState<number>(0); // number of grid columns
  const total = rows * cols; // total cell count
  const cellSize = (width / cols) * 0.9; // cell pixel size based on screen width

  // === Grid Data States ===
  const [grid, setGrid] = useState<Array<GardenCell | null>>([]);
  const [gridSpaceWork, setgridSpaceWork] = useState<Array<GardenCell | null>>(
    []
  ); // existing cells
  const [gridAdd, setGridAdd] = useState<Array<GardenCell | null>>(
    Array(total).fill(null)
  ); // newly added cells buffer
  const [currentAddPlant, setCurrentAddPlant] = useState<GardenCell | null>(
    null
  ); // temp data for placement
  const [icons, setIcons] = useState<string>(); // icons for each cell

  /**
   * Toggles between "add" and "remove" modes.
   * Opens modal when entering add mode.
   */
  console.log(selectedIds);
  const toggleAction = (key: "add" | "remove" | "edit") => {
    setSelectedIds([]);
    setAction((prev) => {
      if (prev === key) {
        if (currentAddPlant !== null) setCurrentAddPlant(null);
        setgridSpaceWork(grid);
        return "position"; // toggle off như cũ
      }
      return key; // chọn mới
    });
    if (key === "add" && currentAddPlant === null) {
      setModalVisible(true);
    }
  };

  /**
   * Initializes a GardenCell with selected inventory data before placement.
   * @param inv - PlantInventory selected by user
   * @param qty - quantity to plant
   */
  const handleCurrentAddPlant = (inv: PlantInventory, qty: number) => {
    setCurrentAddPlant({
      id: "",
      rowIndex: -1,
      colIndex: -1,
      quantity: qty,
      healthStatus: "NORMAL",
      plantInventoryId: inv.id,
      icon: inv.icon || "",
    });
    setIcons(inv.icon);
  };

  const handleSelectPress = (id: string) => {
    if (action === "position") {
      if (selectedIds.at(0) === id) {
        setSelectedIds([]);
        return;
      }
      setSelectedIds([id]);
      return;
    }
    const newSelected = selectedIds.includes(id)
      ? selectedIds.filter((itemId) => itemId !== id)
      : [...selectedIds, id];
    setSelectedIds(newSelected);
  };

  /**
   * Places the selected plant in the tapped cell when in add mode.
   * @param index - flat index of cell in grid array
   */
  const handleAddCellPress = (index: number) => {
    if (!currentAddPlant) {
      showWarning("Select a plant before placing it!");
      return;
    }
    // Nếu ô đã có cây rồi thì không làm gì cả
    if (grid?.[index]) {
      return;
    }
    const rowIndex = Math.floor(index / cols);
    const colIndex = index % cols;
    const updated: GardenCell = { ...currentAddPlant, rowIndex, colIndex };

    // buffer for API batch upsert
    setGridAdd((prev) => [...prev, updated]);

    // immediate UI update
    setgridSpaceWork((prev) => {
      const newGrid = [...prev];
      newGrid[index] = updated;
      return newGrid;
    });
  };
  /**
   * Removes an existing cell when in remove mode.
   * @param item - GardenCell to delete
   */
  const handleDeleteCellPress = async () => {
    if (selectedIds.length === 0) {
      showWarning("No cells to delete !");
      return;
    }
    try {
      const { message } = await deleteGardenCells(selectedIds);
      showSuccess(message);
      setAction(null);
      setGrid((prev) =>
        prev.map((cell) =>
          cell && selectedIds.includes(cell.id) ? null : cell
        )
      );
      setSelectedIds([]);
    } catch (err: any) {
      console.error(err);
      showError(err.response?.data?.message || err.message);
    }
  };

  /**
   * Saves all buffered new cells to backend via batch upsert.
   */
  const handleSaveCellsPress = async () => {
    const toAdd = gridAdd.filter((c): c is GardenCell => c !== null);
    if (toAdd.length === 0) {
      console.info("No new cells to save");
      return;
    }
    const payload: UpsertGardenCell[] = toAdd.map((c) => ({
      plantInventoryId: c.plantInventoryId,
      rowIndex: c.rowIndex,
      colIndex: c.colIndex,
      quantity: c.quantity,
    }));
    try {
      const res = await upsertGardenCells(gardenId, payload);
      loadGardenCells();
      setAction("position");
      setCurrentAddPlant(null);
      showSuccess(res.message);
    } catch (err) {
      console.error("Upsert failed:", err);
    }
  };

  const handleUpdatePostion = async (index: number) => {
    if (selectedIds.length === 0) return;
    const movingCell = grid.find((item) => item?.id === selectedIds.at(0));
    if (!movingCell) return;
    movingCell.colIndex = Math.floor(index / cols);
    movingCell.rowIndex = index % cols;

    try {
      const batch: UpdateGardenCellRequest[] = [
        {
          id: movingCell.id,
          rowIndex: movingCell.colIndex,
          colIndex: movingCell.rowIndex,
          healthStatus: movingCell.healthStatus,
        },
      ];
      const payload: UpdateGardenCellsRequest = { cells: batch };
      await updateGardenCellsBatch(payload);
      await loadGardenCells();
    } catch (err) {
      console.error(err);
    }

    setSelectedIds([]);
  };
  const handleUpdateHealthStatusPress = async (status: HealthCellStatus) => {
    if (selectedIds.length === 0) {
      showWarning("Please select cells to update!");
      return;
    }

    // Tạo danh sách ô cần cập nhật
    const updateList: UpdateGardenCellRequest[] = selectedIds
      .map((id) => {
        const cell = grid.find((c) => c?.id === id);
        if (!cell) return undefined;
        cell.healthStatus = status;
        return {
          id: cell.id,
          rowIndex: cell.rowIndex,
          colIndex: cell.colIndex,
          healthStatus: cell.healthStatus,
        } as UpdateGardenCellRequest;
      })
      .filter((req): req is UpdateGardenCellRequest => !!req);

    try {
      const payload: UpdateGardenCellsRequest = { cells: updateList };
      await updateGardenCellsBatch(payload);
      await loadGardenCells();
      showSuccess("Health status updated successfully!");
      setSelectedIds([]);
    } catch (err) {
      console.error("Failed to update health status:", err);
      showError("Failed to update health status.");
    }
  };

  /**
   * Fetches initial grid data from API and constructs the grid array.
   */
  async function loadGardenCells() {
    if (!gardenId) return;
    setLoading(true);
    try {
      console.log("Loading");
      const data = await fetchGardenCells({ gardenId });
      const { rowLength, colLength, cells: fetchedCells } = data.result;

      setRows(rowLength);
      setCols(colLength);

      // Initialize grid with nulls
      const total = rowLength * colLength;
      const cellsArray: (GardenCell | null)[] = Array(total).fill(null);

      // Populate existing cells
      if (fetchedCells) {
        fetchedCells.forEach((c) => {
          const pos = c.rowIndex * colLength + c.colIndex;
          cellsArray[pos] = c;
        });
      }

      setGrid(cellsArray);
      setgridSpaceWork(cellsArray);
    } catch (error) {
      console.error("Failed to load garden cells:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadGardenCells();
  }, []);

  if (loading) {
    return (
      <SafeAreaView
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      >
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Header title="Garden" showBack={true} />
      <View style={{ flex: 1, backgroundColor: "#00C48C", paddingVertical: 8 }}>
        <View className="bg-white mx-2 rounded-lg p-1">
          <View style={styles.toolbar}>
            {/* Add Button */}
            <TouchableOpacity
              style={[
                styles.actionItem,
                action === "add" && styles.actionActive,
              ]}
              onPress={() => toggleAction("add")}
            >
              {currentAddPlant ? (
                <>
                  <Image
                    source={crops[icons as keyof typeof crops]} // Replace with actual image source
                    className="w-6 h-6"
                  />
                  <Text style={{ fontSize: 12 }}>
                    X {currentAddPlant.quantity}
                  </Text>
                </>
              ) : (
                <>
                  <Image
                    source={images.gardening}
                    style={{ width: 24, height: 24 }}
                  />
                  <Text style={styles.actionText}>Add</Text>
                </>
              )}
            </TouchableOpacity>

            {/* Remove Button */}
            <TouchableOpacity
              style={[
                styles.actionItem,
                action === "remove" && styles.actionActive,
              ]}
              onPress={() => toggleAction("remove")}
            >
              <Image source={images.shovel} style={{ width: 24, height: 24 }} />
              <Text style={styles.actionText}>Remove</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.actionItem,
                action === "edit" && styles.actionActive,
              ]}
              onPress={() => toggleAction("edit")}
            >
              <Image source={images.update} style={{ width: 24, height: 24 }} />
              <Text style={styles.actionText}>Update</Text>
            </TouchableOpacity>

            {/* Other Tools (static) */}
            <TouchableOpacity
              onPress={() => router.push(`/garden/${gardenId}/reminder`)}
              style={styles.actionItem}
            >
              <Image
                source={images.reminder}
                style={{ width: 24, height: 24 }}
              />
              <Text style={styles.actionText}>Reminder</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionItem}
              onPress={() => router.push(`/garden/${gardenId}/note`)}
            >
              <Image source={images.pencil} style={{ width: 24, height: 24 }} />
              <Text style={styles.actionText}>Note</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.toolbar}>
            <TouchableOpacity
              style={styles.actionItem}
              onPress={() => router.push("/inventory")}
            >
              <Image
                source={images.warehouse}
                style={{ width: 24, height: 24 }}
              />
              <Text style={styles.actionText}>Inventory</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionItem]}>
              <Image source={images.scan} style={{ width: 24, height: 24 }} />
              <Text style={styles.actionText}>Dinostic</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionItem]}
              onPress={() => router.push("/garden/123/chart")}
            >
              <Image source={images.chart} style={{ width: 24, height: 24 }} />
              <Text style={styles.actionText}>Chart</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View className="px-2 py-3 flex-row items-center justify-between">
          <Text
            style={{
              fontSize: 18,
              fontFamily: "PoetsenOne-Regular",
              color: "#fff",
            }}
          >
            Date : 125
          </Text>
          {action === "add" && (
            <TouchableOpacity
              onPress={() => handleSaveCellsPress()}
              className="mr-2 bg-white py-1 px-3  rounded-sm"
            >
              <Text className="font-bold">Save</Text>
            </TouchableOpacity>
          )}
          {action === "remove" && (
            <TouchableOpacity
              onPress={() => handleDeleteCellPress()}
              className="mr-2 bg-white py-1 px-3  rounded-sm"
            >
              <Text className="font-bold">Delete</Text>
            </TouchableOpacity>
          )}
        </View>
        <InventoryModal
          visible={modalVisible}
          onDismiss={() => {
            console.log("Dismiss");
            setAction("position");
            setModalVisible(false);
          }}
          onConfirm={(inv, qty) => {
            handleCurrentAddPlant(inv, qty);
            setModalVisible(false);
          }}
        />
        <FlatList
          data={
            selectedIds.length > 0 || action === "add" ? gridSpaceWork : grid
          }
          renderItem={({ item, index }) => {
            // let isSelected = false;
            // if (item !== null) {
            //   isSelected = selectedIds.includes(item.id);
            // }
            const status = item?.healthStatus;
            const statusStyle =
              status === "NORMAL"
                ? { borderColor: "#7FFF00" }
                : status === "DISEASED"
                ? { borderColor: "goldenrod" }
                : status === "DEAD"
                ? { borderColor: "red" }
                : { borderColor: "#fff" };
            return (
              <TouchableOpacity
                key={index}
                style={[
                  {
                    width: cellSize,
                    height: cellSize,
                    borderWidth: 2,
                    margin: 3,
                    borderColor: "#fff",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: 2,
                    borderRadius: 10,
                  },
                ]}
                onPress={() => {
                  if (action === "add") handleAddCellPress(index);
                  if (
                    (action === "remove" ||
                      action === "edit" ||
                      action === "position") &&
                    item
                  ) {
                    handleSelectPress(item.id);
                  }
                  if (action === "position" && item === null) {
                    handleUpdatePostion(index);
                  }
                }}
                // onLongPress={() => handleCellLongPress(index)}
                activeOpacity={0.7}
              >
                {item ? (
                  <View
                    style={[
                      {
                        width: cellSize * 0.97,
                        height: cellSize * 0.97,
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: "white",
                        borderRadius: 10,
                        borderWidth: 5,
                      },
                      selectedIds.length > 0 && selectedIds.includes(item.id)
                        ? { borderColor: "#1E90FF" }
                        : statusStyle,
                    ]}
                  >
                    {item.healthStatus === "DEAD" && (
                      <Image
                        source={crops.stump} // Replace with actual image source
                        style={{
                          width: cellSize * 0.25, // 80% of cellSize
                          height: cellSize * 0.25, // 80% of cellSize
                          position: "absolute",
                          top: cellSize * 0.05, // 10% padding from top
                          left: cellSize * 0.05, // 10% padding from left
                        }}
                      />
                    )}
                    {item.healthStatus === "DISEASED" && (
                      <Image
                        source={crops.pest} // Replace with actual image source
                        style={{
                          width: cellSize * 0.25, // 80% of cellSize
                          height: cellSize * 0.25, // 80% of cellSize
                          position: "absolute",
                          top: cellSize * 0.05, // 10% padding from top
                          left: cellSize * 0.05, // 10% padding from left
                        }}
                      />
                    )}
                    {/* cây to nhỏ theo cellSize */}
                    {item.icon ? (
                      <Image
                        source={crops[item.icon as keyof typeof crops]} // Replace with actual image source
                        style={{
                          width: cellSize * 0.45, // 80% of cellSize
                          height: cellSize * 0.45, // 80% of cellSize
                        }}
                      />
                    ) : (
                      <Text
                        style={{
                          fontSize: cellSize * 0.45 /* 50% of cellSize */,
                        }}
                      >
                        🌳
                      </Text>
                    )}

                    {/* số lượng cũng scale và đặt vị trí dynamic */}
                    <Text
                      style={{
                        position: "absolute",
                        bottom: cellSize * 0.04, // 5% padding from bottom
                        right: cellSize * 0.04, // 5% padding from right
                        fontSize: cellSize * 0.15, // 20% of cellSize
                        fontWeight: "600",
                      }}
                    >
                      X {item.quantity}
                    </Text>
                  </View>
                ) : null}
              </TouchableOpacity>
            );
          }}
          keyExtractor={(_, idx) => idx.toString()}
          numColumns={cols}
          contentContainerStyle={{
            alignItems: "center",
            justifyContent: "center",
            marginVertical: 8,
          }}
        />

        {action === "edit" && (
          <View className="absolute flex-row items-center justify-around w-full bottom-32 space-x-4">
            {/* NORMAL */}
            <TouchableOpacity
              onPress={() => handleUpdateHealthStatusPress("NORMAL")}
              className="flex-row items-center px-4 py-2 bg-green-500 rounded-2xl shadow"
            >
              <FontAwesome5 name="check-circle" size={20} color="white" />
              <Text className="ml-2 text-white font-medium">NORMAL</Text>
            </TouchableOpacity>

            {/* DISEASED */}
            <TouchableOpacity
              onPress={() => handleUpdateHealthStatusPress("DISEASED")}
              className="flex-row items-center px-4 py-2 bg-yellow-500 rounded-2xl shadow"
            >
              <FontAwesome5 name="bug" size={20} color="white" />
              <Text className="ml-2 text-white font-medium">DISEASED</Text>
            </TouchableOpacity>

            {/* DEAD */}
            <TouchableOpacity
              onPress={() => handleUpdateHealthStatusPress("DEAD")}
              className="flex-row items-center px-4 py-2 bg-red-500 rounded-2xl shadow"
            >
              <FontAwesome5 name="times-circle" size={20} color="white" />
              <Text className="ml-2 text-white font-medium">DEAD</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

export default CreateGardenLayout;

const styles = StyleSheet.create({
  toolbar: {
    flexDirection: "row",
    marginHorizontal: 8,
    overflow: "hidden",
    padding: 1,
  },
  actionItem: {
    flex: 1 / 5,
    paddingVertical: 6,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
  },
  actionText: {
    fontSize: 12,
    color: "black",
    marginTop: 2,
  },
  actionActive: {
    backgroundColor: "rgba(0, 196, 140, 0.3)",
  },
});
