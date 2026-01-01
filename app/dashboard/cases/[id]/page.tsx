"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

import {
  ArrowRight,
  AlertCircle,
  Loader2,
  Briefcase,
  Scale,
  Calendar,
  Lock,
  Unlock,
  Users,
  FileText,
  Clock,
  CheckCircle2,
  StickyNote,
  User,
  UserMinus,
  RefreshCcw,
  Gavel,
} from "lucide-react";

import { getCaseById, getCaseStatistics } from "@/features/cases/apis/casesApis";
import type { LucideIcon } from "lucide-react";

interface CaseDetail {
  caseNumber: string;
  name: string;
  isPrivate: boolean;
  caseType: { label: string };
  caseStatus: { value: string; label: string };
  clientName: string;
  clientRole: { label: string };
  opponent: string;
  courtName: string;
  openedAt: string;
  closedAt?: string | null;
  caseLawyers: Array<{ id: number; name: string }>;
  notes?: string | null;
}

interface CaseStats {
  nextSessionDate?: string;
  nextSessionType?: string;
  sessionsCount: number;
  completedSessions: number;
  documentsCount: number;
}

const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    Active: "bg-green-50 text-green-700 border-green-200",
    UnderReview: "bg-yellow-50 text-yellow-700 border-yellow-200",
    UnderInvestigation: "bg-orange-50 text-orange-700 border-orange-200",
    ReadyForHearing: "bg-blue-50 text-blue-700 border-blue-200",
    InCourt: "bg-purple-50 text-purple-700 border-purple-200",
    Postponed: "bg-gray-50 text-gray-700 border-gray-200",
    ReservedForJudgment: "bg-indigo-50 text-indigo-700 border-indigo-200",
    Completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
    Closed: "bg-slate-50 text-slate-700 border-slate-200",
    Rejected: "bg-red-50 text-red-700 border-red-200",
    Cancelled: "bg-rose-50 text-rose-700 border-rose-200",
    Settled: "bg-teal-50 text-teal-700 border-teal-200",
    Suspended: "bg-amber-50 text-amber-700 border-amber-200",
    Archived: "bg-zinc-50 text-zinc-700 border-zinc-200",
    Appealed: "bg-cyan-50 text-cyan-700 border-cyan-200",
    Executed: "bg-lime-50 text-lime-700 border-lime-200",
  };
  return colors[status] || "bg-gray-50 text-gray-700 border-gray-200";
};

const formatDateAr = (date?: string | null) =>
  date ? new Date(date).toLocaleDateString("ar-EG") : "—";

const initials = (name: string) => {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase()).join("") || "U";
};

const SectionCard = ({
  title,
  icon: Icon,
  iconClassName,
  children,
  actions,
}: {
  title: string;
  icon: LucideIcon;
  iconClassName?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}) => (
  <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
    <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-5 py-4">
      <div className="flex items-center gap-2">
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gray-50">
          <Icon className={iconClassName ?? "text-blue-600"} size={18} />
        </span>
        <h2 className="text-base font-semibold text-gray-900">{title}</h2>
      </div>
      {actions}
    </div>
    <div className="p-5">{children}</div>
  </div>
);

const KeyValue = ({
  icon: Icon,
  iconClassName,
  label,
  value,
  subtitle,
}: {
  icon: LucideIcon;
  iconClassName: string;
  label: string;
  value: string;
  subtitle?: string;
}) => (
  <div className="flex items-start gap-3 rounded-xl border border-gray-100 bg-gray-50/40 p-4">
    <Icon className={iconClassName + " mt-0.5"} size={18} />
    <div className="min-w-0">
      <p className="text-xs text-gray-600">{label}</p>
      <p className="truncate text-sm font-semibold text-gray-900">{value}</p>
      {subtitle && <p className="text-xs text-gray-600">{subtitle}</p>}
    </div>
  </div>
);

const Stat = ({
  icon: Icon,
  title,
  value,
  subtitle,
}: {
  icon: LucideIcon;
  title: string;
  value: string | number;
  subtitle?: string;
}) => (
  <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="text-xs text-gray-600">{title}</p>
        <p className="mt-1 text-2xl font-semibold text-gray-900">{value}</p>
        {subtitle && <p className="mt-1 text-xs text-gray-600">{subtitle}</p>}
      </div>
      <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-gray-50">
        <Icon className="text-gray-700" size={18} />
      </span>
    </div>
  </div>
);

const ProgressBar = ({ value }: { value: number }) => (
  <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
    <div
      className="h-full rounded-full bg-gray-900 transition-all"
      style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
    />
  </div>
);

