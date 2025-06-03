import { ImageSourcePropType } from "react-native";

export type PostTypes = {
  id: string;
  user: {
    name: string;
    avatar: string;
  };
  time: string;
  content: string;
  image: ImageSourcePropType;
};
