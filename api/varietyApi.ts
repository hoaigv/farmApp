// src/api/varietyApi.ts

import axiosInstance from "./axiosInstance";

/**
 * Basic information for a plant variety.
 */
export interface Variety {
  id: string;
  name: string;
  iconLink: string;
  plantType: "VEGETABLE" | "HERB" | string;
}

/**
 * Information about a growth stage of a plant.
 */
export interface Stage {
  id: string;
  name: string;
  iconLink: string;
  description: string;
  stageOrder: number;
  estimatedByDay: number;
}

/**
 * Detailed information for a plant variety, including growth stages.
 */
export interface VarietyDetail extends Variety {
  description: string;
  stages: Stage[];
}

export interface GetVarietiesParams {
  /**
   * Loại cây (VEGETABLE | HERB | ALL)
   */
  type: string;
}

/**
 * Fetch a list of plant varieties filtered by type.
 * GET /api/plant-variety?type={type}
 */
export const getVarieties = async (
  params: GetVarietiesParams
): Promise<Variety[]> => {
  const response = await axiosInstance.get<{ result: Variety[] }>(
    "/plant-variety/type",
    { params }
  );
  return response.data.result;
};

/**
 * Convenience method to fetch all varieties (type = ALL).
 */
export const getAllVarieties = async (): Promise<Variety[]> => {
  return getVarieties({ type: "ALL" });
};

/**
 * Fetch detailed information of a single plant variety.
 * GET /api/plant-variety/{varietyId}
 *
 * @param varietyId - The ID of the variety
 */
export const getVarietyDetail = async (
  varietyId: string
): Promise<VarietyDetail> => {
  const response = await axiosInstance.get<{ result: VarietyDetail }>(
    `/plant-variety/${varietyId}`
  );
  return response.data.result;
};
