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
      // نقلت القيم هنا لضمان عمل الفورم بشكل صحيح
      email: "",
      password: "",
    },
  });

  const loginMutation = useMutation({
    mutationFn: (data: LoginFormData) =>
      login(data.email, data.password, "browser-device", "Browser"),
    onSuccess: (response) => {
      if (response.succeeded && response.data) {
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

  // Shared classes for inputs to match the system design
  const inputClasses = (hasError: boolean) => `
    w-full pl-12 pr-12 py-3.5 rounded-xl border bg-gray-50/50 text-gray-900 placeholder-gray-400 
    transition-all duration-200 outline-none
    ${
      hasError
        ? "border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/10"
        : "border-gray-200 hover:border-indigo-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 bg-white"
    }
  `;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      
      {/* Email Field */}
      <div className="space-y-1.5">
        <label
          htmlFor="email"
          className="block text-sm font-bold text-gray-700"
        >
          البريد الإلكتروني
        </label>
        <div className="relative group">
          <input
            type="email"
            id="email"
            {...register("email")}
            className={inputClasses(!!errors.email)}
            placeholder="أدخل البريد الإلكتروني"
            dir="ltr" // Force LTR for email input typically
          />
          {/* Icon Positioned Logic: Assuming Arabic UI, primary icon on Right (Start) */}
          <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
            <Mail 
              size={20} 
              className={`transition-colors ${errors.email ? "text-red-400" : "text-gray-400 group-focus-within:text-primary"}`} 
            />
          </div>
        </div>
        {errors.email && (
          <p className="text-red-500 text-xs font-bold mt-1 animate-in slide-in-from-top-1">
            {errors.email.message}
          </p>
        )}
      </div>

      {/* Password Field */}
      <div className="space-y-1.5">
        <label
          htmlFor="password"
          className="block text-sm font-bold text-gray-700"
        >
          كلمة المرور
        </label>
        <div className="relative group">
          <input
            type={showPassword ? "text" : "password"}
            id="password"
            {...register("password")}
            className={inputClasses(!!errors.password)}
            placeholder="أدخل كلمة المرور"
            dir="ltr"
          />
          
          {/* Main Icon (Lock) - Right Side */}
          <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
            <Lock 
               size={20} 
               className={`transition-colors ${errors.password ? "text-red-400" : "text-gray-400 group-focus-within:text-primary"}`}
            />
          </div>

          {/* Toggle Button (Eye) - Left Side */}
          <button
            type="button"
            onClick={togglePassword}
            className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400 hover:text-primary focus:outline-none transition-colors"
            aria-label={
              showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"
            }
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
        {errors.password && (
          <p className="text-red-500 text-xs font-bold mt-1 animate-in slide-in-from-top-1">
            {errors.password.message}
          </p>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loginMutation.isPending}
        className="w-full relative cursor-pointer overflow-hidden bg-primary hover:bg-primary/90 text-white font-bold py-3.5 rounded-2xl shadow-lg shadow-primary/20 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loginMutation.isPending ? (
          <Loader2 className="animate-spin" size={20} />
        ) : null}
        <span>تسجيل الدخول</span>
      </button>
    </form>
  );
}

export default memo(LoginForm);