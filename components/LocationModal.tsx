import React from "react";
import { View } from "react-native";
import { Button, Modal, Portal, RadioButton, Text } from "react-native-paper";

type Props = {
  visible: boolean;
  onDismiss: () => void;
  value: string;
  onConfirm: (value: string) => void;
};

const LocationModal = ({ visible, onDismiss, value, onConfirm }: Props) => {
  const [selected, setSelected] = React.useState(value);

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={{
          backgroundColor: "white",
          padding: 20,
          margin: 20,
          borderRadius: 10,
        }}
      >
        <Text style={{ fontWeight: "bold", fontSize: 16, marginBottom: 10 }}>
          Update Positon
        </Text>
        <RadioButton.Group onValueChange={setSelected} value={selected}>
          <RadioButton.Item label="🏡Gargen" value="garden" />
          <RadioButton.Item label="🏠 Pot" value="pot" />
        </RadioButton.Group>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginTop: 20,
          }}
        >
          <Button onPress={onDismiss}>Dismiss</Button>
          <Button mode="contained" onPress={() => onConfirm(selected)}>
            Confirm
          </Button>
        </View>
      </Modal>
    </Portal>
  );
};

export default LocationModal;
