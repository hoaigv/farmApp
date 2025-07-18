// --- src/api/cells.ts ---
import axiosInstance from "./axiosInstance";

// Interface cho 1 ô (cell) của vườn
export interface GardenCell {
  id: string;
  rowIndex: number;
  colIndex: number;
  quantity: number;
  healthStatus: "NORMAL" | "DISEASED" | "DEAD"; // hoặc các trạng thái khác backend trả về
  plantInventoryId: string;
  icon: string;
}

// Kết quả trả về trong trường `result`
export interface GetGardenCellsResult {
  gardenId: string;
  rowLength: number;
  colLength: number;
  cells: GardenCell[];
}

// Response đầy đủ từ API
export interface GetGardenCellsResponse {
  message: string;
  result: GetGardenCellsResult;
  // Nếu backend có pagination, bạn có thể thêm:
  // totalPages?: number;
  // total?: number;
  // page?: number;
  // limit?: number;
}

/**
 * Lấy danh sách tất cả các ô (cells) của một vườn, có thể filter theo plantInventoryId và status.
 *
 * @param params
 *  - gardenId: string (bắt buộc)
 *  - plantInventoryId?: string (tùy chọn)
 *  - status?: string (tùy chọn, ví dụ "NORMAL"|"WARNING"|"ALERT")
 *
 * @returns Promise<GetGardenCellsResponse>
 */
export const fetchGardenCells = async (params: {
  gardenId: string;
  plantInventoryId?: string;
  status?: string;
}): Promise<GetGardenCellsResponse> => {
  const response = await axiosInstance.get<GetGardenCellsResponse>("/cells", {
    params,
  });
  return response.data;
};
// --- src/api/cells.ts ---

// Tạo interface cho 1 ô gửi lên (không chứa id, healthStatus, plantImageUrl)
export interface UpsertGardenCell {
  plantInventoryId: string;
  rowIndex: number;
  colIndex: number;
  quantity: number;
}

// Request body của POST /api/{gardenId}/cells
export interface UpsertGardenCellsRequest {
  cells: UpsertGardenCell[];
}

// Response từ backend chỉ có message
export interface UpsertGardenCellsResponse {
  message: string;
}

/**
 * Tạo mới / Cập nhật batch nhiều ô trong 1 garden
 *
 * @param gardenId  ID của garden (đường dẫn)
 * @param cells     Mảng các cell cần upsert
 * @returns         Promise<{ message: string }>
 */
export const upsertGardenCells = async (
  gardenId: string,
  cells: UpsertGardenCell[]
): Promise<UpsertGardenCellsResponse> => {
  const response = await axiosInstance.post<UpsertGardenCellsResponse>(
    `/${gardenId}/cells`,
    { cells }
  );
  return response.data;
};

// --- src/api/cells.ts ---

// Request body của DELETE /api/cells
export interface DeleteGardenCellsRequest {
  ids: string[];
}

// Response từ backend chỉ có message
export interface DeleteGardenCellsResponse {
  message: string;
}

/**
 * Xóa batch nhiều ô (cells) theo id
 *
 * @param ids  Mảng các cell-id cần xóa
 * @returns    Promise<{ message: string }>
 */
export const deleteGardenCells = async (
  ids: string[]
): Promise<DeleteGardenCellsResponse> => {
  const response = await axiosInstance.delete<DeleteGardenCellsResponse>(
    `/cells`,
    { data: { ids } }
  );
  return response.data;
};
// src/types/garden.ts

/**
 * 1 item cần update
 */
export interface UpdateGardenCellRequest {
  id: string;
  rowIndex: number;
  colIndex: number;
  healthStatus: "DISEASED" | "DEAD" | "NORMAL";
}

/**
 * Payload gửi lên backend
 */
export interface UpdateGardenCellsRequest {
  cells: UpdateGardenCellRequest[];
}

/**
 * Response chỉ có message
 */
export interface UpdateGardenCellsResponse {
  message: string;
}
/**
 * Cập nhật batch nhiều ô (cells) cùng lúc
 *
 * @param payload  Đối tượng chứa mảng các cell cần update
 * @returns Promise<{ message: string }>
 */
export const updateGardenCellsBatch = async (
  payload: UpdateGardenCellsRequest
): Promise<UpdateGardenCellsResponse> => {
  const response = await axiosInstance.put<UpdateGardenCellsResponse>(
    "/cells/batch",
    payload
  );
  return response.data;
};
