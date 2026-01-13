"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import type { LucideIcon } from "lucide-react";
import Image from "next/image";
import {
  FolderOpen,
  FileText,
  X,
  Loader2,
  Trash2,
  Search,
  SlidersHorizontal,
  ChevronDown,
  Check,
  Upload,
  Download,
  FolderPlus,
  File,
  Folder,
  ArrowUp,
} from "lucide-react";

import {
  useFolderResources,
  useFolderById,
  useCreateFolder,
  useSoftDeleteFolder,
  useHardDeleteFolder,
  folderQueryKeys,
} from "@/features/folder/hooks/folderHooks";

import {
  useUploadFile,
  useDownloadFile,
  useSoftDeleteFile,
  useHardDeleteFile,
} from "@/features/fileAtt/hooks/fileAttHooks";

import PageHeader from "@/shared/components/dashboard/PageHeader";
import type {
  FolderResource,
  CreateFolderRequest,
  EntityType,
} from "@/features/folder/types/folderTypes";
import type { UploadFileRequest } from "@/features/fileAtt/types/fileAttTypes";
import { useQueryClient } from "@tanstack/react-query";

// ===========================
// Constants
// ===========================

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

const ENTITY_TYPE_OPTIONS: { value: EntityType; label: string }[] = [
  { value: "Case", label: "قضية" },
  { value: "Client", label: "عميل" },
  { value: "Session", label: "جلسة" },
  { value: "Task", label: "مهمة" },
  { value: "Court", label: "محكمة" },
];

// ===========================
// Utilities
// ===========================

function formatDateAr(date?: string | null) {
  return date ? new Date(date).toLocaleDateString("ar-EG") : "—";
}

function formatFileSize(bytes: number) {
  if (bytes === 0) return "0 بايت";
  const sizes = ["بايت", "كيلوبايت", "ميجابايت", "جيجابايت"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
}

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

// ===========================
// Reusable Components
// ===========================

type Opt = { label: string; value: string | number };

type CustomSelectProps = {
  label: string;
  value: string | number | "";
  options: Opt[];
  placeholder?: string;
  onChange: (val: string | number | "") => void;
};

function CustomSelect({
  label,
  value,
  options,
  placeholder = "الكل",
  onChange,
}: CustomSelectProps) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const wrapRef = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => String(o.value) === String(value));
  const shownLabel =
    value === "" ? placeholder : selected?.label ?? placeholder;

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    if (!qq) return options;
    return options.filter((o) => o.label.toLowerCase().includes(qq));
  }, [q, options]);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  return (
    <div ref={wrapRef} className="relative" dir="rtl">
      <label className="block text-sm font-bold text-gray-700 mb-2 mr-1">
        {label}
      </label>

      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className={`w-full flex items-center justify-between gap-3 px-4 py-3.5 rounded-2xl border transition-all ${
          open
            ? "bg-white border-primary/40 ring-4 ring-primary/10"
            : "bg-gray-50/60 border-gray-200 hover:bg-white"
        }`}
      >
        <span className="text-gray-800 font-bold truncate">{shownLabel}</span>
        <ChevronDown
          size={18}
          className={`text-gray-400 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div className="absolute left-0 right-0 mt-3 z-50 rounded-3xl bg-white/95 backdrop-blur-xl border border-gray-200/70 shadow-[0_30px_70px_-30px_rgba(0,0,0,0.3)] overflow-hidden">
          <div className="p-3 border-b border-gray-100">
            <div className="relative">
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 pointer-events-none">
                <Search size={16} />
              </div>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="ابحث..."
                className="w-full pr-9 pl-3 py-2.5 rounded-2xl bg-gray-50/70 border border-gray-200 text-sm font-semibold text-gray-700 placeholder:text-gray-400 outline-none focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 appearance-none"
              />
            </div>
          </div>

          <div className="max-h-72 overflow-auto p-2">
            <OptionRow
              active={value === ""}
              label={placeholder}
              onClick={() => {
                onChange("");
                setOpen(false);
                setQ("");
              }}
            />

            {filtered.map((o) => (
              <OptionRow
                key={String(o.value)}
                active={String(value) === String(o.value)}
                label={o.label}
                onClick={() => {
                  onChange(o.value);
                  setOpen(false);
                  setQ("");
                }}
              />
            ))}

            {filtered.length === 0 && (
              <div className="p-4 text-sm font-bold text-gray-500 text-center">
                لا توجد نتائج
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function OptionRow({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${
        active
          ? "bg-primary/10 text-primary"
          : "text-gray-700 hover:bg-gray-100/70"
      }`}
    >
      <span className="truncate">{label}</span>
      {active && <Check size={16} className="shrink-0" />}
    </button>
  );
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
              <span className="inline-flex items-center justify-center w-10 h-10 rounded-2xl bg-linear-to-br from-blue-50 to-indigo-50 border border-blue-200/60 shadow-sm">
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
            <X size={18} />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

