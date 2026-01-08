"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

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
  DollarSign,
  TrendingUp,
  History,
  Edit,
  Share2,
  X,
} from "lucide-react";

import {
  getCaseById,
  getCaseStatistics,
} from "@/features/cases/apis/casesApis";
import AccountingSummaryCard from "@/features/accounting/components/AccountingSummaryCard";
import FeesSection from "@/features/accounting/components/FeesSection";
import ExpensesSection from "@/features/accounting/components/ExpensesSection";
import PaymentsSection from "@/features/accounting/components/PaymentsSection";
import { useCaseAccountingSummary } from "@/features/accounting/hooks/useCaseAccountingSummary";
import {
  createCaseFee,
  updateCaseFee,
  getCaseFeeById,
  deleteCaseFee,
} from "@/features/accounting/apis/CaseFeesApi";
import {
  createCaseExpense,
  updateCaseExpense,
  getCaseExpenseById,
  deleteCaseExpense,
} from "@/features/accounting/apis/CaseExpensesApi";
import {
  createFeePayment,
  updateFeePayment,
  getFeePaymentById,
  deleteFeePayment,
} from "@/features/accounting/apis/FeePaymentApi";
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
  gradient,
}: {
  title: string;
  icon: LucideIcon;
  iconClassName?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  gradient?: string;
}) => (
  <div className="group rounded-3xl border border-gray-200 bg-white shadow-lg hover:shadow-xl transition-all duration-300">
    <div
      className={`flex items-center justify-between gap-3 px-6 py-5 ${
        gradient || "bg-gradient-to-r from-gray-50 to-white"
      } rounded-t-3xl border-b border-gray-100`}
    >
      <div className="flex items-center gap-3">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white shadow-sm group-hover:scale-110 transition-transform">
          <Icon className={iconClassName ?? "text-blue-600"} size={20} />
        </span>
        <h2 className="text-lg font-bold text-gray-900">{title}</h2>
      </div>
      {actions}
    </div>
    <div className="p-6">{children}</div>
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
  <div className="group flex items-start gap-4 rounded-2xl border border-gray-200 bg-gradient-to-br from-white to-gray-50/50 p-5 hover:shadow-md hover:border-gray-300 transition-all duration-200">
    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white shadow-sm group-hover:scale-110 transition-transform">
      <Icon className={iconClassName} size={20} />
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
        {label}
      </p>
      <p className="mt-1 truncate text-base font-bold text-gray-900">{value}</p>
      {subtitle && <p className="mt-0.5 text-xs text-gray-600">{subtitle}</p>}
    </div>
  </div>
);

const Stat = ({
  icon: Icon,
  title,
  value,
  subtitle,
  color,
}: {
  icon: LucideIcon;
  title: string;
  value: string | number;
  subtitle?: string;
  color?: string;
}) => (
  <div className="group relative overflow-hidden rounded-3xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 p-6 shadow-lg hover:shadow-2xl transition-all duration-300">
    <div className="absolute top-0 right-0 h-24 w-24 -translate-y-6 translate-x-6 rounded-full bg-gradient-to-br from-blue-100/40 to-purple-100/40 blur-2xl"></div>
    <div className="relative flex items-start justify-between gap-3">
      <div className="flex-1">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          {title}
        </p>
        <p className="mt-2 text-3xl font-extrabold text-gray-900">{value}</p>
        {subtitle && (
          <p className="mt-2 text-xs font-medium text-gray-600">{subtitle}</p>
        )}
      </div>
      <span
        className={`inline-flex h-14 w-14 items-center justify-center rounded-2xl ${
          color || "bg-gradient-to-br from-blue-500 to-blue-600"
        } shadow-lg group-hover:scale-110 transition-transform`}
      >
        <Icon className="text-white" size={24} />
      </span>
    </div>
  </div>
);

