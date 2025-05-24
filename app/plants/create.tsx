import {
  Entypo,
  FontAwesome6,
  Ionicons,
  MaterialIcons,
} from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";
import { Formik } from "formik";
import React, { useState } from "react";
import {
  Alert,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { launchCamera, launchImageLibrary } from "react-native-image-picker";
import * as Yup from "yup";
import useCustomFonts from "../../hook/FontLoader";

const validationSchema = Yup.object().shape({
  plantName: Yup.string()
    .required("Plant name is required")
    .min(2, "Plant name must be at least 2 characters"),
  plantedDate: Yup.string().required("Planted date is required"),
  plantImage: Yup.string().required("Plant image is required"),
});
const CreatePlantScreen = () => {
  const [fontsLoaded] = useCustomFonts();
  const router = useRouter();
  const [selectedLocation, setSelectedLocation] = useState("Pot");
  const [showDatePicker, setShowDatePicker] = useState(false);
  {
    /* Open library Image */
  }
  const pickImage = async (setFieldValue: Function) => {
    const result = await launchImageLibrary({
      mediaType: "photo",
      quality: 0.7,
    });

    if (result.didCancel) return;

    if (result.assets && result.assets.length > 0) {
      setFieldValue("image", result.assets[0].uri);
    }
  };

  {
    /* Open Camera Image */
  }
  const takePhoto = async (setFieldValue: Function) => {
    const result = await launchCamera({
      mediaType: "photo",
      quality: 0.7,
    });

    if (result.didCancel) return;

    if (result.assets && result.assets.length > 0) {
      setFieldValue("image", result.assets[0].uri);
    }
  };
  if (!fontsLoaded) return null;

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-center px-2  pb-2 bg-white">
        <Ionicons
          name="arrow-back-outline"
          size={26}
          color="black"
          onPress={() => router.back()}
          className="absolute left-0 px-2"
        />
        <Text
          style={{
            fontSize: 22,
            fontFamily: "PoetsenOne-Regular",
          }}
        >
          New Plant
        </Text>
      </View>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={5}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            contentContainerStyle={{ padding: 4 }}
            keyboardShouldPersistTaps="handled"
          >
            <Formik
              initialValues={{
                name: "",
                location: "Pot",
                plantedDate: new Date().toISOString().split("T")[0],
                image: "",
              }}
              validationSchema={validationSchema}
              onSubmit={(values) => {
                Alert.alert("Thành công", JSON.stringify(values, null, 2));
              }}
            >
              {({
                handleChange,
                handleBlur,
                handleSubmit,
                values,
                setFieldValue,
                errors,
                touched,
              }) => (
                <View style={{ flex: 1, backgroundColor: "white", margin: 16 }}>
                  {/* Tên cây */}
                  <View style={{ marginBottom: 20 }}>
                    <Text style={styles.label}>Plant Name :</Text>
                    <View
                      style={{
                        borderBottomWidth: 1,
                        borderBottomColor: "#ccc",
                      }}
                    >
                      <TextInput
                        placeholder="Enter plant name"
                        style={{
                          padding: 8,
                          fontSize: 18,
                        }}
                        onChangeText={handleChange("name")}
                        onBlur={handleBlur("name")}
                        value={values.name}
                      />
                    </View>
                    {touched.name && errors.name && (
                      <Text style={{ color: "red", marginTop: 4 }}>
                        {errors.name}
                      </Text>
                    )}
                  </View>

                  {/* Vị trí trồng */}
                  <View style={{ marginBottom: 20 }}>
                    <Text style={styles.label}>Location :</Text>
                    <View style={{ flexDirection: "row", marginTop: 8 }}>
                      {["Pot", "Garden"].map((loc) => (
                        <TouchableOpacity
                          key={loc}
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            marginRight: 20,
                          }}
                          onPress={() => {
                            setSelectedLocation(loc);
                            setFieldValue("location", loc);
                          }}
                        >
                          <View
                            style={{
                              width: 20,
                              height: 20,
                              borderRadius: 10,
                              borderWidth: 1,
                              borderColor: "#555",
                              backgroundColor:
                                selectedLocation === loc ? "green" : "white",
                              marginRight: 6,
                            }}
                          />
                          <Text style={{}}>{loc}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  {/* Ngày trồng */}
                  <View style={{ marginBottom: 20 }}>
                    <Text style={styles.label}>Planted Date :</Text>
                    <TouchableOpacity
                      style={{
                        borderBottomWidth: 1,
                        borderBottomColor: "#ccc",
                        paddingVertical: 8,
                      }}
                      onPress={() => setShowDatePicker(true)}
                    >
                      <Text
                        style={{
                          fontSize: 18,
                          color: "#555",
                        }}
                      >
                        {values.plantedDate}
                      </Text>
                    </TouchableOpacity>
                    {touched.plantedDate && errors.plantedDate && (
                      <Text style={{ color: "red", marginTop: 4 }}>
                        {errors.plantedDate}
                      </Text>
                    )}
                  </View>

                  {showDatePicker && (
                    <DateTimePicker
                      value={new Date(values.plantedDate)}
                      mode="date"
                      display={Platform.OS === "ios" ? "spinner" : "default"}
                      onChange={(event, selectedDate) => {
                        setShowDatePicker(false);
                        if (selectedDate) {
                          const isoDate = selectedDate
                            .toISOString()
                            .split("T")[0];
                          setFieldValue("plantedDate", isoDate);
                        }
                      }}
                    />
                  )}

                  {/* Chọn ảnh */}
                  <View style={{ marginBottom: 20 }}>
                    <Text style={styles.label}>Plant Image :</Text>

                    {/* Preview ảnh nếu có */}
                    {values.image ? (
                      <Image
                        source={{ uri: values.image }}
                        style={{
                          width: 120,
                          height: 120,
                          borderRadius: 8,
                          marginTop: 8,
                        }}
                      />
                    ) : (
                      <View className="items-center mx-8 my-4 py-20 rounded-md bg-slate-200">
                        <FontAwesome6 name="image" size={60} color="#ccc" />
                        <Text
                          style={{
                            fontSize: 14,
                            color: "#555",
                            textAlign: "center",
                            marginTop: 4,
                          }}
                        >
                          No image selected
                        </Text>
                      </View>
                    )}

                    {touched.image && errors.image && (
                      <Text style={{ color: "red", marginTop: 4 }}>
                        {errors.image}
                      </Text>
                    )}

                    {/* Nút chọn ảnh */}
                    <View style={{ flexDirection: "row", marginTop: 12 }}>
                      <TouchableOpacity
                        style={[
                          styles.button,
                          {
                            backgroundColor: "#4caf50",
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 5,
                          },
                        ]}
                        onPress={() => pickImage(setFieldValue)}
                      >
                        <MaterialIcons
                          name="library-add"
                          size={24}
                          color="white"
                        />
                        <Text style={styles.buttonText}>
                          Choose from Library
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[
                          styles.button,
                          {
                            backgroundColor: "#2196f3",
                            marginLeft: 12,
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 5,
                          },
                        ]}
                        onPress={() => takePhoto(setFieldValue)}
                      >
                        <Entypo name="camera" size={20} color="white" />
                        <Text style={styles.buttonText}>Take Photo</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Submit */}
                  <TouchableOpacity className="bg-primary p-4 rounded-md mt-4 items-center">
                    <Text
                      style={{
                        color: "white",
                        fontSize: 18,
                        fontWeight: "bold",
                      }}
                    >
                      Submit
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </Formik>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default CreatePlantScreen;

const styles = StyleSheet.create({
  label: { fontSize: 18, fontWeight: "bold" },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
  },
  buttonText: {
    color: "white",
    fontSize: 14,
  },
});
