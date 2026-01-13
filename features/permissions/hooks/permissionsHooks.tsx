import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import {
  fetchPermissions,
  addPermission,
  getPermissionById,
  updatePermission,
  deletePermission,
} from "../apis/permissionsApi";

import type {
  PermissionsQueryParams,
  AddPermissionRequest,
  UpdatePermissionRequest,
} from "../types/permissionTypes";

// ===========================
// Query Keys
// ===========================
export const permissionKeys = {
  all: ["permissions"] as const,
  lists: () => [...permissionKeys.all, "list"] as const,
  list: (filters: PermissionsQueryParams) =>
    [...permissionKeys.lists(), filters] as const,
  details: () => [...permissionKeys.all, "detail"] as const,
  detail: (id: number) => [...permissionKeys.details(), id] as const,
};

// ===========================
// Query Hooks
// ===========================

/**
 * Fetch paginated permissions list
 */
export function usePermissions(filters: PermissionsQueryParams = {}) {
  return useQuery({
    queryKey: permissionKeys.list(filters),
    queryFn: () => fetchPermissions(filters),
    staleTime: 10_000,
  });
}

/**
 * Fetch single permission by ID
 */
export function usePermissionById(id: number, enabled = true) {
  return useQuery({
    queryKey: permissionKeys.detail(id),
    queryFn: () => getPermissionById(id),
    enabled: !!id && enabled,
  });
}

// ===========================
// Mutation Hooks
// ===========================

/**
 * Add a new permission
 */
export function useAddPermission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AddPermissionRequest) => addPermission(data),
    onSuccess: (response) => {
      if (response?.succeeded) {
        toast.success(response.message || "تم إضافة الصلاحية بنجاح");
        queryClient.invalidateQueries({ queryKey: permissionKeys.all });
      } else {
        toast.error(response?.message || "تعذر إضافة الصلاحية");
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
          err?.response?.data?.message || "حدث خطأ أثناء إضافة الصلاحية"
        );
      }
    },
  });
}

/**
 * Update an existing permission
 */
export function useUpdatePermission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdatePermissionRequest }) =>
      updatePermission(id, data),
    onSuccess: (response, { id }) => {
      if (response?.succeeded) {
        toast.success(response.message || "تم تحديث الصلاحية بنجاح");
        queryClient.invalidateQueries({ queryKey: permissionKeys.all });
        queryClient.invalidateQueries({ queryKey: permissionKeys.detail(id) });
      } else {
        toast.error(response?.message || "تعذر تحديث الصلاحية");
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
          err?.response?.data?.message || "حدث خطأ أثناء تحديث الصلاحية"
        );
      }
    },
  });
}

/**
 * Delete a permission
 */
export function useDeletePermission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deletePermission(id),
    onSuccess: (response) => {
      if (response?.succeeded) {
        toast.success(response.message || "تم حذف الصلاحية بنجاح");
        queryClient.invalidateQueries({ queryKey: permissionKeys.all });
      } else {
        toast.error(response?.message || "تعذر حذف الصلاحية");
      }
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err?.response?.data?.message || "حدث خطأ أثناء حذف الصلاحية");
    },
  });
}
