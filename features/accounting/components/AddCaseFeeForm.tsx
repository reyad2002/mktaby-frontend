"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, DollarSign, Calendar, Briefcase } from "lucide-react";
import toast from "react-hot-toast";

import { createCaseFee } from "../apis/CaseFeesApi";
import {
  addCaseFeeSchema,
  type AddCaseFeeFormData,
} from "../validations/caseFeeValidation";
import { getCases } from "@/features/cases/apis/casesApis";

interface AddCaseFeeFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  defaultCaseId?: number;
}

export default function AddCaseFeeForm({
  onSuccess,
  onCancel,
  defaultCaseId,
}: AddCaseFeeFormProps) {
  const queryClient = useQueryClient();

  // Fetch cases for dropdown
  const { data: casesData, isLoading: casesLoading } = useQuery({
    queryKey: ["cases", { PageSize: 100 }],
    queryFn: () => getCases({ PageSize: 100 }),
  });

  const cases = casesData?.data?.data ?? [];

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<AddCaseFeeFormData>({
    resolver: zodResolver(addCaseFeeSchema),
    defaultValues: {
      caseId: defaultCaseId || 0,
      amount: 0,
      toBePaidAt: new Date().toISOString().split("T")[0],
    },
  });

  const mutation = useMutation({
    mutationFn: ({
      caseId,
      payload,
    }: {
      caseId: number;
      payload: { amount: number; toBePaidAt: string };
    }) => createCaseFee(caseId, payload),
    onSuccess: (response) => {
      if (response?.succeeded) {
        toast.success(response.message || "تم إضافة الرسوم بنجاح");
        queryClient.invalidateQueries({ queryKey: ["caseFees"] });
        reset();
        onSuccess?.();
      } else {
        toast.error(response?.message || "تعذر إضافة الرسوم");
      }
    },
    onError: (error: unknown) => {
      const err = error as {
        response?: {
          data?: { message?: string; errors?: Record<string, string[]> };
        };
      };
      console.error("Add case fee error:", err?.response?.data);

      if (err?.response?.data?.errors) {
        const errorMessages = Object.values(err.response.data.errors).flat();
        errorMessages.forEach((msg) => toast.error(msg));
      } else {
        toast.error(
          err?.response?.data?.message || "حدث خطأ أثناء إضافة الرسوم"
        );
      }
    },
  });

  const onSubmit = (data: AddCaseFeeFormData) => {
    mutation.mutate({
      caseId: data.caseId,
      payload: {
        amount: data.amount,
        toBePaidAt: new Date(data.toBePaidAt).toISOString(),
      },
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Case Selection */}
      <div>
        <label
          htmlFor="caseId"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          القضية
        </label>
        <div className="relative">
          <Controller
            name="caseId"
            control={control}
            render={({ field }) => (
              <select
                id="caseId"
                {...field}
                onChange={(e) => field.onChange(Number(e.target.value))}
                disabled={casesLoading || !!defaultCaseId}
                className={`w-full pl-10 pr-3 py-2.5 border rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-200/70 focus:border-blue-300 bg-white ${
                  errors.caseId ? "border-red-500" : "border-gray-200"
                } ${casesLoading ? "opacity-50" : ""}`}
              >
                <option value={0}>اختر القضية</option>
                {cases.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} - {c.caseNumber}
                  </option>
                ))}
              </select>
            )}
          />
          <Briefcase
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
        </div>
        {errors.caseId && (
          <p className="text-red-500 text-sm mt-1">{errors.caseId.message}</p>
        )}
      </div>

      {/* Amount */}
      <div>
        <label
          htmlFor="amount"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          المبلغ (ج.م)
        </label>
        <div className="relative">
          <Controller
            name="amount"
            control={control}
            render={({ field }) => (
              <input
                type="number"
                id="amount"
                {...field}
                onChange={(e) => field.onChange(Number(e.target.value))}
                min={0}
                step="0.01"
                className={`w-full pl-10 pr-3 py-2.5 border rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-200/70 focus:border-blue-300 bg-white ${
                  errors.amount ? "border-red-500" : "border-gray-200"
                }`}
                placeholder="0.00"
              />
            )}
          />
          <DollarSign
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
        </div>
        {errors.amount && (
          <p className="text-red-500 text-sm mt-1">{errors.amount.message}</p>
        )}
      </div>

      {/* Due Date */}
      <div>
        <label
          htmlFor="toBePaidAt"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          تاريخ الاستحقاق
        </label>
        <div className="relative">
          <input
            type="date"
            id="toBePaidAt"
            {...register("toBePaidAt")}
            className={`w-full pl-10 pr-3 py-2.5 border rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-200/70 focus:border-blue-300 bg-white ${
              errors.toBePaidAt ? "border-red-500" : "border-gray-200"
            }`}
          />
          <Calendar
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
        </div>
        {errors.toBePaidAt && (
          <p className="text-red-500 text-sm mt-1">
            {errors.toBePaidAt.message}
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
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/25"
        >
          {mutation.isPending ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              جاري الحفظ...
            </>
          ) : (
            "حفظ الرسوم"
          )}
        </button>
      </div>
    </form>
  );
}
