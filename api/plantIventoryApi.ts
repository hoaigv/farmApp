import axiosInstance from "./axiosInstance";

/**
 * Request payload to create a new plant inventory entry.
 */
export interface PlantInventoryCreateRequest {
  /** ID of the plant variety to add into inventory. */
  varietyId: string;
  /** Number of plants of this variety to record. */
  numberOfVariety: number;
}

export interface PlantInventoryUpdateRequest {
  /** ID of the plant variety to add into inventory. */
  id: string;
  /** Number of plants of this variety to record. */
  numberOfVariety: number;
}
/**
 * Generic API response containing a message.
 */
export interface ApiResponse {
  message: string;
}

/**
 * Details of a plant variety from backend.
 */
export interface PlantVariety {
  id: string;
  name: string;
  iconLink: string;
  plantType: string;
}

/**
 * Single inventory entry returned from `/me` endpoint.
 */
export interface PlantInventoryEntry {
  id: string;
  numberOfVariety: number;
  plantVariety: PlantVariety;
}

/**
 * Response schema for `/me` endpoint.
 */
interface PlantInventoryMeResponse {
  message: string;
  totalPages: number;
  result: PlantInventoryEntry[];
}

/**
 * Create a new plant inventory record.
 * POST /api/plant-inventories
 */
export const createPlantInventory = async (
  data: PlantInventoryCreateRequest
): Promise<ApiResponse> => {
  const response = await axiosInstance.post<ApiResponse>(
    "/plant-inventories",
    data
  );
  return response.data;
};

export const updatePlantInventory = async (
  data: PlantInventoryUpdateRequest
): Promise<ApiResponse> => {
  const response = await axiosInstance.put<ApiResponse>(
    "/plant-inventories",
    data
  );
  return response.data;
};

/**
 * Fetch all plant inventory records (admin or general list).
 * GET /api/plant-inventories
 */
export const getPlantInventories = async <T = any[]>(): Promise<T> => {
  const response = await axiosInstance.get<T>("/plant-inventories");
  return response.data;
};

/**
 * Fetch current user's plant inventory entries.
 * GET /api/plant-inventories/me
 * Returns only the array of entries for easy iteration.
 */
export const getMyPlantInventories = async (): Promise<
  PlantInventoryEntry[]
> => {
  const response = await axiosInstance.get<PlantInventoryMeResponse>(
    "/plant-inventories/me"
  );
  return response.data.result;
};

/**
 * Delete specific inventory entries by IDs.
 * DELETE /api/plant-inventories
 * @param ids Array of inventory entry IDs to delete.
 */
export const deletePlantInventories = async (
  ids: string[]
): Promise<ApiResponse> => {
  const response = await axiosInstance.request<ApiResponse>({
    method: "DELETE",
    url: "/plant-inventories",
    data: { ids },
  });
  return response.data;
};
