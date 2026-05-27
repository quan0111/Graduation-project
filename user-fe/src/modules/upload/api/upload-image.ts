import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";

import { apiClient } from "@/lib/api";
import type { MutationConfig } from "@/lib/react-query";

export interface UploadImageRequest {
  file: File;
  folder?: string;
}

export interface UploadImageResponse {
  url: string;
  publicId?: string;
  width?: number;
  height?: number;
  format?: string;
  resourceType?: string;
  bytes?: number;
  originalFilename?: string;
}

const getUploadError = (error: unknown, fallback: string) => {
  if (error instanceof AxiosError) {
    const detail = error.response?.data?.detail;
    if (typeof detail === "string") {
      return detail;
    }
  }
  return fallback;
};

export const uploadImage = async ({ file, folder = "datn" }: UploadImageRequest): Promise<UploadImageResponse> => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", folder);

  try {
    const response = await apiClient.post("/uploads/image", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  } catch (error) {
    throw new Error(getUploadError(error, "Không tải được ảnh"));
  }
};

export const useUploadImage = ({ config }: { config?: MutationConfig<typeof uploadImage> } = {}) => {
  return useMutation({
    mutationFn: uploadImage,
    ...config,
  });
};

export const uploadMedia = async ({ file, folder = "datn" }: UploadImageRequest): Promise<UploadImageResponse> => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", folder);

  try {
    const response = await apiClient.post("/uploads/media", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  } catch (error) {
    throw new Error(getUploadError(error, "Không tải được media"));
  }
};

export const uploadFile = async ({ file, folder = "datn" }: UploadImageRequest): Promise<UploadImageResponse> => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", folder);

  try {
    const response = await apiClient.post("/uploads/file", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  } catch (error) {
    throw new Error(getUploadError(error, "Không tải được file"));
  }
};

export const useUploadFile = ({ config }: { config?: MutationConfig<typeof uploadFile> } = {}) => {
  return useMutation({
    mutationFn: uploadFile,
    ...config,
  });
};
