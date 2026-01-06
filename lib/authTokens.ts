import Cookies from "js-cookie";
import type { AuthTokens } from "@/features/auth/types/authTypes";
import { COOKIE_CONFIG } from "./config";

const {
  ACCESS_TOKEN_KEY,
  REFRESH_TOKEN_KEY,
  ACCESS_TOKEN_EXPIRY_DAYS,
  REFRESH_TOKEN_EXPIRY_DAYS,
} = COOKIE_CONFIG;

// Get secure cookie options
const getCookieOptions = (days: number): Cookies.CookieAttributes => ({
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  expires: days,
  path: "/",
});

export function getAccessToken(): string {
  return Cookies.get(ACCESS_TOKEN_KEY) || "";
}

export function getRefreshToken(): string {
  return Cookies.get(REFRESH_TOKEN_KEY) || "";
}

export function setTokens(tokens: AuthTokens): void {
  Cookies.set(
    ACCESS_TOKEN_KEY,
    tokens.accessToken,
    getCookieOptions(ACCESS_TOKEN_EXPIRY_DAYS)
  );
  Cookies.set(
    REFRESH_TOKEN_KEY,
    tokens.refreshToken,
    getCookieOptions(REFRESH_TOKEN_EXPIRY_DAYS)
  );
}

export function clearTokens(): void {
  Cookies.remove(ACCESS_TOKEN_KEY, { path: "/" });
  Cookies.remove(REFRESH_TOKEN_KEY, { path: "/" });
}

export function isAuthenticated(): boolean {
  return !!getAccessToken();
}
