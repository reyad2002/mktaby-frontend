import apiClient from "@/lib/apiClient";
import { API_CONFIG } from "@/lib/config";
import axios from "axios";

import {
  LOGIN_PATH,
  REGISTER_PATH,
  LOGOUT_PATH,
  REFRESH_TOKEN_PATH,
} from "../PATHES";

import {
  LoginResponse,
  RegisterResponse,
  LogoutResponse,
  RefreshTokenResponse,
} from "../types/authTypes";

export async function login(
  email: string,
  password: string,
  deviceId: string,
  deviceType: string
): Promise<LoginResponse> {
  // Use axios directly for login to avoid interceptor issues
  const response = await axios.post<LoginResponse>(
    `${API_CONFIG.BASE_URL}${LOGIN_PATH}`,
    {
      email,
      password,
      deviceId,
      deviceType,
    },
    {
      headers: { "Content-Type": "application/json" },
    }
  );
  return response.data;
}

export async function register(
  officeName: string,
  fullName: string,
  email: string,
  phoneNumber: string,
  password: string
): Promise<RegisterResponse> {
  const response = await axios.post<RegisterResponse>(
    `${API_CONFIG.BASE_URL}${REGISTER_PATH}`,
    {
      officeName,
      fullName,
      email,
      phoneNumber,
      password,
    },
    {
      headers: { "Content-Type": "application/json" },
    }
  );
  return response.data;
}

export async function logout(
  deviceIdentifier: string,
  allDevices: boolean = false
): Promise<LogoutResponse> {
  const response = await apiClient.post<LogoutResponse>(LOGOUT_PATH, {
    deviceIdentifier,
    allDevices,
  });
  return response.data;
}

export async function refreshTokenApi(
  refreshToken: string
): Promise<RefreshTokenResponse> {
  const response = await axios.post<RefreshTokenResponse>(
    `${API_CONFIG.BASE_URL}${REFRESH_TOKEN_PATH}`,
    { refreshToken },
    { headers: { "Content-Type": "application/json" } }
  );
  return response.data;
}
