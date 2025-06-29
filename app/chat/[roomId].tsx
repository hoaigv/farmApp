import React, { useState, useEffect } from "react";
import { useLocalSearchParams } from "expo-router";
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
  ActivityIndicator,
  Alert,
  Image,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Avatar } from "react-native-paper";
import Ionicons from "@expo/vector-icons/Ionicons";
import { sendChatQuery, ChatRequest, ChatResponse } from "@/api/aiChatApi";
import { uploadFile, UploadFileResponse } from "@/api/fileImageApi";
import { getChatLogsBySessionId, ChatLogResponse } from "@/api/logApi";
import { createChatSession, updateChatSession } from "@/api/sessionApi";
import useCustomFonts from "../../hook/FontLoader";
import Header from "@/components/Header";
import { useAppSelector } from "../../store/hooks";

interface Message {
  id: string;
  text: string;
  sender: "me" | "other";
  timestamp: string;
}

const ChatRoomScreen: React.FC = () => {
  const { roomId: paramRoomId, chatTitle } = useLocalSearchParams<{
    roomId?: string;
    chatTitle?: string;
  }>();
  const user = useAppSelector((state) => state.auth.user);
  const [fontsLoaded] = useCustomFonts();
  const [inputText, setInputText] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [initialLoading, setInitialLoading] = useState<boolean>(true);
  const [isBotTyping, setIsBotTyping] = useState<boolean>(false);
  const [chatTitleCurrent, setChatTitleCurrent] = useState<string>(
    chatTitle || "Chat Room"
  );
  const [sessionId, setSessionId] = useState<string | null>(
    paramRoomId && paramRoomId !== "new" ? paramRoomId : null
  );
  const [hasUpdatedTitle, setHasUpdatedTitle] = useState<boolean>(false);

  // Load history
  useEffect(() => {
    if (!sessionId) {
      setInitialLoading(false);
      return;
    }
    (async () => {
      try {
        const { result }: ChatLogResponse = await getChatLogsBySessionId(
          sessionId
        );
        const displayMessage = result.reverse();
        const history: Message[] = displayMessage.flatMap((log) => [
          {
            id: `${log.id}-user`,
            text: log.userMessage,
            sender: "me",
            timestamp: new Date().toISOString(),
          },
          {
            id: `${log.id}-bot`,
            text: log.botResponse,
            sender: "other",
            timestamp: new Date().toISOString(),
          },
        ]);
        setMessages(history);
      } catch (error) {
        console.error("Failed to load chat logs:", error);
      } finally {
        setInitialLoading(false);
      }
    })();
  }, []);

  if (!fontsLoaded) return null;

  // 1. Cập nhật handleChat để nhận optional parameter messageText
  const handleChat = async (messageText?: string) => {
    const text = messageText ?? inputText.trim();
    setInputText("");
    if (!text) return;
    setLoading(true);
    try {
      let sid = sessionId;
      if (!sid) {
        const { result } = await createChatSession();
        sid = result.id;
        setSessionId(sid);
      }

      const userMessage: Message = {
        id: Date.now().toString(),
        text,
        sender: "me",
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, userMessage]);
      // nếu gọi qua input thì mới clear inputText
      if (!messageText) setInputText("");
      setIsBotTyping(true);

      const payload: ChatRequest = {
        query: text,
        session_id: sid,
      };
      const response: ChatResponse = await sendChatQuery(payload);

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response.response || "No response from bot",
        sender: "other",
        timestamp: new Date().toISOString(),
      };
      setIsBotTyping(false);
      setMessages((prev) => [...prev, botMessage]);

      // Cập nhật title nếu cần
      if (!hasUpdatedTitle && !chatTitle) {
        const titleText = botMessage.text.trim().split(/[.!?]/)[0].trim();
        try {
          const result = await updateChatSession({
            id: sid,
            chatTitle: titleText,
          });
          setChatTitleCurrent(result.result.chatTitle.substring(0, 20) + "...");
          setHasUpdatedTitle(true);
        } catch {
          // ignore
        }
      }
    } catch (error) {
      console.error("Chat handling error:", error);
    } finally {
      setLoading(false);
    }
  };

  // 2. Refactor pickAndUploadImage để tự động gọi handleChat với imageUrl
  const pickAndUploadImage = async () => {
    // 1. Request media library permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission required",
        "You need to grant access to your photo library."
      );
      return;
    }

    // 2. Launch image picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    // 3. Handle cancellation
    if (result.canceled) {
      return;
    }

    const asset = result.assets[0];
    const file = {
      uri: asset.uri,
      name: asset.uri.split("/").pop() || "photo.jpg",
      type: asset.type || "image/jpeg",
    };

    setLoading(true);
    try {
      // 5. Upload to server
      const data: UploadFileResponse = await uploadFile(file);
      const imageUrl = data.result;
      console.log("Image uploaded to:", imageUrl);

      // 6. Gọi handleChat ngay với URL
      await handleChat(imageUrl);
    } catch (err) {
      console.error("Upload or send error:", err);
      Alert.alert("Error", "Unable to upload or send image. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title={chatTitleCurrent} showBack />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.flex}
        keyboardVerticalOffset={5}
      >
        {initialLoading ? (
          <View style={[styles.flex, styles.centered]}>
            <ActivityIndicator size="large" />
          </View>
        ) : (
          <>
            <FlatList
              data={messages}
              style={styles.flex}
              contentContainerStyle={styles.messageList}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => {
                // simple regex to test for common image extensions
                const isImageUrl = /\.(jpeg|jpg|gif|png|webp)$/i.test(
                  item.text
                );

                return (
                  <View
                    style={[
                      styles.messageRow,
                      {
                        alignSelf:
                          item.sender === "me" ? "flex-end" : "flex-start",
                      },
                    ]}
                  >
                    <Avatar.Image
                      size={32}
                      style={styles.avatar}
                      source={
                        item.sender === "me"
                          ? {
                              uri:
                                user?.avatar_link ||
                                "https://ui-avatars.com/api/?name=User&background=random",
                            }
                          : require("../../assets/images/chat_logo.png")
                      }
                    />

                    <View
                      style={[
                        styles.messageBubble,
                        item.sender === "me"
                          ? styles.bubbleMe
                          : styles.bubbleOther,
                      ]}
                    >
                      {isImageUrl ? (
                        <Image
                          source={{ uri: item.text }}
                          style={{
                            width: 200,
                            height: 200,
                            borderRadius: 12,
                            resizeMode: "cover",
                          }}
                        />
                      ) : (
                        <Text
                          style={
                            item.sender === "me"
                              ? styles.textMe
                              : styles.textOther
                          }
                        >
                          {item.text}
                        </Text>
                      )}
                    </View>
                  </View>
                );
              }}
            />
            {isBotTyping && (
              <View style={styles.typingContainer}>
                <Avatar.Image
                  size={32}
                  style={styles.avatar}
                  source={require("../../assets/images/chat_logo.png")}
                />
                <View style={[styles.messageBubble, styles.bubbleOther]}>
                  <ActivityIndicator size="small" />
                </View>
              </View>
            )}
          </>
        )}

        <View style={styles.inputContainer}>
          <TouchableOpacity onPress={pickAndUploadImage} disabled={loading}>
            <Ionicons name="image-outline" size={24} />
          </TouchableOpacity>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.textInput}
              placeholder="Write a message"
              placeholderTextColor="#999"
              value={inputText}
              onChangeText={setInputText}
            />
            <TouchableOpacity
              onPress={() => handleChat(inputText)}
              disabled={loading}
            >
              <Ionicons name="send-outline" size={24} />
            </TouchableOpacity>
          </View>
          <Ionicons name="mic" size={24} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ChatRoomScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  flex: { flex: 1 },
  centered: { justifyContent: "center", alignItems: "center" },
  introContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  introTitle: { fontSize: 24, fontWeight: "bold", marginBottom: 12 },
  introText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 8,
    color: "#555",
  },
  messageList: { flexGrow: 1, justifyContent: "flex-end", padding: 12 },
  messageRow: {
    marginVertical: 4,
    maxWidth: "80%",
    flexDirection: "row",
    alignItems: "flex-end",
  },
  typingContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  avatar: { marginRight: 6, marginBottom: 4 },
  messageBubble: { padding: 12, borderRadius: 16, marginHorizontal: 4 },
  bubbleMe: {
    backgroundColor: "#00C897",
    borderTopLeftRadius: 12,
    borderTopRightRadius: 0,
  },
  bubbleOther: {
    backgroundColor: "#F1F1F1",
    borderTopLeftRadius: 0,
    borderTopRightRadius: 12,
  },
  textMe: { color: "#fff", fontSize: 16 },
  textOther: { color: "#000", fontSize: 16 },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    margin: 8,
    padding: 8,
    borderTopWidth: 1,
    borderColor: "#ddd",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginHorizontal: 8,
  },
  textInput: { flex: 1, fontSize: 16 },
});
