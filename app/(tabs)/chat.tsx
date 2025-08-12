import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { ReactNode, useState, useEffect, useCallback } from "react";
import {
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Platform,
  RefreshControl,
  ImageBackground,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import useCustomFonts from "../../hook/FontLoader";
import { getMyChatSessions, ChatbotSession } from "../../api/sessionApi";

// Reusable FeatureCard component
const FeatureCard: React.FC<{
  icon: ReactNode;
  title: string;
  description: string;
  bgColor: string;
}> = ({ icon, title, description, bgColor }) => (
  <TouchableOpacity style={[styles.card, { backgroundColor: bgColor }]}>
    <View style={styles.iconContainer}>{icon}</View>
    <Text style={styles.cardTitle}>{title}</Text>
    <Text style={styles.cardDesc}>{description}</Text>
  </TouchableOpacity>
);

const ChatItem = ({
  session,
  onPress,
}: {
  session: ChatbotSession;
  onPress: () => void;
}) => (
  <TouchableOpacity
    style={styles.chatItem}
    className="border border-gray-200 shadow-sm "
    onPress={onPress}
  >
    <Ionicons
      name="chatbubble-outline"
      size={20}
      color="#555"
      style={{ marginRight: 10 }}
    />
    <Text style={styles.chatText}>
      {session.chatTitle.length > 25
        ? session.chatTitle.substring(0, 25) + "..."
        : session.chatTitle}
    </Text>
  </TouchableOpacity>
);

const ChatScreen = () => {
  const router = useRouter();
  const [fontsLoaded] = useCustomFonts();
  const [sessions, setSessions] = useState<ChatbotSession[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadSessions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getMyChatSessions();
      setSessions(res.result);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  // Reload every time screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadSessions();
    }, [loadSessions])
  );

  if (!fontsLoaded) return null;

  const goNewChat = () => {
    router.push("/chat/new");
  };

  const goHistory = () => router.push("/chat/history");
  const openChat = (id: string, title: string) =>
    router.push({ pathname: `/chat/${id}`, params: { chatTitle: title } });

  const sortedByDate = [...sessions].sort(
    (a, b) => new Date(b.createAt).getTime() - new Date(a.createAt).getTime()
  );
  // Only show the 3 most recent sessions
  const recent = sortedByDate.slice(0, 3);

  return (
    <ImageBackground
      source={require("../../assets/images/backgournd.png")}
      className="flex-1"
      resizeMode="cover"
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerLabel}>Garden AI Assistant</Text>
        </View>

        <View style={styles.newChatWrapper}>
          <TouchableOpacity style={styles.newChatBtn} onPress={goNewChat}>
            <Text style={styles.newChatText}>Start New Chat</Text>
            <Ionicons name="add-circle-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {loading && !refreshing ? (
          <ActivityIndicator style={{ marginTop: 20 }} />
        ) : (
          <FlatList
            data={recent}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <ChatItem
                session={item}
                onPress={() => openChat(item.id, item.chatTitle)}
              />
            )}
            contentContainerStyle={styles.listContent}
            ListFooterComponent={() => (
              <>
                <TouchableOpacity onPress={goHistory} style={styles.seeAllBtn}>
                  <Text style={styles.seeAllText}>See All</Text>
                </TouchableOpacity>

                {/* Inline features grid inside FlatList footer to avoid extra spacing */}
                <View style={styles.featuresContainer}>
                  <FeatureCard
                    icon={
                      <Ionicons name="leaf-outline" size={24} color="#2E7D32" />
                    }
                    title="Take Care of Your Plants"
                    description="Get recommendations for plant care"
                    bgColor="#E0F8EC"
                  />
                  <FeatureCard
                    icon={
                      <MaterialCommunityIcons
                        name="bug-check-outline"
                        size={24}
                        color="#D84315"
                      />
                    }
                    title="Pest Diagnosis"
                    description="Identify and treat pests organically"
                    bgColor="#FFF0E5"
                  />
                  <FeatureCard
                    icon={
                      <Ionicons
                        name="cloud-outline"
                        size={24}
                        color="#1565C0"
                      />
                    }
                    title="Weather Forecast"
                    description="Plan farm activities with detailed weather"
                    bgColor="#EAF3FB"
                  />
                  <FeatureCard
                    icon={
                      <Ionicons name="bulb-outline" size={24} color="#558B2F" />
                    }
                    title="Planting Tips"
                    description="Seasonal advice for crop success"
                    bgColor="#F1F8E9"
                  />
                </View>
              </>
            )}
          />
        )}
      </SafeAreaView>
    </ImageBackground>
  );
};

export default ChatScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { alignItems: "center", paddingVertical: 16 },
  headerLabel: { fontSize: 22, fontFamily: "PoetsenOne-Regular" },
  newChatWrapper: { marginHorizontal: 16, marginBottom: 12 },
  newChatBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#00C897",
    padding: 12,
    borderRadius: 12,
    ...Platform.select({
      android: { elevation: 4 },
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
      },
    }),
  },
  newChatText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  listContent: { paddingHorizontal: 16, paddingBottom: 16 },
  chatItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    backgroundColor: "white",
    gap: 2,
    margin: 2,
    borderRadius: 8,
    padding: 12,
  },
  chatText: { fontSize: 15, color: "#333" },
  seeAllBtn: { paddingVertical: 10, alignItems: "center" },
  seeAllText: { fontSize: 14, color: "black", fontWeight: "600" },
  featuresContainer: {
    flexWrap: "wrap",
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
  },
  card: {
    width: "48%",
    height: 140,
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
    justifyContent: "space-between",
  },
  iconContainer: {
    backgroundColor: "rgba(255,255,255,0.2)",
    padding: 8,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  cardTitle: { fontSize: 16, fontWeight: "600", color: "#1B1B1B" },
  cardDesc: { fontSize: 12, color: "#4A4A4A" },
});
