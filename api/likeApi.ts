import axiosInstance from "./axiosInstance";

export interface LikeCreateRequest {
  postId: string;
}
/**
 * Create a like for a post.
 * @param postId - The ID of the post to like.
 * @returns A promise that resolves when the like is created.
 */
export const createLike = async (data: LikeCreateRequest): Promise<void> => {
  const response = await axiosInstance.post<void>("/likes", data);
  return response.data;
};
/**
 * Delete multiple posts request.
 */

export const deletePosts = async (id: string): Promise<void> => {
  const response = await axiosInstance.delete<void>(`/likes/${id}`);
  return response.data;
};
