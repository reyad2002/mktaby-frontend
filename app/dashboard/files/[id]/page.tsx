"use client";

import React, { useMemo } from "react";
import { useParams } from "next/navigation";
import {
  FileText,
  HardDrive,
  Users,
  Clock3,
  FolderOpen,
  AlertCircle,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import {
  useFolderById,
  useFolderResources,
} from "@/features/folder/hooks/folderHooks";
import type { FolderResource } from "@/features/folder/types/folderTypes";
import PageHeader from "@/shared/components/dashboard/PageHeader";
import {
  SkeletonCard,
  SkeletonStatsCard,
} from "@/shared/components/ui/Skeleton";
import FileManager from "@/features/fileAtt/components/FileManager";

const formatBytes = (bytes?: number) => {
  if (!bytes || bytes <= 0) return "—";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const index = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1
  );
  const value = bytes / 1024 ** index;
  return `${value.toFixed(value >= 10 ? 0 : 1)} ${units[index]}`;
};

const formatDate = (value?: string) => {
  if (!value) return "—";
  return new Date(value).toLocaleString("ar-EG", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

type StatCardProps = {
  label: string;
  value: string;
  helper: string;
  icon: LucideIcon;
  tone?: "primary" | "amber" | "emerald" | "indigo";
};

const toneStyles: Record<NonNullable<StatCardProps["tone"]>, string> = {
  primary:
    "from-primary/10 via-primary/5 to-primary/0 text-primary border-primary/20",
  amber:
    "from-amber-400/10 via-amber-300/10 to-amber-200/5 text-amber-600 border-amber-200/70",
  emerald:
    "from-emerald-400/10 via-emerald-300/10 to-emerald-200/5 text-emerald-600 border-emerald-200/70",
  indigo:
    "from-indigo-400/10 via-indigo-300/10 to-indigo-200/5 text-indigo-600 border-indigo-200/70",
};

const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  helper,
  icon: Icon,
  tone = "primary",
}) => {
  return (
    <div className="relative overflow-hidden rounded-2xl border bg-white shadow-sm">
      <div
        className={`absolute inset-0 bg-gradient-to-br ${toneStyles[tone]} opacity-60`}
        aria-hidden
      />
      <div className="relative p-5 space-y-2">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-semibold text-gray-600">{label}</p>
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-white/80 backdrop-blur border border-white/60 shadow-sm">
            <Icon size={20} />
          </span>
        </div>
        <div className="flex items-baseline gap-2">
          <p className="text-2xl font-extrabold text-gray-900">{value}</p>
        </div>
        <p className="text-xs font-bold text-gray-500">{helper}</p>
      </div>
    </div>
  );
};

const FileCard: React.FC<{ resource: FolderResource }> = ({ resource }) => {
  const extension = resource.name.split(".").pop() || resource.type;
  const initials = resource.userFullName
    ? resource.userFullName
        .split(" ")
        .map((part) => part.charAt(0))
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "?";

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white/90 backdrop-blur shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_60px_-35px_rgba(0,0,0,0.45)]">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-primary/0 to-primary/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <div className="relative p-5 space-y-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary font-extrabold shadow-inner">
              {extension?.toUpperCase()}
            </div>
            <div>
              <p className="line-clamp-1 text-lg font-semibold text-gray-900">
                {resource.name}
              </p>
              <p className="text-xs font-bold text-gray-500">
                {resource.contentType}
              </p>
            </div>
          </div>

          <span className="inline-flex items-center gap-2 rounded-full bg-gray-50 px-3 py-1 text-xs font-bold text-gray-600 border border-gray-200">
            <FileText size={14} />
            {resource.type}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm font-semibold text-gray-700">
          <div className="flex items-center gap-2">
            <HardDrive size={16} className="text-primary" />
            <span className="text-gray-500">الحجم</span>
            <span className="text-gray-900">{formatBytes(resource.size)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock3 size={16} className="text-primary" />
            <span className="text-gray-500">تمت الإضافة</span>
            <span className="text-gray-900">
              {formatDate(resource.createdAt)}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 rounded-xl bg-gray-50/70 px-4 py-3 border border-gray-100">
          <div className="flex items-center gap-3">
            {resource.userImageUrl ? (
              <img
                src={resource.userImageUrl}
                alt={resource.userFullName || ""}
                className="h-10 w-10 rounded-full object-cover border border-white shadow-sm"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-bold border border-white">
                {initials}
              </div>
            )}
            <div>
              <p className="text-sm font-bold text-gray-900">
                {resource.userFullName}
              </p>
              <p className="text-xs font-semibold text-gray-500">المالك</p>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-primary border border-primary/10 shadow-sm">
            <FolderOpen size={14} />
            الملف داخل هذا المجلد
          </div>
        </div>
      </div>
    </div>
  );
};

