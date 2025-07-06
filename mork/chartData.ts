// chartData.ts
// Dữ liệu giả mô phỏng quá trình chăm sóc trong tháng 6/2025

export interface Reminder {
  id: string;
  title: string;
  actionType: string;
  scheduleType: string;
  timeOfDay: string;
  frequency: string;
  daysOfWeek?: string[];
  status: string;
  userId: string;
  gardenId: string;
}

export interface GardenLogResponse {
  id: string;
  description: string;
  actionType: string;
  timestamp: string;
  reminderId: string;
  gardenId: string;
  gardenCellId: string;
}

interface ChartData {
  reminders: Reminder[];
  gardenLogs: GardenLogResponse[];
}

const chartData: ChartData = {
  reminders: [
    {
      id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
      title: "Tưới nước",
      actionType: "WATERING",
      scheduleType: "RECURRING",
      timeOfDay: "08:00:00",
      frequency: "DAILY",
      status: "PENDING",
      userId: "user-uuid-1111-2222",
      gardenId: "12345678-1234-5678-1234-567812345678",
    },
    {
      id: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
      title: "Bón phân",
      actionType: "FERTILIZING",
      scheduleType: "RECURRING",
      timeOfDay: "09:00:00",
      frequency: "WEEKLY",
      daysOfWeek: ["MONDAY"],
      status: "PENDING",
      userId: "user-uuid-1111-2222",
      gardenId: "12345678-1234-5678-1234-567812345678",
    },
  ],
  gardenLogs: [
    {
      id: "d975142e-1f9b-4692-b1f1-cfa1e26bf115",
      description: "Auto-log from Reminder: WATERING",
      actionType: "WATERING",
      timestamp: "2025-06-01T08:30:00Z",
      reminderId: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
      gardenId: "12345678-1234-5678-1234-567812345678",
      gardenCellId: "87654321-4321-8765-4321-876543218765",
    },
    {
      id: "223b8c6d-5b09-4be8-8302-81bb70a485a2",
      description: "Auto-log from Reminder: WATERING",
      actionType: "WATERING",
      timestamp: "2025-06-02T08:30:00Z",
      reminderId: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
      gardenId: "12345678-1234-5678-1234-567812345678",
      gardenCellId: "87654321-4321-8765-4321-876543218765",
    },
    // ... tiếp tục cho đến hết tháng 6 tương tự như trước, thay "performedAt" thành "timestamp"
    {
      id: "d86f7f8c-9901-47c6-89fa-a2fbe32a7bdc",
      description: "Auto-log from Reminder: FERTILIZING",
      actionType: "FERTILIZING",
      timestamp: "2025-06-02T09:15:00Z",
      reminderId: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
      gardenId: "12345678-1234-5678-1234-567812345678",
      gardenCellId: "87654321-4321-8765-4321-876543218765",
    },
    {
      id: "4727d65c-16b2-4ad6-b6cd-153f0a0ba5fb",
      description: "Auto-log from Reminder: FERTILIZING",
      actionType: "FERTILIZING",
      timestamp: "2025-06-09T09:15:00Z",
      reminderId: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
      gardenId: "12345678-1234-5678-1234-567812345678",
      gardenCellId: "87654321-4321-8765-4321-876543218765",
    },
    {
      id: "bdd4e4a5-8d92-4667-a952-f4e094881666",
      description: "Auto-log from Reminder: SKIP",
      actionType: "SKIP",
      timestamp: "2025-06-16T09:15:00Z",
      reminderId: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
      gardenId: "12345678-1234-5678-1234-567812345678",
      gardenCellId: "87654321-4321-8765-4321-876543218765",
    },
    {
      id: "b846c7f0-6032-420e-9a01-697205adc382",
      description: "Auto-log from Reminder: FERTILIZING",
      actionType: "FERTILIZING",
      timestamp: "2025-06-23T09:15:00Z",
      reminderId: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
      gardenId: "12345678-1234-5678-1234-567812345678",
      gardenCellId: "87654321-4321-8765-4321-876543218765",
    },
    {
      id: "3a1c9574-56fa-4d1c-9228-0ff3e4dd6fe3",
      description: "Auto-log from Reminder: FERTILIZING",
      actionType: "FERTILIZING",
      timestamp: "2025-06-30T09:15:00Z",
      reminderId: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
      gardenId: "12345678-1234-5678-1234-567812345678",
      gardenCellId: "87654321-4321-8765-4321-876543218765",
    },
  ],
};

export default chartData;
