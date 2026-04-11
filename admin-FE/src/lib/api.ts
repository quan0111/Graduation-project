import axios from 'axios';
import { API_URL } from "../constant/config";

export const apiClient = axios.create({
    baseURL: API_URL,
    timeout: 1000 * 60 * 30 * 3, 
});

// REQUEST INTERCEPTOR
apiClient.interceptors.request.use(
    function (config) {
        // Get token from localStorage
        const token = localStorage.getItem("token");
        
        // Add Authorization header if token exists
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        
        // Add Content-Type header
        config.headers["Content-Type"] = "application/json";
        
        return config;
    },
    function (error) {
        return Promise.reject(error);
    },
);

// RESPONSE INTERCEPTOR
apiClient.interceptors.response.use(
    function (response) {
        return response;
    },
    async function (error) {
        const status = error?.response?.status;

        if (status === 401) {
            return Promise.reject({
                message: "Unauthorized: Invalid or expired token",
                code: 401,
                custom: true,
            });
        }

        if (status === 403) {
            return Promise.reject({
                message: "No access to ECUSS system",
                code: 403,
                custom: true,
            });
        }

        if (status === 404) {
            return Promise.reject({
                message: "Not Found",
                code: 404,
                custom: true,
                data: error.response?.data,
            });
        }

        if (status === 500) {
            return Promise.reject({
                message: "Internal Server Error",
                code: 500,
                custom: true,
                data: error.response?.data,
            });
        }

        return Promise.reject(error);
    },
);
