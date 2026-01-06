import { FileQuestion, Home, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <div className="text-center max-w-lg">
        {/* 404 Number */}
        <div className="mb-8">
          <span className="text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">
            404
          </span>
        </div>

        {/* Icon */}
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-yellow-400/10 flex items-center justify-center border border-yellow-400/20">
          <FileQuestion className="w-10 h-10 text-yellow-400" />
        </div>

        {/* Message */}
        <h1 className="text-3xl font-bold text-white mb-3">
          الصفحة غير موجودة
        </h1>
        <p className="text-gray-400 mb-8">
          عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها إلى مكان آخر.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-yellow-400 text-slate-900 hover:bg-yellow-300 transition-colors font-semibold shadow-lg shadow-yellow-400/20"
          >
            <Home className="w-5 h-5" />
            الذهاب للوحة التحكم
          </Link>
          <Link
            href="javascript:history.back()"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-white/20 text-white hover:bg-white/10 transition-colors font-medium"
          >
            <ArrowRight className="w-5 h-5" />
            العودة للصفحة السابقة
          </Link>
        </div>
      </div>
    </div>
  );
}
