import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Dimensions,
  Alert,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Header from "@/components/Header";

type Note = {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
};

const initialNotes: Note[] = [
  {
    id: "1",
    title: "Ghi chú trồng cây cà chua",
    createdAt: "2025-06-01",
    updatedAt: "2025-06-05",
  },
  {
    id: "2",
    title: "Lịch bón phân vườn cam",
    createdAt: "2025-05-20",
    updatedAt: "2025-06-10",
  },
  {
    id: "3",
    title: "Ghi chú chăm sóc cây cảnh",
    createdAt: "2025-06-12",
    updatedAt: "2025-06-14",
  },
];

const NoteListScreen = () => {
  const [notes, setNotes] = useState<Note[]>(initialNotes);

  const handleEdit = (note: Note) => {
    Alert.alert("Chỉnh sửa", `Bạn muốn chỉnh sửa: ${note.title}`);
  };

  const renderItem = ({ item }: { item: Note }) => (
    <View style={styles.card}>
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.meta}>Ngày tạo: {item.createdAt}</Text>
        <Text style={styles.meta}>Cập nhật: {item.updatedAt}</Text>
      </View>
      <TouchableOpacity onPress={() => handleEdit(item)}>
        <Ionicons name="create-outline" size={24} color="#007aff" />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Ghi chú chăm sóc cây" showBack />
      <FlatList
        data={notes}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
      />
    </SafeAreaView>
  );
};

export default NoteListScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
  },
  list: {
    padding: 16,
  },
  card: {
    backgroundColor: "white",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  meta: {
    fontSize: 13,
    color: "#555",
  },
});
