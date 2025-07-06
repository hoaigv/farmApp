import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  SafeAreaView,
  FlatList,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { Feather, Entypo } from "@expo/vector-icons";
import Swipeable from "react-native-gesture-handler/ReanimatedSwipeable";
import Header from "@/components/Header";
import { router, useLocalSearchParams } from "expo-router";
import {
  getReminders,
  deleteReminder,
  ReminderResponse,
} from "@/api/reminderApi";
import { useFocusEffect } from "@react-navigation/native";

// Map API status to UI status and color
const STATUS_MAP: Record<
  ReminderResponse["status"],
  { label: string; color: string }
> = {
  PENDING: { label: "PENDING", color: "#28a745" },
  DONE: { label: "DONE", color: "#6c757d" },
  SKIPPED: { label: "SKIPPED", color: "#ffc107" },
};

// Format schedule/frequency display
const formatSchedule = (
  scheduleType: ReminderResponse["scheduleType"],
  fixedDateTime?: string,
  frequency?: ReminderResponse["frequency"],
  timeOfDay?: string,
  daysOfWeek?: ReminderResponse["daysOfWeek"],
  dayOfMonth?: number
): string => {
  if (scheduleType === "FIXED" && fixedDateTime) {
    const dt = new Date(fixedDateTime);
    return dt.toLocaleString();
  }

  // RECURRING
  let timeString = "";
  if (timeOfDay) {
    const t = new Date(`1970-01-01T${timeOfDay}`);
    const hh = t.getHours().toString().padStart(2, "0");
    const mm = t.getMinutes().toString().padStart(2, "0");
    timeString = `${hh}:${mm}`;
  }

  switch (frequency) {
    case "ONE_TIME":
      return timeString ? `One time at ${timeString}` : "One time";
    case "DAILY":
      return timeString ? `Daily at ${timeString}` : "Daily";
    case "WEEKLY":
      if (daysOfWeek && daysOfWeek.length) {
        const days = daysOfWeek.map((d) => d.slice(0, 3)).join(", ");
        return `${days} ${timeString ? `at ${timeString}` : ""}`.trim();
      }
      return timeString ? `Weekly at ${timeString}` : "Weekly";
    case "MONTHLY":
      if (dayOfMonth != null && dayOfMonth !== -1) {
        return `Day ${dayOfMonth} ${
          timeString ? `at ${timeString}` : ""
        }`.trim();
      }
      return timeString ? `Monthly at ${timeString}` : "Monthly";
    default:
      return "";
  }
};

const ReminderItem: React.FC<{
  reminder: ReminderResponse;
  onDelete: (id: string) => void;
  onPress: () => void;
}> = ({ reminder, onDelete, onPress }) => {
  const { label, color } = STATUS_MAP[reminder.status];
  const rightActions = () => (
    <TouchableOpacity
      style={styles.deleteButton}
      onPress={() => onDelete(reminder.id)}
    >
      <Entypo name="trash" size={24} color="red" />
    </TouchableOpacity>
  );

  const freqString = useMemo(
    () =>
      formatSchedule(
        reminder.scheduleType,
        reminder.fixedDateTime,
        reminder.frequency,
        reminder.timeOfDay,
        reminder.daysOfWeek,
        reminder.dayOfMonth
      ),
    [reminder]
  );

  return (
    <Swipeable renderRightActions={rightActions}>
      <TouchableOpacity
        style={[styles.itemContainer, { borderLeftColor: color }]}
        onPress={onPress}
      >
        <View style={styles.itemContent}>
          <Text style={styles.titleText}>{reminder.title}</Text>
          <Text style={styles.subtitleText}>{freqString}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: color }]}>
          <Text style={styles.statusText}>{label}</Text>
        </View>
      </TouchableOpacity>
    </Swipeable>
  );
};

const ReminderListScreen: React.FC = () => {
  const { gardenId } = useLocalSearchParams<{ gardenId: string }>();
  const [reminders, setReminders] = useState<ReminderResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadReminders = useCallback(async () => {
    try {
      setError(null);
      const res = await getReminders(gardenId);
      setReminders(res.result);
    } catch (e) {
      console.error(e);
      setError("Failed to load reminders");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [gardenId]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadReminders();
    }, [loadReminders])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadReminders();
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteReminder(id);
      setReminders((prev) => prev.filter((r) => r.id !== id));
    } catch (e) {
      console.error(e);
      // fallback: reload all
      loadReminders();
    }
  };

  const renderItem = useCallback(
    ({ item }: { item: ReminderResponse }) => (
      <ReminderItem
        reminder={item}
        onDelete={handleDelete}
        onPress={() =>
          router.push(`/garden/${gardenId}/reminder/${item.id}?mode=edit`)
        }
      />
    ),
    [gardenId]
  );

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="Reminders"
        showBack
        rightElement={
          <TouchableOpacity
            onPress={() => router.push(`/garden/${gardenId}/reminder/create`)}
          >
            <Feather name="plus" size={26} color="black" />
          </TouchableOpacity>
        }
      />
      {loading && !refreshing ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={loadReminders} style={styles.reloadBtn}>
            <Text>Try again</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={reminders}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={() => (
            <View style={styles.center}>
              <Text>No reminders yet.</Text>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
};

export default ReminderListScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  errorText: { color: "red", marginBottom: 8 },
  reloadBtn: { padding: 8 },
  listContent: { padding: 16 },
  separator: { height: 1, backgroundColor: "#eee", marginVertical: 8 },
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderLeftWidth: 4,
    backgroundColor: "#fafafa",
    borderRadius: 6,
  },
  itemContent: { flex: 1 },
  titleText: { fontSize: 16, fontWeight: "500", color: "#333" },
  subtitleText: { fontSize: 14, color: "#666", marginTop: 2 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 12, color: "#fff", fontWeight: "600" },
  deleteButton: {
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    width: 80,
    margin: 4,
    borderRadius: 8,
    borderWidth: 1,
    padding: 8,
  },
});
