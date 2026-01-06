"use client";

import React, { useState, useCallback, memo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, Mail, Lock } from "lucide-react";
import toast from "react-hot-toast";

import { setTokens } from "@/lib/authTokens";
import {
  loginSchema,
  type LoginFormData,
} from "../validations/loginValidation";
import { login } from "../apis/authApi";

function LoginForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const loginMutation = useMutation({
    mutationFn: (data: LoginFormData) =>
      login(data.email, data.password, "browser-device", "Browser"),
    onSuccess: (response) => {
      if (response.succeeded && response.data) {
        // Use secure token storage
        setTokens(response.data);
        toast.success(response.message || "تم تسجيل الدخول بنجاح");
        router.push("/dashboard");
      } else {
        toast.error(response.message || "فشل تسجيل الدخول");
      }
    },
    onError: (
      error: Error & { response?: { data?: { message?: string } } }
    ) => {
      toast.error(error?.response?.data?.message || "فشل تسجيل الدخول");
    },
  });

  const onSubmit = useCallback(
    (data: LoginFormData) => {
      loginMutation.mutate(data);
    },
    [loginMutation]
  );

  const togglePassword = useCallback(() => {
    setShowPassword((prev) => !prev);
  }, []);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
            placeholder="أدخل البريد الإلكتروني"
          />
          <Mail className="absolute left-3 top-2.5 text-gray-400" size={20} />
        </div>
        {errors.email && (
          <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
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
            {...register("password")}
            className={`w-full pl-10 pr-10 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.password ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="أدخل كلمة المرور"
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
        {errors.password && (
          <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
        )}
      </div>
      <button
        type="submit"
        disabled={loginMutation.isPending}
        className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 flex items-center justify-center"
      >
        {loginMutation.isPending ? (
          <Loader2 className="animate-spin ml-2" size={20} />
        ) : null}
        تسجيل الدخول
      </button>
    </form>
  );
}

export default memo(LoginForm);
