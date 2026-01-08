"use client";

import { DollarSign, TrendingUp, Zap, AlertCircle } from "lucide-react";

interface AccountingSummaryProps {
  totalFees: number;
  totalExpenses: number;
  totalPayments: number;
  balance: number;
  isLoading?: boolean;
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("ar-EG", {
    style: "currency",
    currency: "EGP",
  }).format(amount);

export default function AccountingSummaryCard({
  totalFees,
  totalExpenses,
  totalPayments,
  balance,
  isLoading = false,
}: AccountingSummaryProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-pulse">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-28 rounded-2xl bg-gray-200" />
        ))}
      </div>
    );
  }

  const totalAmount = totalFees + totalExpenses;
  const paymentPercentage =
    totalAmount > 0 ? Math.round((totalPayments / totalAmount) * 100) : 0;

  const cards = [
    {
      label: "إجمالي الرسوم",
      value: totalFees,
      icon: DollarSign,
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      textColor: "text-blue-700",
      iconColor: "text-blue-600",
    },
    {
      label: "إجمالي المصاريف",
      value: totalExpenses,
      icon: TrendingUp,
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200",
      textColor: "text-orange-700",
      iconColor: "text-orange-600",
    },
    {
      label: "المبلغ المدفوع",
      value: totalPayments,
      icon: Zap,
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      textColor: "text-green-700",
      iconColor: "text-green-600",
    },
    {
      label: balance >= 0 ? "المتبقي المستحق" : "المبلغ الزائد",
      value: Math.abs(balance),
      icon: AlertCircle,
      bgColor: balance >= 0 ? "bg-red-50" : "bg-purple-50",
      borderColor: balance >= 0 ? "border-red-200" : "border-purple-200",
      textColor: balance >= 0 ? "text-red-700" : "text-purple-700",
      iconColor: balance >= 0 ? "text-red-600" : "text-purple-600",
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {cards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div
              key={index}
              className={`rounded-2xl border ${card.borderColor} ${card.bgColor} p-5 shadow-sm`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{card.label}</p>
                  <p className={`text-2xl font-bold ${card.textColor}`}>
                    {formatCurrency(card.value)}
                  </p>
                </div>
                <Icon size={24} className={card.iconColor} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Payment Progress Bar */}
      <div
        className={`rounded-2xl border border-gray-200 bg-white p-5 shadow-sm`}
      >
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-medium text-gray-700">نسبة السداد</p>
          <span
            className={`text-lg font-bold ${
              paymentPercentage >= 100 ? "text-green-700" : "text-blue-700"
            }`}
          >
            {paymentPercentage}%
          </span>
        </div>
        <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${
              paymentPercentage >= 100 ? "bg-green-500" : "bg-blue-500"
            }`}
            style={{ width: `${Math.min(paymentPercentage, 100)}%` }}
          />
        </div>
        <p className="text-xs text-gray-600 mt-2">
          {paymentPercentage >= 100
            ? "تم السداد الكامل ✓"
            : `المتبقي: ${formatCurrency(Math.max(balance, 0))}`}
        </p>
      </div>
    </div>
  );
}
