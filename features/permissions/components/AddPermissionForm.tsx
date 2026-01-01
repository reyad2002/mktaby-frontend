"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Shield } from "lucide-react";
import toast from "react-hot-toast";

import { addPermission } from "../apis/permissionsApi";
import {
  addPermissionSchema,
  type AddPermissionFormData,
} from "../validations/addPermissionValidation";

interface AddPermissionFormProps {
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

export default function AddPermissionForm({
  onSuccess,
  onCancel,
}: AddPermissionFormProps) {
  const queryClient = useQueryClient();

  const {
    register,
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

  const mutation = useMutation({
    mutationFn: addPermission,
    onSuccess: (response) => {
      if (response?.succeeded) {
        toast.success(response.message || "تم إضافة الصلاحية بنجاح");
        queryClient.invalidateQueries({ queryKey: ["permissions"] });
        reset();
        onSuccess?.();
      } else {
        toast.error(response?.message || "تعذر إضافة الصلاحية");
      }
    },
    onError: (error: unknown) => {
      const err = error as {
        response?: {
          data?: { message?: string; errors?: Record<string, string[]> };
        };
      };
      console.error("Add permission error:", err?.response?.data);

      if (err?.response?.data?.errors) {
        const errorMessages = Object.values(err.response.data.errors).flat();
        errorMessages.forEach((msg) => toast.error(msg));
      } else {
        toast.error(
          err?.response?.data?.message || "حدث خطأ أثناء إضافة الصلاحية"
        );
      }
    },
  });

  const onSubmit = (data: AddPermissionFormData) => {
    mutation.mutate(data);
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
