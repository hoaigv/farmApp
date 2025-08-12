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
  const [rowLength, setRowLength] = useState<number>(1);
  const [colLength, setColLength] = useState<number>(1);
  const [soil, setSoil] = useState<string>("");

  const optionRows = [1, 2, 3, 4, 5, 6];
  const optionCols = [1, 2, 3, 4];
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

  const handleCreateGarden = async () => {
    if (!name.trim()) {
      Alert.alert("Validation Error", "Please enter a garden name.");
      return;
    }
    if (!soil) {
      Alert.alert("Validation Error", "Please select a soil type.");
      return;
    }

    const data: CreateGardenRequest = {
      name,
      rowLength,
      colLength,
      soil,
    };

    try {
      await createGarden(data);
      // Reset form
      setName("");
      setRowLength(1);
      setColLength(1);
      setSoil("");
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
        {/* Garden Name */}
        <Text className="my-2" style={styles.label}>
          Garden Name :
        </Text>
        <TextInput
          style={styles.input}
          placeholder="Garden Bed 4"
          value={name}
          onChangeText={setName}
        />

        {/* Land Area */}
        <Text className="my-2" style={styles.label}>
          Land area :
        </Text>
        <View style={styles.pickerRow}>
          {/* Rows Picker */}
          <View style={styles.pickerContainer}>
            <Text style={styles.pickerLabel}>Rows</Text>
            <Picker
              selectedValue={rowLength}
              onValueChange={setRowLength}
              style={styles.picker}
              itemStyle={styles.itemStyle}
            >
              {optionRows.map((o) => (
                <Picker.Item key={o} label={`${o} ft`} value={o} />
              ))}
            </Picker>
          </View>

          {/* Cols Picker */}
          <View style={styles.pickerContainer}>
            <Text style={styles.pickerLabel}>Cols</Text>
            <Picker
              selectedValue={colLength}
              onValueChange={setColLength}
              style={styles.picker}
              itemStyle={styles.itemStyle}
            >
              {optionCols.map((o) => (
                <Picker.Item key={o} label={`${o} ft`} value={o} />
              ))}
            </Picker>
          </View>
        </View>

        {/* Soil Type Picker */}
        <Text className="my-2" style={styles.label}>
          Soil Type :
        </Text>
        <View style={styles.soilContainer}>
          {soilTypes.map((type) => (
            <TouchableOpacity
              key={type}
              style={[
                styles.soilButton,
                soil === type && styles.soilButtonSelected,
              ]}
              onPress={() => setSoil(type)}
            >
              <Text
                style={[
                  styles.soilText,
                  soil === type && styles.soilTextSelected,
                ]}
              >
                {type
                  .toLowerCase()
                  .split("_")
                  .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                  .join(" ")}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Create Button */}
      <TouchableOpacity
        onPress={handleCreateGarden}
        className="flex items-center justify-center my-10 mx-40 p-4 bg-primary"
      >
        <Text style={styles.createText}>Create</Text>
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
    fontSize: 16,
    fontWeight: "bold",
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
    height: 200,
  },
  itemStyle: {
    fontSize: 20,
  },
  soilContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginVertical: 8,
  },
  soilButton: {
    borderWidth: 1,
    borderColor: "#4CAF50",
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    margin: 4,
  },
  soilButtonSelected: {
    backgroundColor: "#4CAF50",
  },
  soilText: {
    fontSize: 14,
    color: "#4CAF50",
  },
  soilTextSelected: {
    color: "#fff",
    fontWeight: "600",
  },
  createText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
});
