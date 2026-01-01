import axios from "axios";

import {
  LOGIN_PATH,
  REGISTER_PATH,
  LOGOUT_PATH,
  REFRESH_TOKEN_PATH,
} from "../PATHES";
// const BASE_URL = process.env.NEXT_PUBLIC_API_URL;
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
  try {
    const response = await axios.post<LoginResponse>(
      `https://maktabi.runasp.net/api${LOGIN_PATH}`,
      {
        email: email,
        password: password,
        deviceId: deviceId,
        deviceType: deviceType,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    if (response.status === 200) {
      console.log("Login successful:", response.data);
    }
    return response.data;
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
}

export async function register(
  officeName: string,
  fullName: string,
  email: string,
  phoneNumber: string,
  password: string
): Promise<RegisterResponse> {
  // register implementation
  try {
    const requestBody = {
      officeName: officeName,
      fullName: fullName,
      email: email,
      phoneNumber: phoneNumber,
      password: password,
    };
    console.log("Register request body:", requestBody);

    const response = await axios.post<RegisterResponse>(
      `https://maktabi.runasp.net/api${REGISTER_PATH}`,
      requestBody,
      { headers: { "Content-Type": "application/json" } }
    );
    if (response.status === 200) {
      console.log("Registration successful:");
    }
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Registration error response:", error.response?.data);
      console.error("Registration error status:", error.response?.status);
    }
    console.error("Registration error:", error);
    throw error;
  }
}

export async function logout(
  deviceIdentifier: string,
  allDevices: boolean = false,
  accessToken: string
): Promise<LogoutResponse> {
  try {
    const response = await axios.post<LogoutResponse>(
      `https://maktabi.runasp.net/api${LOGOUT_PATH}`,
      {
        deviceIdentifier: deviceIdentifier,
        allDevices: allDevices,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (response.status === 200) {
      console.log("Logout successful:", response.data);
    }
    return response.data;
  } catch (error) {
    console.error("Logout error:", error);
    throw error;
  }
}

export async function refreshTokenApi(
  refreshToken: string
): Promise<RefreshTokenResponse> {
  try {
    const response = await axios.post<RefreshTokenResponse>(
      `https://maktabi.runasp.net/api${REFRESH_TOKEN_PATH}`,
      { refreshToken },
      { headers: { "Content-Type": "application/json" } }
    );
    return response.data;
  } catch (error) {
    console.error("Refresh token error:", error);
    throw error;
  }
}