const PageSkeleton = () => (
  <div className="min-h-[60vh]">
    <div className="flex items-center justify-center py-20">
      <Loader2 className="animate-spin text-blue-600" size={44} />
    </div>
  </div>
);

const PageError = ({ message, onBack }: { message?: string; onBack: () => void }) => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <div className="w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-start gap-3">
        <AlertCircle className="text-red-600 mt-0.5" size={24} />
        <div>
          <p className="text-gray-900 font-semibold">حدث خطأ أثناء جلب بيانات القضية</p>
          <p className="mt-1 text-sm text-gray-600">{message || "خطأ غير معروف"}</p>
        </div>
      </div>
      <div className="mt-5 flex flex-wrap gap-3">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 transition-colors"
        >
          <ArrowRight size={18} />
          العودة للقضايا
        </button>
      </div>
    </div>
  </div>
);

export default function CaseDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const caseId = Number(params.id);

  const {
    data: caseData,
    isLoading: isLoadingCase,
    isError: isCaseError,
    error: caseError,
    refetch: refetchCase,
    isFetching: isFetchingCase,
  } = useQuery({
    queryKey: ["case", caseId],
    queryFn: () => getCaseById(caseId),
    enabled: Number.isFinite(caseId) && caseId > 0,
  });

  const {
    data: statsData,
    refetch: refetchStats,
    isFetching: isFetchingStats,
  } = useQuery({
    queryKey: ["caseStatistics", caseId],
    queryFn: () => getCaseStatistics(caseId),
    enabled: Number.isFinite(caseId) && caseId > 0,
  });

  const caseDetails: CaseDetail | undefined = caseData?.data;
  const stats: CaseStats | undefined = statsData?.data;

  const handleBack = () => router.push("/dashboard/cases");
  const handleRefresh = async () => {
    await Promise.all([refetchCase(), refetchStats()]);
  };

  if (isLoadingCase) return <PageSkeleton />;

  if (isCaseError || !caseDetails) {
    const msg = caseError instanceof Error ? caseError.message : undefined;
    return <PageError message={msg} onBack={handleBack} />;
  }

  const completionRate =
    stats && stats.sessionsCount > 0
      ? (stats.completedSessions / stats.sessionsCount) * 100
      : 0;

  return (
    <section className="space-y-6">
      {/* Top: breadcrumb + header */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-b border-gray-100">
          <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
            <button onClick={handleBack} className="hover:text-gray-900 transition-colors">
              القضايا
            </button>
            <span className="text-gray-300">/</span>
            <span className="text-gray-900 font-medium">{caseDetails.caseNumber}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleBack}
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <ArrowRight size={16} />
              رجوع
            </button>
            <button
              onClick={handleRefresh}
              className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-3 py-2 text-white hover:bg-black transition-colors"
              disabled={isFetchingCase || isFetchingStats}
              title="تحديث"
            >
              {(isFetchingCase || isFetchingStats) ? (
                <Loader2 className="animate-spin" size={16} />
              ) : (
                <RefreshCcw size={16} />
              )}
              تحديث
            </button>
          </div>
        </div>

        <div className="px-6 py-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-blue-700 bg-blue-50 border border-blue-200 px-2 py-1 rounded-lg text-xs font-medium">
                  {caseDetails.caseNumber}
                </span>

                <span
                  className={`inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium rounded-lg border ${getStatusColor(
                    caseDetails.caseStatus.value
                  )}`}
                >
                  <Gavel size={12} />
                  {caseDetails.caseStatus.label}
                </span>

                {caseDetails.isPrivate ? (
                  <span className="inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium rounded-lg bg-amber-50 text-amber-700 border border-amber-200">
                    <Lock size={12} /> خاصة
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium rounded-lg bg-gray-50 text-gray-700 border border-gray-200">
                    <Unlock size={12} /> عامة
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 flex items-center gap-3">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 border border-blue-100">
                  <Briefcase className="text-blue-700" size={22} />
                </span>
                <span className="leading-tight">{caseDetails.name}</span>
              </h1>

              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700">
                  <Scale size={14} className="text-purple-700" />
                  {caseDetails.caseType.label}
                </span>
              </div>

              {isFetchingCase && (
                <p className="text-xs text-gray-500 mt-2">يتم تحديث البيانات…</p>
              )}
            </div>

            {/* Mini timeline */}
            <div className="w-full sm:w-auto">
              <div className="rounded-2xl border border-gray-200 bg-gray-50/40 p-4">
                <p className="text-xs text-gray-600">الخط الزمني</p>
                <div className="mt-2 space-y-2">
                  <div className="flex items-center justify-between gap-4 text-sm">
                    <span className="text-gray-700">تاريخ الفتح</span>
                    <span className="font-semibold text-gray-900">
                      {formatDateAr(caseDetails.openedAt)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-4 text-sm">
                    <span className="text-gray-700">تاريخ الإغلاق</span>
                    <span className="font-semibold text-gray-900">
                      {formatDateAr(caseDetails.closedAt ?? null)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-9 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Stat
              icon={Calendar}
              title="الجلسة القادمة"
              value={stats.nextSessionDate ? formatDateAr(stats.nextSessionDate) : "لا توجد"}
              subtitle={stats.nextSessionType}
            />
            <Stat icon={Clock} title="عدد الجلسات" value={stats.sessionsCount} />
            <Stat icon={CheckCircle2} title="جلسات منتهية" value={stats.completedSessions} />
            <Stat icon={FileText} title="المستندات" value={stats.documentsCount} />
          </div>

          <div className="lg:col-span-3">
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm h-full">
              <p className="text-xs text-gray-600">نسبة إنجاز الجلسات</p>
              <p className="mt-1 text-2xl font-semibold text-gray-900">
                {Math.round(completionRate)}%
              </p>
              <div className="mt-3">
                <ProgressBar value={completionRate} />
              </div>
              <p className="mt-2 text-xs text-gray-600">
                {stats.completedSessions} من {stats.sessionsCount} جلسة
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Main info */}
        <div className="lg:col-span-7 space-y-6">
          <SectionCard title="المعلومات الأساسية" icon={FileText} iconClassName="text-blue-700">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <KeyValue
                icon={User}
                iconClassName="text-cyan-700"
                label="العميل"
                value={caseDetails.clientName}
                subtitle={caseDetails.clientRole?.label ? `(${caseDetails.clientRole.label})` : undefined}
              />
              <KeyValue
                icon={UserMinus}
                iconClassName="text-orange-700"
                label="الخصم"
                value={caseDetails.opponent || "—"}
              />
              <KeyValue
                icon={Scale}
                iconClassName="text-purple-700"
                label="المحكمة"
                value={caseDetails.courtName || "—"}
              />
              <KeyValue
                icon={Calendar}
                iconClassName="text-green-700"
                label="تاريخ الفتح"
                value={formatDateAr(caseDetails.openedAt)}
              />
              {caseDetails.closedAt && (
                <KeyValue
                  icon={Calendar}
                  iconClassName="text-red-700"
                  label="تاريخ الإغلاق"
                  value={formatDateAr(caseDetails.closedAt)}
                />
              )}
              <KeyValue
                icon={caseDetails.isPrivate ? Lock : Unlock}
                iconClassName={caseDetails.isPrivate ? "text-amber-700" : "text-gray-700"}
                label="الخصوصية"
                value={caseDetails.isPrivate ? "قضية خاصة" : "قضية عامة"}
              />
            </div>
          </SectionCard>

          {caseDetails.notes && (
            <SectionCard title="ملاحظات" icon={StickyNote} iconClassName="text-yellow-700">
              <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
                {caseDetails.notes}
              </p>
            </SectionCard>
          )}
        </div>

        {/* Right: Lawyers */}
        <div className="lg:col-span-5 space-y-6">
          <SectionCard
            title="المحامون المكلفون"
            icon={Users}
            iconClassName="text-blue-700"
            actions={
              <span className="text-xs text-gray-600">
                {caseDetails.caseLawyers?.length ?? 0} محامي
              </span>
            }
          >
            {caseDetails.caseLawyers.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-5 text-center">
                <Users className="mx-auto text-gray-400" size={26} />
                <p className="mt-2 text-sm text-gray-700 font-medium">لا يوجد محامون مكلفون</p>
                <p className="mt-1 text-xs text-gray-600">قم بإسناد محامٍ للقضية من صفحة الإدارة.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {caseDetails.caseLawyers.map((lawyer) => (
                  <div
                    key={lawyer.id}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-white p-4 hover:bg-gray-50/40 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-11 w-11 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center">
                        <span className="text-blue-700 font-semibold text-sm">
                          {initials(lawyer.name)}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-gray-900">
                          {lawyer.name}
                        </p>
                        <p className="text-xs text-gray-600">ID: {lawyer.id}</p>
                      </div>
                    </div>
                    <User className="text-gray-400" size={18} />
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        </div>
      </div>
    </section>
  );
}
