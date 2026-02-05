"use client";

import React, { useState, useMemo } from "react";
import {
  ClipboardList,
  Plus,
  CheckSquare,
  Loader2,
  Trash2,
  Edit,
  Calendar,
  X,
  Flag,
} from "lucide-react";
import {
  useTasks,
  useAddTask,
  useSoftDeleteTask,
  useTaskPriorities,
  useTaskStatuses,
  useUpdateTask,
} from "@/features/tasks/hooks/tasksHooks";
import type {
  GetTasksQuery,
  CreateTaskRequest,
  UpdateTaskRequest,
  TaskDto,
  TaskPriority,
  TaskStatus,
} from "@/features/tasks/types/taskTypes";
import { usePermissions } from "@/features/permissions/hooks/usePermissions";

/* ========== Styles ========== */
const ui = {
  page: "space-y-5 pb-12",
  card: "rounded-2xl border border-slate-200 bg-white shadow-sm",
  cardHeader:
    "px-5 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3",
  cardBody: "p-5",
};

/* ========== Helpers ========== */
const formatDate = (date: string) =>
  new Date(date).toLocaleDateString("ar-EG", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "High":
      return "bg-red-50 text-red-700 border-red-200";
    case "Normal":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "Low":
      return "bg-gray-50 text-gray-700 border-gray-200";
    default:
      return "bg-gray-50 text-gray-700 border-gray-200";
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "Completed":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "InProgress":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "Pending":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "Overdue":
      return "bg-red-50 text-red-700 border-red-200";
    case "OnHold":
      return "bg-purple-50 text-purple-700 border-purple-200";
    case "Cancelled":
      return "bg-gray-50 text-gray-500 border-gray-200";
    default:
      return "bg-gray-50 text-gray-700 border-gray-200";
  }
};

/* ========== Component Props ========== */
interface CaseTasksProps {
  caseId: number;
}

/* ========== Initial Form State ========== */
const EMPTY_TASK_FORM = {
  title: "",
  description: "",
  dueDate: "",
  priority: "Normal" as TaskPriority,
  status: "Pending" as TaskStatus,
  recurringEvery: 0,
  users: [] as number[],
};

