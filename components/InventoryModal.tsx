import React, { useEffect, useState, useCallback } from "react";
import { View, StyleSheet, FlatList, Image } from "react-native";
import {
  Portal,
  Modal,
  Text,
  TextInput,
  Button,
  ActivityIndicator,
  List,
  Snackbar,
  IconButton,
} from "react-native-paper";
import {
  getMyPlantInventories,
  PlantInventoryEntry,
} from "@/api/plantIventoryApi";
import { crops } from "@/data/image";

type Props = {
  visible: boolean;
  onDismiss: () => void;
  onConfirm: (inventory: PlantInventoryEntry, quantity: number) => void;
};

const InventoryModal = ({ visible, onDismiss, onConfirm }: Props) => {
  const [inventories, setInventories] = useState<PlantInventoryEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedId, setSelectedId] = useState<string>("");
  const [quantity, setQuantity] = useState<string>("0");
  const [error, setError] = useState<string>("");
  const [fetchError, setFetchError] = useState<string>("");

  const loadInventories = useCallback(() => {
    setLoading(true);
    getMyPlantInventories()
      .then(setInventories)
      .catch((err) => {
        console.error(err);
        setFetchError("Failed to load inventories");
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (visible) {
      loadInventories();
    } else {
      setSelectedId("");
      setQuantity("0");
      setError("");
      setFetchError("");
    }
  }, [visible, loadInventories]);

  const selectedInventory = inventories.find((inv) => inv.id === selectedId);

  const validateQuantity = useCallback(
    (value: string) => {
      setQuantity(value);
      setError("");
      const num = parseInt(value, 10);
      if (isNaN(num) || num <= 0) {
        setError("Please enter a valid quantity");
        return;
      }
      if (selectedInventory && num > selectedInventory.numberOfVariety) {
        setError(`Max available is ${selectedInventory.numberOfVariety}`);
      }
    },
    [selectedInventory]
  );

  const handleConfirm = useCallback(() => {
    if (!selectedInventory) return;
    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty <= 0) {
      setError("Please enter a valid quantity");
      return;
    }
    if (qty > selectedInventory.numberOfVariety) {
      setError(`Max available is ${selectedInventory.numberOfVariety}`);
      return;
    }
    onConfirm(selectedInventory, qty);
  }, [quantity, selectedInventory, onConfirm]);

  const renderHeader = () => (
    <>
      <Text style={styles.title}>Choose plant & quantity</Text>
      {loading && <ActivityIndicator style={{ marginVertical: 20 }} />}
    </>
  );

  const renderFooter = () => (
    <>
      {selectedInventory && (
        <>
          <TextInput
            label="Quantity"
            value={quantity}
            keyboardType="numeric"
            onChangeText={validateQuantity}
            style={styles.input}
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}
        </>
      )}
      <View style={styles.actions}>
        <Button onPress={onDismiss}>Cancel</Button>
        <Button
          mode="contained"
          disabled={!selectedInventory || !!error}
          onPress={handleConfirm}
        >
          Confirm
        </Button>
      </View>
      <Snackbar
        visible={!!fetchError}
        onDismiss={() => setFetchError("")}
        action={{ label: "Retry", onPress: loadInventories }}
      >
        {fetchError}
      </Snackbar>
    </>
  );

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={styles.container}
      >
        {renderHeader()}
        <FlatList
          data={inventories}
          keyExtractor={(item) => item.id}
          extraData={selectedId}
          renderItem={({ item }) => (
            <List.Item
              title={item.plantVariety.name}
              description={`Available: ${item.numberOfVariety}`}
              left={() => (
                <Image
                  source={
                    crops[item.plantVariety.iconLink as keyof typeof crops] || {
                      uri: item.plantVariety.iconLink,
                    }
                  }
                  style={styles.avatar}
                />
              )}
              right={() => (
                <IconButton
                  icon={
                    item.id === selectedId
                      ? "radiobox-marked"
                      : "radiobox-blank"
                  }
                  onPress={() => setSelectedId(item.id)}
                  accessibilityLabel={`Select ${item.plantVariety.name}`}
                />
              )}
              onPress={() => setSelectedId(item.id)}
            />
          )}
          contentContainerStyle={{ flexGrow: 0 }}
        />
        {renderFooter()}
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    margin: 20,
    borderRadius: 10,
    padding: 16,
  },
  title: {
    fontWeight: "bold",
    fontSize: 18,
    marginBottom: 12,
  },
  input: {
    marginBottom: 4,
  },
  error: {
    color: "red",
    marginBottom: 8,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginVertical: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
});

export default InventoryModal;
