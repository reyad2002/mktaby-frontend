"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Loader2,
  FileText,
  Hash,
  User,
  Users,
  Scale,
  Calendar,
  Lock,
  Unlock,
  StickyNote,
  UserMinus,
} from "lucide-react";
import toast from "react-hot-toast";

import { createCase, getCaseTypes, getCaseStatuses } from "../apis/casesApis";
import { fetchClients } from "@/features/clients/apis/clientsApi";
import { getCourtDropdownApi } from "@/features/courts/apis/courtsApis";
import { fetchUsers } from "@/features/users/apis/usersApi";
import {
  addCaseSchema,
  type AddCaseFormData,
} from "../validations/addCaseValidation";
import type { CaseTypeValues, CaseStatusValues } from "../types/casesTypes";
import type { ClientRoleValues } from "@/features/clients/types/clientTypes";

interface AddCaseFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const CLIENT_ROLES: { value: ClientRoleValues; label: string }[] = [
  { value: "Plaintiff", label: "مدعي" },
  { value: "Defendant", label: "مدعى عليه" },
  { value: "Witness", label: "شاهد" },
  { value: "Appellant", label: "مستأنف" },
  { value: "Appellee", label: "مستأنف ضده" },
  { value: "Respondent", label: "المستجيب" },
  { value: "Intervener", label: "متدخل" },
  { value: "Accused", label: "متهم" },
  { value: "Victim", label: "مجني عليه" },
  { value: "CivilClaimant", label: "مدعي بالحق المدني" },
  { value: "CivillyResponsible", label: "المسؤول مدنياً" },
  { value: "Opponent", label: "خصم" },
  { value: "Husband", label: "زوج" },
  { value: "Wife", label: "زوجة" },
  { value: "AlimonyClaimant", label: "طالب نفقة" },
  { value: "AlimonyDefendant", label: "مطلوب منه النفقة" },
  { value: "Guardian", label: "وصي" },
  { value: "Trustee", label: "قيم" },
  { value: "Minor", label: "قاصر" },
  { value: "Challenger", label: "طاعن" },
];

