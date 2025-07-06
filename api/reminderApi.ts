import axiosInstance from "./axiosInstance";

/** ----- Enums & Types ----- **/
export type ActionType =
  | "WATERING"
  | "PRUNING"
  | "FERTILIZING"
  | "PEST_CHECK"
  | "HARVESTING"
  | "SEEDING"
  | "TRANSPLANTING"
  | "SOIL_CHECK"
  | "WEEDING"
  | "OTHER";

export type ScheduleType = "FIXED" | "RECURRING";
export type FrequencyType = "ONE_TIME" | "DAILY" | "WEEKLY" | "MONTHLY";
export type WeekDay =
  | "MONDAY"
  | "TUESDAY"
  | "WEDNESDAY"
  | "THURSDAY"
  | "FRIDAY"
  | "SATURDAY"
  | "SUNDAY";
export type ReminderStatus = "PENDING" | "DONE" | "SKIPPED";

/** ----- Request & Response DTOs ----- **/
export interface CreateReminderRequest {
  title: string;
  actionType: ActionType;
  scheduleType: ScheduleType;
  // only for FIXED
  fixedDateTime?: string; // ISO 8601
  // only for RECURRING
  frequency?: FrequencyType;
  timeOfDay?: string; // ISO 8601 time
  daysOfWeek?: WeekDay[];
  dayOfMonth?: number;
  status: ReminderStatus;
  gardenId: string;
}

export interface UpdateReminderRequest extends Partial<CreateReminderRequest> {
  reminderId: string;
}

export interface ReminderResponse {
  id: string;
  title: string;
  actionType: ActionType;
  scheduleType: ScheduleType;
  fixedDateTime?: string;
  frequency?: FrequencyType;
  timeOfDay?: string;
  daysOfWeek?: WeekDay[];
  dayOfMonth?: number;
  status: ReminderStatus;
  gardenId: string;
  gardenName: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

interface ApiResponse<T> {
  message?: string;
  result: T;
}

/** ----- API Calls ----- **/

/**
 * Get list of reminders, optionally filter by gardenId
 * GET /api/reminders?gardenId=...
 */
export const getReminders = async (
  gardenId?: string
): Promise<ApiResponse<ReminderResponse[]>> => {
  const response = await axiosInstance.get<ApiResponse<ReminderResponse[]>>(
    "/reminders",
    { params: { gardenId } }
  );
  return response.data;
};

/**
 * Create a new reminder
 * POST /api/reminders
 */
export const createReminder = async (
  payload: CreateReminderRequest
): Promise<ApiResponse<ReminderResponse>> => {
  const response = await axiosInstance.post<ApiResponse<ReminderResponse>>(
    "/reminders",
    payload
  );
  return response.data;
};

/**
 * Update existing reminder by ID
 * PUT /api/reminders/{id}
 */
export const updateReminder = async ({
  reminderId,
  ...rest
}: UpdateReminderRequest): Promise<ApiResponse<ReminderResponse>> => {
  console.log("Updating reminder with ID:", reminderId, "and data:", rest);
  const response = await axiosInstance.put<ApiResponse<ReminderResponse>>(
    `/reminders/${reminderId}`,
    rest
  );
  return response.data;
};

/**
 * Soft-delete a reminder by ID
 * DELETE /api/reminders/{id}
 */
export const deleteReminder = async (
  id: string
): Promise<ApiResponse<void>> => {
  const response = await axiosInstance.delete<ApiResponse<void>>(
    `/reminders/${id}`
  );
  return response.data;
};
/**
 * Get reminder by ID
 * GET /api/reminders/{reminderId}
 */
export const getReminderById = async (
  id: string
): Promise<ApiResponse<ReminderResponse>> => {
  const response = await axiosInstance.get<ApiResponse<ReminderResponse>>(
    `/reminders/${id}`
  );
  return response.data;
};
