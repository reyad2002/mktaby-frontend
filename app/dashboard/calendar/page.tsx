"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Calendar, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

import PageHeader from "@/shared/components/dashboard/PageHeader";
import {
  getMonthEventsApi,
  getDayEventsApi,
} from "@/features/calendar/apis/calenderApis";
import type {
  EntityType,
  CalendarMonthItemDto,
  CalendarDayItemDto,
} from "@/features/calendar/types/calenderTypes";

const ENTITY_TYPES: { value: EntityType; label: string }[] = [
  { value: "Case", label: "القضايا" },
  { value: "Session", label: "الجلسات" },
  { value: "Task", label: "المهام" },
  { value: "Client", label: "العملاء" },
  { value: "ApplicationUser", label: "المستخدمون" },
];

const WEEKDAYS_AR = [
  "الأحد",
  "الاثنين",
  "الثلاثاء",
  "الأربعاء",
  "الخميس",
  "الجمعة",
  "السبت",
];

function getDaysInMonth(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}

function getFirstDayOfMonth(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
}

function formatDateToISO(date: Date): string {
  return date.toISOString().split("T")[0];
}

function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    Active: "bg-green-100 text-green-800",
    UnderReview: "bg-yellow-100 text-yellow-800",
    UnderInvestigation: "bg-orange-100 text-orange-800",
    ReadyForHearing: "bg-blue-100 text-blue-800",
    InCourt: "bg-purple-100 text-purple-800",
    Postponed: "bg-gray-100 text-gray-800",
    ReservedForJudgment: "bg-indigo-100 text-indigo-800",
    Completed: "bg-emerald-100 text-emerald-800",
    Closed: "bg-slate-100 text-slate-800",
    Rejected: "bg-red-100 text-red-800",
    Cancelled: "bg-rose-100 text-rose-800",
    Settled: "bg-teal-100 text-teal-800",
    Suspended: "bg-amber-100 text-amber-800",
    Archived: "bg-zinc-100 text-zinc-800",
    Appealed: "bg-cyan-100 text-cyan-800",
    Executed: "bg-lime-100 text-lime-800",
    Pending: "bg-blue-50 text-blue-700",
    InProgress: "bg-blue-100 text-blue-800",
    Done: "bg-green-100 text-green-800",
  };
  return colors[status] || "bg-gray-100 text-gray-800";
}

