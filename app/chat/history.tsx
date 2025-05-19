import { Ionicons } from "@expo/vector-icons";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  SafeAreaView,
  SectionList,
  SectionListRenderItem,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
interface ChatItem {
  id: string;
  title: string;
  date: string; // ISO format (e.g., "2025-04-16")
}
interface GroupedSection {
  title: string;
  data: ChatItem[];
}

const chatData: ChatItem[] = [
  {
    id: "1",
    title: "How to improve soil quality for vegetable farming?",
    date: "2025-04-16",
  },
  {
    id: "2",
    title: "What is the best fertilizer for fruit trees?",
    date: "2025-04-16",
  },
  {
    id: "3",
    title: "How to prevent leaf spot disease in tomatoes?",
    date: "2025-04-16",
  },
  {
    id: "4",
    title: "Guide to labeling agricultural products for export",
    date: "2025-04-01",
  },
  {
    id: "5",
    title: "How to translate a crop care manual?",
    date: "2025-03-10",
  },
  {
    id: "6",
    title: "Evaluating AI models for plant disease detection",
    date: "2025-02-20",
  },
  {
    id: "7",
    title: "Comparison of irrigation methods in smart farming",
    date: "2024-12-05",
  },
  {
    id: "8",
    title: "Comparison of irrigation methods in smart farming",
    date: "2018-12-05",
  },
];
dayjs.extend(relativeTime);
const INITIAL_LIMIT = 9;
const groupByMonth = (data: ChatItem[]): GroupedSection[] => {
  const grouped: Record<string, ChatItem[]> = {};

  // Sắp xếp toàn bộ dữ liệu theo ngày giảm dần trước
  const sortedData = [...data].sort(
    (a, b) => dayjs(b.date).valueOf() - dayjs(a.date).valueOf()
  );

  sortedData.forEach((item) => {
    const date = dayjs(item.date);
    let label: string;

    if (dayjs().diff(date, "day") <= 30) {
      label = "Last 30 Days";
    } else if (date.year() === dayjs().year()) {
      label = date.format("MMMM");
    } else {
      label = `${date.year()}`;
    }

    if (!grouped[label]) grouped[label] = [];
    grouped[label].push(item);
  });

  // Trả về mảng đã nhóm, sắp xếp section theo thời gian mới nhất
  const sections: GroupedSection[] = Object.entries(grouped)
    .map(([title, data]) => ({ title, data }))
    .sort((a, b) => {
      const aDate = dayjs(a.data[0].date);
      const bDate = dayjs(b.data[0].date);
      return bDate.valueOf() - aDate.valueOf();
    });

  return sections;
};
const HistoryChatScreen = () => {
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(false);
  const [showToggleButton, setShowToggleButton] = useState(false);
  const limitedData = isExpanded ? chatData : chatData.slice(0, INITIAL_LIMIT);
  const sections = groupByMonth(limitedData);

  // 🔹 renderItem có kiểu rõ ràng
  const renderItem: SectionListRenderItem<ChatItem, GroupedSection> = ({
    item,
  }) => (
    <TouchableOpacity style={styles.item}>
      <Ionicons
        name="chatbubble-outline"
        size={20}
        color="#555"
        style={{ marginRight: 10 }}
      />
      <Text style={styles.title}>{item.title}</Text>
    </TouchableOpacity>
  );

  // 🔹 renderSectionHeader có kiểu cụ thể
  const renderSectionHeader = ({ section }: { section: GroupedSection }) => (
    <Text
      className="font-bold mt-6 mb-2"
      style={{ fontSize: 16, color: "#333" }}
    >
      {section.title}
    </Text>
  );

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-row items-center justify-center p-2 bg-white">
        <Ionicons
          name="arrow-back-outline"
          size={26}
          color="black"
          onPress={() => router.back()}
          className="absolute left-4"
        />
        <Text
          style={{ fontFamily: "PoetsenOne-Regular", fontSize: 22 }}
          className="text-lg font-bold"
        >
          Chat history
        </Text>
      </View>
      <View className="flex-1 bg-white px-4 pt-5">
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          renderSectionHeader={renderSectionHeader}
          onEndReached={() => {
            if (!isExpanded && chatData.length > INITIAL_LIMIT) {
              setShowToggleButton(true);
            }
          }}
          onEndReachedThreshold={0.1}
        />
      </View>
      {showToggleButton && (
        <TouchableOpacity
          onPress={() => setIsExpanded(!isExpanded)}
          style={styles.toggleButton}
        >
          <Text style={styles.toggleText}>
            {isExpanded ? "Show Less" : "Show All"}
          </Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
};

export default HistoryChatScreen;

const styles = StyleSheet.create({
  sectionHeader: {
    fontWeight: "bold",
    fontSize: 16,
    marginTop: 24,
    marginBottom: 8,
    color: "#333",
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderColor: "#ddd",
  },
  icon: {
    marginRight: 12,
  },
  title: {
    fontSize: 15,
    color: "#000",
  },
  toggleButton: {
    padding: 12,
    alignItems: "center",
    backgroundColor: "#f2f2f2",
    marginTop: 10,
    borderRadius: 8,
    marginHorizontal: 16,
  },
  toggleText: {
    fontSize: 16,
    color: "black",
    fontWeight: "600",
  },
});
