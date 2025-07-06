import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Modal,
  FlatList,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Formik, FieldArray, FormikHelpers } from "formik";
import * as Yup from "yup";
import DateTimePicker from "@react-native-community/datetimepicker";
import {
  createReminder,
  CreateReminderRequest,
  ActionType,
  ScheduleType,
  FrequencyType,
  WeekDay,
} from "@/api/reminderApi";
import Header from "@/components/Header";
import { FontAwesome5, MaterialIcons } from "@expo/vector-icons";

// Custom Select
const CustomSelect = ({
  label,
  options,
  selected,
  onSelect,
}: {
  label: string;
  options: string[];
  selected?: string;
  onSelect: (val: string) => void;
}) => {
  const [open, setOpen] = useState(false);
  return (
    <View style={s.selectContainer}>
      <Text style={s.label}>{label}</Text>
      <TouchableOpacity style={s.selectBox} onPress={() => setOpen(true)}>
        <Text style={s.selectText}>{selected}</Text>
        <FontAwesome5 name="chevron-down" size={16} />
      </TouchableOpacity>
      <Modal transparent visible={open} animationType="fade">
        <TouchableOpacity style={s.overlay} onPress={() => setOpen(false)} />
        <View style={s.dropdown}>
          <FlatList
            data={options}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={s.option}
                onPress={() => {
                  onSelect(item);
                  setOpen(false);
                }}
              >
                <Text style={s.optionText}>{item}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </Modal>
    </View>
  );
};

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
const weekDays: WeekDay[] = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
];

const validationSchema = Yup.object().shape({
  title: Yup.string().required("Title is required"),
  actionType: Yup.string().oneOf(actionOptions).required(),
  scheduleType: Yup.string().oneOf(scheduleOptions).required(),
  fixedDateTime: Yup.date().when("scheduleType", {
    is: "FIXED",
    then: (schema) => schema.required("Date & time required"),
  }),
  frequency: Yup.string().when("scheduleType", {
    is: "RECURRING",
    then: (schema) =>
      schema.oneOf(frequencyOptions).required("Select frequency"),
  }),
  timeOfDay: Yup.string().when("scheduleType", {
    is: "RECURRING",
    then: (schema) => schema.required("Select time"),
  }),
  daysOfWeek: Yup.array().when(["scheduleType", "frequency"], {
    is: (s: any, f: any) => s === "RECURRING" && f === "WEEKLY",
    then: (schema) => schema.min(1, "Pick at least one day"),
  }),
  dayOfMonth: Yup.number().when(["scheduleType", "frequency"], {
    is: (s: any, f: any) => s === "RECURRING" && f === "MONTHLY",
    then: (schema) =>
      schema.min(1, "1-31").max(31, "1-31").required("Day required"),
  }),
});

