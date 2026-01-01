"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, User, Mail, Phone, X, Save } from "lucide-react";
import toast from "react-hot-toast";
import {
  updateProfileSchema,
  type UpdateProfileFormData,
} from "../validations/updateProfileValidation";
import { updateUser } from "@/features/users/apis/usersApi";
import type { UserDetail } from "@/features/users/types/userTypes";

interface EditProfileFormProps {
  user: UserDetail;
  onCancel: () => void;
  onSuccess: () => void;
}

export default function EditProfileForm({
  user,
  onCancel,
  onSuccess,
}: EditProfileFormProps) {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UpdateProfileFormData>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber,
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: UpdateProfileFormData) =>
      updateUser({
        id: user.id,
        permissionId: user.userPermissionId,
        ...data,
      }),
    onSuccess: (response) => {
      if (response.succeeded) {
        toast.success(response.message || "تم تحديث الملف الشخصي بنجاح");
        queryClient.invalidateQueries({ queryKey: ["currentUser"] });
        onSuccess();
      } else {
        toast.error(response.message || "فشل تحديث الملف الشخصي");
      }
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(
        err?.response?.data?.message || "حدث خطأ أثناء تحديث الملف الشخصي"
      );
    },
  });

  const onSubmit = (data: UpdateProfileFormData) => {
    updateMutation.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Name */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-400">
            <User size={16} className="text-yellow-300" />
            الاسم
          </label>
          <input
            type="text"
            {...register("name")}
            className={`w-full px-4 py-3 rounded-xl border ${
              errors.name
                ? "border-red-500 bg-red-500/5"
                : "border-white/10 bg-white/5"
            } text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400/50`}
            placeholder="أدخل الاسم"
          />
          {errors.name && (
            <p className="text-red-400 text-sm">{errors.name.message}</p>
          )}
        </div>

        {/* Email */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-400">
            <Mail size={16} className="text-yellow-300" />
            البريد الإلكتروني
          </label>
          <input
            type="email"
            {...register("email")}
            className={`w-full px-4 py-3 rounded-xl border ${
              errors.email
                ? "border-red-500 bg-red-500/5"
                : "border-white/10 bg-white/5"
            } text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400/50`}
            placeholder="أدخل البريد الإلكتروني"
          />
          {errors.email && (
            <p className="text-red-400 text-sm">{errors.email.message}</p>
          )}
        </div>

        {/* Phone */}
        <div className="space-y-2 md:col-span-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-400">
            <Phone size={16} className="text-yellow-300" />
            رقم الهاتف
          </label>
          <input
            type="text"
            {...register("phoneNumber")}
            className={`w-full px-4 py-3 rounded-xl border ${
              errors.phoneNumber
                ? "border-red-500 bg-red-500/5"
                : "border-white/10 bg-white/5"
            } text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400/50`}
            placeholder="أدخل رقم الهاتف"
            maxLength={11}
          />
          {errors.phoneNumber && (
            <p className="text-red-400 text-sm">{errors.phoneNumber.message}</p>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 justify-end pt-4 border-t border-white/10">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white hover:bg-white/10 transition-colors flex items-center gap-2"
        >
          <X size={18} />
          إلغاء
        </button>

        <button
          type="submit"
          disabled={updateMutation.isPending}
          className="px-6 py-2.5 rounded-xl bg-yellow-400 text-slate-900 hover:bg-yellow-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium"
        >
          {updateMutation.isPending ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              جاري الحفظ...
            </>
          ) : (
            <>
              <Save size={18} />
              حفظ التغييرات
            </>
          )}
        </button>
      </div>
    </form>
  );
}
