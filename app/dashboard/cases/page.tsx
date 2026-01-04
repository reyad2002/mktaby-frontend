"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Briefcase,
  X,
  Loader2,
  Lock,
  Search,
  SlidersHorizontal,
  Trash2,
  Archive,
  RotateCcw,
  Eye,
  Pencil,
  RefreshCw,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Info,
} from "lucide-react";
import toast from "react-hot-toast";

import {
  getCases,
  getCaseTypes,
  getCaseStatuses,
  softDeleteCase,
  hardDeleteCase,
  restoreCase,
} from "@/features/cases/apis/casesApis";

import AddCaseForm from "@/features/cases/components/AddCaseForm";
import EditCaseForm from "@/features/cases/components/EditCaseForm";
import PageHeader from "@/shared/components/dashboard/PageHeader";

import type {
  GetCasesQuery,
  CaseListItem,
  CaseTypeValues,
  CaseStatusValues,
} from "@/features/cases/types/casesTypes";

const DEFAULT_FILTERS: GetCasesQuery = {
  PageNumber: 1,
  PageSize: 10,
  Search: "",
  Sort: "",
  CaseType: undefined,
  CaseStatus: undefined,
  IsDeleted: false,
};

const SORT_OPTIONS = [
  { value: "", label: "بدون ترتيب" },
  { value: "createdAt desc", label: "الأحدث أولاً" },
  { value: "createdAt asc", label: "الأقدم أولاً" },
  { value: "name asc", label: "الاسم (أ-ي)" },
  { value: "name desc", label: "الاسم (ي-أ)" },
  { value: "openedAt desc", label: "تاريخ الفتح (الأحدث)" },
  { value: "openedAt asc", label: "تاريخ الفتح (الأقدم)" },
];

