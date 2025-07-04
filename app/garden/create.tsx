// GardenDimensionPicker.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Platform,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import Header from "@/components/Header";
import { useRouter } from "expo-router";
import { createGarden } from "@/api/gardenApi";
import { CreateGardenRequest } from "@/api/gardenApi";
export default function GardenDimensionPicker() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [rowLength, setrowLength] = useState<number>(1);
  const [colLength, setcolLength] = useState<number>(1);
  const optionRows = [1, 2, 3, 4, 5, 6];
  const optionCols = [1, 2, 3, 4];
  const handleCreateGarden = async () => {
    if (!name.trim()) {
      Alert.alert("Validation Error", "Please enter a garden name.");
      return;
    }

    const data: CreateGardenRequest = {
      name,
      rowLength,
      colLength,
    };

    try {
      await createGarden(data);
      setName(""); // Reset name input after successful creation
      setrowLength(1); // Reset row length to default
      setcolLength(1); // Reset column length to default
      // Navigate to the newly created garden
      router.back();
    } catch (error: any) {
      console.error("Failed to create garden:", error);
      Alert.alert(
        "Error",
        error?.response?.data?.message || "An unexpected error occurred"
      );
    }
  };
  return (
    <SafeAreaView style={styles.container}>
      <Header title="Create Garden" showBack={true} />
      <View className="p-2">
        <Text className="my-2" style={{ fontSize: 16, fontWeight: "bold" }}>
          Garden Name :
        </Text>
        <TextInput
          style={styles.input}
          placeholder="Garden Bed 4"
          value={name}
          onChangeText={setName}
        />
        <Text className="my-2" style={{ fontSize: 16, fontWeight: "bold" }}>
          Land area :
        </Text>
        <View style={styles.pickerRow}>
          {/* Width Picker */}
          <View style={styles.pickerContainer}>
            <Text style={styles.pickerLabel}>Rows</Text>
            <Picker
              selectedValue={rowLength}
              onValueChange={setrowLength}
              style={styles.picker}
              itemStyle={styles.itemStyle}
            >
              {optionRows.map((o) => (
                <Picker.Item key={o} label={`${o} ft`} value={o} />
              ))}
            </Picker>
          </View>

          {/* Length Picker */}
          <View style={styles.pickerContainer}>
            <Text style={styles.pickerLabel}>Cols</Text>
            <Picker
              selectedValue={colLength}
              onValueChange={setcolLength}
              style={styles.picker}
              itemStyle={styles.itemStyle}
            >
              {optionCols.map((o) => (
                <Picker.Item key={o} label={`${o} ft`} value={o} />
              ))}
            </Picker>
          </View>
        </View>
      </View>
      <TouchableOpacity
        onPress={() => handleCreateGarden()}
        className="flex items-center justify-center my-10 mx-40 p-4 bg-primary "
      >
        <Text style={{ fontSize: 16, fontWeight: "600", color: "white" }}>
          Create
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    flex: 1,
  },
  label: {
    fontSize: 14,
    color: "#555",
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: "#4CAF50",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === "ios" ? 12 : 8,
    fontSize: 16,
    marginBottom: 16,
  },
  pickerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  pickerContainer: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginHorizontal: 4,
    alignItems: "center",
    paddingVertical: 8,
  },
  pickerLabel: {
    fontSize: 14,
    color: "#555",
    marginBottom: 4,
  },
  picker: {
    width: "100%",
    height: 200, // chiều cao đủ để nhìn thấy wheel
  },
  itemStyle: {
    fontSize: 20, // kích thước text lớn cho dễ đọc
  },
});
