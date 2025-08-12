// components/ui/WeatherModal.tsx
import React from "react";
import { Modal, View, Text, Button, Image } from "react-native";
import { WeatherData } from "@/hook/useWeather";

export interface WeatherModalProps {
  visible: boolean;
  onClose: () => void;
  weatherData: WeatherData;
}

const WeatherModal: React.FC<WeatherModalProps> = ({
  visible,
  onClose,
  weatherData,
}) => {
  const { main, weather, wind, name } = weatherData;
  const icon = weather[0].icon;
  const description = weather[0].description;

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "rgba(0,0,0,0.5)",
        }}
      >
        <View
          style={{
            backgroundColor: "white",
            padding: 24,
            borderRadius: 16,
            width: "80%",
            alignItems: "center",
          }}
        >
          <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 8 }}>
            {name} Weather
          </Text>
          <Image
            source={{ uri: `https://openweathermap.org/img/wn/${icon}@4x.png` }}
            style={{ width: 100, height: 100 }}
          />
          <Text style={{ fontSize: 32, marginVertical: 8 }}>
            {Math.round(main.temp)}°C
          </Text>
          <Text style={{ textTransform: "capitalize", marginBottom: 16 }}>
            {description}
          </Text>
          <Text>Humidity: {main.humidity}%</Text>
          <Text>Wind Speed: {wind.speed} m/s</Text>
          <View style={{ marginTop: 16, width: "100%" }}>
            <Button title="Close" onPress={onClose} />
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default WeatherModal;
