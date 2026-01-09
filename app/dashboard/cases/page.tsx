"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
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
  CheckCircle2,
  FileText,
} from "lucide-react";

import {
  useCases,
  useCaseTypes,
  useCaseStatuses,
  useSoftDeleteCase,
  useHardDeleteCase,
  useRestoreCase,
} from "@/features/cases/hooks/caseHooks";

import EditCaseForm from "@/features/cases/components/EditCaseForm";
import PageHeader from "@/shared/components/dashboard/PageHeader";

import type {
  GetCasesQuery,
  CaseListItem,
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
//to prevent background scroll when modal is open
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

  const [filters, setFilters] = useState<GetCasesQuery>(DEFAULT_FILTERS);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editCaseId, setEditCaseId] = useState<number | null>(null);
  useLockBodyScroll(showEditModal);

  // Lookups using hooks
  const { data: caseTypes = [] } = useCaseTypes();
  const { data: caseStatuses = [] } = useCaseStatuses();

  // Mutations using hooks
  const softDeleteMutation = useSoftDeleteCase();
  const hardDeleteMutation = useHardDeleteCase();
  const restoreMutation = useRestoreCase();

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

  const { data, isLoading, isError, error, isFetching, refetch } =
    useCases(queryParams);

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

  // const {
  //   data: clientResponse,
  //   isLoading: isClientLoading,
  //   isError: isClientError,
  //   error: clientError,
  // } = useQuery({
  //   queryKey: ["client", clientId],
  //   queryFn: () => getClientById(clientId!),
  //   enabled: Number.isFinite(clientId) && clientId! > 0,
  // });

  // const client = clientResponse?.data;
  return (
    <section className="space-y-6 relative ">
      {/* Soft premium background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-blue-200/40 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-indigo-200/40 blur-3xl" />
        <div className="absolute inset-0 bg-linear-to-b from-slate-50 via-white to-white" />
      </div>

      <PageHeader
        title="القضايا"
        subtitle="إدارة ومتابعة القضايا والملفات القانونية."
        icon={Briefcase}
        isFetching={isFetching}
        countLabel={`${totalCount} قضية`}
        onAdd={() => router.push("/dashboard/cases/add")}
        addButtonLabel="إضافة قضية"
      />

      {/* Filters */}
      {/* <div className="rounded-2xl bg-white/90 backdrop-blur border border-gray-200/70 shadow-[0_10px_30px_-18px_rgba(0,0,0,0.35)] ring-1 ring-gray-200/50 overflow-hidden">
        <div className="px-4 sm:px-5 py-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3 relative">
        
          <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-blue-500 via-indigo-500 to-cyan-500" />

          <div className="flex items-center gap-2 text-sm font-medium text-gray-800">
            <span className="inline-flex items-center justify-center w-10 h-10 rounded-2xl bg-linear-to-br from-blue-50 to-indigo-50 border border-blue-200/60 shadow-sm">
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
      </div> */}
      <div className="rounded-3xl bg-white/80 backdrop-blur-xl border border-gray-200/60 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.1)] overflow-hidden transition-all">
        {/* Header Area */}
        <div className="px-6 py-5 border-b border-gray-100/80 flex flex-wrap items-center justify-between gap-4 relative">
          <div className="absolute inset-x-0 top-0 h-1.5 bg-linear-to-r from-primary/40 via-primary to-primary/40" />

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
              <SlidersHorizontal size={22} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 leading-none">
                فلاتر البحث
              </h3>
              <p className="text-sm text-gray-500 mt-1.5 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                تم العثور على{" "}
                <span className="font-bold text-gray-700">{totalCount}</span>{" "}
                نتيجة
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => refetch()}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl text-gray-600 hover:text-primary hover:bg-primary/5 transition-all active:scale-95"
            >
              <RefreshCw
                size={18}
                className={isFetching ? "animate-spin" : ""}
              />
              تحديث
            </button>

            <div className="w-px h-6 bg-gray-200 mx-1" />

            <button
              type="button"
              onClick={resetFilters}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl text-red-500 hover:bg-red-50 transition-all active:scale-95"
            >
              <X size={18} />
              إعادة ضبط
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Search Input - Taking more space */}
            <div className="lg:col-span-5">
              <label className="block text-sm font-bold text-gray-700 mb-2 mr-1">
                بحث متقدم
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-gray-400 group-focus-within:text-primary transition-colors">
                  <Search size={20} />
                </div>
                <input
                  type="text"
                  value={filters.Search ?? ""}
                  onChange={(e) => updateFilter("Search", e.target.value)}
                  placeholder="ابحث باسم القضية، الرقم، أو الموكل..."
                  className="w-full pr-12 pl-4 py-3.5 bg-gray-50/50 border border-gray-200 rounded-2xl text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary focus:bg-white transition-all shadow-sm"
                />
              </div>
            </div>

            {/* Select Wrappers - Custom Styled */}
            {[
              {
                label: "نوع القضية",
                key: "CaseType" as const,
                options: caseTypes,
              },
              {
                label: "حالة القضية",
                key: "CaseStatus" as const,
                options: caseStatuses,
              },
              {
                label: "ترتيب حسب",
                key: "Sort" as const,
                options: SORT_OPTIONS,
              },
            ].map((select, idx) => (
              <div key={idx} className="lg:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-2 mr-1">
                  {select.label}
                </label>
                <div className="relative group">
                  <select
                    value={String(
                      filters[select.key as keyof GetCasesQuery] || ""
                    )}
                    onChange={(e) =>
                      updateFilter(
                        select.key as keyof GetCasesQuery,
                        e.target.value
                      )
                    }
                    className="w-full appearance-none pr-4 pl-10 py-3.5 bg-gray-50/50 border border-gray-200 rounded-2xl text-gray-700 font-medium focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all cursor-pointer"
                  >
                    <option value="">الكل</option>
                    {select.options.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:rotate-180 transition-transform pointer-events-none"
                  />
                </div>
              </div>
            ))}

            {/* Page Size Segmented Control */}
            <div className="lg:col-span-4 flex flex-col justify-end">
              <label className="block text-sm font-bold text-gray-700 mb-2 mr-1">
                عدد النتائج
              </label>
              <div className="inline-flex p-1.5 bg-gray-100/80 rounded-2xl w-fit">
                {[5, 10, 20, 50].map((size) => {
                  const active = pageSize === size;
                  return (
                    <button
                      key={size}
                      type="button"
                      onClick={() => updateFilter("PageSize", size)}
                      className={`px-5 py-2 text-sm font-bold rounded-xl transition-all ${
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

            {/* Status Toggles & Error Display */}
            <div className="lg:col-span-8 flex flex-wrap items-center justify-between gap-4 mt-2">
              <div className="flex items-center p-1.5 bg-gray-100/80 rounded-2xl">
                {[
                  { value: false, label: "السجلات النشطة", icon: CheckCircle2 },
                  { value: true, label: "المؤرشفة", icon: Archive },
                ].map((opt) => {
                  const active = filters.IsDeleted === opt.value;
                  const Icon = opt.icon;
                  return (
                    <button
                      key={String(opt.value)}
                      type="button"
                      onClick={() => updateFilter("IsDeleted", opt.value)}
                      className={`flex items-center gap-2 px-6 py-2.5 text-sm font-bold rounded-xl transition-all ${
                        active
                          ? opt.value
                            ? "bg-red-500 text-white shadow-lg shadow-red-200"
                            : "bg-primary text-white shadow-lg shadow-primary/30"
                          : "text-gray-500 hover:bg-gray-200/50"
                      }`}
                    >
                      <Icon size={16} />
                      {opt.label}
                    </button>
                  );
                })}
              </div>

              {isError && (
                <div className="flex items-center gap-3 text-sm font-bold text-red-600 bg-red-50 border border-red-100 px-5 py-3 rounded-2xl animate-bounce-subtle">
                  <Info size={18} />
                  <span>
                    حدث خطأ في جلب البيانات:{" "}
                    {error instanceof Error ? error.message : "خطأ غير معروف"}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-3xl border border-gray-200/60 bg-white/80 backdrop-blur-xl shadow-[0_20px_50px_-20px_rgba(0,0,0,0.1)] ring-1 ring-gray-200/50">
        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-200">
          <table className="min-w-full border-separate border-spacing-0">
            <thead className="bg-gray-50/50 sticky top-0 z-10 backdrop-blur-md">
              <tr className="text-right text-xs font-bold uppercase tracking-wider text-gray-500">
                <th className="px-6 py-4 border-b border-gray-100 whitespace-nowrap">
                  رقم القضية
                </th>
                <th className="px-6 py-4 border-b border-gray-100">
                  تفاصيل القضية
                </th>
                <th className="px-6 py-4 border-b border-gray-100 whitespace-nowrap">
                  النوع
                </th>
                <th className="px-6 py-4 border-b border-gray-100 whitespace-nowrap">
                  الحالة
                </th>
                <th className="px-6 py-4 border-b border-gray-100 whitespace-nowrap">
                  العميل
                </th>
                <th className="px-6 py-4 border-b border-gray-100 whitespace-nowrap">
                  المحكمة
                </th>
                <th className="px-6 py-4 border-b border-gray-100 whitespace-nowrap text-center">
                  تاريخ الفتح
                </th>
                <th className="px-6 py-4 border-b border-gray-100 whitespace-nowrap text-center">
                  الإجراءات
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-50 bg-transparent">
              {isLoading ? (
                /* Enhanced Skeleton Loader */
                [...Array(6)].map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    {[...Array(8)].map((__, cellIdx) => (
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
              ) : cases.length === 0 ? (
                /* Enhanced Empty State */
                <tr>
                  <td colSpan={8} className="px-6 py-24 text-center">
                    <div className="flex flex-col items-center">
                      <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-gray-50 text-gray-400 ring-8 ring-gray-50/50">
                        <Briefcase size={40} strokeWidth={1.5} />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900">
                        لا توجد نتائج
                      </h3>
                      <p className="mt-1 text-gray-500">
                        جرّب تغيير البحث أو الفلاتر للعثور على ما تبحث عنه.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                cases.map((caseItem) => (
                  <tr
                    key={caseItem.id}
                    className="group transition-all duration-200 hover:bg-primary/2"
                  >
                    {/* رقم القضية المميز */}
                    <td className="px-6 py-5 whitespace-nowrap">
                      <span className="font-mono text-sm font-bold text-primary bg-primary/5 px-3 py-1.5 rounded-xl border border-primary/10 group-hover:bg-primary/10 transition-colors">
                        {caseItem.caseNumber}
                      </span>
                    </td>

                    {/* الاسم وID */}
                    <td className="px-6 py-5">
                      <button
                        onClick={() =>
                          router.push(`/dashboard/cases/${caseItem.id}`)
                        }
                        className="flex flex-col gap-1 max-w-85 cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <span className=" underline font-bold text-gray-900 leading-tight group-hover:text-primary transition-colors">
                            {caseItem.name}
                          </span>
                          {caseItem.isPrivate && (
                            <span
                              className="shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-amber-50 text-amber-600 border border-amber-100"
                              title="قضية خاصة"
                            >
                              <Lock size={12} />
                            </span>
                          )}
                        </div>
                        {/* <span className="text-[10px] font-medium tracking-wider text-gray-400 uppercase">
                          ID: {caseItem.id}
                        </span> */}
                      </button>
                    </td>

                    {/* النوع */}
                    <td className="px-6 py-5 whitespace-nowrap">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100/50 uppercase">
                        {caseItem.caseType.label}
                      </span>
                    </td>

                    {/* الحالة مع Dot Indicator */}
                    <td className="px-6 py-5 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border shadow-sm ${getStatusColor(
                          caseItem.caseStatus.value
                        )}`}
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" />
                        {caseItem.caseStatus.label}
                      </span>
                    </td>

                    {/* العميل والمحكمة */}
                    <td className="px-6 py-5 text-sm font-medium text-gray-600 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() =>
                          router.push(`/dashboard/clients/${caseItem.clientId}`)
                        }
                        className="hover:text-primary cursor-pointer underline hover:underline transition-colors "
                      >
                        {caseItem.clientName || "—"}
                      </button>
                    </td>
                    <td className="px-6 py-5 text-sm font-medium text-gray-600 whitespace-nowrap">
                      {caseItem.courtName || "—"}
                    </td>

                    {/* التاريخ */}
                    <td className="px-6 py-5 text-center text-sm font-medium text-gray-500 whitespace-nowrap">
                      {formatDateAr(caseItem.openedAt)}
                    </td>

                    {/* أزرار الإجراءات الفخمة */}
                    <td className="px-6 py-5">
                      <div className="flex items-center justify-center gap-2">
                        <IconButton
                          title="عرض"
                          // className="w-9 h-9 rounded-xl bg-white border border-gray-200 text-blue-600 hover:bg-blue-50 hover:border-blue-200 transition-all active:scale-90 shadow-sm"
                          onClick={() =>
                            router.push(`/dashboard/cases/${caseItem.id}`)
                          }
                        >
                          <Eye size={16} strokeWidth={2.5} />
                        </IconButton>

                        <IconButton
                          title="تعديل"
                          // className="w-9 h-9 rounded-xl bg-white border border-gray-200 text-indigo-600 hover:bg-indigo-50 hover:border-indigo-200 transition-all active:scale-90 shadow-sm"
                          onClick={() => {
                            setEditCaseId(caseItem.id);
                            setShowEditModal(true);
                          }}
                        >
                          <Pencil size={16} strokeWidth={2.5} />
                        </IconButton>

                        {filters.IsDeleted ? (
                          <>
                            <IconButton
                              title="استعادة"
                              // className="w-9 h-9 rounded-xl bg-white border border-gray-200 text-green-600 hover:bg-green-50 hover:border-green-200 transition-all active:scale-90 shadow-sm"
                              disabled={restoreMutation.isPending}
                              onClick={() =>
                                handleRestore(caseItem.id, caseItem.name)
                              }
                            >
                              {restoreMutation.isPending ? (
                                <Loader2 size={16} className="animate-spin" />
                              ) : (
                                <RotateCcw size={16} strokeWidth={2.5} />
                              )}
                            </IconButton>

                            <IconButton
                              title="حذف نهائي"
                              // className="w-9 h-9 rounded-xl bg-white border border-gray-200 text-red-600 hover:bg-red-50 hover:border-red-200 transition-all active:scale-90 shadow-sm"
                              disabled={hardDeleteMutation.isPending}
                              onClick={() =>
                                handleHardDelete(caseItem.id, caseItem.name)
                              }
                            >
                              {hardDeleteMutation.isPending ? (
                                <Loader2 size={16} className="animate-spin" />
                              ) : (
                                <Trash2 size={16} strokeWidth={2.5} />
                              )}
                            </IconButton>
                          </>
                        ) : (
                          <IconButton
                            title="أرشفة"
                            // className="w-9 h-9 rounded-xl bg-white border border-gray-200 text-amber-600 hover:bg-amber-50 hover:border-amber-200 transition-all active:scale-90 shadow-sm"
                            disabled={softDeleteMutation.isPending}
                            onClick={() =>
                              handleSoftDelete(caseItem.id, caseItem.name)
                            }
                          >
                            {softDeleteMutation.isPending ? (
                              <Loader2 size={16} className="animate-spin" />
                            ) : (
                              <Archive size={16} strokeWidth={2.5} />
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
      <div className="flex flex-col md:flex-row items-center justify-between gap-5 rounded-3xl border border-gray-200/60 bg-white/80 backdrop-blur-xl px-6 py-4 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.1)] ring-1 ring-gray-200/50 mt-6">
        {/* قسم الإحصائيات (Stats) */}
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/5 text-primary shadow-inner">
            <FileText size={18} />
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
            <div className="text-sm font-medium text-gray-500">
              صفحة <span className="font-bold text-gray-900">{pageNumber}</span>{" "}
              من <span className="font-bold text-gray-900">{totalPages}</span>
            </div>
            <span className="hidden sm:block h-4 w-px bg-gray-200" />
            <div className="text-sm font-medium text-gray-500">
              عرض <span className="text-primary font-bold">{cases.length}</span>{" "}
              من أصل{" "}
              <span className="font-bold text-gray-900">{totalCount}</span> سجل
            </div>
          </div>
        </div>

        {/* قسم التحكم (Controls) */}
        <div className="flex items-center gap-3">
          {/* زر السابق */}
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

          {/* إدخال رقم الصفحة السريع */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-2xl border border-gray-100 focus-within:border-primary/30 focus-within:ring-4 focus-within:ring-primary/10 transition-all">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-tighter">
              اذهب لـ
            </span>
            <input
              type="number"
              min={1}
              max={totalPages}
              value={pageNumber}
              onChange={(e) => handlePageChange(Number(e.target.value))}
              className="w-12 bg-transparent text-center text-sm font-extrabold text-primary focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>

          {/* زر التالي */}
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
