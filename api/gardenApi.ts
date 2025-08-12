// src/api/gardenApi.ts
import axiosInstance from "./axiosInstance";

export interface CreateGardenRequest {
  name: string;
  rowLength: number;
  colLength: number;
  soil: string;
}

// Response mẫu từ API (theo hình bạn gửi chỉ có message)
export interface CreateGardenResponse {
  message: string;
  result: {
    id: string;
    name: string;
    rowLength: number;
    colLength: number;
    soil: string;
    gardenCondition: "NORMAL" | "OTHER_CONDITIONS"; // Thêm các giá trị khác nếu có
    userId: string;
  };
}

/**
 * Tạo mới một vườn.
 *
 * @param data
 *  - name: tên vườn
 *  - rowLength: số hàng
 *  - colLength: số cột
 * @returns CreateGardenResponse
 */
export const createGarden = async (
  data: CreateGardenRequest
): Promise<CreateGardenResponse> => {
  const response = await axiosInstance.post<CreateGardenResponse>(
    "/gardens",
    data
  );
  return response.data;
};

// GET ALL GARDEN
/** Tham số query để lấy danh sách gardens */
export interface ListGardensParams {
  userId?: string; // lọc theo user
  name?: string; // lọc theo tên garden
  condition?: string; // NORMAL / WARNING / ALERT
  minRows?: number; // số hàng tối thiểu
  maxRows?: number; // số hàng tối đa
  minCols?: number; // số cột tối thiểu
  maxCols?: number; // số cột tối đa
  sortBy?: string; // default: createdAt
  sortDir?: "asc" | "desc"; // default: desc
}

/** Mô tả 1 garden trong danh sách */
export interface GardenSummary {
  id: string;
  name: string;
  rowLength: number;
  colLength: number;
  gardenCondition: string;
  soil: string;
  userId: string;
  cellCount: number;
  logCount: number;
  reminderCount: number;
  noteCount: number;
  activityCount: number;
}

/** Response của GET /api/gardens */
export interface ListGardensResponse {
  message: string;
  totalPages: number;
  result: GardenSummary[];
  total: number;
  page: number;
  limit: number;
}

// --- Hàm call API ---

/**
 * Lấy danh sách garden với phân trang và filter
 *
 * @param params Các tham số query (page, size, filters,...)
 * @returns Promise<ListGardensResponse>
 */
export const fetchGardens = async (): Promise<ListGardensResponse> => {
  const response = await axiosInstance.get<ListGardensResponse>("/gardens/me");

  return response.data;
};
// ----- Types cho DELETE /api/gardens -----
export interface DeleteGardensRequest {
  ids: string[];
}

export interface DeleteGardensResponse {
  message: string; // "Gardens deleted successfully"
}

// Hàm gọi API xóa nhiều garden
export const deleteGardens = async (
  data: DeleteGardensRequest
): Promise<DeleteGardensResponse> => {
  const response = await axiosInstance.delete<DeleteGardensResponse>(
    "/gardens",
    { data }
  );
  return response.data;
};

// ----- Types cho UPDATE /api/gardens -----

export interface UpdateGardenRequest {
  id: string;
  name?: string; // Tên mới, nếu không có thì giữ nguyên
  soil?: string; // Loại đất mới, nếu không có thì giữ nguyên
}
export interface UpdateGardenResponse {
  message: string; // "Garden updated successfully"
}
export const updateGarden = async (
  data: UpdateGardenRequest
): Promise<UpdateGardenResponse> => {
  try {
    const response = await axiosInstance.put<UpdateGardenResponse>(
      `/gardens`,
      data
    );
    return response.data;
  } catch (err) {
    // you can normalize the error or log it
    console.error("Failed to update garden:", err);
    // optionally throw a more friendly error
    throw new Error("Could not update garden. Please try again.");
  }
};
