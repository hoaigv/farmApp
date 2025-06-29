// src/api/sessionApi.ts
import axiosInstance from "./axiosInstance";

// --- Types ---

/**
 * Thông tin của một phiên chat
 */
export interface ChatbotSession {
  id: string;
  chatTitle: string;
  createAt: string; // ISO timestamp của thời điểm tạo session
}

/**
 * Request để cập nhật session (PUT /api/chatbot-sessions)
 */
export interface UpdateSessionRequest {
  id: string;
  chatTitle: string;
}

/**
 * Response khi tạo mới hoặc lấy chi tiết 1 session
 */
interface SingleSessionResponse {
  /** metadata message từ server nếu có */
  message?: string;
  /** payload chính */
  result: ChatbotSession;
}

/**
 * Response khi lấy danh sách session (trả về mảng)
 */
interface ListSessionResponse {
  /** metadata message từ server nếu có */
  message?: string;
  /** payload chính là mảng session */
  result: ChatbotSession[];
}

/**
 * Request xóa session nhiều phiên
 */
export interface DeleteSessionRequest {
  ids: string[];
}

// --- API calls ---

/**
 * Tạo một phiên chat mới
 * POST /api/chatbot-sessions/new-chat
 */
export const createChatSession = async (): Promise<SingleSessionResponse> => {
  const { data } = await axiosInstance.post<SingleSessionResponse>(
    "/chatbot-sessions/new-chat"
  );
  return data;
};

/**
 * Lấy toàn bộ phiên chat của user hiện tại
 * GET /api/chatbot-sessions/me
 */
export const getMyChatSessions = async (): Promise<ListSessionResponse> => {
  const { data } = await axiosInstance.get<ListSessionResponse>(
    "/chatbot-sessions/me"
  );
  return data;
};

/**
 * Lấy chi tiết một phiên chat theo ID
 * GET /api/chatbot-sessions/{id}
 */
export const getChatSessionById = async (
  id: string
): Promise<SingleSessionResponse> => {
  const { data } = await axiosInstance.get<SingleSessionResponse>(
    `/chatbot-sessions/${id}`
  );
  return data;
};

/**
 * Cập nhật một phiên chat
 * PUT /api/chatbot-sessions
 */
export const updateChatSession = async (
  payload: UpdateSessionRequest
): Promise<SingleSessionResponse> => {
  const { data } = await axiosInstance.put<SingleSessionResponse>(
    "/chatbot-sessions",
    payload
  );
  return data;
};
export interface DeleteSessionsResponse {
  message: string;
  // nếu backend còn trả thêm các trường khác như total, page… bạn có thể bổ sung vào đây
}
/**
 * Delete one or more chat sessions
 * DELETE /api/chatbot-sessions
 *
 * @param ids Array of session IDs to delete
 * @returns The server’s confirmation message
 */
export const deleteChatSessions = async (
  ids: string[]
): Promise<DeleteSessionsResponse> => {
  const { data } = await axiosInstance.delete<DeleteSessionsResponse>(
    "/chatbot-sessions",
    {
      data: { ids },
    }
  );
  return data;
};
