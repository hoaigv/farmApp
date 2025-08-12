import AsyncStorage from "@react-native-async-storage/async-storage";

const LOCATION_KEY = "user_location";

// ✅ Store location
export const storeLocation = async (location: string) => {
  try {
    await AsyncStorage.setItem(LOCATION_KEY, location);
    console.log("✅ Location saved:", location);
  } catch (error) {
    console.error("❌ Error saving location:", error);
  }
};

// ✅ Get location
export const getLocation = async (): Promise<string | null> => {
  try {
    const value = await AsyncStorage.getItem(LOCATION_KEY);
    console.log("📍 Retrieved location:", value);
    return value;
  } catch (error) {
    console.error("❌ Error retrieving location:", error);
    return null;
  }
};

// ✅ Remove location
export const removeLocation = async () => {
  try {
    await AsyncStorage.removeItem(LOCATION_KEY);
    console.log("🗑️ Location removed");
  } catch (error) {
    console.error("❌ Error removing location:", error);
  }
};
