"use client";

import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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

export default function TasksPage() {
  const [filters, setFilters] = useState<GetTasksQuery>(DEFAULT_FILTERS);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editTaskId, setEditTaskId] = useState<number | null>(null);

  const queryClient = useQueryClient();

  // Fetch task dashboard stats
  const { data: dashboardData } = useQuery({
    queryKey: ["taskDashboard"],
    queryFn: () => fetchTaskDashboardApi(),
  });
  const dashboard = dashboardData?.data;

  // Soft Delete mutation
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

  // Fetch tasks list
  const { data, isLoading, isError, error, isFetching } = useQuery({
    queryKey: ["tasks", queryParams],
    queryFn: () => fetchTasksApi(queryParams),
  });

  const tasks: TaskDto[] = data?.data?.data?.data ?? [];
  const totalCount = data?.data?.data?.count ?? 0;
  const pageNumber = filters.pageNumber ?? 1;
  const pageSize = filters.pageSize ?? 10;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize || 1));

  const updateFilter = <K extends keyof GetTasksQuery>(
    key: K,
    value: GetTasksQuery[K]
  ) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      pageNumber: key === "search" ? 1 : prev.pageNumber,
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
      Completed: "bg-green-50 text-green-800 border-green-200",
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
    <section className="space-y-6">
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

      {/* Dashboard Stats */}
      {dashboard && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100">
                <CheckSquare className="text-blue-600" size={20} />
              </div>
              <div>
                <p className="text-xs text-gray-600">إجمالي المهام</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {dashboard.totalTasks}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100">
                <CheckCircle className="text-green-600" size={20} />
              </div>
              <div>
                <p className="text-xs text-gray-600">مكتملة</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {dashboard.completedTasks}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-100">
                <Clock className="text-yellow-600" size={20} />
              </div>
              <div>
                <p className="text-xs text-gray-600">غير مكتملة</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {dashboard.uncompletedTasks}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-100">
                <AlertCircle className="text-red-600" size={20} />
              </div>
              <div>
                <p className="text-xs text-gray-600">متأخرة</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {dashboard.overdueTasks}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <h3 className="text-sm font-medium text-gray-900">
              البحث والفلترة
            </h3>
            <button
              type="button"
              onClick={resetFilters}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              إعادة تعيين
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                بحث
              </label>
              <input
                type="text"
                value={filters.search ?? ""}
                onChange={(e) => updateFilter("search", e.target.value)}
                placeholder="ابحث بالعنوان..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Priority Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                الأولوية
              </label>
              <select
                value={filters.priority || ""}
                onChange={(e) =>
                  updateFilter(
                    "priority",
                    (e.target.value as TaskPriority) || undefined
                  )
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">الكل</option>
                {PRIORITY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                الحالة
              </label>
              <select
                value={filters.statuses?.[0] || ""}
                onChange={(e) =>
                  updateFilter(
                    "statuses",
                    e.target.value ? [e.target.value as TaskStatus] : undefined
                  )
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">الكل</option>
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                الترتيب
              </label>
              <select
                value={filters.sort || ""}
                onChange={(e) => updateFilter("sort", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Page Size */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                عدد العناصر
              </label>
              <select
                value={pageSize}
                onChange={(e) =>
                  updateFilter("pageSize", Number(e.target.value))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {[5, 10, 20, 50].map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {isError && (
            <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
              حدث خطأ أثناء جلب البيانات:{" "}
              {error instanceof Error ? error.message : ""}
            </div>
          )}
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr className="text-right text-sm font-semibold text-gray-700">
                  <th className="px-4 py-3 font-medium">العنوان</th>
                  <th className="px-4 py-3 font-medium">الأولوية</th>
                  <th className="px-4 py-3 font-medium">الحالة</th>
                  <th className="px-4 py-3 font-medium">تاريخ الاستحقاق</th>
                  <th className="px-4 py-3 font-medium">تاريخ الإنشاء</th>
                  <th className="px-4 py-3 font-medium">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {isLoading ? (
                  [...Array(3)].map((_, idx) => (
                    <tr key={idx} className="animate-pulse">
                      {[...Array(6)].map((__, cellIdx) => (
                        <td key={cellIdx} className="px-4 py-3">
                          <div className="h-4 w-full rounded bg-gray-200" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : tasks.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-6 text-center text-gray-500"
                    >
                      لا توجد مهام مطابقة.
                    </td>
                  </tr>
                ) : (
                  tasks.map((task) => (
                    <tr
                      key={task.id}
                      className="text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1">
                          <span className="font-medium text-gray-900">
                            {task.title}
                          </span>
                          {task.description && (
                            <span className="text-xs text-gray-500 line-clamp-1">
                              {task.description}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium border ${getPriorityColor(
                            task.priority.value
                          )}`}
                        >
                          {getPriorityIcon(task.priority.value)}
                          {task.priority.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium border ${getStatusColor(
                            task.status.value
                          )}`}
                        >
                          {getStatusIcon(task.status.value)}
                          {task.status.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-gray-600">
                          {task.dueDate
                            ? new Date(task.dueDate).toLocaleDateString("ar-EG")
                            : "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-gray-600">
                          {task.createdAt
                            ? new Date(task.createdAt).toLocaleDateString(
                                "ar-EG"
                              )
                            : "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setEditTaskId(task.id);
                              setShowEditModal(true);
                            }}
                            className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium text-xs transition-colors"
                          >
                            <Edit size={14} />
                            تعديل
                          </button>

                          {!filters.isDeleted && (
                            <button
                              type="button"
                              onClick={() =>
                                handleSoftDelete(task.id, task.title)
                              }
                              disabled={softDeleteMutation.isPending}
                              className="inline-flex items-center gap-1 text-red-600 hover:text-red-700 font-medium text-xs transition-colors disabled:opacity-50"
                              title="أرشفة"
                            >
                              {softDeleteMutation.isPending ? (
                                <Loader2 size={14} className="animate-spin" />
                              ) : (
                                <Archive size={14} />
                              )}
                              أرشفة
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white rounded-lg border border-gray-200 px-4 py-3 text-sm shadow-sm">
          <div className="text-gray-700">
            صفحة <span className="font-medium">{pageNumber}</span> من{" "}
            <span className="font-medium">{totalPages}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(pageNumber - 1)}
              disabled={pageNumber <= 1}
              className="px-3 py-1.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-sm"
            >
              السابق
            </button>
            <button
              onClick={() => handlePageChange(pageNumber + 1)}
              disabled={pageNumber >= totalPages}
              className="px-3 py-1.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-sm"
            >
              التالي
            </button>
          </div>
        </div>
      </div>

      {/* Add Task Modal */}
      {showAddTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setShowAddTaskModal(false)}
          />
          {/* Modal Content */}
          <div className="relative w-full max-w-2xl mx-4 bg-white rounded-lg border border-gray-200 shadow-xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">
                إضافة مهمة جديدة
              </h2>
              <button
                type="button"
                onClick={() => setShowAddTaskModal(false)}
                className="p-1 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <AddTaskForm
              onSuccess={() => setShowAddTaskModal(false)}
              onCancel={() => setShowAddTaskModal(false)}
            />
          </div>
        </div>
      )}

      {/* Edit Task Modal */}
      {showEditModal && editTaskId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => {
              setShowEditModal(false);
              setEditTaskId(null);
            }}
          />
          {/* Modal Content */}
          <div className="relative w-full max-w-2xl mx-4 bg-white rounded-lg border border-gray-200 shadow-xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">
                تعديل المهمة
              </h2>
              <button
                type="button"
                onClick={() => {
                  setShowEditModal(false);
                  setEditTaskId(null);
                }}
                className="p-1 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
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
          </div>
        </div>
      )}
    </section>
  );
}
