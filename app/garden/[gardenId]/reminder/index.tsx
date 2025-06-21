import React from "react";
import {
  SafeAreaView,
  FlatList,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import Feather from "@expo/vector-icons/Feather";
import Header from "@/components/Header"; // Giả sử bạn có một Header component
import { router } from "expo-router";
// Định nghĩa kiểu cho một Reminder
type Reminder = {
  id: string;
  action: string; // mô tả hành động
  frequency: string; // tần suất (e.g. "3 lần/tuần" hoặc "hàng ngày lúc 8:00")
  status: "active" | "completed" | "paused"; // trạng thái reminder
};

// Dữ liệu mẫu
const reminders: Reminder[] = [
  {
    id: "1",
    action: "Tưới nước cây",
    frequency: "3 lần/tuần",
    status: "active",
  },
  {
    id: "2",
    action: "Bón phân",
    frequency: "hàng ngày lúc 8:00",
    status: "paused",
  },
  {
    id: "3",
    action: "Phun thuốc trừ sâu",
    frequency: "1 lần/tuần",
    status: "completed",
  },
  // ... bạn có thể thêm hoặc load từ API/vector DB
];

const ReminderItem: React.FC<{ item: Reminder }> = ({ item }) => {
  const statusColor = {
    active: "#28a745",
    completed: "#6c757d",
    paused: "#ffc107",
  }[item.status];

  return (
    <View style={[styles.itemContainer, { borderLeftColor: statusColor }]}>
      <View style={styles.itemContent}>
        <Text style={styles.actionText}>{item.action}</Text>
        <Text style={styles.freqText}>{item.frequency}</Text>
      </View>
      <TouchableOpacity
        style={[styles.statusBadge, { backgroundColor: statusColor }]}
      >
        <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
      </TouchableOpacity>
    </View>
  );
};

const ReminderListScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="Reminder"
        showBack={true}
        rightElement={
          <TouchableOpacity
            className="px-2"
            onPress={() => router.push("/garden/123/reminder/123")}
          >
            <Feather name="plus" size={26} color="black" />
          </TouchableOpacity>
        }
      />
      <FlatList
        data={reminders}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ReminderItem item={item} />}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
};

export default ReminderListScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
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
});
