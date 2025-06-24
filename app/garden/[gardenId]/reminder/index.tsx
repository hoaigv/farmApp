// src/screens/ReminderListScreen.tsx
import React, { useEffect, useState } from "react";
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
import Header from "@/components/Header"; // Giả sử bạn có component Header
import { router, useLocalSearchParams } from "expo-router";
import {
  getMyReminders,
  deleteReminders,
  ReminderResponse,
} from "@/api/reminderApi";

// Kiểu UI
type Reminder = {
  id: string;
  action: string; // từ API.task
  frequency: string; // mô tả
  status: "active" | "completed" | "paused";
};

// Map từ API status sang UI status
const mapStatus = (status: ReminderResponse["status"]): Reminder["status"] => {
  switch (status) {
    case "PENDING":
      return "active";
    case "DONE":
      return "completed";
    case "SKIPPED":
      return "paused";
    default:
      return "active";
  }
};

// Format frequency + specificTime thành string hiển thị
const formatFrequency = (
  frequency: ReminderResponse["frequency"],
  specificTime?: string
): string => {
  let timeString = "";
  if (specificTime) {
    const dt = new Date(specificTime);
    const hours = dt.getHours().toString().padStart(2, "0");
    const minutes = dt.getMinutes().toString().padStart(2, "0");
    timeString = `${hours}:${minutes}`;
  }
  switch (frequency) {
    case "ONE_TIME":
      if (specificTime) {
        const dt = new Date(specificTime);
        const day = dt.getDate().toString().padStart(2, "0");
        const month = (dt.getMonth() + 1).toString().padStart(2, "0");
        const year = dt.getFullYear();
        return `Once: ${day}/${month}/${year}${
          timeString ? ` at ${timeString}` : ""
        }`;
      }
      return "Once";
    case "DAILY":
      return timeString ? `Daily at ${timeString}` : "Daily";
    case "WEEKLY":
      return timeString ? `Weekly at ${timeString}` : "Weekly";
    case "MONTHLY":
      return timeString ? `Monthly at ${timeString}` : "Monthly";
    default:
      return frequency;
  }
};

// Component ReminderItem với onPress
const ReminderItem: React.FC<{
  item: Reminder;
  onDelete: (id: string) => void;
  onPress: () => void;
}> = ({ item, onDelete, onPress }) => {
  const statusColor = {
    active: "#28a745",
    completed: "#6c757d",
    paused: "#ffc107",
  }[item.status];

  // render action khi swipe left
  const renderRightActions = () => (
    <TouchableOpacity
      style={styles.deleteButton}
      onPress={() => onDelete(item.id)}
    >
      <Entypo name="trash" size={24} color="red" />
    </TouchableOpacity>
  );

  return (
    <Swipeable renderRightActions={renderRightActions}>
      <TouchableOpacity
        style={[styles.itemContainer, { borderLeftColor: statusColor }]}
        onPress={onPress}
      >
        <View style={styles.itemContent}>
          <Text style={styles.actionText}>{item.action}</Text>
          <Text style={styles.freqText}>{item.frequency}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
          <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
        </View>
      </TouchableOpacity>
    </Swipeable>
  );
};

const ReminderListScreen: React.FC = () => {
  const { gardenId } = useLocalSearchParams<{ gardenId: string }>();
  const [data, setData] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const fetchReminders = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getMyReminders();
      const remindersUI: Reminder[] = res.result.map((r) => ({
        id: r.id,
        action: r.task,
        frequency: formatFrequency(r.frequency, r.specificTime),
        status: mapStatus(r.status),
      }));
      setData(remindersUI);
    } catch (e: any) {
      console.error("Error fetching reminders:", e);
      setError("Unable to load reminders");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchReminders();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchReminders();
  };

  const handleDelete = async (id: string) => {
    try {
      setData((prev) => prev.filter((item) => item.id !== id));
      await deleteReminders([id]);
    } catch (e) {
      console.error("Delete error:", e);
      fetchReminders();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="Reminders"
        showBack={true}
        rightElement={
          <TouchableOpacity
            style={{ paddingHorizontal: 8 }}
            onPress={() => {
              router.push(`/garden/${gardenId}/reminder/create`);
            }}
          >
            <Feather name="plus" size={26} color="black" />
          </TouchableOpacity>
        }
      />
      {loading && !refreshing ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={{ color: "red" }}>{error}</Text>
          <TouchableOpacity onPress={fetchReminders} style={styles.reloadBtn}>
            <Text style={{ color: "#007AFF" }}>Try again</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ReminderItem
              item={item}
              onDelete={handleDelete}
              onPress={() => {
                // Push sang màn hình edit với params
                router.push({
                  pathname: `/garden/${gardenId}/reminder/${item.id}`,
                  params: {
                    mode: "edit",
                    reminder: JSON.stringify({
                      id: item.id,
                      task: item.action,
                      frequency: item.frequency,
                      status: item.status,
                    }),
                    gardenId,
                  },
                });
              }}
            />
          )}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={() => (
            <View style={styles.center}>
              <Text>No reminder yet.</Text>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
};

export default ReminderListScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  reloadBtn: {
    marginTop: 8,
  },
  listContent: {
    padding: 16,
  },
  separator: {
    height: 1,
    backgroundColor: "#eee",
    marginVertical: 8,
  },
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderLeftWidth: 4,
    backgroundColor: "#fafafa",
    borderRadius: 6,
  },
  itemContent: {
    flex: 1,
  },
  actionText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  freqText: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    color: "#fff",
    fontWeight: "600",
  },
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
