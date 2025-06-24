// src/screens/NoteListScreen.tsx
import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput,
  FlatList,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from "react-native";
import { useFocusEffect, useRouter, useLocalSearchParams } from "expo-router";
import { AntDesign, Entypo, Ionicons } from "@expo/vector-icons";
import Header from "@/components/Header";
import {
  getMyGardenNotes,
  deleteGardenNotes,
  GardenNoteResponse,
} from "@/api/gardenNoteApi";

type NoteListScreenParams = {
  gardenId: string;
};

const NoteListScreen: React.FC = () => {
  const router = useRouter();
  const { gardenId } = useLocalSearchParams<NoteListScreenParams>();

  const [notes, setNotes] = useState<GardenNoteResponse[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch notes from backend, filter by gardenId
  const fetchNotes = async () => {
    if (!gardenId) {
      console.warn("No gardenId provided to NoteListScreen.");
      setLoading(false);
      setRefreshing(false);
      return;
    }
    try {
      // Show spinner only if there are existing notes (to avoid spinner on empty initial state)
      if (notes.length > 0 && !refreshing) {
        setLoading(true);
      }
      const res = await getMyGardenNotes();
      if (res && Array.isArray(res.result)) {
        const filtered = res.result.filter(
          (note) => note.gardenId === gardenId
        );
        // Sort by updatedAt descending
        filtered.sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
        setNotes(filtered);
      } else {
        setNotes([]);
      }
    } catch (error: any) {
      console.error("Error fetching notes:", error);
      Alert.alert(
        "Error",
        error?.response?.data?.message || "Unable to load notes"
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Refresh handler for pull-to-refresh
  const onRefresh = () => {
    setRefreshing(true);
    fetchNotes();
  };

  // Fetch when screen comes into focus (e.g., after create/edit)
  useFocusEffect(
    useCallback(() => {
      fetchNotes();
    }, [gardenId])
  );

  // Initial fetch on mount
  useEffect(() => {
    fetchNotes();
  }, []);

  // Filter notes by searchQuery (case-insensitive match on title)
  const filteredNotes = useMemo(() => {
    if (!searchQuery.trim()) return notes;
    const lower = searchQuery.toLowerCase();
    return notes.filter((note) => note.noteTitle.toLowerCase().includes(lower));
  }, [notes, searchQuery]);

  // Navigate to Edit screen
  const handleEdit = (note: GardenNoteResponse) => {
    router.push({
      pathname: `/garden/${gardenId}/note/${note.id}`,
      params: { id: note.id },
    });
  };

  // Delete with confirmation
  const handleDelete = (note: GardenNoteResponse) => {
    Alert.alert(
      "Delete Note",
      `Are you sure you want to delete "${note.noteTitle}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteGardenNotes([note.id]);
              // Remove from state immediately
              setNotes((prev) => prev.filter((n) => n.id !== note.id));
              Alert.alert("Deleted", `"${note.noteTitle}" has been deleted.`);
            } catch (error: any) {
              console.error("Error deleting note:", error);
              Alert.alert(
                "Error",
                error?.response?.data?.message || "Unable to delete note"
              );
            }
          },
        },
      ]
    );
  };

  // Show options menu for a note (Edit / Delete)
  const showNoteOptions = (note: GardenNoteResponse) => {
    Alert.alert(
      note.noteTitle,
      undefined,
      [
        {
          text: "Edit",
          onPress: () => handleEdit(note),
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => handleDelete(note),
        },
        {
          text: "Cancel",
          style: "cancel",
        },
      ],
      { cancelable: true }
    );
  };

  // Render each note item
  const renderNoteItem = ({ item }: { item: GardenNoteResponse }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.8}
      onPress={() => handleEdit(item)}
    >
      <View style={styles.cardContent}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{item.noteTitle}</Text>
          <Text style={styles.subtitle}>
            Created: {new Date(item.createdAt).toLocaleDateString()}
          </Text>
          <Text style={styles.subtitle}>
            Updated: {new Date(item.updatedAt).toLocaleDateString()}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => showNoteOptions(item)}
          style={styles.optionsButton}
        >
          <Entypo name="dots-three-vertical" size={20} color="gray" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="Notes"
        showBack
        rightElement={
          <TouchableOpacity
            onPress={() =>
              router.push({ pathname: `/garden/${gardenId}/note/create` })
            }
            style={styles.headerButton}
          >
            <AntDesign name="plus" size={24} color="black" />
          </TouchableOpacity>
        }
      />

      {/* Search Bar */}
      <View style={styles.toolbar}>
        <TextInput
          placeholder="Search notes..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchInput}
          returnKeyType="search"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={() => setSearchQuery("")}
          >
            <Ionicons name="close-circle" size={20} color="gray" />
          </TouchableOpacity>
        )}
      </View>

      {/* Show spinner only if loading AND there are existing notes */}
      {loading && notes.length > 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007aff" />
        </View>
      ) : (
        <FlatList
          data={filteredNotes}
          keyExtractor={(item) => item.id}
          renderItem={renderNoteItem}
          contentContainerStyle={
            filteredNotes.length === 0 ? styles.emptyListContainer : undefined
          }
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={() => (
            <View style={styles.emptyTextContainer}>
              <Text style={styles.emptyText}>
                No notes found. Tap + to create a new note.
              </Text>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
};

export default NoteListScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9f9f9" },
  headerButton: {
    paddingHorizontal: 12,
  },
  toolbar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    marginVertical: 8,
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#fff",
  },
  clearButton: {
    position: "absolute",
    right: 24,
  },
  card: {
    marginHorizontal: 16,
    marginVertical: 8,
    backgroundColor: "#fff",
    borderRadius: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
    color: "#333",
  },
  subtitle: {
    fontSize: 13,
    color: "#666",
    marginBottom: 2,
  },
  optionsButton: {
    padding: 8,
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyListContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 50,
  },
  emptyTextContainer: {
    alignItems: "center",
    paddingTop: 50,
  },
  emptyText: {
    fontSize: 16,
    color: "#888",
  },
});
