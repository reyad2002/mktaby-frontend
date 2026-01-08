"use client";

import { useState } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Loader2,
  DollarSign,
  Briefcase,
  Plus,
  Trash2,
  Receipt,
  Wallet,
} from "lucide-react";
import toast from "react-hot-toast";
import { z } from "zod";

import { createCaseFee } from "../apis/CaseFeesApi";
import { createCaseExpense } from "../apis/CaseExpensesApi";
import { getCases } from "@/features/cases/apis/casesApis";

// Combined schema for fee and expense
const combinedSchema = z.object({
  caseId: z
    .number({ message: "يرجى اختيار القضية" })
    .min(1, "يرجى اختيار القضية"),
  fees: z.array(
    z.object({
      amount: z
        .number({ message: "يرجى إدخال المبلغ" })
        .min(0.01, "المبلغ يجب أن يكون أكبر من صفر"),
      toBePaidAt: z
        .string({ message: "يرجى إدخال تاريخ الاستحقاق" })
        .min(1, "يرجى إدخال تاريخ الاستحقاق"),
    })
  ),
  expenses: z.array(
    z.object({
      amount: z
        .number({ message: "يرجى إدخال المبلغ" })
        .min(0.01, "المبلغ يجب أن يكون أكبر من صفر"),
      expenseDate: z
        .string({ message: "يرجى إدخال تاريخ المصروف" })
        .min(1, "يرجى إدخال تاريخ المصروف"),
    })
  ),
});

type CombinedFormData = z.infer<typeof combinedSchema>;

interface Props {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function AddCaseFeeAndExpenseForm({
  onSuccess,
  onCancel,
}: Props) {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CombinedFormData>({
    resolver: zodResolver(combinedSchema),
    defaultValues: {
      caseId: 0,
      fees: [{ amount: 0, toBePaidAt: new Date().toISOString().split("T")[0] }],
      expenses: [],
    },
  });

  const {
    fields: feeFields,
    append: appendFee,
    remove: removeFee,
  } = useFieldArray({
    control,
    name: "fees",
  });

  const {
    fields: expenseFields,
    append: appendExpense,
    remove: removeExpense,
  } = useFieldArray({
    control,
    name: "expenses",
  });

  // Fetch cases for dropdown
  const { data: casesData, isLoading: casesLoading } = useQuery({
    queryKey: ["cases", { PageSize: 100 }],
    queryFn: () => getCases({ PageSize: 100 }),
  });

  const cases = casesData?.data?.data ?? [];
  const selectedCaseId = watch("caseId");
  const selectedCase = cases.find((c) => c.id === selectedCaseId);

  const feeMutation = useMutation({
    mutationFn: ({
      caseId,
      payload,
    }: {
      caseId: number;
      payload: { amount: number; toBePaidAt: string };
    }) => createCaseFee(caseId, payload),
  });

  const expenseMutation = useMutation({
    mutationFn: (data: {
      caseId: number;
      amount: number;
      expenseDate: string;
    }) => createCaseExpense(data),
  });

  const onSubmit = async (data: CombinedFormData) => {
    setIsSubmitting(true);

    try {
      // Add all fees
      const feePromises = data.fees.map((fee) =>
        feeMutation.mutateAsync({
          caseId: data.caseId,
          payload: {
            amount: fee.amount,
            toBePaidAt: new Date(fee.toBePaidAt).toISOString(),
          },
        })
      );

      // Add all expenses
      const expensePromises = data.expenses.map((expense) =>
        expenseMutation.mutateAsync({
          caseId: data.caseId,
          amount: expense.amount,
          expenseDate: new Date(expense.expenseDate).toISOString(),
        })
      );

      await Promise.all([...feePromises, ...expensePromises]);

      toast.success("تم إضافة الرسوم والمصاريف بنجاح");
      queryClient.invalidateQueries({ queryKey: ["caseFees"] });
      queryClient.invalidateQueries({ queryKey: ["caseExpenses"] });
      onSuccess?.();
    } catch (error) {
      console.error("Error adding fees/expenses:", error);
      toast.error("حدث خطأ أثناء إضافة الرسوم والمصاريف");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate totals
  const fees = watch("fees");
  const expenses = watch("expenses");
  const totalFees = fees.reduce((sum, f) => sum + (f.amount || 0), 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Case Selection */}
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
          <Briefcase size={16} className="text-blue-600" />
          القضية <span className="text-red-500">*</span>
        </label>
        <Controller
          name="caseId"
          control={control}
          render={({ field }) => (
            <select
              {...field}
              onChange={(e) => field.onChange(Number(e.target.value))}
              disabled={casesLoading}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:ring-4 focus:ring-blue-200/70 focus:border-blue-300 bg-white disabled:bg-gray-50"
            >
              <option value={0}>
                {casesLoading ? "جاري التحميل..." : "اختر القضية"}
              </option>
              {cases.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} - {c.caseNumber}
                </option>
              ))}
            </select>
          )}
        />
        {errors.caseId && (
          <p className="mt-1.5 text-sm text-red-600">{errors.caseId.message}</p>
        )}
        {selectedCase && (
          <div className="mt-2 p-3 bg-blue-50 rounded-xl border border-blue-100">
            <p className="text-sm text-blue-800">
              <span className="font-semibold">القضية المختارة:</span>{" "}
              {selectedCase.name}
            </p>
            <p className="text-xs text-blue-600 mt-1">
              رقم القضية: {selectedCase.caseNumber}
            </p>
          </div>
        )}
      </div>