const getStatusColor = (status: string) => {
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
  onClose,
  children,
}: {
  title: string;
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
          <h2 className="text-base sm:text-lg font-semibold text-gray-900">
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

export default function CasesPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [filters, setFilters] = useState<GetCasesQuery>(DEFAULT_FILTERS);
  const [showAddCaseModal, setShowAddCaseModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editCaseId, setEditCaseId] = useState<number | null>(null);

  useLockBodyScroll(showAddCaseModal || showEditModal);

  // Lookups
  const { data: caseTypes = [] } = useQuery({
    queryKey: ["caseTypes"],
    queryFn: getCaseTypes,
  });

  const { data: caseStatuses = [] } = useQuery({
    queryKey: ["caseStatuses"],
    queryFn: getCaseStatuses,
  });

  // Mutations
  const softDeleteMutation = useMutation({
    mutationFn: softDeleteCase,
    onSuccess: (response) => {
      if (response?.succeeded) {
        toast.success(response.message || "تم أرشفة القضية بنجاح");
        queryClient.invalidateQueries({ queryKey: ["cases"] });
      } else toast.error(response?.message || "تعذر أرشفة القضية");
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err?.response?.data?.message || "حدث خطأ أثناء أرشفة القضية");
    },
  });

  const hardDeleteMutation = useMutation({
    mutationFn: hardDeleteCase,
    onSuccess: (response) => {
      if (response?.succeeded) {
        toast.success(response.message || "تم حذف القضية نهائياً");
        queryClient.invalidateQueries({ queryKey: ["cases"] });
      } else toast.error(response?.message || "تعذر حذف القضية");
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err?.response?.data?.message || "حدث خطأ أثناء حذف القضية");
    },
  });

  const restoreMutation = useMutation({
    mutationFn: restoreCase,
    onSuccess: (response) => {
      if (response?.succeeded) {
        toast.success(response.message || "تم استعادة القضية بنجاح");
        queryClient.invalidateQueries({ queryKey: ["cases"] });
      } else toast.error(response?.message || "تعذر استعادة القضية");
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err?.response?.data?.message || "حدث خطأ أثناء الاستعادة");
    },
  });

  const queryParams = useMemo(() => {
    return {
      ...filters,
      Search: filters.Search?.trim() || undefined,
      Sort: filters.Sort || undefined,
      CaseType: filters.CaseType || undefined,
      CaseStatus: filters.CaseStatus || undefined,
      IsDeleted: filters.IsDeleted ? true : undefined,
    } satisfies GetCasesQuery;
  }, [filters]);

  const { data, isLoading, isError, error, isFetching, refetch } = useQuery({
    queryKey: ["cases", queryParams],
    queryFn: () => getCases(queryParams),
    staleTime: 10_000,
  });

  const cases: CaseListItem[] = data?.data?.data ?? [];
  const totalCount = data?.data?.count ?? 0;
  const pageNumber = filters.PageNumber ?? 1;
  const pageSize = filters.PageSize ?? 10;
  const totalPages = Math.max(1, Math.ceil(totalCount / (pageSize || 1)));

  const updateFilter = <K extends keyof GetCasesQuery>(
    key: K,
    value: GetCasesQuery[K]
  ) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      PageNumber: key === "Search" || key === "PageSize" ? 1 : prev.PageNumber,
    }));
  };

  const resetFilters = () => setFilters(DEFAULT_FILTERS);

  const handlePageChange = (nextPage: number) => {
    if (nextPage < 1 || nextPage > totalPages) return;
    setFilters((prev) => ({ ...prev, PageNumber: nextPage }));
  };

  const handleSoftDelete = (id: number, name: string) => {
    if (
      window.confirm(`هل تريد أرشفة القضية "${name}"؟\nيمكن استعادتها لاحقاً.`)
    ) {
      softDeleteMutation.mutate(id);
    }
  };

  const handleHardDelete = (id: number, name: string) => {
    if (
      window.confirm(
        `⚠️ تحذير: هل أنت متأكد من حذف القضية "${name}" نهائياً؟\nلا يمكن التراجع عن هذا الإجراء!`
      )
    ) {
      hardDeleteMutation.mutate(id);
    }
  };

  const handleRestore = (id: number, name: string) => {
    if (window.confirm(`هل تريد استعادة القضية "${name}"؟`)) {
      restoreMutation.mutate(id);
    }
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
        title="القضايا"
        subtitle="إدارة ومتابعة القضايا والملفات القانونية."
        icon={Briefcase}
        isFetching={isFetching}
        countLabel={`${totalCount} قضية`}
        onAdd={() => setShowAddCaseModal(true)}
        addButtonLabel="إضافة قضية"
      />

      {/* Filters */}
      <div className="rounded-2xl bg-white/90 backdrop-blur border border-gray-200/70 shadow-[0_10px_30px_-18px_rgba(0,0,0,0.35)] ring-1 ring-gray-200/50 overflow-hidden">
        <div className="px-4 sm:px-5 py-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3 relative">
          {/* Accent line */}
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
              <RefreshCw size={16} className={isFetching ? "animate-spin" : ""} />
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
                  placeholder="ابحث باسم القضية..."
                  className="w-full pr-9 pl-3 py-2.5 border border-gray-200 rounded-xl text-gray-700 bg-white focus:outline-none focus:ring-4 focus:ring-blue-200/70 focus:border-blue-300"
                />
              </div>
            </div>

            {/* Case Type */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                نوع القضية
              </label>
              <div className="relative">
                <select
                  value={filters.CaseType || ""}
                  onChange={(e) =>
                    updateFilter(
                      "CaseType",
                      (e.target.value as CaseTypeValues) || undefined
                    )
                  }
                  className="w-full appearance-none px-3 py-2.5 border border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:ring-4 focus:ring-blue-200/70 focus:border-blue-300 bg-white"
                >
                  <option value="">الكل</option>
                  {caseTypes.map((t) => (
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

            {/* Case Status */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                حالة القضية
              </label>
              <div className="relative">
                <select
                  value={filters.CaseStatus || ""}
                  onChange={(e) =>
                    updateFilter(
                      "CaseStatus",
                      (e.target.value as CaseStatusValues) || undefined
                    )
                  }
                  className="w-full appearance-none px-3 py-2.5 border border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:ring-4 focus:ring-blue-200/70 focus:border-blue-300 bg-white"
                >
                  <option value="">الكل</option>
                  {caseStatuses.map((s) => (
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
                  {SORT_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
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
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                عدد العناصر
              </label>
              <div className="flex flex-wrap gap-2">
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
            </div>

            {/* Active/Deleted toggle + Error */}
            <div className="lg:col-span-12">
              <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
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

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-gray-200/70 bg-white/90 backdrop-blur shadow-[0_10px_30px_-18px_rgba(0,0,0,0.35)] ring-1 ring-gray-200/50">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-b from-gray-50 to-white sticky top-0 z-10">
              <tr className="text-right text-xs font-semibold text-gray-700">
                <th className="px-4 py-3 whitespace-nowrap">رقم القضية</th>
                <th className="px-4 py-3">الاسم</th>
                <th className="px-4 py-3 whitespace-nowrap">النوع</th>
                <th className="px-4 py-3 whitespace-nowrap">الحالة</th>
                <th className="px-4 py-3 whitespace-nowrap">العميل</th>
                <th className="px-4 py-3 whitespace-nowrap">المحكمة</th>
                <th className="px-4 py-3 whitespace-nowrap">تاريخ الفتح</th>
                <th className="px-4 py-3 whitespace-nowrap">الإجراءات</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200 bg-white">
              {isLoading ? (
                [...Array(8)].map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    {[...Array(8)].map((__, cellIdx) => (
                      <td key={cellIdx} className="px-4 py-4">
                        <div className="h-4 w-full rounded bg-gray-200" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : cases.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-gray-500">
                    <div className="mx-auto max-w-sm">
                      <div className="w-12 h-12 rounded-2xl border border-gray-200 bg-gray-50 flex items-center justify-center mx-auto mb-3">
                        <Briefcase className="text-gray-500" size={20} />
                      </div>
                      <div className="font-medium text-gray-700 mb-1">
                        لا توجد نتائج
                      </div>
                      <div className="text-sm text-gray-500">
                        جرّب تغيير البحث أو الفلاتر.
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                cases.map((caseItem, index) => (
                  <tr
                    key={caseItem.id}
                    className={`text-sm text-gray-700 transition-colors ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50/40"
                    } hover:bg-gradient-to-r hover:from-blue-50/60 hover:to-transparent`}
                  >
                    <td className="px-4 py-4 font-semibold text-blue-700 whitespace-nowrap">
                      {caseItem.caseNumber}
                    </td>

                    <td className="px-4 py-4">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-900 truncate max-w-[340px]">
                            {caseItem.name}
                          </span>

                          {caseItem.isPrivate && (
                            <span className="inline-flex items-center gap-1 rounded-xl border border-amber-200/70 bg-gradient-to-br from-amber-50 to-orange-50 px-2 py-0.5 text-xs text-amber-800">
                              <Lock size={12} />
                              خاصة
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          ID: {caseItem.id}
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-800 border border-blue-200/60">
                        {caseItem.caseType.label}
                      </span>
                    </td>

                    <td className="px-4 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-xl border ${getStatusColor(
                          caseItem.caseStatus.value
                        )}`}
                      >
                        {caseItem.caseStatus.label}
                      </span>
                    </td>

                    <td className="px-4 py-4 whitespace-nowrap">
                      {caseItem.clientName || "—"}
                    </td>

                    <td className="px-4 py-4 whitespace-nowrap">
                      {caseItem.courtName || "—"}
                    </td>

                    <td className="px-4 py-4 text-gray-600 whitespace-nowrap">
                      {formatDateAr(caseItem.openedAt)}
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <IconButton
                          title="عرض"
                          variant="blue"
                          onClick={() =>
                            router.push(`/dashboard/cases/${caseItem.id}`)
                          }
                        >
                          <Eye size={16} />
                        </IconButton>

                        <IconButton
                          title="تعديل"
                          variant="purple"
                          onClick={() => {
                            setEditCaseId(caseItem.id);
                            setShowEditModal(true);
                          }}
                        >
                          <Pencil size={16} />
                        </IconButton>

                        {filters.IsDeleted ? (
                          <>
                            <IconButton
                              title="استعادة"
                              variant="green"
                              disabled={restoreMutation.isPending}
                              onClick={() =>
                                handleRestore(caseItem.id, caseItem.name)
                              }
                            >
                              {restoreMutation.isPending ? (
                                <Loader2 size={16} className="animate-spin" />
                              ) : (
                                <RotateCcw size={16} />
                              )}
                            </IconButton>

                            <IconButton
                              title="حذف نهائي"
                              variant="red"
                              disabled={hardDeleteMutation.isPending}
                              onClick={() =>
                                handleHardDelete(caseItem.id, caseItem.name)
                              }
                            >
                              {hardDeleteMutation.isPending ? (
                                <Loader2 size={16} className="animate-spin" />
                              ) : (
                                <Trash2 size={16} />
                              )}
                            </IconButton>
                          </>
                        ) : (
                          <IconButton
                            title="أرشفة"
                            variant="orange"
                            disabled={softDeleteMutation.isPending}
                            onClick={() =>
                              handleSoftDelete(caseItem.id, caseItem.name)
                            }
                          >
                            {softDeleteMutation.isPending ? (
                              <Loader2 size={16} className="animate-spin" />
                            ) : (
                              <Archive size={16} />
                            )}
                          </IconButton>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gray-200/70 bg-white/90 backdrop-blur px-4 py-3 text-sm text-gray-600 shadow-[0_10px_30px_-18px_rgba(0,0,0,0.35)] ring-1 ring-gray-200/50">
        <div className="flex items-center gap-2">
          <span>
            صفحة <span className="font-semibold text-gray-900">{pageNumber}</span>{" "}
            من <span className="font-semibold text-gray-900">{totalPages}</span>
          </span>
          <span className="text-gray-400">•</span>
          <span>
            عرض{" "}
            <span className="font-semibold text-gray-900">{cases.length}</span>{" "}
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
      {showAddCaseModal && (
        <ModalShell
          title="إضافة قضية جديدة"
          onClose={() => setShowAddCaseModal(false)}
        >
          <AddCaseForm
            onSuccess={() => setShowAddCaseModal(false)}
            onCancel={() => setShowAddCaseModal(false)}
          />
        </ModalShell>
      )}

      {/* Edit Modal */}
      {showEditModal && editCaseId && (
        <ModalShell
          title="تعديل القضية"
          onClose={() => {
            setShowEditModal(false);
            setEditCaseId(null);
          }}
        >
          <EditCaseForm
            caseId={editCaseId}
            onSuccess={() => {
              setShowEditModal(false);
              setEditCaseId(null);
            }}
            onCancel={() => {
              setShowEditModal(false);
              setEditCaseId(null);
            }}
          />
        </ModalShell>
      )}
    </section>
  );
}
