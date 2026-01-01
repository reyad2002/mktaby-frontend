"use client";

import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { LucideIcon } from "lucide-react";
import {
  CalendarDays,
  Plus,
  X,
  Loader2,
  Edit,
  Trash2,
  AlertCircle,
  Calendar,
  Briefcase,
  Scale,
} from "lucide-react";
import toast from "react-hot-toast";

import {
  fetchSessionsList,
  fetchSessionTypes,
  fetchSessionStatuses,
  softDeleteSession,
} from "@/features/sessions/apis/sessionsApis";
import AddSessionForm from "@/features/sessions/components/AddSessionForm";
import EditSessionForm from "@/features/sessions/components/EditSessionForm";
import PageHeader from "@/shared/components/dashboard/PageHeader";
import type {
  GetSessionsQuery,
  SessionListItem,
  SessionTypeValue,
  SessionStatusValue,
} from "@/features/sessions/types/sessionsTypes";

const DEFAULT_FILTERS: GetSessionsQuery = {
  PageNumber: 1,
  PageSize: 10,
  Search: "",
  Sort: "",
  SessionType: undefined,
  SessionStatus: undefined,
  IsDeleted: false,
};

const SORT_OPTIONS = [
  { value: "", label: "بدون ترتيب" },
  { value: "sessionDate desc", label: "التاريخ (الأحدث)" },
  { value: "sessionDate asc", label: "التاريخ (الأقدم)" },
  { value: "createdAt desc", label: "الإنشاء (الأحدث)" },
  { value: "createdAt asc", label: "الإنشاء (الأقدم)" },
];

function LoadingState() {
  return (
    <div className="flex items-center justify-center min-h-[55vh]">
      <Loader2 className="animate-spin text-emerald-600" size={48} />
    </div>
  );
}

function ErrorState({ message }: { message?: string }) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
      <div className="flex items-center justify-center gap-2 text-red-700 font-medium">
        <AlertCircle size={18} />
        {message || "حدث خطأ أثناء جلب البيانات"}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-8 text-center shadow-sm">
      <p className="text-gray-800 font-medium">لا توجد جلسات مطابقة.</p>
      <p className="text-sm text-gray-600 mt-1">جرّب تغيير الفلاتر أو البحث.</p>
    </div>
  );
}

