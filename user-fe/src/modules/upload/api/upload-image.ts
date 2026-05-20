import { useMutation } from "@tanstack/react-query";

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
}

export const uploadImage = async ({ file, folder = "datn" }: UploadImageRequest): Promise<UploadImageResponse> => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", folder);

  const response = await apiClient.post("/uploads/image", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
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

  const response = await apiClient.post("/uploads/media", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};
