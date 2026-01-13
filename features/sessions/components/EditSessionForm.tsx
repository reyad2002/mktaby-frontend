"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Loader2,
  Calendar,
  Scale,
  Briefcase,
  FileText,
  StickyNote,
} from "lucide-react";
import { useEffect } from "react";

import {
  useSessionById,
  useSessionTypes,
  useSessionStatuses,
  useUpdateSession,
} from "../hooks/sessionsHooks";
import { useCaseDropdown } from "@/features/cases/hooks/caseHooks";
import { useCourtDropdown } from "@/features/courts/hooks/courtsHooks";
import {
  updateSessionSchema,
  type UpdateSessionFormData,
} from "../validations/updateSessionValidation";
import type {
  SessionTypeValue,
  SessionStatusValue,
} from "../types/sessionsTypes";

interface EditSessionFormProps {
  sessionId: number;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function EditSessionForm({
  sessionId,
  onSuccess,
  onCancel,
}: EditSessionFormProps) {
  // Fetch session data using hook
  const { data: sessionData, isLoading: isLoadingSession } =
    useSessionById(sessionId);

  // Fetch session types using hook
  const { data: sessionTypes = [] } = useSessionTypes();

  // Fetch session statuses using hook
  const { data: sessionStatuses = [] } = useSessionStatuses();

  // Update session mutation using hook
  const mutation = useUpdateSession();

  // Fetch cases for dropdown using hook
  const { data: casesData } = useCaseDropdown({ PageSize: 100 });
  const cases = Array.isArray(casesData?.data) ? casesData.data : [];

  // Fetch courts for dropdown using hook
  const { data: courtsData } = useCourtDropdown({ PageSize: 100 });
  const courts = courtsData?.data ?? [];

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdateSessionFormData>({
    resolver: zodResolver(updateSessionSchema),
    defaultValues: {
      sessionDate: "",
      sessionType: "",
      sessionStatus: "",
      caseId: 0,
      courtId: 0,
      notes: "",
      result: "",
    },
  });
  // Update form when session data is loaded
  useEffect(() => {
    if (sessionData) {
      const data = sessionData;
      reset({
        sessionDate: data.sessionDate ? data.sessionDate.slice(0, 16) : "",
        sessionType: data.sessionType.value,
        sessionStatus: data.sessionStatus.value,
        caseId: data.caseId,
        courtId: data.courtId,
        notes: data.notes || "",
        result: data.result || "",
      });
    }
  }, [sessionData, reset]);

  const onSubmit = (data: UpdateSessionFormData) => {
    const payload = {
      sessionDate: new Date(data.sessionDate).toISOString(),
      sessionType: data.sessionType as SessionTypeValue,
      sessionStatus: data.sessionStatus as SessionStatusValue,
      caseId: data.caseId,
      courtId: data.courtId,
      notes: data.notes || "",
      result: data.result || "",
    };
    mutation.mutate(
      { id: sessionId, data: payload },
      {
        onSuccess: () => {
          onSuccess?.();
        },
      }
    );
  };

  if (isLoadingSession) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="animate-spin text-blue-600" size={32} />
        <span className="mr-2 text-gray-600">جاري تحميل بيانات الجلسة...</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
              className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
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
              className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
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
              className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
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

        {/* Case */}
        <div>
          <label
            htmlFor="caseId"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            القضية
          </label>
          <div className="relative">
            <select
              id="caseId"
              {...register("caseId", { valueAsNumber: true })}
              className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.caseId ? "border-red-500" : "border-gray-300"
              }`}
            >
              <option value={0}>اختر القضية</option>
              {cases.map((caseItem) => (
                <option key={caseItem.id} value={caseItem.id}>
                  {caseItem.name} - {caseItem.caseNumber}
                </option>
              ))}
            </select>
            <Briefcase
              className="absolute left-3 top-2.5 text-gray-400"
              size={20}
            />
          </div>
          {errors.caseId && (
            <p className="text-red-500 text-sm mt-1">{errors.caseId.message}</p>
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
              className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
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
              className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
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
              className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
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
          className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {mutation.isPending ? (
            <>
              <Loader2 className="animate-spin" size={18} />
              جاري التحديث...
            </>
          ) : (
            "تحديث الجلسة"
          )}
        </button>
      </div>
    </form>
  );
}
