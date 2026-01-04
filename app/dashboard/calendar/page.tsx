"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Loader2,
  SlidersHorizontal,
  RefreshCw,
  Info,
  CalendarDays,
  ChevronDown,
} from "lucide-react";
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
    Active: "bg-emerald-50 text-emerald-800 border-emerald-200",
    UnderReview: "bg-yellow-50 text-yellow-800 border-yellow-200",
    UnderInvestigation: "bg-orange-50 text-orange-800 border-orange-200",
    ReadyForHearing: "bg-blue-50 text-blue-800 border-blue-200",
    InCourt: "bg-purple-50 text-purple-800 border-purple-200",
    Postponed: "bg-gray-50 text-gray-800 border-gray-200",
    ReservedForJudgment: "bg-indigo-50 text-indigo-800 border-indigo-200",
    Completed: "bg-emerald-50 text-emerald-800 border-emerald-200",
    Closed: "bg-slate-50 text-slate-800 border-slate-200",
    Rejected: "bg-red-50 text-red-800 border-red-200",
    Cancelled: "bg-rose-50 text-rose-800 border-rose-200",
    Settled: "bg-teal-50 text-teal-800 border-teal-200",
    Suspended: "bg-amber-50 text-amber-800 border-amber-200",
    Archived: "bg-zinc-50 text-zinc-800 border-zinc-200",
    Appealed: "bg-cyan-50 text-cyan-800 border-cyan-200",
    Executed: "bg-lime-50 text-lime-800 border-lime-200",
    Pending: "bg-blue-50 text-blue-700 border-blue-200",
    InProgress: "bg-blue-50 text-blue-800 border-blue-200",
    Done: "bg-emerald-50 text-emerald-800 border-emerald-200",
  };
  return colors[status] || "bg-gray-50 text-gray-800 border-gray-200";
}

