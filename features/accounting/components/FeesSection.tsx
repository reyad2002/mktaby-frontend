"use client";

import { useState } from "react";
import {
  ChevronDown,
  Plus,
  Edit2,
  Trash2,
  DollarSign,
  MoreVertical,
} from "lucide-react";
import type { CaseFeeDto } from "../types/CaseFeesTypes";

interface FeesSectionProps {
  fees: CaseFeeDto[];
  totalFees: number;
  isLoading?: boolean;
  onAddFee?: () => void;
  onEditFee?: (fee: CaseFeeDto) => void;
  onDeleteFee?: (id: number) => void;
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("ar-EG", {
    style: "currency",
    currency: "EGP",
  }).format(amount);

export default function FeesSection({
  fees = [],
  totalFees = 0,
  isLoading = false,
  onAddFee,
  onEditFee,
  onDeleteFee,
}: FeesSectionProps) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-3 border-b border-gray-100 px-6 py-4 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
            <DollarSign size={20} className="text-blue-600" />
          </span>
          <h3 className="text-lg font-semibold text-gray-900">الرسوم</h3>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-2xl font-bold text-blue-700">
            {formatCurrency(totalFees)}
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
          ) : fees.length === 0 ? (
            <div className="text-center py-8">
              <DollarSign size={40} className="mx-auto text-gray-300 mb-2" />
              <p className="text-gray-600 font-medium">لا توجد رسوم مضافة</p>
              <p className="text-sm text-gray-500 mt-1">
                ابدأ بإضافة الرسوم للقضية
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-right py-3 px-3 text-gray-700 font-semibold">
                      الوصف
                    </th>
                    <th className="text-right py-3 px-3 text-gray-700 font-semibold">
                      المبلغ
                    </th>
                    <th className="text-right py-3 px-3 text-gray-700 font-semibold">
                      التاريخ
                    </th>
                    <th className="text-center py-3 px-3 text-gray-700 font-semibold">
                      الإجراءات
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {fees.map((fee) => (
                    <tr
                      key={fee.id}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="py-3 px-3 text-gray-900">
                        {fee.description}
                      </td>
                      <td className="py-3 px-3 font-semibold text-gray-900">
                        {formatCurrency(fee.amount)}
                      </td>
                      <td className="py-3 px-3 text-gray-600">
                        {new Date(fee.createdAt).toLocaleDateString("ar-EG")}
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => onEditFee?.(fee)}
                            className="p-2 hover:bg-blue-100 rounded-lg text-blue-600 transition-colors"
                            title="تعديل"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => onDeleteFee?.(fee.id)}
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
            onClick={onAddFee}
            className="w-full mt-4 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-dashed border-blue-200 bg-blue-50 text-blue-700 font-medium hover:bg-blue-100 transition-colors"
          >
            <Plus size={18} />
            إضافة رسم جديد
          </button>
        </div>
      )}
    </div>
  );
}
