// src/screens/GardenListScreen.tsx
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
} from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { AntDesign, MaterialIcons } from "@expo/vector-icons";
import Header from "@/components/Header";
import {
  fetchGardens,
  GardenSummary,
  ListGardensParams,
} from "@/api/gardenApi";
import { useAppSelector } from "../../store/hooks";
import Entypo from "@expo/vector-icons/Entypo";
import GardenOptionsModal from "@/components/GardenOptionsModal";
const GardenListScreen = () => {
  const router = useRouter();
  const [gardens, setGardens] = useState<GardenSummary[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const user = useAppSelector((state) => state.auth.user);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentGarden, setCurrentGarden] = useState<GardenSummary | null>(
    null
  );
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      const load = async () => {
        setLoading(true);
        const params: ListGardensParams = {
          userId: user?.id,
        };
        try {
          const data = await fetchGardens(params);

          setGardens(data.result);
        } catch (err: any) {
          Alert.alert(
            "Error",
            err?.response?.data?.message || "Unable to load gardens"
          );
        } finally {
          setLoading(false);
        }
      };
      load();
    } catch (error) {
      console.error("Error refreshing gardens:", error);
    } finally {
      setRefreshing(false);
    }
  };

  // reload every time screen comes into focus
  useFocusEffect(
    useCallback(() => {
      onRefresh();
    }, [])
  );
  // 1. Fetch data on mount
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const params: ListGardensParams = {
        userId: user?.id,
      };
      try {
        const data = await fetchGardens(params);

        setGardens(data.result);
      } catch (err: any) {
        Alert.alert(
          "Error",
          err?.response?.data?.message || "Unable to load gardens"
        );
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // 2. Filter & Sort
  const filteredGardens = useMemo(() => {
    return gardens.filter((g) =>
      g.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [gardens, searchQuery]);

  // const toggleSort = () => setSortAsc((p) => !p);

  // 3. Render item
  const renderGarden = ({ item }: { item: GardenSummary }) => {
    // map each condition to a color
    const conditionColor =
      item.gardenCondition === "NORMAL"
        ? "#2ecc71" // green
        : item.gardenCondition === "DISEASED"
        ? "#f1c40f" // yellow
        : item.gardenCondition === "ALERT"
        ? "#e74c3c" // red
        : "#999";
    return (
      <TouchableOpacity
        style={[styles.card]}
        onPress={() => router.push(`/garden/${item.id}`)}
      >
        <View style={[styles.cardContent, { borderLeftColor: conditionColor }]}>
          <View>
            <Text style={styles.title}>{item.name}</Text>

            <Text style={styles.subtitle}>
              Size: {item.rowLength}×{item.colLength}
            </Text>
            {/* condition with dynamic color */}
            <Text style={[styles.subtitle, { color: conditionColor }]}>
              Condition: {item.gardenCondition}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={() => {
            setCurrentGarden(item);
            setModalVisible(true);
          }}
          className="items-center justify-center pr-6"
        >
          <Entypo name="dots-three-vertical" size={20} color="gray" />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="Gardens"
        showBack={false}
        rightElement={
          <TouchableOpacity onPress={() => router.push("/garden/create")}>
            <AntDesign name="plus" size={26} color="black" />
          </TouchableOpacity>
        }
      />

      <View style={styles.toolbar}>
        <TextInput
          placeholder="Search gardens..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchInput}
        />
        {searchQuery && (
          <TouchableOpacity
            className=" absolute right-9 top-2"
            onPress={() => setSearchQuery("")}
          >
            <MaterialIcons name="cancel" size={20} color="gray" />
          </TouchableOpacity>
        )}
      </View>
      <GardenOptionsModal
        visible={modalVisible}
        onDismiss={() => setModalVisible(false)}
        gardenId={currentGarden?.id || ""}
        gardenName={currentGarden?.name || ""}
        onRename={async (newName) => {
          // call your rename API
          await onRefresh();
        }}
        onDeleted={() => {
          // remove the garden from state
          onRefresh();
        }}
      />
      {loading ? (
        <ActivityIndicator style={{ marginTop: 20 }} size="large" />
      ) : (
        <FlatList
          data={filteredGardens}
          keyExtractor={(item) => item.name}
          renderItem={renderGarden}
          contentContainerStyle={{ paddingBottom: 100 }}
          className="shadow-sm shadow-slate-500"
          refreshing={refreshing}
          onRefresh={onRefresh}
        />
      )}
    </SafeAreaView>
  );
};

export default GardenListScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "white" },
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
    marginRight: 8,
  },

  sortText: { color: "white", marginLeft: 4, fontWeight: "bold" },

  card: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 16,
    marginVertical: 8,
    backgroundColor: "#fff",
    borderRadius: 8,
    elevation: 2,
  },
  cardContent: {
    padding: 16,
    borderLeftWidth: 4,
    borderRadius: 8,
  },
  title: { fontSize: 16, fontWeight: "600", marginBottom: 4 },
  subtitle: { fontSize: 14, color: "#666", marginBottom: 2 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    flex: 1,
  },
});
