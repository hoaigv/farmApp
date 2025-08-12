// src/api/gardenHealthApi.ts
import axiosInstance from "./axiosInstance";

/**
 * Kiểu trả về của 1 record GardenHealth từ backend
 */
export interface GardenHealthResponse {
  id: string;
  gardenId: string;
  normalCell: number;
  deadCell: number;
  diseaseCell: number;
  healthStatus: string;
  diseaseName?: string | null;
  createdAt: string; // ISO string, bạn có thể convert sang Date khi cần
}

/**
 * Generic API response wrapper (điều chỉnh nếu backend trả khác)
 * Ví dụ: { success: true, message: "OK", result: [...] }
 */
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  result: T;
}

/**
 * Lấy danh sách GardenHealth của một garden theo gardenId
 * GET /api/garden-health/{id}
 *
 * @param gardenId Id của garden
 * @returns ApiResponse<List<GardenHealthResponse>>
 */
export const getGardenHealthByGardenId = async (
  gardenId: string
): Promise<ApiResponse<GardenHealthResponse[]>> => {
  const { data } = await axiosInstance.get<ApiResponse<GardenHealthResponse[]>>(
    `/garden-health/${gardenId}`
  );
  return data;
};
