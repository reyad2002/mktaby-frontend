import axios from "axios";
import {
  getAccessToken,
  getRefreshToken,
  setTokens,
  clearTokens,
} from "./authTokens";
import { API_CONFIG } from "./config";

// Create an Axios instance with config
const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: { "Content-Type": "application/json" },
});

// Attach Authorization on every request
apiClient.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Refresh on 401 and retry once
apiClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;

    // Skip refresh for auth endpoints to avoid circular dependency
    const isAuthEndpoint = originalRequest?.url?.includes("/Auth/");

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isAuthEndpoint
    ) {
      originalRequest._retry = true;

      try {
        const refreshToken = getRefreshToken();
        if (!refreshToken) {
          throw new Error("Missing refresh token");
        }

        // Call refresh endpoint directly to avoid circular import
        const response = await axios.post(
          `${API_CONFIG.BASE_URL}/Auth/refresh-token`,
          { refreshToken },
          { headers: { "Content-Type": "application/json" } }
        );

        if (response.data?.succeeded && response.data?.data) {
          setTokens(response.data.data);
          originalRequest.headers = originalRequest.headers || {};
          originalRequest.headers.Authorization = `Bearer ${response.data.data.accessToken}`;
          return apiClient(originalRequest);
        }
      } catch {
        clearTokens();
        // Redirect to login if on client side
        if (typeof window !== "undefined") {
          window.location.href = "/auth/login";
        }
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
