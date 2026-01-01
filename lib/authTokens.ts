import Cookies from "js-cookie";
import type { AuthTokens } from "@/features/auth/types/authTypes";

const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";

export function getAccessToken() {
  return Cookies.get(ACCESS_TOKEN_KEY) || "";
}

export function getRefreshToken() {
  return Cookies.get(REFRESH_TOKEN_KEY) || "";
}

export function setTokens(tokens: AuthTokens) {
  Cookies.set(ACCESS_TOKEN_KEY, tokens.accessToken);
  Cookies.set(REFRESH_TOKEN_KEY, tokens.refreshToken);
}

export function clearTokens() {
  Cookies.remove(ACCESS_TOKEN_KEY);
  Cookies.remove(REFRESH_TOKEN_KEY);
}
