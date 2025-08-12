import React, { useState, useEffect } from "react";
import {
  Image,
  Pressable,
  SafeAreaView,
  Text,
  View,
  Alert,
  Switch,
} from "react-native";
import { logout } from "../../store/authSlice";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import ChangePasswordModal from "../../components/PasswordModal";
import { changePassword } from "../../api/userApi";
import AntDesign from "@expo/vector-icons/AntDesign";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import Octicons from "@expo/vector-icons/Octicons";
import Fontisto from "@expo/vector-icons/Fontisto";
// 📍 Import Location Modal & Storage
import LocationPickerModal from "../../components/LocationPickerModal";
import { getLocation } from "@/store/LocationStorage";
import { useRouter } from "expo-router";

const ProfileScreen = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);

  const [modalVisible, setModalVisible] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const [locationModalVisible, setLocationModalVisible] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<string>("");

  const toggleSwitch = () => setIsEnabled((prev) => !prev);

  // Lấy vị trí đã lưu từ AsyncStorage khi load screen
  useEffect(() => {
    const fetchLocation = async () => {
      const stored = await getLocation();
      if (stored) setSelectedLocation(stored);
    };
    fetchLocation();
  }, []);

  const handleChangePassword = async (data: {
    oldPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) => {
    try {
      const res = await changePassword({
        oldPassword: data.oldPassword,
        password: data.newPassword,
        confirmPassword: data.confirmPassword,
      });
      Alert.alert("Success", res.message || "Password updated");
      setModalVisible(false);
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        "An error occurred, please try again";
      Alert.alert("Error", msg);
    }
  };

  const handleLocationSaved = (location: string) => {
    setSelectedLocation(location);
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header Avatar */}
      <View className="items-center mt-10 mb-6">
        <Image
          source={{
            uri:
              user?.avatar_link ||
              "https://ui-avatars.com/api/?name=User&background=random",
          }}
          className="w-24 h-24 rounded-full"
        />
        <Text className="text-lg font-semibold mt-3">
          {user?.name || "Guest"}
        </Text>
      </View>

      {/* Menu Items */}
      <View className="border-t border-gray-200">
        {/* 🌍 Location Picker */}
        <Pressable
          className="flex-row items-center px-6 py-4 border-b border-gray-100"
          onPress={() => setLocationModalVisible(true)}
        >
          <AntDesign
            name="enviromento"
            size={20}
            color="#4B5563"
            style={{ marginRight: 16 }}
          />
          <View className="flex-row justify-between items-center flex-1">
            <Text className="text-base text-gray-800">
              {selectedLocation ? selectedLocation : "Addresses"}
            </Text>
          </View>
        </Pressable>

        <Pressable
          className="flex-row items-center px-6 py-4 border-b border-gray-100"
          onPress={() => setModalVisible(true)}
        >
          <MaterialIcons
            name="password"
            size={20}
            color="black"
            style={{ marginRight: 16 }}
          />
          <Text className="text-base text-gray-800">Password</Text>
        </Pressable>

        <ChangePasswordModal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          onSubmit={handleChangePassword}
        />

        <Pressable className="flex-row items-center px-6 py-4 border-b border-gray-100">
          <Octicons
            name="versions"
            size={20}
            color="#4B5563"
            style={{ marginRight: 16 }}
          />
          <Text className="text-base text-gray-800">Version</Text>
        </Pressable>

        <Pressable className="flex-row items-center px-6 py-4 border-b border-gray-100">
          <Ionicons
            name="notifications-outline"
            size={20}
            color="#4B5563"
            style={{ marginRight: 16 }}
          />
          <Text className="text-base text-gray-800">Notifications</Text>
          <Switch
            value={isEnabled}
            onValueChange={toggleSwitch}
            className="ml-auto"
            trackColor={{ false: "#d1d5db", true: "#4ade80" }}
            thumbColor={isEnabled ? "#10b981" : "#f4f3f4"}
          />
        </Pressable>
        <Pressable
          onPress={() => router.push("/forum/history")}
          className="flex-row items-center px-6 py-4 border-b border-gray-100"
        >
          <Fontisto
            name="history"
            size={20}
            color="#4B5563"
            style={{ marginRight: 16 }}
          />
          <Text className="text-base text-gray-800">History Posts</Text>
        </Pressable>

        <Pressable
          onPress={() => dispatch(logout())}
          className="flex-row items-center px-6 py-4 border-b border-gray-100"
        >
          <MaterialIcons
            name="logout"
            size={20}
            color="#4B5563"
            style={{ marginRight: 16 }}
          />
          <Text className="text-green-600 font-medium">Logout</Text>
        </Pressable>
      </View>

      {/* 📍 Location Picker Modal */}
      <LocationPickerModal
        visible={locationModalVisible}
        onDismiss={() => setLocationModalVisible(false)}
        onLocationSaved={handleLocationSaved}
      />
    </SafeAreaView>
  );
};

export default ProfileScreen;