function IconButton({
  title,
  onClick,
  disabled,
  variant = "neutral",
  children,
}: {
  title: string;
  onClick: () => void;
  disabled?: boolean;
  variant?: "neutral" | "green" | "orange" | "red" | "blue" | "purple";
  children: React.ReactNode;
}) {
  const variants: Record<string, string> = {
    neutral:
      "border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-300",
    blue: "border-blue-200/70 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:border-blue-300",
    green:
      "border-emerald-200/70 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:border-emerald-300",
    orange:
      "border-orange-200/70 bg-orange-50 text-orange-700 hover:bg-orange-100 hover:border-orange-300",
    red: "border-red-200/70 bg-red-50 text-red-700 hover:bg-red-100 hover:border-red-300",
    purple:
      "border-purple-200/70 bg-purple-50 text-purple-700 hover:bg-purple-100 hover:border-purple-300",
  };

  const glow: Record<string, string> = {
    neutral: "hover:shadow-sm",
    blue: "hover:shadow-[0_10px_25px_-15px_rgba(59,130,246,0.7)]",
    green: "hover:shadow-[0_10px_25px_-15px_rgba(16,185,129,0.7)]",
    orange: "hover:shadow-[0_10px_25px_-15px_rgba(249,115,22,0.7)]",
    red: "hover:shadow-[0_10px_25px_-15px_rgba(239,68,68,0.7)]",
    purple: "hover:shadow-[0_10px_25px_-15px_rgba(168,85,247,0.7)]",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={[
        "group inline-flex items-center justify-center w-10 h-10 rounded-2xl border transition-all",
        "focus:outline-none focus:ring-4 focus:ring-blue-200/70",
        "active:scale-[0.98]",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        variants[variant],
        glow[variant],
      ].join(" ")}
    >
      <span className="transition-transform group-hover:scale-[1.06]">
        {children}
      </span>
    </button>
  );
}

