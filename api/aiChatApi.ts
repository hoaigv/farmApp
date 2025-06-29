import axios from "axios";
import { store } from "../store";

/**
 * Payload gửi lên server Flask
 */
export interface ChatRequest {
  query: string;
  session_id: string;
}

/**
 * Kết quả trả về từ server Flask
 */
export interface ChatResponse {
  response?: string;
}

// Base URL cho Flask backend
const FLASK_BASE_URL = "http://localhost:8082";

/**
 * Gửi câu hỏi tới Chatbot AI Server (Flask)
 *
 * @param data - gồm query và session_id
 * @returns ChatResponse chứa answer và optional sources
 */
export const sendChatQuery = async (
  data: ChatRequest
): Promise<ChatResponse> => {
  const token = store.getState().auth.accessToken;

  const response = await axios.post<ChatResponse>(
    `${FLASK_BASE_URL}/chat`,
    data,
    {
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    }
  );

  return response.data;
};
