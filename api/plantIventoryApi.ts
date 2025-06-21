import axiosInstance from "./axiosInstance"; // điều chỉnh path tuỳ project của bạn

// ----- Types ----- //

export interface CreatePlantInventoryRequest {
  userId: string;
  name: string;
  plantType: "VEGETABLE" | "FRUIT" | "FLOWER" | string;
  imageUrl?: string;
  inventoryQuantity: number;
  perCellMax: number;
  description?: string;
}

export interface CreatePlantInventoryResponse {
  message: string; // "Plant inventory created successfully"
}

// ----- API functions ----- //

/**
 * Tạo mới plant inventory
 */
export const createPlantInventory = async (
  data: CreatePlantInventoryRequest
): Promise<CreatePlantInventoryResponse> => {
  try {
    const response = await axiosInstance.post<CreatePlantInventoryResponse>(
      "/plant-inventories",
      data
    );
    return response.data;
  } catch (err) {
    console.error("Failed to create plant inventory:", err);
    throw new Error("Could not create plant inventory. Please try again.");
  }
};
export interface PlantInventory {
  id: string;
  userId: string;
  name: string;
  plantType: "VEGETABLE" | "FRUIT" | "FLOWER" | string;
  imageUrl?: string;
  inventoryQuantity: number;
  perCellMax: number;
  description?: string;
}

interface GetMyPlantInventoriesResponse {
  message: string; // e.g. "Fetched plant inventories for current user"
  result: PlantInventory[];
}

// ----- API function ----- //

/**
 * Fetches the current user's plant inventories.
 */
export const getMyPlantInventories = async (): Promise<PlantInventory[]> => {
  try {
    const response = await axiosInstance.get<GetMyPlantInventoriesResponse>(
      "/plant-inventories/me"
    );
    // Optionally log the server message:
    // console.log(response.data.message);
    return response.data.result;
  } catch (error) {
    console.error("Failed to fetch plant inventories:", error);
    throw new Error(
      "Unable to load your plant inventories. Please try again later."
    );
  }
};
