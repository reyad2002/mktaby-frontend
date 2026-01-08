"use client";

import { useState } from "react";
import { ChevronDown, Plus, Edit2, Trash2, TrendingUp } from "lucide-react";
import type { CaseExpenseDto } from "../types/CaseExpensesTypes";

interface ExpensesSectionProps {
  expenses: CaseExpenseDto[];
  totalExpenses: number;
  isLoading?: boolean;
  onAddExpense?: () => void;
  onEditExpense?: (expense: CaseExpenseDto) => void;
  onDeleteExpense?: (id: number) => void;
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("ar-EG", {
    style: "currency",
    currency: "EGP",
  }).format(amount);

export default function ExpensesSection({
  expenses = [],
  totalExpenses = 0,
  isLoading = false,
  onAddExpense,
  onEditExpense,
  onDeleteExpense,
}: ExpensesSectionProps) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-3 border-b border-gray-100 px-6 py-4 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50">
            <TrendingUp size={20} className="text-orange-600" />
          </span>
          <h3 className="text-lg font-semibold text-gray-900">المصاريف</h3>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-2xl font-bold text-orange-700">
            {formatCurrency(totalExpenses)}
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
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="h-16 rounded-xl bg-gray-100 animate-pulse"
                />
              ))}
            </div>
          ) : expenses.length === 0 ? (
            <div className="text-center py-8">
              <TrendingUp size={40} className="mx-auto text-gray-300 mb-2" />
              <p className="text-gray-600 font-medium">لا توجد مصاريف مضافة</p>
              <p className="text-sm text-gray-500 mt-1">
                ابدأ بإضافة المصاريف للقضية
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-right py-3 px-3 text-gray-700 font-semibold">
                      المبلغ
                    </th>
                    <th className="text-right py-3 px-3 text-gray-700 font-semibold">
                      تاريخ المصروف
                    </th>
                    <th className="text-right py-3 px-3 text-gray-700 font-semibold">
                      التاريخ المضاف
                    </th>
                    <th className="text-center py-3 px-3 text-gray-700 font-semibold">
                      الإجراءات
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.map((expense) => (
                    <tr
                      key={expense.id}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="py-3 px-3 font-semibold text-gray-900">
                        {formatCurrency(expense.amount)}
                      </td>
                      <td className="py-3 px-3 text-gray-600">
                        {new Date(expense.expenseDate).toLocaleDateString(
                          "ar-EG"
                        )}
                      </td>
                      <td className="py-3 px-3 text-gray-600">
                        {new Date(expense.createdAt).toLocaleDateString(
                          "ar-EG"
                        )}
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => onEditExpense?.(expense)}
                            className="p-2 hover:bg-blue-100 rounded-lg text-blue-600 transition-colors"
                            title="تعديل"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => onDeleteExpense?.(expense.id)}
                            className="p-2 hover:bg-red-100 rounded-lg text-red-600 transition-colors"
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

          {/* Add Button */}
          <button
            onClick={onAddExpense}
            className="w-full mt-4 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-dashed border-orange-200 bg-orange-50 text-orange-700 font-medium hover:bg-orange-100 transition-colors"
          >
            <Plus size={18} />
            إضافة مصروف جديد
          </button>
        </div>
      )}
    </div>
  );
}
