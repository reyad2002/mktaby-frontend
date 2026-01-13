"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { LucideIcon } from "lucide-react";
import {
  CreditCard,
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
  DollarSign,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Hash,
} from "lucide-react";
import toast from "react-hot-toast";

import {
  getFeePayments,
  deleteFeePayment,
} from "@/features/accounting/apis/FeePaymentApi";
import { getCaseFees } from "@/features/accounting/apis/CaseFeesApi";
import AddFeePaymentForm from "@/features/accounting/components/AddFeePaymentForm";
import EditFeePaymentForm from "@/features/accounting/components/EditFeePaymentForm";
import PageHeader from "@/shared/components/dashboard/PageHeader";
import type {
  GetFeePaymentsQuery,
  FeePaymentDto,
} from "@/features/accounting/types/FeePaymentTypes";
import type { CaseFeeDto } from "@/features/accounting/types/CaseFeesTypes";

const DEFAULT_FILTERS: GetFeePaymentsQuery = {
  PageNumber: 1,
  PageSize: 10,
  Search: "",
  Sort: "",
  IsDeleted: false,
};

const SORT_OPTIONS = [
  { value: "", label: "بدون ترتيب" },
  { value: "paymentDate desc", label: "تاريخ الدفع (الأحدث)" },
  { value: "paymentDate asc", label: "تاريخ الدفع (الأقدم)" },
  { value: "amount desc", label: "المبلغ (الأعلى)" },
  { value: "amount asc", label: "المبلغ (الأقل)" },
  { value: "dueDate asc", label: "الاستحقاق (الأقرب)" },
  { value: "dueDate desc", label: "الاستحقاق (الأبعد)" },
];

const PAYMENT_METHODS = [
  { value: "", label: "الكل" },
  { value: "Cash", label: "نقداً" },
  { value: "CreditCard", label: "بطاقة ائتمان" },
  { value: "BankTransfer", label: "تحويل بنكي" },
  { value: "MobilePayment", label: "دفع موبايل" },
  { value: "Check", label: "شيك" },
];

