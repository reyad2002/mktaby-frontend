import type { Metadata } from "next";
import RegisterForm from "@/features/auth/components/RegisterForm";
import { Scale } from "lucide-react";

export const metadata: Metadata = {
  title: "إنشاء حساب جديد",
  description: "إنشاء حساب جديد في نظام مكتبي لإدارة المكاتب القانونية",
};

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-indigo-100 px-4 py-5">
      <div className="w-full max-w-2xl">
        {/* Card Container */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Logo and Title */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
              <Scale className="text-white" size={32} />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              نظام مكتبي
            </h1>
            <p className="text-gray-600">أنشئ حسابك للبدء في استخدام النظام</p>
          </div>

          {/* Register Form */}
          <RegisterForm />

          {/* Footer Links */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              لديك حساب بالفعل؟
              <a
                href="/auth/login"
                className="text-blue-600 hover:text-blue-700 font-medium ml-1"
              >
                تسجيل الدخول
              </a>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-600 mt-6">
          © 2025 نظام مكتبي. جميع الحقوق محفوظة.
        </p>
      </div>
    </div>
  );
}
