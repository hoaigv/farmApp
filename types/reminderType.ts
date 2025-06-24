// src/types/reminderType.ts

import { ComponentProps } from "react";
import { Ionicons } from "@expo/vector-icons";

// --- Types ---
export type Frequency = "ONE_TIME" | "DAILY" | "WEEKLY" | "MONTHLY";
export type ReminderStatus = "PENDING" | "DONE" | "SKIPPED";
export type IconName = ComponentProps<typeof Ionicons>["name"];
export type TimeOfDayKey = "MORNING" | "NOON" | "EVENING";

// --- Constants ---
export const timeOfDayOptions: {
  key: TimeOfDayKey;
  label: string;
  hour: number;
  minute: number;
}[] = [
  { key: "MORNING", label: "Morning (06:00)", hour: 6, minute: 0 },
  { key: "NOON", label: "Noon (10:00)", hour: 10, minute: 0 },
  { key: "EVENING", label: "Evening (18:00)", hour: 18, minute: 0 },
];

export const activities: { key: string; label: string; icon: IconName }[] = [
  { key: "WATERING", label: "Watering", icon: "water" },
  { key: "FERTILIZING", label: "Fertilizing", icon: "leaf" },
  { key: "PRUNING", label: "Pruning", icon: "cut" },
  { key: "PEST_CHECK", label: "Pest Check", icon: "bug" },
  { key: "HARVESTING", label: "Harvesting", icon: "leaf" },
  { key: "SEEDING", label: "Seeding", icon: "flower" },
  { key: "TRANSPLANTING", label: "Transplanting", icon: "swap-horizontal" },
  { key: "SOIL_CHECK", label: "Soil Check", icon: "analytics" },
  { key: "WEEDING", label: "Weeding", icon: "leaf" },
  { key: "OTHER", label: "Other", icon: "ellipse" },
];

export const freqs: { key: Frequency; label: string }[] = [
  { key: "ONE_TIME", label: "One-time" },
  { key: "DAILY", label: "Daily" },
  { key: "WEEKLY", label: "Weekly" },
  { key: "MONTHLY", label: "Monthly" },
];

export const statuses: { key: ReminderStatus; label: string }[] = [
  { key: "PENDING", label: "Pending" },
  { key: "DONE", label: "Done" },
  { key: "SKIPPED", label: "Skipped" },
];

// --- Usage ---
// Import anywhere:
// import { Frequency, activities, timeOfDayOptions } from "@/types/reminderType";
