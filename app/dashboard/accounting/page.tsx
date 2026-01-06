"use client";

import { useRouter } from "next/navigation";
import {
  DollarSign,
  Plus,
  TrendingUp,
  Building2,
  Briefcase,
} from "lucide-react";
import React from "react";

export default function AccountingPage() {
  const router = useRouter();

  const accountingModules = [
    {
      title: " المكتب",
      description: "إدارة مصروفات المكتب والعمليات",
      icon: Building2,
      color: "from-amber-500 to-amber-600",
      bgColor: "bg-amber-500/10",
      borderColor: "border-amber-400/30",
      path: "/dashboard/accounting/office-expenses",
    },
    {
      title: " القضايا",
      description: "إدارة مصروفات القضايا المختلفة",
      icon: Briefcase,
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-500/10",
      borderColor: "border-purple-400/30",
      path: "/dashboard/accounting/case-expenses",
    },
  ];

  return (
    <div className="">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-lg bg-linear-to-br from-amber-500 to-amber-600">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-slate-900">الحسابات</h1>
              <p className="text-slate-400 mt-1">
                إدارة جميع العمليات المالية والحسابات
              </p>
            </div>
          </div>
        </div>

        {/* Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {accountingModules.map((module, index) => {
            const Icon = module.icon;
            return (
              <button
                key={index}
                onClick={() => router.push(module.path)}
                className="group relative overflow-hidden rounded-xl border border-slate-700 bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 p-6 p-6 backdrop-blur-sm transition-all duration-300 hover:border-slate-500 hover:bg-slate-800/80"
              >
                {/* Background gradient on hover */}
                <div
                  className={`absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-10 ${module.bgColor}`}
                />

                {/* Content */}
                <div className="relative z-10 text-right">
                  <div className="flex items-center justify-end gap-4 mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-white group-hover:text-transparent group-hover:bg-linear-to-r group-hover:from-amber-400 group-hover:to-amber-600 group-hover:bg-clip-text transition-all">
                        {module.title}
                      </h3>
                      <p className="text-slate-400 text-sm mt-1 group-hover:text-slate-300 transition-colors">
                        {module.description}
                      </p>
                    </div>
                    <div
                      className={`p-3 rounded-lg bg-linear-to-br ${module.color} group-hover:scale-110 transition-transform duration-300`}
                    >
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                  </div>

                  {/* Hover indicator */}
                  <div className="flex items-center justify-start gap-2 text-sm font-semibold text-slate-400 group-hover:text-amber-400 transition-colors">
                    <span>الوصول إلى الصفحة</span>
                    <svg
                      className="w-4 h-4 transform group-hover:translate-x-1 transition-transform"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16l-4-4m0 0l4-4m-4 4h18"
                      />
                    </svg>
                  </div>
                </div>

                {/* Border gradient on hover */}
                <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none bg-linear-to-r from-amber-500/20 via-transparent to-amber-500/20" />
              </button>
            );
          })}
        </div>

        {/* Stats Section */}
        {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div className="rounded-xl border border-slate-700 bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 p-6 backdrop-blur-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">إجمالي الاتعاب</p>
                <p className="text-2xl font-bold text-white mt-2">--</p>
              </div>
              <DollarSign className="w-10 h-10 text-green-500/30" />
            </div>
          </div>

          <div className="rounded-xl border border-slate-700 bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 p-6 backdrop-blur-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">مصروفات المكتب</p>
                <p className="text-2xl font-bold text-white mt-2">--</p>
              </div>
              <Building2 className="w-10 h-10 text-blue-500/30" />
            </div>
          </div>

          <div className="rounded-xl border border-slate-700 bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 p-6 backdrop-blur-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">مصروفات القضايا</p>
                <p className="text-2xl font-bold text-white mt-2">--</p>
              </div>
              <Briefcase className="w-10 h-10 text-purple-500/30" />
            </div>
          </div>
        </div> */}
      </div>
    </div>
  );
}
