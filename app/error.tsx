"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCcw, Home } from "lucide-react";
import Link from "next/link";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    // Log error to monitoring service
    console.error("App error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-8">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 max-w-lg w-full text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-100 flex items-center justify-center">
          <AlertTriangle className="w-10 h-10 text-red-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          حدث خطأ غير متوقع
        </h1>
        <p className="text-gray-600 mb-6">
          نعتذر عن هذا الخطأ. يرجى المحاولة مرة أخرى أو العودة للصفحة الرئيسية.
        </p>

        {process.env.NODE_ENV === "development" && (
          <details className="mb-6 text-right">
            <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
              تفاصيل الخطأ (للمطورين)
            </summary>
            <pre className="mt-2 p-3 bg-gray-100 rounded-lg text-xs text-gray-700 overflow-auto max-h-40 text-left">
              {error.message}
              {error.digest && `\nDigest: ${error.digest}`}
            </pre>
          </details>
        )}

        <div className="flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors font-medium"
          >
            <RefreshCcw className="w-4 h-4" />
            حاول مرة أخرى
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors font-medium"
          >
            <Home className="w-4 h-4" />
            الصفحة الرئيسية
          </Link>
        </div>
      </div>
    </div>
  );
}