const ProgressBar = ({ value }: { value: number }) => (
  <div className="relative h-3 w-full overflow-hidden rounded-full bg-gradient-to-r from-gray-100 to-gray-200">
    <div
      className="h-full rounded-full bg-gradient-to-r from-blue-500 via-blue-600 to-purple-600 transition-all duration-700 shadow-lg"
      style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
    />
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
  </div>
);

const PageSkeleton = () => (
  <div className="min-h-[60vh]">
    <div className="flex items-center justify-center py-20">
      <Loader2 className="animate-spin text-blue-600" size={44} />
    </div>
  </div>
);

const PageError = ({
  message,
  onBack,
}: {
  message?: string;
  onBack: () => void;
}) => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <div className="w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-start gap-3">
        <AlertCircle className="text-red-600 mt-0.5" size={24} />
        <div>
          <p className="text-gray-900 font-semibold">
            حدث خطأ أثناء جلب بيانات القضية
          </p>
          <p className="mt-1 text-sm text-gray-600">
            {message || "خطأ غير معروف"}
          </p>
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

// Custom Fee Modal Component
interface FeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseId: number;
  feeId?: number | null;
  onSuccess: () => void;
}

interface FeeFormData {
  amount: string;
  toBePaidAt: string;
}

const FeeModal: React.FC<FeeModalProps> = ({
  isOpen,
  onClose,
  caseId,
  feeId,
  onSuccess,
}) => {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<FeeFormData>();

  // Fetch fee data if editing
  const { data: feeData } = useQuery({
    queryKey: ["caseFee", feeId],
    queryFn: () => getCaseFeeById(feeId!),
    enabled: !!feeId,
  });

  React.useEffect(() => {
    if (feeData?.data) {
      setValue("amount", String(feeData.data.amount));
      setValue("toBePaidAt", feeData.data.toBePaidAt?.split("T")[0]);
    } else {
      reset();
    }
  }, [feeData, setValue, reset]);

  const onSubmit = async (data: FeeFormData) => {
    setIsSubmitting(true);
    try {
      if (feeId) {
        await updateCaseFee(feeId, {
          amount: Number(data.amount),
          toBePaidAt: data.toBePaidAt,
        });
        toast.success("تم تحديث الأتعاب بنجاح");
      } else {
        await createCaseFee(caseId, {
          amount: Number(data.amount),
          toBePaidAt: data.toBePaidAt,
        });
        toast.success("تم إضافة الأتعاب بنجاح");
      }
      queryClient.invalidateQueries({ queryKey: ["caseFees"] });
      queryClient.invalidateQueries({ queryKey: ["caseAccountingSummary"] });
      onSuccess();
      reset();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "حدث خطأ");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 left-4 flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all"
        >
          <X size={18} />
        </button>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          {feeId ? "تعديل الأتعاب" : "إضافة أتعاب جديدة"}
        </h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              المبلغ <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              {...register("amount", { required: "المبلغ مطلوب", min: 0.01 })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="أدخل المبلغ"
            />
            {errors.amount && (
              <p className="text-red-500 text-xs mt-1">
                {errors.amount.message as string}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              تاريخ الدفع المتوقع <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              {...register("toBePaidAt", { required: "التاريخ مطلوب" })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {errors.toBePaidAt && (
              <p className="text-red-500 text-xs mt-1">
                {errors.toBePaidAt.message as string}
              </p>
            )}
          </div>
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2.5 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <Loader2 className="animate-spin mx-auto" size={20} />
              ) : feeId ? (
                "تحديث"
              ) : (
                "إضافة"
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-xl font-semibold hover:bg-gray-200 transition-all"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Custom Expense Modal Component
interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseId: number;
  expenseId?: number | null;
  onSuccess: () => void;
}

interface ExpenseFormData {
  amount: string;
  expenseDate: string;
}

const ExpenseModal: React.FC<ExpenseModalProps> = ({
  isOpen,
  onClose,
  caseId,
  expenseId,
  onSuccess,
}) => {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<ExpenseFormData>();

  // Fetch expense data if editing
  const { data: expenseData } = useQuery({
    queryKey: ["caseExpense", expenseId],
    queryFn: () => getCaseExpenseById(expenseId!),
    enabled: !!expenseId,
  });

  React.useEffect(() => {
    if (expenseData) {
      setValue("amount", String(expenseData.amount));
      setValue("expenseDate", expenseData.expenseDate?.split("T")[0]);
    } else {
      reset();
    }
  }, [expenseData, setValue, reset]);

  const onSubmit = async (data: ExpenseFormData) => {
    setIsSubmitting(true);
    try {
      if (expenseId) {
        await updateCaseExpense(expenseId, {
          caseId,
          amount: Number(data.amount),
          expenseDate: data.expenseDate,
        });
        toast.success("تم تحديث المصروف بنجاح");
      } else {
        await createCaseExpense({
          caseId,
          amount: Number(data.amount),
          expenseDate: data.expenseDate,
        });
        toast.success("تم إضافة المصروف بنجاح");
      }
      queryClient.invalidateQueries({ queryKey: ["caseExpenses"] });
      queryClient.invalidateQueries({ queryKey: ["caseAccountingSummary"] });
      onSuccess();
      reset();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "حدث خطأ";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 left-4 flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all"
        >
          <X size={18} />
        </button>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          {expenseId ? "تعديل المصروف" : "إضافة مصروف جديد"}
        </h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              المبلغ <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              {...register("amount", { required: "المبلغ مطلوب", min: 0.01 })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="أدخل المبلغ"
            />
            {errors.amount && (
              <p className="text-red-500 text-xs mt-1">
                {errors.amount.message as string}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              تاريخ المصروف <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              {...register("expenseDate", { required: "التاريخ مطلوب" })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {errors.expenseDate && (
              <p className="text-red-500 text-xs mt-1">
                {errors.expenseDate.message as string}
              </p>
            )}
          </div>
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2.5 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <Loader2 className="animate-spin mx-auto" size={20} />
              ) : expenseId ? (
                "تحديث"
              ) : (
                "إضافة"
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-xl font-semibold hover:bg-gray-200 transition-all"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Custom Payment Modal Component
interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  paymentId?: number | null;
  onSuccess: () => void;
}

interface PaymentFormData {
  title?: string;
  caseFeeId: string;
  amount: string;
  paymentDate: string;
  paymentMethod: string;
  dueDate: string;
  status: string;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  paymentId,
  onSuccess,
}) => {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<PaymentFormData>();

  // Fetch payment data if editing
  const { data: paymentData, isLoading: isLoadingPayment } = useQuery({
    queryKey: ["feePayment", paymentId],
    queryFn: () => getFeePaymentById(paymentId!),
    enabled: !!paymentId && isOpen,
  });

  // Reset form when modal opens/closes or paymentId changes
  React.useEffect(() => {
    if (!isOpen) {
      reset();
      return;
    }

    if (paymentId && paymentData) {
      setValue("caseFeeId", String(paymentData.caseFeeId));
      setValue("amount", String(paymentData.amount));
      setValue("paymentDate", paymentData.paymentDate?.split("T")[0] || "");
      setValue("paymentMethod", paymentData.paymentMethod);
      setValue("dueDate", paymentData.dueDate?.split("T")[0] || "");
      setValue("status", paymentData.status);
    } else if (!paymentId) {
      reset();
    }
  }, [paymentData, paymentId, isOpen, setValue, reset]);

  const onSubmit = async (data: PaymentFormData) => {
    setIsSubmitting(true);
    try {
      if (paymentId) {
        await updateFeePayment(paymentId, {
          title: data.title || "دفعة",
          caseFeeId: Number(data.caseFeeId),
          amount: Number(data.amount),
          paymentDate: data.paymentDate,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          paymentMethod: data.paymentMethod as any,
          dueDate: data.dueDate,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          status: data.status as any,
        });
        toast.success("تم تحديث الدفعة بنجاح");
      } else {
        await createFeePayment({
          title: data.title || "دفعة",
          caseFeeId: Number(data.caseFeeId),
          amount: Number(data.amount),
          paymentDate: data.paymentDate,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          paymentMethod: data.paymentMethod as any,
          dueDate: data.dueDate,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          status: data.status as any,
        });
        toast.success("تم إضافة الدفعة بنجاح");
      }
      queryClient.invalidateQueries({ queryKey: ["feePayments"] });
      queryClient.invalidateQueries({ queryKey: ["feePayment"] });
      queryClient.invalidateQueries({ queryKey: ["caseAccountingSummary"] });
      onSuccess();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "حدث خطأ";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  // Show loading state when fetching payment data for edit
  const isLoadingEdit = paymentId && isLoadingPayment;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 left-4 flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all z-10"
        >
          <X size={18} />
        </button>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          {paymentId ? "تعديل الدفعة" : "إضافة دفعة جديدة"}
        </h2>
        {isLoadingEdit ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="animate-spin text-blue-600" size={32} />
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                العنوان
              </label>
              <input
                type="text"
                {...register("title")}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="عنوان الدفعة (اختياري)"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                رقم الأتعاب <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                {...register("caseFeeId", {
                  required: "رقم الأتعاب مطلوب",
                  min: 1,
                })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="أدخل رقم الأتعاب"
              />
              {errors.caseFeeId && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.caseFeeId.message as string}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                المبلغ <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                {...register("amount", { required: "المبلغ مطلوب", min: 0.01 })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="أدخل المبلغ"
              />
              {errors.amount && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.amount.message as string}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                تاريخ الدفع <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                {...register("paymentDate", { required: "تاريخ الدفع مطلوب" })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {errors.paymentDate && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.paymentDate.message as string}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                طريقة الدفع <span className="text-red-500">*</span>
              </label>
              <select
                {...register("paymentMethod", {
                  required: "طريقة الدفع مطلوبة",
                })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">اختر طريقة الدفع</option>
                <option value="Cash">نقدي</option>
                <option value="CreditCard">بطاقة ائتمان</option>
                <option value="BankTransfer">تحويل بنكي</option>
                <option value="MobilePayment">دفع موبايل</option>
                <option value="Check">شيك</option>
              </select>
              {errors.paymentMethod && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.paymentMethod.message as string}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                تاريخ الاستحقاق <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                {...register("dueDate", { required: "تاريخ الاستحقاق مطلوب" })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {errors.dueDate && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.dueDate.message as string}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الحالة <span className="text-red-500">*</span>
              </label>
              <select
                {...register("status", { required: "الحالة مطلوبة" })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">اختر الحالة</option>
                <option value="Unpaid">غير مدفوع</option>
                <option value="Paid">مدفوع</option>
                <option value="Overdue">متأخر</option>
              </select>
              {errors.status && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.status.message as string}
                </p>
              )}
            </div>
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2.5 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50"
              >
                {isSubmitting ? (
                  <Loader2 className="animate-spin mx-auto" size={20} />
                ) : paymentId ? (
                  "تحديث"
                ) : (
                  "إضافة"
                )}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-xl font-semibold hover:bg-gray-200 transition-all"
              >
                إلغاء
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default function CaseDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const caseId = Number(params.id);
  const [activeTab, setActiveTab] = useState<
    "overview" | "accounting" | "history"
  >("overview");

  // Accounting Dialogs State
  const [feeDialogOpen, setFeeDialogOpen] = useState(false);
  const [expenseDialogOpen, setExpenseDialogOpen] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [editingFeeId, setEditingFeeId] = useState<number | null>(null);
  const [editingExpenseId, setEditingExpenseId] = useState<number | null>(null);
  const [editingPaymentId, setEditingPaymentId] = useState<number | null>(null);

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

  // Get accounting data
  const accountingData = useCaseAccountingSummary(caseId);

  const caseDetails: CaseDetail | undefined = caseData?.data;
  const stats: CaseStats | undefined = statsData?.data;

  const handleBack = () => router.push("/dashboard/cases");
  const handleRefresh = async () => {
    await Promise.all([refetchCase(), refetchStats()]);
  };

  // Fees Handlers
  const handleAddFee = () => {
    setEditingFeeId(null);
    setFeeDialogOpen(true);
  };

  const handleEditFee = (fee: { id: number; [key: string]: unknown }) => {
    setEditingFeeId(fee.id);
    setFeeDialogOpen(true);
  };

  const handleDeleteFee = async (feeId: number) => {
    if (window.confirm("هل أنت متأكد من حذف هذا الأتعاب؟")) {
      try {
        await deleteCaseFee(feeId);
        toast.success("تم حذف الأتعاب بنجاح");
        accountingData.refetchAll();
      } catch (error) {
        console.error("Error deleting fee:", error);
        toast.error("حدث خطأ أثناء حذف الأتعاب");
      }
    }
  };

  const handleFeeSuccess = () => {
    setFeeDialogOpen(false);
    setEditingFeeId(null);
  };

  // Expenses Handlers
  const handleAddExpense = () => {
    setEditingExpenseId(null);
    setExpenseDialogOpen(true);
  };

  const handleEditExpense = (expense: {
    id: number;
    [key: string]: unknown;
  }) => {
    setEditingExpenseId(expense.id);
    setExpenseDialogOpen(true);
  };

  const handleDeleteExpense = async (expenseId: number) => {
    if (window.confirm("هل أنت متأكد من حذف هذا المصروف؟")) {
      try {
        await deleteCaseExpense(expenseId);
        toast.success("تم حذف المصروف بنجاح");
        accountingData.refetchAll();
      } catch (error) {
        console.error("Error deleting expense:", error);
        toast.error("حدث خطأ أثناء حذف المصروف");
      }
    }
  };

  const handleExpenseSuccess = () => {
    setExpenseDialogOpen(false);
    setEditingExpenseId(null);
  };

  // Payments Handlers
  const handleAddPayment = () => {
    setEditingPaymentId(null);
    setPaymentDialogOpen(true);
  };

  const handleEditPayment = (payment: {
    id: number;
    [key: string]: unknown;
  }) => {
    setEditingPaymentId(payment.id);
    setPaymentDialogOpen(true);
  };

  const handleDeletePayment = async (paymentId: number) => {
    if (window.confirm("هل أنت متأكد من حذف هذه الدفعة؟")) {
      try {
        await deleteFeePayment(paymentId);
        toast.success("تم حذف الدفعة بنجاح");
        accountingData.refetchAll();
      } catch (error) {
        console.error("Error deleting payment:", error);
        toast.error("حدث خطأ أثناء حذف الدفعة");
      }
    }
  };

  const handlePaymentSuccess = () => {
    setPaymentDialogOpen(false);
    setEditingPaymentId(null);
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
    <section className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20 space-y-6 pb-8">
      {/* Enhanced Header with Glassmorphism Effect */}
      <div className="relative overflow-hidden rounded-3xl border border-white/20 bg-white/80 backdrop-blur-xl shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5"></div>

        <div className="relative flex flex-wrap items-center justify-between gap-3 px-8 py-5 border-b border-gray-100/50">
          <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
            <button
              onClick={handleBack}
              className="hover:text-blue-600 transition-colors font-medium"
            >
              القضايا
            </button>
            <span className="text-gray-300">/</span>
            <span className="text-gray-900 font-bold">
              {caseDetails.caseNumber}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-white/80 px-4 py-2.5 text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
              title="تحرير"
            >
              <Edit size={16} />
              <span className="hidden sm:inline">تحرير</span>
            </button>
            <button
              className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-white/80 px-4 py-2.5 text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
              title="مشاركة"
            >
              <Share2 size={16} />
              <span className="hidden sm:inline">مشاركة</span>
            </button>
            <button
              onClick={handleRefresh}
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2.5 text-white hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
              disabled={isFetchingCase || isFetchingStats}
              title="تحديث"
            >
              {isFetchingCase || isFetchingStats ? (
                <Loader2 className="animate-spin" size={16} />
              ) : (
                <RefreshCcw size={16} />
              )}
              <span className="hidden sm:inline">تحديث</span>
            </button>
          </div>
        </div>

        <div className="relative px-8 py-6">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="flex-1 space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 text-blue-700 bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-xl text-xs font-bold shadow-sm">
                  <Briefcase size={12} />
                  {caseDetails.caseNumber}
                </span>

                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl border shadow-sm ${getStatusColor(
                    caseDetails.caseStatus.value
                  )}`}
                >
                  <Gavel size={12} />
                  {caseDetails.caseStatus.label}
                </span>

                {caseDetails.isPrivate ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-amber-50 text-amber-700 border border-amber-200 shadow-sm">
                    <Lock size={12} /> خاصة
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-gray-50 text-gray-700 border border-gray-200 shadow-sm">
                    <Unlock size={12} /> عامة
                  </span>
                )}
              </div>

              <h1 className="text-3xl sm:text-4xl font-black text-gray-900 flex items-center gap-4">
                <span className="inline-flex h-14 w-14 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-xl">
                  <Briefcase className="text-white" size={28} />
                </span>
                <span className="leading-tight bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  {caseDetails.name}
                </span>
              </h1>

              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-2 rounded-2xl border border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50 px-4 py-2 text-sm font-semibold text-purple-700 shadow-sm">
                  <Scale size={16} />
                  {caseDetails.caseType.label}
                </span>
              </div>

              {isFetchingCase && (
                <div className="flex items-center gap-2 text-xs text-blue-600 bg-blue-50 px-3 py-2 rounded-xl w-fit">
                  <Loader2 className="animate-spin" size={12} />
                  يتم تحديث البيانات…
                </div>
              )}
            </div>

            {/* Enhanced Timeline Card */}
            <div className="w-full sm:w-auto">
              <div className="rounded-3xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 p-6 shadow-lg">
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="text-blue-600" size={18} />
                  <p className="text-xs font-bold text-gray-900 uppercase tracking-wide">
                    الخط الزمني
                  </p>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-6 text-sm">
                    <span className="text-gray-600 font-medium">
                      تاريخ الفتح
                    </span>
                    <span className="font-bold text-green-700 bg-green-50 px-3 py-1 rounded-lg">
                      {formatDateAr(caseDetails.openedAt)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-6 text-sm">
                    <span className="text-gray-600 font-medium">
                      تاريخ الإغلاق
                    </span>
                    <span className="font-bold text-gray-700 bg-gray-100 px-3 py-1 rounded-lg">
                      {formatDateAr(caseDetails.closedAt ?? null)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Stats Grid */}
      {stats && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-9 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <Stat
              icon={Calendar}
              title="الجلسة القادمة"
              value={
                stats.nextSessionDate
                  ? formatDateAr(stats.nextSessionDate)
                  : "لا توجد"
              }
              subtitle={stats.nextSessionType}
              color="bg-gradient-to-br from-green-500 to-emerald-600"
            />
            <Stat
              icon={Clock}
              title="عدد الجلسات"
              value={stats.sessionsCount}
              color="bg-gradient-to-br from-blue-500 to-cyan-600"
            />
            <Stat
              icon={CheckCircle2}
              title="جلسات منتهية"
              value={stats.completedSessions}
              color="bg-gradient-to-br from-purple-500 to-pink-600"
            />
            <Stat
              icon={FileText}
              title="المستندات"
              value={stats.documentsCount}
              color="bg-gradient-to-br from-orange-500 to-red-600"
            />
          </div>

          <div className="lg:col-span-3">
            <div className="rounded-3xl border border-gray-200 bg-gradient-to-br from-white to-blue-50/30 p-6 shadow-lg h-full">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="text-blue-600" size={18} />
                <p className="text-xs font-bold text-gray-900 uppercase tracking-wide">
                  نسبة الإنجاز
                </p>
              </div>
              <p className="mt-2 text-4xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {Math.round(completionRate)}%
              </p>
              <div className="mt-4">
                <ProgressBar value={completionRate} />
              </div>
              <p className="mt-3 text-sm text-gray-600 font-medium">
                {stats.completedSessions} من {stats.sessionsCount} جلسة
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setActiveTab("overview")}
          className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm transition-all whitespace-nowrap ${
            activeTab === "overview"
              ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
              : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300"
          }`}
        >
          <FileText size={16} />
          نظرة عامة
        </button>
        <button
          onClick={() => setActiveTab("accounting")}
          className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm transition-all whitespace-nowrap ${
            activeTab === "accounting"
              ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
              : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300"
          }`}
        >
          <DollarSign size={16} />
          المحاسبة
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm transition-all whitespace-nowrap ${
            activeTab === "history"
              ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
              : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300"
          }`}
        >
          <History size={16} />
          السجل
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Main info */}
          <div className="lg:col-span-8 space-y-6">
            <SectionCard
              title="المعلومات الأساسية"
              icon={FileText}
              iconClassName="text-blue-600"
              gradient="bg-gradient-to-r from-blue-50 to-purple-50"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <KeyValue
                  icon={User}
                  iconClassName="text-cyan-600"
                  label="العميل"
                  value={caseDetails.clientName}
                  subtitle={
                    caseDetails.clientRole?.label
                      ? `(${caseDetails.clientRole.label})`
                      : undefined
                  }
                />
                <KeyValue
                  icon={UserMinus}
                  iconClassName="text-orange-600"
                  label="الخصم"
                  value={caseDetails.opponent || "—"}
                />
                <KeyValue
                  icon={Scale}
                  iconClassName="text-purple-600"
                  label="المحكمة"
                  value={caseDetails.courtName || "—"}
                />
                <KeyValue
                  icon={Calendar}
                  iconClassName="text-green-600"
                  label="تاريخ الفتح"
                  value={formatDateAr(caseDetails.openedAt)}
                />
                {caseDetails.closedAt && (
                  <KeyValue
                    icon={Calendar}
                    iconClassName="text-red-600"
                    label="تاريخ الإغلاق"
                    value={formatDateAr(caseDetails.closedAt)}
                  />
                )}
                <KeyValue
                  icon={caseDetails.isPrivate ? Lock : Unlock}
                  iconClassName={
                    caseDetails.isPrivate ? "text-amber-600" : "text-gray-600"
                  }
                  label="الخصوصية"
                  value={caseDetails.isPrivate ? "قضية خاصة" : "قضية عامة"}
                />
              </div>
            </SectionCard>

            {caseDetails.notes && (
              <SectionCard
                title="ملاحظات"
                icon={StickyNote}
                iconClassName="text-yellow-600"
                gradient="bg-gradient-to-r from-yellow-50 to-orange-50"
              >
                <div className="rounded-2xl bg-gradient-to-br from-yellow-50/50 to-orange-50/50 p-5 border border-yellow-100">
                  <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
                    {caseDetails.notes}
                  </p>
                </div>
              </SectionCard>
            )}
          </div>

          {/* Right: Lawyers */}
          <div className="lg:col-span-4 space-y-6">
            <SectionCard
              title="المحامون المكلفون"
              icon={Users}
              iconClassName="text-blue-600"
              gradient="bg-gradient-to-r from-blue-50 to-indigo-50"
              actions={
                <span className="text-xs font-bold text-blue-600 bg-blue-100 px-3 py-1 rounded-full">
                  {caseDetails.caseLawyers?.length ?? 0}
                </span>
              }
            >
              {caseDetails.caseLawyers.length === 0 ? (
                <div className="rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50/50 p-8 text-center">
                  <Users className="mx-auto text-gray-400" size={32} />
                  <p className="mt-3 text-sm text-gray-700 font-semibold">
                    لا يوجد محامون مكلفون
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    قم بإسناد محامٍ للقضية من صفحة الإدارة.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {caseDetails.caseLawyers.map((lawyer, index) => (
                    <div
                      key={lawyer.id}
                      className="group relative flex items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-gradient-to-br from-white to-blue-50/20 p-5 hover:shadow-lg hover:border-blue-300 transition-all duration-200"
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                          <span className="text-white font-black text-base">
                            {initials(lawyer.name)}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-gray-900">
                            {lawyer.name}
                          </p>
                          <p className="text-xs text-gray-500 font-medium">
                            محامي #{index + 1}
                          </p>
                        </div>
                      </div>
                      <User
                        className="text-gray-400 group-hover:text-blue-600 transition-colors"
                        size={18}
                      />
                    </div>
                  ))}
                </div>
              )}
            </SectionCard>
          </div>
        </div>
      )}

      {activeTab === "accounting" && (
        <div className="space-y-6">
          {/* Accounting Summary */}
          <AccountingSummaryCard
            totalFees={accountingData.summary.totalFees}
            totalExpenses={accountingData.summary.totalExpenses}
            totalPayments={accountingData.summary.totalPayments}
            balance={accountingData.summary.balance}
            isLoading={accountingData.isLoading}
          />

          {/* Fees Section */}
          <FeesSection
            fees={accountingData.fees}
            totalFees={accountingData.summary.totalFees}
            isLoading={accountingData.isLoading}
            onAddFee={handleAddFee}
            onEditFee={handleEditFee}
            onDeleteFee={handleDeleteFee}
          />

          {/* Expenses Section */}
          <ExpensesSection
            expenses={accountingData.expenses}
            totalExpenses={accountingData.summary.totalExpenses}
            isLoading={accountingData.isLoading}
            onAddExpense={handleAddExpense}
            onEditExpense={handleEditExpense}
            onDeleteExpense={handleDeleteExpense}
          />

          {/* Payments Section */}
          <PaymentsSection
            payments={accountingData.payments}
            totalPayments={accountingData.summary.totalPayments}
            totalDue={
              accountingData.summary.totalFees +
              accountingData.summary.totalExpenses
            }
            isLoading={accountingData.isLoading}
            onAddPayment={handleAddPayment}
            onEditPayment={handleEditPayment}
            onDeletePayment={handleDeletePayment}
          />

          {/* Modals */}
          <FeeModal
            isOpen={feeDialogOpen}
            onClose={() => {
              setFeeDialogOpen(false);
              setEditingFeeId(null);
            }}
            caseId={caseId}
            feeId={editingFeeId}
            onSuccess={handleFeeSuccess}
          />

          <ExpenseModal
            isOpen={expenseDialogOpen}
            onClose={() => {
              setExpenseDialogOpen(false);
              setEditingExpenseId(null);
            }}
            caseId={caseId}
            expenseId={editingExpenseId}
            onSuccess={handleExpenseSuccess}
          />

          <PaymentModal
            isOpen={paymentDialogOpen}
            onClose={() => {
              setPaymentDialogOpen(false);
              setEditingPaymentId(null);
            }}
            paymentId={editingPaymentId}
            onSuccess={handlePaymentSuccess}
          />
        </div>
      )}

      {activeTab === "history" && (
        <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-lg text-center">
          <History className="mx-auto text-gray-400" size={48} />
          <p className="mt-4 text-lg font-bold text-gray-900">سجل القضية</p>
          <p className="mt-2 text-sm text-gray-600">
            سيتم إضافة سجل الأنشطة قريباً
          </p>
        </div>
      )}
    </section>
  );
}
