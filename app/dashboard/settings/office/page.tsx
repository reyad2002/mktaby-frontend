"use client";

import { useMemo } from "react";
import Image from "next/image";
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  Users,
  HardDrive,
  Calendar,
  Loader2,
  AlertCircle,
} from "lucide-react";

import type { LucideIcon } from "lucide-react";
import { useOffice } from "@/features/office/hooks/officeHooks";
import PageHeader from "@/shared/components/dashboard/PageHeader";

// ---------- Helpers ----------
const formatDateArLong = (date: string) =>
  new Date(date).toLocaleDateString("ar-EG", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

const formatStorage = (bytes?: number) => {
  const n = Number(bytes || 0);
  if (!Number.isFinite(n) || n <= 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(n) / Math.log(k));
  const value = n / Math.pow(k, i);
  return `${parseFloat(value.toFixed(2))} ${sizes[i]}`;
};

const clampPct = (v?: number) => {
  const n = Number(v);
  if (!Number.isFinite(n)) return 0;
  return Math.min(Math.max(n, 0), 100);
};

// ---------- Small UI Components ----------
function LoadingState() {
  return (
    <div className="flex items-center justify-center min-h-[55vh]">
      <Loader2 className="animate-spin text-blue-600" size={48} />
    </div>
  );
}

function ErrorState() {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
      <div className="flex items-center justify-center gap-2 text-red-700 font-medium">
        <AlertCircle size={18} />
        حدث خطأ أثناء جلب البيانات
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-8 text-center shadow-sm">
      <p className="text-gray-700 font-medium">لا توجد بيانات للمكتب حالياً</p>
      <p className="text-sm text-gray-600 mt-1">جرّب إعادة التحميل لاحقاً.</p>
    </div>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
  dir,
  className,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  dir?: "ltr" | "rtl";
  className?: string;
}) {
  return (
    <div className={`flex items-start gap-3 ${className || ""}`}>
      <Icon className="text-blue-600 mt-1 shrink-0" size={18} />
      <div className="min-w-0">
        <p className="text-sm text-gray-600">{label}</p>
        <p
          className="text-gray-900 font-medium break-words"
          dir={dir}
          title={value}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  title,
  value,
  subtitle,
  progress,
}: {
  icon: LucideIcon;
  title: string;
  value: string;
  subtitle?: string;
  progress?: number; // 0..100
}) {
  const pct = typeof progress === "number" ? clampPct(progress) : null;

  // لون بسيط حسب الاستهلاك (UI fix: يوضح الخطر)
  const barClass =
    pct === null
      ? "bg-blue-600"
      : pct >= 90
      ? "bg-red-600"
      : pct >= 70
      ? "bg-amber-600"
      : "bg-blue-600";

  const badgeClass =
    pct === null
      ? "bg-blue-50 text-blue-700 border-blue-200"
      : pct >= 90
      ? "bg-red-50 text-red-700 border-red-200"
      : pct >= 70
      ? "bg-amber-50 text-amber-800 border-amber-200"
      : "bg-blue-50 text-blue-700 border-blue-200";

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 min-w-0">
          <div className="p-2 rounded-lg bg-blue-50 border border-blue-100 shrink-0">
            <Icon className="text-blue-600" size={20} />
          </div>
          <div className="min-w-0">
            <p className="text-sm text-gray-600">{title}</p>
            <p className="text-gray-900 font-semibold truncate">{value}</p>
            {subtitle && (
              <p className="text-xs text-gray-600 mt-0.5">{subtitle}</p>
            )}
          </div>
        </div>

        {pct !== null && (
          <span
            className={`shrink-0 inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border ${badgeClass}`}
          >
            {pct}%
          </span>
        )}
      </div>

      {pct !== null && (
        <div className="mt-4">
          <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
            <div
              className={`h-2 rounded-full transition-all ${barClass}`}
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-gray-600">{pct}% من الحد الأقصى</p>
        </div>
      )}
    </div>
  );
}

// ---------- Page ----------
export default function OfficePage() {
  // Fetch office data using hook
  const { data, isLoading, isError, isFetching } = useOffice();

  const office = data?.data;

  const usersPercentage = useMemo(() => {
    if (!office) return 0;
    const max = Number(office.maxUsersCount || 0);
    const used = Number(office.usersCount || 0);
    if (!Number.isFinite(max) || max <= 0) return 0;
    return Math.round((used / max) * 100);
  }, [office]);

  const storagePercentage = useMemo(() => {
    if (!office) return 0;
    const max = Number(office.maxStorageInBytes || 0);
    const used = Number(office.usedStorageInBytes || 0);
    if (!Number.isFinite(max) || max <= 0) return 0;
    return Math.round((used / max) * 100);
  }, [office]);

  return (
    <section className="space-y-6">
      <PageHeader
        title="بيانات المكتب"
        subtitle="عرض ومتابعة بيانات المكتب وحدود الاشتراك."
        icon={Building2}
      />

      {isLoading ? (
        <LoadingState />
      ) : isError ? (
        <ErrorState />
      ) : !office ? (
        <EmptyState />
      ) : (
        <div className="space-y-6">
          {/* Top strip (small status) */}
          <div className="flex flex-wrap items-center justify-end gap-3">
            {isFetching && (
              <span className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-50 text-blue-700 text-sm border border-blue-200">
                <span
                  className="h-2 w-2 rounded-full bg-blue-500 animate-pulse"
                  aria-hidden
                />
                يتم التحديث...
              </span>
            )}
          </div>

          {/* Office Main Card */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Image */}
              <div className="shrink-0">
                {office.imageURL ? (
                  <Image
                    src={office.imageURL}
                    alt={office.name}
                    width={128}
                    height={128}
                    className="w-32 h-32 rounded-xl object-cover border border-gray-200"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-center">
                    <Building2 className="text-gray-400" size={38} />
                  </div>
                )}
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h2 className="text-2xl font-semibold text-gray-900 truncate">
                      {office.name}
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                      معلومات التواصل والعنوان
                    </p>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoRow
                    icon={Mail}
                    label="البريد الإلكتروني"
                    value={office.email}
                  />
                  <InfoRow
                    icon={Phone}
                    label="رقم الهاتف"
                    value={office.phoneNumber}
                    dir="ltr"
                  />
                  <InfoRow
                    icon={MapPin}
                    label="العنوان"
                    value={office.address}
                    className="md:col-span-2"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <StatCard
              icon={Users}
              title="المستخدمون"
              value={`${office.usersCount} / ${office.maxUsersCount}`}
              progress={usersPercentage}
              subtitle="نسبة الاستخدام من الحد الأقصى"
            />
            <StatCard
              icon={HardDrive}
              title="التخزين"
              value={`${formatStorage(
                office.usedStorageInBytes
              )} / ${formatStorage(office.maxStorageInBytes)}`}
              progress={storagePercentage}
              subtitle="نسبة الاستخدام من الحد الأقصى"
            />
          </div>

          {/* Subscription */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
              <Calendar className="text-blue-600" size={20} />
              معلومات الاشتراك
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <p className="text-sm text-gray-600">تاريخ الإنشاء</p>
                <p className="text-gray-900 font-medium mt-1">
                  {formatDateArLong(office.createdAt)}
                </p>
              </div>

              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <p className="text-sm text-gray-600">الاشتراك ينتهي في</p>
                <p className="text-gray-900 font-medium mt-1">
                  {formatDateArLong(office.subscribedTill)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
