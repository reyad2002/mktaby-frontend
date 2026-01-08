"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { LucideIcon } from "lucide-react";
import {
  Receipt,
  Plus,
  X,
  Loader2,
  Edit,
  Trash2,
  AlertCircle,
  Search,
  SlidersHorizontal,
  RefreshCw,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Info,
  DollarSign,
  Calendar,
  Briefcase,
  Eye,
  Scale,
  Building,
  Users,
  FileText,
  Hash,
} from "lucide-react";
import toast from "react-hot-toast";

import {
  getCaseFees,
  deleteCaseFee,
} from "@/features/accounting/apis/CaseFeesApi";
import { getCaseById, getCases } from "@/features/cases/apis/casesApis";
import AddCaseFeeForm from "@/features/accounting/components/AddCaseFeeForm";
import EditCaseFeeForm from "@/features/accounting/components/EditCaseFeeForm";
import CaseAccountingDetails from "@/features/accounting/components/CaseAccountingDetails";
import PageHeader from "@/shared/components/dashboard/PageHeader";
import type {
  GetCaseFeesQuery,
  CaseFeeDto,
} from "@/features/accounting/types/CaseFeesTypes";
import type {
  CaseDetails,
  CaseListItem,
} from "@/features/cases/types/casesTypes";

const DEFAULT_FEE_FILTERS: GetCaseFeesQuery = {
  PageNumber: 1,
  PageSize: 10,
  Search: "",
  Sort: "",
  IsDeleted: false,
  CaseId: undefined,
  ClientId: undefined,
  CreatedAtStart: undefined,
  CreatedAtEnd: undefined,
  ToBePaidAtStart: undefined,
  ToBePaidAtEnd: undefined,
};

const SORT_OPTIONS = [
  { value: "", label: "بدون ترتيب" },
  { value: "createdAt desc", label: "الأحدث أولاً" },
  { value: "createdAt asc", label: "الأقدم أولاً" },
  { value: "amount desc", label: "الأعلى مبلغاً" },
  { value: "amount asc", label: "الأقل مبلغاً" },
  { value: "toBePaidAt asc", label: "الاستحقاق الأقرب" },
  { value: "toBePaidAt desc", label: "الاستحقاق الأبعد" },
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

const formatDateShortAr = (date: string) =>
  new Date(date).toLocaleDateString("ar-EG", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("ar-EG", {
    style: "currency",
    currency: "EGP",
  }).format(amount);

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
          <Receipt className="text-gray-500" size={20} />
        </div>
        <p className="text-gray-800 font-semibold">لا توجد رسوم مطابقة.</p>
        <p className="text-sm text-gray-600 mt-1">
          جرّب تغيير الفلاتر أو البحث.
        </p>
      </div>
    </div>
  );
}

