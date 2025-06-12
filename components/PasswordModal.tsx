import React, { useState } from "react";
import { View, TextInput, Text, TouchableOpacity } from "react-native";
import { Button, Modal, Portal } from "react-native-paper";
import { Formik } from "formik";
import * as Yup from "yup";
import Feather from "@expo/vector-icons/Feather";
type Props = {
  visible: boolean;
  onDismiss: () => void;
  onSubmit: (data: {
    oldPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) => void;
};

// Yup validation schema
const passwordSchema = Yup.object().shape({
  oldPassword: Yup.string(),
  newPassword: Yup.string()
    .required("Password must not be empty")
    .min(8, "Password must be at least 8 characters long")
    .matches(
      /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=]).*$/,
      "Password must contain at least one uppercase letter, one lowercase letter, one digit, and one special character"
    ),
  confirmPassword: Yup.string()
    .required("Please confirm your password")
    .oneOf([Yup.ref("newPassword")], "Passwords do not match"),
});

const ChangePasswordModal = ({ visible, onDismiss, onSubmit }: Props) => {
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={{
          backgroundColor: "white",
          padding: 20,
          margin: 20,
          borderRadius: 10,
        }}
      >
        <Formik
          initialValues={{
            oldPassword: "",
            newPassword: "",
            confirmPassword: "",
          }}
          validationSchema={passwordSchema}
          onSubmit={onSubmit}
        >
          {({
            handleChange,
            handleBlur,
            handleSubmit,
            values,
            errors,
            touched,
          }) => (
            <View>
              <Text className="text-lg font-bold mb-2">Change Password</Text>
              <Text className="text-sm text-gray-500 italic mb-4">
                If you haven’t set a password before, leave the old password
                field blank.
              </Text>
              <View className="flex gap-4">
                {/* Old Password */}
                <View className="relative">
                  <TextInput
                    placeholder="Old Password"
                    secureTextEntry={!showOld}
                    value={values.oldPassword}
                    onChangeText={handleChange("oldPassword")}
                    onBlur={handleBlur("oldPassword")}
                    className="border border-gray-300 rounded px-3 py-2 pr-10"
                  />
                  <TouchableOpacity
                    onPress={() => setShowOld(!showOld)}
                    className="absolute right-3 top-2"
                  >
                    {showOld ? (
                      <Feather name="eye-off" size={20} color="gray" />
                    ) : (
                      <Feather name="eye" size={20} color="gray" />
                    )}
                  </TouchableOpacity>
                  {touched.oldPassword && errors.oldPassword && (
                    <Text className="text-red-500 mt-1">
                      {errors.oldPassword}
                    </Text>
                  )}
                </View>

                {/* New Password */}
                <View className="relative">
                  <TextInput
                    placeholder="New Password"
                    secureTextEntry={!showNew}
                    value={values.newPassword}
                    onChangeText={handleChange("newPassword")}
                    onBlur={handleBlur("newPassword")}
                    className="border border-gray-300 rounded px-3 py-2 pr-10"
                  />
                  <TouchableOpacity
                    onPress={() => setShowNew(!showNew)}
                    className="absolute right-3 top-2"
                  >
                    {showNew ? (
                      <Feather name="eye-off" size={20} color="gray" />
                    ) : (
                      <Feather name="eye" size={20} color="gray" />
                    )}
                  </TouchableOpacity>
                  {touched.newPassword && errors.newPassword && (
                    <Text className="text-red-500 mt-1">
                      {errors.newPassword}
                    </Text>
                  )}
                </View>

                {/* Confirm Password */}
                <View className="relative">
                  <TextInput
                    placeholder="Confirm New Password"
                    secureTextEntry={!showConfirm}
                    value={values.confirmPassword}
                    onChangeText={handleChange("confirmPassword")}
                    onBlur={handleBlur("confirmPassword")}
                    className="border border-gray-300 rounded px-3 py-2 pr-10"
                  />
                  <TouchableOpacity
                    onPress={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-2"
                  >
                    {showConfirm ? (
                      <Feather name="eye-off" size={20} color="gray" />
                    ) : (
                      <Feather name="eye" size={20} color="gray" />
                    )}
                  </TouchableOpacity>
                  {touched.confirmPassword && errors.confirmPassword && (
                    <Text className="text-red-500 mt-1">
                      {errors.confirmPassword}
                    </Text>
                  )}
                </View>
              </View>
              <View className="flex-row justify-between mt-5">
                <Button onPress={onDismiss}>Cancel</Button>
                <Button mode="contained" onPress={handleSubmit as any}>
                  Confirm
                </Button>
              </View>
            </View>
          )}
        </Formik>
      </Modal>
    </Portal>
  );
};

export default ChangePasswordModal;
