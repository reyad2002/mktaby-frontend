import Cookies from "js-cookie";
import {
  getAccessToken,
  getRefreshToken,
  setTokens,
  clearTokens,
  isAuthenticated,
} from "../authTokens";

// Mock js-cookie
jest.mock("js-cookie", () => ({
  get: jest.fn(),
  set: jest.fn(),
  remove: jest.fn(),
}));

const mockGet = Cookies.get as jest.MockedFunction<typeof Cookies.get>;
const mockSet = Cookies.set as jest.MockedFunction<typeof Cookies.set>;
const mockRemove = Cookies.remove as jest.MockedFunction<typeof Cookies.remove>;

describe("authTokens", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getAccessToken", () => {
    it("should return token when it exists", () => {
      mockGet.mockReturnValue(
        "test-access-token" as unknown as { [key: string]: string }
      );

      const result = getAccessToken();

      expect(result).toBe("test-access-token");
      expect(mockGet).toHaveBeenCalledWith("accessToken");
    });

    it("should return empty string when token does not exist", () => {
      mockGet.mockReturnValue(
        undefined as unknown as { [key: string]: string }
      );

      const result = getAccessToken();

      expect(result).toBe("");
    });
  });

  describe("getRefreshToken", () => {
    it("should return refresh token when it exists", () => {
      mockGet.mockReturnValue(
        "test-refresh-token" as unknown as { [key: string]: string }
      );

      const result = getRefreshToken();

      expect(result).toBe("test-refresh-token");
      expect(mockGet).toHaveBeenCalledWith("refreshToken");
    });

    it("should return empty string when token does not exist", () => {
      mockGet.mockReturnValue(
        undefined as unknown as { [key: string]: string }
      );

      const result = getRefreshToken();

      expect(result).toBe("");
    });
  });

  describe("setTokens", () => {
    it("should set both access and refresh tokens", () => {
      const tokens = {
        accessToken: "new-access-token",
        refreshToken: "new-refresh-token",
        accessTokenExpiresAt: "2026-01-07T00:00:00.000Z",
        deviceType: "Browser" as const,
      };

      setTokens(tokens);

      expect(mockSet).toHaveBeenCalledTimes(2);
      expect(mockSet).toHaveBeenCalledWith(
        "accessToken",
        "new-access-token",
        expect.objectContaining({
          sameSite: "strict",
          path: "/",
        })
      );
      expect(mockSet).toHaveBeenCalledWith(
        "refreshToken",
        "new-refresh-token",
        expect.objectContaining({
          sameSite: "strict",
          path: "/",
        })
      );
    });
  });

  describe("clearTokens", () => {
    it("should remove both tokens", () => {
      clearTokens();

      expect(mockRemove).toHaveBeenCalledTimes(2);
      expect(mockRemove).toHaveBeenCalledWith("accessToken", {
        path: "/",
      });
      expect(mockRemove).toHaveBeenCalledWith("refreshToken", {
        path: "/",
      });
    });
  });

  describe("isAuthenticated", () => {
    it("should return true when access token exists", () => {
      mockGet.mockReturnValue(
        "valid-token" as unknown as { [key: string]: string }
      );

      const result = isAuthenticated();

      expect(result).toBe(true);
    });

    it("should return false when access token does not exist", () => {
      mockGet.mockReturnValue(
        undefined as unknown as { [key: string]: string }
      );

      const result = isAuthenticated();

      expect(result).toBe(false);
    });

    it("should return false when access token is empty string", () => {
      mockGet.mockReturnValue("" as unknown as { [key: string]: string });

      const result = isAuthenticated();

      expect(result).toBe(false);
    });
  });
});
