"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Loader2,
  DollarSign,
  CreditCard,
  TrendingUp,
  TrendingDown,
  Plus,
  Edit2,
  Trash2,
  X,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Clock,
  XCircle,
  ChevronDown,
  Receipt,
  Wallet,
} from "lucide-react";
import toast from "react-hot-toast";

import { getCaseById } from "@/features/cases/apis/casesApis";
import { getCaseFees, deleteCaseFee } from "@/features/accounting/apis/CaseFeesApi";
import { getCaseExpenses, deleteCaseExpense } from "@/features/accounting/apis/CaseExpensesApi";
import { getFeePayments, deleteFeePayment } from "@/features/accounting/apis/FeePaymentApi";

import AddCaseFeeForm from "@/features/accounting/components/AddCaseFeeForm";
import EditCaseFeeForm from "@/features/accounting/components/EditCaseFeeForm";
import AddCaseExpenseForm from "@/features/accounting/components/AddCaseExpenseForm";
import EditCaseExpenseForm from "@/features/accounting/components/EditCaseExpenseForm";
import AddFeePaymentForm from "@/features/accounting/components/AddFeePaymentForm";
import EditFeePaymentForm from "@/features/accounting/components/EditFeePaymentForm";

import type { CaseFeeDto } from "@/features/accounting/types/CaseFeesTypes";
import type { CaseExpenseDto } from "@/features/accounting/types/CaseExpensesTypes";
import type { FeePaymentDto } from "@/features/accounting/types/FeePaymentTypes";

