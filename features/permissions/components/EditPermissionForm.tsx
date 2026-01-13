"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Shield } from "lucide-react";
import { useEffect } from "react";

import {
  usePermissionById,
  useUpdatePermission,
} from "../hooks/permissionsHooks";
import {
  updatePermissionSchema,
  type UpdatePermissionFormData,
} from "../validations/updatePermissionValidation";

interface EditPermissionFormProps {
  permissionId: number;
  onSuccess?: () => void;
  onCancel?: () => void;
}

// Permission field configuration for the form
const PERMISSION_FIELDS = [
  { name: "documentPermissions", label: "صلاحيات المستندات" },
  { name: "clientPermissions", label: "صلاحيات العملاء" },
  { name: "sessionPermission", label: "صلاحيات الجلسات" },
  { name: "financePermission", label: "صلاحيات المالية" },
  { name: "viewCasePermissions", label: "عرض القضايا" },
  { name: "dmlCasePermissions", label: "إدارة القضايا" },
  { name: "viewTaskPermissions", label: "عرض المهام" },
  { name: "dmlTaskPermissions", label: "إدارة المهام" },
] as const;

export default function EditPermissionForm({
  permissionId,
  onSuccess,
  onCancel,
}: EditPermissionFormProps) {
  // Fetch permission data using hook
  const { data: permission, isLoading } = usePermissionById(permissionId);

  // Update permission using hook
  const mutation = useUpdatePermission();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdatePermissionFormData>({
    resolver: zodResolver(updatePermissionSchema),
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

  // Update form when permission data is loaded
  useEffect(() => {
    if (permission) {
      reset({
        name: permission.name,
        documentPermissions: permission.documentPermissions,
        clientPermissions: permission.clientPermissions,
        sessionPermission: permission.sessionPermission,
        financePermission: permission.financePermission,
        viewCasePermissions: permission.viewCasePermissions,
        dmlCasePermissions: permission.dmlCasePermissions,
        viewTaskPermissions: permission.viewTaskPermissions,
        dmlTaskPermissions: permission.dmlTaskPermissions,
      });
    }
  }, [permission, reset]);

  const onSubmit = (data: UpdatePermissionFormData) => {
    mutation.mutate(
      { id: permissionId, data },
      {
        onSuccess: (response) => {
          if (response?.succeeded) {
            onSuccess?.();
          }
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="animate-spin text-purple-600" size={32} />
      </div>
    );
  }

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

      {/* Permission Levels Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {PERMISSION_FIELDS.map((field) => (
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
              <option value={0}>لا يوجد</option>
              <option value={1}>قراءة فقط</option>
              <option value={2}>قراءة وكتابة</option>
              <option value={3}>كامل الصلاحيات</option>
            </select>
            {errors[field.name] && (
              <p className="text-red-500 text-sm mt-1">
                {errors[field.name]?.message}
              </p>
            )}
          </div>
        ))}
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
              جاري التحديث...
            </>
          ) : (
            "تحديث الصلاحية"
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
