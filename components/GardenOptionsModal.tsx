import React, { useState, useEffect } from "react";
import { View, StyleSheet, Alert } from "react-native";
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
  gardenId: string; // ID of the garden to delete
  gardenName: string;
  onRename: (newName: string) => void;
  onDeleted: () => void; // callback after successful deletion
};

const GardenOptionsModal = ({
  visible,
  onDismiss,
  gardenId,
  gardenName,
  onRename,
  onDeleted,
}: Props) => {
  const [name, setName] = useState(gardenName);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setName(gardenName);
  }, [gardenName]);

  const handleSave = async () => {
    try {
      if (!name.trim()) {
        Alert.alert("Validation Error", "Please enter a valid garden name.");
        return;
      }
      const data: UpdateGardenRequest = {
        id: gardenId,
        name: name.trim(),
      };
      await updateGarden(data);
      onRename(name.trim() || gardenName);
      onDismiss();
    } catch (error) {
      console.error("Failed to update garden name:", error);
      Alert.alert("Error", "Failed to update garden name.");
      return;
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

        <Text style={styles.label}>Name</Text>
        <TextInput
          mode="outlined"
          value={name}
          onChangeText={setName}
          style={styles.input}
          editable={!loading}
        />

        <View style={styles.buttonRow}>
          <Button onPress={onDismiss} disabled={loading}>
            Cancel
          </Button>
          <Button mode="contained" onPress={handleSave} disabled={loading}>
            Save
          </Button>
        </View>

        <View style={styles.divider} />

        <Button
          mode="text"
          onPress={() => {
            handleDelete(gardenId);
          }}
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
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  divider: {
    height: 1,
    backgroundColor: "#eee",
    marginVertical: 8,
  },
  deleteLabel: {
    color: "#e74c3c",
  },
});

export default GardenOptionsModal;
