"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
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
  ChevronDown,
  Check,
} from "lucide-react";

import {
  useCaseTypes,
  useCaseStatuses,
  useCreateCase,
} from "../hooks/caseHooks";
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

/* ---------------- UI Helpers (Modern Inputs) ---------------- */

const ui = {
  card: "rounded-2xl border border-slate-300 bg-white shadow-sm",
  cardHeader:
    "px-5 py-4 border-b border-slate-300 flex items-center justify-between",
  cardBody: "p-5",
  label: "block text-xs font-semibold text-primary mb-1.5",
  hint: "text-xs text-primary",
  error: "mt-1 text-xs text-red-600",
  fieldWrap: "space-y-1",
  inputBase:
    "w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-primary outline-none transition placeholder:text-primary-400",
  inputNormal:
    "border-slate-300 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10",
  inputError:
    "border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/10",
  icon: "pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-primary",
  inputWithIcon: "pr-10",
  selectArrow:
    "pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-primary",
  btnPrimary:
    "inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark transition disabled:opacity-50",
  btnGhost:
    "inline-flex items-center gap-2 rounded-xl border border-primary bg-white px-4 py-2.5 text-sm font-semibold text-primary hover:bg-primary-50 transition disabled:opacity-50",
  chip: "inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-sm transition",
};

function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={ui.fieldWrap}>
      <div className="flex items-end justify-between gap-2">
        <label className={ui.label}>{label}</label>
        {hint ? <span className={ui.hint}>{hint}</span> : null}
      </div>
      {children}
      {error ? <p className={ui.error}>{error}</p> : null}
    </div>
  );
}

function Input({
  icon: Icon,
  error,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  icon: React.ElementType;
  error?: boolean;
}) {
  return (
    <div className="relative">
      <input
        {...props}
        className={[
          ui.inputBase,
          ui.inputWithIcon,
          error ? ui.inputError : ui.inputNormal,
          props.className ?? "",
        ].join(" ")}
      />
      <Icon className={ui.icon} size={18} />
    </div>
  );
}

