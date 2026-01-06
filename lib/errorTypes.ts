import { AxiosError } from "axios";

/**
 * Standard API Error Response structure
 */
export interface ApiErrorResponse {
  message?: string;
  errors?: Record<string, string[]>;
  statusCode?: number;
}

/**
 * Typed Axios Error with API response
 */
export type ApiError = AxiosError<ApiErrorResponse>;

/**
 * Extract error message from API error
 */
export function getErrorMessage(
  error: unknown,
  fallback = "حدث خطأ غير متوقع"
): string {
  if (error instanceof AxiosError) {
    const apiError = error as ApiError;

    // Check for validation errors
    if (apiError.response?.data?.errors) {
      const messages = Object.values(apiError.response.data.errors).flat();
      return messages[0] || fallback;
    }

    // Check for message
    if (apiError.response?.data?.message) {
      return apiError.response.data.message;
    }

    // Check for status-based messages
    if (apiError.response?.status) {
      switch (apiError.response.status) {
        case 400:
          return "البيانات المدخلة غير صحيحة";
        case 401:
          return "يجب تسجيل الدخول أولاً";
        case 403:
          return "ليس لديك صلاحية للوصول";
        case 404:
          return "المورد المطلوب غير موجود";
        case 422:
          return "البيانات غير صالحة";
        case 500:
          return "خطأ في الخادم، حاول مرة أخرى";
        default:
          return fallback;
      }
    }

    // Network error
    if (apiError.code === "ERR_NETWORK") {
      return "خطأ في الاتصال بالشبكة";
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
}

/**
 * Get all validation errors from API response
 */
export function getValidationErrors(error: unknown): string[] {
  if (error instanceof AxiosError) {
    const apiError = error as ApiError;
    if (apiError.response?.data?.errors) {
      return Object.values(apiError.response.data.errors).flat();
    }
  }
  return [];
}

/**
 * Check if error is an authentication error
 */
export function isAuthError(error: unknown): boolean {
  if (error instanceof AxiosError) {
    return error.response?.status === 401;
  }
  return false;
}

/**
 * Check if error is a network error
 */
export function isNetworkError(error: unknown): boolean {
  if (error instanceof AxiosError) {
    return error.code === "ERR_NETWORK" || !error.response;
  }
  return false;
}
