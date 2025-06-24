// src/api/gardenNoteApi.ts
import axiosInstance from "./axiosInstance";

/** ----- Types ----- **/

export interface CreateGardenNoteRequest {
  noteText: string;
  photoUrl?: string;
  noteTitle: string;
  gardenId: string;
}

export interface UpdateGardenNoteRequest extends CreateGardenNoteRequest {
  id: string;
}

export interface GardenNoteResponse {
  id: string;
  noteText: string;
  noteTitle: string;
  photoUrl?: string;
  gardenId: string;
  createdAt: string;
  updatedAt: string;
}

interface ApiSingleResponse<T> {
  message: string;
  result: T;
}

/**
 * Fetch all garden notes for the current user.
 * Backend trả về: { message: string, result: GardenNoteResponse[] }
 */
export const getMyGardenNotes = async (): Promise<
  ApiSingleResponse<GardenNoteResponse[]>
> => {
  const response = await axiosInstance.get<
    ApiSingleResponse<GardenNoteResponse[]>
  >("/garden-notes/me");
  return response.data;
};

/**
 * Fetch a single garden note by ID.
 * Backend trả về: { message: string, result: GardenNoteResponse }
 */
export const getGardenNoteById = async (
  id: string
): Promise<ApiSingleResponse<GardenNoteResponse>> => {
  const response = await axiosInstance.get<
    ApiSingleResponse<GardenNoteResponse>
  >(`/garden-notes/${id}`);
  return response.data;
};

/**
 * Create a new garden note.
 * Backend trả về: { message: string, result: GardenNoteResponse }
 */
export const createGardenNote = async (
  data: CreateGardenNoteRequest
): Promise<ApiSingleResponse<GardenNoteResponse>> => {
  const response = await axiosInstance.post<
    ApiSingleResponse<GardenNoteResponse>
  >("/garden-notes", data);
  return response.data;
};

/**
 * Update an existing garden note.
 * Backend trả về: { message: string }
 */
export const updateGardenNote = async (
  data: UpdateGardenNoteRequest
): Promise<{ message: string }> => {
  const response = await axiosInstance.put<{ message: string }>(
    "/garden-notes",
    data
  );
  return response.data;
};

/**
 * Delete one or more garden notes by IDs.
 * Backend trả về: { message: string }
 */
export const deleteGardenNotes = async (
  ids: string[]
): Promise<{ message: string }> => {
  const response = await axiosInstance.delete<{ message: string }>(
    "/garden-notes",
    { data: ids }
  );
  return response.data;
};
