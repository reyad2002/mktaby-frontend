"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Shield } from "lucide-react";

import { useAddPermission } from "../hooks/permissionsHooks";
import {
  addPermissionSchema,
  type AddPermissionFormData,
} from "../validations/addPermissionValidation";
import BitwisePermissionField from "./BitwisePermissionField";
import DmlPermissionField from "./DmlPermissionField";
import { VIEW_LEVEL_OPTIONS } from "../constants/permissionFlags";

interface AddPermissionFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

// Bitwise fields: 1=create, 2=update, 4=delete, 8=view
const BITWISE_FIELDS = [
  { name: "documentPermissions" as const, label: "صلاحيات المستندات" },
  { name: "clientPermissions" as const, label: "صلاحيات العملاء" },
  { name: "sessionPermission" as const, label: "صلاحيات الجلسات" },
  // { name: "financePermission" as const, label: "صلاحيات المالية" },
] as const;

// View: 0=no access, 1=metadata, 2=assigned, 3=all
const VIEW_FIELDS = [
  { name: "viewCasePermissions" as const, label: "عرض القضايا" },
  { name: "viewTaskPermissions" as const, label: "عرض المهام" },
] as const;

// DML: create, update, delete (bitwise)
const DML_FIELDS = [
  { name: "dmlCasePermissions" as const, label: "إدارة القضايا" },
  { name: "dmlTaskPermissions" as const, label: "إدارة المهام" },
] as const;

export default function AddPermissionForm({
  onSuccess,
  onCancel,
}: AddPermissionFormProps) {
  // Use the hook for adding permission
  const mutation = useAddPermission();

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AddPermissionFormData>({
    resolver: zodResolver(addPermissionSchema),
    defaultValues: {
      name: "",
      documentPermissions: 0,
      clientPermissions: 0,
      sessionPermission: 0,
      financePermission: 0,
      viewCasePermissions: 0,
      dmlCasePermissions: 0,
      viewTaskPermissions: 0,
      dmlTaskPermissions: 0,
    },
  });

  const onSubmit = (data: AddPermissionFormData) => {
    mutation.mutate(data, {
      onSuccess: (response) => {
        if (response?.succeeded) {
          reset();
          onSuccess?.();
        }
      },
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Permission Name */}
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          اسم الصلاحية
        </label>
        <div className="relative">
          <input
            type="text"
            id="name"
            {...register("name")}
            className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
              errors.name ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="اسم الصلاحية"
          />
          <Shield className="absolute left-3 top-2.5 text-gray-400" size={20} />
        </div>
        {errors.name && (
          <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
        )}
      </div>

      {/* Bitwise Permissions (Document, Client, Session, Finance) */}
      <div className="space-y-4">
        <p className="text-xs text-gray-500">
          عرض=1، إنشاء=2، تحديث=4، حذف=8 — يمكن الجمع بينها
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {BITWISE_FIELDS.map((field) => (
            <div
              key={field.name}
              className="rounded-xl border border-gray-200 bg-gray-50/50 p-4"
            >
              <BitwisePermissionField
                name={field.name}
                control={control}
                label={field.label}
                error={errors[field.name]?.message}
              />
            </div>
          ))}
        </div>
      </div>

      {/* View Permissions (Cases, Tasks): 0=no access, 1=metadata, 2=assigned, 3=all */}
      <div className="space-y-4">
        <p className="text-xs text-gray-500">
          عرض: 0=بدون وصول، 1=البيانات الوصفية، 2=المعين له، 3=الكل
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {VIEW_FIELDS.map((field) => (
            <div key={field.name}>
              <label
                htmlFor={field.name}
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                {field.label}
              </label>
              <select
                id={field.name}
                {...register(field.name, { valueAsNumber: true })}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  errors[field.name] ? "border-red-500" : "border-gray-300"
                }`}
              >
                {VIEW_LEVEL_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              {errors[field.name] && (
                <p className="text-red-500 text-sm mt-1">
                  {errors[field.name]?.message}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* DML Permissions (Cases, Tasks): create, update, delete */}
      <div className="space-y-4">
        <p className="text-xs text-gray-500">
          إدارة: إنشاء، تحديث، حذف — يمكن الجمع بينها
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {DML_FIELDS.map((field) => (
            <div
              key={field.name}
              className="rounded-xl border border-gray-200 bg-gray-50/50 p-4"
            >
              <DmlPermissionField
                name={field.name}
                control={control}
                label={field.label}
                error={errors[field.name]?.message}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={mutation.isPending}
          className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {mutation.isPending ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              جاري الإضافة...
            </>
          ) : (
            "إضافة الصلاحية"
          )}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            إلغاء
          </button>
        )}
      </div>
    </form>
  );
}
