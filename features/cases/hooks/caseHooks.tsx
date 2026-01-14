import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import {
  getCases,
  getCaseById,
  getCaseTypes,
  getCaseStatuses,
  getCaseStatistics,
  getCaseDropdown,
  getCaseResources,
  getCaseTotalFinance,
  createCase,
  updateCase,
  softDeleteCase,
  hardDeleteCase,
  restoreCase,
  archiveCase,
  unarchiveCase,
} from "../apis/casesApis";

import type {
  GetCasesQuery,
  CaseDropdownQuery,
  CaseResourcesQuery,
  CreateCaseRequest,
  UpdateCaseRequest,
} from "../types/casesTypes";

// ===========================
// Query Keys
// ===========================
export const caseKeys = {
  all: ["cases"] as const,
  lists: () => [...caseKeys.all, "list"] as const,
  list: (filters: GetCasesQuery) => [...caseKeys.lists(), filters] as const,
  details: () => [...caseKeys.all, "detail"] as const,
  detail: (id: number | string) => [...caseKeys.details(), id] as const,
  types: ["caseTypes"] as const,
  statuses: ["caseStatuses"] as const,
  statistics: (id: number | string) =>
    [...caseKeys.all, "statistics", id] as const,
  dropdown: (filters: CaseDropdownQuery) =>
    [...caseKeys.all, "dropdown", filters] as const,
  resources: (id: number | string, filters: CaseResourcesQuery) =>
    [...caseKeys.all, "resources", id, filters] as const,
};

// ===========================
// Query Hooks
// ===========================

/**
 * Fetch paginated cases list
 */
export function useCases(filters: GetCasesQuery) {
  return useQuery({
    queryKey: caseKeys.list(filters),
    queryFn: () => getCases(filters),
    staleTime: 10_000,
  });
}

/**
 * Fetch single case by ID
 */
export function useCaseById(id: number | string, enabled = true) {
  return useQuery({
    queryKey: caseKeys.detail(id),
    queryFn: () => getCaseById(id),
    enabled: !!id && enabled,
  });
}

/**
 * Fetch case types for dropdowns
 */
export function useCaseTypes() {
  return useQuery({
    queryKey: caseKeys.types,
    queryFn: getCaseTypes,
    staleTime: Infinity, // These rarely change
  });
}

/**
 * Fetch case statuses for dropdowns
 */
export function useCaseStatuses() {
  return useQuery({
    queryKey: caseKeys.statuses,
    queryFn: getCaseStatuses,
    staleTime: Infinity, // These rarely change
  });
}

/**
 * Fetch case statistics
 */
export function useCaseStatistics(id: number | string, enabled = true) {
  return useQuery({
    queryKey: caseKeys.statistics(id),
    queryFn: () => getCaseStatistics(id),
    enabled: !!id && enabled,
  });
}

/**
 * Fetch cases dropdown (minimal data for selects)
 */
export function useCaseDropdown(filters: CaseDropdownQuery = {}) {
  return useQuery({
    queryKey: caseKeys.dropdown(filters),
    queryFn: () => getCaseDropdown(filters),
  });
}

/**
 * Fetch case resources
 */
export function useCaseResources(
  id: number | string,
  filters: CaseResourcesQuery,
  enabled = true
) {
  return useQuery({
    queryKey: caseKeys.resources(id, filters),
    queryFn: () => getCaseResources(id, filters),
    enabled: !!id && enabled,
  });
}

// ===========================
// Mutation Hooks
// ===========================

/**
 * Create a new case
 */
export function useCreateCase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCaseRequest) => createCase(data),
    onSuccess: (response) => {
      if (response?.succeeded) {
        toast.success(response.message || "تم إضافة القضية بنجاح");
        queryClient.invalidateQueries({ queryKey: caseKeys.all });
      } else {
        toast.error(response?.message || "تعذر إضافة القضية");
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
          err?.response?.data?.message || "حدث خطأ أثناء إضافة القضية"
        );
      }
    },
  });
}

/**
 * Update an existing case
 */
export function useUpdateCase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number | string;
      data: UpdateCaseRequest;
    }) => updateCase(id, data),
    onSuccess: (response, { id }) => {
      if (response?.succeeded) {
        toast.success(response.message || "تم تحديث القضية بنجاح");
        queryClient.invalidateQueries({ queryKey: caseKeys.all });
        queryClient.invalidateQueries({ queryKey: caseKeys.detail(id) });
      } else {
        toast.error(response?.message || "تعذر تحديث القضية");
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
          err?.response?.data?.message || "حدث خطأ أثناء تحديث القضية"
        );
      }
    },
  });
}

/**
 * Soft delete a case (moves to trash)
 */
export function useSoftDeleteCase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number | string) => softDeleteCase(id),
    onSuccess: (response) => {
      if (response?.succeeded) {
        toast.success(response.message || "تم حذف القضية بنجاح");
        queryClient.invalidateQueries({ queryKey: caseKeys.all });
      } else {
        toast.error(response?.message || "تعذر حذف القضية");
      }
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err?.response?.data?.message || "حدث خطأ أثناء حذف القضية");
    },
  });
}

/**
 * Hard delete (permanently remove) a case
 */
export function useHardDeleteCase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number | string) => hardDeleteCase(id),
    onSuccess: (response) => {
      if (response?.succeeded) {
        toast.success(response.message || "تم حذف القضية نهائياً");
        queryClient.invalidateQueries({ queryKey: caseKeys.all });
      } else {
        toast.error(response?.message || "تعذر حذف القضية");
      }
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err?.response?.data?.message || "حدث خطأ أثناء حذف القضية");
    },
  });
}

/**
 * Restore a soft-deleted case
 */
export function useRestoreCase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number | string) => restoreCase(id),
    onSuccess: (response) => {
      if (response?.succeeded) {
        toast.success(response.message || "تم استعادة القضية بنجاح");
        queryClient.invalidateQueries({ queryKey: caseKeys.all });
      } else {
        toast.error(response?.message || "تعذر استعادة القضية");
      }
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(
        err?.response?.data?.message || "حدث خطأ أثناء استعادة القضية"
      );
    },
  });
}

/**
 * Archive a case
 */
export function useArchiveCase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number | string) => archiveCase(id),
    onSuccess: (response) => {
      if (response?.succeeded) {
        toast.success(response.message || "تم أرشفة القضية بنجاح");
        queryClient.invalidateQueries({ queryKey: caseKeys.all });
      } else {
        toast.error(response?.message || "تعذر أرشفة القضية");
      }
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err?.response?.data?.message || "حدث خطأ أثناء أرشفة القضية");
    },
  });
}

/**
 * Unarchive a case
 */
export function useUnarchiveCase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number | string) => unarchiveCase(id),
    onSuccess: (response) => {
      if (response?.succeeded) {
        toast.success(response.message || "تم إلغاء أرشفة القضية بنجاح");
        queryClient.invalidateQueries({ queryKey: caseKeys.all });
      } else {
        toast.error(response?.message || "تعذر إلغاء أرشفة القضية");
      }
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(
        err?.response?.data?.message || "حدث خطأ أثناء إلغاء أرشفة القضية"
      );
    },
  });
}

/**
 * Fetch total finance for all cases
 */
export function useCaseTotalFinance() {
  return useQuery({
    queryKey: ["caseTotalFinance"],
    queryFn: () => getCaseTotalFinance(),
    staleTime: 60_000,
  });
}
