// src/screens/CreateNoteScreen.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  Image,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
} from "react-native";
import { Formik } from "formik";
import * as Yup from "yup";
import * as ImagePicker from "expo-image-picker";
import { createGardenNote, CreateGardenNoteRequest } from "@/api/gardenNoteApi";
import { uploadFile } from "@/api/fileImageApi";
import Header from "@/components/Header";
import { useLocalSearchParams } from "expo-router";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

// Validation schema
const NoteSchema = Yup.object().shape({
  noteTitle: Yup.string()
    .max(100, "Title can be at most 100 characters")
    .required("Title is required"),
  noteText: Yup.string().required("Note is required"),
});

const CreateNoteScreen = () => {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const { gardenId } = useLocalSearchParams<{ gardenId: string }>();
  const pickImage = async (setFieldValue: any) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled && result.assets.length > 0) {
      const uri = result.assets[0].uri;
      setImageUri(uri);
      try {
        setUploading(true);
        const fileName = uri.split("/").pop() || "photo.jpg";
        const fileType = "image/jpeg";
        const response = await uploadFile({
          uri,
          name: fileName,
          type: fileType,
        });
        setFieldValue("photoUrl", response.result);
      } catch (err: any) {
        Alert.alert("Upload Error", err.message || "Failed to upload image");
      } finally {
        setUploading(false);
      }
    }
  };

  const initialValues: CreateGardenNoteRequest = {
    noteTitle: "",
    noteText: "",
    photoUrl: "",
    gardenId: gardenId || "",
  };

  const handleSubmit = async (values: CreateGardenNoteRequest) => {
    if (!values.gardenId) {
      Alert.alert("Error", "Garden ID is required");
      return;
    }
    console.log("Submitting note with values:", values);
    try {
      await createGardenNote(values);
      Alert.alert("Success", "Garden note created successfully");
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to create garden note");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <Header title="Create Note" showBack />
      <Formik
        initialValues={initialValues}
        validationSchema={NoteSchema}
        onSubmit={handleSubmit}
      >
        {({
          handleChange,
          handleBlur,
          handleSubmit,
          values,
          errors,
          touched,
          setFieldValue,
        }) => (
          <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.imageContainer}>
              <TouchableOpacity
                onPress={() => pickImage(setFieldValue)}
                style={styles.imageWrapper}
              >
                {uploading ? (
                  <ActivityIndicator size="large" />
                ) : imageUri ? (
                  <Image source={{ uri: imageUri }} style={styles.image} />
                ) : (
                  <Text style={styles.imagePlaceholder}>
                    Tap to select image
                  </Text>
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Title</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter title"
                value={values.noteTitle}
                onChangeText={handleChange("noteTitle")}
                onBlur={handleBlur("noteTitle")}
              />
              {touched.noteTitle && errors.noteTitle && (
                <Text style={styles.errorText}>{errors.noteTitle}</Text>
              )}
            </View>

            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Note</Text>
              <TextInput
                style={[styles.input, styles.multiline]}
                placeholder="Enter your note here..."
                multiline
                value={values.noteText}
                onChangeText={handleChange("noteText")}
                onBlur={handleBlur("noteText")}
              />
              {touched.noteText && errors.noteText && (
                <Text style={styles.errorText}>{errors.noteText}</Text>
              )}
            </View>

            <Button title="Create Note" onPress={() => handleSubmit()} />
          </ScrollView>
        )}
      </Formik>
    </SafeAreaView>
  );
};

export default CreateNoteScreen;

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#fff",
  },
  imageContainer: {
    height: SCREEN_HEIGHT / 4,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  imageWrapper: {
    width: "80%",
    height: "100%",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  imagePlaceholder: {
    color: "#aaa",
    fontSize: 16,
  },
  fieldContainer: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 4,
    fontSize: 16,
    fontWeight: "600",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    backgroundColor: "#fafafa",
  },
  multiline: {
    height: SCREEN_HEIGHT / 3,
    textAlignVertical: "top",
  },
  errorText: {
    color: "red",
    marginTop: 4,
  },
});
