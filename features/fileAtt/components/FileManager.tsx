"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Folder,
  FileText,
  UploadCloud,
  Loader2,
  AlertCircle,
  Download,
  Info,
  Search,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Upload,
  Edit2,
  FolderPlus,
  FolderOpen,
} from "lucide-react";

import {
  useUploadFile,
  useDownloadFile,
  useSoftDeleteFile,
  useFileMetadata,
  useUpdateFile,
} from "@/features/fileAtt/hooks/fileAttHooks";
import type { EntityType } from "@/features/fileAtt/types/fileAttTypes";
import { useForm } from "react-hook-form";
import {
  useFolderResources,
  useFolderById,
  useCreateFolder,
  useSoftDeleteFolder,
} from "@/features/folder/hooks/folderHooks";
import { useRouter } from "next/navigation";
import { useCaseResources } from "@/features/cases/hooks/caseHooks";
import type { CaseResourcesQuery } from "@/features/cases/types/casesTypes";
import { useOfficeResources } from "@/features/office/hooks/officeHooks";
import { useClientResources } from "@/features/clients/hooks/clientsHooks";

// ===== helpers =====
const formatDateAr = (date?: string | null) =>
  date ? new Date(date).toLocaleDateString("ar-EG") : "—";

const formatBytes = (bytes?: number | null) => {
  if (bytes == null) return "—";
  const sizes = ["B", "KB", "MB", "GB"];
  let v = bytes;
  let i = 0;
  while (v >= 1024 && i < sizes.length - 1) {
    v = v / 1024;
    i++;
  }
  return `${v.toFixed(i === 0 ? 0 : 1)} ${sizes[i]}`;
};

// to prevent background scroll when modal is open
function useLockBodyScroll(locked: boolean) {
  useEffect(() => {
    if (!locked) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [locked]);
}

function ModalShell({
  title,
  icon: Icon,
  iconClassName = "text-blue-700",
  onClose,
  children,
}: {
  title: string;
  icon?: LucideIcon;
  iconClassName?: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-2xl mx-4 bg-white rounded-2xl border border-gray-200 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur border-b border-gray-100 px-6 py-4 flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center gap-2">
            {Icon ? (
              <span className="inline-flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200/60 shadow-sm">
                <Icon size={18} className={iconClassName} />
              </span>
            ) : null}
            {title}
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-gray-100 text-gray-600 transition-colors"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex items-center justify-center min-h-[55vh]">
      <Loader2 className="animate-spin text-blue-600" size={48} />
    </div>
  );
}

function ErrorState({ message }: { message?: string }) {
  return (
    <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
      <div className="flex items-center justify-center gap-2 text-red-700 font-medium">
        <AlertCircle size={18} />
        {message || "حدث خطأ أثناء جلب البيانات"}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-sm">
      <div className="mx-auto max-w-sm">
        <div className="w-12 h-12 rounded-2xl border border-gray-200 bg-gray-50 flex items-center justify-center mx-auto mb-3">
          <Folder className="text-gray-500" size={20} />
        </div>
        <p className="text-gray-800 font-semibold">لا توجد عناصر بعد.</p>
        <p className="text-sm text-gray-600 mt-1">جرّب إضافة ملف أو مستند.</p>
      </div>
    </div>
  );
}

type FileItem = {
  id: number;
  name: string;
  type: "Document" | "Folder" | string;
  contentType?: string | null;
  size?: number | null;
  userId?: number | null;
  userFullName?: string | null;
  userImageURL?: string | null;
  createdAt?: string | null;
};

// ===== Upload File Form =====
function UploadFileForm({
  entityType,
  entityId,
  folderId,
  onSuccess,
  onCancel,
}: {
  entityType: EntityType;
  entityId: number;
  folderId?: number | null;
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [description, setDescription] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadFileMutation = useUploadFile();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      if (!displayName) {
        setDisplayName(selectedFile.name.replace(/\.[^/.]+$/, ""));
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !displayName.trim()) return;

    uploadFileMutation.mutate(
      {
        file,
        entityType,
        entityId,
        folderId: folderId ?? undefined,
        displayName: displayName.trim(),
        description: description.trim() || undefined,
      },
      {
        onSuccess: (response) => {
          if (response?.succeeded) {
            onSuccess();
          }
        },
      }
    );
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 بايت";
    const sizes = ["بايت", "كيلوبايت", "ميجابايت", "جيجابايت"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* File Drop Zone */}
      <div
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-all"
      >
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileChange}
          className="hidden"
        />
        <Upload className="mx-auto mb-4 text-gray-400" size={40} />
        {file ? (
          <div className="text-gray-700 font-bold">
            <p>{file.name}</p>
            <p className="text-sm text-gray-500 mt-1">
              {formatFileSize(file.size)}
            </p>
          </div>
        ) : (
          <div>
            <p className="text-gray-700 font-bold">
              اضغط لاختيار ملف أو اسحبه هنا
            </p>
            <p className="text-sm text-gray-500 mt-1">
              يمكنك رفع أي نوع من الملفات
            </p>
          </div>
        )}
      </div>

      {/* Display Name */}
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">
          اسم العرض
        </label>
        <input
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="أدخل اسم العرض للملف..."
          className="w-full px-4 py-3.5 bg-gray-50/50 border border-gray-200 rounded-2xl text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary focus:bg-white transition-all"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">
          الوصف (اختياري)
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="أدخل وصف الملف..."
          rows={3}
          className="w-full px-4 py-3.5 bg-gray-50/50 border border-gray-200 rounded-2xl text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary focus:bg-white transition-all resize-none"
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-3 text-sm font-extrabold rounded-2xl text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
        >
          إلغاء
        </button>
        <button
          type="submit"
          disabled={
            !file || !displayName.trim() || uploadFileMutation.isPending
          }
          className="flex-1 px-4 py-3 text-sm font-extrabold rounded-2xl text-white bg-primary hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {uploadFileMutation.isPending ? (
            <>
              <Loader2 className="animate-spin" size={18} />
              جاري الرفع...
            </>
          ) : (
            <>
              <Upload size={18} />
              رفع الملف
            </>
          )}
        </button>
      </div>
    </form>
  );
}

