// src/api/postApi.ts
import axiosInstance from "./axiosInstance";
/**
 * Request payload to create a new comment.
 */
export interface CreateCommentRequest {
  postId: string;
  content?: string;
}
/**
 * Response payload
 */
export interface CommentResponse {
  id: string;
  postId: string;
  userName: string;
  userLink?: string;
  content: string;
  createdAt: string;
}

export interface ListPostResponse {
  message: string;
  result: CommentResponse[];
}
// // --- API calls ---

// /**
//  * Create a new comment post.
//  */
export const createComment = async (
  data: CreateCommentRequest
): Promise<CommentResponse> => {
  const response = await axiosInstance.post<CommentResponse>("/comments", data);
  return response.data;
};

/**
 * Fetch comments for a specific post.
 */
export const fetchComments = async (
  postId: string
): Promise<ListPostResponse> => {
  const response = await axiosInstance.get<ListPostResponse>(
    `/comments/post/${postId}`
  );
  return response.data;
};
