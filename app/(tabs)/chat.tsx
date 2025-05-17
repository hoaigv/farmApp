import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { ReactNode } from "react";
import {
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import useCustomFonts from "../../hook/FontLoader";
type FeatureCardProps = {
  icon: ReactNode;
  title: string;
  description: string;
  bgColor: string;
  titleColor?: string;
  descriptionColor?: string;
};
const FeatureCard: React.FC<FeatureCardProps> = ({
  icon,
  title,
  description,
  bgColor,
  titleColor,
  descriptionColor,
}) => (
  <TouchableOpacity style={[styles.card, { backgroundColor: bgColor }]}>
    <View style={styles.iconContainer}>{icon}</View>

    <Text style={[styles.title, { color: titleColor || "#1B1B1B" }]}>
      {title}
    </Text>
    <Text
      style={[styles.description, { color: descriptionColor || "#4A4A4A" }]}
    >
      {description}
    </Text>
  </TouchableOpacity>
);
const ChatItem = ({ title }: { title: string }) => (
  <View style={styles.chatItem}>
    <Ionicons
      name="chatbubble-outline"
      size={20}
      color="#555"
      style={{ marginRight: 10 }}
    />
    <Text style={styles.chatText}>{title}</Text>
  </View>
);
const recentChats = [
  { id: "1", title: "How to Improve Soil Quality for Vegetables" },
  { id: "2", title: "Pest Control Methods for Organic Farming" },
  { id: "3", title: "How to Identify Fungal Infections in Plants" },
  { id: "4", title: "Weather Forecast for Rice Farming This Week" },
];

const ChatScreen = () => {
  const router = useRouter();
  const [fontsLoaded] = useCustomFonts();
  if (!fontsLoaded) {
    return null; // or a loading indicator
  }
  return (
    <SafeAreaView className="bg-white flex-1 flex-col">
      <View className="items-center pt-6 pb-2">
        <Text style={styles.header_lable}>Chat With AI</Text>
      </View>

      <View className="mx-4 mb-3">
        <TouchableOpacity
          className="flex-row items-center justify-between rounded-xl bg-primary px-4 py-3 shadow-md"
          style={styles.shadowBox}
          onPress={() => router.push(`/chat/123`)}
        >
          <Text className="text-lg font-semibold text-white">New Chat</Text>
          <Ionicons name="add-circle-outline" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <View className="mx-4 mb-2 mt-1 flex-row items-center justify-between">
        <Text className="text-xl font-semibold text-black">Chat history</Text>
        <TouchableOpacity
          style={styles.shadowBox}
          onPress={() => router.push(`/chat/history`)}
        >
          <Text className="text-sm text-gray-500">See all</Text>
        </TouchableOpacity>
      </View>
      {/* Chat list */}
      <FlatList
        data={recentChats}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ChatItem title={item.title} />}
        contentContainerStyle={{ padding: 10 }}
        ListFooterComponent={
          <View style={styles.container}>
            <FeatureCard
              icon={<Ionicons name="leaf-outline" size={24} color="#2E7D32" />}
              title="Crop Consulting"
              description="Tips for planting and taking care of crops"
              bgColor="#E0F8EC"
              titleColor="#1B1B1B"
              descriptionColor="#4A4A4A"
            />
            <FeatureCard
              icon={
                <MaterialCommunityIcons
                  name="image-search-outline"
                  size={24}
                  color="#D84315"
                />
              }
              title="Disease Diagnosis"
              description="Send an image to get a result"
              bgColor="#FFF0E5"
              titleColor="#1B1B1B"
              descriptionColor="#4A4A4A"
            />
            <FeatureCard
              icon={<Ionicons name="cloud-outline" size={24} color="#1565C0" />}
              title="Weather Forecast"
              description="Check today’s agricultural weather"
              bgColor="#EAF3FB"
              titleColor="#1B1B1B"
              descriptionColor="#4A4A4A"
            />
            <FeatureCard
              icon={<Ionicons name="bulb-outline" size={24} color="#558B2F" />}
              title="Farming Tips"
              description="Suggestions based on season and crop"
              bgColor="#F1F8E9"
              titleColor="#1B1B1B"
              descriptionColor="#4A4A4A"
            />
          </View>
        }
      />
    </SafeAreaView>
  );
};

export default ChatScreen;

const styles = StyleSheet.create({
  header_lable: {
    fontSize: 22,
    fontFamily: "PoetsenOne-Regular",
  },
  container: {
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
  title: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  description: {
    color: "white",
    fontSize: 12,
  },
  chatItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  chatText: {
    fontSize: 15,
    color: "#333",
  },
  shadowBox: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});
