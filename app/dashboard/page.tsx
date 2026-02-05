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
    },
    {
      title: "القضايا النشطة",
      value: stats?.activeCases ?? 0,
      icon: TrendingUp,
    },
    {
      title: "إجمالي المهام",
      value: stats?.totalTasks ?? 0,
      icon: ListTodo,
    },
    {
      title: "إجمالي العملاء",
      value: stats?.totalClients ?? 0,
      icon: Users,
    },
    {
      title: "جلسات اليوم",
      value: stats?.todaySessions ?? 0,
      icon: Calendar,
    },
    {
      title: "جلسات هذا الأسبوع",
      value: stats?.thisWeekSessions ?? 0,
      icon: Calendar,
    },
  ];

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h1 className="text-2xl font-semibold text-gray-900">
          مرحباً بك في محاماة
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          نظرة عامة على إحصائيات المكتب والأنشطة الحالية
        </p>
      </div>

      {/* Stats Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-[#17536e]" size={48} />
        </div>
      ) : isError ? (
        <div className="rounded-lg border border-gray-200 bg-gray-50 px-6 py-8 text-center text-gray-700">
          حدث خطأ أثناء جلب البيانات
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {dashboardCards.map((card) => (
            <div
              key={card.title}
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-bold">{card.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {card.value.toLocaleString("ar-EG")}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-[#17536e]">
                  <card.icon className="text-white" size={22} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