const Page = () => {
  const params = useParams<{ id: string }>();
  const folderId = Number(params?.id);
  const isValidId = Number.isFinite(folderId);

  const { data, isLoading, isFetching, error, refetch } = useFolderResources(
    folderId,
    isValidId
  );
  const { data: folderInfo } = useFolderById(folderId, isValidId);

  const resources = data?.data?.data ?? [];
  const totalCount = data?.data?.count ?? 0;

  const totalSize = useMemo(
    () => resources.reduce((acc, item) => acc + (item.size || 0), 0),
    [resources]
  );

  const uniqueOwners = useMemo(
    () => new Set(resources.map((item) => item.userId)).size,
    [resources]
  );

  const latestUpload = useMemo(() => {
    if (!resources.length) return "—";
    const sorted = [...resources].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    return formatDate(sorted[0].createdAt);
  }, [resources]);

  if (!isValidId) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-800 font-semibold">
        لم يتم توفير معرف مجلد صالح.
      </div>
    );
  }

  const stats = [
    {
      label: "إجمالي الملفات",
      value: totalCount.toLocaleString("ar-EG"),
      helper: "كل الملفات داخل المجلد",
      icon: FileText,
      tone: "primary" as const,
    },
    {
      label: "إجمالي الحجم",
      value: formatBytes(totalSize),
      helper: "المساحة المستخدمة",
      icon: HardDrive,
      tone: "amber" as const,
    },
    {
      label: "المستخدمون",
      value: uniqueOwners.toLocaleString("ar-EG"),
      helper: "عدد من قاموا بالرفع",
      icon: Users,
      tone: "emerald" as const,
    },
    {
      label: "آخر تحديث",
      value: latestUpload,
      helper: "أحدث عملية رفع",
      icon: Clock3,
      tone: "indigo" as const,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={
          folderInfo?.data?.name
            ? `ملفات المجلد: ${folderInfo.data.name}`
            : "ملفات المجلد"
        }
        subtitle="عرض سريع لكل الملفات"
        icon={FileText}
        isFetching={isFetching}
        countLabel={`${totalCount} ملف`}
        onRefresh={refetch}
        showBackButton
      />

      {error && (
        <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-red-700 font-semibold">
          <AlertCircle size={18} />
          حدث خطأ أثناء جلب الملفات. يرجى المحاولة مجددًا.
        </div>
      )}

      {isLoading ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <SkeletonStatsCard />
            <SkeletonStatsCard />
            <SkeletonStatsCard />
            <SkeletonStatsCard />
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        </>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => (
              <StatCard key={stat.label} {...stat} />
            ))}
          </div>

          {/* FileManager for folder contents */}
          <FileManager
            entityType="Office"
            entityId={folderId}
            parentFolderId={folderId}
            title={
              folderInfo?.data?.name
                ? `ملفات المجلد: ${folderInfo.data.name}`
                : "ملفات المجلد"
            }
            subtitle="عرض وإدارة ملفات المجلد والمجلدات الفرعية."
            showCreateFolder={true}
          />
        </>
      )}
    </div>
  );
};

export default Page;
