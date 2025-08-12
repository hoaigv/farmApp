// src/api/authApi.ts
import axiosInstance from "./axiosInstance";

export interface LoginResult {
  id: string;
  accessToken: string;
  refreshToken: string;
  role: string;
  name: string;
  avatar_link: string;
}

export interface LoginResponse {
  message: string;
  result: LoginResult;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

// Login bằng email + password
export const loginWithEmail = async (
  credentials: LoginCredentials
): Promise<LoginResponse> => {
  const response = await axiosInstance.post<LoginResponse>(
    "/auth/email",
    credentials
  );
  return response.data;
};

// Login bằng Google, gửi idToken lên backend để xác thực
export const loginWithGoogle = async (
  tokenId: string
): Promise<LoginResult> => {
  const response = await axiosInstance.post<LoginResponse>("/auth/google", {
    tokenId,
  });
  return response.data.result; // trả đúng phần cần dùng
};