      {/* Fees Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-800">
            <Receipt size={16} className="text-emerald-600" />
            الرسوم (الأتعاب)
          </label>
          <button
            type="button"
            onClick={() =>
              appendFee({
                amount: 0,
                toBePaidAt: new Date().toISOString().split("T")[0],
              })
            }
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors border border-emerald-200"
          >
            <Plus size={14} />
            إضافة رسوم
          </button>
        </div>

        {feeFields.length === 0 ? (
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 text-center text-sm text-gray-500">
            لا توجد رسوم. اضغط &quot;إضافة رسوم&quot; لإضافة رسوم جديدة.
          </div>
        ) : (
          <div className="space-y-3">
            {feeFields.map((field, index) => (
              <div
                key={field.id}
                className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-200/60 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-emerald-700">
                    رسوم #{index + 1}
                  </span>
                  {feeFields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeFee(index)}
                      className="p-1 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">
                      المبلغ
                    </label>
                    <Controller
                      name={`fees.${index}.amount`}
                      control={control}
                      render={({ field }) => (
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseFloat(e.target.value) || 0)
                          }
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-300"
                          placeholder="0.00"
                        />
                      )}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">
                      تاريخ الاستحقاق
                    </label>
                    <Controller
                      name={`fees.${index}.toBePaidAt`}
                      control={control}
                      render={({ field }) => (
                        <input
                          type="date"
                          {...field}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-300"
                        />
                      )}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Expenses Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-800">
            <Wallet size={16} className="text-orange-600" />
            المصاريف
          </label>
          <button
            type="button"
            onClick={() =>
              appendExpense({
                amount: 0,
                expenseDate: new Date().toISOString().split("T")[0],
              })
            }
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-orange-700 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors border border-orange-200"
          >
            <Plus size={14} />
            إضافة مصروف
          </button>
        </div>

        {expenseFields.length === 0 ? (
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 text-center text-sm text-gray-500">
            لا توجد مصاريف. اضغط &quot;إضافة مصروف&quot; لإضافة مصروف جديد.
          </div>
        ) : (
          <div className="space-y-3">
            {expenseFields.map((field, index) => (
              <div
                key={field.id}
                className="p-3 bg-orange-50/50 rounded-xl border border-orange-200/60 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-orange-700">
                    مصروف #{index + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeExpense(index)}
                    className="p-1 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">
                      المبلغ
                    </label>
                    <Controller
                      name={`expenses.${index}.amount`}
                      control={control}
                      render={({ field }) => (
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseFloat(e.target.value) || 0)
                          }
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300"
                          placeholder="0.00"
                        />
                      )}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">
                      تاريخ المصروف
                    </label>
                    <Controller
                      name={`expenses.${index}.expenseDate`}
                      control={control}
                      render={({ field }) => (
                        <input
                          type="date"
                          {...field}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300"
                        />
                      )}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Summary */}
      {(totalFees > 0 || totalExpenses > 0) && (
        <div className="p-4 bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl border border-gray-200">
          <h4 className="text-sm font-semibold text-gray-800 mb-3">ملخص</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                <Receipt size={16} className="text-emerald-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">إجمالي الرسوم</p>
                <p className="text-sm font-bold text-emerald-700">
                  {totalFees.toLocaleString("ar-EG")} ج.م
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
                <Wallet size={16} className="text-orange-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">إجمالي المصاريف</p>
                <p className="text-sm font-bold text-orange-700">
                  {totalExpenses.toLocaleString("ar-EG")} ج.م
                </p>
              </div>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">الصافي</span>
              <span
                className={`text-lg font-bold ${
                  totalFees - totalExpenses >= 0
                    ? "text-emerald-700"
                    : "text-red-700"
                }`}
              >
                {(totalFees - totalExpenses).toLocaleString("ar-EG")} ج.م
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
        >
          إلغاء
        </button>
        <button
          type="submit"
          disabled={isSubmitting || selectedCaseId === 0}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 transition-all shadow-lg shadow-blue-500/25"
        >
          {isSubmitting ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              جاري الحفظ...
            </>
          ) : (
            <>
              <DollarSign size={16} />
              حفظ الكل
            </>
          )}
        </button>
      </div>
    </form>
  );
}
