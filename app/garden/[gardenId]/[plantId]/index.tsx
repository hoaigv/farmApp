import { AntDesign, FontAwesome } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  FlatList,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import EditNameModal from "../../../../components/EditNameModal";
import Header from "../../../../components//Header";
import HealthStatusModal from "../../../../components/HealthStatusModal";
import LocationModal from "../../../../components/LocationModal";
import { initialReminders, Reminder } from "../../../../data/tasks";
import useCustomFonts from "../../../../hook/FontLoader";

const DetaiPlantScreen = () => {
  const router = useRouter();
  const [fontsLoaded] = useCustomFonts();
  const [reminders, setReminders] = useState<Reminder[]>(initialReminders);
  const [healthVisible, setHealthVisible] = useState(false);
  const [locationVisible, setLocationVisible] = useState(false);
  const [healthStatus, setHealthStatus] = useState("healthy");
  const [locationStatus, setLocationStatus] = useState("garden");
  const [plantName, setPlantName] = useState("Name of Plants");
  const [showEditModal, setShowEditModal] = useState(false);
  const renderReminder = ({ item }: { item: Reminder }) => {
    const todayStr = new Date().toDateString();

    const isCompletedToday = item.completedDates?.some(
      (date) => new Date(date).toDateString() === todayStr
    );

    const handleComplete = (item: Reminder) => {
      const today = new Date();
      const todayStr = today.toDateString();

      const alreadyCompleted = item.completedDates.some(
        (date) => new Date(date).toDateString() === todayStr
      );

      if (alreadyCompleted) {
        alert("Bạn đã hoàn thành nhắc nhở này hôm nay rồi!");
        return;
      }

      // Cập nhật mảng completedDates
      const updatedItem = {
        ...item,
        completedDates: [...item.completedDates, today],
      };

      // TODO: Lưu vào state hoặc database tùy theo cách bạn đang lưu reminders
      updateReminder(updatedItem);
    };
    const updateReminder = (updatedItem: Reminder) => {
      setReminders((prevReminders) =>
        prevReminders.map((reminder) =>
          reminder.id === updatedItem.id ? updatedItem : reminder
        )
      );
    };
    const handleSnooze = (item: Reminder) => {
      const now = new Date();
      const snoozeUntil = new Date(now.getTime() + 2 * 60 * 60 * 1000); // Hoãn 2 giờ

      const updatedItem = {
        ...item,
        snoozedUntil: snoozeUntil,
      };

      // TODO: Lưu vào state hoặc database tùy bạn
      updateReminder(updatedItem);
    };

    const isSnoozed =
      item.snoozedUntil && new Date(item.snoozedUntil) > new Date();

    const cardBgColor = isCompletedToday
      ? "bg-green-100"
      : isSnoozed
      ? "bg-gray-200"
      : "bg-white";

    return (
      <TouchableOpacity
        className={`rounded-2xl p-4 mb-3 shadow-md w-full ${cardBgColor}`}
        activeOpacity={0.95}
      >
        {/* Header */}
        <View className="flex-row justify-between items-center mb-2">
          <View className="flex-row items-center space-x-2">
            <Image
              source={
                item.jobType === "watering"
                  ? require("../../../../assets/images/drop.png")
                  : require("../../../../assets/images/fertilizer.png")
              }
              resizeMode="cover"
              className="h-5 w-5"
            />
            <Text className="text-lg font-bold capitalize">{item.jobType}</Text>
          </View>

          <View className="flex-row gap-1 items-center">
            <Image
              source={require("../../../../assets/images/bell.png")}
              resizeMode="cover"
              className="h-4 w-4"
            />
            <Text className="text-xs text-gray-500">
              {item.notificationBefore}
            </Text>
          </View>
        </View>

        {/* Thông tin lịch */}
        <View className="flex-row justify-between mb-2">
          <View className="gap-1">
            <Text className="text-gray-600">
              ⏰{" "}
              {item.remindTime.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Text>
            <Text className="text-gray-600">
              📆 Every{" "}
              {item.frequencyType === "daily"
                ? "day"
                : `${item.customFrequency} days`}
            </Text>
          </View>
          <View className="gap-1">
            <Text className="text-gray-600">
              ▶️ Start: {item.startDate.toLocaleDateString()}
            </Text>
            {item.endDate && (
              <Text className="text-gray-600">
                ⏹️ End: {item.endDate.toLocaleDateString()}
              </Text>
            )}
          </View>
        </View>

        {/* Trạng thái và thao tác */}
        <View className="flex-row justify-between items-center mt-2">
          {/* Trạng thái */}
          {isCompletedToday ? (
            <Text className="text-green-700 font-semibold">
              ✅ Completed today
            </Text>
          ) : isSnoozed && item.snoozedUntil ? (
            <Text className="text-yellow-700 font-semibold">
              🔁 Snoozed until{" "}
              {new Date(item.snoozedUntil).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Text>
          ) : (
            <Text className="text-gray-500">⏱️ Upcoming</Text>
          )}

          {/* Nút thao tác */}
          <View className="flex-row gap-4">
            <TouchableOpacity onPress={() => handleComplete(item)}>
              <Text className="text-green-600 font-semibold">
                ✅ Hoàn thành
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleSnooze(item)}>
              <Text className="text-yellow-600 font-semibold">🔁 Hoãn</Text>
            </TouchableOpacity>
            {/* <TouchableOpacity
              onPress={() =>
               {
                router.push(`/plants/${item.plantId}/reminder/${item.id}`)
                router.push(`/garden/${item.gardenId}/reminder/${item.id}`)
               }
              }
            >
              <AntDesign name="edit" size={20} color="black" />
            </TouchableOpacity> */}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const getPlantImage = () => {
    switch (healthStatus) {
      case "healthy":
        return require("../../../../assets/images/cardiogram.png");
      case "harvest":
        return require("../../../../assets/images/harvest.png");
      case "sick":
        return require("../../../../assets/images/warning.png");
      case "dead":
        return require("../../../../assets/images/dead-tree.png");
      default:
        return require("../../../../assets/images/cardiogram.png");
    }
  };
  const getLocationImage = () => {
    switch (locationStatus) {
      case "pot":
        return require("../../../../assets/images/pots.png");
      case "garden":
        return require("../../../../assets/images/spinach.png");
      default:
        return require("../../../../assets/images/pots.png");
    }
  };
  if (!fontsLoaded) return null;
  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <Header
        title={plantName}
        showBack={true}
        rightElement={
          <TouchableOpacity
            onPress={() => setShowEditModal(true)}
            className="p-2"
          >
            <AntDesign name="edit" size={24} color="black" />
          </TouchableOpacity>
        }
      />

      <EditNameModal
        visible={showEditModal}
        name={plantName}
        onDismiss={() => setShowEditModal(false)}
        onConfirm={(newName: string) => {
          setPlantName(newName);
          setShowEditModal(false);
        }}
      />
      {/* Image */}
      <View className=" flex-1 items-center ">
        <View className="absolute top-2 right-2 z-50">
          <View
            style={styles.quickActionItem}
            className="h-32 w-14 absolute bg-white opacity-60"
          />
          <BlurView
            intensity={100}
            tint="light"
            className="overflow-hidden rounded-lg"
          >
            <TouchableOpacity
              style={styles.quickActionItem}
              onPress={() => router.push("/chat/123")}
            >
              <Image
                source={require("../../../../assets/images/generative.png")}
                className="h-10 w-10"
                resizeMode="cover"
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickActionItem}
              onPress={() => router.push("/garden/123/123/chart")}
            >
              <Image
                source={require("../../../../assets/images/pie-chart.png")}
                className="h-10 w-10"
                resizeMode="cover"
              />
            </TouchableOpacity>
          </BlurView>
        </View>
        <Image
          source={{
            uri: "https://www.rootsplants.co.uk/cdn/shop/products/ecolette1.jpg?v=1631356642",
          }}
          className="w-full h-[55%] "
          resizeMode="cover"
        />
        <BlurView
          intensity={10}
          tint="light"
          className=" top-[45%] w-full absolute justify-center items-center "
        >
          <View className=" w-[95%] rounded-lg bg-white h-16 absolute top-3 opacity-90 " />
          <BlurView
            intensity={100}
            tint="light"
            className="z-10"
            style={styles.itemContainer}
          >
            <View style={styles.itemContext}>
              <Image
                source={require("../../../../assets/images/leaves-2.png")}
                resizeMode="cover"
                style={styles.itemImage}
              />
              <Text style={styles.itemText}>245 days</Text>
            </View>
            <TouchableOpacity
              style={styles.itemContext}
              onPress={() => setHealthVisible(true)}
            >
              <Image
                source={getPlantImage()}
                style={styles.itemImage}
                resizeMode="cover"
              />
              <Text style={styles.itemText}>{healthStatus}</Text>
              <HealthStatusModal
                visible={healthVisible}
                onDismiss={() => setHealthVisible(false)}
                value={healthStatus}
                onConfirm={(val) => {
                  setHealthStatus(val);
                  setHealthVisible(false);
                }}
              />
            </TouchableOpacity>
            <View style={styles.itemContext}>
              <Image
                source={require("../../../../assets/images/drop.png")}
                style={styles.itemImage}
                resizeMode="cover"
              />
              <Text style={styles.itemText}>Watered</Text>
            </View>
            <TouchableOpacity
              style={styles.itemContext}
              onPress={() => setLocationVisible(true)}
            >
              <Image
                source={getLocationImage()}
                style={styles.itemImage}
                resizeMode="cover"
              />
              <Text style={styles.itemText}>{locationStatus}</Text>
              <LocationModal
                visible={locationVisible}
                onDismiss={() => setLocationVisible(false)}
                value={locationStatus}
                onConfirm={(val) => {
                  setLocationStatus(val);
                  setLocationVisible(false);
                }}
              />
            </TouchableOpacity>
          </BlurView>
          <View className="w-[95%] flex-row items-center justify-between ">
            <Text
              style={{
                fontSize: 20,
                fontFamily: "PoetsenOne-Regular",
                marginVertical: 16,
              }}
            >
              Reminders :
            </Text>
            <View className="flex-row gap-10 items-center justify-center">
              {/* <TouchableOpacity
                onPress={() => router.push("/plants/123/reminder/123")}
              >
                <AntDesign
                  name="plus"
                  size={24}
                  color="black"
                  className="font-bold"
                />
              </TouchableOpacity> */}
              <TouchableOpacity>
                <FontAwesome name="history" size={24} color="black" />
              </TouchableOpacity>
            </View>
          </View>
          <FlatList
            data={reminders}
            keyExtractor={(item) => item.id}
            renderItem={renderReminder}
            contentContainerStyle={{
              paddingBottom: 16,
              flexGrow: 1,
              padding: 10,
            }}
            ListEmptyComponent={
              <View className=" items-center justify-center">
                <Text className="text-gray-500">No reminders</Text>
              </View>
            }
            showsVerticalScrollIndicator={false}
            style={{ flex: 1, height: 300, width: "100%" }}
          />
        </BlurView>
      </View>
    </SafeAreaView>
  );
};

export default DetaiPlantScreen;

const styles = StyleSheet.create({
  quickActionItem: {
    padding: 8, // tương ứng với p-2
    borderRadius: 12, // rounded-lg ~ 12
    marginBottom: 8, // mb-2
    alignItems: "center",
    justifyContent: "center",
  },
  itemContext: {
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    padding: 5,
    borderRadius: 10,
  },
  itemContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    marginVertical: 10,
    padding: 5,
    width: "95%",
    height: 64,
    borderRadius: 10,
    overflow: "hidden",
  },
  itemImage: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  itemText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
});
