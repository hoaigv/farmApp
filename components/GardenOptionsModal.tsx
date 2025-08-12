// GardenOptionsModal.tsx
import React, { useState, useEffect } from "react";
import { View, StyleSheet, Alert, ScrollView } from "react-native";
import {
  Button,
  Modal,
  Portal,
  Text,
  TextInput,
  ActivityIndicator,
} from "react-native-paper";
import {
  deleteGardens,
  updateGarden,
  UpdateGardenRequest,
} from "@/api/gardenApi"; // adjust the import path to your API client

type Props = {
  visible: boolean;
  onDismiss: () => void;
  gardenId: string;
  gardenName: string;
  gardenSoil: string;
  onRename: (newName: string, newSoil: string) => void;
  onDeleted: () => void;
};

const soilTypes = [
  "SANDY_SOIL",
  "LOAMY_SAND",
  "LOAM",
  "CLAY_LOAM",
  "CLAY_SOIL",
  "ALLUVIAL_SOIL",
  "PEATY_SOIL",
  "CHALKY_SOIL",
  "ACID_SULFATE_SOIL",
  "BASALTIC_SOIL",
  "RED_SOIL",
  "BLACK_SOIL",
  "INFERTILE_SOIL",
];

const GardenOptionsModal = ({
  visible,
  onDismiss,
  gardenId,
  gardenName,
  gardenSoil,
  onRename,
  onDeleted,
}: Props) => {
  const [name, setName] = useState(gardenName);
  const [soil, setSoil] = useState<string>(gardenSoil);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setName(gardenName);
    setSoil(gardenSoil);
  }, [gardenName, gardenSoil]);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("Validation Error", "Please enter a valid garden name.");
      return;
    }
    if (!soil) {
      Alert.alert("Validation Error", "Please select a soil type.");
      return;
    }

    const data: UpdateGardenRequest = {
      id: gardenId,
      name: name.trim(),
      soil,
    };

    try {
      setLoading(true);
      await updateGarden(data);
      setLoading(false);
      onRename(name.trim(), soil);
      onDismiss();
    } catch (error) {
      setLoading(false);
      console.error("Failed to update garden:", error);
      Alert.alert("Error", "Failed to update garden.");
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete this garden?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true);
              await deleteGardens({ ids: [id] });
              setLoading(false);
              onDeleted();
              onDismiss();
            } catch (error) {
              setLoading(false);
              Alert.alert("Error", "Failed to delete garden.");
            }
          },
        },
      ],
      { cancelable: false }
    );
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={styles.container}
      >
        <Text style={styles.title}>Garden Options</Text>

        {/* Name */}
        <Text style={styles.label}>Name</Text>
        <TextInput
          mode="outlined"
          value={name}
          onChangeText={setName}
          style={styles.input}
          editable={!loading}
        />

        {/* Soil */}
        <Text style={[styles.label, { marginTop: 8 }]}>Soil Type</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.soilContainer}
        >
          {soilTypes.map((type) => (
            <Button
              key={type}
              mode={soil === type ? "contained" : "outlined"}
              onPress={() => setSoil(type)}
              disabled={loading}
              style={styles.soilButton}
              labelStyle={
                soil === type ? styles.soilTextSelected : styles.soilText
              }
            >
              {type
                .toLowerCase()
                .split("_")
                .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                .join(" ")}
            </Button>
          ))}
        </ScrollView>

        {/* Save / Cancel */}
        <View style={styles.buttonRow}>
          <Button onPress={onDismiss} disabled={loading}>
            Cancel
          </Button>
          <Button
            mode="contained"
            onPress={handleSave}
            disabled={loading}
            loading={loading}
          >
            Save
          </Button>
        </View>

        <View style={styles.divider} />

        {/* Delete */}
        <Button
          mode="text"
          onPress={() => handleDelete(gardenId)}
          labelStyle={styles.deleteLabel}
          disabled={loading}
        >
          {loading ? <ActivityIndicator /> : "Delete Garden"}
        </Button>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    padding: 20,
    margin: 20,
    borderRadius: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    marginBottom: 4,
  },
  input: {
    marginBottom: 16,
  },
  soilContainer: {
    flexDirection: "row",
    paddingVertical: 8,
  },
  soilButton: {
    marginRight: 8,
    borderRadius: 16,
  },
  soilText: {
    fontSize: 12,
    color: "#4CAF50",
  },
  soilTextSelected: {
    fontSize: 12,
    color: "#FFFFFF",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
  divider: {
    height: 1,
    backgroundColor: "#eee",
    marginVertical: 16,
  },
  deleteLabel: {
    color: "#e74c3c",
  },
});

export default GardenOptionsModal;
