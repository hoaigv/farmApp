import {
  AntDesign,
  FontAwesome,
  Fontisto,
  SimpleLineIcons,
} from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  FlatList,
  Image,
  ImageSourcePropType,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type PostType = {
  id: string;
  user: {
    name: string;
    avatar: string;
  };
  time: string;
  content: string;
  image: ImageSourcePropType;
};

const dummyPosts: PostType[] = [
  {
    id: "1",
    user: {
      name: "George Gregor",
      avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    },
    time: "12 mins ago",
    content:
      "Hi guys, I’ve got a problem with my plant, when I try to let it be on sun, leaves are moving low and start to dry. Could you tell me please what’s the problem?",
    image: require("../../assets/images/warning.png"),
  },
  {
    id: "2",
    user: {
      name: "Emily Watson",
      avatar: "https://randomuser.me/api/portraits/women/45.jpg",
    },
    time: "1 hour ago",
    content: "My tomato plant is not growing well. Any suggestions?",
    image: require("../../assets/images/warning.png"),
  },
];

const SocialCommunityScreen = () => {
  const [posts, setPosts] = useState<PostType[]>(dummyPosts);
  const [newPost, setNewPost] = useState<string>("");
  const router = useRouter();

  const handleLikePost = (postId: string) => {
    // Logic to handle liking a post
    console.log(`Post ${postId} liked!`);
  };
  const renderPost = ({ item }: { item: PostType }) => (
    <View className="bg-white rounded-xl shadow-black shadow-md p-4 mb-4 border border-gray-100">
      <View className="flex-row items-center mb-2">
        <Image
          source={{ uri: item.user.avatar }}
          className="w-10 h-10 rounded-full mr-2"
        />
        <View>
          <Text className="font-semibold">{item.user.name}</Text>
          <Text className="text-xs text-gray-500">{item.time}</Text>
        </View>
      </View>

      <Text className="text-sm mb-3">{item.content}</Text>

      <Image
        source={item.image}
        className="w-full h-48 rounded-lg mb-3"
        resizeMode="cover"
      />

      <View className="flex-row justify-between">
        <TouchableOpacity style={styles.quickActionItem}>
          <AntDesign name="hearto" size={24} color="black" />
          <Text>222</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.quickActionItem}
          onPress={() => router.push(`/forum/${item.id}`)}
        >
          <FontAwesome name="comment-o" size={24} color="black" />
          <Text>32</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickActionItem}>
          <SimpleLineIcons name="share-alt" size={24} color="black" />
          <Text> Share</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const handleAddPost = () => {
    if (newPost.trim()) {
      const newPostData: PostType = {
        id: Date.now().toString(),
        user: {
          name: "You",
          avatar: "https://randomuser.me/api/portraits/men/1.jpg",
        },
        time: "Just now",
        content: newPost.trim(),
        image: require("../../assets/images/warning.png"),
      };
      setPosts([newPostData, ...posts]);
      setNewPost("");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white px-4 pt-4">
      {/* Header */}
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-xl font-bold">Social Community</Text>
        <TouchableOpacity onPress={() => router.push("/forum/history")}>
          <Text className="text-blue-600">History</Text>
        </TouchableOpacity>
      </View>

      {/* Create Post */}
      <View className="flex-row items-center bg-gray-100 rounded-full px-4 py-2 mb-4">
        <Image
          source={{ uri: "https://randomuser.me/api/portraits/men/1.jpg" }}
          className="w-8 h-8 rounded-full mr-2"
        />
        <TextInput
          placeholder="What’s on your mind?"
          placeholderTextColor="#888"
          value={newPost}
          onChangeText={setNewPost}
          className="flex-1 text-base"
        />
        <TouchableOpacity
          className="border p-1 rounded-md "
          onPress={() => router.push("/forum/create")}
        >
          <Fontisto name="plus-a" size={22} color="black" />
        </TouchableOpacity>
      </View>

      {/* Posts */}
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={renderPost}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 8, flexGrow: 1 }}
        ListEmptyComponent={
          <View className="items-center justify-center">
            <Text className="text-gray-500">No posts yet.</Text>
          </View>
        }
        className="flex-1 mb-20"
      />
    </SafeAreaView>
  );
};

export default SocialCommunityScreen;
const styles = StyleSheet.create({
  quickActionItem: {
    alignItems: "center",
    flexDirection: "row",

    justifyContent: "center",

    padding: 8,

    borderRadius: 8,

    gap: 4,
  },
});