function ResourceTypeBadge({ type }: { type: string }) {
  const isFolder = type.toLowerCase() === "folder";
  const Icon = isFolder ? Folder : File;

  return (
    <span
      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold border shadow-sm ${
        isFolder
          ? "bg-amber-50 text-amber-700 border-amber-200"
          : "bg-blue-50 text-blue-700 border-blue-200"
      }`}
    >
      <Icon size={14} />
      {isFolder ? "مجلد" : "ملف"}
    </span>
  );
}

// ===========================
// Create Folder Form
// ===========================

interface CreateFolderFormProps {
  entityType: EntityType;
  entityId: number;
  parentFolderId?: number;
  onSuccess: () => void;
  onCancel: () => void;
}

function CreateFolderForm({
  entityType,
  entityId,
  parentFolderId,
  onSuccess,
  onCancel,
}: CreateFolderFormProps) {
  const [name, setName] = useState("");
  const createFolder = useCreateFolder();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const data: CreateFolderRequest = {
      name: name.trim(),
      entityType,
      entityId,
      parentFolderId,
    };

    createFolder.mutate(data, {
      onSuccess: (response) => {
        if (response?.succeeded) {
          onSuccess();
        }
      },
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">
          اسم المجلد
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="أدخل اسم المجلد..."
          className="w-full px-4 py-3.5 bg-gray-50/50 border border-gray-200 rounded-2xl text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary focus:bg-white transition-all"
          autoFocus
        />
      </div>

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
          disabled={!name.trim() || createFolder.isPending}
          className="flex-1 px-4 py-3 text-sm font-extrabold rounded-2xl text-white bg-primary hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {createFolder.isPending ? (
            <Loader2 className="animate-spin mx-auto" size={20} />
          ) : (
            "إنشاء المجلد"
          )}
        </button>
      </div>
    </form>
  );
}

// ===========================
// Upload File Form
// ===========================

interface UploadFileFormProps {
  entityType: EntityType;
  entityId: number;
  folderId?: number;
  onSuccess: () => void;
  onCancel: () => void;
}

function UploadFileForm({
  entityType,
  entityId,
  folderId,
  onSuccess,
  onCancel,
}: UploadFileFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [description, setDescription] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadFile = useUploadFile();

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

    const data: UploadFileRequest = {
      file,
      entityType,
      entityId,
      folderId,
      displayName: displayName.trim(),
      description: description.trim() || undefined,
    };

    uploadFile.mutate(data, {
      onSuccess: (response) => {
        if (response?.succeeded) {
          onSuccess();
        }
      },
    });
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
          disabled={!file || !displayName.trim() || uploadFile.isPending}
          className="flex-1 px-4 py-3 text-sm font-extrabold rounded-2xl text-white bg-primary hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploadFile.isPending ? (
            <Loader2 className="animate-spin mx-auto" size={20} />
          ) : (
            "رفع الملف"
          )}
        </button>
      </div>
    </form>
  );
}

// ===========================
// Main Component
// ===========================

export default function FilesPage() {
  const queryClient = useQueryClient();

  // Current folder navigation state
  const [currentFolderId, setCurrentFolderId] = useState<number>(1); // Root folder ID
  const [folderHistory, setFolderHistory] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [pageSize, setPageSize] = useState(20);
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Entity context (for creating folders/uploading files)
  const [entityType, setEntityType] = useState<EntityType>("Case");
  const entityId = 1; // Default entity ID

  // Modal states
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);
  const [showUploadFileModal, setShowUploadFileModal] = useState(false);

  useLockBodyScroll(showCreateFolderModal || showUploadFileModal);

  // Mutations
  const softDeleteFolder = useSoftDeleteFolder();
  const hardDeleteFolder = useHardDeleteFolder();
  const softDeleteFile = useSoftDeleteFile();
  const hardDeleteFile = useHardDeleteFile();
  const downloadFile = useDownloadFile();

  // Queries
  const { data: folderData, isLoading: folderLoading } = useFolderById(
    currentFolderId,
    true
  );
  const {
    data: resourcesData,
    isLoading: resourcesLoading,
    isFetching,
    refetch,
  } = useFolderResources(currentFolderId, true);

  const currentFolder = folderData?.data;
  const totalCount = resourcesData?.data?.count ?? 0;

  // Filter resources by search query
  const filteredResources = useMemo(() => {
    const resources: FolderResource[] = resourcesData?.data?.data ?? [];
    if (!searchQuery.trim()) return resources;
    const query = searchQuery.toLowerCase();
    return resources.filter((r) => r.name.toLowerCase().includes(query));
  }, [resourcesData?.data?.data, searchQuery]);

  // Navigation handlers
  const navigateToFolder = (folderId: number) => {
    setFolderHistory((prev) => [...prev, currentFolderId]);
    setCurrentFolderId(folderId);
  };

  const navigateBack = () => {
    if (folderHistory.length === 0) return;
    const previousFolderId = folderHistory[folderHistory.length - 1];
    setFolderHistory((prev) => prev.slice(0, -1));
    setCurrentFolderId(previousFolderId);
  };

  // Action handlers
  const handleResourceClick = (resource: FolderResource) => {
    if (resource.type.toLowerCase() === "folder") {
      navigateToFolder(resource.id);
    } else {
      // Download file
      downloadFile.mutate(resource.id);
    }
  };

  const handleSoftDeleteResource = (resource: FolderResource) => {
    const isFolder = resource.type.toLowerCase() === "folder";
    const message = isFolder
      ? `هل تريد أرشفة المجلد "${resource.name}"؟`
      : `هل تريد أرشفة الملف "${resource.name}"؟`;

    if (window.confirm(message)) {
      if (isFolder) {
        softDeleteFolder.mutate(resource.id, {
          onSuccess: () => {
            queryClient.invalidateQueries({
              queryKey: folderQueryKeys.resources(currentFolderId),
            });
          },
        });
      } else {
        softDeleteFile.mutate(resource.id, {
          onSuccess: () => {
            queryClient.invalidateQueries({
              queryKey: folderQueryKeys.resources(currentFolderId),
            });
          },
        });
      }
    }
  };

  const handleHardDeleteResource = (resource: FolderResource) => {
    const isFolder = resource.type.toLowerCase() === "folder";
    const message = isFolder
      ? `⚠️ تحذير: هل أنت متأكد من حذف المجلد "${resource.name}" نهائياً؟`
      : `⚠️ تحذير: هل أنت متأكد من حذف الملف "${resource.name}" نهائياً؟`;

    if (window.confirm(message)) {
      if (isFolder) {
        hardDeleteFolder.mutate(resource.id, {
          onSuccess: () => {
            queryClient.invalidateQueries({
              queryKey: folderQueryKeys.resources(currentFolderId),
            });
          },
        });
      } else {
        hardDeleteFile.mutate(resource.id, {
          onSuccess: () => {
            queryClient.invalidateQueries({
              queryKey: folderQueryKeys.resources(currentFolderId),
            });
          },
        });
      }
    }
  };

  const handleCreateFolderSuccess = () => {
    setShowCreateFolderModal(false);
    queryClient.invalidateQueries({
      queryKey: folderQueryKeys.resources(currentFolderId),
    });
  };

  const handleUploadFileSuccess = () => {
    setShowUploadFileModal(false);
    queryClient.invalidateQueries({
      queryKey: folderQueryKeys.resources(currentFolderId),
    });
  };

  const isLoading = folderLoading || resourcesLoading;

  return (
    <section className="space-y-6 relative">
      {/* Soft premium background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-amber-200/40 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-blue-200/40 blur-3xl" />
        <div className="absolute inset-0 bg-linear-to-b from-slate-50 via-white to-white" />
      </div>

      <PageHeader
        title="إدارة الملفات"
        subtitle="تصفح وإدارة الملفات والمجلدات الخاصة بالقضايا والعملاء."
        icon={FolderOpen}
        isFetching={isFetching}
        countLabel={`${totalCount} عنصر`}
        customActions={[
          {
            label: "مجلد جديد",
            onClick: () => setShowCreateFolderModal(true),
            icon: FolderPlus,
            variant: "secondary",
          },
          {
            label: "رفع ملف",
            onClick: () => setShowUploadFileModal(true),
            icon: Upload,
            variant: "primary",
          },
        ]}
      />

      {/* Breadcrumb / Navigation */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-3">
        {folderHistory.length > 0 && (
          <button
            onClick={navigateBack}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-sm transition-colors"
          >
            <ArrowUp size={16} />
            رجوع
          </button>
        )}
        <div className="flex items-center gap-2 text-gray-600">
          <FolderOpen size={20} className="text-primary" />
          <span className="font-bold text-gray-900">
            {currentFolder?.name || "المجلد الرئيسي"}
          </span>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end">
          {/* Search Input */}
          <div className="lg:col-span-9">
            <label className="block text-sm font-bold text-gray-700 mb-2 mr-1">
              بحث في المحتوى
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-gray-400 group-focus-within:text-primary transition-colors">
                <Search size={20} />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث باسم الملف أو المجلد..."
                className="w-full pr-12 pl-4 py-3.5 bg-gray-50/50 border border-gray-200 rounded-2xl text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary focus:bg-white transition-all shadow-sm"
              />
            </div>
          </div>

          {/* Filters Button */}
          <div className="lg:col-span-3 relative">
            <button
              type="button"
              onClick={() => setFiltersOpen((p) => !p)}
              className={`w-full h-13 flex items-center justify-between gap-3 px-5 rounded-2xl border font-extrabold transition-all ${
                filtersOpen
                  ? "bg-white border-primary/40 ring-4 ring-primary/10"
                  : "bg-gray-50/50 border-gray-200 hover:bg-white"
              }`}
            >
              <span className="flex items-center gap-2 text-gray-700">
                <SlidersHorizontal size={18} className="text-primary" />
                الإعدادات
              </span>
              <ChevronDown
                size={18}
                className={`transition-transform ${
                  filtersOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {filtersOpen && (
              <>
                <button
                  type="button"
                  onClick={() => setFiltersOpen(false)}
                  className="fixed inset-0 z-40 cursor-default"
                />

                <div className="absolute left-0 right-0 mt-3 z-50 rounded-3xl bg-white/95 backdrop-blur-xl border border-gray-200/70 shadow-[0_30px_70px_-30px_rgba(0,0,0,0.3)]">
                  <div className="p-5 grid grid-cols-1 gap-5">
                    {/* Page Size */}
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        عدد العناصر
                      </label>
                      <div className="inline-flex p-1.5 bg-gray-100/80 rounded-2xl">
                        {PAGE_SIZE_OPTIONS.map((size) => {
                          const active = pageSize === size;
                          return (
                            <button
                              key={size}
                              type="button"
                              onClick={() => setPageSize(size)}
                              className={`px-4 py-2 text-sm font-bold rounded-xl transition-all ${
                                active
                                  ? "bg-white text-primary shadow-sm"
                                  : "text-gray-500 hover:text-gray-700"
                              }`}
                            >
                              {size}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Entity Type Selection */}
                    <CustomSelect
                      label="نوع الكيان"
                      value={entityType}
                      options={ENTITY_TYPE_OPTIONS}
                      placeholder="اختر النوع"
                      onChange={(val) => setEntityType(val as EntityType)}
                    />

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => refetch()}
                        className="flex-1 px-4 py-3 text-sm font-extrabold rounded-2xl text-gray-700 bg-gray-100 hover:bg-gray-200"
                      >
                        {isFetching ? "جاري التحديث..." : "تحديث"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setFiltersOpen(false)}
                        className="flex-1 px-4 py-3 text-sm font-extrabold rounded-2xl text-white bg-primary hover:bg-primary-dark"
                      >
                        تم
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Resources Grid/Table */}
      <div className="overflow-hidden rounded-3xl border border-gray-200/60 bg-white/80 backdrop-blur-xl shadow-[0_20px_50px_-20px_rgba(0,0,0,0.1)] ring-1 ring-gray-200/50">
        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-200">
          <table className="min-w-full border-separate border-spacing-0">
            <thead className="bg-gray-50/50 sticky top-0 z-10 backdrop-blur-md">
              <tr className="text-right text-xs font-bold uppercase tracking-wider text-gray-500">
                <th className="px-6 py-4 border-b border-gray-100 whitespace-nowrap">
                  النوع
                </th>
                <th className="px-6 py-4 border-b border-gray-100">الاسم</th>
                <th className="px-6 py-4 border-b border-gray-100 whitespace-nowrap">
                  الحجم
                </th>
                <th className="px-6 py-4 border-b border-gray-100 whitespace-nowrap">
                  المستخدم
                </th>
                <th className="px-6 py-4 border-b border-gray-100 whitespace-nowrap text-center">
                  تاريخ الإنشاء
                </th>
                <th className="px-6 py-4 border-b border-gray-100 whitespace-nowrap text-center">
                  الإجراءات
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-50 bg-transparent">
              {isLoading ? (
                [...Array(6)].map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    {[...Array(6)].map((__, cellIdx) => (
                      <td key={cellIdx} className="px-6 py-5">
                        <div
                          className={`h-4 rounded-lg bg-gray-100 ${
                            cellIdx === 1 ? "w-48" : "w-full"
                          }`}
                        />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filteredResources.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-24 text-center">
                    <div className="flex flex-col items-center">
                      <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-gray-50 text-gray-400 ring-8 ring-gray-50/50">
                        <FolderOpen size={40} strokeWidth={1.5} />
                      </div>
                      <p className="text-lg font-bold text-gray-900">
                        لا توجد ملفات أو مجلدات
                      </p>
                      <p className="mt-2 text-sm font-semibold text-gray-500 max-w-sm">
                        ابدأ بإنشاء مجلد جديد أو رفع ملف
                      </p>
                      <div className="mt-6 flex gap-3">
                        <button
                          onClick={() => setShowCreateFolderModal(true)}
                          className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold rounded-2xl text-primary bg-primary/10 hover:bg-primary/20 transition-colors"
                        >
                          <FolderPlus size={18} />
                          مجلد جديد
                        </button>
                        <button
                          onClick={() => setShowUploadFileModal(true)}
                          className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold rounded-2xl text-white bg-primary hover:bg-primary-dark transition-colors"
                        >
                          <Upload size={18} />
                          رفع ملف
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredResources.map((resource) => (
                  <tr
                    key={`${resource.type}-${resource.id}`}
                    className="group hover:bg-linear-to-l hover:from-gray-50/80 hover:to-transparent transition-colors cursor-pointer"
                    onClick={() => handleResourceClick(resource)}
                  >
                    <td className="px-6 py-4">
                      <ResourceTypeBadge type={resource.type} />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                            resource.type.toLowerCase() === "folder"
                              ? "bg-amber-100 text-amber-600"
                              : "bg-blue-100 text-blue-600"
                          }`}
                        >
                          {resource.type.toLowerCase() === "folder" ? (
                            <Folder size={20} />
                          ) : (
                            <FileText size={20} />
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">
                            {resource.name}
                          </p>
                          {resource.contentType && (
                            <p className="text-xs text-gray-500">
                              {resource.contentType}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600 font-semibold">
                      {resource.size > 0 ? formatFileSize(resource.size) : "—"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {resource.userImageUrl ? (
                          <Image
                            src={resource.userImageUrl}
                            alt={resource.userFullName}
                            width={32}
                            height={32}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                            <FileText size={14} />
                          </div>
                        )}
                        <span className="text-sm font-semibold text-gray-700">
                          {resource.userFullName || "—"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center text-gray-600 font-semibold">
                      {formatDateAr(resource.createdAt)}
                    </td>
                    <td className="px-6 py-4">
                      <div
                        className="flex items-center justify-center gap-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {resource.type.toLowerCase() !== "folder" && (
                          <IconButton
                            title="تحميل"
                            onClick={() => downloadFile.mutate(resource.id)}
                            variant="blue"
                            disabled={downloadFile.isPending}
                          >
                            <Download size={16} />
                          </IconButton>
                        )}
                        <IconButton
                          title="أرشفة"
                          onClick={() => handleSoftDeleteResource(resource)}
                          variant="orange"
                        >
                          <Trash2 size={16} />
                        </IconButton>
                        <IconButton
                          title="حذف نهائي"
                          onClick={() => handleHardDeleteResource(resource)}
                          variant="red"
                        >
                          <Trash2 size={16} />
                        </IconButton>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Folder Modal */}
      {showCreateFolderModal && (
        <ModalShell
          title="إنشاء مجلد جديد"
          icon={FolderPlus}
          iconClassName="text-amber-600"
          onClose={() => setShowCreateFolderModal(false)}
        >
          <CreateFolderForm
            entityType={entityType}
            entityId={entityId}
            parentFolderId={currentFolderId}
            onSuccess={handleCreateFolderSuccess}
            onCancel={() => setShowCreateFolderModal(false)}
          />
        </ModalShell>
      )}

      {/* Upload File Modal */}
      {showUploadFileModal && (
        <ModalShell
          title="رفع ملف جديد"
          icon={Upload}
          iconClassName="text-blue-600"
          onClose={() => setShowUploadFileModal(false)}
        >
          <UploadFileForm
            entityType={entityType}
            entityId={entityId}
            folderId={currentFolderId}
            onSuccess={handleUploadFileSuccess}
            onCancel={() => setShowUploadFileModal(false)}
          />
        </ModalShell>
      )}
    </section>
  );
}
