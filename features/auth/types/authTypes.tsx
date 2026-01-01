// Auth module types: requests and responses for Login/Register/Logout

// Generic API response wrapper
export interface ApiResponse<T> {
  succeeded: boolean;
  message: string;
  data: T;
}

// Device type reported by backend. Currently documented as "Browser".
export type DeviceType = "Browser";

// Login
export interface LoginRequest {
  email: string;
  password: string;
  deviceId: string;
  deviceType: DeviceType;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: string; // ISO datetime string
  deviceType: DeviceType;
}

export type LoginResponse = ApiResponse<AuthTokens>;

// Register
export interface RegisterRequest {
  officeName: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  password: string;
}

export type RegisterResponse = ApiResponse<string>;

// Logout
export interface LogoutRequest {
  deviceIdentifier: string;
  allDevices: boolean;
}

export type LogoutResponse = ApiResponse<string>;

// Refresh Token
export interface RefreshTokenRequest {
  refreshToken: string;
}

export type RefreshTokenResponse = ApiResponse<AuthTokens>;
