import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Feather, Fontisto } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Formik } from "formik";
import * as Yup from "yup";
import { useAppSelector } from "@/store/hooks";
import FloatingButton from "@/components/FloatingButton";
import { uploadFile } from "@/api/fileImageApi";
import { createPlantInventory } from "@/api/plantIventoryApi";

// Validation schema
const InventorySchema = Yup.object().shape({
  name: Yup.string().required("Required"),
  type: Yup.string().required("Required"),
  quantity: Yup.number().min(0).required("Required"),
  perCellMax: Yup.number().min(1).required("Required"),
  description: Yup.string(),
  imageUrl: Yup.string().url(),
});

const typeOptions = [
  { label: "Fruit", value: "fruit" },
  { label: "Flower", value: "flower" },
  { label: "Leafy", value: "leafy" },
];

const VarietyDetailScreen: React.FC = () => {
  const router = useRouter();
  const params = useLocalSearchParams<{
    mode?: "read" | "edit" | "create";
    inventory?: string;
  }>();
  const modeInit = params.mode || "create";

  const [mode, setMode] = useState<"read" | "edit" | "create">(
    modeInit as "read" | "edit" | "create"
  );

  // Parse inventory if exists
  const existing = params.inventory
    ? (JSON.parse(params.inventory as string) as any)
    : null;

  // initialValues based on mode and existing
  const initialValues = {
    name: existing?.name || "",
    type: existing?.plantType || "",
    quantity: existing?.inventoryQuantity ?? 0,
    perCellMax: existing?.perCellMax ?? 1,
    description: existing?.description || "",
    imageUrl: existing?.imageUrl || "",
  };

  const userId = useAppSelector((state) => state.auth.user?.id);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Request permission for image picker
  useEffect(() => {
    (async () => {
      if (Platform.OS !== "web") {
        const { status } =
          await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
          alert("Permission to access gallery is required!");
        }
      }
    })();
  }, []);

  const pickAndUploadImage = async (
    setFieldValue: (field: string, value: any) => void
  ) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });

    if (!result.canceled && result.assets.length > 0) {
      const asset = result.assets[0];
      const file = {
        uri: asset.uri,
        name: "photo.jpg",
        type: "image/jpeg",
      };

      try {
        setUploadingImage(true);
        const res = await uploadFile(file);
        setFieldValue("imageUrl", res.result);
      } catch (err) {
        console.error(err);
        alert("Upload image failed");
      } finally {
        setUploadingImage(false);
      }
    }
  };

  const handleSave = async (
    values: typeof initialValues,
    resetForm: () => void
  ) => {
    if (!userId) {
      alert("You must be logged in to perform this action.");
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        userId,
        name: values.name,
        plantType: values.type.toUpperCase(),
        inventoryQuantity: values.quantity,
        perCellMax: values.perCellMax,
        description: values.description || undefined,
        imageUrl: values.imageUrl || undefined,
      };

      // if (mode === "edit" && existing) {
      //   await updatePlantInventory(existing.id, payload);
      //   alert("Updated successfully!");
      // } else
      if (mode === "create") {
        await createPlantInventory(payload);
        alert("Created successfully!");
        resetForm();
      }
      router.back();
    } catch (err) {
      console.error(err);
      alert((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Formik
        initialValues={initialValues}
        validationSchema={InventorySchema}
        onSubmit={(values, { resetForm }) => handleSave(values, resetForm)}
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
          <>
            <View style={styles.header}>
              <TouchableOpacity onPress={() => router.back()}>
                <Feather name="arrow-left" size={24} color="#333" />
              </TouchableOpacity>
              <Text style={styles.title}>
                {mode === "create"
                  ? "New Variety"
                  : mode === "read"
                  ? "View Variety"
                  : "Edit Variety"}
              </Text>
              <TouchableOpacity onPress={() => setMode("edit")}>
                <Feather name="edit" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            <KeyboardAvoidingView
              style={styles.contentWrapper}
              behavior={Platform.OS === "ios" ? "padding" : "height"}
            >
              <ScrollView contentContainerStyle={styles.content}>
                <TouchableOpacity
                  style={styles.imageContainer}
                  onPress={() =>
                    mode !== "read" && pickAndUploadImage(setFieldValue)
                  }
                >
                  {uploadingImage ? (
                    <ActivityIndicator size="large" />
                  ) : values.imageUrl ? (
                    <Image
                      source={{ uri: values.imageUrl }}
                      style={styles.image}
                    />
                  ) : (
                    <View style={styles.imagePlaceholder}>
                      <Feather name="image" size={48} color="#aaa" />
                      <Text style={styles.imageText}>Select Image</Text>
                    </View>
                  )}
                </TouchableOpacity>

                {/* Name */}
                <Text style={styles.label}>Name</Text>
                <TextInput
                  style={[styles.input, mode === "read" && styles.readonly]}
                  editable={mode !== "read"}
                  onChangeText={handleChange("name")}
                  onBlur={handleBlur("name")}
                  value={values.name}
                  placeholder="Enter variety name"
                />
                {touched.name && errors.name && (
                  <Text style={styles.error}>{String(errors.name)}</Text>
                )}

                {/* Type */}
                <Text style={styles.label}>Type</Text>
                {mode !== "read" ? (
                  <View style={styles.radioGroup}>
                    {typeOptions.map((opt) => (
                      <TouchableOpacity
                        key={opt.value}
                        style={styles.radioOption}
                        onPress={() => setFieldValue("type", opt.value)}
                      >
                        <Fontisto
                          name={
                            values.type === opt.value
                              ? "radio-btn-active"
                              : "radio-btn-passive"
                          }
                          size={20}
                          color="#333"
                        />
                        <Text style={styles.radioLabel}>{opt.label}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                ) : (
                  <Text className="py-2">{values.type}</Text>
                )}
                {touched.type && errors.type && (
                  <Text style={styles.error}>{String(errors.type)}</Text>
                )}

                {/* Quantity */}
                <Text style={styles.label}>Quantity</Text>
                <TextInput
                  style={[styles.input, mode === "read" && styles.readonly]}
                  editable={mode !== "read"}
                  keyboardType="numeric"
                  onChangeText={(t) => setFieldValue("quantity", Number(t))}
                  onBlur={handleBlur("quantity")}
                  value={String(values.quantity)}
                />
                {touched.quantity && errors.quantity && (
                  <Text style={styles.error}>{String(errors.quantity)}</Text>
                )}

                {/* Per Cell Max */}
                <Text style={styles.label}>Per Cell Max</Text>
                <TextInput
                  style={[styles.input, mode === "read" && styles.readonly]}
                  editable={mode !== "read"}
                  keyboardType="numeric"
                  onChangeText={(t) => setFieldValue("perCellMax", Number(t))}
                  onBlur={handleBlur("perCellMax")}
                  value={String(values.perCellMax)}
                />
                {touched.perCellMax && errors.perCellMax && (
                  <Text style={styles.error}>{String(errors.perCellMax)}</Text>
                )}

                {/* Description */}
                <Text style={styles.label}>Description</Text>
                <TextInput
                  style={[styles.textArea, mode === "read" && styles.readonly]}
                  multiline
                  numberOfLines={4}
                  editable={mode !== "read"}
                  onChangeText={handleChange("description")}
                  onBlur={handleBlur("description")}
                  value={values.description}
                />

                {(mode === "create" || mode === "edit") && (
                  <TouchableOpacity
                    onPress={() => handleSubmit()}
                    disabled={submitting}
                  >
                    {submitting ? (
                      <ActivityIndicator size="small" color="#333" />
                    ) : (
                      <View className="flex-row items-center justify-around mt-3 gap-10">
                        {mode === "edit" && (
                          <TouchableOpacity
                            className="bg-gray-200 px-4 py-2 rounded"
                            onPress={() => setMode("read")}
                          >
                            <Text>Cancel</Text>
                          </TouchableOpacity>
                        )}
                        <TouchableOpacity className="bg-blue-500 px-4 py-2 rounded">
                          <Text style={{ color: "white", fontSize: 16 }}>
                            Save
                          </Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </TouchableOpacity>
                )}
              </ScrollView>
            </KeyboardAvoidingView>
          </>
        )}
      </Formik>
    </SafeAreaView>
  );
};

export default VarietyDetailScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 8,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  title: { fontSize: 18, fontWeight: "600", color: "#333" },
  contentWrapper: { flex: 1 },
  content: { padding: 16 },
  imageContainer: {
    alignSelf: "center",
    marginBottom: 24,
    width: 150,
    height: 150,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#f5f5f5",
    alignItems: "center",
    justifyContent: "center",
  },
  image: { width: "100%", height: "100%" },
  imagePlaceholder: { alignItems: "center" },
  imageText: { marginTop: 8, fontSize: 14, color: "#aaa" },
  label: { fontSize: 14, marginBottom: 6, color: "#555" },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 4,
    padding: 10,
    marginBottom: 8,
  },
  textArea: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 4,
    padding: 10,
    marginBottom: 16,
    minHeight: 80,
  },
  radioGroup: { flexDirection: "row", marginBottom: 16 },
  radioOption: { flexDirection: "row", alignItems: "center", marginRight: 20 },
  radioLabel: { marginLeft: 6, fontSize: 14, color: "#555" },
  error: { color: "red", fontSize: 12, marginBottom: 8 },
  readonly: { backgroundColor: "#f0f0f0" },
});
