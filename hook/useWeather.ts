import { useState, useEffect } from "react";
import axios from "axios";
import { OPENWEATHER_API_KEY } from "@env";

export interface Coord {
  lon: number;
  lat: number;
}

export interface WeatherInfo {
  id: number;
  main: string;
  description: string;
  icon: string;
}

export interface MainInfo {
  temp: number;
  feels_like: number;
  temp_min: number;
  temp_max: number;
  pressure: number;
  humidity: number;
  grnd_level?: number;
  sea_level?: number;
}

export interface Wind {
  speed: number;
  deg: number;
  gust?: number;
}

export interface Clouds {
  all: number;
}

export interface Sys {
  country: string;
  sunrise: number;
  sunset: number;
}

export interface WeatherData {
  coord: Coord;
  weather: WeatherInfo[];
  base: string;
  main: MainInfo;
  visibility: number;
  wind: Wind;
  clouds: Clouds;
  dt: number;
  sys: Sys;
  timezone: number;
  id: number;
  name: string;
  cod: number;
}

interface UseWeatherResult {
  data: WeatherData | null;
  loading: boolean;
  error: Error | null;
}

export default function useWeather(city: string): UseWeatherResult {
  const [data, setData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        setLoading(true);
        const resp = await axios.get<WeatherData>(
          "https://api.openweathermap.org/data/2.5/weather",
          {
            params: {
              q: city,
              units: "metric",
              appid: OPENWEATHER_API_KEY,
            },
          }
        );
        console.log("Weather data fetched:", resp.data);
        setData(resp.data);
      } catch (err: any) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, [city]);

  return { data, loading, error };
}
