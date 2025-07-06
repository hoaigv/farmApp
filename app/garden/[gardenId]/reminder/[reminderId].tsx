import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  SafeAreaView,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import DateTimePicker from "@react-native-community/datetimepicker";
import {
  getReminderById,
  updateReminder,
  ReminderResponse,
  ActionType,
  ScheduleType,
  FrequencyType,
  WeekDay,
} from "@/api/reminderApi";
import Header from "@/components/Header";

// Theme constants
const colors = {
  primary: "#007AFF",
  background: "#fff",
  panelBg: "#f9f9f9",
  border: "#ccc",
  error: "#FF3B30",
};
const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
};
const fontSizes = {
  base: 16,
  small: 14,
  large: 18,
};

// Option arrays
const actionOptions: ActionType[] = [
  "WATERING",
  "PRUNING",
  "FERTILIZING",
  "PEST_CHECK",
  "HARVESTING",
  "SEEDING",
  "TRANSPLANTING",
  "SOIL_CHECK",
  "WEEDING",
  "OTHER",
];
const scheduleOptions: ScheduleType[] = ["FIXED", "RECURRING"];
const frequencyOptions: FrequencyType[] = ["DAILY", "WEEKLY", "MONTHLY"];

// Sub-components
function RadioGroup<T extends string>({
  label,
  options,
  selected,
  onChange,
  disabled = false,
}: {
  label: string;
  options: T[];
  selected: T;
  onChange: (v: T) => void;
  disabled?: boolean;
}) {
  return (
    <View style={{ marginBottom: spacing.lg }} accessible>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.radioGroup}>
        {options.map((opt) => (
          <TouchableOpacity
            key={opt}
            onPress={() => !disabled && onChange(opt)}
            style={[
              styles.radioOption,
              selected === opt ? styles.radioSelected : {},
            ]}
            accessibilityState={{ selected: selected === opt }}
          >
            <Text
              style={
                selected === opt ? styles.radioTextSelected : styles.radioText
              }
            >
              {opt}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const WeekDayPicker = React.memo(
  ({
    selectedDays,
    onToggle,
  }: {
    selectedDays: WeekDay[];
    onToggle: (day: WeekDay) => void;
  }) => (
    <View style={{ marginBottom: spacing.lg }} accessible>
      <Text style={styles.label}>Days of Week</Text>
      <View style={styles.weekDays}>
        {(
          [
            "MONDAY",
            "TUESDAY",
            "WEDNESDAY",
            "THURSDAY",
            "FRIDAY",
            "SATURDAY",
            "SUNDAY",
          ] as WeekDay[]
        ).map((day) => {
          const sel = selectedDays.includes(day);
          return (
            <TouchableOpacity
              key={day}
              onPress={() => onToggle(day)}
              style={[styles.dayOption, sel && styles.daySelected]}
              accessibilityState={{ selected: sel }}
            >
              <Text style={sel ? styles.selectedText : styles.optionText}>
                {day.slice(0, 3)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  )
);
WeekDayPicker.displayName = "WeekDayPicker";

function DateTimeField({
  label,
  value,
  mode,
  onChange,
  disabled = false,
}: {
  label: string;
  value: Date;
  mode: "date" | "time";
  onChange: (date: Date) => void;
  disabled?: boolean;
}) {
  return (
    <View style={styles.panel} accessible>
      <Text style={styles.label}>{label}</Text>
      <DateTimePicker
        value={value}
        mode={mode}
        display="default"
        onChange={(_, date) => date && onChange(date)}
        disabled={disabled}
      />
    </View>
  );
}

// Custom hook for reminder fetch/update
function useReminder(id: string) {
  const [reminder, setReminder] = useState<ReminderResponse | null>(null);
  const [form, setForm] = useState<Partial<ReminderResponse>>({
    daysOfWeek: [],
    timeOfDay: "00:00",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getReminderById(id)
      .then((res) => {
        setReminder(res.result);
        setForm(res.result);
      })
      .catch(() => setError("Failed to load reminder"))
      .finally(() => setLoading(false));
  }, [id]);

  const update = useCallback(async () => {
    if (!reminder) return;
    await updateReminder({ reminderId: id, ...form });
  }, [form, id, reminder]);

  return { reminder, form, setForm, loading, error, update };
}

export default function ReminderDetail() {
  const { reminderId, mode } = useLocalSearchParams<{
    reminderId: string;
    mode?: "edit" | "read";
  }>();
  const router = useRouter();
  const isEdit = mode === "edit";
  const { reminder, form, setForm, loading, error, update } = useReminder(
    reminderId!
  );

  const timeValue = useMemo(() => {
    const [h, m] = (form.timeOfDay || "00:00").split(":").map(Number);
    const dt = new Date();
    dt.setHours(h, m, 0);
    return dt;
  }, [form.timeOfDay]);

  const toggleDay = (day: WeekDay) =>
    setForm((prev) => ({
      ...prev,
      daysOfWeek: prev.daysOfWeek?.includes(day)
        ? prev.daysOfWeek.filter((d) => d !== day)
        : [...(prev.daysOfWeek || []), day],
    }));

  if (loading)
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  if (error)
    return (
      <View style={styles.center}>
        <Text>{error}</Text>
      </View>
    );
  if (!reminder)
    return (
      <View style={styles.center}>
        <Text>Reminder not found.</Text>
      </View>
    );

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Reminder Details" showBack />
      <ScrollView contentContainerStyle={{ padding: spacing.lg }}>
        {/* Title */}
        {isEdit ? (
          <TextInput
            style={styles.input}
            value={form.title}
            onChangeText={(t) => setForm((p) => ({ ...p, title: t }))}
            accessibilityLabel="Reminder title"
          />
        ) : (
          <Text style={styles.value}>{reminder.title}</Text>
        )}

        {/* Action */}
        <RadioGroup
          label="Action"
          options={actionOptions}
          selected={form.actionType!}
          onChange={(v) => setForm((p) => ({ ...p, actionType: v }))}
          disabled={!isEdit}
        />

        {/* Schedule */}
        <RadioGroup
          label="Schedule Type"
          options={scheduleOptions}
          selected={form.scheduleType!}
          onChange={(v) => setForm((p) => ({ ...p, scheduleType: v }))}
          disabled={!isEdit}
        />

        {form.scheduleType === "FIXED" && (
          <DateTimeField
            label="Time"
            value={timeValue}
            mode="time"
            onChange={(d) =>
              setForm((p) => ({
                ...p,
                timeOfDay: d.toTimeString().slice(0, 5),
              }))
            }
            disabled={!isEdit}
          />
        )}
        {form.scheduleType === "RECURRING" && (
          <>
            <RadioGroup
              label="Frequency"
              options={frequencyOptions}
              selected={form.frequency!}
              onChange={(v) => setForm((p) => ({ ...p, frequency: v }))}
              disabled={!isEdit}
            />
            <DateTimeField
              label="Time of Day"
              value={timeValue}
              mode="time"
              onChange={(d) =>
                setForm((p) => ({
                  ...p,
                  timeOfDay: d.toTimeString().slice(0, 5),
                }))
              }
              disabled={!isEdit}
            />
            {form.frequency === "WEEKLY" && (
              <WeekDayPicker
                selectedDays={form.daysOfWeek!}
                onToggle={toggleDay}
              />
            )}
            {form.frequency === "MONTHLY" && (
              <View style={{ marginBottom: spacing.lg }} accessible>
                <Text style={styles.label}>Day of Month</Text>
                {isEdit ? (
                  <TextInput
                    style={styles.input}
                    keyboardType="number-pad"
                    value={String(form.dayOfMonth || "")}
                    onChangeText={(v) =>
                      setForm((p) => ({ ...p, dayOfMonth: Number(v) }))
                    }
                    accessibilityLabel="Day of month"
                  />
                ) : (
                  <Text>{form.dayOfMonth}</Text>
                )}
              </View>
            )}
          </>
        )}

        {/* Save/Edit */}
        <TouchableOpacity
          style={styles.saveButton}
          onPress={async () => {
            if (isEdit) {
              try {
                await update();
                Alert.alert("Success", "Updated successfully");
                router.back();
              } catch {
                Alert.alert("Error", "Update failed");
              }
            } else {
              router.replace(
                `/garden/${reminder.gardenId}/reminder/${reminder.id}?mode=edit`
              );
            }
          }}
          accessibilityRole="button"
        >
          <Text style={styles.saveText}>
            {isEdit ? "Save Changes" : "Edit"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  label: {
    fontSize: fontSizes.base,
    fontWeight: "500",
    marginBottom: spacing.xs,
  },
  value: { fontSize: fontSizes.base, marginBottom: spacing.md },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: spacing.sm,
    padding: spacing.sm,
    marginBottom: spacing.md,
    fontSize: fontSizes.base,
  },
  radioGroup: { flexDirection: "row", flexWrap: "wrap", marginTop: spacing.xs },
  radioOption: {
    padding: spacing.sm,
    borderRadius: spacing.sm,
    backgroundColor: colors.panelBg,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  radioSelected: { backgroundColor: colors.primary },
  radioText: { fontSize: fontSizes.small },
  radioTextSelected: {
    fontSize: fontSizes.small,
    color: colors.background,
    fontWeight: "600",
  },
  panel: {
    padding: spacing.md,
    backgroundColor: colors.panelBg,
    borderRadius: spacing.sm,
    marginBottom: spacing.lg,
  },
  weekDays: { flexDirection: "row", flexWrap: "wrap", marginTop: spacing.xs },
  dayOption: {
    width: 40,
    height: 40,
    margin: spacing.xs,
    borderRadius: 20,
    backgroundColor: colors.panelBg,
    justifyContent: "center",
    alignItems: "center",
  },
  daySelected: { backgroundColor: colors.primary },
  optionText: { fontSize: fontSizes.small },
  selectedText: { color: colors.background, fontWeight: "600" },
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: spacing.sm,
    padding: spacing.md,
    alignItems: "center",
    marginTop: spacing.lg,
  },
  saveText: {
    color: colors.background,
    fontSize: fontSizes.base,
    fontWeight: "600",
  },
});
