"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Loader2,
  DollarSign,
  Calendar,
  Briefcase,
  Receipt,
  Wallet,
  Scale,
  Building,
  Users,
  FileText,
  Info,
  Hash,
  TrendingUp,
  TrendingDown,
  AlertCircle,
} from "lucide-react";

import { getCaseById } from "@/features/cases/apis/casesApis";
import { getCaseFees } from "../apis/CaseFeesApi";
import { getCaseExpenses } from "../apis/CaseExpensesApi";
import type { CaseFeeDto } from "../types/CaseFeesTypes";
import type { CaseExpenseDto } from "../types/CaseExpensesTypes";

interface Props {
  caseId: number;
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("ar-EG", {
    style: "currency",
    currency: "EGP",
  }).format(amount);

const formatDateShortAr = (date: string) =>
  new Date(date).toLocaleDateString("ar-EG", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

const isOverdue = (toBePaidAt: string) => {
  return new Date(toBePaidAt) < new Date();
};

export default function CaseAccountingDetails({ caseId }: Props) {
  // Fetch case details
  const { data: caseData, isLoading: caseLoading } = useQuery({
    queryKey: ["case", caseId],
    queryFn: () => getCaseById(caseId),
    enabled: !!caseId,
  });

  // Fetch case fees
  const { data: feesData, isLoading: feesLoading } = useQuery({
    queryKey: ["caseFees", { CaseId: caseId }],
    queryFn: () => getCaseFees({ CaseId: caseId, PageSize: 100 }),
    enabled: !!caseId,
  });

  // Fetch case expenses
  const { data: expensesData, isLoading: expensesLoading } = useQuery({
    queryKey: ["caseExpenses", { CaseId: caseId }],
    queryFn: () => getCaseExpenses({ CaseId: caseId, PageSize: 100 }),
    enabled: !!caseId,
  });

  const caseDetails = caseData?.data;
  const fees: CaseFeeDto[] = feesData?.data?.data ?? [];
  const expenses: CaseExpenseDto[] = expensesData?.data?.data ?? [];

  const isLoading = caseLoading || feesLoading || expensesLoading;

  // Calculate totals
  const totalFees = fees.reduce((sum, f) => sum + f.amount, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const netAmount = totalFees - totalExpenses;
  const overdueFees = fees.filter((f) => isOverdue(f.toBePaidAt));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  if (!caseDetails) {
    return (
      <div className="text-center py-8 text-gray-500">
        <AlertCircle size={40} className="mx-auto mb-2 text-gray-400" />
        لم يتم العثور على تفاصيل القضية
      </div>
    );
  }

  return (
    <div className="space-y-6 max-h-[70vh] overflow-y-auto">
      {/* Case Header */}
      <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200/60">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
            <Briefcase size={24} className="text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-gray-900 truncate">
              {caseDetails.name}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <Hash size={14} className="text-gray-400" />
              <span className="text-sm text-gray-600">
                رقم القضية: {caseDetails.caseNumber}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Financial Summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-4 bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl border border-emerald-200/60">
          <div className="flex items-center gap-2 text-emerald-600 mb-2">
            <TrendingUp size={18} />
            <span className="text-xs font-medium">إجمالي الرسوم</span>
          </div>
          <p className="text-xl font-bold text-emerald-700">
            {formatCurrency(totalFees)}
          </p>
          <p className="text-xs text-emerald-600 mt-1">{fees.length} رسوم</p>
        </div>

        <div className="p-4 bg-gradient-to-br from-red-50 to-orange-50 rounded-xl border border-red-200/60">
          <div className="flex items-center gap-2 text-red-600 mb-2">
            <TrendingDown size={18} />
            <span className="text-xs font-medium">إجمالي المصاريف</span>
          </div>
          <p className="text-xl font-bold text-red-700">
            {formatCurrency(totalExpenses)}
          </p>
          <p className="text-xs text-red-600 mt-1">{expenses.length} مصاريف</p>
        </div>

        <div
          className={`p-4 rounded-xl border ${
            netAmount >= 0
              ? "bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200/60"
              : "bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200/60"
          }`}
        >
          <div
            className={`flex items-center gap-2 mb-2 ${
              netAmount >= 0 ? "text-blue-600" : "text-amber-600"
            }`}
          >
            <DollarSign size={18} />
            <span className="text-xs font-medium">الصافي</span>
          </div>
          <p
            className={`text-xl font-bold ${
              netAmount >= 0 ? "text-blue-700" : "text-amber-700"
            }`}
          >
            {formatCurrency(netAmount)}
          </p>
          <p
            className={`text-xs mt-1 ${
              netAmount >= 0 ? "text-blue-600" : "text-amber-600"
            }`}
          >
            {netAmount >= 0 ? "ربح" : "خسارة"}
          </p>
        </div>
      </div>

      {/* Overdue Warning */}
      {overdueFees.length > 0 && (
        <div className="p-3 bg-red-50 rounded-xl border border-red-200 flex items-center gap-3">
          <AlertCircle size={20} className="text-red-600 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-red-800">
              رسوم متأخرة الدفع
            </p>
            <p className="text-xs text-red-600">
              يوجد {overdueFees.length} رسوم متأخرة بإجمالي{" "}
              {formatCurrency(overdueFees.reduce((s, f) => s + f.amount, 0))}
            </p>
          </div>
        </div>
      )}

      {/* Case Info Grid */}
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

      {/* Fees List */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Receipt size={18} className="text-emerald-600" />
          <h4 className="text-sm font-semibold text-gray-800">
            الرسوم ({fees.length})
          </h4>
        </div>

        {fees.length === 0 ? (
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 text-center text-sm text-gray-500">
            لا توجد رسوم مسجلة لهذه القضية
          </div>
        ) : (
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {fees.map((fee) => (
              <div
                key={fee.id}
                className={`p-3 rounded-xl border flex items-center justify-between ${
                  isOverdue(fee.toBePaidAt)
                    ? "bg-red-50 border-red-200"
                    : "bg-emerald-50/50 border-emerald-200/60"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      isOverdue(fee.toBePaidAt)
                        ? "bg-red-100"
                        : "bg-emerald-100"
                    }`}
                  >
                    <Receipt
                      size={16}
                      className={
                        isOverdue(fee.toBePaidAt)
                          ? "text-red-600"
                          : "text-emerald-600"
                      }
                    />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {formatCurrency(fee.amount)}
                    </p>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <Calendar size={10} />
                      استحقاق: {formatDateShortAr(fee.toBePaidAt)}
                      {isOverdue(fee.toBePaidAt) && (
                        <span className="text-red-600 font-medium">
                          (متأخر)
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Expenses List */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Wallet size={18} className="text-orange-600" />
          <h4 className="text-sm font-semibold text-gray-800">
            المصاريف ({expenses.length})
          </h4>
        </div>

        {expenses.length === 0 ? (
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 text-center text-sm text-gray-500">
            لا توجد مصاريف مسجلة لهذه القضية
          </div>
        ) : (
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {expenses.map((expense) => (
              <div
                key={expense.id}
                className="p-3 bg-orange-50/50 rounded-xl border border-orange-200/60 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
                    <Wallet size={16} className="text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {formatCurrency(expense.amount)}
                    </p>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <Calendar size={10} />
                      تاريخ: {formatDateShortAr(expense.expenseDate)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lawyers */}
      {caseDetails.caseLawyers && caseDetails.caseLawyers.length > 0 && (
        <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
          <div className="flex items-center gap-2 text-gray-500 text-xs mb-2">
            <Users size={12} />
            المحامون المعينون
          </div>
          <div className="flex flex-wrap gap-2">
            {caseDetails.caseLawyers.map((lawyer) => (
              <span
                key={lawyer.id}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-800 border border-indigo-200"
              >
                {lawyer.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Notes */}
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
  );
}
