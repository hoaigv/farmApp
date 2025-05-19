import Ionicons from "@expo/vector-icons/Ionicons";
import SimpleLineIcons from "@expo/vector-icons/SimpleLineIcons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Avatar } from "react-native-paper";
import useCustomFonts from "../../hook/FontLoader";

const ChatRoomScreen = () => {
  const router = useRouter();
  const [fontsLoaded] = useCustomFonts();
  const [inputText, setInputText] = useState("");
  const [messages, setMessages] = useState([
    {
      id: "1",
      text: "Chào bạn!",
      sender: "other",
      timestamp: "2025-05-15T09:00:00Z",
    },
    {
      id: "2",
      text: "Chào bạn! Bạn cần hỗ trợ gì?",
      sender: "me",
      timestamp: "2025-05-15T09:01:00Z",
    },
    {
      id: "3",
      text: "Tôi muốn hỏi về lịch tưới cây.",
      sender: "other",
      timestamp: "2025-05-15T09:01:30Z",
    },
    {
      id: "4",
      text: "Vâng, bạn trồng cây gì vậy?",
      sender: "me",
      timestamp: "2025-05-15T09:02:00Z",
    },
  ]);

  if (!fontsLoaded) return null;

  const handleSend = () => {
    if (inputText.trim() === "") return;
    const newMessage = {
      id: Date.now().toString(),
      text: inputText,
      sender: "me",
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, newMessage]);
    setInputText("");
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* HEADER giữ nguyên */}

      <View className="flex-row items-center justify-between px-2  pb-2 bg-white">
        <Ionicons
          name="arrow-back-outline"
          size={26}
          color="black"
          onPress={() => router.back()}
        />
        <Text style={styles.header_lable}>New Chat</Text>
        <Avatar.Image
          size={42}
          source={require("../../assets/images/chat_logo.png")}
        />
      </View>

      {/* NỘI DUNG + INPUT */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={5}
      >
        {/* Danh sách tin nhắn */}
        <FlatList
          data={messages}
          style={{ flex: 1 }}
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "flex-end",
            padding: 12,
          }}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View
              style={{
                alignSelf: item.sender === "other" ? "flex-end" : "flex-start",
                marginVertical: 4,
                maxWidth: "80%",
                flexDirection: "row",
                alignItems: "flex-end",
              }}
            >
              <Avatar.Image
                size={32}
                style={{ marginRight: 6, marginBottom: 4 }}
                source={
                  item.sender === "me"
                    ? require("../../assets/images/chat_logo.png")
                    : {
                        uri: "https://i.pinimg.com/736x/f2/53/a2/f253a28ff9e51587b710d0bd491b62d3.jpg",
                      }
                }
              />
              <View
                style={[
                  styles.messageBubble,
                  {
                    backgroundColor:
                      item.sender === "me" ? "#00C897" : "#F1F1F1",
                    borderTopLeftRadius: item.sender === "me" ? 12 : 0,
                    borderTopRightRadius: item.sender === "me" ? 0 : 12,
                  },
                ]}
              >
                <Text
                  style={{
                    color: item.sender === "me" ? "#fff" : "#000",
                    fontSize: 16,
                  }}
                >
                  {item.text}
                </Text>
              </View>
            </View>
          )}
        />

        {/* Thanh nhập tin nhắn */}
        <View className="flex-row items-center justify-between mx-2 p-3 border-t-2 border-stone-500 gap-2 ">
          <View>
            <Ionicons name="image-outline" size={24} color="black" />
          </View>
          <View className="flex-row items-center justify-between bg-neutral-100 w-5/6 p-3 rounded-full">
            <TextInput
              placeholder="Write a message"
              value={inputText}
              onChangeText={setInputText}
              placeholderTextColor="#999"
            />
            <TouchableOpacity onPress={handleSend}>
              <Ionicons name="send-outline" size={24} color="black" />
            </TouchableOpacity>
          </View>
          <View>
            <SimpleLineIcons name="microphone" size={24} color="" />
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ChatRoomScreen;

const styles = StyleSheet.create({
  header_lable: {
    fontSize: 22,
    fontFamily: "PoetsenOne-Regular",
  },
  messageBubble: {
    padding: 12,
    borderRadius: 16,
    marginHorizontal: 4,
  },
  inputBar: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderColor: "#eee",
  },
  textInput: {
    flex: 1,
    backgroundColor: "white",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    fontSize: 16,
  },
  iconGroup: {
    flexDirection: "column",
    justifyContent: "space-between",
    marginRight: 2,
  },
  iconButton: {
    padding: 2,
  },
});
