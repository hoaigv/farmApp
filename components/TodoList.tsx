import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import {
  getMyRemindersAll,
  updateReminder,
  ReminderResponse,
} from "../api/reminderApi";

const TodoList: React.FC = () => {
  const [reminders, setReminders] = useState<ReminderResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReminders = async () => {
      try {
        const { result } = await getMyRemindersAll();
        setReminders(result);
      } catch (e: any) {
        console.error("Failed to load reminders", e);
        setError(e.message || "Error loading reminders");
      } finally {
        setLoading(false);
      }
    };
    fetchReminders();
  }, []);

  /**
   * Handle completing or skipping a reminder.
   */
  const handleAction = async (id: string, action: "complete" | "finalize") => {
    const rem = reminders.find((r) => r.id === id);
    if (!rem) return;
    const newStatus = action === "complete" ? "DONE" : "SKIPPED";
    try {
      await updateReminder({
        ...rem,
        status: newStatus,
      });
      setReminders((prev) => prev.filter((r) => r.id !== id));
    } catch (e: any) {
      console.error(`Failed to ${action} reminder`, e);
      setError(`Unable to ${action} task`);
    }
  };

  const renderItem = ({ item }: { item: ReminderResponse }) => (
    <View style={styles.itemContainer}>
      <Text style={styles.text}>
        <Text style={styles.bold}>Garden:</Text> {item.gardenActivity}
      </Text>
      <View style={styles.infoContainer}>
        <View style={styles.info}>
          <Text style={styles.text}>
            <Text style={styles.bold}>Task:</Text> {item.task}
          </Text>
          <Text style={styles.text}>
            <Text style={styles.bold}>Time:</Text>{" "}
            {item.specificTime
              ? new Date(item.specificTime).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "-"}
          </Text>
        </View>
        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={[styles.button, styles.completeButton]}
            onPress={() => handleAction(item.id, "complete")}
          >
            <Text style={styles.buttonText}>Complete</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.finalizeButton]}
            onPress={() => handleAction(item.id, "finalize")}
          >
            <Text style={styles.buttonText}>Finalize</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const ListEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>No tasks available</Text>
    </View>
  );

  if (loading) {
    return <ActivityIndicator style={styles.loader} size="large" />;
  }

  if (error) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.listWrapper}>
      <FlatList
        data={reminders}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={
          reminders.length ? styles.listContainer : styles.emptyListContainer
        }
        ListEmptyComponent={ListEmpty}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },
  listWrapper: { height: 288, margin: 4, flexGrow: 0 },
  listContainer: { paddingHorizontal: 16 },
  emptyListContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  itemContainer: {
    justifyContent: "space-between",
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 0.5,
  },
  infoContainer: { flexDirection: "row", alignItems: "center" },
  info: { flex: 1, marginRight: 8 },
  text: { fontSize: 14, marginBottom: 4 },
  bold: { fontWeight: "600" },
  buttonsContainer: { flexDirection: "row", gap: 8 },
  button: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 6 },
  completeButton: { backgroundColor: "#4CAF50" },
  finalizeButton: { backgroundColor: "#9C27B0" },
  buttonText: { color: "#fff", fontSize: 13, fontWeight: "500" },
  emptyContainer: { justifyContent: "center", alignItems: "center" },
  emptyText: { fontSize: 16, color: "#888", fontWeight: "400" },
});

export default TodoList;
