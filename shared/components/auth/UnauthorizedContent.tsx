"use client";

import { ShieldX, LayoutDashboard } from "lucide-react";
import Link from "next/link";

export default function UnauthorizedContent() {
  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center p-8">
      <div className="bg-white rounded-2xl shadow-lg border border-amber-200 p-8 max-w-lg w-full text-center">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-amber-100 flex items-center justify-center">
          <ShieldX className="w-8 h-8 text-amber-600" />
        </div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">
          غير مصرح لك بالوصول
        </h1>
        <p className="text-gray-600 mb-6">
          ليس لديك الصلاحية اللازمة لعرض هذه الصفحة. يرجى التواصل مع المسؤول
          إذا كنت تعتقد أن هذا خطأ.
        </p>

        <div className="flex items-center justify-center gap-3">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-teal-600 text-white hover:bg-teal-700 transition-colors"
          >
            <LayoutDashboard className="w-4 h-4" />
            العودة للوحة التحكم
          </Link>
        </div>
      </div>
    </div>
  );
}
