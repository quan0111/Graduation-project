import axios from "axios";
import { API_URL } from "../constant/config";

export const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true, // 🔥 QUAN TRỌNG
});

// ===== ACCESS TOKEN =====
const getAccessToken = () => localStorage.getItem("access_token");

const setAccessToken = (token: string) => {
  localStorage.setItem("access_token", token);
};

const clearAuth = () => {
  localStorage.removeItem("access_token");
};

// ===== REQUEST =====
apiClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ===== REFRESH =====
let isRefreshing = false;
let queue: any[] = [];

apiClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;

      if (isRefreshing) {
        return new Promise((resolve) => {
          queue.push((token: string) => {
            original.headers.Authorization = `Bearer ${token}`;
            resolve(apiClient(original));
          });
        });
      }

      isRefreshing = true;

      try {
        // 🔥 KHÔNG gửi refresh_token
        const res = await axios.post(
          `${API_URL}/auth/refresh/`,
          {},
          { withCredentials: true }
        );

        const newAccess = res.data.access_token;

        setAccessToken(newAccess);

        queue.forEach((cb) => cb(newAccess));
        queue = [];

        original.headers.Authorization = `Bearer ${newAccess}`;
        return apiClient(original);

      } catch (err) {
        clearAuth();
        window.location.href = "/login";
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);