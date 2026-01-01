"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Briefcase,
  Users,
  ListTodo,
  Calendar,
  TrendingUp,
  Loader2,
} from "lucide-react";

import { fetchDashboardData } from "@/features/dashboard/apis/dashboardApi";

export default function DashboardPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["dashboard"],
    queryFn: fetchDashboardData,
  });

  const stats = data?.data;

  const dashboardCards = [
    {
      title: "إجمالي القضايا",
      value: stats?.totalCases ?? 0,
      icon: Briefcase,
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-400/30",
    },
    {
      title: "القضايا النشطة",
      value: stats?.activeCases ?? 0,
      icon: TrendingUp,
      color: "from-emerald-500 to-emerald-600",
      bgColor: "bg-emerald-500/10",
      borderColor: "border-emerald-400/30",
    },
    {
      title: "إجمالي المهام",
      value: stats?.totalTasks ?? 0,
      icon: ListTodo,
      color: "from-amber-500 to-amber-600",
      bgColor: "bg-amber-500/10",
      borderColor: "border-amber-400/30",
    },
    {
      title: "إجمالي العملاء",
      value: stats?.totalClients ?? 0,
      icon: Users,
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-500/10",
      borderColor: "border-purple-400/30",
    },
    {
      title: "جلسات اليوم",
      value: stats?.todaySessions ?? 0,
      icon: Calendar,
      color: "from-rose-500 to-rose-600",
      bgColor: "bg-rose-500/10",
      borderColor: "border-rose-400/30",
    },
    {
      title: "جلسات هذا الأسبوع",
      value: stats?.thisWeekSessions ?? 0,
      icon: Calendar,
      color: "from-cyan-500 to-cyan-600",
      bgColor: "bg-cyan-500/10",
      borderColor: "border-cyan-400/30",
    },
  ];

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 border border-blue-400/30 shadow-2xl shadow-blue-900/30 p-6 sm:p-8 text-white">
        <div
          className="absolute -left-10 -top-10 h-40 w-40 rounded-full bg-blue-400/10 blur-3xl"
          aria-hidden
        />
        <div
          className="absolute -right-6 bottom-0 h-32 w-32 rounded-full bg-blue-300/10 blur-3xl"
          aria-hidden
        />
        <div className="relative">
          <p className="text-sm text-blue-100/80">لوحة التحكم</p>
          <h1 className="text-3xl font-semibold tracking-tight mt-1">
            مرحباً بك في مكتبي
          </h1>
          <p className="text-sm text-gray-200/80 max-w-2xl mt-2">
            نظرة عامة على إحصائيات المكتب والأنشطة الحالية.
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-blue-500" size={48} />
        </div>
      ) : isError ? (
        <div className="rounded-2xl border border-red-400/40 bg-red-500/10 px-6 py-8 text-center text-red-200">
          حدث خطأ أثناء جلب البيانات
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {dashboardCards.map((card) => (
            <div
              key={card.title}
              className={`relative overflow-hidden rounded-2xl border ${card.borderColor} ${card.bgColor} backdrop-blur-xl p-6 transition-all hover:scale-[1.02] hover:shadow-xl`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-800">{card.title}</p>
                  <p className="text-4xl font-bold text-gray-500 mt-2">
                    {card.value.toLocaleString("ar-EG")}
                  </p>
                </div>
                <div
                  className={`p-3 rounded-xl bg-gradient-to-br ${card.color}`}
                >
                  <card.icon className="text-white" size={24} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