export default function CreateReminderScreen() {
  const router = useRouter();
  const { gardenId } = useLocalSearchParams<{ gardenId: string }>();
  const [loading, setLoading] = useState(false);

  const [showFixedDate, setShowFixedDate] = useState(false);
  const [showFixedTime, setShowFixedTime] = useState(false);
  const [showRecurringTime, setShowRecurringTime] = useState(false);

  const initialValues: CreateReminderRequest = {
    title: "",
    actionType: actionOptions[0],
    scheduleType: scheduleOptions[0],
    fixedDateTime: new Date().toISOString(),
    frequency: frequencyOptions[0],
    timeOfDay: new Date().toTimeString().slice(0, 5),
    daysOfWeek: [],
    dayOfMonth: 1,
    status: "PENDING",
    gardenId: gardenId!,
  };

  const toLocalISOString = (date: Date) => {
    return new Date(
      date.getTime() - date.getTimezoneOffset() * 60000
    ).toISOString();
  };

  const handleSubmit = async (
    values: CreateReminderRequest,
    { setSubmitting }: FormikHelpers<CreateReminderRequest>
  ) => {
    setLoading(true);
    try {
      values.fixedDateTime = toLocalISOString(new Date(values.fixedDateTime!));
      await createReminder(values);
      router.back();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={s.container}>
      <Header title="Create Reminder" showBack />
      <KeyboardAvoidingView
        style={s.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({
            handleChange,
            handleBlur,
            handleSubmit,
            values,
            errors,
            touched,
            setFieldValue,
            isSubmitting,
          }) => (
            <>
              <ScrollView contentContainerStyle={s.form}>
                <Text style={s.section}>1. Details</Text>
                <TextInput
                  style={s.input}
                  placeholder="Title"
                  onChangeText={handleChange("title")}
                  onBlur={handleBlur("title")}
                  value={values.title}
                />
                {touched.title && errors.title && (
                  <Text style={s.error}>{errors.title}</Text>
                )}

                <CustomSelect
                  label="Action"
                  options={actionOptions}
                  selected={values.actionType}
                  onSelect={(v) => setFieldValue("actionType", v)}
                />
                {touched.actionType && errors.actionType && (
                  <Text style={s.error}>{errors.actionType}</Text>
                )}

                <Text style={s.section}>2. Schedule</Text>
                <CustomSelect
                  label="Schedule Type"
                  options={scheduleOptions}
                  selected={values.scheduleType}
                  onSelect={(v) => setFieldValue("scheduleType", v)}
                />
                {touched.scheduleType && errors.scheduleType && (
                  <Text style={s.error}>{errors.scheduleType}</Text>
                )}

                {values.scheduleType === "FIXED" && (
                  <>
                    <View style={s.dateTimeRow}>
                      <TouchableOpacity
                        style={s.dateBtn}
                        onPress={() => setShowFixedDate(true)}
                      >
                        <MaterialIcons name="calendar-today" size={20} />
                        <Text style={s.dateText}>
                          {new Date(values.fixedDateTime!).toLocaleDateString()}
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={s.dateBtn}
                        onPress={() => setShowFixedTime(true)}
                      >
                        <FontAwesome5 name="clock" size={20} />
                        <Text style={s.dateText}>
                          {new Date(values.fixedDateTime!).toLocaleTimeString(
                            [],
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </Text>
                      </TouchableOpacity>
                    </View>
                    {showFixedDate && (
                      <DateTimePicker
                        value={new Date(values.fixedDateTime!)}
                        mode="date"
                        display="default"
                        onChange={(_, date) => {
                          setShowFixedDate(false);
                          date &&
                            setFieldValue("fixedDateTime", date.toISOString());
                        }}
                      />
                    )}
                    {showFixedTime && (
                      <DateTimePicker
                        value={new Date(values.fixedDateTime!)}
                        mode="time"
                        display="default"
                        onChange={(_, date) => {
                          setShowFixedTime(false);
                          date &&
                            setFieldValue("fixedDateTime", date.toISOString());
                        }}
                      />
                    )}
                  </>
                )}

                {values.scheduleType === "RECURRING" && (
                  <>
                    <CustomSelect
                      label="Frequency"
                      options={frequencyOptions}
                      selected={values.frequency}
                      onSelect={(v) => setFieldValue("frequency", v)}
                    />
                    {touched.frequency && errors.frequency && (
                      <Text style={s.error}>{errors.frequency}</Text>
                    )}

                    <Text style={s.label}>Time of Day</Text>
                    <TouchableOpacity
                      style={s.dateBtn}
                      onPress={() => setShowRecurringTime(true)}
                    >
                      <FontAwesome5 name="clock" size={20} />
                      <Text style={s.dateText}>{values.timeOfDay}</Text>
                    </TouchableOpacity>
                    {showRecurringTime && (
                      <DateTimePicker
                        value={new Date(`1970-01-01T${values.timeOfDay!}`)}
                        mode="time"
                        display="default"
                        onChange={(_, date) => {
                          setShowRecurringTime(false);
                          date &&
                            setFieldValue(
                              "timeOfDay",
                              date.toTimeString().slice(0, 5)
                            );
                        }}
                      />
                    )}

                    {values.frequency === "WEEKLY" && (
                      <>
                        <Text style={s.label}>Days of Week</Text>
                        <View style={s.weekDays}>
                          <FieldArray name="daysOfWeek">
                            {(helpers) =>
                              weekDays.map((day) => {
                                const sel = values.daysOfWeek!.includes(day);
                                return (
                                  <TouchableOpacity
                                    key={day}
                                    style={[s.dayOption, sel && s.daySelected]}
                                    onPress={() =>
                                      sel
                                        ? helpers.remove(
                                            values.daysOfWeek!.indexOf(day)
                                          )
                                        : helpers.push(day)
                                    }
                                  >
                                    <Text
                                      style={[
                                        s.dayText,
                                        sel && s.dayTextSelected,
                                      ]}
                                    >
                                      {day.slice(0, 3)}
                                    </Text>
                                  </TouchableOpacity>
                                );
                              })
                            }
                          </FieldArray>
                        </View>
                        {touched.daysOfWeek && errors.daysOfWeek && (
                          <Text style={s.error}>
                            {errors.daysOfWeek as any}
                          </Text>
                        )}
                      </>
                    )}

                    {values.frequency === "MONTHLY" && (
                      <>
                        <Text style={s.label}>Day of Month</Text>
                        <TextInput
                          style={s.input}
                          keyboardType="number-pad"
                          maxLength={2}
                          onChangeText={(t) =>
                            setFieldValue("dayOfMonth", Number(t))
                          }
                          value={String(values.dayOfMonth)}
                        />
                        {touched.dayOfMonth && errors.dayOfMonth && (
                          <Text style={s.error}>{errors.dayOfMonth}</Text>
                        )}
                      </>
                    )}
                  </>
                )}
              </ScrollView>

              <View style={s.footer}>
                <TouchableOpacity
                  style={s.saveButton}
                  onPress={handleSubmit as any}
                  disabled={isSubmitting || loading}
                >
                  <Text style={s.saveText}>
                    {isSubmitting || loading ? "Saving..." : "Save Reminder"}
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </Formik>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  flex: { flex: 1 },
  form: { padding: 24, paddingBottom: 120 },
  section: {
    fontSize: 18,
    fontWeight: "700",
    marginTop: 24,
    marginBottom: 8,
    color: "#333",
  },
  label: { fontSize: 16, fontWeight: "600", marginTop: 16, color: "#444" },
  input: {
    marginTop: 8,
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#f4f4f4",
    fontSize: 16,
  },
  selectContainer: { marginTop: 16 },
  selectBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    backgroundColor: "#f4f4f4",
    borderRadius: 8,
  },
  selectText: { fontSize: 16, color: "#333" },
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.3)" },
  dropdown: {
    position: "absolute",
    top: 100,
    left: 24,
    right: 24,
    backgroundColor: "#fff",
    borderRadius: 8,
    maxHeight: 200,
  },
  option: { padding: 12, borderBottomWidth: 1, borderColor: "#eee" },
  optionText: { fontSize: 16, color: "#333" },
  dateTimeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
  dateBtn: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#f4f4f4",
    borderRadius: 8,
    flex: 1,
    marginRight: 8,
  },
  dateText: { marginLeft: 8, fontSize: 16, color: "#333" },
  weekDays: { flexDirection: "row", flexWrap: "wrap", marginTop: 8 },
  dayOption: {
    width: 40,
    height: 40,
    margin: 4,
    borderRadius: 20,
    backgroundColor: "#eee",
    justifyContent: "center",
    alignItems: "center",
  },
  daySelected: { backgroundColor: "#007AFF" },
  dayText: { color: "#333", fontSize: 14 },
  dayTextSelected: { color: "#fff", fontWeight: "700" },
  error: { color: "#FF3B30", marginTop: 4, fontSize: 13 },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderColor: "#eee",
  },
  saveButton: {
    backgroundColor: "#007AFF",
    borderRadius: 8,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  saveText: { color: "#fff", fontSize: 17, fontWeight: "700" },
});
