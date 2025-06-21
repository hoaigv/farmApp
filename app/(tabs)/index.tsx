import React, { useState } from "react";
import {
  FlatList,
  ImageBackground,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";

import { Avatar } from "react-native-paper";
import NotificationBell from "../../components/NotificationBell";
import WeatherCard from "../../components/WeatherCard";
import useCustomFonts from "../../hook/FontLoader";

import TodoList from "../../components/TodoList";
const ROWS = 6;
const COLS = 6;
const CELL_SIZE = (200 / COLS) * 0.97;

type CellValue = string | null;
type Status = "normal" | "warning" | "alert";
type Note = {
  id: string;
  title: string;
  date: string;
  time: string;
  completed: boolean;
  grid: CellValue[];
};
function generateGrid(total: number, filledCount: number): CellValue[] {
  const arr: CellValue[] = Array(total).fill(null);
  const indices = Array.from({ length: total }, (_, i) => i);
  // shuffle chỉ số
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  const chosen = indices.slice(0, filledCount);
  const options: Status[] = ["normal", "warning", "alert"];
  chosen.forEach((idx) => {
    arr[idx] = options[Math.floor(Math.random() * options.length)];
  });
  return arr;
}

// Sample grid statuses: green=normal, yellow=warning, red=alert
const sampleNotes: Note[] = [
  {
    id: "1",
    title: "Water Plants",
    date: "2025-06-15",
    time: "08:00",
    completed: false,
    grid: generateGrid(ROWS * COLS, 28),
  },
  {
    id: "2",
    title: "Fertilize",
    date: "2025-06-15",
    time: "10:00",
    completed: true,
    grid: generateGrid(ROWS * COLS, 28),
  },
  {
    id: "3",
    title: "Fertilize",
    date: "2025-06-15",
    time: "10:00",
    completed: false,
    grid: generateGrid(ROWS * COLS, 25),
  },
];

const HomeScreen = () => {
  const [notes, setNotes] = useState<Note[]>(sampleNotes);
  const [fontsLoaded] = useCustomFonts();

  if (!fontsLoaded) {
    return <ActivityIndicator size="large" style={styles.loader} />;
  }

  // Render each cell based on status
  const renderGrid = (note: Note) => (
    <FlatList
      data={note.grid}
      keyExtractor={(_, idx) => String(idx)}
      numColumns={COLS}
      scrollEnabled={false}
      renderItem={({ item, index }) => {
        // Sequence of non-null statuses up to this index
        const bgColor =
          item === "normal"
            ? "#2ecc71"
            : item === "warning"
            ? "#f1c40f"
            : item === "alert"
            ? "#e74c3c"
            : "transparent";
        return (
          <TouchableOpacity style={[styles.cell]} activeOpacity={0.7}>
            {item && (
              <View
                style={[
                  styles.innerCell,
                  {
                    width: CELL_SIZE * 0.8,
                    height: CELL_SIZE * 0.8,
                  },
                ]}
              >
                <Text
                  style={{ color: bgColor, fontSize: 22, fontWeight: "500" }}
                >
                  +
                </Text>
              </View>
            )}
          </TouchableOpacity>
        );
      }}
      style={{ width: CELL_SIZE * COLS }}
    />
  );

  const renderNote = ({ item }: { item: Note }) => (
    <View style={styles.noteCard}>
      <View style={styles.headerRow}>
        <Text style={styles.noteTitle}>{item.title}</Text>
      </View>
      {renderGrid(item)}
    </View>
  );

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

      <FlatList
        data={notes}
        keyExtractor={(n) => n.id}
        renderItem={renderNote}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        style={{ height: 200 }}
      />
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
  noteMeta: { fontSize: 12, color: "#666" },
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
  iconText: { fontSize: 24 },
  seqText: {
    position: "absolute",
    bottom: 2,
    right: 2,
    fontSize: 10,
    fontWeight: "bold",
    color: "#333",
  },
});
