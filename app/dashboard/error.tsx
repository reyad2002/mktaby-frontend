"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCcw, LayoutDashboard } from "lucide-react";
import Link from "next/link";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function DashboardError({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error("Dashboard error:", error);
  }, [error]);

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center p-8">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 max-w-lg w-full text-center">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-100 flex items-center justify-center">
          <AlertTriangle className="w-8 h-8 text-red-600" />
        </div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">
          حدث خطأ في لوحة التحكم
        </h1>
        <p className="text-gray-600 mb-6">
          نعتذر عن هذا الخطأ. يرجى المحاولة مرة أخرى.
        </p>

        {process.env.NODE_ENV === "development" && (
          <details className="mb-6 text-right">
            <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
              تفاصيل الخطأ
            </summary>
            <pre className="mt-2 p-3 bg-gray-100 rounded-lg text-xs text-gray-700 overflow-auto max-h-40 text-left">
              {error.message}
            </pre>
          </details>
        )}

        <div className="flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
          >
            <RefreshCcw className="w-4 h-4" />
            حاول مرة أخرى
          </button>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <LayoutDashboard className="w-4 h-4" />
            لوحة التحكم
          </Link>
        </div>
      </div>
    </div>
  );
}
