// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || "https://maktabi.runasp.net/api",
  TIMEOUT: 30000,
} as const;

// Cookie Configuration
export const COOKIE_CONFIG = {
  ACCESS_TOKEN_KEY: "accessToken",
  REFRESH_TOKEN_KEY: "refreshToken",
  ACCESS_TOKEN_EXPIRY_DAYS: 1,
  REFRESH_TOKEN_EXPIRY_DAYS: 7,
} as const;

// Validate environment variables in development
if (
  process.env.NODE_ENV === "development" &&
  !process.env.NEXT_PUBLIC_API_URL
) {
  console.warn(
    "⚠️ Warning: NEXT_PUBLIC_API_URL is not defined. Using default API URL."
  );
}