const PAYMENT_STATUS_OPTIONS = [
  { value: "", label: "الكل" },
  { value: "Unpaid", label: "غير مدفوع" },
  { value: "Paid", label: "مدفوع" },
  { value: "Overdue", label: "متأخر" },
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
  iconClassName = "text-purple-700",
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
              <span className="inline-flex items-center justify-center w-10 h-10 rounded-2xl bg-linear-to-br from-purple-50 to-indigo-50 border border-purple-200/60 shadow-sm">
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
        "focus:outline-none focus:ring-4 focus:ring-purple-200/70",
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

const getPaymentMethodLabel = (method: string) => {
  const labels: Record<string, string> = {
    Cash: "نقداً",
    CreditCard: "بطاقة ائتمان",
    BankTransfer: "تحويل بنكي",
    MobilePayment: "دفع موبايل",
    Check: "شيك",
  };
  return labels[method] || method;
};

const getStatusConfig = (status: string) => {
  const configs: Record<
    string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    { label: string; icon: any; className: string }
  > = {
    Paid: {
      label: "مدفوع",
      icon: CheckCircle,
      className: "bg-emerald-50 text-emerald-800 border-emerald-200",
    },
    Unpaid: {
      label: "غير مدفوع",
      icon: XCircle,
      className: "bg-gray-50 text-gray-800 border-gray-200",
    },
    Overdue: {
      label: "متأخر",
      icon: Clock,
      className: "bg-red-50 text-red-800 border-red-200",
    },
  };
  return configs[status] || configs.Unpaid;
};

function LoadingState() {
  return (
    <div className="flex items-center justify-center min-h-[55vh]">
      <Loader2 className="animate-spin text-purple-600" size={48} />
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
          <CreditCard className="text-gray-500" size={20} />
        </div>
        <p className="text-gray-800 font-semibold">لا توجد دفعات مطابقة.</p>
        <p className="text-sm text-gray-600 mt-1">
          جرّب تغيير الفلاتر أو البحث.
        </p>
      </div>
    </div>
  );
}

export default function FeePaymentsPage() {
  const [filters, setFilters] = useState<GetFeePaymentsQuery>(DEFAULT_FILTERS);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);

  useLockBodyScroll(showAddModal || showEditModal);

  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: deleteFeePayment,
    onSuccess: (response) => {
      if (response?.succeeded) {
        toast.success(response.message || "تم حذف الدفعة بنجاح");
        queryClient.invalidateQueries({ queryKey: ["feePayments"] });
      } else {
        toast.error(response?.message || "تعذر حذف الدفعة");
      }
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err?.response?.data?.message || "حدث خطأ أثناء حذف الدفعة");
    },
  });

  const handleDelete = (id: number) => {
    if (
      window.confirm(
        `هل أنت متأكد من حذف هذه الدفعة؟\nلا يمكن التراجع عن هذا الإجراء.`
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
      PaymentMethod: filters.PaymentMethod || undefined,
      Status: filters.Status || undefined,
      AmountStart: filters.AmountStart || undefined,
      AmountEnd: filters.AmountEnd || undefined,
      PaymentDateStart: filters.PaymentDateStart || undefined,
      PaymentDateEnd: filters.PaymentDateEnd || undefined,
      DueDateStart: filters.DueDateStart || undefined,
      DueDateEnd: filters.DueDateEnd || undefined,
    } satisfies GetFeePaymentsQuery;
  }, [filters]);

  const {
    data: paymentsData,
    isLoading,
    isError,
    error: errorData,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ["feePayments", queryParams],
    queryFn: () => getFeePayments(queryParams),
    staleTime: 10_000,
  });

  const payments: FeePaymentDto[] = useMemo(
    () => paymentsData?.data?.data ?? [],
    [paymentsData]
  );
  const totalCount = paymentsData?.data?.count ?? 0;

  // Fetch case fees for mapping
  const allFeeIds = useMemo(() => {
    return [...new Set(payments.map((payment) => payment.caseId))];
  }, [payments]);

  const { data: feesData } = useQuery({
    queryKey: ["caseFees", "forPayments", allFeeIds],
    queryFn: () => getCaseFees({ PageSize: 100 }),
    enabled: allFeeIds.length > 0,
    staleTime: 30_000,
  });

  const feesMap = useMemo(() => {
    const map = new Map<number, CaseFeeDto>();
    if (feesData?.data?.data) {
      feesData.data.data.forEach((fee) => {
        map.set(fee.id, fee);
      });
    }
    return map;
  }, [feesData]);

  const pageNumber = filters.PageNumber ?? 1;
  const pageSize = filters.PageSize ?? 10;
  const totalPages = Math.max(1, Math.ceil(totalCount / (pageSize || 1)));

  const updateFilter = <K extends keyof GetFeePaymentsQuery>(
    key: K,
    value: GetFeePaymentsQuery[K]
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

  return (
    <section className="space-y-6 relative">
      {/* Soft premium background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-purple-200/40 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-indigo-200/40 blur-3xl" />
        <div className="absolute inset-0 bg-linear-to-b from-slate-50 via-white to-white" />
      </div>

      <PageHeader
        title="دفعات الرسوم"
        subtitle="إدارة دفعات رسوم القضايا وتتبع حالات الدفع."
        icon={CreditCard}
        countLabel={`${totalCount} دفعة`}
        onAdd={() => setShowAddModal(true)}
        addButtonLabel="إضافة دفعة"
        isFetching={isFetching}
      />

      {/* Filters */}
      <div className="rounded-2xl bg-white/90 backdrop-blur border border-gray-200/70 shadow-[0_10px_30px_-18px_rgba(0,0,0,0.35)] ring-1 ring-gray-200/50 overflow-hidden">
        <div className="px-4 sm:px-5 py-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3 relative">
          <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-purple-500 via-indigo-500 to-blue-500" />

          <div className="flex items-center gap-2 text-sm font-medium text-gray-800">
            <span className="inline-flex items-center justify-center w-10 h-10 rounded-2xl bg-linear-to-br from-purple-50 to-indigo-50 border border-purple-200/60 shadow-sm">
              <SlidersHorizontal size={16} className="text-purple-700" />
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
                  className="w-full pr-9 pl-3 py-2.5 border border-gray-200 rounded-xl text-gray-700 bg-white focus:outline-none focus:ring-4 focus:ring-purple-200/70 focus:border-purple-300"
                />
              </div>
            </div>

            {/* Payment Method */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                طريقة الدفع
              </label>
              <div className="relative">
                <select
                  value={filters.PaymentMethod || ""}
                  onChange={(e) =>
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    updateFilter("PaymentMethod", e.target.value as any)
                  }
                  className="w-full appearance-none px-3 py-2.5 border border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:ring-4 focus:ring-purple-200/70 focus:border-purple-300 bg-white"
                >
                  {PAYMENT_METHODS.map((method) => (
                    <option key={method.value} value={method.value}>
                      {method.label}
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
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الحالة
              </label>
              <div className="relative">
                <select
                  value={filters.Status || ""}
                  onChange={(e) =>
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    updateFilter("Status", e.target.value as any)
                  }
                  className="w-full appearance-none px-3 py-2.5 border border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:ring-4 focus:ring-purple-200/70 focus:border-purple-300 bg-white"
                >
                  {PAYMENT_STATUS_OPTIONS.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
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
                  className="w-full appearance-none px-3 py-2.5 border border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:ring-4 focus:ring-purple-200/70 focus:border-purple-300 bg-white"
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

            {/* IsDeleted Status */}
            <div className="lg:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                النشاط
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

            {/* Payment Date Start */}
            <div className="lg:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                تاريخ الدفع (من)
              </label>
              <input
                type="date"
                value={filters.PaymentDateStart ?? ""}
                onChange={(e) =>
                  updateFilter("PaymentDateStart", e.target.value || undefined)
                }
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:ring-4 focus:ring-purple-200/70 focus:border-purple-300 bg-white"
              />
            </div>

            {/* Payment Date End */}
            <div className="lg:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                تاريخ الدفع (إلى)
              </label>
              <input
                type="date"
                value={filters.PaymentDateEnd ?? ""}
                onChange={(e) =>
                  updateFilter("PaymentDateEnd", e.target.value || undefined)
                }
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:ring-4 focus:ring-purple-200/70 focus:border-purple-300 bg-white"
              />
            </div>

            {/* Due Date Start */}
            <div className="lg:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                تاريخ الاستحقاق (من)
              </label>
              <input
                type="date"
                value={filters.DueDateStart ?? ""}
                onChange={(e) =>
                  updateFilter("DueDateStart", e.target.value || undefined)
                }
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:ring-4 focus:ring-purple-200/70 focus:border-purple-300 bg-white"
              />
            </div>

            {/* Due Date End */}
            <div className="lg:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                تاريخ الاستحقاق (إلى)
              </label>
              <input
                type="date"
                value={filters.DueDateEnd ?? ""}
                onChange={(e) =>
                  updateFilter("DueDateEnd", e.target.value || undefined)
                }
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:ring-4 focus:ring-purple-200/70 focus:border-purple-300 bg-white"
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
      ) : payments.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="rounded-2xl bg-white/90 backdrop-blur border border-gray-200/70 shadow-[0_10px_30px_-18px_rgba(0,0,0,0.35)] ring-1 ring-gray-200/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead className="bg-linear-to-b from-gray-50 to-white sticky top-0 z-10">
                <tr className="border-b border-gray-200">
                  <th className="px-4 py-4 text-sm font-semibold text-gray-900">
                    رقم الرسوم
                  </th>
                  <th className="px-4 py-4 text-sm font-semibold text-gray-900">
                    المبلغ
                  </th>
                  <th className="px-4 py-4 text-sm font-semibold text-gray-900">
                    طريقة الدفع
                  </th>
                  <th className="px-4 py-4 text-sm font-semibold text-gray-900">
                    تاريخ الدفع
                  </th>
                  <th className="px-4 py-4 text-sm font-semibold text-gray-900">
                    تاريخ الاستحقاق
                  </th>
                  <th className="px-4 py-4 text-sm font-semibold text-gray-900">
                    الحالة
                  </th>
                  <th className="px-4 py-4 text-sm font-semibold text-gray-900">
                    الإجراءات
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200 bg-white">
                {payments.map((payment, index) => {
                  const statusConfig = getStatusConfig(payment.status);
                  const StatusIcon = statusConfig.icon;

                  return (
                    <tr
                      key={payment.id}
                      className={`text-sm text-gray-800 transition-colors ${
                        index % 2 === 0 ? "bg-white" : "bg-gray-50/40"
                      } hover:bg-linear-to-r hover:from-purple-50/60 hover:to-transparent`}
                    >
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold border bg-purple-50 text-purple-800 border-purple-200">
                          <Hash size={12} />
                          {payment.caseId}
                        </span>
                      </td>

                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center justify-center w-9 h-9 rounded-2xl bg-linear-to-br from-emerald-50 to-green-50 border border-emerald-200/60 shadow-sm">
                            <DollarSign
                              size={16}
                              className="text-emerald-700"
                            />
                          </span>
                          <span className="font-semibold text-gray-900">
                            {formatCurrency(payment.amount)}
                          </span>
                        </div>
                      </td>

                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold border bg-blue-50 text-blue-800 border-blue-200">
                          <CreditCard size={12} />
                          {getPaymentMethodLabel(payment.paymentMethod)}
                        </span>
                      </td>

                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold border bg-gray-50 text-gray-800 border-gray-200">
                          <Calendar size={12} />
                          {formatDateShortAr(payment.paymentDate)}
                        </span>
                      </td>

                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold border bg-amber-50 text-amber-800 border-amber-200">
                          <Calendar size={12} />
                          {formatDateShortAr(payment.dueDate)}
                        </span>
                      </td>

                      <td className="px-4 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold border ${statusConfig.className}`}
                        >
                          <StatusIcon size={12} />
                          {statusConfig.label}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <IconButton
                            title="تعديل"
                            variant="purple"
                            onClick={() => {
                              setEditId(payment.id);
                              setShowEditModal(true);
                            }}
                          >
                            <Edit size={16} />
                          </IconButton>

                          <IconButton
                            title="حذف"
                            variant="red"
                            disabled={deleteMutation.isPending}
                            onClick={() => handleDelete(payment.id)}
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
                  );
                })}
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
              {payments.length}
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
              className="w-20 px-3 py-2 rounded-xl border border-gray-200 text-gray-700 focus:outline-none focus:ring-4 focus:ring-purple-200/70 focus:border-purple-300 bg-white"
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
          title="إضافة دفعة جديدة"
          icon={Plus}
          iconClassName="text-purple-700"
          onClose={() => setShowAddModal(false)}
        >
          <AddFeePaymentForm
            onSuccess={() => {
              setShowAddModal(false);
              queryClient.invalidateQueries({ queryKey: ["feePayments"] });
            }}
            onCancel={() => setShowAddModal(false)}
          />
        </ModalShell>
      )}

      {/* Edit Modal */}
      {showEditModal && editId && (
        <ModalShell
          title="تعديل الدفعة"
          icon={Edit}
          iconClassName="text-purple-700"
          onClose={() => setShowEditModal(false)}
        >
          <EditFeePaymentForm
            paymentId={editId}
            onSuccess={() => {
              setShowEditModal(false);
              setEditId(null);
              queryClient.invalidateQueries({ queryKey: ["feePayments"] });
            }}
            onCancel={() => {
              setShowEditModal(false);
              setEditId(null);
            }}
          />
        </ModalShell>
      )}
    </section>
  );
}
