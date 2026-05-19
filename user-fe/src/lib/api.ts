import axios from "axios";

import { API_URL_LOGIN } from "../constant/config";
import {
  clearStorefrontSession,
  getStorefrontAccessToken,
  setStorefrontAccessToken,
} from "./auth-storage";
import { useAuthStore } from "@/stores/auth.store";

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

apiClient.interceptors.request.use((config) => {
  const token = getStorefrontAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let queue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    if (error.response?.status === 401 && original && !original._retry) {
      original._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          queue.push({
            resolve: (token: string) => {
            original.headers.Authorization = `Bearer ${token}`;
            resolve(apiClient(original));
            },
            reject,
          });
        });
      }

      isRefreshing = true;

      try {
        const response = await axios.post(
          `${API_URL_LOGIN}/refresh`,
          {},
          { withCredentials: true },
        );

        const newAccessToken = response.data.access_token;
        setStorefrontAccessToken(newAccessToken);

        queue.forEach(({ resolve }) => resolve(newAccessToken));
        queue = [];

        original.headers.Authorization = `Bearer ${newAccessToken}`;
        return apiClient(original);
      } catch (refreshError) {
        clearStorefrontSession();
        useAuthStore.getState().setUser(null);
        queue.forEach(({ reject }) => reject(refreshError));
        queue = [];
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);
