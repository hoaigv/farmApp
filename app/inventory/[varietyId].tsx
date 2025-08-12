import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
} from "react-native";
import { useRoute, RouteProp } from "@react-navigation/native";
import Header from "../../components/Header";
import { getVarietyDetail, VarietyDetail } from "../../api/varietyApi";
import {
  createPlantInventory,
  getMyPlantInventories,
  updatePlantInventory,
} from "../../api/plantIventoryApi";
import { useRouter } from "expo-router";

// Define route prop
type InventoryRouteProp = RouteProp<
  {
    Inventory: { varietyId: string };
  },
  "Inventory"
>;

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const VarietyDetailScreen: React.FC = () => {
  const router = useRouter();
  const route = useRoute<InventoryRouteProp>();
  const { varietyId } = route.params;

  const [variety, setVariety] = useState<VarietyDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Modal state
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [quantity, setQuantity] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [plusIventory, setPlusInventory] = useState<boolean>(true);
  const [inventoryID, setInventoryID] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDetail() {
      setLoading(true);
      try {
        const data = await getVarietyDetail(varietyId);
        const inventories = await getMyPlantInventories();
        if (inventories.some((inv) => inv.plantVariety.id === varietyId)) {
          setPlusInventory(false);
          const existingInventory = inventories.find(
            (inv) => inv.plantVariety.id === varietyId
          );
          if (existingInventory) {
            console.log("Existing inventory found:", existingInventory);
            setInventoryID(existingInventory.id);
            setQuantity(String(existingInventory.numberOfVariety));
          }
        }
        setVariety(data);
      } catch (e: any) {
        setError(e.message || "Failed to load details");
      } finally {
        setLoading(false);
      }
    }
    fetchDetail();
  }, [varietyId]);

  const handleSubmitInventory = async () => {
    if (!quantity || isNaN(Number(quantity))) {
      setSubmitError("Please enter a valid number");
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    try {
      if (plusIventory) {
        await createPlantInventory({
          varietyId,
          numberOfVariety: Number(quantity),
        });
      } else {
        if (!inventoryID) {
          Alert.alert("Error", "Inventory ID is missing.");
        }
        await updatePlantInventory({
          id: inventoryID!,
          numberOfVariety: Number(quantity),
        });
      }
      setModalVisible(false);
      setQuantity("");
      // you can show a toast or refresh list
    } catch (e: any) {
      setSubmitError(e.message || "Failed to submit");
    } finally {
      setSubmitting(false);
      router.back(); // Go back to the previous screen
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }
  if (error || !variety) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={styles.errorText}>{error || "No data available"}</Text>
      </SafeAreaView>
    );
  }

  // sort stages
  const stages = [...variety.stages].sort(
    (a, b) => a.stageOrder - b.stageOrder
  );
  const total = stages.length;

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title={variety.name}
        rightElement={
          plusIventory ? (
            <TouchableOpacity
              onPress={() => setModalVisible(true)}
              style={styles.plusButton}
            >
              <Text style={styles.plusText}>Plus Variety</Text>
            </TouchableOpacity>
          ) : (
            <>
              <TouchableOpacity
                onPress={() => setModalVisible(true)}
                style={styles.plusButton}
              >
                <Text style={styles.plusText}>Update(N)</Text>
              </TouchableOpacity>
            </>
          )
        }
      />

      <ScrollView contentContainerStyle={styles.content}>
        {/* Main Image */}
        <Image source={{ uri: variety.iconLink }} style={styles.mainImage} />

        {/* Basic Info */}
        <Text style={styles.title}>{variety.name}</Text>
        <View style={styles.tag}>
          <Text style={styles.tagText}>{variety.plantType}</Text>
        </View>
        <Text style={styles.description}>{variety.description}</Text>

        {/* Growth Stages */}
        <Text style={styles.sectionTitle}>🌱 Growth Stages</Text>
        {stages.map((stage, index) => {
          const hue = total > 1 ? (index / (total - 1)) * 360 : 0;
          const dotColor = `hsl(${hue}, 70%, 60%)`;
          return (
            <View key={stage.id} style={styles.stageRow}>
              <View style={styles.timeline}>
                {index > 0 && <View style={styles.connector} />}
                <View style={[styles.dot, { backgroundColor: dotColor }]} />
                {index < total - 1 && <View style={styles.connector} />}
              </View>

              <View style={styles.stageContent}>
                <Text style={styles.stageName}>{stage.name}</Text>
                <Text style={styles.stageTime}>
                  {stage.estimatedByDay} days
                </Text>
                <View style={styles.stageDescRow}>
                  <Image
                    source={{ uri: stage.iconLink }}
                    style={styles.stageIcon}
                  />
                  <Text style={styles.stageDesc}>{stage.description}</Text>
                </View>
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* Inventory Modal */}
      <Modal transparent animationType="slide" visible={modalVisible}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {
              <Text style={styles.modalTitle}>
                {plusIventory ? "Add to Inventory" : "Update Inventory"}
              </Text>
            }
            <Text style={styles.description}>
              {plusIventory
                ? "Enter quantity to add this variety to your inventory."
                : "Enter new quantity to update your inventory."}
            </Text>
            {plusIventory && (
              <Text style={styles.description}>
                Note: You can only add this variety once.
              </Text>
            )}
            <TextInput
              style={styles.modalInput}
              placeholder="Quantity"
              keyboardType="numeric"
              value={quantity}
              onChangeText={setQuantity}
            />
            {submitError && <Text style={styles.errorText}>{submitError}</Text>}
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
                disabled={submitting}
              >
                <Text>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.submitButton]}
                onPress={handleSubmitInventory}
                disabled={submitting}
              >
                <Text style={{ color: "#fff" }}>
                  {submitting ? "Saving..." : "Save"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default VarietyDetailScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  errorText: { color: "red", fontSize: 16, textAlign: "center", margin: 8 },

  content: {
    padding: 16,
    paddingBottom: 32,
  },
  mainImage: {
    width: SCREEN_WIDTH - 32,
    height: SCREEN_WIDTH - 32,
    borderRadius: 12,
    alignSelf: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 8,
    textAlign: "center",
  },
  tag: {
    alignSelf: "center",
    backgroundColor: "#E0F7FA",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 12,
  },
  tagText: { fontSize: 14, fontWeight: "600", color: "#00796B" },
  description: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 24,
    textAlign: "justify",
  },

  sectionTitle: { fontSize: 18, fontWeight: "600", marginBottom: 16 },

  stageRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 24,
  },
  timeline: { width: 30, alignItems: "center" },
  connector: { flex: 1, width: 2, backgroundColor: "#CCC" },
  dot: { width: 16, height: 16, borderRadius: 8, marginVertical: 4 },

  stageContent: { flex: 1, paddingLeft: 12 },
  stageName: { fontSize: 16, fontWeight: "600" },
  stageTime: { fontSize: 14, color: "#666", marginBottom: 6 },
  stageDescRow: { flexDirection: "row", alignItems: "flex-start" },
  stageIcon: { width: 32, height: 32, borderRadius: 4, marginRight: 8 },
  stageDesc: { flex: 1, fontSize: 14, lineHeight: 20 },

  plusButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#4CAF50",
    borderRadius: 6,
    marginRight: 8,
    marginBottom: 4,
  },
  plusText: { fontSize: 12, fontWeight: "700", color: "#fff" },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
  },
  modalTitle: { fontSize: 18, fontWeight: "600", marginBottom: 12 },
  modalInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 8,
    marginBottom: 12,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
  },
  modalButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  cancelButton: {
    backgroundColor: "#eee",
  },
  submitButton: {
    backgroundColor: "#4CAF50",
  },
});