/* ─────────────────────────────── Utilities ─────────────────────────────── */
const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("ar-EG", {
    style: "currency",
    currency: "EGP",
  }).format(amount);

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString("ar-EG", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

const getPaymentMethodLabel = (method: string) => {
  const methods: Record<string, string> = {
    Cash: "نقداً",
    CreditCard: "بطاقة ائتمان",
    BankTransfer: "تحويل بنكي",
    MobilePayment: "دفع موبايل",
    Check: "شيك",
  };
  return methods[method] || method;
};

const getStatusInfo = (status: string) => {
  const statusMap: Record<string, { icon: typeof CheckCircle2; color: string; bg: string; label: string }> = {
    Paid: { icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50", label: "مدفوع" },
    Unpaid: { icon: Clock, color: "text-amber-600", bg: "bg-amber-50", label: "قيد الانتظار" },
    Overdue: { icon: XCircle, color: "text-rose-600", bg: "bg-rose-50", label: "متأخر" },
  };
  return statusMap[status] || statusMap["Unpaid"];
};

/* ─────────────────────────────── UI Styles ─────────────────────────────── */
const ui = {
  card: "rounded-2xl border border-slate-200 bg-white shadow-sm",
  btnPrimary:
    "inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-700 transition-colors disabled:opacity-50",
  btnGhost:
    "inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors",
  btnDanger:
    "inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-rose-700 transition-colors",
};

/* ─────────────────────────────── Modal Shell ─────────────────────────────── */
function ModalShell({
  children,
  onClose,
  title,
}: {
  children: React.ReactNode;
  onClose: () => void;
  title: string;
}) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
          <h3 className="text-lg font-bold text-slate-900">{title}</h3>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

/* ─────────────────────────────── Confirm Delete Modal ─────────────────────────────── */
function ConfirmDeleteModal({
  title,
  message,
  onConfirm,
  onCancel,
  isLoading,
}: {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-rose-50 flex items-center justify-center">
            <AlertCircle className="text-rose-600" size={24} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">{title}</h3>
            <p className="text-sm text-slate-500">{message}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 mt-6">
          <button
            onClick={onCancel}
            className={ui.btnGhost + " flex-1"}
            disabled={isLoading}
          >
            إلغاء
          </button>
          <button
            onClick={onConfirm}
            className={ui.btnDanger + " flex-1"}
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="animate-spin" size={16} /> : <Trash2 size={16} />}
            حذف
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────── Summary Card ─────────────────────────────── */
function SummaryCard({
  title,
  value,
  icon: Icon,
  color,
  subtitle,
}: {
  title: string;
  value: number;
  icon: typeof DollarSign;
  color: "blue" | "emerald" | "orange" | "rose" | "purple";
  subtitle?: string;
}) {
  const colors = {
    blue: { bg: "bg-blue-50", icon: "text-blue-600", value: "text-blue-700", border: "border-blue-200/60" },
    emerald: { bg: "bg-emerald-50", icon: "text-emerald-600", value: "text-emerald-700", border: "border-emerald-200/60" },
    orange: { bg: "bg-orange-50", icon: "text-orange-600", value: "text-orange-700", border: "border-orange-200/60" },
    rose: { bg: "bg-rose-50", icon: "text-rose-600", value: "text-rose-700", border: "border-rose-200/60" },
    purple: { bg: "bg-purple-50", icon: "text-purple-600", value: "text-purple-700", border: "border-purple-200/60" },
  };
  const c = colors[color];

  return (
    <div className={`p-4 rounded-2xl ${c.bg} border ${c.border}`}>
      <div className={`flex items-center gap-2 ${c.icon} mb-2`}>
        <Icon size={18} />
        <span className="text-xs font-medium">{title}</span>
      </div>
      <p className={`text-xl font-bold ${c.value}`}>{formatCurrency(value)}</p>
      {subtitle && <p className={`text-xs mt-1 ${c.icon}`}>{subtitle}</p>}
    </div>
  );
}

/* ─────────────────────────────── Section Card ─────────────────────────────── */
function SectionCard({
  title,
  icon: Icon,
  iconColor,
  total,
  children,
  onAdd,
  addLabel,
  isOpen,
  onToggle,
}: {
  title: string;
  icon: typeof DollarSign;
  iconColor: string;
  total: number;
  children: React.ReactNode;
  onAdd?: () => void;
  addLabel?: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className={ui.card + " overflow-hidden"}>
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-3 border-b border-slate-100 px-6 py-4 hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${iconColor}`}>
            <Icon size={20} />
          </span>
          <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xl font-bold text-slate-700">{formatCurrency(total)}</span>
          <ChevronDown
            size={20}
            className={`text-slate-600 transition-transform ${isOpen ? "rotate-180" : ""}`}
          />
        </div>
      </button>

      {isOpen && (
        <div className="p-6 space-y-4">
          {children}
          {onAdd && (
            <button
              onClick={onAdd}
              className="w-full mt-4 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 text-slate-600 font-medium hover:bg-slate-100 transition-colors"
            >
              <Plus size={18} />
              {addLabel || "إضافة جديد"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────── Main Page ─────────────────────────────── */
export default function CasePaymentsPage() {
  const params = useParams();
  const caseId = Number(params.id);
  const queryClient = useQueryClient();

  // Section toggles
  const [feesOpen, setFeesOpen] = useState(true);
  const [expensesOpen, setExpensesOpen] = useState(true);
  const [paymentsOpen, setPaymentsOpen] = useState(true);

  // Modals
  const [showAddFee, setShowAddFee] = useState(false);
  const [showEditFee, setShowEditFee] = useState<CaseFeeDto | null>(null);
  const [showDeleteFee, setShowDeleteFee] = useState<number | null>(null);

  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showEditExpense, setShowEditExpense] = useState<CaseExpenseDto | null>(null);
  const [showDeleteExpense, setShowDeleteExpense] = useState<number | null>(null);

  const [showAddPayment, setShowAddPayment] = useState(false);
  const [showEditPayment, setShowEditPayment] = useState<FeePaymentDto | null>(null);
  const [showDeletePayment, setShowDeletePayment] = useState<number | null>(null);

  // Queries
  const { data: caseData, isLoading: caseLoading } = useQuery({
    queryKey: ["case", caseId],
    queryFn: () => getCaseById(caseId),
    enabled: !!caseId,
  });

  const { data: feesData, isLoading: feesLoading, isFetching: feesFetching } = useQuery({
    queryKey: ["caseFees", { CaseId: caseId }],
    queryFn: () => getCaseFees({ CaseId: caseId, PageSize: 100 }),
    enabled: !!caseId,
  });

  const { data: expensesData, isLoading: expensesLoading, isFetching: expensesFetching } = useQuery({
    queryKey: ["caseExpenses", { CaseId: caseId }],
    queryFn: () => getCaseExpenses({ CaseId: caseId, PageSize: 100 }),
    enabled: !!caseId,
  });

  const { data: paymentsData, isLoading: paymentsLoading, isFetching: paymentsFetching } = useQuery({
    queryKey: ["feePayments", { CaseId: caseId }],
    queryFn: () => getFeePayments({ CaseId: caseId, PageSize: 100 }),
    enabled: !!caseId,
  });

  // Delete mutations
  const deletFeeMutation = useMutation({
    mutationFn: deleteCaseFee,
    onSuccess: (res) => {
      if (res?.succeeded) {
        toast.success("تم حذف الرسم بنجاح");
        queryClient.invalidateQueries({ queryKey: ["caseFees"] });
      } else {
        toast.error(res?.message || "تعذر حذف الرسم");
      }
      setShowDeleteFee(null);
    },
    onError: () => {
      toast.error("حدث خطأ أثناء الحذف");
      setShowDeleteFee(null);
    },
  });

  const deleteExpenseMutation = useMutation({
    mutationFn: deleteCaseExpense,
    onSuccess: (res) => {
      if (res?.succeeded) {
        toast.success("تم حذف المصروف بنجاح");
        queryClient.invalidateQueries({ queryKey: ["caseExpenses"] });
      } else {
        toast.error(res?.message || "تعذر حذف المصروف");
      }
      setShowDeleteExpense(null);
    },
    onError: () => {
      toast.error("حدث خطأ أثناء الحذف");
      setShowDeleteExpense(null);
    },
  });

  const deletePaymentMutation = useMutation({
    mutationFn: deleteFeePayment,
    onSuccess: (res) => {
      if (res?.succeeded) {
        toast.success("تم حذف الدفعة بنجاح");
        queryClient.invalidateQueries({ queryKey: ["feePayments"] });
      } else {
        toast.error(res?.message || "تعذر حذف الدفعة");
      }
      setShowDeletePayment(null);
    },
    onError: () => {
      toast.error("حدث خطأ أثناء الحذف");
      setShowDeletePayment(null);
    },
  });

  // Data
  const caseDetails = caseData?.data;
  const fees: CaseFeeDto[] = feesData?.data?.data ?? [];
  const expenses: CaseExpenseDto[] = expensesData?.data?.data ?? [];
  const payments: FeePaymentDto[] = paymentsData?.data?.data ?? [];

  // Calculations
  const totalFees = fees.reduce((sum, f) => sum + f.amount, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalPayments = payments.reduce((sum, p) => sum + p.amount, 0);
  const totalDue = totalFees + totalExpenses;
  const balance = totalDue - totalPayments;
  const paymentPercentage = totalDue > 0 ? Math.round((totalPayments / totalDue) * 100) : 0;

  const isLoading = caseLoading || feesLoading || expensesLoading || paymentsLoading;
  const isFetching = feesFetching || expensesFetching || paymentsFetching;

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["caseFees", { CaseId: caseId }] });
    queryClient.invalidateQueries({ queryKey: ["caseExpenses", { CaseId: caseId }] });
    queryClient.invalidateQueries({ queryKey: ["feePayments", { CaseId: caseId }] });
    toast.success("جاري تحديث البيانات...");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-teal-600" size={40} />
        </div>
      </div>
    );
  }

  return (
    <section className="min-h-screen bg-slate-50 p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className={ui.card + " p-5"}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center">
              <Wallet className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">المحاسبة المالية</h1>
              <p className="text-sm text-slate-500">
                {caseDetails?.name || "القضية"} - {caseDetails?.caseNumber || ""}
              </p>
            </div>
          </div>
          <button
            onClick={handleRefresh}
            className={ui.btnGhost}
            disabled={isFetching}
          >
            {isFetching ? (
              <Loader2 className="animate-spin" size={16} />
            ) : (
              <RefreshCw size={16} />
            )}
            تحديث
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <SummaryCard
          title="إجمالي الرسوم"
          value={totalFees}
          icon={Receipt}
          color="blue"
          subtitle={`${fees.length} رسم`}
        />
        <SummaryCard
          title="إجمالي المصاريف"
          value={totalExpenses}
          icon={TrendingDown}
          color="orange"
          subtitle={`${expenses.length} مصروف`}
        />
        <SummaryCard
          title="إجمالي المستحق"
          value={totalDue}
          icon={DollarSign}
          color="purple"
        />
        <SummaryCard
          title="المدفوع"
          value={totalPayments}
          icon={CreditCard}
          color="emerald"
          subtitle={`${paymentPercentage}% من المستحق`}
        />
        <SummaryCard
          title="المتبقي"
          value={balance}
          icon={balance >= 0 ? TrendingUp : AlertCircle}
          color={balance > 0 ? "rose" : "emerald"}
          subtitle={balance > 0 ? "مطلوب سداده" : "مكتمل"}
        />
      </div>

      {/* Progress Bar */}
      <div className={ui.card + " p-5"}>
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-slate-700">نسبة السداد</span>
          <span className="text-sm font-bold text-teal-600">{paymentPercentage}%</span>
        </div>
        <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(paymentPercentage, 100)}%` }}
          />
        </div>
        <div className="flex items-center justify-between mt-2 text-xs text-slate-500">
          <span>المدفوع: {formatCurrency(totalPayments)}</span>
          <span>المتبقي: {formatCurrency(balance)}</span>
        </div>
      </div>

      {/* Fees Section */}
      <SectionCard
        title="الرسوم"
        icon={Receipt}
        iconColor="bg-blue-50 text-blue-600"
        total={totalFees}
        isOpen={feesOpen}
        onToggle={() => setFeesOpen(!feesOpen)}
        onAdd={() => setShowAddFee(true)}
        addLabel="إضافة رسم جديد"
      >
        {fees.length === 0 ? (
          <div className="text-center py-8">
            <Receipt size={40} className="mx-auto text-slate-300 mb-2" />
            <p className="text-slate-600 font-medium">لا توجد رسوم مضافة</p>
            <p className="text-sm text-slate-500 mt-1">ابدأ بإضافة الرسوم للقضية</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-right py-3 px-3 text-slate-700 font-semibold">الوصف</th>
                  <th className="text-right py-3 px-3 text-slate-700 font-semibold">المبلغ</th>
                  <th className="text-right py-3 px-3 text-slate-700 font-semibold">تاريخ الاستحقاق</th>
                  <th className="text-center py-3 px-3 text-slate-700 font-semibold">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {fees.map((fee) => (
                  <tr key={fee.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-3 px-3 text-slate-900">{fee.description || `رسم #${fee.id}`}</td>
                    <td className="py-3 px-3 font-semibold text-slate-900">{formatCurrency(fee.amount)}</td>
                    <td className="py-3 px-3 text-slate-600">{formatDate(fee.toBePaidAt)}</td>
                    <td className="py-3 px-3">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => setShowEditFee(fee)}
                          className="p-2 hover:bg-blue-100 rounded-lg text-blue-600 transition-colors"
                          title="تعديل"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => setShowDeleteFee(fee.id)}
                          className="p-2 hover:bg-rose-100 rounded-lg text-rose-600 transition-colors"
                          title="حذف"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>

      {/* Expenses Section */}
      <SectionCard
        title="المصاريف"
        icon={TrendingDown}
        iconColor="bg-orange-50 text-orange-600"
        total={totalExpenses}
        isOpen={expensesOpen}
        onToggle={() => setExpensesOpen(!expensesOpen)}
        onAdd={() => setShowAddExpense(true)}
        addLabel="إضافة مصروف جديد"
      >
        {expenses.length === 0 ? (
          <div className="text-center py-8">
            <TrendingDown size={40} className="mx-auto text-slate-300 mb-2" />
            <p className="text-slate-600 font-medium">لا توجد مصاريف مضافة</p>
            <p className="text-sm text-slate-500 mt-1">ابدأ بإضافة المصاريف للقضية</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-right py-3 px-3 text-slate-700 font-semibold">المبلغ</th>
                  <th className="text-right py-3 px-3 text-slate-700 font-semibold">تاريخ المصروف</th>
                  <th className="text-right py-3 px-3 text-slate-700 font-semibold">تاريخ الإضافة</th>
                  <th className="text-center py-3 px-3 text-slate-700 font-semibold">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((expense) => (
                  <tr key={expense.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-3 px-3 font-semibold text-slate-900">{formatCurrency(expense.amount)}</td>
                    <td className="py-3 px-3 text-slate-600">{formatDate(expense.expenseDate)}</td>
                    <td className="py-3 px-3 text-slate-600">{formatDate(expense.createdAt)}</td>
                    <td className="py-3 px-3">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => setShowEditExpense(expense)}
                          className="p-2 hover:bg-blue-100 rounded-lg text-blue-600 transition-colors"
                          title="تعديل"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => setShowDeleteExpense(expense.id)}
                          className="p-2 hover:bg-rose-100 rounded-lg text-rose-600 transition-colors"
                          title="حذف"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>

      {/* Payments Section */}
      <SectionCard
        title="الدفعات"
        icon={CreditCard}
        iconColor="bg-emerald-50 text-emerald-600"
        total={totalPayments}
        isOpen={paymentsOpen}
        onToggle={() => setPaymentsOpen(!paymentsOpen)}
        onAdd={() => setShowAddPayment(true)}
        addLabel="إضافة دفعة جديدة"
      >
        {/* Payment Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3">
            <p className="text-xs text-emerald-700 mb-1">المدفوع</p>
            <p className="text-lg font-bold text-emerald-700">{formatCurrency(totalPayments)}</p>
          </div>
          <div className="rounded-xl bg-rose-50 border border-rose-200 p-3">
            <p className="text-xs text-rose-700 mb-1">المتبقي</p>
            <p className="text-lg font-bold text-rose-700">{formatCurrency(Math.max(balance, 0))}</p>
          </div>
          <div className="rounded-xl bg-blue-50 border border-blue-200 p-3">
            <p className="text-xs text-blue-700 mb-1">نسبة السداد</p>
            <p className="text-lg font-bold text-blue-700">{paymentPercentage}%</p>
          </div>
        </div>

        {payments.length === 0 ? (
          <div className="text-center py-8">
            <CreditCard size={40} className="mx-auto text-slate-300 mb-2" />
            <p className="text-slate-600 font-medium">لم تتم أي دفعات حتى الآن</p>
            <p className="text-sm text-slate-500 mt-1">ابدأ بتسجيل دفعة جديدة</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-right py-3 px-3 text-slate-700 font-semibold">التاريخ</th>
                  <th className="text-right py-3 px-3 text-slate-700 font-semibold">المبلغ</th>
                  <th className="text-right py-3 px-3 text-slate-700 font-semibold">طريقة الدفع</th>
                  <th className="text-right py-3 px-3 text-slate-700 font-semibold">الحالة</th>
                  <th className="text-center py-3 px-3 text-slate-700 font-semibold">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => {
                  const statusInfo = getStatusInfo(payment.status);
                  const StatusIcon = statusInfo.icon;
                  return (
                    <tr key={payment.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-3 px-3 text-slate-900">{formatDate(payment.paymentDate)}</td>
                      <td className="py-3 px-3 font-semibold text-slate-900">{formatCurrency(payment.amount)}</td>
                      <td className="py-3 px-3 text-slate-600">{getPaymentMethodLabel(payment.paymentMethod)}</td>
                      <td className="py-3 px-3">
                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${statusInfo.bg}`}>
                          <StatusIcon size={14} className={statusInfo.color} />
                          <span className={`text-xs font-medium ${statusInfo.color}`}>{statusInfo.label}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => setShowEditPayment(payment)}
                            className="p-2 hover:bg-blue-100 rounded-lg text-blue-600 transition-colors"
                            title="تعديل"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => setShowDeletePayment(payment.id)}
                            className="p-2 hover:bg-rose-100 rounded-lg text-rose-600 transition-colors"
                            title="حذف"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>

      {/* ─────────────────────────────── Modals ─────────────────────────────── */}

      {/* Add Fee Modal */}
      {showAddFee && (
        <ModalShell onClose={() => setShowAddFee(false)} title="إضافة رسم جديد">
          <AddCaseFeeForm
            defaultCaseId={caseId}
            onSuccess={() => {
              setShowAddFee(false);
              queryClient.invalidateQueries({ queryKey: ["caseFees"] });
            }}
            onCancel={() => setShowAddFee(false)}
          />
        </ModalShell>
      )}

      {/* Edit Fee Modal */}
      {showEditFee && (
        <ModalShell onClose={() => setShowEditFee(null)} title="تعديل الرسم">
          <EditCaseFeeForm
            feeId={showEditFee.id}
            onSuccess={() => {
              setShowEditFee(null);
              queryClient.invalidateQueries({ queryKey: ["caseFees"] });
            }}
            onCancel={() => setShowEditFee(null)}
          />
        </ModalShell>
      )}

      {/* Delete Fee Modal */}
      {showDeleteFee && (
        <ConfirmDeleteModal
          title="حذف الرسم"
          message="هل أنت متأكد من حذف هذا الرسم؟ لا يمكن التراجع عن هذا الإجراء."
          onConfirm={() => deletFeeMutation.mutate(showDeleteFee)}
          onCancel={() => setShowDeleteFee(null)}
          isLoading={deletFeeMutation.isPending}
        />
      )}

      {/* Add Expense Modal */}
      {showAddExpense && (
        <ModalShell onClose={() => setShowAddExpense(false)} title="إضافة مصروف جديد">
          <AddCaseExpenseForm
            onSuccess={() => {
              setShowAddExpense(false);
              queryClient.invalidateQueries({ queryKey: ["caseExpenses"] });
            }}
            onCancel={() => setShowAddExpense(false)}
          />
        </ModalShell>
      )}

      {/* Edit Expense Modal */}
      {showEditExpense && (
        <ModalShell onClose={() => setShowEditExpense(null)} title="تعديل المصروف">
          <EditCaseExpenseForm
            expenseId={showEditExpense.id}
            onSuccess={() => {
              setShowEditExpense(null);
              queryClient.invalidateQueries({ queryKey: ["caseExpenses"] });
            }}
            onCancel={() => setShowEditExpense(null)}
          />
        </ModalShell>
      )}

      {/* Delete Expense Modal */}
      {showDeleteExpense && (
        <ConfirmDeleteModal
          title="حذف المصروف"
          message="هل أنت متأكد من حذف هذا المصروف؟ لا يمكن التراجع عن هذا الإجراء."
          onConfirm={() => deleteExpenseMutation.mutate(showDeleteExpense)}
          onCancel={() => setShowDeleteExpense(null)}
          isLoading={deleteExpenseMutation.isPending}
        />
      )}

      {/* Add Payment Modal */}
      {showAddPayment && (
        <ModalShell onClose={() => setShowAddPayment(false)} title="إضافة دفعة جديدة">
          <AddFeePaymentForm
            onSuccess={() => {
              setShowAddPayment(false);
              queryClient.invalidateQueries({ queryKey: ["feePayments"] });
            }}
            onCancel={() => setShowAddPayment(false)}
          />
        </ModalShell>
      )}

      {/* Edit Payment Modal */}
      {showEditPayment && (
        <ModalShell onClose={() => setShowEditPayment(null)} title="تعديل الدفعة">
          <EditFeePaymentForm
            paymentId={showEditPayment.id}
            onSuccess={() => {
              setShowEditPayment(null);
              queryClient.invalidateQueries({ queryKey: ["feePayments"] });
            }}
            onCancel={() => setShowEditPayment(null)}
          />
        </ModalShell>
      )}

      {/* Delete Payment Modal */}
      {showDeletePayment && (
        <ConfirmDeleteModal
          title="حذف الدفعة"
          message="هل أنت متأكد من حذف هذه الدفعة؟ لا يمكن التراجع عن هذا الإجراء."
          onConfirm={() => deletePaymentMutation.mutate(showDeletePayment)}
          onCancel={() => setShowDeletePayment(null)}
          isLoading={deletePaymentMutation.isPending}
        />
      )}
    </section>
  );
}