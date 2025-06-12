// src/screens/ProfileScreen.tsx
import React, { useState } from "react";
import {
  Image,
  Pressable,
  SafeAreaView,
  Text,
  View,
  Alert,
} from "react-native";
import { logout } from "../../store/authSlice";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import ChangePasswordModal from "../../components/PasswordModal";
import { changePassword } from "../../api/userApi"; // Import hàm đổi mật khẩu từ authApi
// Import các icon từ @expo/vector-icons
import AntDesign from "@expo/vector-icons/AntDesign";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

const ProfileScreen = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const [modalVisible, setModalVisible] = useState(false);
  const handleChangePassword = async (data: {
    oldPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) => {
    try {
      // 👉 Gọi API đổi mật khẩu
      const res = await changePassword({
        oldPassword: data.oldPassword,
        password: data.newPassword,
        confirmPassword: data.confirmPassword,
      });

      // If the API returns a message, you can show it
      Alert.alert("Success", res.message || "Password updated");
      setModalVisible(false);
    } catch (err: any) {
      // Catch and display errors
      const msg =
        err.response?.data?.message ||
        err.message ||
        "An error occurred, please try again";
      Alert.alert("Error", msg);
    }
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
        <Pressable className="flex-row items-center px-6 py-4 border-b border-gray-100">
          <AntDesign
            name="enviromento"
            size={20}
            color="#4B5563"
            style={{ marginRight: 16 }}
          />
          <Text className="text-base text-gray-800">Addresses</Text>
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
          <FontAwesome5
            name="money-bill-wave"
            size={18}
            color="#4B5563"
            style={{ marginRight: 16 }}
          />
          <Text className="text-base text-gray-800">Transactions</Text>
        </Pressable>

        <Pressable className="flex-row items-center px-6 py-4 border-b border-gray-100">
          <Ionicons
            name="notifications-outline"
            size={20}
            color="#4B5563"
            style={{ marginRight: 16 }}
          />
          <Text className="text-base text-gray-800">Notifications</Text>
        </Pressable>

        <Pressable className="flex-row items-center px-6 py-4 border-b border-gray-100">
          <Ionicons
            name="settings-outline"
            size={20}
            color="#4B5563"
            style={{ marginRight: 16 }}
          />
          <Text className="text-base text-gray-800">Settings</Text>
        </Pressable>

        <Pressable className="flex-row items-center px-6 py-4 border-b border-gray-100">
          <Ionicons
            name="person-outline"
            size={20}
            color="#4B5563"
            style={{ marginRight: 16 }}
          />
          <Text className="text-base text-gray-800">About Me</Text>
        </Pressable>
      </View>

      {/* Sign Out */}
      <Pressable onPress={() => dispatch(logout())} className="px-6 py-5">
        <Text className="text-green-600 font-medium">Sign Out</Text>
      </Pressable>
    </SafeAreaView>
  );
};

export default ProfileScreen;
