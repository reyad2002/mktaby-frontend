"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { LucideIcon } from "lucide-react";
import {
  CheckSquare,
  X,
  Loader2,
  Edit,
  Archive,
  Flag,
  Clock,
  CheckCircle,
  AlertCircle,
  Search,
  SlidersHorizontal,
  RefreshCw,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Info,
  ListChecks,
  Eye,
  FileText,
  Calendar,
  User,
} from "lucide-react";
import toast from "react-hot-toast";

import {
  fetchTasksApi,
  softDeleteTaskApi,
  fetchTaskDashboardApi,
} from "@/features/tasks/apis/tasksApis";
import AddTaskForm from "@/features/tasks/components/AddTaskForm";
import EditTaskForm from "@/features/tasks/components/EditTaskForm";
import PageHeader from "@/shared/components/dashboard/PageHeader";
import type {
  GetTasksQuery,
  TaskDto,
  TaskPriority,
  TaskStatus,
} from "@/features/tasks/types/taskTypes";

const DEFAULT_FILTERS: GetTasksQuery = {
  pageNumber: 1,
  pageSize: 10,
  search: "",
  sort: "",
  priority: undefined,
  statuses: undefined,
  isDeleted: false,
};

const SORT_OPTIONS = [
  { value: "", label: "بدون ترتيب" },
  { value: "createdAt desc", label: "الأحدث أولاً" },
  { value: "createdAt asc", label: "الأقدم أولاً" },
  { value: "dueDate asc", label: "تاريخ الاستحقاق (الأقرب)" },
  { value: "dueDate desc", label: "تاريخ الاستحقاق (الأبعد)" },
  { value: "title asc", label: "العنوان (أ-ي)" },
  { value: "title desc", label: "العنوان (ي-أ)" },
];

const PRIORITY_OPTIONS: { value: TaskPriority; label: string }[] = [
  { value: "Low", label: "منخفضة" },
  { value: "Normal", label: "عادية" },
  { value: "High", label: "عالية" },
];

const STATUS_OPTIONS: { value: TaskStatus; label: string }[] = [
  { value: "Pending", label: "قيد الانتظار" },
  { value: "InProgress", label: "قيد التنفيذ" },
  { value: "OnHold", label: "معلقة" },
  { value: "Overdue", label: "متأخرة" },
  { value: "Completed", label: "مكتملة" },
  { value: "Cancelled", label: "ملغاة" },
];

