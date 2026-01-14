"use client";

import { useEffect, useMemo, useRef, useState } from "react";

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
  Check,
} from "lucide-react";

import {
  useCases,
  useCaseTypes,
  useCaseStatuses,
  useSoftDeleteCase,
  useHardDeleteCase,
  useRestoreCase,
  useArchiveCase,
  useUnarchiveCase,
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
  IsArchived: false,
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

type Opt = { label: string; value: string | number };

type Props = {
  label: string;
  value: string | number | "";
  options: Opt[];
  placeholder?: string;
  onChange: (val: string | number | "") => void;
};

export function CustomSelect({
  label,
  value,
  options,
  placeholder = "الكل",
  onChange,
}: Props) {
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
          {/* Search inside dropdown */}
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

          {/* Options */}
          <div className="max-h-72 overflow-auto p-2">
            {/* All option */}
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
  const [moreOpen, setMoreOpen] = useState(false);

  useLockBodyScroll(showEditModal);

  // Lookups using hooks
  const { data: caseTypes = [] } = useCaseTypes();
  const { data: caseStatuses = [] } = useCaseStatuses();

  // Mutations using hooks
  const softDeleteMutation = useSoftDeleteCase();
  const hardDeleteMutation = useHardDeleteCase();
  const restoreMutation = useRestoreCase();
  const archiveMutation = useArchiveCase();
  const unarchiveMutation = useUnarchiveCase();

  const queryParams = useMemo(() => {
    return {
      ...filters,
      Search: filters.Search?.trim() || undefined,
      Sort: filters.Sort || undefined,
      CaseType: filters.CaseType || undefined,
      CaseStatus: filters.CaseStatus || undefined,
      IsDeleted: filters.IsDeleted ? true : undefined,
      IsArchived: filters.IsArchived,
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
      window.confirm(`هل تريد حذف القضية "${name}"؟\nيمكن استعادتها لاحقاً.`)
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

  const handleArchive = (id: number, name: string) => {
    if (
      window.confirm(
        `هل تريد أرشفة القضية "${name}"؟\nيمكن إلغاء الأرشفة لاحقاً.`
      )
    ) {
      archiveMutation.mutate(id);
    }
  };

  const handleUnarchive = (id: number, name: string) => {
    if (window.confirm(`هل تريد إلغاء أرشفة القضية "${name}"؟`)) {
      unarchiveMutation.mutate(id);
    }
  };

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

      {/* Main Content Area */}
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end">
          {/* Search Input (ONLY visible filter) */}
          <div className="lg:col-span-9">
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

          {/* Filters Dropdown Button */}
          <div className="lg:col-span-3 relative">
            <button
              type="button"
              onClick={() => setMoreOpen((p) => !p)}
              className={`w-full h-13 flex items-center justify-between gap-3 px-5 rounded-2xl border font-extrabold transition-all ${
                moreOpen
                  ? "bg-white border-primary/40 ring-4 ring-primary/10"
                  : "bg-gray-50/50 border-gray-200 hover:bg-white"
              }`}
            >
              <span className="flex items-center gap-2 text-gray-700">
                <SlidersHorizontal size={18} className="text-primary" />
                الفلاتر
              </span>
              <ChevronDown
                size={18}
                className={`transition-transform ${
                  moreOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {moreOpen && (
              <>
                {/* click away */}
                <button
                  type="button"
                  onClick={() => setMoreOpen(false)}
                  className="fixed inset-0 z-40 cursor-default"
                />

                <div className="absolute left-0 right-0 mt-3 z-50 rounded-3xl bg-white/95 backdrop-blur-xl border border-gray-200/70 shadow-[0_30px_70px_-30px_rgba(0,0,0,0.3)]">
                  <div className="p-5 grid grid-cols-1 gap-5">
                    {/* Page Size */}
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        عدد النتائج
                      </label>
                      <div className="inline-flex p-1.5 bg-gray-100/80 rounded-2xl">
                        {[5, 10, 20, 50].map((size) => {
                          const active = pageSize === size;
                          return (
                            <button
                              key={size}
                              type="button"
                              onClick={() => updateFilter("PageSize", size)}
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

                    {/* Select Filters */}
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
                    ].map((select) => (
                      <CustomSelect
                        key={select.key}
                        label={select.label}
                        value={String(filters[select.key] || "")}
                        options={select.options}
                        placeholder="الكل"
                        onChange={(val) =>
                          updateFilter(
                            select.key,
                            val === "" ? undefined : (val as never)
                          )
                        }
                      />
                    ))}

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                      <button
                        type="button"
                        onClick={resetFilters}
                        className="flex-1 px-4 py-3 text-sm font-extrabold rounded-2xl text-red-500 bg-red-50 hover:bg-red-100"
                      >
                        إعادة ضبط
                      </button>
                      <button
                        type="button"
                        onClick={() => setMoreOpen(false)}
                        className="flex-1 px-4 py-3 text-sm font-extrabold rounded-2xl text-gray-700 bg-gray-100 hover:bg-gray-200"
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
        {/* Status */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2 mt-6">
            حالة السجلات
          </label>
          <div className="flex items-center p-1.5 bg-gray-100/80 rounded-2xl">
            {[
              {
                key: "active",
                label: "النشطة",
                icon: CheckCircle2,
                color: "bg-primary",
              },
              {
                key: "archived",
                label: "المؤرشفة",
                icon: Archive,
                color: "bg-amber-500",
              },
              {
                key: "deleted",
                label: "المحذوفة",
                icon: Trash2,
                color: "bg-red-500",
              },
            ].map((opt) => {
              const isActive =
                opt.key === "active" &&
                !filters.IsArchived &&
                !filters.IsDeleted;
              const isArchived =
                opt.key === "archived" &&
                filters.IsArchived &&
                !filters.IsDeleted;
              const isDeleted = opt.key === "deleted" && filters.IsDeleted;
              const active = isActive || isArchived || isDeleted;
              const Icon = opt.icon;
              return (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => {
                    if (opt.key === "active") {
                      setFilters((prev) => ({
                        ...prev,
                        IsArchived: false,
                        IsDeleted: false,
                        PageNumber: 1,
                      }));
                    } else if (opt.key === "archived") {
                      setFilters((prev) => ({
                        ...prev,
                        IsArchived: true,
                        IsDeleted: false,
                        PageNumber: 1,
                      }));
                    } else {
                      setFilters((prev) => ({
                        ...prev,
                        IsArchived: false,
                        IsDeleted: true,
                        PageNumber: 1,
                      }));
                    }
                  }}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-bold rounded-xl transition-all ${
                    active
                      ? `${opt.color} text-white`
                      : "text-gray-500 hover:bg-gray-200/50"
                  }`}
                >
                  <Icon size={16} />
                  {opt.label}
                </button>
              );
            })}
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

                    {/* أزرار الإجراءات  */}
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
                          /* Deleted cases: Restore or Hard Delete */
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
                                <RotateCcw size={16} strokeWidth={2.5} />
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
                                <Trash2 size={16} strokeWidth={2.5} />
                              )}
                            </IconButton>
                          </>
                        ) : filters.IsArchived ? (
                          /* Archived cases: Unarchive or Delete */
                          <>
                            <IconButton
                              title="إلغاء الأرشفة"
                              variant="green"
                              disabled={unarchiveMutation.isPending}
                              onClick={() =>
                                handleUnarchive(caseItem.id, caseItem.name)
                              }
                            >
                              {unarchiveMutation.isPending ? (
                                <Loader2 size={16} className="animate-spin" />
                              ) : (
                                <RotateCcw size={16} strokeWidth={2.5} />
                              )}
                            </IconButton>

                            <IconButton
                              title="حذف"
                              variant="red"
                              disabled={softDeleteMutation.isPending}
                              onClick={() =>
                                handleSoftDelete(caseItem.id, caseItem.name)
                              }
                            >
                              {softDeleteMutation.isPending ? (
                                <Loader2 size={16} className="animate-spin" />
                              ) : (
                                <Trash2 size={16} strokeWidth={2.5} />
                              )}
                            </IconButton>
                          </>
                        ) : (
                          /* Active cases: Archive or Delete */
                          <>
                            <IconButton
                              title="أرشفة"
                              variant="orange"
                              disabled={archiveMutation.isPending}
                              onClick={() =>
                                handleArchive(caseItem.id, caseItem.name)
                              }
                            >
                              {archiveMutation.isPending ? (
                                <Loader2 size={16} className="animate-spin" />
                              ) : (
                                <Archive size={16} strokeWidth={2.5} />
                              )}
                            </IconButton>

                            <IconButton
                              title="حذف"
                              variant="red"
                              disabled={softDeleteMutation.isPending}
                              onClick={() =>
                                handleSoftDelete(caseItem.id, caseItem.name)
                              }
                            >
                              {softDeleteMutation.isPending ? (
                                <Loader2 size={16} className="animate-spin" />
                              ) : (
                                <Trash2 size={16} strokeWidth={2.5} />
                              )}
                            </IconButton>
                          </>
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
