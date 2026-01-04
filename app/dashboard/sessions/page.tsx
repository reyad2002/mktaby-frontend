"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { LucideIcon } from "lucide-react";
import {
  CalendarDays,
  Plus,
  X,
  Loader2,
  Edit,
  Trash2,
  AlertCircle,
  Calendar,
  Briefcase,
  Scale,
  Search,
  SlidersHorizontal,
  RefreshCw,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Info,
  Eye,
  FileText,
} from "lucide-react";
import toast from "react-hot-toast";

import {
  fetchSessionsList,
  fetchSessionTypes,
  fetchSessionStatuses,
  softDeleteSession,
} from "@/features/sessions/apis/sessionsApis";
import AddSessionForm from "@/features/sessions/components/AddSessionForm";
import EditSessionForm from "@/features/sessions/components/EditSessionForm";
import PageHeader from "@/shared/components/dashboard/PageHeader";
import type {
  GetSessionsQuery,
  SessionListItem,
  SessionTypeValue,
  SessionStatusValue,
} from "@/features/sessions/types/sessionsTypes";

const DEFAULT_FILTERS: GetSessionsQuery = {
  PageNumber: 1,
  PageSize: 10,
  Search: "",
  Sort: "",
  SessionType: undefined,
  SessionStatus: undefined,
  IsDeleted: false,
};

const SORT_OPTIONS = [
  { value: "", label: "بدون ترتيب" },
  { value: "sessionDate desc", label: "التاريخ (الأحدث)" },
  { value: "sessionDate asc", label: "التاريخ (الأقدم)" },
  { value: "createdAt desc", label: "الإنشاء (الأحدث)" },
  { value: "createdAt asc", label: "الإنشاء (الأقدم)" },
];

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
      <div className="relative w-full max-w-4xl mx-4 bg-white rounded-2xl border border-gray-200 shadow-2xl max-h-[90vh] overflow-y-auto">
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
            <X size={18} />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

/** Icon Button (Premium) */
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
          <CalendarDays className="text-gray-500" size={20} />
        </div>
        <p className="text-gray-800 font-semibold">لا توجد جلسات مطابقة.</p>
        <p className="text-sm text-gray-600 mt-1">
          جرّب تغيير الفلاتر أو البحث.
        </p>
      </div>
    </div>
  );
}

