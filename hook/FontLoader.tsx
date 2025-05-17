import { useFonts } from "expo-font";

export default function useCustomFonts() {
  return useFonts({
    "PoetsenOne-Regular": require("@/assets/fonts/PoetsenOne-Regular.ttf"),
  });
}
