import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Button, Modal, Portal, Text, TextInput } from "react-native-paper";

type Props = {
  visible: boolean;
  name: string;
  onDismiss: () => void;
  onConfirm: (newName: string) => void;
};

const EditNameModal = ({ visible, name, onDismiss, onConfirm }: Props) => {
  const [newName, setNewName] = useState(name);

  useEffect(() => {
    setNewName(name); // Reset name when modal opens
  }, [visible, name]);

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={styles.container}
      >
        <Text style={styles.title}>Edit plant name</Text>
        <TextInput
          value={newName}
          onChangeText={setNewName}
          placeholder="Enter new plant name"
          style={styles.input}
        />
        <View style={styles.buttonRow}>
          <Button onPress={onDismiss}>Cancel</Button>
          <Button mode="contained" onPress={() => onConfirm(newName)}>
            Save
          </Button>
        </View>
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
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 10,
  },
  input: {
    marginBottom: 20,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
});

export default EditNameModal;
