import React, { useState, useEffect, useCallback } from "react";
import {
  FlatList,
  ImageBackground,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
} from "react-native";

import { Avatar } from "react-native-paper";
import NotificationBell from "../../components/NotificationBell";
import WeatherCard from "../../components/WeatherCard";
import useCustomFonts from "../../hook/FontLoader";

import TodoList from "../../components/TodoList";
import { fetchGardens, ListGardensResponse } from "../../api/gardenApi";
import { fetchGardenCells, GardenCell } from "@/api/gardenCellApi";

const ROWS_DEFAULT = 6;
const COLS_DEFAULT = 6;
const CELL_SIZE = (200 / COLS_DEFAULT) * 0.97;

type Status = "normal" | "warning" | "alert";
type CellValue = Status | null;

type GardenWithGrid = {
  id: string;
  name: string;
  grid: CellValue[];
  rowLength: number;
  colLength: number;
};

const HomeScreen = () => {
  const [gardens, setGardens] = useState<GardenWithGrid[]>([]);
  const [loading, setLoading] = useState(true);
  const [fontsLoaded] = useCustomFonts();

  // Fetch garden data
  useEffect(() => {
    const loadData = async () => {
      try {
        const listResp: ListGardensResponse = await fetchGardens({});
        const gardensData = await Promise.all(
          listResp.result.map(async (g) => {
            const cellsResp = await fetchGardenCells({ gardenId: g.id });
            const total = g.rowLength * g.colLength;
            const grid: CellValue[] = Array(total).fill(null);
            cellsResp.result.cells.forEach((cell: GardenCell) => {
              const idx = cell.rowIndex * g.colLength + cell.colIndex;
              grid[idx] =
                cell.healthStatus === "NORMAL"
                  ? "normal"
                  : cell.healthStatus === "DISEASED"
                  ? "warning"
                  : "alert";
            });
            return {
              id: g.id,
              name: g.name,
              grid,
              rowLength: g.rowLength,
              colLength: g.colLength,
            };
          })
        );
        setGardens(gardensData);
      } catch (err) {
        console.error("Error loading gardens:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Memoized render functions
  const renderGrid = useCallback(
    (garden: GardenWithGrid) => (
      <FlatList
        data={garden.grid}
        keyExtractor={(_, idx) => String(idx)}
        numColumns={garden.colLength}
        scrollEnabled={false}
        renderItem={({ item }) => {
          const bgColor =
            item === "normal"
              ? "#2ecc71"
              : item === "warning"
              ? "#f1c40f"
              : item === "alert"
              ? "#e74c3c"
              : "transparent";
          return (
            <View style={styles.cell}>
              {item && (
                <View
                  style={[
                    styles.innerCell,
                    { width: CELL_SIZE * 0.8, height: CELL_SIZE * 0.8 },
                  ]}
                >
                  <Text
                    style={{ color: bgColor, fontSize: 22, fontWeight: "500" }}
                  >
                    +
                  </Text>
                </View>
              )}
            </View>
          );
        }}
        style={{ width: CELL_SIZE * garden.colLength }}
      />
    ),
    []
  );

  const renderGarden = useCallback(
    ({ item }: { item: GardenWithGrid }) => (
      <View style={styles.noteCard}>
        <View style={styles.headerRow} className="items-center">
          <Text style={styles.noteTitle}>{item.name}</Text>
        </View>
        <View className="items-center">{renderGrid(item)}</View>
      </View>
    ),
    [renderGrid]
  );

  // Early return for loading state
  if (!fontsLoaded || loading) {
    return <ActivityIndicator size="large" style={styles.loader} />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <WeatherCard />
        <NotificationBell />
      </View>

      <ImageBackground
        source={require("../../assets/images/tip_background.png")}
        resizeMode="cover"
        style={styles.banner}
      >
        <Avatar.Image
          size={54}
          source={require("../../assets/images/chat_logo.png")}
        />
        <View style={styles.bannerText}>
          <Text style={styles.bannerTitle}>AI irrigation tips for you</Text>
          <Text style={styles.bannerSubtitle}>
            Water your plants every 2 days
          </Text>
        </View>
      </ImageBackground>

      <View style={{ height: 280 }}>
        <FlatList
          data={gardens}
          keyExtractor={(g) => g.id}
          renderItem={renderGarden}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />
      </View>

      <Text style={styles.notesLabel}>Notes:</Text>
      <TodoList />
    </SafeAreaView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "white" },
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },
  topBar: { flexDirection: "row", justifyContent: "space-between", padding: 8 },
  banner: {
    flexDirection: "row",
    alignItems: "center",
    margin: 8,
    padding: 12,
    borderRadius: 8,
    overflow: "hidden",
    height: 100,
  },
  bannerText: { marginLeft: 8, flex: 1 },
  bannerTitle: {
    fontSize: 22,
    fontFamily: "PoetsenOne-Regular",
    color: "white",
  },
  bannerSubtitle: { color: "rgba(255,255,255,0.9)" },
  listContent: {
    paddingHorizontal: 16,
    height: 275,
    alignItems: "center",
    flexGrow: 1,
  },
  noteCard: {
    marginRight: 16,
    backgroundColor: "#fff",
    borderRadius: 8,
    elevation: 2,
    padding: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    width: 210,
  },
  headerRow: { marginBottom: 8 },
  noteTitle: { fontSize: 16, fontWeight: "600" },
  cell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    borderWidth: 1,
    borderColor: "#ccc",
    alignItems: "center",
    justifyContent: "center",
  },
  innerCell: {
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
  },
  notesLabel: {
    marginHorizontal: 16,
    fontSize: 22,
    fontWeight: "600",
  },
});
