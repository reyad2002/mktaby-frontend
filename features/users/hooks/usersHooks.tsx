import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import {
  fetchUsers,
  addUser,
  updateUser,
  getUserById,
  deleteUser,
  getCurrentUser,
  setProfileImage,
} from "../apis/usersApi";

import type {
  UsersQueryParams,
  AddUserRequest,
  UpdateUserRequest,
} from "../types/userTypes";

// ===========================
// Query Keys
// ===========================
export const userKeys = {
  all: ["users"] as const,
  lists: () => [...userKeys.all, "list"] as const,
  list: (filters: UsersQueryParams) => [...userKeys.lists(), filters] as const,
  details: () => [...userKeys.all, "detail"] as const,
  detail: (id: number) => [...userKeys.details(), id] as const,
  currentUser: ["currentUser"] as const,
};

// ===========================
// Query Hooks
// ===========================

/**
 * Fetch paginated users list
 */
export function useUsers(filters: UsersQueryParams = {}) {
  return useQuery({
    queryKey: userKeys.list(filters),
    queryFn: () => fetchUsers(filters),
    staleTime: 10_000,
  });
}

/**
 * Fetch single user by ID
 */
export function useUserById(id: number, enabled = true) {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: () => getUserById(id),
    enabled: !!id && enabled,
  });
}

/**
 * Fetch current logged-in user
 */
export function useCurrentUser() {
  return useQuery({
    queryKey: userKeys.currentUser,
    queryFn: getCurrentUser,
    staleTime: 60_000,
  });
}

// ===========================
// Mutation Hooks
// ===========================

/**
 * Add a new user
 */
export function useAddUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AddUserRequest) => addUser(data),
    onSuccess: (response) => {
      if (response?.succeeded) {
        toast.success(response.message || "تم إضافة المستخدم بنجاح");
        queryClient.invalidateQueries({ queryKey: userKeys.all });
      } else {
        toast.error(response?.message || "تعذر إضافة المستخدم");
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
          err?.response?.data?.message || "حدث خطأ أثناء إضافة المستخدم"
        );
      }
    },
  });
}

/**
 * Update an existing user
 */
export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateUserRequest) => updateUser(data),
    onSuccess: (response, data) => {
      if (response?.succeeded) {
        toast.success(response.message || "تم تحديث المستخدم بنجاح");
        queryClient.invalidateQueries({ queryKey: userKeys.all });
        queryClient.invalidateQueries({ queryKey: userKeys.detail(data.id) });
      } else {
        toast.error(response?.message || "تعذر تحديث المستخدم");
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
          err?.response?.data?.message || "حدث خطأ أثناء تحديث المستخدم"
        );
      }
    },
  });
}

/**
 * Delete a user
 */
export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteUser(id),
    onSuccess: (response) => {
      if (response?.succeeded) {
        toast.success(response.message || "تم حذف المستخدم بنجاح");
        queryClient.invalidateQueries({ queryKey: userKeys.all });
      } else {
        toast.error(response?.message || "تعذر حذف المستخدم");
      }
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err?.response?.data?.message || "حدث خطأ أثناء حذف المستخدم");
    },
  });
}

/**
 * Set user profile image
 */
export function useSetProfileImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, imageFile }: { id: number; imageFile: File }) =>
      setProfileImage(id, imageFile),
    onSuccess: (response, { id }) => {
      if (response?.succeeded) {
        toast.success(response.message || "تم تحديث صورة الملف الشخصي بنجاح");
        queryClient.invalidateQueries({ queryKey: userKeys.all });
        queryClient.invalidateQueries({ queryKey: userKeys.detail(id) });
        queryClient.invalidateQueries({ queryKey: userKeys.currentUser });
      } else {
        toast.error(response?.message || "تعذر تحديث صورة الملف الشخصي");
      }
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(
        err?.response?.data?.message || "حدث خطأ أثناء تحديث صورة الملف الشخصي"
      );
    },
  });
}
