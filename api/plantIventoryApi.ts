import axiosInstance from "./axiosInstance"; // điều chỉnh path tuỳ project của bạn

// ----- Types ----- //

export interface CreatePlantInventoryRequest {
  name: string;
  plantType: "VEGETABLE" | "FRUIT" | "FLOWER" | string;
  imageUrl?: string;
  icon?: string; // ← thêm icon vào đây
  inventoryQuantity: number;
  perCellMax: number;
  description?: string;
}

export interface PlantInventory {
  id: string;
  userId: string;
  name: string;
  plantType: "VEGETABLE" | "FRUIT" | "FLOWER" | string;
  imageUrl?: string;
  icon?: string; // ← và thêm cả vào model của inventory
  inventoryQuantity: number;
  perCellMax: number;
  description?: string;
}

// Khi tạo mới, giả sử API trả về luôn object mới tạo:
export interface CreatePlantInventoryResponse {
  message: string; // "Plant inventory created successfully"
  result: PlantInventory; // ← trả luôn kết quả, trong đó có icon
}

export interface GetMyPlantInventoriesResponse {
  message: string; // e.g. "Fetched plant inventories for current user"
  result: PlantInventory[]; // ← mỗi item đã có icon
}

// ----- API functions ----- //

/**
 * Tạo mới plant inventory
 */
export const createPlantInventory = async (
  data: CreatePlantInventoryRequest
): Promise<PlantInventory> => {
  try {
    const response = await axiosInstance.post<CreatePlantInventoryResponse>(
      "/plant-inventories",
      data
    );
    return response.data.result; // có chứa icon
  } catch (err) {
    console.error("Failed to create plant inventory:", err);
    throw new Error("Could not create plant inventory. Please try again.");
  }
};

/**
 * Fetches the current user's plant inventories.
 */
export const getMyPlantInventories = async (): Promise<PlantInventory[]> => {
  try {
    const response = await axiosInstance.get<GetMyPlantInventoriesResponse>(
      "/plant-inventories/me"
    );
    return response.data.result; // mỗi PlantInventory có trường icon
  } catch (error) {
    console.error("Failed to fetch plant inventories:", error);
    throw new Error(
      "Unable to load your plant inventories. Please try again later."
    );
  }
};
// ----- Types ----- //

export interface DeletePlantInventoriesRequest {
  ids: string[]; // danh sách ID cần xóa
}

export interface DeletePlantInventoriesResponse {
  message: string; // "Plant inventories deleted successfully"
}

// ----- API function ----- //

/**
 * Xóa nhiều plant inventories cùng lúc
 *
 * @param ids Mảng các plantInventory.id cần xóa
 * @returns message từ server
 */
export const deletePlantInventories = async (
  ids: string[]
): Promise<string> => {
  try {
    const payload: DeletePlantInventoriesRequest = { ids };

    // Axios tính năng đặc biệt: với DELETE có body, ta để trong config.data
    const response = await axiosInstance.delete<DeletePlantInventoriesResponse>(
      "/plant-inventories",
      { data: payload }
    );

    // (Optional) console.log(response.data.message);
    return response.data.message;
  } catch (err) {
    console.error("Failed to delete plant inventories:", err);
    throw new Error("Could not delete selected items. Please try again.");
  }
};
