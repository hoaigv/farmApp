// src/hooks/useCreatePost.ts
import { useState } from "react";
import { Alert } from "react-native";
import { createPost } from "@/api/postApi";

export function useCreatePost() {
  const [posting, setPosting] = useState(false);

  const makePost = async (
    body: string,
    imageLink?: string
  ): Promise<boolean> => {
    try {
      setPosting(true);
      console.log("Creating post with data:", { body, imageLink });
      await createPost({ body, imageLink });

      return true;
    } catch (err) {
      console.error("Create post failed", err);
      Alert.alert("Error", "Failed to create post. Please try again.");
      return false;
    } finally {
      setPosting(false);
    }
  };

  return { posting, makePost };
}