export default function CaseFeesPage() {
  const [filters, setFilters] = useState<GetCaseFeesQuery>(DEFAULT_FEE_FILTERS);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [showCaseDetailsModal, setShowCaseDetailsModal] = useState(false);
  const [showAccountingDetailsModal, setShowAccountingDetailsModal] =
    useState(false);
  const [selectedCaseId, setSelectedCaseId] = useState<number | null>(null);

  useLockBodyScroll(
    showAddModal ||
      showEditModal ||
      showCaseDetailsModal ||
      showAccountingDetailsModal
  );

  const { data: caseDetailsData, isLoading: caseDetailsLoading } = useQuery({
    queryKey: ["case", selectedCaseId],
    queryFn: () => getCaseById(selectedCaseId!),
    enabled: !!selectedCaseId && showCaseDetailsModal,
  });

  const caseDetails: CaseDetails | undefined = caseDetailsData?.data;
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: deleteCaseFee,
    onSuccess: (response) => {
      if (response?.succeeded) {
        toast.success(response.message || "تم حذف الرسوم بنجاح");
        queryClient.invalidateQueries({ queryKey: ["caseFees"] });
      } else {
        toast.error(response?.message || "تعذر حذف الرسوم");
      }
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err?.response?.data?.message || "حدث خطأ أثناء حذف الرسوم");
    },
  });

  const handleDelete = (id: number) => {
    if (
      window.confirm(
        `هل أنت متأكد من حذف هذه الرسوم؟\nلا يمكن التراجع عن هذا الإجراء.`
      )
    ) {
      deleteMutation.mutate(id);
    }
  };

  const queryParams = useMemo(() => {
    return {
      ...filters,
      Search: filters.Search?.trim() || undefined,
      Sort: filters.Sort || undefined,
      IsDeleted: filters.IsDeleted ? true : undefined,
      CaseId: filters.CaseId || undefined,
      ClientId: filters.ClientId || undefined,
      CreatedAtStart: filters.CreatedAtStart || undefined,
      CreatedAtEnd: filters.CreatedAtEnd || undefined,
      ToBePaidAtStart: filters.ToBePaidAtStart || undefined,
      ToBePaidAtEnd: filters.ToBePaidAtEnd || undefined,
    } satisfies GetCaseFeesQuery;
  }, [filters]);

  const {
    data: feesData,
    isLoading,
    isError,
    error: errorData,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ["caseFees", queryParams],
    queryFn: () => getCaseFees(queryParams),
    staleTime: 10_000,
  });

  const fees: CaseFeeDto[] = useMemo(
    () => feesData?.data?.data ?? [],
    [feesData]
  );
  const totalCount = feesData?.data?.count ?? 0;

  const allCaseIds = useMemo(() => {
    return [...new Set(fees.map((fee) => fee.caseId))];
  }, [fees]);

  const { data: casesData } = useQuery({
    queryKey: ["cases", "forFees", allCaseIds],
    queryFn: () => getCases({ PageSize: 100 }),
    enabled: allCaseIds.length > 0,
    staleTime: 30_000,
  });

  const casesMap = useMemo(() => {
    const map = new Map<number, CaseListItem>();
    if (casesData?.data?.data) {
      casesData.data.data.forEach((caseItem) => {
        map.set(caseItem.id, caseItem);
      });
    }
    return map;
  }, [casesData]);

  const pageNumber = filters.PageNumber ?? 1;
  const pageSize = filters.PageSize ?? 10;
  const totalPages = Math.max(1, Math.ceil(totalCount / (pageSize || 1)));

  const updateFilter = <K extends keyof GetCaseFeesQuery>(
    key: K,
    value: GetCaseFeesQuery[K]
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

  const resetFilters = () => setFilters(DEFAULT_FEE_FILTERS);

  const isOverdue = (toBePaidAt: string) => {
    return new Date(toBePaidAt) < new Date();
  };

  return (
    <section className="space-y-6 relative">
      {/* Soft premium background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-blue-200/40 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-indigo-200/40 blur-3xl" />
        <div className="absolute inset-0 bg-linear-to-b from-slate-50 via-white to-white" />
      </div>

      <PageHeader
        title="رسوم القضايا"
        subtitle="إدارة رسوم القضايا وتتبع المستحقات."
        icon={Receipt}
        countLabel={`${totalCount} رسوم`}
        onAdd={() => setShowAddModal(true)}
        addButtonLabel="إضافة رسوم"
        isFetching={isFetching}
      />

      {/* Filters */}
      <div className="rounded-2xl bg-white/90 backdrop-blur border border-gray-200/70 shadow-[0_10px_30px_-18px_rgba(0,0,0,0.35)] ring-1 ring-gray-200/50 overflow-hidden">
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
            {/* Search */}
            <div className="lg:col-span-3">
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
                  placeholder="ابحث..."
                  className="w-full pr-9 pl-3 py-2.5 border border-gray-200 rounded-xl text-gray-700 bg-white focus:outline-none focus:ring-4 focus:ring-blue-200/70 focus:border-blue-300"
                />
              </div>
            </div>

            {/* Case ID Filter */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                رقم القضية
              </label>
              <input
                type="number"
                value={filters.CaseId ?? ""}
                onChange={(e) =>
                  updateFilter(
                    "CaseId",
                    e.target.value ? Number(e.target.value) : undefined
                  )
                }
                placeholder="CaseId"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:ring-4 focus:ring-blue-200/70 focus:border-blue-300 bg-white"
              />
            </div>

            {/* Client ID Filter */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                رقم العميل
              </label>
              <input
                type="number"
                value={filters.ClientId ?? ""}
                onChange={(e) =>
                  updateFilter(
                    "ClientId",
                    e.target.value ? Number(e.target.value) : undefined
                  )
                }
                placeholder="ClientId"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:ring-4 focus:ring-blue-200/70 focus:border-blue-300 bg-white"
              />
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

            {/* Status */}
            <div className="lg:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الحالة
              </label>
              <div className="grid grid-cols-2 gap-2">
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
                      className={`rounded-xl px-3 py-2 text-sm transition-all border ${
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
            </div>

            {/* Created At Start */}
            <div className="lg:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                تاريخ الإنشاء (من)
              </label>
              <input
                type="date"
                value={filters.CreatedAtStart ?? ""}
                onChange={(e) =>
                  updateFilter("CreatedAtStart", e.target.value || undefined)
                }
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:ring-4 focus:ring-blue-200/70 focus:border-blue-300 bg-white"
              />
            </div>

            {/* Created At End */}
            <div className="lg:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                تاريخ الإنشاء (إلى)
              </label>
              <input
                type="date"
                value={filters.CreatedAtEnd ?? ""}
                onChange={(e) =>
                  updateFilter("CreatedAtEnd", e.target.value || undefined)
                }
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:ring-4 focus:ring-blue-200/70 focus:border-blue-300 bg-white"
              />
            </div>

            {/* To Be Paid At Start */}
            <div className="lg:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                تاريخ الاستحقاق (من)
              </label>
              <input
                type="date"
                value={filters.ToBePaidAtStart ?? ""}
                onChange={(e) =>
                  updateFilter("ToBePaidAtStart", e.target.value || undefined)
                }
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:ring-4 focus:ring-blue-200/70 focus:border-blue-300 bg-white"
              />
            </div>

            {/* To Be Paid At End */}
            <div className="lg:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                تاريخ الاستحقاق (إلى)
              </label>
              <input
                type="date"
                value={filters.ToBePaidAtEnd ?? ""}
                onChange={(e) =>
                  updateFilter("ToBePaidAtEnd", e.target.value || undefined)
                }
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:ring-4 focus:ring-blue-200/70 focus:border-blue-300 bg-white"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <LoadingState />
      ) : isError ? (
        <ErrorState message={(errorData as Error)?.message} />
      ) : fees.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="rounded-2xl bg-white/90 backdrop-blur border border-gray-200/70 shadow-[0_10px_30px_-18px_rgba(0,0,0,0.35)] ring-1 ring-gray-200/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead className="bg-linear-to-b from-gray-50 to-white sticky top-0 z-10">
                <tr className="border-b border-gray-200">
                  <th className="px-4 py-4 text-sm font-semibold text-gray-900">
                    اسم القضية
                  </th>
                  <th className="px-4 py-4 text-sm font-semibold text-gray-900">
                    رقم القضية
                  </th>
                  <th className="px-4 py-4 text-sm font-semibold text-gray-900">
                    المبلغ
                  </th>
                  <th className="px-4 py-4 text-sm font-semibold text-gray-900">
                    تاريخ الاستحقاق
                  </th>
                  <th className="px-4 py-4 text-sm font-semibold text-gray-900">
                    تاريخ الإنشاء
                  </th>
                  <th className="px-4 py-4 text-sm font-semibold text-gray-900">
                    الإجراءات
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200 bg-white">
                {fees.map((fee, index) => (
                  <tr
                    key={fee.id}
                    className={`text-sm text-gray-800 transition-colors ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50/40"
                    } hover:bg-linear-to-r hover:from-blue-50/60 hover:to-transparent`}
                  >
                    <td className="px-4 py-4 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedCaseId(fee.caseId);
                          setShowCaseDetailsModal(true);
                        }}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-semibold border bg-blue-50 text-blue-800 border-blue-200 hover:bg-blue-100 hover:border-blue-300 transition-all cursor-pointer group"
                      >
                        <Briefcase size={14} />
                        <span>{casesMap.get(fee.caseId)?.name || "—"}</span>
                        <Eye
                          size={12}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-blue-600"
                        />
                      </button>
                    </td>

                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold border bg-gray-100 text-gray-800 border-gray-200">
                        <Hash size={12} />
                        {casesMap.get(fee.caseId)?.caseNumber || fee.caseId}
                      </span>
                    </td>

                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center justify-center w-9 h-9 rounded-2xl bg-linear-to-br from-emerald-50 to-green-50 border border-emerald-200/60 shadow-sm">
                          <DollarSign size={16} className="text-emerald-700" />
                        </span>
                        <span className="font-semibold text-gray-900">
                          {formatCurrency(fee.amount)}
                        </span>
                      </div>
                    </td>

                    <td className="px-4 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                          isOverdue(fee.toBePaidAt)
                            ? "bg-red-50 text-red-800 border-red-200"
                            : "bg-gray-50 text-gray-800 border-gray-200"
                        }`}
                      >
                        <Calendar size={12} />
                        {formatDateShortAr(fee.toBePaidAt)}
                        {isOverdue(fee.toBePaidAt) && (
                          <span className="text-red-600">(متأخر)</span>
                        )}
                      </span>
                    </td>

                    <td className="px-4 py-4 text-gray-700 whitespace-nowrap">
                      {fee.createdAt ? formatDateShortAr(fee.createdAt) : "—"}
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <IconButton
                          title="التفاصيل المالية"
                          variant="green"
                          onClick={() => {
                            setSelectedCaseId(fee.caseId);
                            setShowAccountingDetailsModal(true);
                          }}
                        >
                          <Eye size={16} />
                        </IconButton>

                        <IconButton
                          title="تعديل"
                          variant="purple"
                          onClick={() => {
                            setEditId(fee.id);
                            setShowEditModal(true);
                          }}
                        >
                          <Edit size={16} />
                        </IconButton>

                        <IconButton
                          title="حذف"
                          variant="red"
                          disabled={deleteMutation.isPending}
                          onClick={() => handleDelete(fee.id)}
                        >
                          {deleteMutation.isPending ? (
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
            <span className="font-semibold text-gray-900">{fees.length}</span>{" "}
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
      {showAddModal && (
        <ModalShell
          title="إضافة رسوم جديدة"
          icon={Plus}
          iconClassName="text-blue-700"
          onClose={() => setShowAddModal(false)}
        >
          <AddCaseFeeForm
            onSuccess={() => {
              setShowAddModal(false);
              queryClient.invalidateQueries({ queryKey: ["caseFees"] });
            }}
            onCancel={() => setShowAddModal(false)}
          />
        </ModalShell>
      )}

      {/* Edit Modal */}
      {showEditModal && editId && (
        <ModalShell
          title="تعديل الرسوم"
          icon={Edit}
          iconClassName="text-purple-700"
          onClose={() => setShowEditModal(false)}
        >
          <EditCaseFeeForm
            feeId={editId}
            onSuccess={() => {
              setShowEditModal(false);
              setEditId(null);
              queryClient.invalidateQueries({ queryKey: ["caseFees"] });
            }}
            onCancel={() => {
              setShowEditModal(false);
              setEditId(null);
            }}
          />
        </ModalShell>
      )}

      {/* Case Details Modal */}
      {showCaseDetailsModal && selectedCaseId && (
        <ModalShell
          title="تفاصيل القضية"
          icon={Briefcase}
          iconClassName="text-blue-700"
          onClose={() => {
            setShowCaseDetailsModal(false);
            setSelectedCaseId(null);
          }}
        >
          {caseDetailsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="animate-spin text-blue-600" size={40} />
            </div>
          ) : caseDetails ? (
            <div className="space-y-4">
              <div className="p-4 bg-linear-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200/60">
                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  {caseDetails.name}
                </h3>
                <p className="text-sm text-gray-600">
                  رقم القضية:{" "}
                  <span className="font-semibold">
                    {caseDetails.caseNumber}
                  </span>
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
                    <Scale size={12} />
                    نوع القضية
                  </div>
                  <p className="text-sm font-semibold text-gray-900">
                    {caseDetails.caseType?.label || "—"}
                  </p>
                </div>

                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
                    <Info size={12} />
                    حالة القضية
                  </div>
                  <p className="text-sm font-semibold text-gray-900">
                    {caseDetails.caseStatus?.label || "—"}
                  </p>
                </div>

                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
                    <Users size={12} />
                    العميل
                  </div>
                  <p className="text-sm font-semibold text-gray-900">
                    {caseDetails.clientName || "—"}
                  </p>
                </div>

                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
                    <Building size={12} />
                    المحكمة
                  </div>
                  <p className="text-sm font-semibold text-gray-900">
                    {caseDetails.courtName || "—"}
                  </p>
                </div>
              </div>

              {caseDetails.notes && (
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
                    <FileText size={12} />
                    ملاحظات
                  </div>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {caseDetails.notes}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              لم يتم العثور على تفاصيل القضية
            </div>
          )}
        </ModalShell>
      )}

      {/* Case Accounting Details Modal */}
      {showAccountingDetailsModal && selectedCaseId && (
        <ModalShell
          title="التفاصيل المالية للقضية"
          icon={DollarSign}
          iconClassName="text-emerald-700"
          onClose={() => {
            setShowAccountingDetailsModal(false);
            setSelectedCaseId(null);
          }}
        >
          <CaseAccountingDetails caseId={selectedCaseId} />
        </ModalShell>
      )}
    </section>
  );
}