function Select({
  icon: Icon,
  error,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & {
  icon: React.ElementType;
  error?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="relative">
      <select
        {...props}
        className={[
          ui.inputBase,
          ui.inputWithIcon,
          "appearance-none",
          error ? ui.inputError : ui.inputNormal,
          props.className ?? "",
        ].join(" ")}
      >
        {children}
      </select>
      <Icon className={ui.icon} size={18} />
      <ChevronDown className={ui.selectArrow} size={18} />
    </div>
  );
}

function TextArea({
  icon: Icon,
  error,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  icon: React.ElementType;
  error?: boolean;
}) {
  return (
    <div className="relative">
      <textarea
        {...props}
        className={[
          ui.inputBase,
          ui.inputWithIcon,
          "min-h-[96px] resize-y",
          error ? ui.inputError : ui.inputNormal,
          props.className ?? "",
        ].join(" ")}
      />
      <Icon
        className="pointer-events-none absolute right-3 top-4 text-primary"
        size={18}
      />
    </div>
  );
}

/* ---------------- Component ---------------- */

export default function AddCaseForm({ onSuccess, onCancel }: AddCaseFormProps) {
  const { data: caseTypes = [] } = useCaseTypes();
  const { data: caseStatuses = [] } = useCaseStatuses();

  const { data: clientsData } = useQuery({
    queryKey: ["clients", { pageSize: 100 }],
    queryFn: () => fetchClients({ pageSize: 100 }),
  });
  const clients = clientsData?.data?.data ?? [];

  const { data: courtsData } = useQuery({
    queryKey: ["courtsDropdown"],
    queryFn: () => getCourtDropdownApi({ PageSize: 100 }),
  });
  const courts = courtsData?.data ?? [];

  const { data: usersData } = useQuery({
    queryKey: ["users", { pageSize: 100 }],
    queryFn: () => fetchUsers({ pageSize: 100 }),
  });
  const lawyers = usersData?.data?.data ?? [];

  const createMutation = useCreateCase();

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

  const onSubmit = (data: AddCaseFormData) => {
    // Build payload, excluding closedAt if empty
    const payload: Record<string, unknown> = {
      caseNumber: data.caseNumber,
      name: data.name,
      caseType: data.caseType as CaseTypeValues,
      caseStatus: data.caseStatus as CaseStatusValues,
      clientRole: data.clientRole as ClientRoleValues,
      isPrivate: data.isPrivate,
      clientId: data.clientId,
      opponent: data.opponent,
      courtId: data.courtId,
      openedAt: new Date(data.openedAt).toISOString(),
      caseLawyers: data.caseLawyers,
    };

    // Only add optional fields if they have values
    if (data.notes && data.notes.trim()) {
      payload.notes = data.notes;
    }
    if (data.closedAt) {
      payload.closedAt = new Date(data.closedAt).toISOString();
    }

    console.log("Submitting payload:", payload);

    createMutation.mutate(
      payload as Parameters<typeof createMutation.mutate>[0],
      {
        onSuccess: (response) => {
          if (response?.succeeded) {
            reset();
            onSuccess?.();
          }
        },
      }
    );
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
      {/* Card Wrapper */}
      <div className={ui.card}>
        <div className={ui.cardHeader}>
          <div className="flex items-center gap-2">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white">
              <FileText size={18} />
            </span>
            <div>
              <p className="text-sm font-bold text-primary">إضافة قضية</p>
              <p className="text-xs text-primary">
                أدخل بيانات القضية الأساسية
              </p>
            </div>
          </div>
        </div>

        <div className={ui.cardBody}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="رقم القضية" error={errors.caseNumber?.message}>
              <Input
                icon={Hash}
                type="text"
                placeholder="مثال: 2026/15"
                {...register("caseNumber")}
                error={!!errors.caseNumber}
              />
            </Field>

            <Field label="اسم القضية" error={errors.name?.message}>
              <Input
                icon={FileText}
                type="text"
                placeholder="اكتب اسم القضية"
                {...register("name")}
                error={!!errors.name}
              />
            </Field>

            <Field label="نوع القضية" error={errors.caseType?.message}>
              <Select
                icon={Scale}
                {...register("caseType")}
                error={!!errors.caseType}
              >
                <option value="">اختر نوع القضية</option>
                {caseTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label="حالة القضية" error={errors.caseStatus?.message}>
              <Select
                icon={Scale}
                {...register("caseStatus")}
                error={!!errors.caseStatus}
              >
                <option value="">اختر حالة القضية</option>
                {caseStatuses.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label="العميل" error={errors.clientId?.message}>
              <Select
                icon={User}
                {...register("clientId", { valueAsNumber: true })}
                error={!!errors.clientId}
              >
                <option value={0}>اختر العميل</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label="صفة العميل" error={errors.clientRole?.message}>
              <Select
                icon={User}
                {...register("clientRole")}
                error={!!errors.clientRole}
              >
                {CLIENT_ROLES.map((role) => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label="الخصم" error={errors.opponent?.message}>
              <Input
                icon={UserMinus}
                type="text"
                placeholder="اسم الخصم"
                {...register("opponent")}
                error={!!errors.opponent}
              />
            </Field>

            <Field label="المحكمة" error={errors.courtId?.message}>
              <Select
                icon={Scale}
                {...register("courtId", { valueAsNumber: true })}
                error={!!errors.courtId}
              >
                <option value={0}>اختر المحكمة</option>
                {courts.map((court) => (
                  <option key={court.id} value={court.id}>
                    {court.name}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label="تاريخ الفتح" error={errors.openedAt?.message}>
              <Input
                icon={Calendar}
                type="date"
                {...register("openedAt")}
                error={!!errors.openedAt}
              />
            </Field>

            <Field
              label="تاريخ الإغلاق"
              hint="اختياري"
              error={errors.closedAt?.message}
            >
              <Input
                icon={Calendar}
                type="date"
                {...register("closedAt")}
                error={!!errors.closedAt}
              />
            </Field>
          </div>

          {/* Privacy - Segmented */}
          <div className="mt-5">
            <label className={ui.label}>الخصوصية</label>
            <Controller
              name="isPrivate"
              control={control}
              render={({ field }) => (
                <div className="inline-flex rounded-xl border border-primary bg-primary p-1">
                  <button
                    type="button"
                    onClick={() => field.onChange(false)}
                    className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition ${
                      !field.value
                        ? "bg-white text-primary shadow-sm"
                        : "text-white "
                    }`}
                  >
                    <Unlock size={16} />
                    قضية عامة
                  </button>
                  <button
                    type="button"
                    onClick={() => field.onChange(true)}
                    className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition ${
                      field.value
                        ? "bg-amber-50 text-amber-800 shadow-sm"
                        : "text-white "
                    }`}
                  >
                    <Lock size={16} />
                    قضية خاصة
                  </button>
                </div>
              )}
            />
          </div>

          {/* Lawyers - Chips */}
          <div className="mt-5">
            <div className="flex items-center justify-between gap-2">
              <label className={ui.label}>
                <Users className="inline-block ml-1" size={16} />
                المحامون المكلفون
              </label>
              <span className="text-xs text-primary">
                المختار: {selectedLawyers?.length ?? 0}
              </span>
            </div>

            <div className="rounded-2xl border border-slate-300 bg-white p-3">
              {lawyers.length === 0 ? (
                <p className="text-primary text-sm">لا يوجد محامون</p>
              ) : (
                <div className="flex flex-wrap gap-2 max-h-44 overflow-y-auto">
                  {lawyers.map((lawyer) => {
                    const isSelected = selectedLawyers?.includes(lawyer.id);
                    return (
                      <button
                        key={lawyer.id}
                        type="button"
                        onClick={() => toggleLawyer(lawyer.id)}
                        className={[
                          ui.chip,
                          isSelected
                            ? "border-primary bg-primary text-white hover:bg-primary"
                            : "border-teal-600 bg-teal-50 text-primary",
                        ].join(" ")}
                      >
                        {isSelected ? <Check size={16} /> : null}
                        {lawyer.name}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {errors.caseLawyers?.message ? (
              <p className={ui.error}>{errors.caseLawyers.message}</p>
            ) : null}
          </div>

          {/* Notes */}
          <div className="mt-5">
            <Field label="ملاحظات" hint="اختياري" error={errors.notes?.message}>
              <TextArea
                icon={StickyNote}
                placeholder="ملاحظات إضافية..."
                rows={4}
                {...register("notes")}
                error={!!errors.notes}
              />
            </Field>
          </div>

          {/* Actions */}
          <div className="mt-6 flex justify-end gap-2">
            <button
              type="button"
              onClick={onCancel}
              disabled={createMutation.isPending}
              className={ui.btnGhost}
            >
              إلغاء
            </button>

            <button
              type="submit"
              disabled={createMutation.isPending}
              className={ui.btnPrimary}
            >
              {createMutation.isPending ? (
                <Loader2 className="animate-spin" size={18} />
              ) : null}
              إضافة القضية
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
