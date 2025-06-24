// src/screens/EditReminder.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
  Keyboard,
  TouchableWithoutFeedback,
  SafeAreaView,
} from "react-native";
import { Formik } from "formik";
import * as Yup from "yup";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { showError, showSuccess } from "@/utils/flashMessageService";
import { createReminder, updateReminder } from "@/api/reminderApi";
import { Ionicons } from "@expo/vector-icons";

// Types
type Frequency = "ONE_TIME" | "DAILY" | "WEEKLY" | "MONTHLY";
type ReminderStatus = "PENDING" | "DONE" | "SKIPPED";
type IconName = React.ComponentProps<typeof Ionicons>["name"];
type TimeOfDayKey = "MORNING" | "NOON" | "EVENING";
const timeOfDayOptions: {
  key: TimeOfDayKey;
  label: string;
  hour: number;
  minute: number;
}[] = [
  { key: "MORNING", label: "Morning (06:00)", hour: 6, minute: 0 },
  { key: "NOON", label: "Noon (10:00)", hour: 10, minute: 0 },
  { key: "EVENING", label: "Evening (18:00)", hour: 18, minute: 0 },
];
const activities: { key: string; label: string; icon: IconName }[] = [
  { key: "WATERING", label: "Watering", icon: "water" },
  { key: "FERTILIZING", label: "Fertilizing", icon: "leaf" },
  { key: "PRUNING", label: "Pruning", icon: "cut" },
  { key: "PEST_CHECK", label: "Pest Check", icon: "bug" },
  { key: "HARVESTING", label: "Harvesting", icon: "leaf" },
  { key: "SEEDING", label: "Seeding", icon: "flower" },
  { key: "TRANSPLANTING", label: "Transplanting", icon: "swap-horizontal" },
  { key: "SOIL_CHECK", label: "Soil Check", icon: "analytics" },
  { key: "WEEDING", label: "Weeding", icon: "leaf" },
  { key: "OTHER", label: "Other", icon: "ellipse" },
];
const freqs: { key: Frequency; label: string }[] = [
  { key: "ONE_TIME", label: "One-time" },
  { key: "DAILY", label: "Daily" },
  { key: "WEEKLY", label: "Weekly" },
  { key: "MONTHLY", label: "Monthly" },
];
const statuses: { key: ReminderStatus; label: string }[] = [
  { key: "PENDING", label: "Pending" },
  { key: "DONE", label: "Done" },
  { key: "SKIPPED", label: "Skipped" },
];

// Helper: format date to local ISO without timezone Z
const toLocalISODateTime = (date: Date): string => {
  const pad = (n: number) => n.toString().padStart(2, "0");
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
};

// Validation schema
interface FormValues {
  task: string;
  gardenActivity: string;
  frequency: Frequency;
  specificDate: Date | null;
  timeOfDayKey: TimeOfDayKey;
  status: ReminderStatus;
}
const Schema = Yup.object({
  task: Yup.string().trim().required("Task is required"),
  gardenActivity: Yup.string()
    .oneOf(activities.map((a) => a.key))
    .required("Activity is required"),
  frequency: Yup.string()
    .oneOf(freqs.map((f) => f.key))
    .required("Frequency is required"),
  status: Yup.string()
    .oneOf(statuses.map((s) => s.key))
    .required("Status is required"),
  specificDate: Yup.date()
    .nullable()
    .when(
      "frequency",
      (
        frequencyValue: any,
        schema: Yup.DateSchema<Date | null | undefined>
      ) => {
        if (frequencyValue === "ONE_TIME") {
          return schema.required("Date is required for one-time");
        }
        return schema.nullable();
      }
    ),
  timeOfDayKey: Yup.string()
    .oneOf(timeOfDayOptions.map((t) => t.key))
    .required("Time of day is required"),
});

