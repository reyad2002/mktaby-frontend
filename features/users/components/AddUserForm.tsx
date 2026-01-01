"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Eye, EyeOff, Loader2, Mail, Lock, User, Phone } from "lucide-react";
import toast from "react-hot-toast";

import { addUser } from "../apis/usersApi";
import { fetchPermissions } from "@/features/permissions/apis/permissionsApi";
import {
  addUserSchema,
  type AddUserFormData,
} from "../validations/addUserValidation";

interface AddUserFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function AddUserForm({ onSuccess, onCancel }: AddUserFormProps) {
  const queryClient = useQueryClient();
  const [showPassword, setShowPassword] = useState(false);

  // Fetch permissions for dropdown
  const { data: permissionsData, isLoading: permissionsLoading } = useQuery({
    queryKey: ["permissions", { pageSize: 100 }],
    queryFn: () => fetchPermissions({ pageSize: 100 }),
  });
  const permissions = permissionsData?.data?.data ?? [];

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AddUserFormData>({
    resolver: zodResolver(addUserSchema),
    defaultValues: {
      permissionId: 0,
    },
  });

  const mutation = useMutation({
    mutationFn: addUser,
    onSuccess: (response) => {
      if (response?.succeeded) {
        toast.success(response.message || "تم إضافة المستخدم بنجاح");
        queryClient.invalidateQueries({ queryKey: ["users"] });
        reset();
        onSuccess?.();
      } else {
        toast.error(response?.message || "تعذر إضافة المستخدم");
      }
    },
    onError: (error: unknown) => {
      const err = error as {
        response?: {
          data?: { message?: string; errors?: Record<string, string[]> };
        };
      };
      console.error("Add user error:", err?.response?.data);

      if (err?.response?.data?.errors) {
        const errorMessages = Object.values(err.response.data.errors).flat();
        errorMessages.forEach((msg) => toast.error(msg));
      } else {
        toast.error(
          err?.response?.data?.message || "حدث خطأ أثناء إضافة المستخدم"
        );
      }
    },
  });

  const onSubmit = (data: AddUserFormData) => {
    mutation.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Name */}
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          الاسم
        </label>
        <div className="relative">
          <input
            type="text"
            id="name"
            {...register("name")}
            className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.name ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="اسم المستخدم"
          />
          <User className="absolute left-3 top-2.5 text-gray-400" size={20} />
        </div>
        {errors.name && (
          <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
        )}
      </div>

      {/* Email */}
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          البريد الإلكتروني
        </label>
        <div className="relative">
          <input
            type="email"
            id="email"
            {...register("email")}
            className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.email ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="البريد الإلكتروني"
          />
          <Mail className="absolute left-3 top-2.5 text-gray-400" size={20} />
        </div>
        {errors.email && (
          <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
        )}
      </div>

      {/* Phone Number */}
      <div>
        <label
          htmlFor="phoneNumber"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          رقم الهاتف
        </label>
        <div className="relative">
          <input
            type="tel"
            id="phoneNumber"
            {...register("phoneNumber")}
            className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.phoneNumber ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="رقم الهاتف"
            dir="ltr"
          />
          <Phone className="absolute left-3 top-2.5 text-gray-400" size={20} />
        </div>
        {errors.phoneNumber && (
          <p className="text-red-500 text-sm mt-1">
            {errors.phoneNumber.message}
          </p>
        )}
      </div>

      {/* Password */}
      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          كلمة المرور
        </label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            id="password"
            {...register("password")}
            className={`w-full pl-10 pr-10 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.password ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="كلمة المرور"
          />
          <Lock className="absolute left-3 top-2.5 text-gray-400" size={20} />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
        {errors.password && (
          <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
        )}
      </div>

      {/* Permission ID */}
      <div>
        <label
          htmlFor="permissionId"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          الصلاحية
        </label>
        <select
          id="permissionId"
          {...register("permissionId", { valueAsNumber: true })}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.permissionId ? "border-red-500" : "border-gray-300"
          }`}
          disabled={permissionsLoading}
        >
          <option value={0}>
            {permissionsLoading ? "جاري تحميل الصلاحيات..." : "اختر الصلاحية"}
          </option>
          {permissions.map((perm) => (
            <option key={perm.id} value={perm.id}>
              {perm.name}
            </option>
          ))}
        </select>
        {errors.permissionId && (
          <p className="text-red-500 text-sm mt-1">
            {errors.permissionId.message}
          </p>
        )}
      </div>

      {/* Buttons */}
      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={mutation.isPending}
          className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {mutation.isPending ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              جاري الإضافة...
            </>
          ) : (
            "إضافة المستخدم"
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
