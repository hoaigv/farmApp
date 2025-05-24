export interface Reminder {
  id: string;
  plantId?: string; // ID của cây trồng liên quan
  jobType: "watering" | "fertilizing";
  frequencyType: "daily" | "custom";
  customFrequency?: number;
  startDate: Date;
  endDate?: Date;
  remindTime: Date;
  notificationBefore: string;
  completedDates: Date[]; // Ngày đã hoàn thành
  snoozedUntil?: Date; // Tạm hoãn đến lúc nào
  isDisabled?: boolean; // Nếu muốn tắt reminder tạm thời
}

export const initialReminders: Reminder[] = [
  {
    id: "1",
    plantId: "plant001",
    jobType: "watering",
    frequencyType: "daily",
    startDate: new Date("2025-05-20"),
    endDate: new Date("2025-06-01"),
    remindTime: new Date("2025-05-23T07:00:00"),
    notificationBefore: "15 phút trước",
    completedDates: [
      new Date("2025-05-20"),
      new Date("2025-05-21"),
      new Date("2025-05-23"),
    ],
    snoozedUntil: new Date("2025-05-23T09:00:00"),
  },
  {
    id: "2",
    plantId: "plant002",
    jobType: "fertilizing",
    frequencyType: "custom",
    customFrequency: 3,
    startDate: new Date("2025-05-15"),
    endDate: new Date("2025-06-15"),
    remindTime: new Date("2025-05-23T08:30:00"),
    notificationBefore: "30 phút trước",
    completedDates: [
      new Date("2025-05-15"),
      new Date("2025-05-18"),
      new Date("2025-05-21"),
    ],
    isDisabled: false,
  },
];
