// src/api/signin.ts
import axiosInstance from "./axiosInstance";

/**
 * Request body cho endpoint đăng ký (register)
 * POST /api/auth/register
 */
export interface RegisterRequest {
  email: string;
  password: string;
  confirmPassword: string;
}

/**
 * Response từ server khi register
 * (theo hình: server trả { message: "Register successfully !" })
 * Nếu backend trả thêm trường khác, bổ sung vào interface này.
 */
export interface RegisterResponse {
  message: string;
  // thêm fields nếu backend trả thêm, ví dụ:
  // result?: { id: string; email: string; ... }
}

/**
 * Gọi API đăng ký người dùng
 * POST /auth/register  (nếu axiosInstance baseURL = '/api')
 * hoặc POST /api/auth/register nếu không
 */
export const register = async (
  payload: RegisterRequest
): Promise<RegisterResponse> => {
  const { data } = await axiosInstance.post<RegisterResponse>(
    "/auth/register",
    payload
  );
  return data;
};
