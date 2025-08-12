// src/api/postApi.ts
import axiosInstance from "./axiosInstance";

/**
 * Request payload to create a new post.
 */
export interface CreatePostRequest {
  body: string;
  imageLink?: string;
}

/**
 * Response payload after creating a post.
 */
export interface CreatePostResponse {
  message: string;
  result: {
    id: string;
    title: string;
    body: string;
    imageLink?: string;
    userName: string;
    userLink: string;
    createdAt: string;
    updatedAt: string;
    commentCount: number;
  };
}

/**
 * Parameters for listing posts with optional filters & pagination.
 */
export interface ListPostsParams {
  page?: number;
  size?: number;
  userId?: string;

  createdFrom?: string; // ISO datetime
  createdTo?: string; // ISO datetime
  sortBy?: string; // default: createdAt
  sortDir?: "asc" | "desc"; // default: desc
}
export interface CommunityPostResponse {
  message: string;
  result: {
    id: string;
    body: string;
    imageLink?: string;
    isLike?: boolean; // optional
    totalComment: number;
    totalLike: number;
    userName: string;
    userLink: string;
    createdAt: string;
  };
}
/**
 * Summary of a post in a list, matching the communityPostResponse structure.
 */
export interface PostSummary {
  communityPostResponse: {
    id: string;
    body: string;
    imageLink?: string;
    isLike?: boolean; // optional
    totalComment: number;
    totalLike: number;
    userName: string;
    userLink: string;
    createdAt: string; // ISO datetime
  };
  updateAt?: string; // optional ISO datetime
  deleteAt?: string; // optional ISO datetime
}

/**
 * Response payload for listing posts.
 */
export interface ListPostsResponse {
  message: string;
  totalPages: number;
  result: PostSummary[];
  total: number;
  page: number;
  limit: number;
}

/**
 * Delete multiple posts request.
 */
export interface DeletePostsRequest {
  ids: string[];
}

/**
 * Generic response for delete/update operations.
 */
export interface OperationResponse {
  message: string;
}

/**
 * Get a single post by ID response.
 */
export interface GetPostResponse {
  message: string;
  result: CreatePostResponse["result"];
}

// --- API calls ---

/**
 * Create a new community post.
 */
export const createPost = async (
  data: CreatePostRequest
): Promise<CreatePostResponse> => {
  const response = await axiosInstance.post<CreatePostResponse>("/posts", data);
  return response.data;
};

/**
 * Fetch paged & filtered list of posts (admin scope).
 */
export const fetchPosts = async (
  params: ListPostsParams
): Promise<ListPostsResponse> => {
  const response = await axiosInstance.get<ListPostsResponse>("/posts", {
    params,
  });

  return response.data;
};
/**
 * Filters for fetching current user's posts.
 */
export interface MyPostsFilters {
  isComment?: boolean;
  isLike?: boolean;
  createdFrom?: string; // ISO datetime
  createdTo?: string; // ISO datetime
  sortBy?: string;
  sortDir?: "asc" | "desc";
}
/**
 * Fetch posts of the current authenticated user with optional filters.
 */
// src/api/postApi.ts
export const fetchMyPosts = async (
  filters: MyPostsFilters
): Promise<ListPostsResponse> => {
  console.log("Fetching my posts with filters:", filters);
  const response = await axiosInstance.get<ListPostsResponse>("/posts/me", {
    // SỬ DỤNG `params` để build query string, backend sẽ nhận qua @RequestParam
    params: filters,
  });
  return response.data;
};

/**
 * Fetch a single post by ID.
 */
export const fetchPostById = async (
  id: string
): Promise<CommunityPostResponse> => {
  const response = await axiosInstance.get<CommunityPostResponse>(
    `/posts/${id}`
  );

  return response.data;
};

/**
 * Update an existing post.
 */
export const updatePost = async (
  data: CreatePostRequest & { id: string }
): Promise<OperationResponse> => {
  const response = await axiosInstance.put<OperationResponse>("/posts", data);
  return response.data;
};

/**
 * Delete one or more posts by ID.
 */
export const deletePosts = async (
  data: DeletePostsRequest
): Promise<OperationResponse> => {
  const response = await axiosInstance.delete<OperationResponse>("/posts", {
    data,
  });
  return response.data;
};
