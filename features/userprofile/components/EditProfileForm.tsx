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

  // Shared input style classes
  const inputClasses = (hasError: boolean) => `
    w-full px-4 py-3.5 rounded-xl border bg-white text-gray-900 placeholder-gray-400 
    transition-all duration-200 outline-none
    ${
      hasError
        ? "border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/10"
        : "border-gray-200 hover:border-indigo-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
    }
  `;

  const labelClasses = "flex items-center gap-2 text-sm font-bold text-gray-700 mb-2";
  const iconClasses = "text-indigo-500";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Name */}
        <div className="space-y-1">
          <label className={labelClasses}>
            <User size={16} className={iconClasses} />
            الاسم
          </label>
          <input
            type="text"
            {...register("name")}
            className={inputClasses(!!errors.name)}
            placeholder="أدخل الاسم"
          />
          {errors.name && (
            <p className="text-red-500 text-xs font-semibold mt-1 animate-in slide-in-from-top-1">
              {errors.name.message}
            </p>
          )}
        </div>

        {/* Email */}
        <div className="space-y-1">
          <label className={labelClasses}>
            <Mail size={16} className={iconClasses} />
            البريد الإلكتروني
          </label>
          <input
            type="email"
            {...register("email")}
            className={inputClasses(!!errors.email)}
            placeholder="أدخل البريد الإلكتروني"
          />
          {errors.email && (
            <p className="text-red-500 text-xs font-semibold mt-1 animate-in slide-in-from-top-1">
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Phone */}
        <div className="space-y-1 md:col-span-2">
          <label className={labelClasses}>
            <Phone size={16} className={iconClasses} />
            رقم الهاتف
          </label>
          <input
            type="text"
            {...register("phoneNumber")}
            className={inputClasses(!!errors.phoneNumber)}
            placeholder="أدخل رقم الهاتف"
            maxLength={11}
          />
          {errors.phoneNumber && (
            <p className="text-red-500 text-xs font-semibold mt-1 animate-in slide-in-from-top-1">
              {errors.phoneNumber.message}
            </p>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col-reverse sm:flex-row gap-3 justify-end pt-6 border-t border-gray-100">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl border border-gray-200 bg-white text-gray-700 font-bold hover:bg-gray-50 hover:text-gray-900 transition-all active:scale-[0.98]"
        >
          <X size={18} />
          إلغاء
        </button>

        <button
          type="submit"
          disabled={updateMutation.isPending}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-primary cursor-pointer text-white font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 hover:shadow-primary/30 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
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