const getEntityColor = (entityType: EntityType): string => {
  const colors: Record<EntityType, string> = {
    Case: "bg-blue-50 text-blue-700 border-blue-200",
    Session: "bg-purple-50 text-purple-700 border-purple-200",
    Task: "bg-emerald-50 text-emerald-700 border-emerald-200",
    Client: "bg-cyan-50 text-cyan-700 border-cyan-200",
    ApplicationUser: "bg-orange-50 text-orange-700 border-orange-200",
    CompanyEmployee: "bg-pink-50 text-pink-700 border-pink-200",
    Office: "bg-indigo-50 text-indigo-700 border-indigo-200",
    Folder: "bg-amber-50 text-amber-700 border-amber-200",
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (colors as any)[entityType] || "bg-gray-50 text-gray-700 border-gray-200";
};

function LoadingState() {
  return (
    <div className="flex items-center justify-center min-h-[55vh]">
      <Loader2 className="animate-spin text-blue-600" size={48} />
    </div>
  );
}

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

  const {
    data: monthData,
    isLoading: isLoadingMonth,
    isFetching: isFetchingMonth,
    refetch: refetchMonth,
    isError: isMonthError,
    error: monthError,
  } = useQuery({
    queryKey: ["calendar-month", currentDate, selectedEntityType],
    queryFn: () =>
      getMonthEventsApi({
        startDate: monthStart.toISOString(),
        endDate: monthEnd.toISOString(),
        entityType: selectedEntityType,
      }),
  });

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
    refetch: refetchDay,
    isError: isDayError,
    error: dayError,
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

  const monthItems: CalendarMonthItemDto[] = useMemo(
    () => monthData?.data || [],
    [monthData]
  );

  const dayItems: CalendarDayItemDto[] = useMemo(
    () => dayData?.data || [],
    [dayData]
  );

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

    const days: React.ReactNode[] = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(
        <div
          key={`empty-${i}`}
          className="min-h-24 rounded-2xl bg-gray-50/60 border border-gray-200/70"
        />
      );
    }

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
          className={[
            "min-h-24 p-3 rounded-2xl border transition-all text-right",
            "hover:shadow-[0_16px_35px_-22px_rgba(0,0,0,0.55)]",
            "focus:outline-none focus:ring-4 focus:ring-blue-200/70",
            isSelected
              ? "bg-blue-50/70 border-blue-300"
              : isToday
              ? "bg-amber-50/70 border-amber-300"
              : "bg-white/90 border-gray-200/70 hover:border-gray-300",
          ].join(" ")}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex flex-col items-start gap-2">
              {eventCount > 0 ? (
                <span className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold border bg-blue-50 text-blue-700 border-blue-200">
                  {eventCount} حدث
                </span>
              ) : (
                <span className="text-xs text-gray-400">—</span>
              )}
            </div>

            <div className="flex flex-col items-end">
              <span
                className={[
                  "text-sm font-semibold",
                  isToday ? "text-amber-700" : "text-gray-900",
                ].join(" ")}
              >
                {day}
              </span>
              {isToday && (
                <span className="text-[11px] font-medium text-amber-700">
                  اليوم
                </span>
              )}
            </div>
          </div>
        </button>
      );
    }

    return days;
  };

  const monthTitle = currentDate.toLocaleDateString("ar-EG", {
    month: "long",
    year: "numeric",
  });

  return (
    <section className="space-y-6 relative">
      {/* Premium background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-blue-200/40 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-indigo-200/40 blur-3xl" />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-50 via-white to-white" />
      </div>

      {/* Header */}
      <PageHeader
        title="التقويم"
        subtitle="عرض أحداث القضايا والجلسات والمهام على التقويم الشهري."
        icon={Calendar}
        isFetching={isFetchingMonth || isFetchingDay}
      />

      {/* Controls (Premium) */}
      <div className="rounded-2xl bg-white/90 backdrop-blur border border-gray-200/70 shadow-[0_10px_30px_-18px_rgba(0,0,0,0.35)] ring-1 ring-gray-200/50 overflow-hidden">
        <div className="px-4 sm:px-5 py-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3 relative">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-500" />

          <div className="flex items-center gap-2 text-sm font-medium text-gray-800">
            <span className="inline-flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200/60 shadow-sm">
              <SlidersHorizontal size={16} className="text-blue-700" />
            </span>
            الفلاتر والتحكم
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                refetchMonth();
                if (selectedDate) refetchDay();
              }}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <RefreshCw
                size={16}
                className={isFetchingMonth || isFetchingDay ? "animate-spin" : ""}
              />
              تحديث
            </button>

            <div className="flex gap-2">
              <button
                onClick={() => setViewMode("month")}
                className={`px-4 py-2 rounded-xl font-medium transition-colors border ${
                  viewMode === "month"
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                }`}
              >
                عرض شهري
              </button>

              <button
                onClick={() => setViewMode("day")}
                disabled={!selectedDate}
                className={`px-4 py-2 rounded-xl font-medium transition-colors border ${
                  viewMode === "day" && selectedDate
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50 disabled:opacity-50"
                }`}
              >
                عرض يومي
              </button>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <label className="text-sm">
              <span className="block text-gray-700 font-medium mb-2">
                نوع الكيان
              </span>
              <div className="relative">
                <select
                  value={selectedEntityType || ""}
                  onChange={(e) =>
                    setSelectedEntityType(
                      (e.target.value || undefined) as EntityType
                    )
                  }
                  className="w-full appearance-none rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-4 focus:ring-blue-200/70 focus:border-blue-300"
                >
                  <option value="">الكل</option>
                  {ENTITY_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                />
              </div>
            </label>

            <div className="text-sm flex items-end">
              <div className="w-full rounded-xl border border-gray-200 bg-gray-50/60 px-4 py-3">
                <div className="flex items-center gap-2 text-gray-700">
                  <CalendarDays size={16} className="text-blue-700" />
                  <span className="font-medium">الشهر الحالي:</span>
                  <span className="text-gray-900 font-semibold">{monthTitle}</span>
                </div>
                {selectedDate && (
                  <div className="mt-1 text-xs text-gray-600">
                    اليوم المحدد:{" "}
                    <span className="font-semibold text-gray-900">
                      {selectedDate.toLocaleDateString("ar-EG")}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {(isMonthError || isDayError) && (
            <div className="mt-4 flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 px-3 py-2 rounded-xl">
              <Info size={16} />
              حدث خطأ:{" "}
              {monthError instanceof Error
                ? monthError.message
                : dayError instanceof Error
                ? dayError.message
                : ""}
            </div>
          )}
        </div>
      </div>

      {/* Month View */}
      {viewMode === "month" && (
        <div className="rounded-2xl bg-white/90 backdrop-blur border border-gray-200/70 shadow-[0_10px_30px_-18px_rgba(0,0,0,0.35)] ring-1 ring-gray-200/50 overflow-hidden">
          <div className="px-4 sm:px-5 py-4 border-b border-gray-100 flex items-center justify-between gap-3">
            <button
              onClick={handlePrevMonth}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              <ChevronRight size={18} />
              السابق
            </button>

            <h2 className="text-lg sm:text-2xl font-semibold text-gray-900">
              {monthTitle}
            </h2>

            <button
              onClick={handleNextMonth}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              التالي
              <ChevronLeft size={18} />
            </button>
          </div>

          {isLoadingMonth ? (
            <LoadingState />
          ) : (
            <div className="p-4 sm:p-5 space-y-3">
              <div className="grid grid-cols-7 gap-2">
                {WEEKDAYS_AR.map((day) => (
                  <div
                    key={day}
                    className="text-center font-semibold text-gray-700 text-xs sm:text-sm py-2"
                  >
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-2">
                {renderMonthCalendar()}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Day View */}
      {viewMode === "day" && selectedDate && (
        <div className="rounded-2xl bg-white/90 backdrop-blur border border-gray-200/70 shadow-[0_10px_30px_-18px_rgba(0,0,0,0.35)] ring-1 ring-gray-200/50 overflow-hidden">
          <div className="px-4 sm:px-5 py-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg sm:text-2xl font-semibold text-gray-900">
                {selectedDate.toLocaleDateString("ar-EG", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                عدد الأحداث:{" "}
                <span className="font-semibold text-gray-900">
                  {dayItems.length}
                </span>
              </p>
            </div>

            <button
              onClick={() => {
                setSelectedDate(null);
                setViewMode("month");
              }}
              className="px-4 py-2 rounded-xl border border-gray-200 text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              العودة للشهر
            </button>
          </div>

          {isLoadingDay ? (
            <LoadingState />
          ) : dayItems.length === 0 ? (
            <div className="p-10 text-center">
              <div className="w-12 h-12 rounded-2xl border border-gray-200 bg-gray-50 flex items-center justify-center mx-auto mb-3">
                <Calendar size={20} className="text-gray-500" />
              </div>
              <p className="text-gray-700 font-semibold">
                لا توجد أحداث في هذا اليوم
              </p>
              <p className="text-sm text-gray-500 mt-1">
                جرّب اختيار يوم آخر أو تغيير نوع الكيان.
              </p>
            </div>
          ) : (
            <div className="p-4 sm:p-5 space-y-3">
              {dayItems.map((item, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-gray-200/70 bg-white shadow-sm overflow-hidden"
                >
                  <div className="p-4 flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold border ${getEntityColor(
                            item.entityType
                          )}`}
                        >
                          {ENTITY_TYPES.find((x) => x.value === item.entityType)
                            ?.label || item.entityType}
                        </span>

                        <span className="text-xs text-gray-500" dir="ltr">
                          ID: {item.entityId}
                        </span>
                      </div>

                      <h3 className="mt-2 font-semibold text-gray-900 text-sm sm:text-base truncate">
                        {item.name}
                      </h3>

                      <div className="mt-3 flex flex-wrap gap-2">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                            item.status
                          )}`}
                        >
                          {item.status}
                        </span>
                      </div>
                    </div>

                    <div className="shrink-0">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border border-gray-200 bg-gray-50 text-gray-700">
                        {item.entityType}
                      </span>
                    </div>
                  </div>

                  <div className="h-1 bg-gradient-to-r from-blue-500/70 via-indigo-500/70 to-cyan-500/70" />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
