import { AxiosError } from "axios";
import {
  getErrorMessage,
  getValidationErrors,
  isNetworkError,
  isAuthError,
} from "../errorTypes";

describe("errorTypes", () => {
  describe("getErrorMessage", () => {
    it("should return validation error message from API response", () => {
      const error = new AxiosError("Request failed");
      error.response = {
        data: {
          errors: {
            email: ["البريد الإلكتروني غير صالح"],
          },
        },
        status: 422,
        statusText: "Unprocessable Entity",
        headers: {},
        config: {} as never,
      };

      const result = getErrorMessage(error);

      expect(result).toBe("البريد الإلكتروني غير صالح");
    });

    it("should return message from API response", () => {
      const error = new AxiosError("Request failed");
      error.response = {
        data: {
          message: "رسالة خطأ من الخادم",
        },
        status: 400,
        statusText: "Bad Request",
        headers: {},
        config: {} as never,
      };

      const result = getErrorMessage(error);

      expect(result).toBe("رسالة خطأ من الخادم");
    });

    it("should return status-based message for 401", () => {
      const error = new AxiosError("Unauthorized");
      error.response = {
        data: {},
        status: 401,
        statusText: "Unauthorized",
        headers: {},
        config: {} as never,
      };

      const result = getErrorMessage(error);

      expect(result).toBe("يجب تسجيل الدخول أولاً");
    });

    it("should return status-based message for 403", () => {
      const error = new AxiosError("Forbidden");
      error.response = {
        data: {},
        status: 403,
        statusText: "Forbidden",
        headers: {},
        config: {} as never,
      };

      const result = getErrorMessage(error);

      expect(result).toBe("ليس لديك صلاحية للوصول");
    });

    it("should return status-based message for 404", () => {
      const error = new AxiosError("Not Found");
      error.response = {
        data: {},
        status: 404,
        statusText: "Not Found",
        headers: {},
        config: {} as never,
      };

      const result = getErrorMessage(error);

      expect(result).toBe("المورد المطلوب غير موجود");
    });

    it("should return network error message", () => {
      const error = new AxiosError("Network Error");
      error.code = "ERR_NETWORK";

      const result = getErrorMessage(error);

      expect(result).toBe("خطأ في الاتصال بالشبكة");
    });

    it("should return fallback for unknown errors", () => {
      const error = { something: "unknown" };

      const result = getErrorMessage(error);

      expect(result).toBe("حدث خطأ غير متوقع");
    });

    it("should return custom fallback message", () => {
      const error = { something: "unknown" };

      const result = getErrorMessage(error, "رسالة مخصصة");

      expect(result).toBe("رسالة مخصصة");
    });

    it("should return Error message for standard errors", () => {
      const error = new Error("Standard error message");

      const result = getErrorMessage(error);

      expect(result).toBe("Standard error message");
    });
  });

  describe("getValidationErrors", () => {
    it("should return all validation errors as array", () => {
      const error = new AxiosError("Validation failed");
      error.response = {
        data: {
          errors: {
            email: ["البريد غير صالح", "البريد مستخدم"],
            password: ["كلمة المرور قصيرة"],
          },
        },
        status: 422,
        statusText: "Unprocessable Entity",
        headers: {},
        config: {} as never,
      };

      const result = getValidationErrors(error);

      expect(result).toHaveLength(3);
      expect(result).toContain("البريد غير صالح");
      expect(result).toContain("البريد مستخدم");
      expect(result).toContain("كلمة المرور قصيرة");
    });

    it("should return empty array for non-validation errors", () => {
      const error = new Error("Some error");

      const result = getValidationErrors(error);

      expect(result).toEqual([]);
    });
  });

  describe("isNetworkError", () => {
    it("should return true for network errors", () => {
      const error = new AxiosError("Network Error");
      error.code = "ERR_NETWORK";

      const result = isNetworkError(error);

      expect(result).toBe(true);
    });

    it("should return false for non-network errors", () => {
      const error = new AxiosError("Server Error");
      error.response = {
        data: {},
        status: 500,
        statusText: "Internal Server Error",
        headers: {},
        config: {} as never,
      };

      const result = isNetworkError(error);

      expect(result).toBe(false);
    });
  });

  describe("isAuthError", () => {
    it("should return true for 401 errors", () => {
      const error = new AxiosError("Unauthorized");
      error.response = {
        data: {},
        status: 401,
        statusText: "Unauthorized",
        headers: {},
        config: {} as never,
      };

      const result = isAuthError(error);

      expect(result).toBe(true);
    });

    it("should return false for 403 errors", () => {
      const error = new AxiosError("Forbidden");
      error.response = {
        data: {},
        status: 403,
        statusText: "Forbidden",
        headers: {},
        config: {} as never,
      };

      const result = isAuthError(error);

      expect(result).toBe(false);
    });

    it("should return false for non-auth errors", () => {
      const error = new AxiosError("Not Found");
      error.response = {
        data: {},
        status: 404,
        statusText: "Not Found",
        headers: {},
        config: {} as never,
      };

      const result = isAuthError(error);

      expect(result).toBe(false);
    });
  });
});
