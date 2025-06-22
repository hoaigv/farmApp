import React, { useEffect, useState } from "react";
import { View, StyleSheet, FlatList, Image } from "react-native";
import {
  Modal,
  Portal,
  Text,
  RadioButton,
  TextInput,
  Button,
  ActivityIndicator,
  List,
} from "react-native-paper";
import { getMyPlantInventories, PlantInventory } from "@/api/plantIventoryApi";
import { crops } from "@/data/image";
type Props = {
  visible: boolean;
  onDismiss: () => void;
  onConfirm: (inventory: PlantInventory, quantity: number) => void;
};

const InventoryModal = ({ visible, onDismiss, onConfirm }: Props) => {
  const [inventories, setInventories] = useState<PlantInventory[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedId, setSelectedId] = useState<string>("");
  const [quantity, setQuantity] = useState<string>("0");
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (visible) {
      setLoading(true);
      getMyPlantInventories()
        .then((data) => setInventories(data))
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    } else {
      setSelectedId("");
      setQuantity("0");
      setError("");
    }
  }, [visible]);

  const selectedInventory = inventories.find((inv) => inv.id === selectedId);

  const validateQuantity = (value: string) => {
    setQuantity(value);
    setError("");
    const num = parseInt(value, 10);
    if (
      selectedInventory &&
      num > selectedInventory.perCellMax &&
      num > 0 &&
      num !== null
    ) {
      setError(`Max per cell is ${selectedInventory.perCellMax}`);
    }
  };

  const handleConfirm = () => {
    if (!selectedInventory) return;
    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty <= 0) {
      setError("Please enter a valid quantity");
      return;
    }
    if (qty > selectedInventory.perCellMax) {
      setError(`Max per cell is ${selectedInventory.perCellMax}`);
      return;
    }
    onConfirm(selectedInventory, qty);
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={styles.container}
      >
        <Text style={styles.title}>Choose plant variety & quantity</Text>
        {loading ? (
          <ActivityIndicator style={{ marginVertical: 20 }} />
        ) : (
          <FlatList
            data={inventories}
            keyExtractor={(item) => item.id}
            style={styles.list}
            renderItem={({ item }) => (
              <List.Item
                title={item.name}
                description={`Left: ${item.inventoryQuantity} — Max/cell: ${item.perCellMax}`}
                left={() => (
                  <Image
                    source={crops[item.icon as keyof typeof crops]} // Replace with actual image source
                    style={styles.avatar}
                  />
                )}
                right={() => (
                  <View style={{ borderColor: "black", borderWidth: 1 }}>
                    <RadioButton
                      value={item.id}
                      status={item.id === selectedId ? "checked" : "unchecked"}
                      onPress={() => setSelectedId(item.id)}
                    />
                  </View>
                )}
              />
            )}
          />
        )}

        {selectedInventory && (
          <>
            <TextInput
              label="Amount you want to plant"
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
            disabled={
              !selectedInventory || parseInt(quantity, 10) <= 0 || !!error
            }
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
    backgroundColor: "white",
    margin: 20,
    borderRadius: 10,
    padding: 16,
    // remove maxHeight to allow flex
    height: 400,
  },
  title: {
    fontWeight: "bold",
    fontSize: 18,
    marginBottom: 12,
  },
  list: {
    flex: 1,
    marginBottom: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
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
  },
});

export default InventoryModal;
