"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { LucideIcon } from "lucide-react";
import {
  Building2,
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
  CreditCard,
  Calendar,
} from "lucide-react";
import toast from "react-hot-toast";

import {
  getOfficeExpenses,
  createOfficeExpense,
  deleteOfficeExpense,
  updateOfficeExpense,
} from "@/features/accounting/apis/OfficeExpensesApi";
import type {
  GetOfficeExpensesQuery,
  OfficeExpenseDto,
  OfficeExpenseType,
  PaymentMethod,
  CreateOfficeExpenseRequest,
  UpdateOfficeExpenseRequest,
} from "@/features/accounting/types/OfficeExpensesTypes";
import PageHeader from "@/shared/components/dashboard/PageHeader";
import { useConfirm } from "@/shared/providers/ConfirmProvider";

// ========== Constants ==========
const DEFAULT_FILTERS: GetOfficeExpensesQuery = {
  PageNumber: 1,
  PageSize: 10,
  Search: "",
  Sort: "",
  ExpenseType: undefined,
  PaymentMethod: undefined,
  IsDeleted: false,
  AmountStart: undefined,
  AmountEnd: undefined,
  ExpenseDateStart: undefined,
  ExpenseDateEnd: undefined,
};

const SORT_OPTIONS = [
  { value: "", label: "بدون ترتيب" },
  { value: "expenseDate desc", label: "الأحدث أولاً" },
  { value: "expenseDate asc", label: "الأقدم أولاً" },
  { value: "amount desc", label: "الأعلى قيمة" },
  { value: "amount asc", label: "الأقل قيمة" },
];

const EXPENSE_TYPE_OPTIONS: { value: OfficeExpenseType; label: string }[] = [
  { value: "Rent", label: "إيجار" },
  { value: "Utilities", label: "مرافق" },
  { value: "OfficeSupplies", label: "مستلزمات محاماة" },
  { value: "Maintenance", label: "صيانة" },
  { value: "Marketing", label: "تسويق" },
  { value: "Travel", label: "سفر" },
  { value: "Salaries", label: "رواتب" },
  { value: "Other", label: "أخرى" },
];

const PAYMENT_METHOD_OPTIONS: { value: PaymentMethod; label: string }[] = [
  { value: "Cash", label: "نقدي" },
  { value: "CreditCard", label: "بطاقة ائتمان" },
  { value: "BankTransfer", label: "تحويل بنكي" },
  { value: "MobilePayment", label: "دفع إلكتروني" },
  { value: "Check", label: "شيك" },
];

// ========== Hooks ==========
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

// ========== Components ==========
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
          <Building2 className="text-gray-500" size={20} />
        </div>
        <p className="text-gray-800 font-semibold">لا توجد مصروفات مطابقة.</p>
        <p className="text-sm text-gray-600 mt-1">
          جرّب تغيير الفلاتر أو إضافة مصروف جديد.
        </p>
      </div>
    </div>
  );
}

const getExpenseTypeLabel = (type: OfficeExpenseType) => {
  const found = EXPENSE_TYPE_OPTIONS.find((opt) => opt.value === type);
  return found?.label || type;
};

const getPaymentMethodLabel = (method: PaymentMethod) => {
  const found = PAYMENT_METHOD_OPTIONS.find((opt) => opt.value === method);
  return found?.label || method;
};

const getExpenseTypePillClass = (type: OfficeExpenseType) => {
  const classes: Record<OfficeExpenseType, string> = {
    Rent: "bg-purple-50 text-purple-800 border-purple-200",
    Utilities: "bg-blue-50 text-blue-800 border-blue-200",
    OfficeSupplies: "bg-amber-50 text-amber-800 border-amber-200",
    Maintenance: "bg-orange-50 text-orange-800 border-orange-200",
    Marketing: "bg-pink-50 text-pink-800 border-pink-200",
    Travel: "bg-cyan-50 text-cyan-800 border-cyan-200",
    Salaries: "bg-emerald-50 text-emerald-800 border-emerald-200",
    Other: "bg-gray-50 text-gray-800 border-gray-200",
  };
  return classes[type] || classes.Other;
};

