"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
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
  Check,
} from "lucide-react";

import {
  useTasks,
  useSoftDeleteTask,
  useTaskDashboard,
} from "@/features/tasks/hooks/tasksHooks";
import AddTaskForm from "@/features/tasks/components/AddTaskForm";
import EditTaskForm from "@/features/tasks/components/EditTaskForm";
import PageHeader from "@/shared/components/dashboard/PageHeader";
import { usePermissions } from "@/features/permissions/hooks/usePermissions";
import { useConfirm } from "@/shared/providers/ConfirmProvider";
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

type Opt = { label: string; value: string | number };
type CustomSelectProps = {
  label: string;
  value: string | number | "";
  options: Opt[];
  placeholder?: string;
  onChange: (val: string | number | "") => void;
};

function OptionRow({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${
        active
          ? "bg-primary/10 text-primary"
          : "text-gray-700 hover:bg-gray-100/70"
      }`}
    >
      <span className="truncate">{label}</span>
      {active && <Check size={16} className="shrink-0" />}
    </button>
  );
}

function CustomSelect({
  label,
  value,
  options,
  placeholder = "الكل",
  onChange,
}: CustomSelectProps) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const wrapRef = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => String(o.value) === String(value));
  const shownLabel =
    value === "" ? placeholder : selected?.label ?? placeholder;

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    if (!qq) return options;
    return options.filter((o) => o.label.toLowerCase().includes(qq));
  }, [q, options]);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  return (
    <div ref={wrapRef} className="relative" dir="rtl">
      <label className="block text-sm font-bold text-gray-700 mb-2 mr-1">
        {label}
      </label>

      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className={`w-full flex items-center justify-between gap-3 px-4 py-3.5 rounded-2xl border transition-all ${
          open
            ? "bg-white border-primary/40 ring-4 ring-primary/10"
            : "bg-gray-50/60 border-gray-200 hover:bg-white"
        }`}
      >
        <span className="text-gray-800 font-bold truncate">{shownLabel}</span>
        <ChevronDown
          size={18}
          className={`text-gray-400 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div className="absolute left-0 right-0 mt-3 z-50 rounded-3xl bg-white/95 backdrop-blur-xl border border-gray-200/70 shadow-[0_30px_70px_-30px_rgba(0,0,0,0.3)] overflow-hidden">
          <div className="p-3 border-b border-gray-100">
            <div className="relative">
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 pointer-events-none">
                <Search size={16} />
              </div>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="ابحث..."
                className="w-full pr-9 pl-3 py-2.5 rounded-2xl bg-gray-50/70 border border-gray-200 text-sm font-semibold text-gray-700 placeholder:text-gray-400 outline-none focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 appearance-none"
              />
            </div>
          </div>

          <div className="max-h-72 overflow-auto p-2">
            <OptionRow
              active={value === ""}
              label={placeholder}
              onClick={() => {
                onChange("");
                setOpen(false);
                setQ("");
              }}
            />

            {filtered.map((o) => (
              <OptionRow
                key={String(o.value)}
                active={String(value) === String(o.value)}
                label={o.label}
                onClick={() => {
                  onChange(o.value);
                  setOpen(false);
                  setQ("");
                }}
              />
            ))}

            {filtered.length === 0 && (
              <div className="p-4 text-sm font-bold text-gray-500 text-center">
                لا توجد نتائج
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
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

export default function TasksPage() {
  const { can } = usePermissions();
  const [filters, setFilters] = useState<GetTasksQuery>(DEFAULT_FILTERS);

  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editTaskId, setEditTaskId] = useState<number | null>(null);

  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskDto | null>(null);

  // ✅ Same "Sessions / Cases UI": make filters a dropdown (only Search stays visible)
  const [moreOpen, setMoreOpen] = useState(false);

  useLockBodyScroll(showAddTaskModal || showEditModal || showViewModal || moreOpen);

  const {
    data: dashboardData,
    isFetching: isFetchingDashboard,
    refetch: refetchDashboard,
  } = useTaskDashboard();

  const dashboard = dashboardData?.data;

  const confirm = useConfirm();
  const softDeleteMutation = useSoftDeleteTask();

  const handleSoftDelete = (id: number, title: string) => {
    confirm({
      title: "أرشفة المهمة",
      description: `هل تريد أرشفة المهمة "${title}"؟\nيمكن استعادتها لاحقاً.`,
      confirmText: "أرشفة",
      cancelText: "إلغاء",
    }).then((ok) => ok && softDeleteMutation.mutate(id));
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

  const { data, isLoading, isError, error, isFetching, refetch } =
    useTasks(queryParams);

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

  const priorityOptions: Opt[] = useMemo(
    () => PRIORITY_OPTIONS.map((p) => ({ label: p.label, value: p.value })),
    []
  );

  const statusOptions: Opt[] = useMemo(
    () => STATUS_OPTIONS.map((s) => ({ label: s.label, value: s.value })),
    []
  );

  const sortOptions: Opt[] = useMemo(
    () => SORT_OPTIONS.map((s) => ({ label: s.label, value: s.value })),
    []
  );

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
        onAdd={can.canCreateTask() ? () => setShowAddTaskModal(true) : undefined}
        addButtonLabel="مهمة جديدة"
      />

      {/* ✅ NEW: same Sessions/Cases layout (Search + Filters Dropdown + Status Segmented) */}
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end">
          {/* Search (visible) */}
          <div className="lg:col-span-9">
            <label className="block text-sm font-bold text-gray-700 mb-2 mr-1">
              بحث
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-gray-400 group-focus-within:text-primary transition-colors">
                <Search size={20} />
              </div>
              <input
                type="text"
                value={filters.search ?? ""}
                onChange={(e) => updateFilter("search", e.target.value)}
                placeholder="ابحث بالعنوان..."
                className="w-full pr-12 pl-4 py-3.5 bg-gray-50/50 border border-gray-200 rounded-2xl text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary focus:bg-white transition-all shadow-sm"
              />
            </div>
          </div>

          {/* Filters dropdown button */}
          <div className="lg:col-span-3 relative">
            <button
              type="button"
              onClick={() => setMoreOpen((p) => !p)}
              className={`w-full h-13 flex items-center justify-between gap-3 px-5 rounded-2xl border font-extrabold transition-all ${
                moreOpen
                  ? "bg-white border-primary/40 ring-4 ring-primary/10"
                  : "bg-gray-50/50 border-gray-200 hover:bg-white"
              }`}
            >
              <span className="flex items-center gap-2 text-gray-700">
                <SlidersHorizontal size={18} className="text-primary" />
                الفلاتر
              </span>
              <ChevronDown
                size={18}
                className={`transition-transform ${moreOpen ? "rotate-180" : ""}`}
              />
            </button>

            {moreOpen && (
              <>
                <button
                  type="button"
                  onClick={() => setMoreOpen(false)}
                  className="fixed inset-0 z-40 cursor-default"
                />

                <div className="absolute left-0 right-0 mt-3 z-50 rounded-3xl bg-white/95 backdrop-blur-xl border border-gray-200/70 shadow-[0_30px_70px_-30px_rgba(0,0,0,0.3)]">
                  <div className="p-5 grid grid-cols-1 gap-5">
                    {/* Page size */}
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        عدد النتائج
                      </label>
                      <div className="inline-flex p-1.5 bg-gray-100/80 rounded-2xl">
                        {[5, 10, 20, 50].map((size) => {
                          const active = pageSize === size;
                          return (
                            <button
                              key={size}
                              type="button"
                              onClick={() => updateFilter("pageSize", size)}
                              className={`px-4 py-2 text-sm font-bold rounded-xl transition-all ${
                                active
                                  ? "bg-white text-primary shadow-sm"
                                  : "text-gray-500 hover:text-gray-700"
                              }`}
                            >
                              {size}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <CustomSelect
                      label="الأولوية"
                      value={String(filters.priority || "")}
                      options={priorityOptions}
                      placeholder="الكل"
                      onChange={(val) =>
                        updateFilter(
                          "priority",
                          val === "" ? undefined : (String(val) as TaskPriority)
                        )
                      }
                    />

                    {/* Single-select status (same behavior as your select) */}
                    <CustomSelect
                      label="الحالة"
                      value={String(filters.statuses?.[0] || "")}
                      options={statusOptions}
                      placeholder="الكل"
                      onChange={(val) =>
                        updateFilter(
                          "statuses",
                          val === "" ? undefined : [String(val) as TaskStatus]
                        )
                      }
                    />

                    <CustomSelect
                      label="الترتيب"
                      value={String(filters.sort || "")}
                      options={sortOptions}
                      placeholder="بدون ترتيب"
                      onChange={(val) => updateFilter("sort", String(val || ""))}
                    />

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                      <button
                        type="button"
                        onClick={resetFilters}
                        className="flex-1 px-4 py-3 text-sm font-extrabold rounded-2xl text-red-500 bg-red-50 hover:bg-red-100"
                      >
                        إعادة ضبط
                      </button>
                      <button
                        type="button"
                        onClick={() => setMoreOpen(false)}
                        className="flex-1 px-4 py-3 text-sm font-extrabold rounded-2xl text-gray-700 bg-gray-100 hover:bg-gray-200"
                      >
                        تم
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        refetchDashboard();
                        refetch();
                      }}
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-extrabold rounded-2xl text-gray-700 bg-white border border-gray-200 hover:bg-gray-50"
                    >
                      <RefreshCw
                        size={16}
                        className={
                          isFetching || isFetchingDashboard ? "animate-spin" : ""
                        }
                      />
                      تحديث النتائج
                    </button>

                    {isError && (
                      <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 px-3 py-2 rounded-2xl font-bold">
                        <Info size={16} />
                        حدث خطأ: {error instanceof Error ? error.message : "—"}
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Deleted toggle (segment like Sessions) */}
        {/* <div className="mt-6">
          <label className="block text-sm font-bold text-gray-700 mb-2">
            حالة السجلات
          </label>
          <div className="flex items-center p-1.5 bg-gray-100/80 rounded-2xl">
            {[
              { key: "active", label: "النشطة", icon: CheckSquare, tone: "primary" },
              { key: "deleted", label: "المؤرشفة", icon: Archive, tone: "red" },
            ].map((opt) => {
              const active =
                (opt.key === "active" && !filters.isDeleted) ||
                (opt.key === "deleted" && !!filters.isDeleted);

              return (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() =>
                    updateFilter("isDeleted", opt.key === "deleted")
                  }
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-bold rounded-xl transition-all ${
                    active
                      ? opt.tone === "red"
                        ? "bg-red-500 text-white"
                        : "bg-primary text-white"
                      : "text-gray-500 hover:bg-gray-200/50"
                  }`}
                >
                  <opt.icon size={16} />
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div> */}
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

                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="text-gray-700">
                        {task.dueDate
                          ? new Date(task.dueDate).toLocaleDateString("ar-EG")
                          : "—"}
                      </span>
                    </td>

                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="text-gray-700">
                        {task.createdAt
                          ? new Date(task.createdAt).toLocaleDateString("ar-EG")
                          : "—"}
                      </span>
                    </td>

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

                        {can.canUpdateTask() && (
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
                        )}

                        {!filters.isDeleted && can.canDeleteTask() && (
                          <IconButton
                            title="أرشفة"
                            variant="red"
                            disabled={softDeleteMutation.isPending}
                            onClick={() => handleSoftDelete(task.id, task.title)}
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
                            { year: "numeric", month: "long", day: "numeric" }
                          )
                        : "—"}
                    </div>
                  </div>
                </div>
              </div>

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
                            { year: "numeric", month: "long", day: "numeric" }
                          )
                        : "—"}
                    </div>
                  </div>
                </div>
              </div>
            </div>

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
