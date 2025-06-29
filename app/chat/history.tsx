// src/screens/HistoryChatScreen.tsx
import React, { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import {
  SafeAreaView,
  SectionList,
  SectionListRenderItem,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
} from "react-native";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import Ionicons from "@expo/vector-icons/Ionicons";
import {
  getMyChatSessions,
  deleteChatSessions,
  ChatbotSession,
} from "@/api/sessionApi";
import { showSuccess } from "@/utils/flashMessageService";
import Header from "@/components/Header";
dayjs.extend(relativeTime);

type GroupedSection = {
  title: string;
  data: ChatbotSession[];
};

const HistoryChatScreen: React.FC = () => {
  const router = useRouter();
  const [sessions, setSessions] = useState<ChatbotSession[]>([]);
  const [sections, setSections] = useState<GroupedSection[]>([]);

  // Load sessions on mount
  useEffect(() => {
    (async () => {
      try {
        const { result } = await getMyChatSessions();
        setSessions(result);
      } catch (err) {
        console.error("Failed to load sessions", err);
      }
    })();
  }, []);

  // Group by date (Today, Yesterday, Older)
  useEffect(() => {
    const today = [] as ChatbotSession[];
    const yesterday = [] as ChatbotSession[];
    const older = [] as ChatbotSession[];

    sessions.forEach((s) => {
      const diff = dayjs().diff(dayjs(s.createAt), "day");
      if (diff === 0) today.push(s);
      else if (diff === 1) yesterday.push(s);
      else older.push(s);
    });

    const secs: GroupedSection[] = [];
    if (today.length) secs.push({ title: "Today", data: today });
    if (yesterday.length) secs.push({ title: "Yesterday", data: yesterday });
    if (older.length) secs.push({ title: "Older", data: older });
    setSections(secs);
  }, [sessions]);

  // Delete session by id
  const handleDelete = (id: string) => {
    Alert.alert(
      "Delete Chat",
      "Are you sure you want to delete this chat session?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            // wrap async logic in an IIFE
            (async () => {
              try {
                await deleteChatSessions([id]);
                setSessions((prev) => prev.filter((s) => s.id !== id));
                showSuccess("Chat session deleted successfully");
              } catch (error) {
                console.error("Delete error:", error);
                Alert.alert(
                  "Error",
                  "Could not delete the session. Please try again."
                );
              }
            })();
          },
        },
      ],
      { cancelable: true }
    );
  };

  // Render each item
  const renderItem: SectionListRenderItem<ChatbotSession, GroupedSection> = ({
    item,
  }) => {
    const timeFromNow = dayjs(item.createAt).fromNow();
    return (
      <TouchableOpacity
        style={styles.item}
        onPress={() =>
          router.push({
            pathname: `/chat/${item.id}`,
            params: { chatTitle: item.chatTitle },
          })
        }
      >
        <Ionicons
          name="chatbubble-outline"
          size={20}
          color="#555"
          style={styles.icon}
        />
        <View style={styles.textContainer}>
          <Text style={styles.title}>{item.chatTitle}</Text>
          <Text style={styles.date}>{timeFromNow}</Text>
        </View>
        <TouchableOpacity
          onPress={() => handleDelete(item.id)}
          style={styles.deleteBtn}
        >
          <Ionicons name="trash-outline" size={20} color="#e00" />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  const renderSectionHeader = ({
    section: { title },
  }: {
    section: GroupedSection;
  }) => (
    <View style={styles.header}>
      <Text style={styles.headerText}>{title}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Chat History" />
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        contentContainerStyle={styles.listContent}
        stickySectionHeadersEnabled
      />
    </SafeAreaView>
  );
};

export default HistoryChatScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  listContent: { paddingBottom: 20 },
  header: { padding: 8, backgroundColor: "#f0f0f0" },
  headerText: { fontSize: 14, fontWeight: "bold" },
  item: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 0.5,
    borderColor: "#ddd",
  },
  icon: { marginRight: 12 },
  textContainer: { flex: 1 },
  title: { fontSize: 16, color: "#333" },
  date: { fontSize: 12, color: "#888", marginTop: 4 },
  deleteBtn: { marginLeft: 8, padding: 4 },
});