function useLockBodyScroll(locked: boolean) {
  useEffect(() => {
    if (!locked) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [locked]);
}

function ModalShell({
  title,
  icon: Icon,
  iconClassName = "text-blue-700",
  onClose,
  children,
}: {
  title: string;
  icon?: LucideIcon;
  iconClassName?: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-2xl mx-4 bg-white rounded-2xl border border-gray-200 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur border-b border-gray-100 px-6 py-4 flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center gap-2">
            {Icon ? (
              <span className="inline-flex items-center justify-center w-10 h-10 rounded-2xl bg-linear-to-br from-blue-50 to-indigo-50 border border-blue-200/60 shadow-sm">
                <Icon size={18} className={iconClassName} />
              </span>
            ) : null}
            {title}
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-gray-100 text-gray-600 transition-colors"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

function IconButton({
  title,
  onClick,
  disabled,
  variant = "neutral",
  children,
}: {
  title: string;
  onClick: () => void;
  disabled?: boolean;
  variant?: "neutral" | "green" | "orange" | "red" | "blue" | "purple";
  children: React.ReactNode;
}) {
  const variants: Record<string, string> = {
    neutral:
      "border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-300",
    blue: "border-blue-200/70 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:border-blue-300",
    green:
      "border-emerald-200/70 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:border-emerald-300",
    orange:
      "border-orange-200/70 bg-orange-50 text-orange-700 hover:bg-orange-100 hover:border-orange-300",
    red: "border-red-200/70 bg-red-50 text-red-700 hover:bg-red-100 hover:border-red-300",
    purple:
      "border-purple-200/70 bg-purple-50 text-purple-700 hover:bg-purple-100 hover:border-purple-300",
  };

  const glow: Record<string, string> = {
    neutral: "hover:shadow-sm",
    blue: "hover:shadow-[0_10px_25px_-15px_rgba(59,130,246,0.7)]",
    green: "hover:shadow-[0_10px_25px_-15px_rgba(16,185,129,0.7)]",
    orange: "hover:shadow-[0_10px_25px_-15px_rgba(249,115,22,0.7)]",
    red: "hover:shadow-[0_10px_25px_-15px_rgba(239,68,68,0.7)]",
    purple: "hover:shadow-[0_10px_25px_-15px_rgba(168,85,247,0.7)]",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={[
        "group inline-flex items-center justify-center w-10 h-10 rounded-2xl border transition-all",
        "focus:outline-none focus:ring-4 focus:ring-blue-200/70",
        "active:scale-[0.98]",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        variants[variant],
        glow[variant],
      ].join(" ")}
    >
      <span className="transition-transform group-hover:scale-[1.06]">
        {children}
      </span>
    </button>
  );
}

function LoadingState() {
  return (
    <div className="flex items-center justify-center min-h-[55vh]">
      <Loader2 className="animate-spin text-blue-600" size={48} />
    </div>
  );
}

function ErrorState({ message }: { message?: string }) {
  return (
    <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
      <div className="flex items-center justify-center gap-2 text-red-700 font-medium">
        <AlertCircle size={18} />
        {message || "حدث خطأ أثناء جلب البيانات"}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-sm">
      <div className="mx-auto max-w-sm">
        <div className="w-12 h-12 rounded-2xl border border-gray-200 bg-gray-50 flex items-center justify-center mx-auto mb-3">
          <ListChecks className="text-gray-500" size={20} />
        </div>
        <p className="text-gray-800 font-semibold">لا توجد مهام مطابقة.</p>
        <p className="text-sm text-gray-600 mt-1">
          جرّب تغيير الفلاتر أو البحث.
        </p>
      </div>
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
      className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold border ${className}`}
    >
      {Icon ? <Icon size={12} /> : null}
      {text}
    </span>
  );
}

export default function TasksPage() {
  const [filters, setFilters] = useState<GetTasksQuery>(DEFAULT_FILTERS);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editTaskId, setEditTaskId] = useState<number | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskDto | null>(null);

  useLockBodyScroll(showAddTaskModal || showEditModal || showViewModal);

  const queryClient = useQueryClient();

  // Dashboard Stats
  const {
    data: dashboardData,
    isFetching: isFetchingDashboard,
    refetch: refetchDashboard,
  } = useQuery({
    queryKey: ["taskDashboard"],
    queryFn: () => fetchTaskDashboardApi(),
    staleTime: 10_000,
  });

  const dashboard = dashboardData?.data;

  // Soft delete
  const softDeleteMutation = useMutation({
    mutationFn: softDeleteTaskApi,
    onSuccess: (response) => {
      if (response?.data?.succeeded) {
        toast.success(response.data.message || "تم أرشفة المهمة بنجاح");
        queryClient.invalidateQueries({ queryKey: ["tasks"] });
        queryClient.invalidateQueries({ queryKey: ["taskDashboard"] });
      } else {
        toast.error(response?.data?.message || "تعذر أرشفة المهمة");
      }
    },
    onError: (error: unknown) => {
      const err = error as {
        response?: {
          data?: { message?: string; errors?: Record<string, string[]> };
        };
      };
      toast.error(err?.response?.data?.message || "حدث خطأ أثناء أرشفة المهمة");
    },
  });

  const handleSoftDelete = (id: number, title: string) => {
    if (
      window.confirm(`هل تريد أرشفة المهمة "${title}"؟\nيمكن استعادتها لاحقاً.`)
    ) {
      softDeleteMutation.mutate(id);
    }
  };

  const queryParams = useMemo(() => {
    return {
      ...filters,
      search: filters.search?.trim() || undefined,
      sort: filters.sort || undefined,
      priority: filters.priority || undefined,
      statuses: filters.statuses || undefined,
      isDeleted: filters.isDeleted ? true : undefined,
    } satisfies GetTasksQuery;
  }, [filters]);

  // Tasks list
  const { data, isLoading, isError, error, isFetching, refetch } = useQuery({
    queryKey: ["tasks", queryParams],
    queryFn: () => fetchTasksApi(queryParams),
    staleTime: 10_000,
  });

  const tasks: TaskDto[] = data?.data?.data?.data ?? [];
  const totalCount = data?.data?.data?.count ?? 0;

  const pageNumber = filters.pageNumber ?? 1;
  const pageSize = filters.pageSize ?? 10;
  const totalPages = Math.max(1, Math.ceil(totalCount / (pageSize || 1)));

  const updateFilter = <K extends keyof GetTasksQuery>(
    key: K,
    value: GetTasksQuery[K]
  ) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      pageNumber: key === "search" || key === "pageSize" ? 1 : prev.pageNumber,
    }));
  };

  const handlePageChange = (nextPage: number) => {
    if (nextPage < 1 || nextPage > totalPages) return;
    setFilters((prev) => ({ ...prev, pageNumber: nextPage }));
  };

  const resetFilters = () => setFilters(DEFAULT_FILTERS);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      Pending: "bg-yellow-50 text-yellow-800 border-yellow-200",
      InProgress: "bg-blue-50 text-blue-800 border-blue-200",
      OnHold: "bg-gray-50 text-gray-800 border-gray-200",
      Overdue: "bg-red-50 text-red-800 border-red-200",
      Completed: "bg-emerald-50 text-emerald-800 border-emerald-200",
      Cancelled: "bg-rose-50 text-rose-800 border-rose-200",
    };
    return colors[status] || "bg-gray-50 text-gray-800 border-gray-200";
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      Low: "bg-emerald-50 text-emerald-800 border-emerald-200",
      Normal: "bg-blue-50 text-blue-800 border-blue-200",
      High: "bg-red-50 text-red-800 border-red-200",
    };
    return colors[priority] || "bg-gray-50 text-gray-800 border-gray-200";
  };

  const getStatusIcon = (status: string) => {
    const icons: Record<string, React.ReactNode> = {
      Pending: <Clock size={12} />,
      InProgress: <Clock size={12} />,
      OnHold: <Clock size={12} />,
      Overdue: <AlertCircle size={12} />,
      Completed: <CheckCircle size={12} />,
      Cancelled: <AlertCircle size={12} />,
    };
    return icons[status] || <Clock size={12} />;
  };

  const getPriorityIcon = (priority: string) => {
    const icons: Record<string, React.ReactNode> = {
      Low: <Flag size={12} className="text-emerald-300" />,
      Normal: <Flag size={12} className="text-blue-300" />,
      High: <Flag size={12} className="text-red-300" />,
    };
    return icons[priority] || <Flag size={12} />;
  };

  return (
    <section className="space-y-6 relative">
      {/* Soft premium background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-blue-200/40 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-indigo-200/40 blur-3xl" />
        <div className="absolute inset-0 bg-linear-to-b from-slate-50 via-white to-white" />
      </div>

      {/* Header */}
      <PageHeader
        title="المهام"
        subtitle="إدارة ومتابعة المهام والأعمال اليومية"
        icon={CheckSquare}
        isFetching={isFetching}
        countLabel={`${totalCount} مهمة`}
        onAdd={() => setShowAddTaskModal(true)}
        addButtonLabel="مهمة جديدة"
      />

      {/* Dashboard Stats (Premium cards) */}
      {/* {dashboard && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              label: "إجمالي المهام",
              value: dashboard.totalTasks,
              icon: CheckSquare,
              tone: "blue",
            },
            {
              label: "مكتملة",
              value: dashboard.completedTasks,
              icon: CheckCircle,
              tone: "green",
            },
            {
              label: "غير مكتملة",
              value: dashboard.uncompletedTasks,
              icon: Clock,
              tone: "orange",
            },
            {
              label: "متأخرة",
              value: dashboard.overdueTasks,
              icon: AlertCircle,
              tone: "red",
            },
          ].map((card, idx) => {
            const tones: Record<
              string,
              { bg: string; border: string; iconBg: string; iconText: string }
            > = {
              blue: {
                bg: "bg-white/90",
                border: "border-gray-200/70",
                iconBg: "from-blue-50 to-indigo-50",
                iconText: "text-blue-700",
              },
              green: {
                bg: "bg-white/90",
                border: "border-gray-200/70",
                iconBg: "from-emerald-50 to-teal-50",
                iconText: "text-emerald-700",
              },
              orange: {
                bg: "bg-white/90",
                border: "border-gray-200/70",
                iconBg: "from-orange-50 to-amber-50",
                iconText: "text-orange-700",
              },
              red: {
                bg: "bg-white/90",
                border: "border-gray-200/70",
                iconBg: "from-red-50 to-rose-50",
                iconText: "text-red-700",
              },
            };

            const t = tones[card.tone];
            const Icon = card.icon;

            return (
              <div
                key={idx}
                className={[
                  "rounded-2xl border backdrop-blur",
                  t.bg,
                  t.border,
                  "shadow-[0_10px_30px_-18px_rgba(0,0,0,0.35)] ring-1 ring-gray-200/50",
                  "p-4 transition-all hover:shadow-[0_18px_40px_-22px_rgba(0,0,0,0.45)]",
                ].join(" ")}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={[
                      "w-11 h-11 rounded-2xl border border-gray-200/70 shadow-sm",
                      "bg-linear-to-br",
                      t.iconBg,
                      "flex items-center justify-center",
                    ].join(" ")}
                  >
                    <Icon className={t.iconText} size={18} />
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs text-gray-600">{card.label}</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {card.value}
                    </p>
                  </div>

                  <div className="ml-auto flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        refetchDashboard();
                        refetch();
                      }}
                      className="inline-flex items-center gap-2 px-2.5 py-2 text-xs rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 transition-colors"
                      title="تحديث"
                    >
                      <RefreshCw
                        size={14}
                        className={isFetchingDashboard ? "animate-spin" : ""}
                      />
                      تحديث
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )} */}

      {/* Filters (Cases UI) */}
      <div className="rounded-2xl bg-white/90 backdrop-blur border border-gray-200/70 shadow-[0_10px_30px_-18px_rgba(0,0,0,0.35)] ring-1 ring-gray-200/50 overflow-hidden">
        <div className="px-4 sm:px-5 py-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3 relative">
          <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-blue-500 via-indigo-500 to-cyan-500" />

          <div className="flex items-center gap-2 text-sm font-medium text-gray-800">
            <span className="inline-flex items-center justify-center w-10 h-10 rounded-2xl bg-linear-to-br from-blue-50 to-indigo-50 border border-blue-200/60 shadow-sm">
              <SlidersHorizontal size={16} className="text-blue-700" />
            </span>
            البحث والفلترة
            <span className="text-gray-500 font-normal">
              • {totalCount} نتيجة
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => refetch()}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <RefreshCw
                size={16}
                className={isFetching ? "animate-spin" : ""}
              />
              تحديث
            </button>

            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-xl transition-colors border border-gray-200 bg-white"
            >
              إعادة ضبط
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-5">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
            {/* Search */}
            <div className="lg:col-span-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                بحث
              </label>
              <div className="relative">
                <Search
                  size={16}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  value={filters.search ?? ""}
                  onChange={(e) => updateFilter("search", e.target.value)}
                  placeholder="ابحث بالعنوان..."
                  className="w-full pr-9 pl-3 py-2.5 border border-gray-200 rounded-xl text-gray-700 bg-white focus:outline-none focus:ring-4 focus:ring-blue-200/70 focus:border-blue-300"
                />
              </div>
            </div>

            {/* Priority */}
            <div className="lg:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الأولوية
              </label>
              <div className="relative">
                <select
                  value={filters.priority || ""}
                  onChange={(e) =>
                    updateFilter(
                      "priority",
                      (e.target.value as TaskPriority) || undefined
                    )
                  }
                  className="w-full appearance-none px-3 py-2.5 border border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:ring-4 focus:ring-blue-200/70 focus:border-blue-300 bg-white"
                >
                  <option value="">الكل</option>
                  {PRIORITY_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                />
              </div>
            </div>

            {/* Status */}
            <div className="lg:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الحالة
              </label>
              <div className="relative">
                <select
                  value={filters.statuses?.[0] || ""}
                  onChange={(e) =>
                    updateFilter(
                      "statuses",
                      e.target.value
                        ? [e.target.value as TaskStatus]
                        : undefined
                    )
                  }
                  className="w-full appearance-none px-3 py-2.5 border border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:ring-4 focus:ring-blue-200/70 focus:border-blue-300 bg-white"
                >
                  <option value="">الكل</option>
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                />
              </div>
            </div>

            {/* Sort */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الترتيب
              </label>
              <div className="relative">
                <select
                  value={filters.sort || ""}
                  onChange={(e) => updateFilter("sort", e.target.value)}
                  className="w-full appearance-none px-3 py-2.5 border border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:ring-4 focus:ring-blue-200/70 focus:border-blue-300 bg-white"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                />
              </div>
            </div>

            {/* Page size + Deleted toggle */}
            <div className="lg:col-span-12">
              <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm text-gray-600">عدد العناصر:</span>
                  {[5, 10, 20, 50].map((size) => {
                    const active = pageSize === size;
                    return (
                      <button
                        key={size}
                        type="button"
                        onClick={() => updateFilter("pageSize", size)}
                        className={`px-3 py-2 text-sm rounded-xl transition-all border ${
                          active
                            ? "bg-blue-50 text-blue-700 border-blue-200 shadow-sm"
                            : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                        }`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>

                <div className="flex gap-2">
                  {[
                    { value: false, label: "نشط" },
                    { value: true, label: "محذوف" },
                  ].map((opt) => {
                    const active = filters.isDeleted === opt.value;
                    return (
                      <button
                        key={String(opt.value)}
                        type="button"
                        onClick={() => updateFilter("isDeleted", opt.value)}
                        className={`rounded-xl px-4 py-2 text-sm transition-all border ${
                          active
                            ? "bg-gray-900 text-white border-gray-900 shadow-sm"
                            : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                        }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>

                {isError && (
                  <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 px-3 py-2 rounded-xl">
                    <Info size={16} />
                    حدث خطأ: {error instanceof Error ? error.message : ""}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Table / States */}
      {isLoading ? (
        <LoadingState />
      ) : isError ? (
        <ErrorState
          message={error instanceof Error ? error.message : undefined}
        />
      ) : tasks.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-gray-200/70 bg-white/90 backdrop-blur shadow-[0_10px_30px_-18px_rgba(0,0,0,0.35)] ring-1 ring-gray-200/50">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-linear-to-b from-gray-50 to-white sticky top-0 z-10">
                <tr className="text-right text-xs font-semibold text-gray-700">
                  <th className="px-4 py-3">العنوان</th>
                  <th className="px-4 py-3 whitespace-nowrap">الأولوية</th>
                  <th className="px-4 py-3 whitespace-nowrap">الحالة</th>
                  <th className="px-4 py-3 whitespace-nowrap">الاستحقاق</th>
                  <th className="px-4 py-3 whitespace-nowrap">الإنشاء</th>
                  <th className="px-4 py-3 whitespace-nowrap">الإجراءات</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200 bg-white">
                {tasks.map((task, index) => (
                  <tr
                    key={task.id}
                    className={`text-sm text-gray-800 transition-colors ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50/40"
                    } hover:bg-linear-to-r hover:from-blue-50/60 hover:to-transparent`}
                  >
                    {/* Title */}
                    <td className="px-4 py-4 min-w-[280px]">
                      <div className="flex items-start gap-3">
                        <span className="inline-flex items-center justify-center w-9 h-9 rounded-2xl bg-linear-to-br from-blue-50 to-indigo-50 border border-blue-200/60 shadow-sm">
                          <CheckSquare size={16} className="text-blue-700" />
                        </span>

                        <div className="min-w-0">
                          <div
                            className="font-semibold text-gray-900 truncate"
                            title={task.title}
                          >
                            {task.title}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            ID: {task.id}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Priority */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold border ${getPriorityColor(
                          task.priority.value
                        )}`}
                      >
                        {getPriorityIcon(task.priority.value)}
                        {task.priority.label}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold border ${getStatusColor(
                          task.status.value
                        )}`}
                      >
                        {getStatusIcon(task.status.value)}
                        {task.status.label}
                      </span>
                    </td>

                    {/* Due Date */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="text-gray-700">
                        {task.dueDate
                          ? new Date(task.dueDate).toLocaleDateString("ar-EG")
                          : "—"}
                      </span>
                    </td>

                    {/* Created */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="text-gray-700">
                        {task.createdAt
                          ? new Date(task.createdAt).toLocaleDateString("ar-EG")
                          : "—"}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <IconButton
                          title="عرض التفاصيل"
                          variant="blue"
                          onClick={() => {
                            setSelectedTask(task);
                            setShowViewModal(true);
                          }}
                        >
                          <Eye size={14} />
                          
                        </IconButton>

                        <IconButton
                          title="تعديل"
                          variant="purple"
                          onClick={() => {
                            setEditTaskId(task.id);
                            setShowEditModal(true);
                          }}
                        >
                          <Edit size={16} />
                        </IconButton>

                        {!filters.isDeleted && (
                          <IconButton
                            title="أرشفة"
                            variant="red"
                            disabled={softDeleteMutation.isPending}
                            onClick={() =>
                              handleSoftDelete(task.id, task.title)
                            }
                          >
                            {softDeleteMutation.isPending ? (
                              <Loader2 size={16} className="animate-spin" />
                            ) : (
                              <Archive size={16} />
                            )}
                          </IconButton>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gray-200/70 bg-white/90 backdrop-blur px-4 py-3 text-sm text-gray-600 shadow-[0_10px_30px_-18px_rgba(0,0,0,0.35)] ring-1 ring-gray-200/50">
        <div className="flex items-center gap-2">
          <span>
            صفحة{" "}
            <span className="font-semibold text-gray-900">{pageNumber}</span> من{" "}
            <span className="font-semibold text-gray-900">{totalPages}</span>
          </span>
          <span className="text-gray-400">•</span>
          <span>
            عرض{" "}
            <span className="font-semibold text-gray-900">{tasks.length}</span>{" "}
            من <span className="font-semibold text-gray-900">{totalCount}</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handlePageChange(pageNumber - 1)}
            disabled={pageNumber <= 1}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 bg-white text-gray-700 disabled:opacity-50 hover:bg-gray-50 transition-colors"
          >
            <ChevronRight size={16} />
            السابق
          </button>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">اذهب إلى</span>
            <input
              type="number"
              min={1}
              max={totalPages}
              value={pageNumber}
              onChange={(e) => handlePageChange(Number(e.target.value))}
              className="w-20 px-3 py-2 rounded-xl border border-gray-200 text-gray-700 focus:outline-none focus:ring-4 focus:ring-blue-200/70 focus:border-blue-300 bg-white"
            />
          </div>

          <button
            onClick={() => handlePageChange(pageNumber + 1)}
            disabled={pageNumber >= totalPages}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 bg-white text-gray-700 disabled:opacity-50 hover:bg-gray-50 transition-colors"
          >
            التالي
            <ChevronLeft size={16} />
          </button>
        </div>
      </div>

      {/* Add Modal */}
      {showAddTaskModal && (
        <ModalShell
          title="إضافة مهمة جديدة"
          icon={CheckSquare}
          iconClassName="text-blue-700"
          onClose={() => setShowAddTaskModal(false)}
        >
          <AddTaskForm
            onSuccess={() => setShowAddTaskModal(false)}
            onCancel={() => setShowAddTaskModal(false)}
          />
        </ModalShell>
      )}

      {/* Edit Modal */}
      {showEditModal && editTaskId && (
        <ModalShell
          title="تعديل المهمة"
          icon={Edit}
          iconClassName="text-purple-700"
          onClose={() => {
            setShowEditModal(false);
            setEditTaskId(null);
          }}
        >
          <EditTaskForm
            taskId={editTaskId}
            onSuccess={() => {
              setShowEditModal(false);
              setEditTaskId(null);
            }}
            onCancel={() => {
              setShowEditModal(false);
              setEditTaskId(null);
            }}
          />
        </ModalShell>
      )}

      {/* View Modal */}
      {showViewModal && selectedTask && (
        <ModalShell
          title="تفاصيل المهمة"
          icon={Eye}
          iconClassName="text-blue-700"
          onClose={() => {
            setShowViewModal(false);
            setSelectedTask(null);
          }}
        >
          <div className="space-y-6">
            {/* Title */}
            <div className="rounded-xl border border-gray-200 bg-linear-to-br from-blue-50 to-white p-4">
              <div className="flex items-start gap-3">
                <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-blue-100 border border-blue-200">
                  <CheckSquare size={18} className="text-blue-700" />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-gray-600 mb-1">
                    عنوان المهمة
                  </div>
                  <div className="text-base font-semibold text-gray-900">
                    {selectedTask.title}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Priority */}
              <div className="rounded-xl border border-gray-200 bg-white p-4">
                <div className="flex items-start gap-3">
                  <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gray-50 border border-gray-200">
                    <Flag size={18} className="text-gray-700" />
                  </span>
                  <div>
                    <div className="text-xs font-medium text-gray-600 mb-1">
                      الأولوية
                    </div>
                    <div className="text-sm font-semibold text-gray-900">
                      {selectedTask.priority?.label || "—"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Status */}
              <div className="rounded-xl border border-gray-200 bg-white p-4">
                <div className="flex items-start gap-3">
                  <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gray-50 border border-gray-200">
                    <CheckCircle size={18} className="text-gray-700" />
                  </span>
                  <div>
                    <div className="text-xs font-medium text-gray-600 mb-1">
                      الحالة
                    </div>
                    <div className="text-sm font-semibold text-gray-900">
                      {selectedTask.status?.label || "—"}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Due Date */}
              <div className="rounded-xl border border-gray-200 bg-white p-4">
                <div className="flex items-start gap-3">
                  <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gray-50 border border-gray-200">
                    <Calendar size={18} className="text-gray-700" />
                  </span>
                  <div>
                    <div className="text-xs font-medium text-gray-600 mb-1">
                      تاريخ الاستحقاق
                    </div>
                    <div className="text-sm font-semibold text-gray-900">
                      {selectedTask.dueDate
                        ? new Date(selectedTask.dueDate).toLocaleDateString(
                            "ar-EG",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            }
                          )
                        : "—"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Created Date */}
              <div className="rounded-xl border border-gray-200 bg-white p-4">
                <div className="flex items-start gap-3">
                  <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gray-50 border border-gray-200">
                    <Clock size={18} className="text-gray-700" />
                  </span>
                  <div>
                    <div className="text-xs font-medium text-gray-600 mb-1">
                      تاريخ الإنشاء
                    </div>
                    <div className="text-sm font-semibold text-gray-900">
                      {selectedTask.createdAt
                        ? new Date(selectedTask.createdAt).toLocaleDateString(
                            "ar-EG",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            }
                          )
                        : "—"}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Assigned To */}
            {/* {selectedTask.assignedTo && (
              <div className="rounded-xl border border-gray-200 bg-linear-to-br from-indigo-50 to-white p-4">
                <div className="flex items-start gap-3">
                  <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-100 border border-indigo-200">
                    <User size={18} className="text-indigo-700" />
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-gray-600 mb-1">
                      مُسند إلى
                    </div>
                    <div className="text-sm font-semibold text-gray-900">
                      {selectedTask.assignedTo}
                    </div>
                  </div>
                </div>
              </div>
            )} */}

            {/* Description */}
            {selectedTask.description && (
              <div className="rounded-xl border border-gray-200 bg-white p-4">
                <div className="flex items-start gap-3">
                  <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gray-50 border border-gray-200">
                    <FileText size={18} className="text-gray-700" />
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-gray-600 mb-2">
                      الوصف
                    </div>
                    <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {selectedTask.description}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Task ID */}
            <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4">
              <div className="text-xs text-gray-600">
                معرّف المهمة:{" "}
                <span className="font-mono font-semibold text-gray-900">
                  #{selectedTask.id}
                </span>
              </div>
            </div>
          </div>
        </ModalShell>
      )}
    </section>
  );
}
