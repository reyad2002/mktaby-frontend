"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";

import { createFeePayment } from "../apis/FeePaymentApi";
import {
  createFeePaymentSchema,
  type CreateFeePaymentFormData,
} from "../validations/feePaymentValidation";
import { useCaseDropdown } from "@/features/cases/hooks/caseHooks";

interface Props {
  onSuccess?: () => void;
  onCancel?: () => void;
  defaultCaseId?: number;
}

const PAYMENT_METHODS = [
  { value: "Cash", label: "نقداً" },
  { value: "CreditCard", label: "بطاقة ائتمان" },
  { value: "BankTransfer", label: "تحويل بنكي" },
  { value: "MobilePayment", label: "دفع موبايل" },
  { value: "Check", label: "شيك" },
];

const PAYMENT_STATUS = [
  { value: "Unpaid", label: "غير مدفوع" },
  { value: "Paid", label: "مدفوع" },
  { value: "Overdue", label: "متأخر" },
];

export default function AddFeePaymentForm({
  onSuccess,
  onCancel,
  defaultCaseId,
}: Props) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<CreateFeePaymentFormData>({
    resolver: zodResolver(createFeePaymentSchema),
    defaultValues: {
      title: "",
      caseId: defaultCaseId || undefined,
      amount: undefined,
      paymentDate: "",
      paymentMethod: "Cash",
      dueDate: "",
      status: "Unpaid",
    },
  });

  // fetch cases for dropdown
  const { data: casesDropdownData } = useCaseDropdown({ PageSize: 1000 });
  const cases = casesDropdownData?.data || [];

  const mutation = useMutation({
    mutationFn: createFeePayment,
    onSuccess: (response) => {
      if (response?.succeeded) {
        toast.success(response.message || "تم إضافة الدفعة بنجاح");
        onSuccess?.();
      } else {
        toast.error(response?.message || "تعذر إضافة الدفعة");
      }
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err?.response?.data?.message || "حدث خطأ أثناء إضافة الدفعة");
    },
  });

  const onSubmit = (data: CreateFeePaymentFormData) => {
    // Transform dates to ISO format to match API requirements
    const payload = {
      title: data.title,
      caseId: data.caseId,
      amount: data.amount,
      paymentDate: new Date(data.paymentDate).toISOString(),
      paymentMethod: data.paymentMethod,
      dueDate: new Date(data.dueDate).toISOString(),
      status: data.status,
    };
    mutation.mutate(payload);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          العنوان <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          {...register("title")}
          className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:ring-4 focus:ring-blue-200/70 focus:border-blue-300 bg-white"
          placeholder="مثال: دفعة أولى - رسوم القضية"
        />
        {errors.title && (
          <p className="text-red-600 text-sm mt-1">{errors.title.message}</p>
        )}
      </div>

      {/* Case - Hidden if defaultCaseId is provided */}
      {!defaultCaseId && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            القضية <span className="text-red-500">*</span>
          </label>
          <Controller
            name="caseId"
            control={control}
            render={({ field }) => (
              <select
                {...field}
                value={field.value || ""}
                onChange={(e) =>
                  field.onChange(
                    e.target.value ? Number(e.target.value) : undefined
                  )
                }
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:ring-4 focus:ring-blue-200/70 focus:border-blue-300 bg-white"
              >
                <option value="">اختر القضية</option>
                {cases.map((caseItem) => (
                  <option key={caseItem.id} value={caseItem.id}>
                    {caseItem.name} - {caseItem.caseNumber} (
                    {caseItem.clientName})
                  </option>
                ))}
              </select>
            )}
          />
          {errors.caseId && (
            <p className="text-red-600 text-sm mt-1">{errors.caseId.message}</p>
          )}
        </div>
      )}

      {/* Amount & Payment Method */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            المبلغ <span className="text-red-500">*</span>
          </label>
          <Controller
            name="amount"
            control={control}
            render={({ field }) => (
              <input
                type="number"
                step="0.01"
                {...field}
                value={field.value || ""}
                onChange={(e) =>
                  field.onChange(
                    e.target.value ? Number(e.target.value) : undefined
                  )
                }
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:ring-4 focus:ring-blue-200/70 focus:border-blue-300 bg-white"
                placeholder="0.00"
              />
            )}
          />
          {errors.amount && (
            <p className="text-red-600 text-sm mt-1">{errors.amount.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            طريقة الدفع <span className="text-red-500">*</span>
          </label>
          <select
            {...register("paymentMethod")}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:ring-4 focus:ring-blue-200/70 focus:border-blue-300 bg-white"
          >
            {PAYMENT_METHODS.map((method) => (
              <option key={method.value} value={method.value}>
                {method.label}
              </option>
            ))}
          </select>
          {errors.paymentMethod && (
            <p className="text-red-600 text-sm mt-1">
              {errors.paymentMethod.message}
            </p>
          )}
        </div>
      </div>

      {/* Payment Date & Due Date */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            تاريخ الدفع <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            {...register("paymentDate")}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:ring-4 focus:ring-blue-200/70 focus:border-blue-300 bg-white"
          />
          {errors.paymentDate && (
            <p className="text-red-600 text-sm mt-1">
              {errors.paymentDate.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            تاريخ الاستحقاق <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            {...register("dueDate")}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:ring-4 focus:ring-blue-200/70 focus:border-blue-300 bg-white"
          />
          {errors.dueDate && (
            <p className="text-red-600 text-sm mt-1">
              {errors.dueDate.message}
            </p>
          )}
        </div>
      </div>

      {/* Status */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          حالة الدفع <span className="text-red-500">*</span>
        </label>
        <select
          {...register("status")}
          className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:ring-4 focus:ring-blue-200/70 focus:border-blue-300 bg-white"
        >
          {PAYMENT_STATUS.map((status) => (
            <option key={status.value} value={status.value}>
              {status.label}
            </option>
          ))}
        </select>
        {errors.status && (
          <p className="text-red-600 text-sm mt-1">{errors.status.message}</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-4">
        <button
          type="submit"
          disabled={mutation.isPending}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-linear-to-r from-blue-600 to-indigo-600 rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 transition-all shadow-lg hover:shadow-blue-500/40"
        >
          {mutation.isPending ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              جارٍ الحفظ...
            </>
          ) : (
            "حفظ"
          )}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
        >
          إلغاء
        </button>
      </div>
    </form>
  );
}