// ========== Reusable Expense Form Component ==========
function ExpenseForm({
  onSuccess,
  initialData,
}: {
  onSuccess: () => void;
  initialData?: OfficeExpenseDto & { isEditing?: boolean };
}) {
  const queryClient = useQueryClient();
  const isEditing = !!initialData?.isEditing;
  const [formData, setFormData] = useState({
    title: initialData?.title ?? "",
    amount: initialData?.amount.toString() ?? "",
    expenseType: (initialData?.expenseType ?? "Other") as OfficeExpenseType,
    expenseDate: initialData?.expenseDate
      ? new Date(initialData.expenseDate).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0],
    paymentMethod: (initialData?.paymentMethod ?? "Cash") as PaymentMethod,
  });

  const createMutation = useMutation({
    mutationFn: createOfficeExpense,
    onSuccess: (response) => {
      if (response?.succeeded) {
        toast.success(response.message || "تم إضافة المصروف بنجاح");
        queryClient.invalidateQueries({ queryKey: ["office-expenses"] });
        onSuccess();
      } else {
        toast.error(response?.message || "تعذر إضافة المصروف");
      }
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(
        err?.response?.data?.message || "حدث خطأ أثناء إضافة المصروف"
      );
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: UpdateOfficeExpenseRequest;
    }) => updateOfficeExpense(id, payload),
    onSuccess: (response) => {
      if (response?.succeeded) {
        toast.success(response.message || "تم تحديث المصروف بنجاح");
        queryClient.invalidateQueries({ queryKey: ["office-expenses"] });
        onSuccess();
      } else {
        toast.error(response?.message || "تعذر تحديث المصروف");
      }
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(
        err?.response?.data?.message || "حدث خطأ أثناء تحديث المصروف"
      );
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error("يرجى إدخال عنوان المصروف");
      return;
    }
    if (!formData.amount || Number(formData.amount) <= 0) {
      toast.error("يرجى إدخال مبلغ صحيح");
      return;
    }

    const payload: CreateOfficeExpenseRequest = {
      title: formData.title,
      amount: Number(formData.amount),
      expenseType: formData.expenseType,
      expenseDate: new Date(formData.expenseDate).toISOString(),
      paymentMethod: formData.paymentMethod,
      createdAt: new Date().toISOString(),
    };

    if (isEditing && initialData?.id) {
      updateMutation.mutate({
        id: initialData.id,
        payload: payload as UpdateOfficeExpenseRequest,
      });
    } else {
      createMutation.mutate(payload);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            عنوان المصروف <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            placeholder="مثال: إيجار المكتب - شهر يناير"
            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-gray-700 bg-white focus:outline-none focus:ring-4 focus:ring-blue-200/70 focus:border-blue-300"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            المبلغ <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <DollarSign
              size={16}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="number"
              value={formData.amount}
              onChange={(e) =>
                setFormData({ ...formData, amount: e.target.value })
              }
              placeholder="0.00"
              min="0"
              step="0.01"
              className="w-full pr-9 pl-3 py-2.5 border border-gray-200 rounded-xl text-gray-700 bg-white focus:outline-none focus:ring-4 focus:ring-blue-200/70 focus:border-blue-300"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            تاريخ المصروف
          </label>
          <div className="relative">
            <Calendar
              size={16}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="date"
              value={formData.expenseDate}
              onChange={(e) =>
                setFormData({ ...formData, expenseDate: e.target.value })
              }
              className="w-full pr-9 pl-3 py-2.5 border border-gray-200 rounded-xl text-gray-700 bg-white focus:outline-none focus:ring-4 focus:ring-blue-200/70 focus:border-blue-300"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            نوع المصروف
          </label>
          <div className="relative">
            <select
              value={formData.expenseType}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  expenseType: e.target.value as OfficeExpenseType,
                })
              }
              className="w-full appearance-none px-3 py-2.5 border border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:ring-4 focus:ring-blue-200/70 focus:border-blue-300 bg-white"
            >
              {EXPENSE_TYPE_OPTIONS.map((opt) => (
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

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            طريقة الدفع
          </label>
          <div className="relative">
            <select
              value={formData.paymentMethod}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  paymentMethod: e.target.value as PaymentMethod,
                })
              }
              className="w-full appearance-none px-3 py-2.5 border border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:ring-4 focus:ring-blue-200/70 focus:border-blue-300 bg-white"
            >
              {PAYMENT_METHOD_OPTIONS.map((opt) => (
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
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : isEditing ? (
            <Edit size={16} />
          ) : (
            <Plus size={16} />
          )}
          {isEditing ? "تحديث المصروف" : "إضافة المصروف"}
        </button>
      </div>
    </form>
  );
}

