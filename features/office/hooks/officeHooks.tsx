import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import {
  fetchOffice,
  getOfficeResources,
  updateOffice,
  setOfficeLogo,
} from "../apis/officeApi";

import type {
  GetOfficeResourcesParams,
  UpdateOfficePayload,
} from "../types/officeTypes";

// ===========================
// Query Keys
// ===========================
export const officeKeys = {
  all: ["office"] as const,
  detail: () => [...officeKeys.all, "detail"] as const,
  resources: () => [...officeKeys.all, "resources"] as const,
  resourcesList: (filters: GetOfficeResourcesParams) =>
    [...officeKeys.resources(), filters] as const,
};

// ===========================
// Query Hooks
// ===========================

/**
 * Fetch office data
 */
export function useOffice() {
  return useQuery({
    queryKey: officeKeys.detail(),
    queryFn: fetchOffice,
    staleTime: 30_000,
  });
}

/**
 * Fetch office resources
 */
export function useOfficeResources(filters: GetOfficeResourcesParams = {}) {
  return useQuery({
    queryKey: officeKeys.resourcesList(filters),
    queryFn: () => getOfficeResources(filters),
    staleTime: 10_000,
  });
}

// ===========================
// Mutation Hooks
// ===========================

/**
 * Update office information
 */
export function useUpdateOffice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateOfficePayload) => updateOffice(data),
    onSuccess: (response) => {
      if (response?.succeeded) {
        toast.success(response.message || "تم تحديث بيانات المكتب بنجاح");
        queryClient.invalidateQueries({ queryKey: officeKeys.all });
      } else {
        toast.error(response?.message || "تعذر تحديث بيانات المكتب");
      }
    },
    onError: (error: unknown) => {
      const err = error as {
        response?: {
          data?: { message?: string; errors?: Record<string, string[]> };
        };
      };
      if (err?.response?.data?.errors) {
        const errorMessages = Object.values(err.response.data.errors).flat();
        errorMessages.forEach((msg) => toast.error(msg));
      } else {
        toast.error(
          err?.response?.data?.message || "حدث خطأ أثناء تحديث بيانات المكتب"
        );
      }
    },
  });
}

/**
 * Set office logo
 */
export function useSetOfficeLogo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (imageFile: File) => setOfficeLogo(imageFile),
    onSuccess: (response) => {
      if (response?.succeeded) {
        toast.success(response.message || "تم تحديث شعار المكتب بنجاح");
        queryClient.invalidateQueries({ queryKey: officeKeys.all });
      } else {
        toast.error(response?.message || "تعذر تحديث شعار المكتب");
      }
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(
        err?.response?.data?.message || "حدث خطأ أثناء تحديث شعار المكتب"
      );
    },
  });
}
