// src/api/authApi.ts
import axiosInstance from "./axiosInstance";

export interface ChangePasswordRequest {
  oldPassword: string;
  password: string;
  confirmPassword: string;
}

// Response mẫu từ OpenAPI là:
// {
//   "message": "string",
//   "totalPages": 0,
//   "result": {},
//   "total": 0,
//   "page": 0,
//   "limit": 1
// }
export interface ChangePasswordResponse {
  message: string;
  totalPages: number;
  result: Record<string, any>;
  total: number;
  page: number;
  limit: number;
}
//123456@Aa
/**
 * Thay đổi mật khẩu người dùng đang đăng nhập.
 *
 * @param data
 *   - oldPassword: mật khẩu cũ
 *   - password: mật khẩu mới
 *   - confirmPassword: xác nhận mật khẩu mới
 * @returns ChangePasswordResponse
 */
export const changePassword = async (
  data: ChangePasswordRequest
): Promise<ChangePasswordResponse> => {
  console.log(axiosInstance.defaults.baseURL);
  const response = await axiosInstance.put<ChangePasswordResponse>(
    "/me/password",
    data
  );
  return response.data;
};
