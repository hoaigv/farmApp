import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  FlatList,
  Image,
  ImageBackground,
  ListRenderItem,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Avatar } from "react-native-paper";
import NotificationBell from "../../components/NotificationBell";
import WeatherCard from "../../components/WeatherCard";
import { gardeningTodos } from "../../data/todo";
import useCustomFonts from "../../hook/FontLoader";
import { Todo } from "../../types/todo";
const HomeScreen = () => {
  const router = useRouter();
  const [tasks, setTasks] = useState(gardeningTodos);
  const [fontsLoaded] = useCustomFonts();
  const toggleTask = (id: string) => {
    const updatedTasks = tasks
      .map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
      .sort((a, b) => Number(a.completed) - Number(b.completed)); // ✅ đã sửa lỗi

    setTasks(updatedTasks);
  };
  if (!fontsLoaded) {
    return null; // or a loading indicator
  }

  const renderItem: ListRenderItem<Todo> = ({ item }) => {
    return (
      <View style={[styles.taskItem, item.completed && styles.taskItemDone]}>
        <View className="flex-row items-center justify-between">
          <View>
            <Text
              style={[styles.taskText, item.completed && styles.taskTextDone]}
            >
              {item.title}
            </Text>
            <Text style={{ fontSize: 12, color: "#777" }}>
              {item.date} - {item.time}
            </Text>
          </View>
          <TouchableOpacity onPress={() => toggleTask(item.id)}>
            <View className="flex-row items-center gap-2">
              <Ionicons
                name={item.completed ? "checkmark-circle" : "ellipse-outline"}
                size={24}
                color={item.completed ? "#00C897" : "#ccc"}
              />
            </View>
          </TouchableOpacity>
        </View>
      </View>
    );
  };
  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-row items-center justify-between px-2 py-2 relative">
        {/* Left: Location */}
        <WeatherCard />
        {/* Right: Notification */}
        <NotificationBell />
      </View>

      <ImageBackground
        source={require("../../assets/images/tip_background.png")}
        resizeMode="cover"
        className="flex-row items-center justify-center m-2 p-4 gap-2 overflow-hidden rounded-lg h-36"
      >
        <Avatar.Image
          size={54}
          style={{ marginRight: 6, marginBottom: 4 }}
          source={require("../../assets/images/chat_logo.png")}
        />
        <View className="flex-1 flex-col justify-between gap-2">
          <Text
            style={{
              fontSize: 22,
              fontFamily: "PoetsenOne-Regular",
              color: "white",
            }}
          >
            AI irrigation tips for you
          </Text>
          <Text className="color-stone-50">Water your plants every 2 days</Text>
        </View>
      </ImageBackground>
      {/*To do list*/}
      <View className="flex-row items-center justify-between px-4 py-2">
        <View className="flex-row items-center gap-2">
          <Image
            source={require("../../assets/images/checklist.png")}
            style={{ width: 28, height: 28 }}
          />
          <Text style={{ fontFamily: "PoetsenOne-Regular", fontSize: 22 }}>
            To do list :
          </Text>
        </View>
        <Text className="text-sm text-gray-500">(1/4 completed)</Text>
      </View>
      <FlatList
        data={tasks}
        renderItem={renderItem}
        contentContainerStyle={{
          paddingHorizontal: 8,
          paddingVertical: 10,
        }}
        style={{
          marginBottom: 5,
          maxHeight: 280,
          borderColor: "#ccc",
          borderWidth: 1,
          borderRadius: 10,
          marginHorizontal: 8,
        }}
        scrollEnabled={true}
      />
      <View className="px-2">
        <View className="flex-row items-center gap-1 p-2">
          <Image
            source={require("../../assets/images/plant.png")}
            style={{ width: 28, height: 28 }}
          />
          <Text
            style={{
              fontFamily: "PoetsenOne-Regular",
              fontSize: 22,
            }}
          >
            Garden Health Summary :
          </Text>
        </View>
        <View
          style={{
            borderWidth: 0.5,
            borderColor: "#ccc",
            padding: 8,
            margin: 4,
            borderRadius: 10,
          }}
        >
          <TouchableOpacity style={styles.summaryItem}>
            <View style={styles.summaryItemContext}>
              <Avatar.Image
                size={28}
                source={require("../../assets/images/wheat-2.png")}
                style={styles.sumaryItemIcon}
              />
              <Text style={styles.summaryItemText}>5 healthy plants</Text>
            </View>
            <MaterialIcons name="arrow-forward-ios" size={22} color="black" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.summaryItem}>
            <View style={styles.summaryItemContext}>
              <Avatar.Image
                size={28}
                source={require("../../assets/images/warning.png")}
                style={styles.sumaryItemIcon}
              />
              <Text style={styles.summaryItemText}>
                2 plants need attention
              </Text>
            </View>
            <MaterialIcons name="arrow-forward-ios" size={22} color="black" />
          </TouchableOpacity>
          <View style={styles.summaryItem}>
            <View style={styles.summaryItemContext}>
              <Avatar.Image
                size={28}
                source={require("../../assets/images/check.png")}
                style={styles.sumaryItemIcon}
              />
              <Text style={styles.summaryItemText}>
                43 tasks completed this week
              </Text>
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  summaryItemContext: { flexDirection: "row", alignItems: "center", gap: "10" },
  summaryItemText: { fontSize: 16, color: "#333", fontWeight: "500" },
  sumaryItemIcon: { backgroundColor: "#fff" },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    paddingHorizontal: 8,
    paddingVertical: 6,
    fontFamily: "PoetsenOne-Regular",
  },
  taskItem: {
    padding: 12,
    backgroundColor: "#fff",
    borderRadius: 10,
    marginBottom: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  taskItemDone: {
    backgroundColor: "#e1f8e7",
    opacity: 0.6,
  },
  summaryItem: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    paddingBottom: 8,
    marginBottom: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
  },
  taskText: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  taskTextDone: {
    textDecorationLine: "line-through",
    color: "#777",
  },
});
