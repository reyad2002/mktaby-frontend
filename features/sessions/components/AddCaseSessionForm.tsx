"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Loader2,
  Calendar,
  Scale,
  Briefcase,
  FileText,
  StickyNote,
} from "lucide-react";
import toast from "react-hot-toast";

import {
  createSession,
  fetchSessionTypes,
  fetchSessionStatuses,
} from "../apis/sessionsApis";
import { getCourtDropdownApi } from "@/features/courts/apis/courtsApis";
import {
  addSessionSchema,
  type AddSessionFormData,
} from "../validations/addSessionValidation";
import type {
  SessionTypeValue,
  SessionStatusValue,
} from "../types/sessionsTypes";

interface AddCaseSessionFormProps {
  caseId: number;
  caseName?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function AddCaseSessionForm({
  caseId,
  caseName,
  onSuccess,
  onCancel,
}: AddCaseSessionFormProps) {
  const queryClient = useQueryClient();

  const { data: sessionTypes = [] } = useQuery({
    queryKey: ["sessionTypes"],
    queryFn: fetchSessionTypes,
  });

  const { data: sessionStatuses = [] } = useQuery({
    queryKey: ["sessionStatuses"],
    queryFn: fetchSessionStatuses,
  });

  const { data: courtsData } = useQuery({
    queryKey: ["courtsDropdown"],
    queryFn: () => getCourtDropdownApi({ PageSize: 100 }),
  });
  const courts = courtsData?.data ?? [];

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AddSessionFormData>({
    resolver: zodResolver(addSessionSchema),
    defaultValues: {
      sessionDate: new Date().toISOString().slice(0, 16),
      sessionType: "",
      sessionStatus: "Scheduled",
      caseId: caseId,
      courtId: 0,
      notes: "",
      result: "",
    },
  });

  const mutation = useMutation({
    mutationFn: createSession,
    onSuccess: () => {
      toast.success("تم إضافة الجلسة بنجاح");
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
      queryClient.invalidateQueries({ queryKey: ["caseSessions", caseId] });
      reset();
      onSuccess?.();
    },
    onError: (error: unknown) => {
      const err = error as {
        response?: {
          data?: { message?: string; errors?: Record<string, string[]> };
        };
      };
      if (err?.response?.data?.errors) {
        const errorMessages = Object.values(err.response.data.errors).flat();
        errorMessages.forEach((msg) => toast.error(msg));
      } else {
        toast.error(
          err?.response?.data?.message || "حدث خطأ أثناء إضافة الجلسة"
        );
      }
    },
  });

  const onSubmit = (data: AddSessionFormData) => {
    const payload = {
      sessionDate: new Date(data.sessionDate).toISOString(),
      sessionType: data.sessionType as SessionTypeValue,
      sessionStatus: data.sessionStatus as SessionStatusValue,
      caseId: caseId,
      courtId: data.courtId,
      notes: data.notes || "",
      result: data.result || "",
    };
    mutation.mutate(payload);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Fixed Case Display */}
      <div className="rounded-xl border border-teal-200 bg-teal-50 p-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-teal-100 border border-teal-200 flex items-center justify-center">
            <Briefcase size={18} className="text-teal-700" />
          </div>
          <div>
            <p className="text-xs font-semibold text-teal-600">القضية</p>
            <p className="text-sm font-bold text-teal-900">
              {caseName || `قضية رقم ${caseId}`}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Session Date */}
        <div>
          <label
            htmlFor="sessionDate"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            تاريخ الجلسة
          </label>
          <div className="relative">
            <input
              type="datetime-local"
              id="sessionDate"
              {...register("sessionDate")}
              className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                errors.sessionDate ? "border-red-500" : "border-gray-300"
              }`}
            />
            <Calendar
              className="absolute left-3 top-2.5 text-gray-400"
              size={20}
            />
          </div>
          {errors.sessionDate && (
            <p className="text-red-500 text-sm mt-1">
              {errors.sessionDate.message}
            </p>
          )}
        </div>

        {/* Session Type */}
        <div>
          <label
            htmlFor="sessionType"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            نوع الجلسة
          </label>
          <div className="relative">
            <select
              id="sessionType"
              {...register("sessionType")}
              className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                errors.sessionType ? "border-red-500" : "border-gray-300"
              }`}
            >
              <option value="">اختر نوع الجلسة</option>
              {sessionTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            <Scale
              className="absolute left-3 top-2.5 text-gray-400"
              size={20}
            />
          </div>
          {errors.sessionType && (
            <p className="text-red-500 text-sm mt-1">
              {errors.sessionType.message}
            </p>
          )}
        </div>

        {/* Session Status */}
        <div>
          <label
            htmlFor="sessionStatus"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            حالة الجلسة
          </label>
          <div className="relative">
            <select
              id="sessionStatus"
              {...register("sessionStatus")}
              className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                errors.sessionStatus ? "border-red-500" : "border-gray-300"
              }`}
            >
              <option value="">اختر حالة الجلسة</option>
              {sessionStatuses.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
            <Scale
              className="absolute left-3 top-2.5 text-gray-400"
              size={20}
            />
          </div>
          {errors.sessionStatus && (
            <p className="text-red-500 text-sm mt-1">
              {errors.sessionStatus.message}
            </p>
          )}
        </div>

        {/* Court */}
        <div>
          <label
            htmlFor="courtId"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            المحكمة
          </label>
          <div className="relative">
            <select
              id="courtId"
              {...register("courtId", { valueAsNumber: true })}
              className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                errors.courtId ? "border-red-500" : "border-gray-300"
              }`}
            >
              <option value={0}>اختر المحكمة</option>
              {courts.map((court) => (
                <option key={court.id} value={court.id}>
                  {court.name}
                </option>
              ))}
            </select>
            <Scale
              className="absolute left-3 top-2.5 text-gray-400"
              size={20}
            />
          </div>
          {errors.courtId && (
            <p className="text-red-500 text-sm mt-1">
              {errors.courtId.message}
            </p>
          )}
        </div>

        {/* Notes */}
        <div className="md:col-span-2">
          <label
            htmlFor="notes"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            ملاحظات
          </label>
          <div className="relative">
            <textarea
              id="notes"
              {...register("notes")}
              rows={3}
              className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                errors.notes ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="ملاحظات الجلسة"
            />
            <StickyNote
              className="absolute left-3 top-2.5 text-gray-400"
              size={20}
            />
          </div>
          {errors.notes && (
            <p className="text-red-500 text-sm mt-1">{errors.notes.message}</p>
          )}
        </div>

        {/* Result */}
        <div className="md:col-span-2">
          <label
            htmlFor="result"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            النتيجة
          </label>
          <div className="relative">
            <textarea
              id="result"
              {...register("result")}
              rows={3}
              className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                errors.result ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="نتيجة الجلسة"
            />
            <FileText
              className="absolute left-3 top-2.5 text-gray-400"
              size={20}
            />
          </div>
          {errors.result && (
            <p className="text-red-500 text-sm mt-1">{errors.result.message}</p>
          )}
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
        >
          إلغاء
        </button>
        <button
          type="submit"
          disabled={mutation.isPending}
          className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {mutation.isPending ? (
            <>
              <Loader2 className="animate-spin" size={18} />
              جاري الإضافة...
            </>
          ) : (
            "إضافة الجلسة"
          )}
        </button>
      </div>
    </form>
  );
}
