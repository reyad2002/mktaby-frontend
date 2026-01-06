"use client";

import React, { useState, useCallback, memo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
  Eye,
  EyeOff,
  Loader2,
  Mail,
  Lock,
  User,
  Phone,
  Building2,
  AlertCircle,
} from "lucide-react";
import toast from "react-hot-toast";

import { register } from "../apis/authApi";
import { getErrorMessage, getValidationErrors } from "@/lib/errorTypes";
import {
  registerSchema,
  type RegisterFormData,
} from "../validations/registerValidation";
import PasswordStrength from "@/shared/components/ui/PasswordStrength";

function RegisterForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register: formRegister,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const passwordValue = watch("password", "");

  const mutation = useMutation({
    mutationFn: (data: RegisterFormData) =>
      register(
        data.officeName,
        data.fullName,
        data.email,
        data.phoneNumber,
        data.password
      ),
    onSuccess: (response) => {
      if (response?.succeeded) {
        toast.success(response.message || "تم إنشاء الحساب بنجاح");
        router.push("/auth/login");
      } else {
        toast.error(response?.message || "تعذر إنشاء الحساب");
      }
    },
    onError: (error: unknown) => {
      // Handle validation errors from API
      const validationErrors = getValidationErrors(error);
      if (validationErrors.length > 0) {
        validationErrors.forEach((msg) => toast.error(msg));
      } else {
        toast.error(getErrorMessage(error, "حدث خطأ أثناء إنشاء الحساب"));
      }
    },
  });

  const onSubmit = useCallback(
    (data: RegisterFormData) => {
      mutation.mutate(data);
    },
    [mutation]
  );

  const togglePassword = useCallback(() => {
    setShowPassword((prev) => !prev);
  }, []);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="officeName"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            اسم المكتب
          </label>
          <div className="relative">
            <input
              type="text"
              id="officeName"
              {...formRegister("officeName")}
              className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.officeName ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="اسم المكتب"
            />
            <Building2
              className="absolute left-3 top-2.5 text-gray-400"
              size={20}
            />
          </div>
          {errors.officeName && (
            <p className="text-red-500 text-sm mt-1">
              {errors.officeName.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="fullName"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            الاسم الكامل
          </label>
          <div className="relative">
            <input
              type="text"
              id="fullName"
              {...formRegister("fullName")}
              className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.fullName ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="الاسم الكامل"
            />
            <User className="absolute left-3 top-2.5 text-gray-400" size={20} />
          </div>
          {errors.fullName && (
            <p className="text-red-500 text-sm mt-1">
              {errors.fullName.message}
            </p>
          )}
        </div>

        <div className="md:col-span-2">
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
              {...formRegister("email")}
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
              {...formRegister("phoneNumber")}
              className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.phoneNumber ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="مثال: 01000000000"
            />
            <Phone
              className="absolute left-3 top-2.5 text-gray-400"
              size={20}
            />
          </div>
          {errors.phoneNumber && (
            <p className="text-red-500 text-sm mt-1">
              {errors.phoneNumber.message}
            </p>
          )}
        </div>

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
              {...formRegister("password")}
              className={`w-full pl-10 pr-10 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.password ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="كلمة المرور"
            />
            <Lock className="absolute left-3 top-2.5 text-gray-400" size={20} />
            <button
              type="button"
              onClick={togglePassword}
              className="absolute right-3 top-2.5 text-gray-400 focus:outline-none"
              aria-label={
                showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"
              }
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          <PasswordStrength password={passwordValue} showRequirements={true} />
          {errors.password && (
            <div className="flex items-center gap-1 text-red-500 text-sm mt-1">
              <AlertCircle className="w-4 h-4" />
              <span>{errors.password.message}</span>
            </div>
          )}
        </div>

        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            تأكيد كلمة المرور
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              id="confirmPassword"
              {...formRegister("confirmPassword")}
              className={`w-full pl-10 pr-10 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.confirmPassword ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="تأكيد كلمة المرور"
            />
            <Lock className="absolute left-3 top-2.5 text-gray-400" size={20} />
          </div>
          {errors.confirmPassword && (
            <p className="text-red-500 text-sm mt-1">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>
      </div>

      <button
        type="submit"
        disabled={mutation.isPending}
        className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 flex items-center justify-center"
      >
        {mutation.isPending ? (
          <Loader2 className="animate-spin mr-2" size={20} />
        ) : null}
        إنشاء الحساب
      </button>
    </form>
  );
}

export default memo(RegisterForm);
