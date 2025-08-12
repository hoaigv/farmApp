import React, { useState, useEffect } from "react";
import { View, StyleSheet, ActivityIndicator, FlatList } from "react-native";
import {
  Portal,
  Modal,
  Text,
  RadioButton,
  Button,
  Divider,
} from "react-native-paper";
import { fetchGardens, GardenSummary } from "@/api/gardenApi";

type Props = {
  visible: boolean;
  onDismiss: () => void;
  onConfirm: (gardenId: string, gardenName: string) => void;
};

const GardenPickerModal: React.FC<Props> = ({
  visible,
  onDismiss,
  onConfirm,
}) => {
  const [gardens, setGardens] = useState<GardenSummary[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string>("");

  useEffect(() => {
    if (!visible) return;

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetchGardens();
        setGardens(res.result);
        if (res.result.length > 0) {
          setSelectedId(res.result[0].id);
        }
      } catch (err) {
        console.error("Failed to fetch gardens:", err);
        setError("Failed to load garden list.");
      } finally {
        setLoading(false);
      }
    })();
  }, [visible]);

  const handleConfirm = () => {
    const selected = gardens.find((g) => g.id === selectedId);
    if (selected) {
      onConfirm(selected.id, selected.name);
    }
    onDismiss();
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={styles.container}
      >
        <Text style={styles.title}>Select a Garden</Text>

        {loading && (
          <View style={styles.centered}>
            <ActivityIndicator size="large" />
          </View>
        )}

        {error && (
          <View style={styles.centered}>
            <Text style={{ color: "red" }}>{error}</Text>
          </View>
        )}

        {!loading && !error && (
          <RadioButton.Group onValueChange={setSelectedId} value={selectedId}>
            <FlatList
              data={gardens}
              keyExtractor={(item) => item.id}
              ItemSeparatorComponent={() => <Divider />}
              renderItem={({ item }) => (
                <RadioButton.Item
                  label={item.name}
                  value={item.id}
                  style={styles.radioItem}
                />
              )}
            />
          </RadioButton.Group>
        )}

        <View style={styles.buttons}>
          <Button onPress={onDismiss}>Cancel</Button>
          <Button
            mode="contained"
            disabled={!selectedId || loading}
            onPress={handleConfirm}
          >
            Confirm
          </Button>
        </View>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 20,
    padding: 20,
    backgroundColor: "white",
    borderRadius: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
    height: 100,
  },
  radioItem: {
    paddingVertical: 4,
  },
  buttons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
});

export default GardenPickerModal;