/* ========== Main Component ========== */
export default function CaseTasks({ caseId }: CaseTasksProps) {
  const { can } = usePermissions();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskDto | null>(null);
  const [taskForm, setTaskForm] = useState(EMPTY_TASK_FORM);
  const [deletingTaskId, setDeletingTaskId] = useState<number | null>(null);

  // Query filters for tasks related to this case
  const taskFilters: GetTasksQuery = useMemo(
    () => ({
      entityId: caseId,
      entityType: "Case",
      pageNumber: 1,
      pageSize: 100,
      isDeleted: false,
    }),
    [caseId]
  );

  // Fetch tasks
  const { data: tasksResponse, isLoading: tasksLoading } =
    useTasks(taskFilters);
  const tasks = tasksResponse?.data?.data?.data ?? [];

  // Fetch priorities and statuses for dropdowns
  const { data: prioritiesData } = useTaskPriorities();
  const { data: statusesData } = useTaskStatuses();

  const priorities = prioritiesData?.data ?? [];
  const statuses = statusesData?.data ?? [];
  console.log("statuses", statuses);
  // Mutations
  const addTaskMutation = useAddTask();
  const updateTaskMutation = useUpdateTask();
  const deleteTaskMutation = useSoftDeleteTask();

  // Handlers
  const handleOpenAddModal = () => {
    setTaskForm(EMPTY_TASK_FORM);
    setShowAddModal(true);
  };

  const handleCloseAddModal = () => {
    setShowAddModal(false);
    setTaskForm(EMPTY_TASK_FORM);
  };

  const handleOpenEditModal = (task: TaskDto) => {
    setEditingTask(task);
    setTaskForm({
      title: task.title,
      description: task.description,
      dueDate: task.dueDate.split("T")[0],
      priority: task.priority.value as TaskPriority,
      status: task.status.value as TaskStatus,
      recurringEvery: task.recurringEvery,
      users: [],
    });
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditingTask(null);
    setTaskForm(EMPTY_TASK_FORM);
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    const request: CreateTaskRequest = {
      ...taskForm,
      dueDate: new Date(taskForm.dueDate).toISOString(),
      entityId: caseId,
      entityType: "Case",
    };
    addTaskMutation.mutate(request, {
      onSuccess: () => handleCloseAddModal(),
    });
  };

  const handleUpdateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTask) return;

    const request: UpdateTaskRequest = {
      ...taskForm,
      dueDate: new Date(taskForm.dueDate).toISOString(),
      entityId: caseId,
      entityType: "Case",
    };
    updateTaskMutation.mutate(
      { id: editingTask.id, data: request },
      { onSuccess: () => handleCloseEditModal() }
    );
  };

  const handleDeleteTask = (taskId: number) => {
    setDeletingTaskId(taskId);
    deleteTaskMutation.mutate(taskId, {
      onSettled: () => setDeletingTaskId(null),
    });
  };

  return (
    <section className={ui.page}>
      <div className={ui.card}>
        <div className={ui.cardHeader}>
          <div className="flex items-center gap-2">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-teal-700">
              <ClipboardList size={20} />
            </span>
            <h1 className="text-xl font-bold text-slate-900">مهام القضية</h1>
            {tasks.length > 0 && (
              <span className="text-sm text-slate-500">({tasks.length})</span>
            )}
          </div>
          {can.canCreateTask() && (
          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-700 transition"
          >
            <Plus size={16} />
            إضافة مهمة
          </button>
          )}
        </div>

        <div className={ui.cardBody}>
          {tasksLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="animate-spin text-teal-600" size={40} />
            </div>
          ) : tasks.length === 0 ? (
            <div className="text-center py-16">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50 text-slate-400 border border-slate-200 mb-4">
                <CheckSquare size={32} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                لا توجد مهام
              </h3>
              <p className="text-sm text-slate-500 max-w-md mx-auto mb-6">
                لم يتم إضافة أي مهام لهذه القضية بعد. ابدأ بإضافة المهام
                المطلوبة.
              </p>
              {can.canCreateTask() && (
              <button
                onClick={handleOpenAddModal}
                className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-6 py-3 text-sm font-semibold text-white hover:bg-teal-700 transition"
              >
                <Plus size={18} />
                إضافة أول مهمة
              </button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 hover:bg-slate-50 transition"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-slate-900 mb-1">
                        {task.title}
                      </h3>
                      {task.description && (
                        <p className="text-sm text-slate-600 mb-3 line-clamp-2">
                          {task.description}
                        </p>
                      )}
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusColor(
                            task.status.value
                          )}`}
                        >
                          {task.status.label}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${getPriorityColor(
                            task.priority.value
                          )}`}
                        >
                          <Flag size={12} />
                          {task.priority.label}
                        </span>
                        <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                          <Calendar size={12} />
                          {formatDate(task.dueDate)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {can.canUpdateTask() && (
                      <button
                        onClick={() => handleOpenEditModal(task)}
                        className="p-2 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition"
                        title="تعديل"
                      >
                        <Edit size={16} />
                      </button>
                      )}
                      {can.canDeleteTask() && (
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        disabled={deletingTaskId === task.id}
                        className="p-2 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition disabled:opacity-50"
                        title="حذف"
                      >
                        {deletingTaskId === task.id ? (
                          <Loader2 className="animate-spin" size={16} />
                        ) : (
                          <Trash2 size={16} />
                        )}
                      </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Task Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={handleCloseAddModal}
          />
          <div className="relative w-full max-w-lg mx-4 bg-white rounded-2xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
                <Plus className="text-teal-600" size={22} />
                إضافة مهمة جديدة
              </h2>
              <button
                onClick={handleCloseAddModal}
                className="p-2 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddTask} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  العنوان *
                </label>
                <input
                  type="text"
                  required
                  value={taskForm.title}
                  onChange={(e) =>
                    setTaskForm({ ...taskForm, title: e.target.value })
                  }
                  className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-200 focus:border-teal-300"
                  placeholder="أدخل عنوان المهمة"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  الوصف
                </label>
                <textarea
                  value={taskForm.description}
                  onChange={(e) =>
                    setTaskForm({ ...taskForm, description: e.target.value })
                  }
                  rows={3}
                  className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-200 focus:border-teal-300 resize-none"
                  placeholder="أدخل وصف المهمة"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  تاريخ الاستحقاق *
                </label>
                <input
                  type="date"
                  required
                  value={taskForm.dueDate}
                  onChange={(e) =>
                    setTaskForm({ ...taskForm, dueDate: e.target.value })
                  }
                  className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-200 focus:border-teal-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    الأولوية
                  </label>
                  <select
                    value={taskForm.priority}
                    onChange={(e) =>
                      setTaskForm({
                        ...taskForm,
                        priority: e.target.value as TaskPriority,
                      })
                    }
                    className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-200 focus:border-teal-300"
                  >
                    {priorities.map((p) => (
                      <option key={p.value} value={p.value}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    الحالة
                  </label>
                  <select
                    value={taskForm.status}
                    onChange={(e) =>
                      setTaskForm({
                        ...taskForm,
                        status: e.target.value as TaskStatus,
                      })
                    }
                    className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-200 focus:border-teal-300"
                  >
                    {statuses.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleCloseAddModal}
                  className="px-4 py-2.5 rounded-lg border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 transition"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={addTaskMutation.isPending}
                  className="px-6 py-2.5 rounded-lg bg-teal-600 text-white font-semibold hover:bg-teal-700 transition disabled:opacity-50 inline-flex items-center gap-2"
                >
                  {addTaskMutation.isPending && (
                    <Loader2 className="animate-spin" size={16} />
                  )}
                  إضافة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Task Modal */}
      {showEditModal && editingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={handleCloseEditModal}
          />
          <div className="relative w-full max-w-lg mx-4 bg-white rounded-2xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
                <Edit className="text-blue-600" size={22} />
                تعديل المهمة
              </h2>
              <button
                onClick={handleCloseEditModal}
                className="p-2 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUpdateTask} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  العنوان *
                </label>
                <input
                  type="text"
                  required
                  value={taskForm.title}
                  onChange={(e) =>
                    setTaskForm({ ...taskForm, title: e.target.value })
                  }
                  className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300"
                  placeholder="أدخل عنوان المهمة"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  الوصف
                </label>
                <textarea
                  value={taskForm.description}
                  onChange={(e) =>
                    setTaskForm({ ...taskForm, description: e.target.value })
                  }
                  rows={3}
                  className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300 resize-none"
                  placeholder="أدخل وصف المهمة"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  تاريخ الاستحقاق *
                </label>
                <input
                  type="date"
                  required
                  value={taskForm.dueDate}
                  onChange={(e) =>
                    setTaskForm({ ...taskForm, dueDate: e.target.value })
                  }
                  className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    الأولوية
                  </label>
                  <select
                    value={taskForm.priority}
                    onChange={(e) =>
                      setTaskForm({
                        ...taskForm,
                        priority: e.target.value as TaskPriority,
                      })
                    }
                    className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300"
                  >
                    {priorities.map((p) => (
                      <option key={p.value} value={p.value}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    الحالة
                  </label>
                  <select
                    value={taskForm.status}
                    onChange={(e) =>
                      setTaskForm({
                        ...taskForm,
                        status: e.target.value as TaskStatus,
                      })
                    }
                    className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300"
                  >
                    {statuses.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleCloseEditModal}
                  className="px-4 py-2.5 rounded-lg border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 transition"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={updateTaskMutation.isPending}
                  className="px-6 py-2.5 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition disabled:opacity-50 inline-flex items-center gap-2"
                >
                  {updateTaskMutation.isPending && (
                    <Loader2 className="animate-spin" size={16} />
                  )}
                  حفظ التغييرات
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
