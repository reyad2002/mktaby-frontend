import axios from "axios";
import {
  getAccessToken,
  getRefreshToken,
  setTokens,
  clearTokens,
} from "./authTokens";
import { refreshTokenApi } from "@/features/auth/apis/authApi";

// Create an Axios instance
const apiClient = axios.create({
  baseURL: "https://maktabi.runasp.net/api",
  headers: { "Content-Type": "application/json" },
});

// Attach Authorization on every request
apiClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Refresh on 401 and retry once
apiClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const rt = getRefreshToken();
        if (!rt) throw new Error("Missing refresh token");
        const refreshed = await refreshTokenApi(rt);
        if (refreshed?.succeeded && refreshed.data) {
          setTokens(refreshed.data);
          originalRequest.headers = originalRequest.headers || {};
          originalRequest.headers.Authorization = `Bearer ${refreshed.data.accessToken}`;
          return apiClient(originalRequest);
        }
      } catch (e) {
        clearTokens();
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