function Pill({
  icon: Icon,
  text,
  className = "",
}: {
  icon?: LucideIcon;
  text: string;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium border ${className}`}
    >
      {Icon ? <Icon size={12} /> : null}
      {text}
    </span>
  );
}

const formatSessionDate = (date: string) =>
  new Date(date).toLocaleDateString("ar-EG", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

export default function SessionsPage() {
  const [filters, setFilters] = useState<GetSessionsQuery>(DEFAULT_FILTERS);
  const [showAddSessionModal, setShowAddSessionModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editSessionId, setEditSessionId] = useState<number | null>(null);

  const queryClient = useQueryClient();

  const { data: sessionTypes = [] } = useQuery({
    queryKey: ["sessionTypes"],
    queryFn: fetchSessionTypes,
  });

  const { data: sessionStatuses = [] } = useQuery({
    queryKey: ["sessionStatuses"],
    queryFn: fetchSessionStatuses,
  });

  const softDeleteMutation = useMutation({
    mutationFn: softDeleteSession,
    onSuccess: () => {
      toast.success("تم حذف الجلسة بنجاح");
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err?.response?.data?.message || "حدث خطأ أثناء حذف الجلسة");
    },
  });

  const handleSoftDelete = (id: number, caseName: string) => {
    if (window.confirm(`هل تريد حذف جلسة القضية "${caseName}"؟`)) {
      softDeleteMutation.mutate(id);
    }
  };

  const queryParams = useMemo(() => {
    return {
      ...filters,
      Search: filters.Search?.trim() || undefined,
      Sort: filters.Sort || undefined,
      SessionType: filters.SessionType || undefined,
      SessionStatus: filters.SessionStatus || undefined,
      IsDeleted: filters.IsDeleted ? true : undefined,
    } satisfies GetSessionsQuery;
  }, [filters]);

  const { data, isLoading, isError, error, isFetching } = useQuery({
    queryKey: ["sessions", queryParams],
    queryFn: () => fetchSessionsList(queryParams),
  });

  const sessions: SessionListItem[] = data?.data?.data ?? [];
  const totalCount = data?.data?.count ?? 0;

  const pageNumber = filters.PageNumber ?? 1;
  const pageSize = filters.PageSize ?? 10;
  const totalPages = Math.max(1, Math.ceil(totalCount / (pageSize || 1)));

  const updateFilter = <K extends keyof GetSessionsQuery>(
    key: K,
    value: GetSessionsQuery[K]
  ) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      PageNumber: key === "Search" ? 1 : prev.PageNumber,
    }));
  };

  const handlePageChange = (nextPage: number) => {
    if (nextPage < 1 || nextPage > totalPages) return;
    setFilters((prev) => ({ ...prev, PageNumber: nextPage }));
  };

  const resetFilters = () => setFilters(DEFAULT_FILTERS);

  // ✅ White-theme pills (بدون تدرجات/سلايت)
  const getStatusPillClass = (status: string) => {
    const colors: Record<string, string> = {
      Scheduled: "bg-blue-50 text-blue-700 border-blue-200",
      InProgress: "bg-amber-50 text-amber-800 border-amber-200",
      Postponed: "bg-orange-50 text-orange-800 border-orange-200",
      Cancelled: "bg-red-50 text-red-800 border-red-200",
      AwaitingDecision: "bg-purple-50 text-purple-700 border-purple-200",
      Completed: "bg-emerald-50 text-emerald-800 border-emerald-200",
    };
    return colors[status] || "bg-gray-50 text-gray-700 border-gray-200";
  };

  const getTypePillClass = (type: string) => {
    const colors: Record<string, string> = {
      Preliminary: "bg-cyan-50 text-cyan-800 border-cyan-200",
      Hearing: "bg-blue-50 text-blue-700 border-blue-200",
      Trial: "bg-indigo-50 text-indigo-700 border-indigo-200",
      Sentencing: "bg-purple-50 text-purple-700 border-purple-200",
      Adjourned: "bg-gray-50 text-gray-700 border-gray-200",
      Investigation: "bg-amber-50 text-amber-800 border-amber-200",
      Appeal: "bg-orange-50 text-orange-800 border-orange-200",
      Review: "bg-teal-50 text-teal-800 border-teal-200",
      Execution: "bg-red-50 text-red-800 border-red-200",
      Mediation: "bg-emerald-50 text-emerald-800 border-emerald-200",
      Settlement: "bg-lime-50 text-lime-800 border-lime-200",
      Pleading: "bg-yellow-50 text-yellow-800 border-yellow-200",
      ClosingArguments: "bg-rose-50 text-rose-800 border-rose-200",
      ExpertReview: "bg-violet-50 text-violet-800 border-violet-200",
      Administrative: "bg-slate-50 text-slate-800 border-slate-200",
      Reconciliation: "bg-green-50 text-green-800 border-green-200",
    };
    return colors[type] || "bg-gray-50 text-gray-700 border-gray-200";
  };

  return (
    <section className="space-y-6">
      <PageHeader
        title="الجلسات"
        subtitle="إدارة ومتابعة جلسات القضايا والمواعيد."
        icon={CalendarDays}
        countLabel={`${totalCount} جلسة`}
        onAdd={() => setShowAddSessionModal(true)}
        addButtonLabel="إضافة جلسة"
        isFetching={isFetching}
      />

      {/* Filters (White Card) */}
      <div className="rounded-xl bg-white border border-gray-200 shadow-sm p-4 sm:p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 text-gray-700 text-sm border border-gray-200">
            <span
              className="h-2 w-2 rounded-full bg-emerald-600 animate-pulse"
              aria-hidden
            />
            فلاتر
          </div>

          <button
            type="button"
            onClick={resetFilters}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 bg-white text-gray-700 text-sm hover:bg-gray-50 transition-colors"
          >
            <span className="h-2 w-2 rounded-full bg-emerald-600" aria-hidden />
            إعادة ضبط الفلاتر
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search */}
          <label className="flex flex-col gap-2 text-sm">
            <span className="text-gray-700 font-medium">بحث</span>
            <input
              type="text"
              value={filters.Search ?? ""}
              onChange={(e) => updateFilter("Search", e.target.value)}
              placeholder="ابحث بالقضية أو المحكمة"
              className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-300"
            />
          </label>

          {/* Session Type */}
          <label className="flex flex-col gap-2 text-sm">
            <span className="text-gray-700 font-medium">نوع الجلسة</span>
            <select
              value={filters.SessionType || ""}
              onChange={(e) =>
                updateFilter(
                  "SessionType",
                  (e.target.value as SessionTypeValue) || undefined
                )
              }
              className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-300"
            >
              <option value="">الكل</option>
              {sessionTypes.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </label>

          {/* Session Status */}
          <label className="flex flex-col gap-2 text-sm">
            <span className="text-gray-700 font-medium">حالة الجلسة</span>
            <select
              value={filters.SessionStatus || ""}
              onChange={(e) =>
                updateFilter(
                  "SessionStatus",
                  (e.target.value as SessionStatusValue) || undefined
                )
              }
              className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-300"
            >
              <option value="">الكل</option>
              {sessionStatuses.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>

          {/* Sort */}
          <label className="flex flex-col gap-2 text-sm">
            <span className="text-gray-700 font-medium">الترتيب</span>
            <select
              value={filters.Sort || ""}
              onChange={(e) => updateFilter("Sort", e.target.value)}
              className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-300"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>

          {/* Page Size */}
          <label className="flex flex-col gap-2 text-sm">
            <span className="text-gray-700 font-medium">عدد العناصر</span>
            <div className="grid grid-cols-4 gap-2">
              {[5, 10, 20, 50].map((size) => {
                const active = pageSize === size;
                return (
                  <button
                    key={size}
                    type="button"
                    onClick={() => updateFilter("PageSize", size)}
                    className={`rounded-lg px-2 py-2 text-sm border transition-colors ${
                      active
                        ? "bg-gray-900 text-white border-gray-900"
                        : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
          </label>
        </div>

        {isError && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            حدث خطأ أثناء جلب البيانات:{" "}
            {error instanceof Error ? error.message : ""}
          </div>
        )}
      </div>

      {/* Table / States */}
      {isLoading ? (
        <LoadingState />
      ) : isError ? (
        <ErrorState
          message={error instanceof Error ? error.message : undefined}
        />
      ) : sessions.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="rounded-xl bg-white border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr className="text-right text-sm text-gray-700">
                  <th className="px-4 py-3 font-semibold">تاريخ الجلسة</th>
                  <th className="px-4 py-3 font-semibold">نوع الجلسة</th>
                  <th className="px-4 py-3 font-semibold">حالة الجلسة</th>
                  <th className="px-4 py-3 font-semibold">القضية</th>
                  <th className="px-4 py-3 font-semibold">المحكمة</th>
                  <th className="px-4 py-3 font-semibold">الملاحظات</th>
                  <th className="px-4 py-3 font-semibold">الإجراءات</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200">
                {sessions.map((session) => (
                  <tr
                    key={session.id}
                    className="text-sm text-gray-800 hover:bg-gray-50 transition-colors"
                  >
                    {/* Date */}
                    <td className="px-4 py-3 min-w-[220px]">
                      {session.sessionDate ? (
                        <span className="inline-flex items-center gap-2 text-gray-800">
                          <Calendar size={14} className="text-emerald-600" />
                          {formatSessionDate(session.sessionDate)}
                        </span>
                      ) : (
                        <span className="text-gray-500">—</span>
                      )}
                    </td>

                    {/* Type */}
                    <td className="px-4 py-3">
                      <Pill
                        icon={Scale}
                        text={session.sessionType?.label || "—"}
                        className={getTypePillClass(
                          session.sessionType?.value || ""
                        )}
                      />
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      <Pill
                        text={session.sessionStatus?.label || "—"}
                        className={getStatusPillClass(
                          session.sessionStatus?.value || ""
                        )}
                      />
                    </td>

                    {/* Case */}
                    <td className="px-4 py-3 min-w-[260px]">
                      <div className="flex items-center gap-2">
                        <Briefcase
                          size={14}
                          className="text-blue-600 shrink-0"
                        />
                        <span
                          className="font-semibold text-gray-900 truncate"
                          title={session.caseName}
                        >
                          {session.caseName}
                        </span>
                        <span
                          className="text-xs text-gray-500 shrink-0"
                          dir="ltr"
                        >
                          ({session.caseNumber})
                        </span>
                      </div>
                    </td>

                    {/* Court */}
                    <td className="px-4 py-3 min-w-[180px]">
                      <span
                        className="text-gray-700 truncate block"
                        title={session.court}
                      >
                        {session.court || "—"}
                      </span>
                    </td>

                    {/* Notes */}
                    <td className="px-4 py-3 max-w-[260px]">
                      <span
                        className="text-gray-700 line-clamp-2"
                        title={session.notes || ""}
                      >
                        {session.notes || "—"}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setEditSessionId(session.id);
                            setShowEditModal(true);
                          }}
                          className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium border border-cyan-200 bg-cyan-50 text-cyan-800 hover:bg-cyan-100 transition-colors"
                        >
                          <Edit size={14} />
                          تعديل
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleSoftDelete(session.id, session.caseName)
                          }
                          disabled={softDeleteMutation.isPending}
                          className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium border border-red-200 bg-red-50 text-red-800 hover:bg-red-100 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                          title="حذف الجلسة"
                        >
                          {softDeleteMutation.isPending ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <Trash2 size={14} />
                          )}
                          حذف
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination (White) */}
      <div className="rounded-xl bg-white border border-gray-200 shadow-sm px-4 py-3 flex flex-wrap items-center justify-between gap-3 text-sm text-gray-700">
        <div>
          صفحة {pageNumber} من {totalPages}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handlePageChange(pageNumber - 1)}
            disabled={pageNumber <= 1}
            className="px-3 py-2 rounded-lg border border-gray-200 bg-white text-gray-700 disabled:opacity-50 hover:bg-gray-50 transition-colors"
          >
            السابق
          </button>
          <button
            onClick={() => handlePageChange(pageNumber + 1)}
            disabled={pageNumber >= totalPages}
            className="px-3 py-2 rounded-lg border border-gray-200 bg-white text-gray-700 disabled:opacity-50 hover:bg-gray-50 transition-colors"
          >
            التالي
          </button>
        </div>
      </div>

      {/* Add Modal */}
      {showAddSessionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowAddSessionModal(false)}
          />
          <div className="relative w-full max-w-4xl mx-4 bg-white rounded-2xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <Plus className="text-emerald-600" size={22} />
                إضافة جلسة جديدة
              </h2>
              <button
                type="button"
                onClick={() => setShowAddSessionModal(false)}
                className="p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <AddSessionForm
              onSuccess={() => setShowAddSessionModal(false)}
              onCancel={() => setShowAddSessionModal(false)}
            />
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editSessionId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => {
              setShowEditModal(false);
              setEditSessionId(null);
            }}
          />
          <div className="relative w-full max-w-4xl mx-4 bg-white rounded-2xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <Edit className="text-cyan-600" size={22} />
                تعديل الجلسة
              </h2>
              <button
                type="button"
                onClick={() => {
                  setShowEditModal(false);
                  setEditSessionId(null);
                }}
                className="p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <EditSessionForm
              sessionId={editSessionId}
              onSuccess={() => {
                setShowEditModal(false);
                setEditSessionId(null);
              }}
              onCancel={() => {
                setShowEditModal(false);
                setEditSessionId(null);
              }}
            />
          </div>
        </div>
      )}
    </section>
  );
}
