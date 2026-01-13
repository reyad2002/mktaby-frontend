import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import {
  fetchTasksApi,
  fetchTaskByIdApi,
  fetchTaskPrioritiesApi,
  fetchTaskStatusesApi,
  addTaskApi,
  updateTaskApi,
  updateTaskStatusApi,
  softDeleteTaskApi,
  fetchTaskDashboardApi,
} from "../apis/tasksApis";

import type {
  GetTasksQuery,
  CreateTaskRequest,
  UpdateTaskRequest,
  PatchTaskStatusRequest,
} from "../types/taskTypes";

// ===========================
// Query Keys
// ===========================
export const taskKeys = {
  all: ["tasks"] as const,
  lists: () => [...taskKeys.all, "list"] as const,
  list: (filters: GetTasksQuery) => [...taskKeys.lists(), filters] as const,
  details: () => [...taskKeys.all, "detail"] as const,
  detail: (id: number) => [...taskKeys.details(), id] as const,
  priorities: ["taskPriorities"] as const,
  statuses: ["taskStatuses"] as const,
  dashboard: ["taskDashboard"] as const,
};

// ===========================
// Query Hooks
// ===========================

/**
 * Fetch paginated tasks list
 */
export function useTasks(filters: GetTasksQuery) {
  return useQuery({
    queryKey: taskKeys.list(filters),
    queryFn: () => fetchTasksApi(filters),
    staleTime: 10_000,
  });
}

/**
 * Fetch single task by ID
 */
export function useTaskById(id: number, enabled = true) {
  return useQuery({
    queryKey: taskKeys.detail(id),
    queryFn: () => fetchTaskByIdApi(id),
    enabled: !!id && enabled,
  });
}

/**
 * Fetch task priorities for dropdowns
 */
export function useTaskPriorities() {
  return useQuery({
    queryKey: taskKeys.priorities,
    queryFn: fetchTaskPrioritiesApi,
    staleTime: Infinity,
  });
}

/**
 * Fetch task statuses for dropdowns
 */
export function useTaskStatuses() {
  return useQuery({
    queryKey: taskKeys.statuses,
    queryFn: fetchTaskStatusesApi,
    staleTime: Infinity,
  });
}

/**
 * Fetch task dashboard statistics
 */
export function useTaskDashboard() {
  return useQuery({
    queryKey: taskKeys.dashboard,
    queryFn: fetchTaskDashboardApi,
    staleTime: 30_000,
  });
}

// ===========================
// Mutation Hooks
// ===========================

/**
 * Add a new task
 */
export function useAddTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTaskRequest) => addTaskApi(data),
    onSuccess: (response) => {
      if (response?.data?.succeeded) {
        toast.success(response.data.message || "تم إضافة المهمة بنجاح");
        queryClient.invalidateQueries({ queryKey: taskKeys.all });
        queryClient.invalidateQueries({ queryKey: taskKeys.dashboard });
      } else {
        toast.error(response?.data?.message || "تعذر إضافة المهمة");
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
          err?.response?.data?.message || "حدث خطأ أثناء إضافة المهمة"
        );
      }
    },
  });
}

/**
 * Update an existing task
 */
export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateTaskRequest }) =>
      updateTaskApi(id, data),
    onSuccess: (response, { id }) => {
      if (response?.data?.succeeded) {
        toast.success(response.data.message || "تم تحديث المهمة بنجاح");
        queryClient.invalidateQueries({ queryKey: taskKeys.all });
        queryClient.invalidateQueries({ queryKey: taskKeys.detail(id) });
        queryClient.invalidateQueries({ queryKey: taskKeys.dashboard });
      } else {
        toast.error(response?.data?.message || "تعذر تحديث المهمة");
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
          err?.response?.data?.message || "حدث خطأ أثناء تحديث المهمة"
        );
      }
    },
  });
}

/**
 * Update task status
 */
export function useUpdateTaskStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: PatchTaskStatusRequest }) =>
      updateTaskStatusApi(id, data),
    onSuccess: (response, { id }) => {
      if (response?.data?.succeeded) {
        toast.success(response.data.message || "تم تحديث حالة المهمة بنجاح");
        queryClient.invalidateQueries({ queryKey: taskKeys.all });
        queryClient.invalidateQueries({ queryKey: taskKeys.detail(id) });
        queryClient.invalidateQueries({ queryKey: taskKeys.dashboard });
      } else {
        toast.error(response?.data?.message || "تعذر تحديث حالة المهمة");
      }
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(
        err?.response?.data?.message || "حدث خطأ أثناء تحديث حالة المهمة"
      );
    },
  });
}

/**
 * Soft delete a task
 */
export function useSoftDeleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => softDeleteTaskApi(id),
    onSuccess: (response) => {
      if (response?.data?.succeeded) {
        toast.success(response.data.message || "تم حذف المهمة بنجاح");
        queryClient.invalidateQueries({ queryKey: taskKeys.all });
        queryClient.invalidateQueries({ queryKey: taskKeys.dashboard });
      } else {
        toast.error(response?.data?.message || "تعذر حذف المهمة");
      }
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err?.response?.data?.message || "حدث خطأ أثناء حذف المهمة");
    },
  });
}
