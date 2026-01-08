"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, DollarSign, Calendar } from "lucide-react";
import toast from "react-hot-toast";
import { useEffect } from "react";

import { updateCaseFee, getCaseFeeById } from "../apis/CaseFeesApi";
import {
  updateCaseFeeSchema,
  type UpdateCaseFeeFormData,
} from "../validations/caseFeeValidation";

interface EditCaseFeeFormProps {
  feeId: number;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function EditCaseFeeForm({
  feeId,
  onSuccess,
  onCancel,
}: EditCaseFeeFormProps) {
  const queryClient = useQueryClient();

  // Fetch fee data
  const { data: feeData, isLoading } = useQuery({
    queryKey: ["caseFee", feeId],
    queryFn: () => getCaseFeeById(feeId),
    enabled: !!feeId,
  });

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<UpdateCaseFeeFormData>({
    resolver: zodResolver(updateCaseFeeSchema),
    defaultValues: {
      amount: 0,
      toBePaidAt: new Date().toISOString().split("T")[0],
    },
  });

  // Update form when fee data is loaded
  useEffect(() => {
    if (feeData?.data) {
      reset({
        amount: feeData.data.amount || 0,
        toBePaidAt: feeData.data.toBePaidAt
          ? feeData.data.toBePaidAt.split("T")[0]
          : new Date().toISOString().split("T")[0],
      });
    }
  }, [feeData, reset]);

  const mutation = useMutation({
    mutationFn: (data: UpdateCaseFeeFormData) =>
      updateCaseFee(feeId, {
        amount: data.amount,
        toBePaidAt: new Date(data.toBePaidAt).toISOString(),
      }),
    onSuccess: (response) => {
      if (response?.succeeded) {
        toast.success(response.message || "تم تحديث الرسوم بنجاح");
        queryClient.invalidateQueries({ queryKey: ["caseFees"] });
        queryClient.invalidateQueries({ queryKey: ["caseFee", feeId] });
        onSuccess?.();
      } else {
        toast.error(response?.message || "تعذر تحديث الرسوم");
      }
    },
    onError: (error: unknown) => {
      const err = error as {
        response?: {
          data?: { message?: string; errors?: Record<string, string[]> };
        };
      };
      console.error("Update case fee error:", err?.response?.data);

      if (err?.response?.data?.errors) {
        const errorMessages = Object.values(err.response.data.errors).flat();
        errorMessages.forEach((msg) => toast.error(msg));
      } else {
        toast.error(
          err?.response?.data?.message || "حدث خطأ أثناء تحديث الرسوم"
        );
      }
    },
  });

  const onSubmit = (data: UpdateCaseFeeFormData) => {
    mutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Case Info (Read Only) */}
      {feeData?.data && (
        <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
          <p className="text-sm text-gray-600">
            <span className="font-medium">القضية:</span> رقم{" "}
            {feeData.data.caseId}
          </p>
          <p className="text-sm text-gray-600 mt-1">
            <span className="font-medium">العميل:</span> رقم{" "}
            {feeData.data.clientId}
          </p>
        </div>
      )}

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
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-500/25"
        >
          {mutation.isPending ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              جاري الحفظ...
            </>
          ) : (
            "تحديث الرسوم"
          )}
        </button>
      </div>
    </form>
  );
}
