import axiosInstance from "./axiosInstance";

export interface UploadFileResponse {
  message: string;
  result: string; // URL của ảnh sau khi upload (Cloudinary, S3, v.v.)
}

export const uploadFile = async (file: {
  uri: string;
  name: string;
  type: string;
}): Promise<UploadFileResponse> => {
  try {
    const formData = new FormData();
    formData.append("file", {
      uri: file.uri,
      name: file.name,
      type: file.type,
    } as any); // `as any` vì RN không có định nghĩa chuẩn

    const response = await axiosInstance.post<UploadFileResponse>(
      "/files",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data;
  } catch (err) {
    console.error("Failed to upload file:", err);
    throw new Error("Could not upload file. Please try again.");
  }
};