export default function EditReminder() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    mode?: "create" | "edit";
    reminder?: string;
    gardenId?: string;
  }>();
  const mode = params.mode === "edit" ? "edit" : "create";
  const gardenId = params.gardenId ?? "";
  const existing = params.reminder
    ? (JSON.parse(params.reminder) as any)
    : null;

  // Parse existing specificTime
  let existingDate: Date | null = null;
  let existingTimeKey: TimeOfDayKey = timeOfDayOptions[0].key;
  if (existing?.specificTime) {
    const dt = new Date(existing.specificTime);
    existingDate = dt;
    const found = timeOfDayOptions.find((opt) => opt.hour === dt.getHours());
    if (found) existingTimeKey = found.key;
  }

  const initialValues: FormValues = {
    task: existing?.task ?? "",
    gardenActivity: existing?.gardenActivity ?? activities[0].key,
    frequency: existing?.frequency ?? "DAILY",
    specificDate:
      existingDate && existing.frequency === "ONE_TIME" ? existingDate : null,
    timeOfDayKey: existingTimeKey,
    status: existing?.status ?? "PENDING",
  };

  const [showPicker, setShowPicker] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSave = async (values: FormValues) => {
    setSubmitting(true);
    try {
      // Determine specificTime string in local ISO
      let specificTimeISO: string | undefined;
      const todOpt = timeOfDayOptions.find(
        (opt) => opt.key === values.timeOfDayKey
      )!;
      if (values.frequency === "ONE_TIME") {
        if (values.specificDate) {
          const date = new Date(values.specificDate);
          date.setHours(todOpt.hour, todOpt.minute, 0, 0);
          specificTimeISO = toLocalISODateTime(date);
        }
      } else {
        const date = new Date();
        date.setHours(todOpt.hour, todOpt.minute, 0, 0);
        specificTimeISO = toLocalISODateTime(date);
      }

      const payload = {
        task: values.task,
        gardenActivity: values.gardenActivity,
        specificTime: specificTimeISO,
        frequency: values.frequency,
        status: values.status,
        gardenId,
      };

      if (mode === "edit" && existing?.id) {
        await updateReminder({ id: existing.id, ...payload });
        showSuccess("Reminder updated successfully!");
      } else {
        await createReminder(payload);
        showSuccess("Create reminder successfully!");
      }
      router.back();
    } catch (e) {
      console.error(e);
      showError("Failed to save reminder");
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (date: Date) => date.toLocaleDateString();

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            contentContainerStyle={styles.container}
            keyboardShouldPersistTaps="handled"
          >
            <View className="flex-row items-center gap-5">
              <Ionicons
                name="arrow-back"
                size={24}
                color="#007AFF"
                onPress={() => router.back()}
                style={{ marginBottom: 16 }}
              />
              <Text style={styles.header}>
                {mode === "edit" ? "Edit Reminder" : "New Reminder"}
              </Text>
            </View>
            <Formik
              initialValues={initialValues}
              validationSchema={Schema}
              onSubmit={handleSave}
            >
              {({
                handleChange,
                setFieldValue,
                handleSubmit,
                values,
                errors,
                touched,
              }) => (
                <>
                  {/* Task */}
                  <View style={styles.fieldContainer}>
                    <Text style={styles.label}>Task</Text>
                    <View style={styles.inputWrapper}>
                      <Ionicons
                        name="create-outline"
                        size={20}
                        color="#555"
                        style={styles.icon}
                      />
                      <TextInput
                        style={styles.input}
                        onChangeText={handleChange("task")}
                        value={values.task}
                        placeholder="Enter task"
                        placeholderTextColor="#999"
                      />
                    </View>
                    {touched.task && errors.task && (
                      <Text style={styles.error}>{errors.task}</Text>
                    )}
                  </View>
                  {/* Activity */}
                  <View style={styles.fieldContainer}>
                    <Text style={styles.label}>Activity</Text>
                    <View style={styles.optionsRow}>
                      {activities.map((act) => {
                        const selected = values.gardenActivity === act.key;
                        return (
                          <TouchableOpacity
                            key={act.key}
                            style={[
                              styles.optionCard,
                              selected && styles.optionCardSelected,
                            ]}
                            onPress={() =>
                              setFieldValue("gardenActivity", act.key)
                            }
                          >
                            <Ionicons
                              name={act.icon}
                              size={24}
                              color={selected ? "#007AFF" : "#555"}
                              style={styles.icon}
                            />
                            <Text
                              style={[
                                styles.optionLabel,
                                selected && styles.optionLabelSelected,
                              ]}
                            >
                              {act.label}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                    {touched.gardenActivity && errors.gardenActivity && (
                      <Text style={styles.error}>{errors.gardenActivity}</Text>
                    )}
                  </View>
                  {/* Frequency */}
                  <View style={styles.fieldContainer}>
                    <Text style={styles.label}>Frequency</Text>
                    <View style={styles.pickerRow}>
                      {freqs.map((f) => {
                        const selected = values.frequency === f.key;
                        return (
                          <TouchableOpacity
                            key={f.key}
                            style={[
                              styles.freqOption,
                              selected && styles.freqOptionSelected,
                            ]}
                            onPress={() => setFieldValue("frequency", f.key)}
                          >
                            <Text
                              style={[
                                styles.freqLabel,
                                selected && styles.freqLabelSelected,
                              ]}
                            >
                              {f.label}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                    {touched.frequency && errors.frequency && (
                      <Text style={styles.error}>{errors.frequency}</Text>
                    )}
                  </View>
                  {/* Specific Time */}
                  <View style={styles.fieldContainer}>
                    <Text style={styles.label}>Specific Time</Text>
                    {values.frequency === "ONE_TIME" ? (
                      <>
                        <TouchableOpacity
                          onPress={() => setShowPicker(true)}
                          style={styles.inputWrapper}
                        >
                          <Ionicons
                            name="calendar-outline"
                            size={20}
                            color="#555"
                            style={styles.icon}
                          />
                          <Text style={styles.inputText}>
                            {values.specificDate
                              ? formatDate(values.specificDate)
                              : "Select date"}
                          </Text>
                        </TouchableOpacity>
                        {showPicker && (
                          <DateTimePicker
                            value={values.specificDate || new Date()}
                            mode="date"
                            display={
                              Platform.OS === "ios" ? "spinner" : "default"
                            }
                            onChange={(_, date) => {
                              setShowPicker(false);
                              if (date) setFieldValue("specificDate", date);
                            }}
                          />
                        )}
                        {touched.specificDate && errors.specificDate && (
                          <Text style={styles.error}>
                            {errors.specificDate}
                          </Text>
                        )}
                      </>
                    ) : null}
                    {/* Time of day */}
                    <View style={[styles.pickerRow, { marginTop: 10 }]}>
                      {timeOfDayOptions.map((tod) => {
                        const selected = values.timeOfDayKey === tod.key;
                        return (
                          <TouchableOpacity
                            key={tod.key}
                            style={[
                              styles.freqOption,
                              selected && styles.freqOptionSelected,
                            ]}
                            onPress={() =>
                              setFieldValue("timeOfDayKey", tod.key)
                            }
                          >
                            <Text
                              style={[
                                styles.freqLabel,
                                selected && styles.freqLabelSelected,
                              ]}
                            >
                              {tod.label}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                    {touched.timeOfDayKey && errors.timeOfDayKey && (
                      <Text style={styles.error}>{errors.timeOfDayKey}</Text>
                    )}
                  </View>
                  {/* Status (edit only) */}
                  {mode === "edit" && (
                    <View style={styles.fieldContainer}>
                      <Text style={styles.label}>Status</Text>
                      <View style={styles.pickerRow}>
                        {statuses.map((s) => {
                          const selected = values.status === s.key;
                          return (
                            <TouchableOpacity
                              key={s.key}
                              style={[
                                styles.statusOption,
                                selected && styles.statusOptionSelected,
                              ]}
                              onPress={() => setFieldValue("status", s.key)}
                            >
                              <Text
                                style={[
                                  styles.statusLabel,
                                  selected && styles.statusLabelSelected,
                                ]}
                              >
                                {s.label}
                              </Text>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                      {touched.status && errors.status && (
                        <Text style={styles.error}>{errors.status}</Text>
                      )}
                    </View>
                  )}
                  {/* Submit */}
                  <TouchableOpacity
                    style={[styles.button, submitting && styles.buttonDisabled]}
                    onPress={handleSubmit as any}
                    disabled={submitting}
                  >
                    {submitting ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text style={styles.buttonText}>
                        {mode === "edit"
                          ? "Update Reminder"
                          : "Create Reminder"}
                      </Text>
                    )}
                  </TouchableOpacity>
                </>
              )}
            </Formik>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#f9f9f9" },
  flex: { flex: 1 },
  container: { padding: 16, backgroundColor: "#f9f9f9" },
  header: { fontSize: 24, fontWeight: "600", marginBottom: 16, color: "#333" },
  fieldContainer: { marginBottom: 20 },
  label: { fontSize: 16, fontWeight: "500", color: "#333", marginBottom: 6 },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    paddingHorizontal: 10,
    paddingVertical: Platform.OS === "ios" ? 12 : 8,
  },
  icon: { marginRight: 8 },
  input: { flex: 1, fontSize: 16, color: "#333", padding: 0 },
  inputText: { flex: 1, fontSize: 12, color: "#333" },
  optionsRow: { flexDirection: "row", flexWrap: "wrap" },
  optionCard: {
    width: "48%",
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    margin: "1%",
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "transparent",
  },
  optionCardSelected: { borderColor: "#007AFF", backgroundColor: "#E6F0FF" },
  optionLabel: { marginLeft: 8, fontSize: 14, color: "#555" },
  optionLabelSelected: { color: "#007AFF" },
  pickerRow: { flexDirection: "row", flexWrap: "wrap" },
  freqOption: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#007AFF",
    backgroundColor: "#fff",
  },
  freqOptionSelected: { backgroundColor: "#007AFF" },
  freqLabel: { fontSize: 14, color: "#007AFF" },
  freqLabelSelected: { color: "#fff" },
  statusOption: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#555",
    backgroundColor: "#fff",
  },
  statusOptionSelected: { backgroundColor: "#555", borderColor: "#555" },
  statusLabel: { fontSize: 14, color: "#555" },
  statusLabelSelected: { color: "#fff" },
  button: {
    backgroundColor: "#007AFF",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 30,
  },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  error: { color: "red", fontSize: 12, marginTop: 4 },
});
