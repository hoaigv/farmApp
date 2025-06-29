// src/api/logApi.ts
import axiosInstance from "./axiosInstance";

// --- Types ---

/**
 * Một log chat bot (tin nhắn người dùng và phản hồi của bot)
 */
export interface ChatLog {
  id: string;
  userMessage: string;
  botResponse: string;
}

/**
 * Response từ API khi lấy log của một session
 */
export interface ChatLogResponse {
  result: ChatLog[];
}

// --- API calls ---

/**
 * Lấy log của một phiên chat theo ID
 * GET /api/chatbot-logs/{id}
 */
export const getChatLogsBySessionId = async (
  sessionId: string
): Promise<ChatLogResponse> => {
  const { data } = await axiosInstance.get<ChatLogResponse>(
    `/chatbot-logs/${sessionId}`
  );
  return data;
};
