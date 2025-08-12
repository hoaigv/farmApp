// src/screens/[garden]/note/[noteId].tsx
import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  Image,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Formik } from "formik";
import * as Yup from "yup";
import * as ImagePicker from "expo-image-picker";

import Header from "@/components/Header";
import { useLocalSearchParams, useRouter, useFocusEffect } from "expo-router";
import {
  getGardenNoteById,
  updateGardenNote,
  deleteGardenNotes,
  GardenNoteResponse,
} from "@/api/gardenNoteApi";
import { uploadFile } from "@/api/fileImageApi";
import { AntDesign } from "@expo/vector-icons";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

// Validation schema: similar to CreateNoteScreen
const NoteSchema = Yup.object().shape({
  noteTitle: Yup.string()
    .max(100, "Title can be at most 100 characters")
    .required("Title is required"),
  noteText: Yup.string().required("Note content is required"),
  // photoUrl is optional
});

type NoteDetailParams = {
  gardenId: string;
  noteId: string;
};

const EditNoteScreen: React.FC = () => {
  const router = useRouter();
  const { gardenId, noteId } = useLocalSearchParams<NoteDetailParams>();

  const [initialValues, setInitialValues] = useState<{
    noteTitle: string;
    noteText: string;
    photoUrl: string;
    gardenId: string;
    id: string;
  } | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [uploading, setUploading] = useState<boolean>(false);
  const [imageUri, setImageUri] = useState<string | null>(null);

  // Fetch note detail on mount or when noteId changes
  const fetchDetail = useCallback(async () => {
    if (!noteId) return;
    setLoading(true);
    try {
      const res = await getGardenNoteById(noteId);
      const note: GardenNoteResponse = res.result;
      if (!note) {
        Alert.alert("Error", "Note not found", [
          { text: "OK", onPress: () => router.back() },
        ]);
        return;
      }
      // Set initial values
      setInitialValues({
        id: note.id,
        gardenId: note.gardenId,
        noteTitle: note.noteTitle || "",
        noteText: note.noteText || "",
        photoUrl: note.photoUrl || "",
      });
      // For preview: if photoUrl exists, set imageUri to that URL
      setImageUri(note.photoUrl || null);
    } catch (error: any) {
      console.error("Error loading note detail:", error);
      Alert.alert(
        "Error",
        error?.response?.data?.message || "Unable to load note detail",
        [{ text: "OK", onPress: () => router.back() }]
      );
    } finally {
      setLoading(false);
    }
  }, [noteId, router]);

  useFocusEffect(
    useCallback(() => {
      fetchDetail();
    }, [fetchDetail])
  );

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  // Image picking & uploading logic
  const pickImageAsync = async (
    setFieldValue: (field: string, value: any) => void
  ) => {
    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert(
          "Permission required",
          "Permission to access gallery is required!"
        );
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });
      if (!result.canceled && result.assets.length > 0) {
        const uri = result.assets[0].uri;
        // Preview local uri
        setImageUri(uri);
        // Upload file to get remote URL
        try {
          setUploading(true);
          const fileName = uri.split("/").pop() || "photo.jpg";
          // Derive type from extension if needed; here assume jpeg/png
          const ext = fileName.split(".").pop()?.toLowerCase();
          let fileType = "image/jpeg";
          if (ext === "png") fileType = "image/png";
          const response = await uploadFile({
            uri,
            name: fileName,
            type: fileType,
          });
          // response.result assumed to be the URL string
          setFieldValue("photoUrl", response.result);
        } catch (err: any) {
          console.error("Upload Error:", err);
          Alert.alert("Upload Error", err.message || "Failed to upload image");
        } finally {
          setUploading(false);
        }
      }
    } catch (err) {
      console.error("Error picking image:", err);
    }
  };

  const takePhotoAsync = async (
    setFieldValue: (field: string, value: any) => void
  ) => {
    try {
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (!perm.granted) {
        Alert.alert(
          "Permission required",
          "Permission to access camera is required!"
        );
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 1,
      });
      if (!result.canceled && result.assets.length > 0) {
        const uri = result.assets[0].uri;
        setImageUri(uri);
        try {
          setUploading(true);
          const fileName = uri.split("/").pop() || "photo.jpg";
          const ext = fileName.split(".").pop()?.toLowerCase();
          let fileType = "image/jpeg";
          if (ext === "png") fileType = "image/png";
          const response = await uploadFile({
            uri,
            name: fileName,
            type: fileType,
          });
          setFieldValue("photoUrl", response.result);
        } catch (err: any) {
          console.error("Upload Error:", err);
          Alert.alert("Upload Error", err.message || "Failed to upload image");
        } finally {
          setUploading(false);
        }
      }
    } catch (err) {
      console.error("Error taking photo:", err);
    }
  };

  const handleImagePress = (
    setFieldValue: (field: string, value: any) => void
  ) => {
    if (imageUri) {
      // Show options: View / Change / Remove / Cancel
      Alert.alert(
        "Photo",
        undefined,
        [
          {
            text: "View",
            onPress: () => {
              // Optionally implement a modal to view full image
            },
          },
          {
            text: "Change",
            onPress: () => pickImageAsync(setFieldValue),
          },
          {
            text: "Take Photo",
            onPress: () => takePhotoAsync(setFieldValue),
          },
          {
            text: "Remove",
            style: "destructive",
            onPress: () => {
              setImageUri(null);
              setFieldValue("photoUrl", "");
            },
          },
          { text: "Cancel", style: "cancel" },
        ],
        { cancelable: true }
      );
    } else {
      // No image yet: pick or take
      Alert.alert(
        "Add Photo",
        undefined,
        [
          {
            text: "Pick from Gallery",
            onPress: () => pickImageAsync(setFieldValue),
          },
          {
            text: "Take Photo",
            onPress: () => takePhotoAsync(setFieldValue),
          },
          { text: "Cancel", style: "cancel" },
        ],
        { cancelable: true }
      );
    }
  };

  // Delete note
  const handleDelete = () => {
    Alert.alert("Delete Note", "Are you sure you want to delete this note?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          if (!noteId) return;
          try {
            await deleteGardenNotes([noteId]);
            Alert.alert("Deleted", "Note has been deleted.", [
              { text: "OK", onPress: () => router.back() },
            ]);
          } catch (error: any) {
            console.error("Error deleting note:", error);
            Alert.alert(
              "Error",
              error?.response?.data?.message || "Unable to delete note"
            );
          }
        },
      },
    ]);
  };

  if (loading || initialValues === null) {
    // Show loading spinner while fetching initial data
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007aff" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title="Edit Note"
        showBack
        rightElement={
          <TouchableOpacity onPress={handleDelete} style={styles.headerIcon}>
            <AntDesign name="delete" size={24} color="#ff3b30" />
          </TouchableOpacity>
        }
      />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
      >
        <ScrollView contentContainerStyle={styles.container}>
          <Formik
            initialValues={initialValues}
            validationSchema={NoteSchema}
            enableReinitialize
            onSubmit={async (values, { setSubmitting }) => {
              // Submit update
              if (!values.id || !values.gardenId) {
                Alert.alert("Error", "Missing note ID or garden ID");
                setSubmitting(false);
                return;
              }
              try {
                setSubmitting(true);
                await updateGardenNote({
                  id: values.id,
                  gardenId: values.gardenId,
                  noteTitle: values.noteTitle,
                  noteText: values.noteText,
                  photoUrl: values.photoUrl || undefined,
                });
                Alert.alert("Saved", "Note updated successfully", [
                  {
                    text: "OK",
                    onPress: () => router.back(),
                  },
                ]);
              } catch (error: any) {
                console.error("Error updating note:", error);
                Alert.alert(
                  "Error",
                  error?.response?.data?.message || "Unable to save changes"
                );
              } finally {
                setSubmitting(false);
              }
            }}
          >
            {({
              handleChange,
              handleBlur,
              handleSubmit,
              values,
              errors,
              touched,
              isSubmitting,
              setFieldValue,
            }) => (
              <>
                {/* Image Picker Section */}
                <View style={styles.imageContainer}>
                  <TouchableOpacity
                    onPress={() => handleImagePress(setFieldValue)}
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

                {/* Title Field */}
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

                {/* Content Field */}
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

                {/* If you have a date field in your note model, you can add DatePicker here similarly:
                <View style={styles.fieldContainer}>
                  <Text style={styles.label}>Date</Text>
                  // implement date picker...
                </View>
                */}

                {/* Save Button */}
                <TouchableOpacity
                  style={[styles.saveButton, isSubmitting && { opacity: 0.6 }]}
                  onPress={() => handleSubmit()}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <>
                      <AntDesign name="check" size={20} color="#fff" />
                      <Text style={styles.saveButtonText}>Save</Text>
                    </>
                  )}
                </TouchableOpacity>
              </>
            )}
          </Formik>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default EditNoteScreen;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#fff" },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  headerIcon: {
    paddingHorizontal: 12,
  },
  container: {
    padding: 16,
    paddingBottom: 40,
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
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    backgroundColor: "#fafafa",
    fontSize: 16,
  },
  multiline: {
    height: SCREEN_HEIGHT / 3,
    textAlignVertical: "top",
  },
  errorText: {
    color: "red",
    marginTop: 4,
  },
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#007aff",
    borderRadius: 8,
    paddingVertical: 12,
    marginTop: 8,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 8,
  },
});
