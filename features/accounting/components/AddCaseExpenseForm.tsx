"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, DollarSign, Calendar, Briefcase } from "lucide-react";
import toast from "react-hot-toast";

import { createCaseExpense } from "@/features/accounting/apis/CaseExpensesApi";
import { getCases } from "@/features/cases/apis/casesApis";
import {
  addCaseExpenseSchema,
  type AddCaseExpenseFormData,
} from "@/features/accounting/validations/caseExpenseValidation";

interface Props {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function AddCaseExpenseForm({ onSuccess, onCancel }: Props) {
  const queryClient = useQueryClient();

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AddCaseExpenseFormData>({
    resolver: zodResolver(addCaseExpenseSchema),
    defaultValues: {
      caseId: undefined,
      amount: undefined,
      expenseDate: new Date().toISOString().split("T")[0],
    },
  });

  // Fetch cases for dropdown
  const { data: casesData, isLoading: casesLoading } = useQuery({
    queryKey: ["cases", "forExpenseForm"],
    queryFn: () => getCases({ PageSize: 100 }),
  });

  const cases = casesData?.data?.data ?? [];

  const mutation = useMutation({
    mutationFn: (data: AddCaseExpenseFormData) =>
      createCaseExpense({
        caseId: data.caseId,
        amount: data.amount,
        expenseDate: new Date(data.expenseDate).toISOString(),
      }),
    onSuccess: (response) => {
      if (response?.succeeded) {
        toast.success(response.message || "تمت إضافة المصروف بنجاح");
        queryClient.invalidateQueries({ queryKey: ["caseExpenses"] });
        onSuccess?.();
      } else {
        toast.error(response?.message || "تعذرت إضافة المصروف");
      }
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(
        err?.response?.data?.message || "حدث خطأ أثناء إضافة المصروف"
      );
    },
  });

  const onSubmit = (data: AddCaseExpenseFormData) => {
    mutation.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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
              value={field.value ?? ""}
              onChange={(e) =>
                field.onChange(
                  e.target.value ? Number(e.target.value) : undefined
                )
              }
              disabled={casesLoading}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:ring-4 focus:ring-blue-200/70 focus:border-blue-300 bg-white disabled:bg-gray-50"
            >
              <option value="">
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
      </div>

      {/* Amount */}
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
          <DollarSign size={16} className="text-emerald-600" />
          المبلغ <span className="text-red-500">*</span>
        </label>
        <Controller
          name="amount"
          control={control}
          render={({ field }) => (
            <input
              type="number"
              step="0.01"
              min="0"
              placeholder="أدخل المبلغ"
              value={field.value ?? ""}
              onChange={(e) =>
                field.onChange(
                  e.target.value ? parseFloat(e.target.value) : undefined
                )
              }
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:ring-4 focus:ring-blue-200/70 focus:border-blue-300 bg-white"
            />
          )}
        />
        {errors.amount && (
          <p className="mt-1.5 text-sm text-red-600">{errors.amount.message}</p>
        )}
      </div>

      {/* Expense Date */}
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
          <Calendar size={16} className="text-orange-600" />
          تاريخ المصروف <span className="text-red-500">*</span>
        </label>
        <input
          type="date"
          {...register("expenseDate")}
          className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:ring-4 focus:ring-blue-200/70 focus:border-blue-300 bg-white"
        />
        {errors.expenseDate && (
          <p className="mt-1.5 text-sm text-red-600">
            {errors.expenseDate.message}
          </p>
        )}
      </div>

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
          disabled={mutation.isPending}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 transition-all shadow-lg shadow-blue-500/25"
        >
          {mutation.isPending ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              جاري الإضافة...
            </>
          ) : (
            "إضافة المصروف"
          )}
        </button>
      </div>
    </form>
  );
}
