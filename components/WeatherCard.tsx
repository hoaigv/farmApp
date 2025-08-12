import React, { useState, useEffect } from "react";
import {
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Image,
} from "react-native";
import { Entypo } from "@expo/vector-icons";
import WeatherModal from "./ui/WeatherModal";
import useWeather, { WeatherData } from "@/hook/useWeather";
import { getLocation } from "@/store/LocationStorage";
const DEFAULT_CITY = "Da Nang";

const WeatherCard: React.FC = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [city, setCity] = useState<string>(DEFAULT_CITY);

  // Lấy vị trí từ AsyncStorage
  useEffect(() => {
    const fetchLocation = async () => {
      const storedLocation = await getLocation();
      if (storedLocation) {
        setCity(storedLocation);
      }
    };
    fetchLocation();
  }, []);

  const { data, loading, error } = useWeather(city);

  let content: React.ReactNode;
  if (loading) {
    content = <ActivityIndicator />;
  } else if (error || !data) {
    content = <Text style={{ color: "red" }}>Error loading</Text>;
  } else {
    const temp = Math.round(data.main.temp);
    const desc = data.weather[0].main;
    const icon = data.weather[0].icon;
    content = (
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Image
          source={{ uri: `https://openweathermap.org/img/wn/${icon}@2x.png` }}
          style={{ width: 20, height: 20, marginRight: 4 }}
        />
        <Text>{`${temp}°C - ${desc}`}</Text>
      </View>
    );
  }

  return (
    <>
      <TouchableOpacity
        style={{
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: "white",
          paddingHorizontal: 16,
          paddingVertical: 4,
          borderRadius: 9999,
          shadowColor: "#000",
          shadowOpacity: 0.1,
          shadowRadius: 4,
        }}
        onPress={() => setModalVisible(true)}
        disabled={loading}
      >
        <View
          style={{
            borderRadius: 9999,
            padding: 4,
            marginRight: 8,
          }}
          className="bg-primary"
        >
          <Entypo name="location-pin" size={24} color="white" />
        </View>
        <View>
          <Text style={{ fontSize: 16, fontWeight: "bold" }}>{city}</Text>
          {content}
        </View>
      </TouchableOpacity>

      {data && (
        <WeatherModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          weatherData={data as WeatherData}
        />
      )}
    </>
  );
};

export default WeatherCard;