function EditFileForm({
  fileId,
  onSuccess,
  onCancel,
}: {
  fileId: number;
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const { data: fileMetadata, isLoading } = useFileMetadata(fileId, true);
  const updateFileMutation = useUpdateFile();

  const {
    handleSubmit,
    formState: { errors },
    register,
    reset,
  } = useForm<{
    displayName: string;
    description?: string;
  }>({
    defaultValues: {
      displayName: "",
      description: "",
    },
  });

  useEffect(() => {
    if (fileMetadata?.data) {
      reset({
        displayName: fileMetadata.data.displayName || "",
        description: fileMetadata.data.description || "",
      });
    }
  }, [fileMetadata, reset]);

  const onSubmit = (data: { displayName: string; description?: string }) => {
    updateFileMutation.mutate(
      {
        id: fileId,
        displayName: data.displayName,
        description: data.description,
      },
      {
        onSuccess: () => {
          onSuccess();
        },
      }
    );
  };

  const isSubmitting = updateFileMutation.isPending;

  return (
    <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 font-semibold">
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Display Name */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            اسم العرض
          </label>
          <input
            type="text"
            {...register("displayName", { required: "اسم العرض مطلوب" })}
            disabled={isLoading || isSubmitting}
            className="w-full px-4 py-3.5 bg-white border border-gray-200 rounded-2xl text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          />
          {errors.displayName && (
            <p className="mt-1.5 text-sm text-red-600">
              {errors.displayName.message}
            </p>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            الوصف (اختياري)
          </label>
          <textarea
            {...register("description")}
            placeholder="أدخل وصف الملف..."
            rows={3}
            disabled={isLoading || isSubmitting}
            className="w-full px-4 py-3.5 bg-gray-50/50 border border-gray-200 rounded-2xl text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary focus:bg-white transition-all resize-none disabled:opacity-60 disabled:cursor-not-allowed"
          />
        </div>

        {/* Actions */}
        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-5 py-3 rounded-2xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            إلغاء
          </button>

          <button
            type="submit"
            disabled={isLoading || isSubmitting}
            className="px-6 py-3 rounded-2xl bg-primary text-white hover:opacity-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "جارٍ الحفظ..." : "حفظ"}
          </button>
        </div>
      </form>
    </div>
  );
}

// ===== create folder =====
function CreateFolderForm({
  entityType,
  entityId,
  parentFolderId,
  onSuccess,
  onCancel,
}: {
  entityType: EntityType;
  entityId: number;
  parentFolderId?: number | null;
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const createFolder = useCreateFolder();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<{
    name: string;
  }>({
    defaultValues: { name: "" },
  });

  return (
    <form
      onSubmit={handleSubmit((data) => {
        createFolder.mutate(
          {
            name: data.name,
            entityType,
            entityId,
            parentFolderId: parentFolderId ?? null,
          },
          {
            onSuccess: () => {
              onSuccess();
            },
          }
        );
      })}
      className="space-y-6"
    >
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">
          اسم المجلد
        </label>
        <input
          type="text"
          {...register("name", { required: "اسم المجلد مطلوب" })}
          placeholder="أدخل اسم المجلد..."
          className="w-full px-4 py-3.5 bg-gray-50/50 border border-gray-200 rounded-2xl text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary focus:bg-white transition-all"
        />
        {errors.name && (
          <p className="mt-1.5 text-sm text-red-600">{errors.name.message}</p>
        )}
      </div>

      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-3 rounded-2xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 transition-all"
        >
          إلغاء
        </button>

        <button
          type="submit"
          disabled={createFolder.isPending}
          className="px-6 py-3 rounded-2xl bg-primary text-white hover:opacity-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {createFolder.isPending ? "جارٍ الإنشاء..." : "إنشاء المجلد"}
        </button>
      </div>
    </form>
  );
}

// ===== Main FileManager Component =====
interface FileManagerProps {
  entityType: EntityType;
  entityId: number;
  parentFolderId?: number | null;
  title?: string;
  subtitle?: string;
  showCreateFolder?: boolean;
}

export default function FileManager({
  entityType,
  entityId,
  parentFolderId,
  title = "الملفات والمستندات",
  subtitle = "عرض وإدارة الملفات والمجلدات والمستندات.",
  showCreateFolder = true,
}: FileManagerProps) {
  const [search, setSearch] = useState("");
  const [pageNumber, setPageNumber] = useState(1);
  const pageSize = 50;

  const [showAddFileModal, setShowAddFileModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingFileId, setEditingFileId] = useState<number | null>(null);
  const [showAddFolderModal, setShowAddFolderModal] = useState(false);

  useLockBodyScroll(
    showAddFileModal || showEditModal || showAddFolderModal
  );

  const downloadFile = useDownloadFile();
  const softDeleteFile = useSoftDeleteFile();
  const softDeleteFolder = useSoftDeleteFolder();
  const router = useRouter();

  const queryParams = useMemo(() => {
    return {
      PageNumber: pageNumber,
      PageSize: pageSize,
      Search: search.trim() || undefined,
    };
  }, [pageNumber, pageSize, search]);

  // Fetch resources based on entity type
  let resourcesQuery: any;
  if (parentFolderId) {
    // If we're in a folder, use folder resources
    resourcesQuery = useFolderResources(parentFolderId, !!parentFolderId);
  } else if (entityType === "Case") {
    // For Case, use case resources hook - id is passed separately, not in query params
    // Note: CaseResourcesQuery type includes id but it's actually a path param, not a query param
    resourcesQuery = useCaseResources(
      entityId,
      { ...queryParams, id: entityId } as CaseResourcesQuery,
      !!entityId
    );
  } else if (entityType === "Client") {
    resourcesQuery = useClientResources(entityId, queryParams, !!entityId);
  } else if (entityType === "Office") {
    resourcesQuery = useOfficeResources(queryParams as any, {
      enabled: !!entityId,
    });
  } else {
    // For other entity types, we'll need to add hooks as needed
    // For now, use a placeholder
    resourcesQuery = { data: null, isLoading: false, isError: false, refetch: () => {} };
  }

  const {
    data: resourcesData,
    isLoading,
    isError,
    error,
    isFetching,
    refetch,
  } = resourcesQuery;

  const items: FileItem[] = resourcesData?.data?.data ?? [];
  const totalCount: number = resourcesData?.data?.count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  const handlePageChange = (next: number) => {
    if (next < 1 || next > totalPages) return;
    setPageNumber(next);
  };

  return (
    <section className="space-y-6 relative">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowAddFileModal(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark transition"
          >
            <UploadCloud size={16} />
            إضافة ملف
          </button>
          {showCreateFolder && (
            <button
              onClick={() => setShowAddFolderModal(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 transition"
            >
              <FolderPlus size={16} />
              إضافة مجلد
            </button>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="p-6">
        <label className="block text-sm font-bold text-gray-700 mb-2 mr-1">
          بحث
        </label>
        <div className="relative group">
          <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-gray-400 group-focus-within:text-primary transition-colors">
            <Search size={20} />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPageNumber(1);
            }}
            placeholder="ابحث بالاسم..."
            className="w-full pr-12 pl-4 py-3.5 bg-gray-50/50 border border-gray-200 rounded-2xl text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary focus:bg-white transition-all shadow-sm"
          />
        </div>

        {isError && (
          <div className="mt-4 flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 px-3 py-2 rounded-2xl font-bold">
            <Info size={16} />
            حدث خطأ: {error instanceof Error ? error.message : "—"}
          </div>
        )}
      </div>

      {/* Table */}
      {isLoading ? (
        <LoadingState />
      ) : isError ? (
        <ErrorState
          message={error instanceof Error ? error.message : undefined}
        />
      ) : items.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="overflow-hidden rounded-3xl border border-gray-200/60 bg-white/80 backdrop-blur-xl shadow-[0_20px_50px_-20px_rgba(0,0,0,0.1)] ring-1 ring-gray-200/50">
          <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-200">
            <table className="min-w-full border-separate border-spacing-0">
              <thead className="bg-gray-50/50 sticky top-0 z-10 backdrop-blur-md">
                <tr className="text-right text-xs font-bold uppercase tracking-wider text-gray-500">
                  <th className="px-6 py-4 border-b border-gray-100 whitespace-nowrap">
                    رقم
                  </th>
                  <th className="px-6 py-4 border-b border-gray-100">الاسم</th>
                  <th className="px-6 py-4 border-b border-gray-100 whitespace-nowrap">
                    النوع
                  </th>
                  <th className="px-6 py-4 border-b border-gray-100 whitespace-nowrap">
                    الحجم
                  </th>
                  <th className="px-6 py-4 border-b border-gray-100 whitespace-nowrap">
                    بواسطة
                  </th>
                  <th className="px-6 py-4 border-b border-gray-100 whitespace-nowrap">
                    تاريخ الإنشاء
                  </th>
                  <th className="px-6 py-4 border-b border-gray-100 whitespace-nowrap text-center">
                    إجراءات
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-50 bg-transparent">
                {items.map((it) => {
                  const isFolder = String(it.type).toLowerCase() === "folder";
                  return (
                    <tr
                      key={it.id}
                      className="group transition-all duration-200 hover:bg-primary/2"
                    >
                      {/* ID */}
                      <td className="px-6 py-5 whitespace-nowrap">
                        <span className="font-mono text-sm font-bold text-primary bg-primary/5 px-3 py-1.5 rounded-xl border border-primary/10 group-hover:bg-primary/10 transition-colors">
                          {it.id}
                        </span>
                      </td>

                      {/* Name */}
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3 max-w-95">
                          <span className="inline-flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200/60 shadow-sm">
                            {isFolder ? (
                              <Folder size={18} className="text-blue-700" />
                            ) : (
                              <FileText size={18} className="text-blue-700" />
                            )}
                          </span>

                          <div className="min-w-0">
                            <div
                              className="font-bold text-gray-900 leading-tight truncate max-w-[520px]"
                              title={it.name}
                            >
                              {it.name}
                            </div>
                            <div className="mt-1 text-xs text-gray-500 font-semibold truncate max-w-[520px]">
                              {it.contentType || "—"}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Type */}
                      <td className="px-6 py-5 whitespace-nowrap">
                        <span
                          className={[
                            "inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold border uppercase",
                            isFolder
                              ? "bg-emerald-50 text-emerald-700 border-emerald-100/50"
                              : "bg-indigo-50 text-indigo-700 border-indigo-100/50",
                          ].join(" ")}
                        >
                          {isFolder ? "Folder" : "Document"}
                        </span>
                      </td>

                      {/* Size */}
                      <td className="px-6 py-5 whitespace-nowrap text-sm font-medium text-gray-600">
                        {isFolder ? "—" : formatBytes(it.size)}
                      </td>

                      {/* User */}
                      <td className="px-6 py-5 whitespace-nowrap text-sm font-medium text-gray-600">
                        {it.userFullName || "—"}
                      </td>

                      {/* Created */}
                      <td className="px-6 py-5 whitespace-nowrap text-sm font-medium text-gray-600">
                        {formatDateAr(it.createdAt)}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-5">
                        <div className="flex items-center justify-center gap-2">
                          {!isFolder ? (
                            <>
                              <button
                                type="button"
                                title="تحميل"
                                disabled={downloadFile.isPending}
                                onClick={() => downloadFile.mutate(it.id)}
                                className="group inline-flex items-center justify-center w-10 h-10 rounded-2xl border border-blue-200/70 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:border-blue-300 transition-all focus:outline-none focus:ring-4 focus:ring-blue-200/70 active:scale-[0.98] disabled:opacity-50"
                              >
                                {downloadFile.isPending ? (
                                  <Loader2 size={16} className="animate-spin" />
                                ) : (
                                  <Download size={16} />
                                )}
                              </button>
                              <button
                                type="button"
                                title="تعديل"
                                disabled={softDeleteFile.isPending}
                                onClick={() => {
                                  setEditingFileId(it.id);
                                  setShowEditModal(true);
                                }}
                                className="group inline-flex items-center justify-center w-10 h-10 rounded-2xl border border-blue-200/70 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:border-blue-300 transition-all focus:outline-none focus:ring-4 focus:ring-blue-200/70 active:scale-[0.98] disabled:opacity-50"
                              >
                                {softDeleteFile.isPending ? (
                                  <Loader2 size={16} className="animate-spin" />
                                ) : (
                                  <Edit2 size={16} />
                                )}
                              </button>
                              <button
                                type="button"
                                title="حذف مؤقت"
                                disabled={softDeleteFile.isPending}
                                onClick={() => {
                                  if (
                                    window.confirm(
                                      `هل تريد حذف "${it.name}" مؤقتاً؟`
                                    )
                                  ) {
                                    softDeleteFile.mutate(it.id, {
                                      onSuccess: () => refetch(),
                                    });
                                  }
                                }}
                                className="group inline-flex items-center justify-center w-10 h-10 rounded-2xl border border-orange-200/70 bg-orange-50 text-orange-700 hover:bg-orange-100 hover:border-orange-300 transition-all focus:outline-none focus:ring-4 focus:ring-orange-200/70 active:scale-[0.98] disabled:opacity-50"
                              >
                                {softDeleteFile.isPending ? (
                                  <Loader2 size={16} className="animate-spin" />
                                ) : (
                                  <Trash2 size={16} />
                                )}
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                type="button"
                                title="عرض محتوى المجلد"
                                disabled={softDeleteFolder.isPending}
                                onClick={() => {
                                  router.push(`/dashboard/files/${it.id}`);
                                }}
                                className="group inline-flex items-center justify-center w-10 h-10 rounded-2xl border border-blue-200/70 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:border-blue-300 transition-all focus:outline-none focus:ring-4 focus:ring-blue-200/70 active:scale-[0.98] disabled:opacity-50"
                              >
                                <FolderOpen size={16} className="text-blue-700" />
                              </button>
                              <button
                                type="button"
                                title="حذف مؤقت"
                                disabled={softDeleteFolder.isPending}
                                onClick={() => {
                                  if (
                                    window.confirm(
                                      `هل تريد حذف "${it.name}" مؤقتاً؟`
                                    )
                                  ) {
                                    softDeleteFolder.mutate(it.id, {
                                      onSuccess: () => refetch(),
                                    });
                                  }
                                }}
                                className="group inline-flex items-center justify-center w-10 h-10 rounded-2xl border border-orange-200/70 bg-orange-50 text-orange-700 hover:bg-orange-100 hover:border-orange-300 transition-all focus:outline-none focus:ring-4 focus:ring-orange-200/70 active:scale-[0.98] disabled:opacity-50"
                              >
                                {softDeleteFolder.isPending ? (
                                  <Loader2 size={16} className="animate-spin" />
                                ) : (
                                  <Trash2 size={16} />
                                )}
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col md:flex-row items-center justify-between gap-5 rounded-3xl border border-gray-200/60 bg-white/80 backdrop-blur-xl px-6 py-4 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.1)] ring-1 ring-gray-200/50 mt-6">
          <div className="text-sm font-medium text-gray-500">
            صفحة <span className="font-bold text-gray-900">{pageNumber}</span> من{" "}
            <span className="font-bold text-gray-900">{totalPages}</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => handlePageChange(pageNumber - 1)}
              disabled={pageNumber <= 1}
              className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl border border-gray-200 bg-white text-sm font-bold text-gray-600 transition-all hover:border-primary/30 hover:bg-primary/5 hover:text-primary disabled:opacity-30 disabled:pointer-events-none active:scale-95 shadow-sm"
            >
              <ChevronRight
                size={18}
                className="transition-transform group-hover:translate-x-1"
              />
              السابق
            </button>

            <button
              onClick={() => handlePageChange(pageNumber + 1)}
              disabled={pageNumber >= totalPages}
              className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl border border-gray-200 bg-white text-sm font-bold text-gray-600 transition-all hover:border-primary/30 hover:bg-primary/5 hover:text-primary disabled:opacity-30 disabled:pointer-events-none active:scale-95 shadow-sm"
            >
              التالي
              <ChevronLeft
                size={18}
                className="transition-transform group-hover:-translate-x-1"
              />
            </button>
          </div>
        </div>
      )}

      {/* Add File Modal */}
      {showAddFileModal && (
        <ModalShell
          title="إضافة ملف جديد"
          icon={UploadCloud}
          iconClassName="text-blue-700"
          onClose={() => setShowAddFileModal(false)}
        >
          <UploadFileForm
            entityType={entityType}
            entityId={entityId}
            folderId={parentFolderId ?? undefined}
            onSuccess={() => {
              setShowAddFileModal(false);
              refetch();
            }}
            onCancel={() => setShowAddFileModal(false)}
          />
        </ModalShell>
      )}

      {/* Edit File Modal */}
      {showEditModal && editingFileId !== null && (
        <ModalShell
          title="تعديل الملف"
          icon={Edit2}
          iconClassName="text-blue-700"
          onClose={() => {
            setShowEditModal(false);
            setEditingFileId(null);
          }}
        >
          <EditFileForm
            fileId={editingFileId}
            onSuccess={() => {
              setShowEditModal(false);
              setEditingFileId(null);
              refetch();
            }}
            onCancel={() => {
              setShowEditModal(false);
              setEditingFileId(null);
            }}
          />
        </ModalShell>
      )}

      {/* Add Folder Modal */}
      {showAddFolderModal && (
        <ModalShell
          title="إنشاء مجلد جديد"
          icon={FolderPlus}
          iconClassName="text-green-700"
          onClose={() => setShowAddFolderModal(false)}
        >
          <CreateFolderForm
            entityType={entityType}
            entityId={entityId}
            parentFolderId={parentFolderId ?? null}
            onSuccess={() => {
              setShowAddFolderModal(false);
              refetch();
            }}
            onCancel={() => setShowAddFolderModal(false)}
          />
        </ModalShell>
      )}
    </section>
  );
}

