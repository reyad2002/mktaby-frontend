"use client";

import Link from "next/link";
import {
  Receipt,
  Wallet,
  DollarSign,
  ArrowLeft,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

export default function CaseAccountingPage() {
  return (
    <section className="space-y-6 relative">
      {/* Soft premium background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-blue-200/40 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-indigo-200/40 blur-3xl" />
        <div className="absolute inset-0 bg-linear-to-b from-slate-50 via-white to-white" />
      </div>

      {/* Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-linear-to-br from-blue-50 to-indigo-50 border border-blue-200/60 shadow-sm">
            <DollarSign size={24} className="text-blue-700" />
          </span>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">محاسبة القضايا</h1>
            <p className="text-sm text-gray-600">
              إدارة الرسوم والمصاريف المتعلقة بالقضايا
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Fees Card */}
        <Link
          href="/dashboard/accounting/case-accounting/fees"
          className="group relative overflow-hidden rounded-2xl bg-white border border-gray-200/70 shadow-[0_10px_30px_-18px_rgba(0,0,0,0.35)] ring-1 ring-gray-200/50 p-6 transition-all hover:shadow-[0_20px_40px_-20px_rgba(59,130,246,0.4)] hover:border-blue-300"
        >
          {/* Accent line */}
          <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-blue-500 via-indigo-500 to-cyan-500" />

          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <span className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-linear-to-br from-blue-50 to-indigo-50 border border-blue-200/60 shadow-sm group-hover:scale-110 transition-transform">
                <Receipt size={28} className="text-blue-700" />
              </span>
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-1">
                  رسوم القضايا
                </h2>
                <p className="text-sm text-gray-600">
                  إدارة وتتبع رسوم ومستحقات القضايا
                </p>
              </div>
            </div>
            <ArrowLeft
              size={20}
              className="text-gray-400 group-hover:text-blue-600 group-hover:-translate-x-1 transition-all"
            />
          </div>

          <div className="mt-6 flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200">
              <TrendingUp size={14} className="text-emerald-600" />
              <span className="text-xs font-semibold text-emerald-700">
                إيرادات
              </span>
            </div>
            <span className="text-xs text-gray-500">
              إدارة الرسوم وتواريخ الاستحقاق
            </span>
          </div>
        </Link>

        {/* Expenses Card */}
        <Link
          href="/dashboard/accounting/case-accounting/expenses"
          className="group relative overflow-hidden rounded-2xl bg-white border border-gray-200/70 shadow-[0_10px_30px_-18px_rgba(0,0,0,0.35)] ring-1 ring-gray-200/50 p-6 transition-all hover:shadow-[0_20px_40px_-20px_rgba(249,115,22,0.4)] hover:border-orange-300"
        >
          {/* Accent line */}
          <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-orange-500 via-amber-500 to-yellow-500" />

          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <span className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-linear-to-br from-orange-50 to-amber-50 border border-orange-200/60 shadow-sm group-hover:scale-110 transition-transform">
                <Wallet size={28} className="text-orange-700" />
              </span>
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-1">
                  مصاريف القضايا
                </h2>
                <p className="text-sm text-gray-600">
                  إدارة وتتبع مصاريف ونفقات القضايا
                </p>
              </div>
            </div>
            <ArrowLeft
              size={20}
              className="text-gray-400 group-hover:text-orange-600 group-hover:-translate-x-1 transition-all"
            />
          </div>

          <div className="mt-6 flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-red-50 border border-red-200">
              <TrendingDown size={14} className="text-red-600" />
              <span className="text-xs font-semibold text-red-700">نفقات</span>
            </div>
            <span className="text-xs text-gray-500">
              إدارة المصاريف وتواريخها
            </span>
          </div>
        </Link>

        {/* Fee Payments Card */}
        <Link
          href="/dashboard/accounting/case-accounting/fee-payments"
          className="group relative overflow-hidden rounded-2xl bg-white border border-gray-200/70 shadow-[0_10px_30px_-18px_rgba(0,0,0,0.35)] ring-1 ring-gray-200/50 p-6 transition-all hover:shadow-[0_20px_40px_-20px_rgba(16,185,129,0.4)] hover:border-emerald-300"
        >
          {/* Accent line */}
          <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-emerald-500 via-teal-500 to-green-500" />

          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <span className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-linear-to-br from-emerald-50 to-teal-50 border border-emerald-200/60 shadow-sm group-hover:scale-110 transition-transform">
                <DollarSign size={28} className="text-emerald-700" />
              </span>
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-1">
                  دفعات الرسوم
                </h2>
                <p className="text-sm text-gray-600">
                  إدارة دفعات رسوم القضايا وتتبع حالات الدفع
                </p>
              </div>
            </div>
            <ArrowLeft
              size={20}
              className="text-gray-400 group-hover:text-emerald-600 group-hover:-translate-x-1 transition-all"
            />
          </div>

          <div className="mt-6 flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200">
              <DollarSign size={14} className="text-blue-600" />
              <span className="text-xs font-semibold text-blue-700">
                الدفعات
              </span>
            </div>
            <span className="text-xs text-gray-500">
              متابعة حالات الدفع والتحصيل
            </span>
          </div>
        </Link>
      </div>

      {/* Info Section */}
      <div className="rounded-2xl bg-white/90 backdrop-blur border border-gray-200/70 shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <DollarSign size={20} className="text-blue-600" />
          نظرة عامة
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
          <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100">
            <h4 className="font-semibold text-blue-900 mb-2">الرسوم</h4>
            <ul className="space-y-1 text-blue-800">
              <li>• تسجيل رسوم القضايا</li>
              <li>• تتبع تواريخ الاستحقاق</li>
              <li>• تنبيهات للرسوم المتأخرة</li>
            </ul>
          </div>
          <div className="p-4 bg-orange-50/50 rounded-xl border border-orange-100">
            <h4 className="font-semibold text-orange-900 mb-2">المصاريف</h4>
            <ul className="space-y-1 text-orange-800">
              <li>• تسجيل مصاريف القضايا</li>
              <li>• تتبع النفقات بالتاريخ</li>
              <li>• حساب إجمالي المصاريف</li>
            </ul>
          </div>
          <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-100">
            <h4 className="font-semibold text-emerald-900 mb-2">الدفعات</h4>
            <ul className="space-y-1 text-emerald-800">
              <li>• تتبع دفعات الرسوم</li>
              <li>• حالة الدفع والتحصيل</li>
              <li>• متابعة طرق الدفع</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
