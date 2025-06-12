// src/utils/tokenUtils.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
export const getToken = async (): Promise<string | null> => {
  try {
    const token = await AsyncStorage.getItem("accessToken");
    console.log("Token retrieved:", token);
    return token;
  } catch (error) {
    console.error("Error getting token:", error);
    return null;
  }
};
