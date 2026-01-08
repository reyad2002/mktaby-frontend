"use client";

import { useState } from "react";
import {
  ChevronDown,
  Plus,
  Edit2,
  Trash2,
  CreditCard,
  CheckCircle2,
  Clock,
  XCircle,
} from "lucide-react";
import type { FeePaymentDto } from "../types/FeePaymentTypes";

interface PaymentsSectionProps {
  payments: FeePaymentDto[];
  totalPayments: number;
  totalDue: number;
  isLoading?: boolean;
  onAddPayment?: () => void;
  onEditPayment?: (payment: FeePaymentDto) => void;
  onDeletePayment?: (id: number) => void;
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("ar-EG", {
    style: "currency",
    currency: "EGP",
  }).format(amount);

const getStatusIcon = (status: string) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const icons: Record<string, { icon: any; color: string; label: string }> = {
    Paid: { icon: CheckCircle2, color: "text-green-600", label: "مدفوع" },
    Unpaid: { icon: Clock, color: "text-yellow-600", label: "قيد الانتظار" },
    Overdue: { icon: XCircle, color: "text-red-600", label: "متأخر" },
  };
  return icons[status] || icons["Unpaid"];
};

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

export default function PaymentsSection({
  payments = [],
  totalPayments = 0,
  totalDue = 0,
  isLoading = false,
  onAddPayment,
  onEditPayment,
  onDeletePayment,
}: PaymentsSectionProps) {
  const [isOpen, setIsOpen] = useState(true);
  const remaining = Math.max(totalDue - totalPayments, 0);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-3 border-b border-gray-100 px-6 py-4 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-green-50">
            <CreditCard size={20} className="text-green-600" />
          </span>
          <h3 className="text-lg font-semibold text-gray-900">الدفعات</h3>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-2xl font-bold text-green-700">
            {formatCurrency(totalPayments)}
          </span>
          <ChevronDown
            size={20}
            className={`text-gray-600 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </div>
      </button>

      {/* Content */}
      {isOpen && (
        <div className="p-6 space-y-4">
          {/* Payment Stats */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="rounded-xl bg-green-50 border border-green-200 p-3">
              <p className="text-xs text-green-700 mb-1">المدفوع</p>
              <p className="text-lg font-bold text-green-700">
                {formatCurrency(totalPayments)}
              </p>
            </div>
            <div className="rounded-xl bg-red-50 border border-red-200 p-3">
              <p className="text-xs text-red-700 mb-1">المتبقي</p>
              <p className="text-lg font-bold text-red-700">
                {formatCurrency(remaining)}
              </p>
            </div>
            <div className="rounded-xl bg-blue-50 border border-blue-200 p-3">
              <p className="text-xs text-blue-700 mb-1">نسبة السداد</p>
              <p className="text-lg font-bold text-blue-700">
                {totalDue > 0
                  ? Math.round((totalPayments / totalDue) * 100)
                  : 0}
                %
              </p>
            </div>
          </div>

          {/* Payments Table */}
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="h-16 rounded-xl bg-gray-100 animate-pulse"
                />
              ))}
            </div>
          ) : payments.length === 0 ? (
            <div className="text-center py-8">
              <CreditCard size={40} className="mx-auto text-gray-300 mb-2" />
              <p className="text-gray-600 font-medium">
                لم تتم أي دفعات حتى الآن
              </p>
              <p className="text-sm text-gray-500 mt-1">
                ابدأ بتسجيل دفعة جديدة
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-right py-3 px-3 text-gray-700 font-semibold">
                      التاريخ
                    </th>
                    <th className="text-right py-3 px-3 text-gray-700 font-semibold">
                      المبلغ
                    </th>
                    <th className="text-right py-3 px-3 text-gray-700 font-semibold">
                      طريقة الدفع
                    </th>
                    <th className="text-right py-3 px-3 text-gray-700 font-semibold">
                      الحالة
                    </th>
                    <th className="text-center py-3 px-3 text-gray-700 font-semibold">
                      الإجراءات
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment) => {
                    const statusInfo = getStatusIcon(payment.status);
                    const StatusIcon = statusInfo.icon;
                    return (
                      <tr
                        key={payment.id}
                        className="border-b border-gray-100 hover:bg-gray-50"
                      >
                        <td className="py-3 px-3 text-gray-900">
                          {new Date(payment.paymentDate).toLocaleDateString(
                            "ar-EG"
                          )}
                        </td>
                        <td className="py-3 px-3 font-semibold text-gray-900">
                          {formatCurrency(payment.amount)}
                        </td>
                        <td className="py-3 px-3 text-gray-600">
                          {getPaymentMethodLabel(payment.paymentMethod)}
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2">
                            <StatusIcon
                              size={16}
                              className={statusInfo.color}
                            />
                            <span className="text-gray-700">
                              {statusInfo.label}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => onEditPayment?.(payment)}
                              className="p-2 hover:bg-blue-100 rounded-lg text-blue-600 transition-colors"
                              title="تعديل"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => onDeletePayment?.(payment.id)}
                              className="p-2 hover:bg-red-100 rounded-lg text-red-600 transition-colors"
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

          {/* Add Button */}
          <button
            onClick={onAddPayment}
            className="w-full mt-4 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-dashed border-green-200 bg-green-50 text-green-700 font-medium hover:bg-green-100 transition-colors"
          >
            <Plus size={18} />
            إضافة دفعة جديدة
          </button>
        </div>
      )}
    </div>
  );
}