function Pill({
  icon: Icon,
  text,
  className = "",
}: {
  icon?: LucideIcon;
  text: string;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold border ${className}`}
    >
      {Icon ? <Icon size={12} /> : null}
      {text}
    </span>
  );
}

const formatSessionDate = (date: string) =>
  new Date(date).toLocaleDateString("ar-EG", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

export default function SessionsPage() {
  const [filters, setFilters] = useState<GetSessionsQuery>(DEFAULT_FILTERS);
  const [showAddSessionModal, setShowAddSessionModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editSessionId, setEditSessionId] = useState<number | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedSession, setSelectedSession] =
    useState<SessionListItem | null>(null);

  useLockBodyScroll(showAddSessionModal || showEditModal || showViewModal);

  const queryClient = useQueryClient();

  const { data: sessionTypes = [] } = useQuery({
    queryKey: ["sessionTypes"],
    queryFn: fetchSessionTypes,
  });

  const { data: sessionStatuses = [] } = useQuery({
    queryKey: ["sessionStatuses"],
    queryFn: fetchSessionStatuses,
  });

  const softDeleteMutation = useMutation({
    mutationFn: softDeleteSession,
    onSuccess: () => {
      toast.success("تم حذف الجلسة بنجاح");
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err?.response?.data?.message || "حدث خطأ أثناء حذف الجلسة");
    },
  });

  const handleSoftDelete = (id: number, caseName: string) => {
    if (window.confirm(`هل تريد حذف جلسة القضية "${caseName}"؟`)) {
      softDeleteMutation.mutate(id);
    }
  };

  const queryParams = useMemo(() => {
    return {
      ...filters,
      Search: filters.Search?.trim() || undefined,
      Sort: filters.Sort || undefined,
      SessionType: filters.SessionType || undefined,
      SessionStatus: filters.SessionStatus || undefined,
      IsDeleted: filters.IsDeleted ? true : undefined,
    } satisfies GetSessionsQuery;
  }, [filters]);

  const { data, isLoading, isError, error, isFetching, refetch } = useQuery({
    queryKey: ["sessions", queryParams],
    queryFn: () => fetchSessionsList(queryParams),
    staleTime: 10_000,
  });

  const sessions: SessionListItem[] = data?.data?.data ?? [];
  const totalCount = data?.data?.count ?? 0;

  const pageNumber = filters.PageNumber ?? 1;
  const pageSize = filters.PageSize ?? 10;
  const totalPages = Math.max(1, Math.ceil(totalCount / (pageSize || 1)));

  const updateFilter = <K extends keyof GetSessionsQuery>(
    key: K,
    value: GetSessionsQuery[K]
  ) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      PageNumber: key === "Search" || key === "PageSize" ? 1 : prev.PageNumber,
    }));
  };

  const handlePageChange = (nextPage: number) => {
    if (nextPage < 1 || nextPage > totalPages) return;
    setFilters((prev) => ({ ...prev, PageNumber: nextPage }));
  };

  const resetFilters = () => setFilters(DEFAULT_FILTERS);

  // White-theme pills
  const getStatusPillClass = (status: string) => {
    const colors: Record<string, string> = {
      Scheduled: "bg-blue-50 text-blue-700 border-blue-200",
      InProgress: "bg-amber-50 text-amber-800 border-amber-200",
      Postponed: "bg-orange-50 text-orange-800 border-orange-200",
      Cancelled: "bg-red-50 text-red-800 border-red-200",
      AwaitingDecision: "bg-purple-50 text-purple-700 border-purple-200",
      Completed: "bg-emerald-50 text-emerald-800 border-emerald-200",
    };
    return colors[status] || "bg-gray-50 text-gray-700 border-gray-200";
  };

  const getTypePillClass = (type: string) => {
    const colors: Record<string, string> = {
      Preliminary: "bg-cyan-50 text-cyan-800 border-cyan-200",
      Hearing: "bg-blue-50 text-blue-700 border-blue-200",
      Trial: "bg-indigo-50 text-indigo-700 border-indigo-200",
      Sentencing: "bg-purple-50 text-purple-700 border-purple-200",
      Adjourned: "bg-gray-50 text-gray-700 border-gray-200",
      Investigation: "bg-amber-50 text-amber-800 border-amber-200",
      Appeal: "bg-orange-50 text-orange-800 border-orange-200",
      Review: "bg-teal-50 text-teal-800 border-teal-200",
      Execution: "bg-red-50 text-red-800 border-red-200",
      Mediation: "bg-emerald-50 text-emerald-800 border-emerald-200",
      Settlement: "bg-lime-50 text-lime-800 border-lime-200",
      Pleading: "bg-yellow-50 text-yellow-800 border-yellow-200",
      ClosingArguments: "bg-rose-50 text-rose-800 border-rose-200",
      ExpertReview: "bg-violet-50 text-violet-800 border-violet-200",
      Administrative: "bg-slate-50 text-slate-800 border-slate-200",
      Reconciliation: "bg-green-50 text-green-800 border-green-200",
    };
    return colors[type] || "bg-gray-50 text-gray-700 border-gray-200";
  };

  return (
    <section className="space-y-6 relative">
      {/* Soft premium background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-blue-200/40 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-indigo-200/40 blur-3xl" />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-50 via-white to-white" />
      </div>

      <PageHeader
        title="الجلسات"
        subtitle="إدارة ومتابعة جلسات القضايا والمواعيد."
        icon={CalendarDays}
        countLabel={`${totalCount} جلسة`}
        onAdd={() => setShowAddSessionModal(true)}
        addButtonLabel="إضافة جلسة"
        isFetching={isFetching}
      />

      {/* Filters (Cases UI) */}
      <div className="rounded-2xl bg-white/90 backdrop-blur border border-gray-200/70 shadow-[0_10px_30px_-18px_rgba(0,0,0,0.35)] ring-1 ring-gray-200/50 overflow-hidden">
        <div className="px-4 sm:px-5 py-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3 relative">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-500" />

          <div className="flex items-center gap-2 text-sm font-medium text-gray-800">
            <span className="inline-flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200/60 shadow-sm">
              <SlidersHorizontal size={16} className="text-blue-700" />
            </span>
            فلاتر البحث
            <span className="text-gray-500 font-normal">
              • {totalCount} نتيجة
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => refetch()}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <RefreshCw
                size={16}
                className={isFetching ? "animate-spin" : ""}
              />
              تحديث
            </button>

            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-xl transition-colors border border-gray-200 bg-white"
            >
              إعادة ضبط
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-5">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
            {/* Search */}
            <div className="lg:col-span-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                بحث
              </label>
              <div className="relative">
                <Search
                  size={16}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  value={filters.Search ?? ""}
                  onChange={(e) => updateFilter("Search", e.target.value)}
                  placeholder="ابحث بالقضية أو المحكمة..."
                  className="w-full pr-9 pl-3 py-2.5 border border-gray-200 rounded-xl text-gray-700 bg-white focus:outline-none focus:ring-4 focus:ring-blue-200/70 focus:border-blue-300"
                />
              </div>
            </div>

            {/* Session Type */}
            <div className="lg:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                نوع الجلسة
              </label>
              <div className="relative">
                <select
                  value={filters.SessionType || ""}
                  onChange={(e) =>
                    updateFilter(
                      "SessionType",
                      (e.target.value as SessionTypeValue) || undefined
                    )
                  }
                  className="w-full appearance-none px-3 py-2.5 border border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:ring-4 focus:ring-blue-200/70 focus:border-blue-300 bg-white"
                >
                  <option value="">الكل</option>
                  {sessionTypes.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                />
              </div>
            </div>

            {/* Session Status */}
            <div className="lg:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                حالة الجلسة
              </label>
              <div className="relative">
                <select
                  value={filters.SessionStatus || ""}
                  onChange={(e) =>
                    updateFilter(
                      "SessionStatus",
                      (e.target.value as SessionStatusValue) || undefined
                    )
                  }
                  className="w-full appearance-none px-3 py-2.5 border border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:ring-4 focus:ring-blue-200/70 focus:border-blue-300 bg-white"
                >
                  <option value="">الكل</option>
                  {sessionStatuses.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                />
              </div>
            </div>

            {/* Sort */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الترتيب
              </label>
              <div className="relative">
                <select
                  value={filters.Sort || ""}
                  onChange={(e) => updateFilter("Sort", e.target.value)}
                  className="w-full appearance-none px-3 py-2.5 border border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:ring-4 focus:ring-blue-200/70 focus:border-blue-300 bg-white"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                />
              </div>
            </div>

            {/* Page size */}
            <div className="lg:col-span-12">
              <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm text-gray-600">عدد العناصر:</span>
                  {[5, 10, 20, 50].map((size) => {
                    const active = pageSize === size;
                    return (
                      <button
                        key={size}
                        type="button"
                        onClick={() => updateFilter("PageSize", size)}
                        className={`px-3 py-2 text-sm rounded-xl transition-all border ${
                          active
                            ? "bg-blue-50 text-blue-700 border-blue-200 shadow-sm"
                            : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                        }`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>

                <div className="flex gap-2">
                  {[
                    { value: false, label: "نشط" },
                    { value: true, label: "محذوف" },
                  ].map((opt) => {
                    const active = filters.IsDeleted === opt.value;
                    return (
                      <button
                        key={String(opt.value)}
                        type="button"
                        onClick={() => updateFilter("IsDeleted", opt.value)}
                        className={`rounded-xl px-4 py-2 text-sm transition-all border ${
                          active
                            ? "bg-gray-900 text-white border-gray-900 shadow-sm"
                            : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                        }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>

                {isError && (
                  <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 px-3 py-2 rounded-xl">
                    <Info size={16} />
                    حدث خطأ: {error instanceof Error ? error.message : ""}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Table / States */}
      {isLoading ? (
        <LoadingState />
      ) : isError ? (
        <ErrorState
          message={error instanceof Error ? error.message : undefined}
        />
      ) : sessions.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-gray-200/70 bg-white/90 backdrop-blur shadow-[0_10px_30px_-18px_rgba(0,0,0,0.35)] ring-1 ring-gray-200/50">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-b from-gray-50 to-white sticky top-0 z-10">
                <tr className="text-right text-xs font-semibold text-gray-700">
                  <th className="px-4 py-3 whitespace-nowrap">تاريخ الجلسة</th>
                  <th className="px-4 py-3 whitespace-nowrap">نوع الجلسة</th>
                  <th className="px-4 py-3 whitespace-nowrap">حالة الجلسة</th>
                  <th className="px-4 py-3">القضية</th>
                  <th className="px-4 py-3">المحكمة</th>
                  <th className="px-4 py-3 whitespace-nowrap">الإجراءات</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200 bg-white">
                {sessions.map((session, index) => (
                  <tr
                    key={session.id}
                    className={`text-sm text-gray-800 transition-colors ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50/40"
                    } hover:bg-gradient-to-r hover:from-blue-50/60 hover:to-transparent`}
                  >
                    {/* Date */}
                    <td className="px-4 py-4 min-w-[260px]">
                      {session.sessionDate ? (
                        <div className="inline-flex items-center gap-3">
                          <span className="inline-flex items-center justify-center w-9 h-9 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200/60 shadow-sm">
                            <Calendar size={16} className="text-blue-700" />
                          </span>
                          <div className="min-w-0">
                            <div className="font-semibold text-gray-900">
                              {formatSessionDate(session.sessionDate)}
                            </div>
                            <div className="text-xs text-gray-500 mt-0.5">
                              جلسة رقم: {session.id}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-500">—</span>
                      )}
                    </td>

                    {/* Type */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      <Pill
                        icon={Scale}
                        text={session.sessionType?.label || "—"}
                        className={getTypePillClass(
                          session.sessionType?.value || ""
                        )}
                      />
                    </td>

                    {/* Status */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      <Pill
                        text={session.sessionStatus?.label || "—"}
                        className={getStatusPillClass(
                          session.sessionStatus?.value || ""
                        )}
                      />
                    </td>

                    {/* Case */}
                    <td className="px-4 py-4 min-w-[280px]">
                      <div className="flex items-start gap-3">
                        <span className="inline-flex items-center justify-center w-9 h-9 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200/60 shadow-sm">
                          <Briefcase size={16} className="text-blue-700" />
                        </span>

                        <div className="min-w-0">
                          <div
                            className="font-semibold text-gray-900 truncate"
                            title={session.caseName}
                          >
                            {session.caseName}
                          </div>
                          <div className="text-xs text-gray-500 mt-1" dir="ltr">
                            رقم القضية: {session.caseNumber}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Court */}
                    <td className="px-4 py-4 min-w-[200px]">
                      <span
                        className="text-gray-700 truncate block"
                        title={session.court}
                      >
                        {session.court || "—"}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <IconButton
                          title="عرض التفاصيل"
                          variant="blue"
                          onClick={() => {
                            setSelectedSession(session);
                            setShowViewModal(true);
                          }}
                        >
                          <Eye size={14} />
                        </IconButton>

                        <IconButton
                          title="تعديل"
                          variant="purple"
                          onClick={() => {
                            setEditSessionId(session.id);
                            setShowEditModal(true);
                          }}
                        >
                          <Edit size={16} />
                        </IconButton>

                        <IconButton
                          title="حذف"
                          variant="red"
                          disabled={softDeleteMutation.isPending}
                          onClick={() =>
                            handleSoftDelete(session.id, session.caseName)
                          }
                        >
                          {softDeleteMutation.isPending ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            <Trash2 size={16} />
                          )}
                        </IconButton>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gray-200/70 bg-white/90 backdrop-blur px-4 py-3 text-sm text-gray-600 shadow-[0_10px_30px_-18px_rgba(0,0,0,0.35)] ring-1 ring-gray-200/50">
        <div className="flex items-center gap-2">
          <span>
            صفحة{" "}
            <span className="font-semibold text-gray-900">{pageNumber}</span> من{" "}
            <span className="font-semibold text-gray-900">{totalPages}</span>
          </span>
          <span className="text-gray-400">•</span>
          <span>
            عرض{" "}
            <span className="font-semibold text-gray-900">
              {sessions.length}
            </span>{" "}
            من <span className="font-semibold text-gray-900">{totalCount}</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handlePageChange(pageNumber - 1)}
            disabled={pageNumber <= 1}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 bg-white text-gray-700 disabled:opacity-50 hover:bg-gray-50 transition-colors"
          >
            <ChevronRight size={16} />
            السابق
          </button>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">اذهب إلى</span>
            <input
              type="number"
              min={1}
              max={totalPages}
              value={pageNumber}
              onChange={(e) => handlePageChange(Number(e.target.value))}
              className="w-20 px-3 py-2 rounded-xl border border-gray-200 text-gray-700 focus:outline-none focus:ring-4 focus:ring-blue-200/70 focus:border-blue-300 bg-white"
            />
          </div>

          <button
            onClick={() => handlePageChange(pageNumber + 1)}
            disabled={pageNumber >= totalPages}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 bg-white text-gray-700 disabled:opacity-50 hover:bg-gray-50 transition-colors"
          >
            التالي
            <ChevronLeft size={16} />
          </button>
        </div>
      </div>

      {/* Add Modal */}
      {showAddSessionModal && (
        <ModalShell
          title="إضافة جلسة جديدة"
          icon={Plus}
          iconClassName="text-blue-700"
          onClose={() => setShowAddSessionModal(false)}
        >
          <AddSessionForm
            onSuccess={() => setShowAddSessionModal(false)}
            onCancel={() => setShowAddSessionModal(false)}
          />
        </ModalShell>
      )}

      {/* Edit Modal */}
      {showEditModal && editSessionId && (
        <ModalShell
          title="تعديل الجلسة"
          icon={Edit}
          iconClassName="text-purple-700"
          onClose={() => {
            setShowEditModal(false);
            setEditSessionId(null);
          }}
        >
          <EditSessionForm
            sessionId={editSessionId}
            onSuccess={() => {
              setShowEditModal(false);
              setEditSessionId(null);
            }}
            onCancel={() => {
              setShowEditModal(false);
              setEditSessionId(null);
            }}
          />
        </ModalShell>
      )}

      {/* View Modal */}
      {showViewModal && selectedSession && (
        <ModalShell
          title="تفاصيل الجلسة"
          icon={Eye}
          iconClassName="text-blue-700"
          onClose={() => {
            setShowViewModal(false);
            setSelectedSession(null);
          }}
        >
          <div className="space-y-6">
            {/* Session Date & Time */}
            <div className="rounded-xl border border-gray-200 bg-gradient-to-br from-blue-50 to-white p-4">
              <div className="flex items-start gap-3">
                <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-blue-100 border border-blue-200">
                  <Calendar size={18} className="text-blue-700" />
                </span>
                <div>
                  <div className="text-xs font-medium text-gray-600 mb-1">
                    تاريخ الجلسة
                  </div>
                  <div className="text-base font-semibold text-gray-900">
                    {selectedSession.sessionDate
                      ? formatSessionDate(selectedSession.sessionDate)
                      : "—"}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Session Type */}
              <div className="rounded-xl border border-gray-200 bg-white p-4">
                <div className="flex items-start gap-3">
                  <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gray-50 border border-gray-200">
                    <Scale size={18} className="text-gray-700" />
                  </span>
                  <div>
                    <div className="text-xs font-medium text-gray-600 mb-1">
                      نوع الجلسة
                    </div>
                    <div className="text-sm font-semibold text-gray-900">
                      {selectedSession.sessionType?.label || "—"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Session Status */}
              <div className="rounded-xl border border-gray-200 bg-white p-4">
                <div className="flex items-start gap-3">
                  <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gray-50 border border-gray-200">
                    <Info size={18} className="text-gray-700" />
                  </span>
                  <div>
                    <div className="text-xs font-medium text-gray-600 mb-1">
                      حالة الجلسة
                    </div>
                    <div className="text-sm font-semibold text-gray-900">
                      {selectedSession.sessionStatus?.label || "—"}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Case Details */}
            <div className="rounded-xl border border-gray-200 bg-gradient-to-br from-indigo-50 to-white p-4">
              <div className="flex items-start gap-3">
                <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-100 border border-indigo-200">
                  <Briefcase size={18} className="text-indigo-700" />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-gray-600 mb-1">
                    القضية
                  </div>
                  <div
                    className="text-base font-semibold text-gray-900 truncate"
                    title={selectedSession.caseName}
                  >
                    {selectedSession.caseName || "—"}
                  </div>
                  <div className="text-xs text-gray-600 mt-1" dir="ltr">
                    رقم القضية: {selectedSession.caseNumber || "—"}
                  </div>
                </div>
              </div>
            </div>

            {/* Court */}
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <div className="flex items-start gap-3">
                <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gray-50 border border-gray-200">
                  <Scale size={18} className="text-gray-700" />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-gray-600 mb-1">
                    المحكمة
                  </div>
                  <div className="text-sm font-semibold text-gray-900">
                    {selectedSession.court || "—"}
                  </div>
                </div>
              </div>
            </div>

            {/* Notes */}
            {selectedSession.notes && (
              <div className="rounded-xl border border-gray-200 bg-white p-4">
                <div className="flex items-start gap-3">
                  <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gray-50 border border-gray-200">
                    <FileText size={18} className="text-gray-700" />
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-gray-600 mb-2">
                      الملاحظات
                    </div>
                    <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {selectedSession.notes}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Session ID */}
            <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4">
              <div className="text-xs text-gray-600">
                معرّف الجلسة:{" "}
                <span className="font-mono font-semibold text-gray-900">
                  #{selectedSession.id}
                </span>
              </div>
            </div>
          </div>
        </ModalShell>
      )}
    </section>
  );
}
