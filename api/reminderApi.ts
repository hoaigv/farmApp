// src/api/reminderApi.ts
import axiosInstance from "./axiosInstance";

/** ----- Types ----- **/

export type Frequency = "ONE_TIME" | "DAILY" | "WEEKLY" | "MONTHLY";
export type ReminderStatus = "PENDING" | "DONE" | "SKIPPED";

export interface CreateReminderRequest {
  task: string;
  gardenActivity: string;
  specificTime?: string; // ISO 8601 string
  frequency: Frequency;
  status: ReminderStatus;
  gardenId: string;
}

export interface UpdateReminderRequest extends CreateReminderRequest {
  id: string;
}

export interface ReminderResponse {
  id: string;
  task: string;
  gardenActivity: string;
  specificTime?: string;
  frequency: Frequency;
  status: ReminderStatus;
  gardenId: string;
  createdAt: string;
  updatedAt: string;
}

interface ApiSingleResponse<T> {
  message: string;
  result: T;
}

/**
 * Fetch all reminders for the current user.
 * Backend trả về: { message: string, result: ReminderResponse[] }
 */
export const getMyReminders = async (
  gardenId: string
): Promise<ApiSingleResponse<ReminderResponse[]>> => {
  const response = await axiosInstance.get<
    ApiSingleResponse<ReminderResponse[]>
  >(`/reminders/${gardenId}/me`);
  return response.data;
};
/**
 * Fetch  reminders by ID.
 * Backend trả về: { message: string, result: ReminderResponse }
 */
export const getReminderById = async (
  id: string
): Promise<ApiSingleResponse<ReminderResponse>> => {
  const response = await axiosInstance.get<ApiSingleResponse<ReminderResponse>>(
    `/reminders/${id}`
  );
  return response.data;
};
/**
 * Create a new reminder.
 */
export const createReminder = async (
  data: CreateReminderRequest
): Promise<ApiSingleResponse<ReminderResponse>> => {
  const response = await axiosInstance.post<
    ApiSingleResponse<ReminderResponse>
  >("/reminders", data);
  return response.data;
};
/**
 * Fetch all reminders for the current user.
 * Backend trả về: { message: string, result: ReminderResponse[] }
 */
export const getMyRemindersAll = async (): Promise<
  ApiSingleResponse<ReminderResponse[]>
> => {
  const response = await axiosInstance.get<
    ApiSingleResponse<ReminderResponse[]>
  >("/reminders/me");
  return response.data;
};
/**
 * Update an existing reminder.
 */
export const updateReminder = async (
  data: UpdateReminderRequest
): Promise<{ message: string }> => {
  const response = await axiosInstance.put<{ message: string }>(
    "/reminders",
    data
  );
  return response.data;
};

/**
 * Delete one or more reminders by IDs.
 */
export const deleteReminders = async (
  ids: string[]
): Promise<{ message: string }> => {
  const response = await axiosInstance.delete<{ message: string }>(
    "/reminders",
    { data: ids }
  );
  return response.data;
};
