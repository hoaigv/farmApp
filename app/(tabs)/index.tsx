import React, { useState, useCallback } from "react";
import {
  FlatList,
  ImageBackground,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  useWindowDimensions,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";

import NotificationBell from "../../components/NotificationBell";
import WeatherCard from "../../components/WeatherCard";
import useCustomFonts from "../../hook/FontLoader";
import TodoList from "../../components/TodoList";

import { fetchGardens, ListGardensResponse } from "../../api/gardenApi";
import { fetchGardenCells, GardenCell } from "@/api/gardenCellApi";

type Status = "normal" | "warning" | "alert";
type CellValue = Status | null;

type GardenWithGrid = {
  id: string;
  name: string;
  grid: CellValue[];
  rowLength: number;
  colLength: number;
};

const HomeScreen: React.FC = () => {
  // Lấy chiều rộng màn hình để tính layout động
  const { width: screenWidth } = useWindowDimensions();
  const cardWidth = screenWidth * 0.9; // mỗi card chiếm 70% màn hình
  // kích thước ô vuông grid

  const [gardens, setGardens] = useState<GardenWithGrid[]>([]);
  const [loading, setLoading] = useState(true);
  const [fontsLoaded] = useCustomFonts();

  const getGreeting = () => {
    const hour = new Date().getHours();

    if (hour >= 5 && hour < 11) {
      return "Good morning, gardener!";
    } else if (hour >= 11 && hour < 13) {
      return "Good noon, gardener!";
    } else if (hour >= 13 && hour < 18) {
      return "Good afternoon, gardener!";
    } else {
      return "Good evening, gardener!";
    }
  };

  // Hàm fetch và build dữ liệu grid
  const loadGardens = useCallback(async () => {
    setLoading(true);
    try {
      const listResp: ListGardensResponse = await fetchGardens();
      const gardensData = await Promise.all(
        listResp.result.map(async (g) => {
          const cellsResp = await fetchGardenCells({ gardenId: g.id });
          const total = g.rowLength * g.colLength;
          const grid: CellValue[] = Array(total).fill(null);
          cellsResp.result.cells?.forEach((cell: GardenCell) => {
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
  }, []);

  // Reload khi màn hình focus
  useFocusEffect(
    useCallback(() => {
      loadGardens();
    }, [loadGardens])
  );

  // Render grid của mỗi garden
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
              ? "gray"
              : item === null
              ? "#e74c3c"
              : "transparent";

          const CELL_SIZE =
            (cardWidth / ((garden.colLength + garden.rowLength) / (2 * 0.95))) *
            0.5; // Chiều rộng mỗi ô vuông

          return (
            <View
              style={[styles.cell, { width: CELL_SIZE, height: CELL_SIZE }]}
            >
              {item && (
                <View
                  style={[
                    styles.innerCell,
                    { width: CELL_SIZE * 0.8, height: CELL_SIZE * 0.8 },
                  ]}
                >
                  <Text
                    style={{
                      color: bgColor,
                      fontSize: CELL_SIZE * 0.6,
                      fontWeight: "500",
                    }}
                  >
                    +
                  </Text>
                </View>
              )}
            </View>
          );
        }}
      />
    ),
    [cardWidth]
  );

  // Render mỗi card garden
  const renderGarden = useCallback(
    ({ item }: { item: GardenWithGrid }) => (
      <View style={[styles.noteCard]}>
        <View className="flex-1 items-center px-2 ">
          <Text style={styles.noteTitle}>{item.name}</Text>
        </View>
        <View>{renderGrid(item)}</View>
      </View>
    ),
    [renderGrid, cardWidth]
  );

  if (!fontsLoaded || loading) {
    return <ActivityIndicator size="large" style={styles.loader} />;
  }

  return (
    <ImageBackground
      source={require("../../assets/images/backgournd.png")}
      className="flex-1"
      resizeMode="cover"
    >
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
          <View style={styles.bannerText}>
            <Text style={styles.bannerTitle}>{getGreeting()}</Text>
            <Text style={styles.bannerSubtitle}>
              It`s a great time to start something new!
            </Text>
          </View>
        </ImageBackground>

        <View style={{ flex: 1 }}>
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
    </ImageBackground>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },
  topBar: { flexDirection: "row", justifyContent: "space-between", padding: 8 },
  banner: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 8,
    marginVertical: 24,
    padding: 10,
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
    paddingBottom: 16,
    flexGrow: 1,
  },

  noteCard: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    marginRight: 16,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
    elevation: 2,
  },

  noteTitle: { fontSize: 16, fontWeight: "600" },

  cell: {
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
