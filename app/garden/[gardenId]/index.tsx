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
  ImageBackground,
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
import { PlantInventoryEntry } from "@/api/plantIventoryApi";
import {
  showError,
  showSuccess,
  showWarning,
} from "@/utils/flashMessageService";
import { crops } from "../../../data/image";
const { width } = Dimensions.get("window");
import UpdateCellModal from "@/components/UpdateCellModal";
import AutoCompleteDisease from "@/components/AutoCompleteDisease";
import DisplayGardenCellModal from "@/components/DisplayGardenCellModalProps";
type HealthCellStatus = "NORMAL" | "DISEASED" | "DEAD";
const CreateGardenLayout = () => {
  const router = useRouter();
  const { gardenId } = useLocalSearchParams<{ gardenId: string }>();

  // === UI & Modal States ===
  const [modalVisible, setModalVisible] = useState<boolean>(false); // controls "Add Plant" modal
  const [action, setAction] = useState<
    "add" | "remove" | "edit" | "read" | null
  >("read"); // current user mode
  const [loading, setLoading] = useState<boolean>(true); // spinner visibility during data fetch
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  // === Grid Dimensions & Layout ===
  const [rows, setRows] = useState<number>(0); // number of grid rows
  const [cols, setCols] = useState<number>(0); // number of grid columns
  const total = rows * cols; // total cell count
  const cellSize = (width / cols) * 0.92; // cell pixel size based on screen width
  const [displayCellModal, setDisplayCellModal] = useState<boolean>(false); // controls display cell modal
  const [desplayCellData, setDisplayCellData] = useState<GardenCell | null>(
    null
  ); // data for display cell modal
  const [imageCurrentCellUpdate, setImageCurrentCellUpdate] =
    useState<string>(""); // image for current cell update
  const hadnleUpdaetGrowStage = async () => {
    if (selectedIds.length === 0) {
      showWarning("Please select cells to update!");
      return;
    }
    const updateList: UpdateGardenCellRequest[] = selectedIds
      .map((id) => {
        const cell = grid.find((c) => c?.id === id);
        if (!cell) return undefined;
        return {
          id: cell.id,
          nextStage: true, // cập nhật lên giai đoạn mới
        } as UpdateGardenCellRequest;
      })
      .filter((req): req is UpdateGardenCellRequest => !!req);

    try {
      const payload: UpdateGardenCellsRequest = { gardenId, cells: updateList };
      await updateGardenCellsBatch(payload);
      await loadGardenCells();
      showSuccess("Grow stage updated successfully!");
      setSelectedIds([]);
    } catch (err) {
      console.error("Failed to update grow stage:", err);
      showError("Failed to update grow stage.");
    }
  };
  const handleUpdateImageCellCurrent = async () => {
    console.log(
      "Batch updating image for selected cells:",
      selectedIds,
      imageCurrentCellUpdate
    );

    if (!imageCurrentCellUpdate) {
      showWarning("No image to update!");
      return;
    }

    if (selectedIds.length === 0) {
      showWarning("Please select cells to update!");
      return;
    }

    // Tạo danh sách update cho tất cả selectedIds (nếu tìm thấy ô tương ứng trong grid)
    const updateList: UpdateGardenCellRequest[] = selectedIds
      .map((id) => {
        const cell = grid.find((c) => c?.id === id);
        if (!cell) return undefined;
        return {
          id: cell.id,
          // giữ nguyên các trường khác là null / false như yêu cầu
          rowIndex: null,
          colIndex: null,
          healthStatus: null,
          diseaseName: null,
          nextStage: false,
          imgCellCurrent: imageCurrentCellUpdate,
        } as UpdateGardenCellRequest;
      })
      .filter((req): req is UpdateGardenCellRequest => !!req);

    if (updateList.length === 0) {
      showWarning("No valid cells found to update.");
      return;
    }

    try {
      const payload: UpdateGardenCellsRequest = {
        gardenId,
        cells: updateList,
      };

      await updateGardenCellsBatch(payload);
      await loadGardenCells();
      showSuccess("Cell images updated successfully!");
      setSelectedIds([]);
      setAction("read");
    } catch (err) {
      console.error("Failed to update cell images (batch):", err);
      showError("Failed to update cell images.");
    }
  };

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
  const [modalVisibleUpdate, setModalVisiblUpdate] = useState<boolean>(false);
  const [selectedAction, setSelectedAction] = useState<string>("position"); // action to perform in edit mode
  const [diseaseName, setDiseaseName] = useState<string | null>(null);
  const [autoCompleteDisease, setAutoCompleteDisease] =
    useState<boolean>(false);
  const handleActionSelect = (updateAction: string) => {
    // actionOrUrl will be 'growStage', 'healthStatus', or image URL

    setSelectedAction(updateAction);

    console.log("Selected action:", updateAction);
  };

  /**
   * Toggles between "add" and "remove" modes.
   * Opens modal when entering add mode.
   */

  const toggleAction = (key: "add" | "remove" | "edit") => {
    setSelectedIds([]);
    setAction((prev) => {
      if (prev === key) {
        if (currentAddPlant !== null) setCurrentAddPlant(null);
        setgridSpaceWork(grid);
        return "read"; // toggle off như cũ
      }
      if (prev === "edit" && modalVisibleUpdate === true) {
        setModalVisiblUpdate(false);
      }
      if (key === "edit" && modalVisible === false) {
        setModalVisiblUpdate(true);
      }

      return key; // chọn mới
    });
    if (key === "add" && currentAddPlant === null) {
      setGridAdd([]);
      setModalVisible(true);
    }
  };

  /**
   * Initializes a GardenCell with selected inventory data before placement.
   * @param inv - PlantInventory selected by user
   * @param qty - quantity to plant
   */
  const handleCurrentAddPlant = (inv: PlantInventoryEntry, qty: number) => {
    setCurrentAddPlant({
      id: "",
      rowIndex: -1,
      colIndex: -1,
      quantity: qty,
      healthStatus: "NORMAL",
      diseaseName: null,
      plantVariety: inv.plantVariety,
      stageLink: "",
      stageGrow: "",
      createdAt: new Date().toISOString(),
      imgCellCurrent: "",
    });
    setIcons(inv.plantVariety.iconLink || ""); // set icon for the cell
  };

  const handleSelectPress = (id: string) => {
    if (action === "read") {
      return;
    }
    if (selectedAction === "position") {
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
  console.log("console", selectedAction);
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
    if (grid?.[index] || gridSpaceWork?.[index]) {
      showWarning("Cell already has a plant!");
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
      // Ở đây chỉ sửa newGrid[index] để thêm stageLink
      newGrid[index] = {
        ...updated,
        stageLink: icons ?? "", // chỉ thêm thuộc tính này cho UI
      };
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
      setgridSpaceWork((prev) =>
        prev.map((cell) =>
          cell && selectedIds.includes(cell.id) ? null : cell
        )
      );
      setSelectedIds([]);
    } catch (err: any) {
      console.error(err);
      showError(err.response?.data?.message || err.message);
    } finally {
      setAction("read");
    }
  };

  /**
   * Saves all buffered new cells to backend via batch upsert.
   */

  const handleSaveCellsPress = async () => {
    const toAdd = gridAdd.filter((c): c is GardenCell => c !== null);
    if (toAdd.length === 0) {
      return;
    }
    const payload: UpsertGardenCell[] = toAdd.map((c) => ({
      varietyId: c.plantVariety.id,
      rowIndex: c.rowIndex,
      colIndex: c.colIndex,
      quantity: c.quantity,
    }));
    try {
      const res = await upsertGardenCells(gardenId, payload);
      loadGardenCells();
      setAction("read");
      setCurrentAddPlant(null);
      showSuccess(res.message);
    } catch (err) {
      console.error("Upsert failed:", err);
    }
  };

  const handleUpdatePostion = async (index: number) => {
    console.log("Updating position for index:", index);
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

          nextStage: false,
        } as UpdateGardenCellRequest,
      ];
      const payload: UpdateGardenCellsRequest = { gardenId, cells: batch };
      await updateGardenCellsBatch(payload);
      await loadGardenCells();
    } catch (err) {
      console.error(err);
    }

    setSelectedIds([]);
  };

  const handleDiseaseNameChange = (name: string) => {
    console.log("Selected disease name:", name);
    if (!name) return;
    // update your state for display
    setDiseaseName(name);
    // immediately do the health-status change
    // close the autocomplete
    setAutoCompleteDisease(false);
    handleUpdateHealthStatusPress("DISEASED", name);
  };

  const handleUpdateHealthStatusPress = async (
    status: HealthCellStatus,
    nameDisea?: string
  ) => {
    console.log("Updating health status to:", nameDisea, status);
    if (selectedIds.length === 0) {
      showWarning("Please select cells to update!");
      return;
    }

    if (status === "DISEASED" && !diseaseName && !nameDisea) {
      showWarning("Please enter disease name!");
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
          rowIndex: null,
          colIndex: null,
          healthStatus: cell.healthStatus,
          diseaseName:
            status === "DISEASED"
              ? nameDisea
                ? nameDisea
                : diseaseName
              : null,
          nextStage: false, // không cập nhật giai đoạn mới
        } as UpdateGardenCellRequest;
      })
      .filter((req): req is UpdateGardenCellRequest => !!req);

    try {
      const payload: UpdateGardenCellsRequest = { gardenId, cells: updateList };
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
      console.log("Fetched garden cells:", data.result.cells);

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
    <ImageBackground
      source={require("@/assets/images/backgournd.png")}
      className="flex-1"
      resizeMode="cover"
    >
      <SafeAreaView style={{ flex: 1 }}>
        <Header title="Garden" showBack={true} />
        <View className=" mx-2 rounded-lg p-1">
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
                <View>
                  <Image
                    source={{
                      uri: icons,
                    }}
                    className="w-6 h-6"
                  />
                  <Text
                    style={{
                      fontSize: 12,
                      position: "absolute",
                      bottom: -12,
                      fontWeight: "bold",
                    }}
                  >
                    X {currentAddPlant.quantity}
                  </Text>
                </View>
              ) : (
                <>
                  <Image
                    source={images.gardening}
                    style={{ width: 24, height: 24 }}
                  />
                </>
              )}
            </TouchableOpacity>
            <UpdateCellModal
              visible={modalVisibleUpdate}
              onDismiss={() => {
                setModalVisiblUpdate(false);
                setAction("edit");
              }}
              onActionSelect={handleActionSelect}
              setImage={setImageCurrentCellUpdate}
            />
            <AutoCompleteDisease
              visible={autoCompleteDisease}
              onCancel={() => setAutoCompleteDisease(false)}
              onOk={handleDiseaseNameChange}
              initialValue={diseaseName || ""}
            />

            {/* Remove Button */}
            <TouchableOpacity
              style={[
                styles.actionItem,
                action === "remove" && styles.actionActive,
              ]}
              onPress={() => toggleAction("remove")}
            >
              <Image source={images.shovel} style={{ width: 24, height: 24 }} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.actionItem,
                action === "edit" && styles.actionActive,
              ]}
              onPress={() => toggleAction("edit")}
            >
              {selectedAction === "image" ? (
                <>
                  <Image
                    source={{ uri: imageCurrentCellUpdate }}
                    style={{ width: 24, height: 24 }}
                  />
                </>
              ) : (
                <>
                  <Image
                    source={
                      selectedAction === "position"
                        ? images.update
                        : selectedAction === "growStage"
                        ? images.progress
                        : images.status
                    }
                    style={{ width: 24, height: 24 }}
                  />
                </>
              )}
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
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionItem}
              onPress={() => router.push(`/garden/${gardenId}/note`)}
            >
              <Image source={images.pencil} style={{ width: 24, height: 24 }} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionItem]}
              onPress={() => router.push(`/garden/${gardenId}/chart`)}
            >
              <Image source={images.chart} style={{ width: 24, height: 24 }} />
            </TouchableOpacity>
          </View>
        </View>

        <InventoryModal
          visible={modalVisible}
          onDismiss={() => {
            console.log("Dismiss");
            setAction("read");
            setModalVisible(false);
          }}
          onConfirm={(inv, qty) => {
            handleCurrentAddPlant(inv, qty);
            setModalVisible(false);
          }}
        />
        <DisplayGardenCellModal
          visible={displayCellModal}
          onDismiss={() => setDisplayCellModal(false)}
          data={desplayCellData || undefined}
        />
        <FlatList
          data={
            selectedIds.length > 0 || action === "add" ? gridSpaceWork : grid
          }
          scrollEnabled={false}
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
                    borderWidth: 1,
                    borderColor: "#fff",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "#2E8B57",
                  },
                ]}
                onPress={() => {
                  console.log("Pressed cell at index:", index);
                  console.log("Action:", action);
                  if (action === "add") handleAddCellPress(index);
                  if (
                    (action === "remove" ||
                      selectedAction === "healthStatus" ||
                      selectedAction === "growStage" ||
                      selectedAction === "position" ||
                      selectedAction === "image") &&
                    item
                  ) {
                    handleSelectPress(item.id);
                  }
                  if (
                    selectedAction === "position" &&
                    item === null &&
                    action === "edit"
                  ) {
                    handleUpdatePostion(index);
                  }
                  if (action === "read" && item) {
                    setDisplayCellModal(true);
                    setDisplayCellData(item);
                  }
                }}
                // onLongPress={() => handleCellLongPress(index)}
                activeOpacity={0.7}
              >
                {item ? (
                  <View
                    style={[
                      {
                        width: cellSize * 0.9,
                        height: cellSize * 0.9,
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: "white",
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
                          top: cellSize * 0.025, // 10% padding from top
                          left: cellSize * 0.025, // 10% padding from left
                          zIndex: 2,
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
                          top: cellSize * 0.025, // 10% padding from top
                          left: cellSize * 0.025, // 10% padding from left
                          zIndex: 2,
                        }}
                      />
                    )}
                    {/* cây to nhỏ theo cellSize */}
                    {item.imgCellCurrent ? (
                      <Image
                        source={{ uri: item.imgCellCurrent }} // Replace with actual image source
                        style={{
                          width: cellSize * 0.75, // 80% of cellSize
                          height: cellSize * 0.75, // 80% of cellSize
                          borderRadius: 10,
                          zIndex: 1,
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
                    <Text
                      style={{
                        position: "absolute",
                        bottom: cellSize * 0.04, // 5% padding from bottom
                        right: cellSize * 0.04, // 5% padding from right
                        fontSize: cellSize * 0.15, // 20% of cellSize
                        fontWeight: "600",
                        zIndex: 2,
                        color: "white",
                        marginRight: 4,
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
          ListFooterComponent={
            <View className="px-2 pt-12 flex-row items-center justify-between">
              {action === "add" && (
                <TouchableOpacity
                  onPress={() => handleSaveCellsPress()}
                  className="mr-2 bg-white py-1 px-3  rounded-sm"
                >
                  <Text className="font-bold">Save</Text>
                </TouchableOpacity>
              )}
              {action === "edit" && selectedAction === "image" && (
                <TouchableOpacity
                  onPress={() => handleUpdateImageCellCurrent()}
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
              {action === "edit" && selectedAction === "growStage" && (
                <TouchableOpacity
                  onPress={() => {
                    hadnleUpdaetGrowStage();
                    setSelectedAction("growStage");
                  }}
                  className="mr-2 bg-white py-1 px-3  rounded-sm"
                >
                  <Text className="font-bold">Update Grow Stage</Text>
                </TouchableOpacity>
              )}
              {action === "edit" && selectedAction === "healthStatus" && (
                <View className="flex-row items-center gap-6">
                  <TouchableOpacity
                    onPress={() => handleUpdateHealthStatusPress("NORMAL")}
                    className="mr-2 bg-primary py-2 px-3  rounded-xl"
                  >
                    <Text className="font-bold text-white">Normal</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      if (selectedIds.length === 0) {
                        showWarning("Please select cells to update!");
                        return;
                      }
                      setAutoCompleteDisease(true);
                    }}
                    className="mr-2 bg-amber-400 py-2 px-3  rounded-xl"
                  >
                    <Text className="font-bold text-white">Diseased</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleUpdateHealthStatusPress("DEAD")}
                    className="mr-2 bg-orange-700 py-2 px-3  rounded-xl"
                  >
                    <Text className="font-bold text-white">Dead</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          }
        />
      </SafeAreaView>
    </ImageBackground>
  );
};

export default CreateGardenLayout;

const styles = StyleSheet.create({
  toolbar: {
    flexDirection: "row",
    marginHorizontal: 8,
    overflow: "hidden",
    padding: 1,
    gap: 8,
  },
  actionItem: {
    flex: 1 / 6,
    padding: 14,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "50%",
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: "#ccc",
    backgroundColor: "white",
    shadowColor: "black", // Màu bóng
    shadowOffset: { width: 0, height: 2 }, // Độ lệch
    shadowOpacity: 0.25, // Độ mờ
    shadowRadius: 3.84, // Bán kính
  },
  actionText: {
    fontSize: 12,
    color: "black",
    marginTop: 2,
  },
  actionActive: {
    borderColor: "#000080",
  },
});
