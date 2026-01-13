import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import {
  fetchSessionsList,
  fetchSessionById,
  fetchSessionTypes,
  fetchSessionStatuses,
  createSession,
  updateSession,
  softDeleteSession,
} from "../apis/sessionsApis";

import type {
  GetSessionsQuery,
  CreateSessionRequest,
} from "../types/sessionsTypes";

// ===========================
// Query Keys
// ===========================
export const sessionKeys = {
  all: ["sessions"] as const,
  lists: () => [...sessionKeys.all, "list"] as const,
  list: (filters: GetSessionsQuery) =>
    [...sessionKeys.lists(), filters] as const,
  details: () => [...sessionKeys.all, "detail"] as const,
  detail: (id: number | string) => [...sessionKeys.details(), id] as const,
  types: ["sessionTypes"] as const,
  statuses: ["sessionStatuses"] as const,
};

// ===========================
// Query Hooks
// ===========================

/**
 * Fetch paginated sessions list
 */
export function useSessions(filters: GetSessionsQuery) {
  return useQuery({
    queryKey: sessionKeys.list(filters),
    queryFn: () => fetchSessionsList(filters),
    staleTime: 10_000,
  });
}

/**
 * Fetch single session by ID
 */
export function useSessionById(id: number | string, enabled = true) {
  return useQuery({
    queryKey: sessionKeys.detail(id),
    queryFn: () => fetchSessionById(id),
    enabled: !!id && enabled,
  });
}

/**
 * Fetch session types for dropdowns
 */
export function useSessionTypes() {
  return useQuery({
    queryKey: sessionKeys.types,
    queryFn: fetchSessionTypes,
    staleTime: Infinity,
  });
}

/**
 * Fetch session statuses for dropdowns
 */
export function useSessionStatuses() {
  return useQuery({
    queryKey: sessionKeys.statuses,
    queryFn: fetchSessionStatuses,
    staleTime: Infinity,
  });
}

// ===========================
// Mutation Hooks
// ===========================

/**
 * Create a new session
 */
export function useCreateSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSessionRequest) => createSession(data),
    onSuccess: () => {
      toast.success("تم إضافة الجلسة بنجاح");
      queryClient.invalidateQueries({ queryKey: sessionKeys.all });
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
          err?.response?.data?.message || "حدث خطأ أثناء إضافة الجلسة"
        );
      }
    },
  });
}

/**
 * Update an existing session
 */
export function useUpdateSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number | string;
      data: CreateSessionRequest;
    }) => updateSession(id, data),
    onSuccess: (_, { id }) => {
      toast.success("تم تحديث الجلسة بنجاح");
      queryClient.invalidateQueries({ queryKey: sessionKeys.all });
      queryClient.invalidateQueries({ queryKey: sessionKeys.detail(id) });
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
          err?.response?.data?.message || "حدث خطأ أثناء تحديث الجلسة"
        );
      }
    },
  });
}

/**
 * Soft delete a session
 */
export function useSoftDeleteSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number | string) => softDeleteSession(id),
    onSuccess: () => {
      toast.success("تم حذف الجلسة بنجاح");
      queryClient.invalidateQueries({ queryKey: sessionKeys.all });
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err?.response?.data?.message || "حدث خطأ أثناء حذف الجلسة");
    },
  });
}
