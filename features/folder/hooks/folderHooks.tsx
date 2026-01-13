import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  getFolderResources,
  getFolderById,
  createFolder,
  updateFolder,
  softDeleteFolder,
  hardDeleteFolder,
  restoreFolder,
} from "../apis/folderApis";
import type {
  CreateFolderRequest,
  UpdateFolderRequest,
} from "../types/folderTypes";

// ===========================
// Query Keys
// ===========================
export const folderQueryKeys = {
  all: ["folders"] as const,
  detail: (id: number) => ["folders", id] as const,
  resources: (id: number) => ["folders", "resources", id] as const,
};

// ===========================
// useFolderResources - Get folder resources by ID
// ===========================
export function useFolderResources(id: number, enabled = true) {
  return useQuery({
    queryKey: folderQueryKeys.resources(id),
    queryFn: () => getFolderResources(id),
    enabled: !!id && enabled,
  });
}

// ===========================
// useFolderById - Get folder by ID
// ===========================
export function useFolderById(id: number, enabled = true) {
  return useQuery({
    queryKey: folderQueryKeys.detail(id),
    queryFn: () => getFolderById(id),
    enabled: !!id && enabled,
  });
}

// ===========================
// useCreateFolder - Create a new folder
// ===========================
export function useCreateFolder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateFolderRequest) => createFolder(data),
    onSuccess: (response) => {
      if (response?.succeeded) {
        toast.success(response.message || "تم إنشاء المجلد بنجاح");
        queryClient.invalidateQueries({ queryKey: folderQueryKeys.all });
      } else {
        toast.error(response?.message || "تعذر إنشاء المجلد");
      }
    },
    onError: () => {
      toast.error("حدث خطأ أثناء إنشاء المجلد");
    },
  });
}

// ===========================
// useUpdateFolder - Update folder
// ===========================
export function useUpdateFolder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateFolderRequest }) =>
      updateFolder(id, data),
    onSuccess: (response, variables) => {
      if (response?.succeeded) {
        toast.success(response.message || "تم تحديث المجلد بنجاح");
        queryClient.invalidateQueries({
          queryKey: folderQueryKeys.detail(variables.id),
        });
        queryClient.invalidateQueries({ queryKey: folderQueryKeys.all });
      } else {
        toast.error(response?.message || "تعذر تحديث المجلد");
      }
    },
    onError: () => {
      toast.error("حدث خطأ أثناء تحديث المجلد");
    },
  });
}

// ===========================
// useSoftDeleteFolder - Soft delete folder (recoverable)
// ===========================
export function useSoftDeleteFolder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => softDeleteFolder(id),
    onSuccess: (response) => {
      if (response?.succeeded) {
        toast.success(response.message || "تم حذف المجلد بنجاح");
        queryClient.invalidateQueries({ queryKey: folderQueryKeys.all });
      } else {
        toast.error(response?.message || "تعذر حذف المجلد");
      }
    },
    onError: () => {
      toast.error("حدث خطأ أثناء حذف المجلد");
    },
  });
}

// ===========================
// useHardDeleteFolder - Hard delete folder (permanent)
// ===========================
export function useHardDeleteFolder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => hardDeleteFolder(id),
    onSuccess: (response) => {
      if (response?.succeeded) {
        toast.success(response.message || "تم الحذف النهائي للمجلد بنجاح");
        queryClient.invalidateQueries({ queryKey: folderQueryKeys.all });
      } else {
        toast.error(response?.message || "تعذر الحذف النهائي للمجلد");
      }
    },
    onError: () => {
      toast.error("حدث خطأ أثناء الحذف النهائي للمجلد");
    },
  });
}

// ===========================
// useRestoreFolder - Restore deleted folder
// ===========================
export function useRestoreFolder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => restoreFolder(id),
    onSuccess: (response) => {
      if (response?.succeeded) {
        toast.success(response.message || "تم استعادة المجلد بنجاح");
        queryClient.invalidateQueries({ queryKey: folderQueryKeys.all });
      } else {
        toast.error(response?.message || "تعذر استعادة المجلد");
      }
    },
    onError: () => {
      toast.error("حدث خطأ أثناء استعادة المجلد");
    },
  });
}
