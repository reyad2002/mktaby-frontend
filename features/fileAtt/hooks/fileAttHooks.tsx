import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  uploadFile,
  downloadFile,
  getFileMetadata,
  updateFile,
  softDeleteFile,
  hardDeleteFile,
  restoreFile,
} from "../apis/fileAttApis";
import type {
  UploadFileRequest,
  UpdateFileRequest,
} from "../types/fileAttTypes";

// ===========================
// Query Keys
// ===========================
export const fileAttQueryKeys = {
  all: ["files"] as const,
  metadata: (id: number) => ["files", "metadata", id] as const,
};

// ===========================
// useUploadFile - Upload a new file
// ===========================
export function useUploadFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UploadFileRequest) => uploadFile(data),
    onSuccess: (response) => {
      if (response?.succeeded) {
        toast.success(response.message || "تم رفع الملف بنجاح");
        queryClient.invalidateQueries({ queryKey: fileAttQueryKeys.all });
      } else {
        toast.error(response?.message || "تعذر رفع الملف");
      }
    },
    onError: () => {
      toast.error("حدث خطأ أثناء رفع الملف");
    },
  });
}

// ===========================
// useDownloadFile - Download file by ID
// ===========================
export function useDownloadFile() {
  return useMutation({
    mutationFn: (id: number) => downloadFile(id),
    onSuccess: (blob, id) => {
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `file-${id}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("تم تحميل الملف بنجاح");
    },
    onError: () => {
      toast.error("حدث خطأ أثناء تحميل الملف");
    },
  });
}

// ===========================
// useFileMetadata - Get file metadata by ID
// ===========================
export function useFileMetadata(id: number, enabled = true) {
  return useQuery({
    queryKey: fileAttQueryKeys.metadata(id),
    queryFn: () => getFileMetadata(id),
    enabled: !!id && enabled,
  });
}

// ===========================
// useUpdateFile - Update file metadata
// ===========================
export function useUpdateFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateFileRequest) => updateFile(data),
    onSuccess: (response, variables) => {
      if (response?.succeeded) {
        toast.success(response.message || "تم تحديث الملف بنجاح");
        queryClient.invalidateQueries({
          queryKey: fileAttQueryKeys.metadata(variables.id),
        });
        queryClient.invalidateQueries({ queryKey: fileAttQueryKeys.all });
      } else {
        toast.error(response?.message || "تعذر تحديث الملف");
      }
    },
    onError: () => {
      toast.error("حدث خطأ أثناء تحديث الملف");
    },
  });
}

// ===========================
// useSoftDeleteFile - Soft delete file (recoverable)
// ===========================
export function useSoftDeleteFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => softDeleteFile(id),
    onSuccess: (response) => {
      if (response?.succeeded) {
        toast.success(response.message || "تم حذف الملف بنجاح");
        queryClient.invalidateQueries({ queryKey: fileAttQueryKeys.all });
      } else {
        toast.error(response?.message || "تعذر حذف الملف");
      }
    },
    onError: () => {
      toast.error("حدث خطأ أثناء حذف الملف");
    },
  });
}

// ===========================
// useHardDeleteFile - Hard delete file (permanent)
// ===========================
export function useHardDeleteFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => hardDeleteFile(id),
    onSuccess: (response) => {
      if (response?.succeeded) {
        toast.success(response.message || "تم الحذف النهائي للملف بنجاح");
        queryClient.invalidateQueries({ queryKey: fileAttQueryKeys.all });
      } else {
        toast.error(response?.message || "تعذر الحذف النهائي للملف");
      }
    },
    onError: () => {
      toast.error("حدث خطأ أثناء الحذف النهائي للملف");
    },
  });
}

// ===========================
// useRestoreFile - Restore deleted file
// ===========================
export function useRestoreFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => restoreFile(id),
    onSuccess: (response) => {
      if (response?.succeeded) {
        toast.success(response.message || "تم استعادة الملف بنجاح");
        queryClient.invalidateQueries({ queryKey: fileAttQueryKeys.all });
      } else {
        toast.error(response?.message || "تعذر استعادة الملف");
      }
    },
    onError: () => {
      toast.error("حدث خطأ أثناء استعادة الملف");
    },
  });
}