const getEntityColor = (entityType: EntityType): string => {
  const colors: Record<EntityType, string> = {
    Case: "bg-blue-50 text-blue-700 border-blue-200",
    Session: "bg-purple-50 text-purple-700 border-purple-200",
    Task: "bg-green-50 text-green-700 border-green-200",
    Client: "bg-cyan-50 text-cyan-700 border-cyan-200",
    ApplicationUser: "bg-orange-50 text-orange-700 border-orange-200",
    CompanyEmployee: "bg-pink-50 text-pink-700 border-pink-200",
    Office: "bg-indigo-50 text-indigo-700 border-indigo-200",
    Folder: "bg-amber-50 text-amber-700 border-amber-200",
  };
  return colors[entityType];
};

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedEntityType, setSelectedEntityType] = useState<
    EntityType | undefined
  >();
  const [viewMode, setViewMode] = useState<"month" | "day">("month");

  const monthStart = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  );
  const monthEnd = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  );

  // Month view query
  const {
    data: monthData,
    isLoading: isLoadingMonth,
    isFetching: isFetchingMonth,
  } = useQuery({
    queryKey: ["calendar-month", currentDate, selectedEntityType],
    queryFn: () =>
      getMonthEventsApi({
        startDate: monthStart.toISOString(),
        endDate: monthEnd.toISOString(),
        entityType: selectedEntityType,
      }),
  });

  // Day view query
  const dayStart = selectedDate
    ? new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        selectedDate.getDate()
      )
    : null;
  const dayEnd = dayStart
    ? new Date(dayStart.getTime() + 24 * 60 * 60 * 1000)
    : null;

  const {
    data: dayData,
    isLoading: isLoadingDay,
    isFetching: isFetchingDay,
  } = useQuery({
    queryKey: ["calendar-day", selectedDate, selectedEntityType],
    queryFn: () =>
      getDayEventsApi({
        startDate: dayStart?.toISOString(),
        endDate: dayEnd?.toISOString(),
        entityType: selectedEntityType,
      }),
    enabled: !!selectedDate,
  });

  const monthItems = useMemo(() => monthData?.data || [], [monthData]);
  const dayItems = useMemo(() => dayData?.data || [], [dayData]);

  const eventCountMap = useMemo(() => {
    const map = new Map<string, number>();
    monthItems.forEach((item) => {
      const dateKey = new Date(item.date).toISOString().split("T")[0];
      map.set(dateKey, (map.get(dateKey) || 0) + item.count);
    });
    return map;
  }, [monthItems]);

  const handlePrevMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1)
    );
  };

  const handleNextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1)
    );
  };

  const handleDateClick = (day: number) => {
    const selected = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day
    );
    setSelectedDate(selected);
    setViewMode("day");
  };

  const renderMonthCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(
        <div
          key={`empty-${i}`}
          className="p-2 bg-gray-50 rounded-lg text-center text-xs"
        />
      );
    }

    // Days of month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        day
      );
      const dateKey = formatDateToISO(date);
      const eventCount = eventCountMap.get(dateKey) || 0;
      const isSelected =
        selectedDate && formatDateToISO(selectedDate) === dateKey;
      const isToday = new Date().toISOString().split("T")[0] === dateKey;

      days.push(
        <button
          key={day}
          onClick={() => handleDateClick(day)}
          className={`min-h-24 p-2 rounded-lg border-2 transition-all hover:shadow-md ${
            isSelected
              ? "bg-blue-50 border-blue-400"
              : isToday
              ? "bg-amber-50 border-amber-300"
              : "bg-white border-gray-200 hover:border-gray-300"
          }`}
        >
          <div className="text-right">
            <p
              className={`text-sm font-semibold ${
                isToday ? "text-amber-700" : "text-gray-900"
              }`}
            >
              {day}
            </p>
            {eventCount > 0 && (
              <p className="text-xs mt-1 px-2 py-1 rounded-full bg-blue-100 text-blue-700 inline-block">
                {eventCount} حدث
              </p>
            )}
          </div>
        </button>
      );
    }

    return days;
  };

  return (
    <section className="space-y-6">
      {/* Header */}
      <PageHeader
        title="التقويم"
        subtitle="عرض أحداث القضايا والجلسات والمهام على التقويم الشهري."
        icon={Calendar}
        isFetching={isFetchingMonth || isFetchingDay}
      />

      {/* Controls */}
      <div className="rounded-xl bg-white border border-gray-200 shadow-sm p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              نوع الكيان
            </label>
            <select
              value={selectedEntityType || ""}
              onChange={(e) =>
                setSelectedEntityType(
                  (e.target.value || undefined) as EntityType
                )
              }
              className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300"
            >
              <option value="">الكل</option>
              {ENTITY_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setViewMode("month")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                viewMode === "month"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              عرض شهري
            </button>
            <button
              onClick={() => setViewMode("day")}
              disabled={!selectedDate}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                viewMode === "day" && selectedDate
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50"
              }`}
            >
              عرض يومي
            </button>
          </div>
        </div>
      </div>

      {/* Month View */}
      {viewMode === "month" && (
        <div className="rounded-xl bg-white border border-gray-200 shadow-sm p-6 space-y-6">
          {/* Month Navigation */}
          <div className="flex items-center justify-between">
            <button
              onClick={handlePrevMonth}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <ChevronRight size={20} />
              السابق
            </button>

            <h2 className="text-2xl font-semibold text-gray-900">
              {currentDate.toLocaleDateString("ar-EG", {
                month: "long",
                year: "numeric",
              })}
            </h2>

            <button
              onClick={handleNextMonth}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
            >
              التالي
              <ChevronLeft size={20} />
            </button>
          </div>

          {isLoadingMonth ? (
            <div className="flex items-center justify-center min-h-96">
              <Loader2 className="animate-spin text-blue-600" size={48} />
            </div>
          ) : (
            <>
              {/* Weekdays Header */}
              <div className="grid grid-cols-7 gap-2 mb-2">
                {WEEKDAYS_AR.map((day) => (
                  <div
                    key={day}
                    className="text-center font-semibold text-gray-700 text-sm py-2"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-2">
                {renderMonthCalendar()}
              </div>
            </>
          )}
        </div>
      )}

      {/* Day View */}
      {viewMode === "day" && selectedDate && (
        <div className="rounded-xl bg-white border border-gray-200 shadow-sm p-6 space-y-6">
          {/* Day Header */}
          <div className="flex items-center justify-between border-b pb-4">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">
                {selectedDate.toLocaleDateString("ar-EG", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                عدد الأحداث: {dayItems.length}
              </p>
            </div>

            <button
              onClick={() => {
                setSelectedDate(null);
                setViewMode("month");
              }}
              className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
            >
              العودة للشهر
            </button>
          </div>

          {isLoadingDay ? (
            <div className="flex items-center justify-center min-h-96">
              <Loader2 className="animate-spin text-blue-600" size={48} />
            </div>
          ) : dayItems.length === 0 ? (
            <div className="text-center py-12">
              <Calendar size={48} className="mx-auto text-gray-400 mb-3" />
              <p className="text-gray-600 font-medium">
                لا توجد أحداث في هذا اليوم
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {dayItems.map((item, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-lg border-l-4 ${getEntityColor(
                    item.entityType
                  )}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm">{item.name}</h3>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <span className="text-xs px-2 py-1 rounded-full bg-current bg-opacity-10">
                          ID: {item.entityId}
                        </span>
                        <span
                          className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(
                            item.status
                          )}`}
                        >
                          {item.status}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs font-semibold px-3 py-1 rounded-full bg-current bg-opacity-10">
                      {item.entityType}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
