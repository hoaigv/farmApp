import { StyleSheet, Text, View } from "react-native";
import React from "react";

const ReminderScreen = () => {
  return (
    <View>
      <Text>ReminderScreen</Text>
    </View>
  );
};

export default ReminderScreen;

const styles = StyleSheet.create({});

// import DateTimePicker from "@react-native-community/datetimepicker";
// import React, { useState } from "react";
// import {
//   Button,
//   Image,
//   SafeAreaView,
//   StyleSheet,
//   Switch,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   View,
// } from "react-native";
// import Header from "../../../../../components/Header";
// const ReminderFormScreen = () => {
//   const [jobType, setJobType] = useState("watering"); // "watering" | "fertilizing"
//   const [frequencyType, setFrequencyType] = useState("daily"); // "daily" | "custom"
//   const [customFrequency, setCustomFrequency] = useState("3");
//   const [startDate, setStartDate] = useState(new Date());
//   const [showStartDatePicker, setShowStartDatePicker] = useState(false);
//   const [remindTime, setRemindTime] = useState(new Date());
//   const [showTimePicker, setShowTimePicker] = useState(false);
//   const [hasEndDate, setHasEndDate] = useState(true);
//   const [endDate, setEndDate] = useState(new Date());
//   const [showEndDatePicker, setShowEndDatePicker] = useState(false);
//   const [notificationBefore, setNotificationBefore] = useState("15 minutes");
//   return (
//     <SafeAreaView className="flex-1 bg-white">
//       <Header title="Reminder" showBack={true} />
//       <View className="p-4 bg-white flex-1">
//         {/* Job Type */}
//         <Text style={styles.label}>Job Type :</Text>
//         <View className="flex-row mb-4 space-x-4 gap-5 p-2">
//           <TouchableOpacity
//             onPress={() => setJobType("watering")}
//             className="flex-row items-center gap-2"
//           >
//             <Image
//               source={require("../../../../../assets/images/drop.png")}
//               resizeMode="cover"
//               className="h-5 w-5"
//             />
//             <Text className={jobType === "watering" ? "font-bold" : ""}>
//               Watering
//             </Text>
//           </TouchableOpacity>
//           <TouchableOpacity
//             onPress={() => setJobType("fertilizing")}
//             className="flex-row items-center gap-2"
//           >
//             <Image
//               source={require("../../../../../assets/images/fertilizer.png")}
//               resizeMode="cover"
//               className="h-5 w-5"
//             />
//             <Text className={jobType === "fertilizing" ? "font-bold" : ""}>
//               Fertilizing
//             </Text>
//           </TouchableOpacity>
//         </View>

//         {/* Frequency */}
//         <Text style={styles.label}>Frequency :</Text>
//         <View className="flex-row items-center mb-2 space-x-4 gap-5 p-2">
//           <TouchableOpacity onPress={() => setFrequencyType("daily")}>
//             <Text className={frequencyType === "daily" ? "font-bold" : ""}>
//               Daily
//             </Text>
//           </TouchableOpacity>
//           <TouchableOpacity onPress={() => setFrequencyType("custom")}>
//             <Text className={frequencyType === "custom" ? "font-bold" : ""}>
//               Custom
//             </Text>
//           </TouchableOpacity>
//         </View>

//         {frequencyType === "custom" && (
//           <View className="flex-row items-center mb-4 space-x-2">
//             <Text>Custom:</Text>
//             <TextInput
//               keyboardType="numeric"
//               className="border px-2 py-1 rounded w-12"
//               value={customFrequency}
//               onChangeText={setCustomFrequency}
//             />
//             <Text>days</Text>
//           </View>
//         )}

//         {/* Start Date */}
//         <Text style={styles.label}>Start Date : </Text>
//         <TouchableOpacity
//           className="border p-2 rounded mb-4"
//           onPress={() => setShowStartDatePicker(true)}
//         >
//           <Text>{startDate.toLocaleDateString()}</Text>
//         </TouchableOpacity>
//         {showStartDatePicker && (
//           <DateTimePicker
//             value={startDate}
//             mode="date"
//             display="default"
//             onChange={(_, date) => {
//               setShowStartDatePicker(false);
//               if (date) setStartDate(date);
//             }}
//           />
//         )}

//         {/* Reminder Time */}
//         <Text style={styles.label}>Reminder Time :</Text>
//         <TouchableOpacity
//           className="border p-2 rounded mb-4"
//           onPress={() => setShowTimePicker(true)}
//         >
//           <Text>
//             {remindTime.toLocaleTimeString([], {
//               hour: "2-digit",
//               minute: "2-digit",
//             })}
//           </Text>
//         </TouchableOpacity>
//         {showTimePicker && (
//           <DateTimePicker
//             value={remindTime}
//             mode="time"
//             display="default"
//             onChange={(_, date) => {
//               setShowTimePicker(false);
//               if (date) setRemindTime(date);
//             }}
//           />
//         )}

//         {/* End Date */}
//         <View className="flex-row items-center mb-4 space-x-2">
//           <Switch value={hasEndDate} onValueChange={setHasEndDate} />
//           <Text>End Date</Text>
//         </View>
//         {hasEndDate && (
//           <TouchableOpacity
//             className="border p-2 rounded mb-4"
//             onPress={() => setShowEndDatePicker(true)}
//           >
//             <Text>{endDate.toLocaleDateString()}</Text>
//           </TouchableOpacity>
//         )}
//         {showEndDatePicker && (
//           <DateTimePicker
//             value={endDate}
//             mode="date"
//             display="default"
//             onChange={(_, date) => {
//               setShowEndDatePicker(false);
//               if (date) setEndDate(date);
//             }}
//           />
//         )}

//         {/* Notification Before */}
//         <Text style={styles.label}>Notification Before :</Text>
//         <TouchableOpacity className="border p-2 rounded mb-4">
//           <Text>{notificationBefore}</Text>
//         </TouchableOpacity>

//         {/* Footer Buttons */}
//         <View className="flex-row justify-between">
//           <Button
//             title="Cancel"
//             onPress={() => {
//               /* cancel logic */
//             }}
//           />
//           <Button
//             title="Save"
//             onPress={() => {
//               /* save logic */
//             }}
//           />
//         </View>
//       </View>
//     </SafeAreaView>
//   );
// };

// export default ReminderFormScreen;

// const styles = StyleSheet.create({
//   label: {
//     fontSize: 16,
//     fontWeight: "bold",
//     marginBottom: 8,
//   },
// });