export default function AddCaseForm({ onSuccess, onCancel }: AddCaseFormProps) {
  const queryClient = useQueryClient();

  // Fetch case types
  const { data: caseTypes = [] } = useQuery({
    queryKey: ["caseTypes"],
    queryFn: getCaseTypes,
  });

  // Fetch case statuses
  const { data: caseStatuses = [] } = useQuery({
    queryKey: ["caseStatuses"],
    queryFn: getCaseStatuses,
  });

  // Fetch clients for dropdown
  const { data: clientsData } = useQuery({
    queryKey: ["clients", { pageSize: 100 }],
    queryFn: () => fetchClients({ pageSize: 100 }),
  });
  const clients = clientsData?.data?.data ?? [];

  // Fetch courts for dropdown
  const { data: courtsData } = useQuery({
    queryKey: ["courtsDropdown"],
    queryFn: () => getCourtDropdownApi({ PageSize: 100 }),
  });
  const courts = courtsData?.data ?? [];

  // Fetch users/lawyers for dropdown
  const { data: usersData } = useQuery({
    queryKey: ["users", { pageSize: 100 }],
    queryFn: () => fetchUsers({ pageSize: 100 }),
  });
  const lawyers = usersData?.data?.data ?? [];

  const {
    register,
    handleSubmit,
    reset,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<AddCaseFormData>({
    resolver: zodResolver(addCaseSchema),
    defaultValues: {
      caseNumber: "",
      name: "",
      caseType: "",
      caseStatus: "Active",
      clientRole: "Plaintiff",
      isPrivate: false,
      clientId: 0,
      opponent: "",
      courtId: 0,
      notes: "",
      openedAt: new Date().toISOString().split("T")[0],
      closedAt: "",
      caseLawyers: [],
    },
  });

  const selectedLawyers = watch("caseLawyers");

  const mutation = useMutation({
    mutationFn: createCase,
    onSuccess: (response) => {
      if (response?.succeeded) {
        toast.success(response.message || "تم إضافة القضية بنجاح");
        queryClient.invalidateQueries({ queryKey: ["cases"] });
        reset();
        onSuccess?.();
      } else {
        toast.error(response?.message || "تعذر إضافة القضية");
      }
    },
    onError: (error: unknown) => {
      const err = error as {
        response?: {
          data?: { message?: string; errors?: Record<string, string[]> };
        };
      };
      console.error("Add case error:", err?.response?.data);

      if (err?.response?.data?.errors) {
        const errorMessages = Object.values(err.response.data.errors).flat();
        errorMessages.forEach((msg) => toast.error(msg));
      } else {
        toast.error(
          err?.response?.data?.message || "حدث خطأ أثناء إضافة القضية"
        );
      }
    },
  });

  const onSubmit = (data: AddCaseFormData) => {
    const payload = {
      ...data,
      caseType: data.caseType as CaseTypeValues,
      caseStatus: data.caseStatus as CaseStatusValues,
      clientRole: data.clientRole as ClientRoleValues,
      openedAt: new Date(data.openedAt).toISOString(),
      closedAt: data.closedAt ? new Date(data.closedAt).toISOString() : null,
      notes: data.notes || null,
    };
    mutation.mutate(payload);
  };

  const toggleLawyer = (lawyerId: number) => {
    const current = selectedLawyers || [];
    if (current.includes(lawyerId)) {
      setValue(
        "caseLawyers",
        current.filter((id) => id !== lawyerId)
      );
    } else {
      setValue("caseLawyers", [...current, lawyerId]);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Case Number */}
        <div>
          <label
            htmlFor="caseNumber"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            رقم القضية
          </label>
          <div className="relative">
            <input
              type="text"
              id="caseNumber"
              {...register("caseNumber")}
              className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.caseNumber ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="رقم القضية"
            />
            <Hash className="absolute left-3 top-2.5 text-gray-400" size={20} />
          </div>
          {errors.caseNumber && (
            <p className="text-red-500 text-sm mt-1">
              {errors.caseNumber.message}
            </p>
          )}
        </div>

        {/* Case Name */}
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            اسم القضية
          </label>
          <div className="relative">
            <input
              type="text"
              id="name"
              {...register("name")}
              className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.name ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="اسم القضية"
            />
            <FileText
              className="absolute left-3 top-2.5 text-gray-400"
              size={20}
            />
          </div>
          {errors.name && (
            <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
          )}
        </div>

        {/* Case Type */}
        <div>
          <label
            htmlFor="caseType"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            نوع القضية
          </label>
          <div className="relative">
            <select
              id="caseType"
              {...register("caseType")}
              className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.caseType ? "border-red-500" : "border-gray-300"
              }`}
            >
              <option value="">اختر نوع القضية</option>
              {caseTypes.map((type) => (
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
          {errors.caseType && (
            <p className="text-red-500 text-sm mt-1">
              {errors.caseType.message}
            </p>
          )}
        </div>

        {/* Case Status */}
        <div>
          <label
            htmlFor="caseStatus"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            حالة القضية
          </label>
          <div className="relative">
            <select
              id="caseStatus"
              {...register("caseStatus")}
              className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.caseStatus ? "border-red-500" : "border-gray-300"
              }`}
            >
              <option value="">اختر حالة القضية</option>
              {caseStatuses.map((status) => (
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
          {errors.caseStatus && (
            <p className="text-red-500 text-sm mt-1">
              {errors.caseStatus.message}
            </p>
          )}
        </div>

        {/* Client */}
        <div>
          <label
            htmlFor="clientId"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            العميل
          </label>
          <div className="relative">
            <select
              id="clientId"
              {...register("clientId", { valueAsNumber: true })}
              className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.clientId ? "border-red-500" : "border-gray-300"
              }`}
            >
              <option value={0}>اختر العميل</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
            <User className="absolute left-3 top-2.5 text-gray-400" size={20} />
          </div>
          {errors.clientId && (
            <p className="text-red-500 text-sm mt-1">
              {errors.clientId.message}
            </p>
          )}
        </div>

        {/* Client Role */}
        <div>
          <label
            htmlFor="clientRole"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            صفة العميل
          </label>
          <div className="relative">
            <select
              id="clientRole"
              {...register("clientRole")}
              className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.clientRole ? "border-red-500" : "border-gray-300"
              }`}
            >
              {CLIENT_ROLES.map((role) => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </select>
            <User className="absolute left-3 top-2.5 text-gray-400" size={20} />
          </div>
          {errors.clientRole && (
            <p className="text-red-500 text-sm mt-1">
              {errors.clientRole.message}
            </p>
          )}
        </div>

        {/* Opponent */}
        <div>
          <label
            htmlFor="opponent"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            الخصم
          </label>
          <div className="relative">
            <input
              type="text"
              id="opponent"
              {...register("opponent")}
              className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.opponent ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="اسم الخصم"
            />
            <UserMinus
              className="absolute left-3 top-2.5 text-gray-400"
              size={20}
            />
          </div>
          {errors.opponent && (
            <p className="text-red-500 text-sm mt-1">
              {errors.opponent.message}
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

        {/* Opened At */}
        <div>
          <label
            htmlFor="openedAt"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            تاريخ الفتح
          </label>
          <div className="relative">
            <input
              type="date"
              id="openedAt"
              {...register("openedAt")}
              className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.openedAt ? "border-red-500" : "border-gray-300"
              }`}
            />
            <Calendar
              className="absolute left-3 top-2.5 text-gray-400"
              size={20}
            />
          </div>
          {errors.openedAt && (
            <p className="text-red-500 text-sm mt-1">
              {errors.openedAt.message}
            </p>
          )}
        </div>

        {/* Closed At */}
        <div>
          <label
            htmlFor="closedAt"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            تاريخ الإغلاق (اختياري)
          </label>
          <div className="relative">
            <input
              type="date"
              id="closedAt"
              {...register("closedAt")}
              className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.closedAt ? "border-red-500" : "border-gray-300"
              }`}
            />
            <Calendar
              className="absolute left-3 top-2.5 text-gray-400"
              size={20}
            />
          </div>
          {errors.closedAt && (
            <p className="text-red-500 text-sm mt-1">
              {errors.closedAt.message}
            </p>
          )}
        </div>
      </div>

      {/* Is Private */}
      <div className="flex items-center gap-3">
        <Controller
          name="isPrivate"
          control={control}
          render={({ field }) => (
            <button
              type="button"
              onClick={() => field.onChange(!field.value)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
                field.value
                  ? "bg-amber-100 border-amber-400 text-amber-700"
                  : "bg-gray-100 border-gray-300 text-gray-600"
              }`}
            >
              {field.value ? <Lock size={18} /> : <Unlock size={18} />}
              {field.value ? "قضية خاصة" : "قضية عامة"}
            </button>
          )}
        />
      </div>

      {/* Case Lawyers */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Users className="inline-block ml-1" size={18} />
          المحامون المكلفون
        </label>
        <div className="border border-gray-300 rounded-lg p-3 max-h-40 overflow-y-auto">
          {lawyers.length === 0 ? (
            <p className="text-gray-500 text-sm">لا يوجد محامون</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {lawyers.map((lawyer) => {
                const isSelected = selectedLawyers?.includes(lawyer.id);
                return (
                  <button
                    key={lawyer.id}
                    type="button"
                    onClick={() => toggleLawyer(lawyer.id)}
                    className={`px-3 py-1.5 rounded-full text-sm transition-all border ${
                      isSelected
                        ? "bg-blue-500 text-white border-blue-500"
                        : "bg-gray-100 text-gray-700 border-gray-300 hover:border-blue-400"
                    }`}
                  >
                    {lawyer.name}
                  </button>
                );
              })}
            </div>
          )}
        </div>
        {errors.caseLawyers && (
          <p className="text-red-500 text-sm mt-1">
            {errors.caseLawyers.message}
          </p>
        )}
      </div>

      {/* Notes */}
      <div>
        <label
          htmlFor="notes"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          ملاحظات (اختياري)
        </label>
        <div className="relative">
          <textarea
            id="notes"
            {...register("notes")}
            rows={3}
            className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.notes ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="ملاحظات إضافية..."
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

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={mutation.isPending}
          className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          إلغاء
        </button>
        <button
          type="submit"
          disabled={mutation.isPending}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {mutation.isPending && <Loader2 className="animate-spin" size={18} />}
          إضافة القضية
        </button>
      </div>
    </form>
  );
}
