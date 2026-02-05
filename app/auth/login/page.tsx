import type { Metadata } from "next";
import LoginForm from "@/features/auth/components/LoginForm";
import { Scale } from "lucide-react";

export const metadata: Metadata = {
  title: "تسجيل الدخول",
  description: "تسجيل الدخول إلى نظام محاماة لإدارة المكاتب القانونية",
};

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-indigo-100 px-4">
      <div className="w-full max-w-md">
        {/* Card Container */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Logo and Title */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-full mb-4">
              <Scale className="text-white" size={32} />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              نظام محاماة
            </h1>
            <p className="text-gray-600">
              مرحباً بك، يرجى تسجيل الدخول للمتابعة
            </p>
          </div>

          {/* Login Form */}
          <LoginForm />
          {/* Footer Links */}
          {/* <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              ليس لديك حساب؟{" "}
              <a
                href="/auth/register"
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                سجل الآن
              </a>
            </p>
          </div> */}
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-600 mt-6">
          © 2025 نظام محاماة. جميع الحقوق محفوظة.
        </p>
      </div>
    </div>
  );
}
