import axiosInstance from "./axiosInstance";

/**
 * GardenLogResponse mirrors the backend DTO
 */
export interface GardenLogResponse {
  id: string;
  description: string;
  actionType: string;
  timestamp: string; // ISO string
  reminderId: string;
  gardenId: string;
  gardenCellId: string;
}

/**
 * Wrapper for list response from /api/garden-logs
 */
export interface ListGardenLogResponse {
  message: string;
  totalPages: number;
  result: GardenLogResponse[];
}

/**
 * Fetch all garden logs for a given garden ID
 * @param gardenId The UUID of the garden
 * @returns Promise resolving to paginated garden log list
 */
export const fetchGardenLogs = async (
  gardenId: string
): Promise<ListGardenLogResponse> => {
  const response = await axiosInstance.get<ListGardenLogResponse>(
    "/garden-logs",
    { params: { gardenId } }
  );
  return response.data;
};
