import React, { useState } from "react";
import { View, StyleSheet, Text, ScrollView } from "react-native";
import {
  Portal,
  Modal,
  Button,
  RadioButton,
  Searchbar,
} from "react-native-paper";
import { storeLocation } from "@/store/LocationStorage"; // 🟡 Đường dẫn tùy cấu trúc dự án

interface LocationPickerModalProps {
  visible: boolean;
  onDismiss: () => void;
  onLocationSaved?: (location: string) => void; // optional: để parent biết location đã lưu
}

const cities = [
  // Vietnamese cities (English, no diacritics)
  "Ha Noi",
  "Da Nang",
  "Ho Chi Minh",
  "Hue",
  "Can Tho",
  "Nha Trang",
  "Ha Long",
  // International cities
  "Tokyo",
  "New York",
  "London",
  "Paris",
  "Berlin",
  "Seoul",
  "Bangkok",
  "Singapore",
  "Sydney",
  "Toronto",
];

const LocationPickerModal: React.FC<LocationPickerModalProps> = ({
  visible,
  onDismiss,
  onLocationSaved,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState<string>("");

  const filteredCities = cities.filter((city) =>
    city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleConfirm = async () => {
    if (!selectedCity) return;

    try {
      await storeLocation(selectedCity); // ✅ Lưu trực tiếp
      onLocationSaved?.(selectedCity); // ✅ Gửi về parent (nếu cần)
      onDismiss(); // ✅ Đóng modal
    } catch (error) {
      console.error("❌ Error saving location:", error);
    }
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={styles.container}
      >
        <Text style={styles.title}>Select Your Location</Text>

        <Searchbar
          placeholder="Search city..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchBar}
        />

        <ScrollView style={{ maxHeight: 200 }}>
          <RadioButton.Group
            onValueChange={(value) => setSelectedCity(value)}
            value={selectedCity}
          >
            {filteredCities.map((city) => (
              <View style={styles.row} key={city}>
                <RadioButton value={city} />
                <Text>{city}</Text>
              </View>
            ))}
          </RadioButton.Group>
        </ScrollView>

        <Button
          mode="contained"
          onPress={handleConfirm}
          disabled={!selectedCity}
          style={styles.confirmBtn}
        >
          Confirm
        </Button>

        <Button mode="outlined" onPress={onDismiss} style={styles.closeBtn}>
          Cancel
        </Button>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    margin: 20,
    padding: 24,
    borderRadius: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 12,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 6,
  },
  searchBar: {
    marginBottom: 12,
  },
  confirmBtn: {
    marginTop: 16,
  },
  closeBtn: {
    marginTop: 10,
  },
});

export default LocationPickerModal;
