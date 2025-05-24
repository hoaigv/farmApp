import Ionicons from "@expo/vector-icons/Ionicons";
import { BlurView } from "expo-blur";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  Image,
  ImageSourcePropType,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import NotificationBell from "../../components/NotificationBell";
import SearchInput from "../../components/SearchInput";
import { plants } from "../../data/plants";
import useCustomFonts from "../../hook/FontLoader";
interface Plant {
  id: string;
  name: string;
  image: {
    uri: string;
  };
  subdescription: {
    text: string;
    icon: ImageSourcePropType;
  };
}
const MyPlantsScreen = () => {
  const router = useRouter();
  const [fontsLoaded] = useCustomFonts();
  const [search, setSearch] = useState("");
  const [filteredPlants, setFilteredPlants] = useState(plants);
  useEffect(() => {
    if (search.trim() === "") {
      setFilteredPlants(plants);
    }
    const filtered = plants.filter((p) =>
      p.name.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredPlants(filtered);
  }, [search]);
  if (!fontsLoaded) {
    return null; // or a loading indicatore
  }

  const renderItem = ({ item }: { item: Plant }) => {
    return (
      <TouchableOpacity
        className="flex-1  bg-gray-100 items-center justify-center flex-col  gap-2 m-2 rounded-lg  shadow-black shadow-sm relative "
        onPress={() => {
          router.push(`/plants/${item.id}`);
        }}
      >
        <Image
          source={item.image}
          className="w-full h-56 rounded-lg z-0"
          resizeMode="cover"
        />
        <View className=" w-[95%] rounded-lg h-14 absolute z-10 bg-white bottom-1 opacity-60 shadow-black shadow-md" />

        <BlurView
          intensity={100}
          tint="light"
          className="z-20 flex-col items-center absolute  bottom-1 w-[95%] bg-white  rounded-lg overflow-hidden gap-1 p-1 h-14"
        >
          <Text className="font-bold">{item.name}</Text>
          <View className="flex-row items-center gap-2">
            <View style={styles.itemContext}>
              <Image
                source={require("../../assets/images/leaves.png")}
                className="w-5 h-5"
                resizeMode="contain"
              />
              <Text>Heathy</Text>
            </View>
            <View style={styles.itemContext}>
              <Image
                source={require("../../assets/images/water.png")}
                className="w-5 h-5"
                resizeMode="contain"
              />
              <Text>Watered</Text>
            </View>
          </View>
        </BlurView>
      </TouchableOpacity>
    );
  };
  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Header */}
      <View className="items-center px-2  pb-6 justify-between">
        <Text style={{ fontSize: 22, fontFamily: "PoetsenOne-Regular" }}>
          My Plants
        </Text>
        <View className="absolute right-2 top-0">
          <NotificationBell />
        </View>
      </View>
      {/* Search Bar and Buttons */}
      <View className="flex-row items-center justify-between px-2">
        <SearchInput
          value={search}
          onChangeText={setSearch}
          onClear={() => setSearch("")}
        />
        <TouchableOpacity className="bg-slate-200 p-2 rounded-md">
          <Ionicons name="filter" size={30} color="black" />
        </TouchableOpacity>
        {/* Add */}
        <TouchableOpacity
          className="bg-primary p-2 rounded-md"
          onPress={() => router.push("/plants/create")}
        >
          <Ionicons name="add" size={30} color="white" />
        </TouchableOpacity>
      </View>

      {/* List Card */}
      <View className="h-[77.5%] m-2  ">
        {plants.length === 0 && (
          <View className="flex-1 items-center justify-center mt-[50%] ">
            <Image
              source={require("../../assets/images/pots.png")}
              className="w-40 h-40 mb-4 opacity-80"
              resizeMode="contain"
            />
            <Text className="text-lg font-semibold text-gray-700 mb-2">
              You don`t have any plants in your garden yet.
            </Text>
          </View>
        )}
        {plants.length > 0 && filteredPlants.length === 0 && (
          <View className="flex-1 items-center justify-center px-4">
            <Image
              source={require("../../assets/images/no-results.png")}
              className="w-40 h-40 mb-4 opacity-80"
              resizeMode="contain"
            />
            <Text className="text-lg font-semibold text-gray-700 mb-1">
              No matching plant found
            </Text>
            <Text className="text-base text-gray-500 text-center">
              Try changing your search keywords or clearing the filters.
            </Text>
          </View>
        )}

        <FlatList
          data={filteredPlants}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 10 }}
          showsVerticalScrollIndicator={false}
          numColumns={2}
        />
      </View>
    </SafeAreaView>
  );
};

export default MyPlantsScreen;

const styles = StyleSheet.create({
  itemContext: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
});
