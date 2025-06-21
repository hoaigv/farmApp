import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { useLocalSearchParams } from "expo-router";
import Header from "@/components/Header";
type Reminder = {
  id: string;
  action: string;
  frequency: string;
  status: "active" | "completed" | "paused";
};

// Mock fetch/create/update
const fakeFetchReminder = async (id: string): Promise<Reminder> => {
  return {
    id,
    action: "Water the plants",
    frequency: "3 times/week",
    status: "active",
  };
};

// Reusable component for both view and input
const FieldRow: React.FC<{
  label: string;
  value: string;
  editable: boolean;
  onChange?: (text: string) => void;
  placeholder?: string;
  multiline?: boolean;
}> = ({ label, value, editable, onChange, placeholder, multiline }) => (
  <View style={styles.formGroup}>
    <Text style={styles.label}>{label}</Text>
    {editable ? (
      <TextInput
        style={[styles.input, multiline && styles.textArea]}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        multiline={multiline}
      />
    ) : (
      <Text style={styles.readOnlyText}>{value}</Text>
    )}
  </View>
);

export default function ReminderDetailScreen() {
  const router = useRouter();
  const { reminderId, mode } = useLocalSearchParams() as {
    reminderId: string;
    mode?: "create" | "edit" | "view";
  };

  const isCreate = mode === "create";
  const isEdit = mode === "edit";
  const isView = !mode || mode === "view";

  const [actionText, setActionText] = useState("");
  const [frequency, setFrequency] = useState("");
  const [status, setStatus] = useState<"active" | "completed" | "paused">(
    "active"
  );

  useEffect(() => {
    if (!isCreate) {
      fakeFetchReminder(reminderId).then((data) => {
        setActionText(data.action);
        setFrequency(data.frequency);
        setStatus(data.status);
      });
    }
  }, []);

  const handleSave = () => {
    if (!actionText || !frequency) {
      alert("Please fill in all required fields.");
      return;
    }
    if (isCreate) {
      alert(`Created successfully: ${actionText}`);
    } else if (isEdit) {
      alert(`Updated successfully: ${actionText}`);
    }
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title={
          isCreate
            ? "Create Reminder"
            : isEdit
            ? "Edit Reminder"
            : "Reminder Details"
        }
        showBack={true}
        onBack={() => router.back()}
        rightElement={
          isCreate || isEdit ? (
            <TouchableOpacity onPress={handleSave}>
              <Text style={{ color: "#007bff", fontSize: 16 }}>Save</Text>
            </TouchableOpacity>
          ) : null
        }
      />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
          <Text style={styles.headerText}>
            {isCreate
              ? "Create Reminder"
              : isEdit
              ? "Edit Reminder"
              : "Reminder Details"}
          </Text>

          <FieldRow
            label="Action"
            value={actionText}
            editable={isCreate || isEdit}
            onChange={setActionText}
            placeholder="e.g. Watering"
          />

          <FieldRow
            label="Frequency"
            value={frequency}
            editable={isCreate || isEdit}
            onChange={setFrequency}
            placeholder="e.g. 3 times/week or daily at 8:00 AM"
          />

          <FieldRow
            label="Status"
            value={status}
            editable={isCreate || isEdit}
            onChange={(text) => setStatus(text as any)}
            placeholder="active / completed / paused"
          />

          {(isCreate || isEdit) && (
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  headerText: { fontSize: 20, fontWeight: "600", marginBottom: 24 },
  formGroup: { marginBottom: 16 },
  label: { fontSize: 14, color: "#444", marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 10,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
  },
  textArea: { height: 80, textAlignVertical: "top" },
  readOnlyText: {
    fontSize: 16,
    color: "#333",
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  saveButton: {
    backgroundColor: "#007bff",
    padding: 12,
    borderRadius: 6,
    alignItems: "center",
    marginTop: 24,
  },
  saveButtonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