// ========== Main Page ==========
export default function OfficeExpensesPage() {
  const [filters, setFilters] =
    useState<GetOfficeExpensesQuery>(DEFAULT_FILTERS);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState<OfficeExpenseDto | null>(
    null
  );

  useLockBodyScroll(showAddModal || !!editingExpense);

  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: deleteOfficeExpense,
    onSuccess: (response) => {
      if (response?.succeeded) {
        toast.success(response.message || "تم حذف المصروف بنجاح");
        queryClient.invalidateQueries({ queryKey: ["office-expenses"] });
      } else {
        toast.error(response?.message || "تعذر حذف المصروف");
      }
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err?.response?.data?.message || "حدث خطأ أثناء حذف المصروف");
    },
  });

  const confirm = useConfirm();
  const handleDelete = (id: number, title: string) => {
    confirm({
      title: "حذف المصروف",
      description: `هل تريد حذف المصروف "${title}"؟`,
      confirmText: "حذف",
      cancelText: "إلغاء",
    }).then((ok) => ok && deleteMutation.mutate(id));
  };

  const queryParams = useMemo(() => {
    return {
      ...filters,
      Search: filters.Search?.trim() || undefined,
      Sort: filters.Sort || undefined,
      ExpenseType: filters.ExpenseType || undefined,
      PaymentMethod: filters.PaymentMethod || undefined,
      IsDeleted: filters.IsDeleted ? true : undefined,
      AmountStart: filters.AmountStart || undefined,
      AmountEnd: filters.AmountEnd || undefined,
      ExpenseDateStart: filters.ExpenseDateStart || undefined,
      ExpenseDateEnd: filters.ExpenseDateEnd || undefined,
    } satisfies GetOfficeExpensesQuery;
  }, [filters]);

  const { data, isLoading, isError, error, isFetching, refetch } = useQuery({
    queryKey: ["office-expenses", queryParams],
    queryFn: () => getOfficeExpenses(queryParams),
    staleTime: 10_000,
  });

  const expenses: OfficeExpenseDto[] = data?.data?.data ?? [];
  const totalCount = data?.data?.count ?? 0;

  const pageNumber = filters.PageNumber ?? 1;
  const pageSize = filters.PageSize ?? 10;
  const totalPages = Math.max(1, Math.ceil(totalCount / (pageSize || 1)));

  const updateFilter = <K extends keyof GetOfficeExpensesQuery>(
    key: K,
    value: GetOfficeExpensesQuery[K]
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
        <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-amber-200/40 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-orange-200/40 blur-3xl" />
        <div className="absolute inset-0 bg-linear-to-b from-slate-50 via-white to-white" />
      </div>

      <PageHeader
        title="مصروفات المكتب"
        subtitle="إدارة ومتابعة جميع مصروفات المكتب والعمليات."
        icon={Building2}
        countLabel={`${totalCount} مصروف`}
        onAdd={() => setShowAddModal(true)}
        addButtonLabel="إضافة مصروف"
        isFetching={isFetching}
      />

      {/* Filters */}
      <div className="rounded-2xl bg-white/90 backdrop-blur border border-gray-200/70 shadow-[0_10px_30px_-18px_rgba(0,0,0,0.35)] ring-1 ring-gray-200/50 overflow-hidden">
        <div className="px-4 sm:px-5 py-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3 relative">
          {/* Accent line */}
          <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-amber-500 via-orange-500 to-red-500" />

          <div className="flex items-center gap-2 text-sm font-medium text-gray-800">
            <span className="inline-flex items-center justify-center w-10 h-10 rounded-2xl bg-linear-to-br from-amber-50 to-orange-50 border border-amber-200/60 shadow-sm">
              <SlidersHorizontal size={16} className="text-amber-700" />
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
                  placeholder="ابحث بعنوان المصروف..."
                  className="w-full pr-9 pl-3 py-2.5 border border-gray-200 rounded-xl text-gray-700 bg-white focus:outline-none focus:ring-4 focus:ring-blue-200/70 focus:border-blue-300"
                />
              </div>
            </div>

            {/* Expense Type */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                نوع المصروف
              </label>
              <div className="relative">
                <select
                  value={filters.ExpenseType || ""}
                  onChange={(e) =>
                    updateFilter(
                      "ExpenseType",
                      (e.target.value || undefined) as OfficeExpenseType
                    )
                  }
                  className="w-full appearance-none px-3 py-2.5 border border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:ring-4 focus:ring-blue-200/70 focus:border-blue-300 bg-white"
                >
                  <option value="">الكل</option>
                  {EXPENSE_TYPE_OPTIONS.map((opt) => (
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

            {/* Payment Method */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                طريقة الدفع
              </label>
              <div className="relative">
                <select
                  value={filters.PaymentMethod || ""}
                  onChange={(e) =>
                    updateFilter(
                      "PaymentMethod",
                      (e.target.value || undefined) as PaymentMethod
                    )
                  }
                  className="w-full appearance-none px-3 py-2.5 border border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:ring-4 focus:ring-blue-200/70 focus:border-blue-300 bg-white"
                >
                  <option value="">الكل</option>
                  {PAYMENT_METHOD_OPTIONS.map((opt) => (
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

            {/* Page Size */}
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
                          ? "bg-amber-50 text-amber-700 border-amber-200 shadow-sm"
                          : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Amount Range */}
            <div className="lg:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                نطاق المبلغ
              </label>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <DollarSign
                    size={14}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="number"
                    value={filters.AmountStart ?? ""}
                    onChange={(e) =>
                      updateFilter(
                        "AmountStart",
                        e.target.value ? Number(e.target.value) : undefined
                      )
                    }
                    placeholder="من"
                    min="0"
                    className="w-full pr-8 pl-2 py-2.5 border border-gray-200 rounded-xl text-gray-700 bg-white focus:outline-none focus:ring-4 focus:ring-blue-200/70 focus:border-blue-300 text-sm"
                  />
                </div>
                <span className="text-gray-400">-</span>
                <div className="relative flex-1">
                  <DollarSign
                    size={14}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="number"
                    value={filters.AmountEnd ?? ""}
                    onChange={(e) =>
                      updateFilter(
                        "AmountEnd",
                        e.target.value ? Number(e.target.value) : undefined
                      )
                    }
                    placeholder="إلى"
                    min="0"
                    className="w-full pr-8 pl-2 py-2.5 border border-gray-200 rounded-xl text-gray-700 bg-white focus:outline-none focus:ring-4 focus:ring-blue-200/70 focus:border-blue-300 text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Date Range - Start */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                من تاريخ
              </label>
              <div className="relative">
                <Calendar
                  size={14}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="date"
                  value={
                    filters.ExpenseDateStart
                      ? filters.ExpenseDateStart.split("T")[0]
                      : ""
                  }
                  onChange={(e) =>
                    updateFilter(
                      "ExpenseDateStart",
                      e.target.value
                        ? new Date(e.target.value).toISOString()
                        : undefined
                    )
                  }
                  className="w-full pr-9 pl-2 py-2.5 border border-gray-200 rounded-xl text-gray-700 bg-white focus:outline-none focus:ring-4 focus:ring-blue-200/70 focus:border-blue-300 text-sm"
                />
              </div>
            </div>

            {/* Date Range - End */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                إلى تاريخ
              </label>
              <div className="relative">
                <Calendar
                  size={14}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="date"
                  value={
                    filters.ExpenseDateEnd
                      ? filters.ExpenseDateEnd.split("T")[0]
                      : ""
                  }
                  onChange={(e) =>
                    updateFilter(
                      "ExpenseDateEnd",
                      e.target.value
                        ? new Date(e.target.value).toISOString()
                        : undefined
                    )
                  }
                  className="w-full pr-9 pl-2 py-2.5 border border-gray-200 rounded-xl text-gray-700 bg-white focus:outline-none focus:ring-4 focus:ring-blue-200/70 focus:border-blue-300 text-sm"
                />
              </div>
            </div>

            {/* Show Deleted */}
            <div className="lg:col-span-5">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                إظهار المحذوف
              </label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => updateFilter("IsDeleted", false)}
                  className={`px-3 py-2 text-sm rounded-xl transition-all border ${
                    !filters.IsDeleted
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200 shadow-sm"
                      : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  المصروفات النشطة
                </button>
                <button
                  type="button"
                  onClick={() => updateFilter("IsDeleted", true)}
                  className={`px-3 py-2 text-sm rounded-xl transition-all border ${
                    filters.IsDeleted
                      ? "bg-red-50 text-red-700 border-red-200 shadow-sm"
                      : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  المصروفات المحذوفة
                </button>
              </div>
            </div>

            {/* Error */}
            <div className="lg:col-span-12">
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

      {/* Content */}
      {isLoading ? (
        <LoadingState />
      ) : isError ? (
        <ErrorState
          message={error instanceof Error ? error.message : undefined}
        />
      ) : expenses.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-gray-200/70 bg-white/90 backdrop-blur shadow-[0_10px_30px_-18px_rgba(0,0,0,0.35)] ring-1 ring-gray-200/50">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-linear-to-b from-gray-50 to-white sticky top-0 z-10">
                <tr className="text-right text-xs font-semibold text-gray-700">
                  <th className="px-4 py-3 font-semibold whitespace-nowrap">
                    ID
                  </th>
                  <th className="px-4 py-3 font-semibold">العنوان</th>
                  <th className="px-4 py-3 font-semibold whitespace-nowrap">
                    المبلغ
                  </th>
                  <th className="px-4 py-3 font-semibold whitespace-nowrap">
                    النوع
                  </th>
                  <th className="px-4 py-3 font-semibold whitespace-nowrap">
                    طريقة الدفع
                  </th>
                  <th className="px-4 py-3 font-semibold whitespace-nowrap">
                    التاريخ
                  </th>
                  <th className="px-4 py-3 font-semibold whitespace-nowrap">
                    الإجراءات
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200 bg-white">
                {expenses.map((expense, index) => (
                  <tr
                    key={expense.id}
                    className={`text-sm text-gray-800 transition-colors ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50/40"
                    } hover:bg-linear-to-r hover:from-amber-50/60 hover:to-transparent`}
                  >
                    <td className="px-4 py-4 text-gray-500 whitespace-nowrap">
                      {expense.id}
                    </td>

                    <td className="px-4 py-4 min-w-55">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center justify-center w-9 h-9 rounded-2xl bg-linear-to-br from-amber-50 to-orange-50 border border-amber-200/60 shadow-sm">
                          <DollarSign size={16} className="text-amber-700" />
                        </span>

                        <div className="min-w-0">
                          <div
                            className="font-semibold text-gray-900 truncate max-w-85"
                            title={expense.title}
                          >
                            {expense.title}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {formatDateShortAr(expense.createdAt)}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="font-semibold text-emerald-700">
                        {formatCurrency(expense.amount)}
                      </span>
                    </td>

                    <td className="px-4 py-4 whitespace-nowrap">
                      <Pill
                        text={getExpenseTypeLabel(expense.expenseType)}
                        className={getExpenseTypePillClass(expense.expenseType)}
                      />
                    </td>

                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-gray-700">
                        <CreditCard size={14} className="text-gray-400" />
                        {getPaymentMethodLabel(expense.paymentMethod)}
                      </div>
                    </td>

                    <td className="px-4 py-4 text-gray-700 whitespace-nowrap">
                      {formatDateShortAr(expense.expenseDate)}
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <IconButton
                          title="تعديل"
                          variant="purple"
                          onClick={() => setEditingExpense(expense)}
                        >
                          <Edit size={16} />
                        </IconButton>

                        <IconButton
                          title="حذف"
                          variant="red"
                          disabled={deleteMutation.isPending}
                          onClick={() =>
                            handleDelete(expense.id, expense.title)
                          }
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-4 py-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3 bg-gray-50/50">
              <div className="text-sm text-gray-600">
                صفحة {pageNumber} من {totalPages} • إجمالي {totalCount} مصروف
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handlePageChange(pageNumber - 1)}
                  disabled={pageNumber <= 1}
                  className="inline-flex items-center justify-center w-9 h-9 rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight size={16} />
                </button>

                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum: number;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (pageNumber <= 3) {
                    pageNum = i + 1;
                  } else if (pageNumber >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = pageNumber - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      type="button"
                      onClick={() => handlePageChange(pageNum)}
                      className={`inline-flex items-center justify-center w-9 h-9 rounded-xl border transition-colors text-sm font-medium ${
                        pageNumber === pageNum
                          ? "bg-amber-500 text-white border-amber-500"
                          : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  type="button"
                  onClick={() => handlePageChange(pageNumber + 1)}
                  disabled={pageNumber >= totalPages}
                  className="inline-flex items-center justify-center w-9 h-9 rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <ModalShell
          title="إضافة مصروف جديد"
          icon={Plus}
          iconClassName="text-amber-700"
          onClose={() => setShowAddModal(false)}
        >
          <ExpenseForm onSuccess={() => setShowAddModal(false)} />
        </ModalShell>
      )}

      {/* Edit Modal */}
      {editingExpense && (
        <ModalShell
          title="تعديل المصروف"
          icon={Edit}
          iconClassName="text-purple-700"
          onClose={() => setEditingExpense(null)}
        >
          <ExpenseForm
            initialData={{ ...editingExpense, isEditing: true }}
            onSuccess={() => setEditingExpense(null)}
          />
        </ModalShell>
      )}
    </section>
  );
}
