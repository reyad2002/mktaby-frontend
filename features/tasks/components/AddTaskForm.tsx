"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, CheckCircle } from "lucide-react";

import { useAddTask } from "../hooks/tasksHooks";
import { useUsers } from "@/features/users/hooks/usersHooks";
import { useCases } from "@/features/cases/hooks/caseHooks";
import {
  addTaskSchema,
  type AddTaskFormData,
} from "../validations/addTaskValidation";
import type {
  TaskPriority,
  TaskStatus,
  EntityType,
  CreateTaskRequest,
} from "../types/taskTypes";

interface AddTaskFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

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

const ENTITY_TYPE_OPTIONS: { value: EntityType; label: string }[] = [
  { value: "Case", label: "قضية" },
  { value: "Session", label: "جلسة" },
  { value: "Client", label: "عميل" },
  { value: "Task", label: "مهمة" },
  { value: "Office", label: "مكتب" },
];

export default function AddTaskForm({ onSuccess, onCancel }: AddTaskFormProps) {
  // Add task mutation using hook
  const mutation = useAddTask();

  // Fetch users for dropdown using hook
  const { data: usersData } = useUsers({ pageSize: 100 });
  const users = usersData?.data?.data ?? [];

  // Fetch cases for entity linking using hook
  const { data: casesData } = useCases({ PageSize: 100 });
  const cases = casesData?.data?.data ?? [];

  const {
    register,
    handleSubmit,
    reset,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<AddTaskFormData>({
    resolver: zodResolver(addTaskSchema),
    defaultValues: {
      title: "",
      description: "",
      dueDate: new Date().toISOString().split("T")[0],
      priority: "Normal",
      status: "Pending",
      entityId: undefined,
      entityType: undefined,
      recurringEvery: 0,
      users: [],
    },
  });

  const selectedUsers = watch("users");
  const entityType = watch("entityType");

  const onSubmit = (data: AddTaskFormData) => {
    const payload: CreateTaskRequest = {
      title: data.title,
      description: data.description,
      dueDate: new Date(data.dueDate).toISOString(),
      priority: data.priority as TaskPriority,
      status: data.status as TaskStatus,
      entityId: data.entityId || 0,
      entityType: (data.entityType as EntityType) || "Task",
      recurringEvery: data.recurringEvery,
      users: data.users,
    };
    mutation.mutate(payload, {
      onSuccess: (response) => {
        if (response?.data?.succeeded) {
          reset();
          onSuccess?.();
        }
      },
    });
  };

  const toggleUser = (userId: number) => {
    const current = selectedUsers || [];
    if (current.includes(userId)) {
      setValue(
        "users",
        current.filter((id) => id !== userId)
      );
    } else {
      setValue("users", [...current, userId]);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Title */}
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            عنوان المهمة
          </label>
          <input
            type="text"
            id="title"
            {...register("title")}
            className={`w-full px-3 py-2 border rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.title ? "border-red-500" : "border-gray-200"
            }`}
            placeholder="عنوان المهمة"
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-500">{errors.title.message}</p>
          )}
        </div>

        {/* Due Date */}
        <div>
          <label
            htmlFor="dueDate"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            تاريخ الاستحقاق
          </label>
          <input
            type="date"
            id="dueDate"
            {...register("dueDate")}
            className={`w-full px-3 py-2 border rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.dueDate ? "border-red-500" : "border-gray-200"
            }`}
          />
          {errors.dueDate && (
            <p className="mt-1 text-sm text-red-500">
              {errors.dueDate.message}
            </p>
          )}
        </div>

        {/* Priority */}
        <div>
          <label
            htmlFor="priority"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            الأولوية
          </label>
          <select
            id="priority"
            {...register("priority")}
            className={`w-full px-3 py-2 border rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white ${
              errors.priority ? "border-red-500" : "border-gray-200"
            }`}
          >
            {PRIORITY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          {errors.priority && (
            <p className="mt-1 text-sm text-red-500">
              {errors.priority.message}
            </p>
          )}
        </div>

        {/* Status */}
        <div>
          <label
            htmlFor="status"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            الحالة
          </label>
          <select
            id="status"
            {...register("status")}
            className={`w-full px-3 py-2 border rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white ${
              errors.status ? "border-red-500" : "border-gray-200"
            }`}
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          {errors.status && (
            <p className="mt-1 text-sm text-red-500">{errors.status.message}</p>
          )}
        </div>

        {/* Entity Type */}
        <div>
          <label
            htmlFor="entityType"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            ربط بـ (اختياري)
          </label>
          <select
            id="entityType"
            {...register("entityType")}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
          >
            <option value="">بدون ربط</option>
            {ENTITY_TYPE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Entity ID - Show if entity type is selected */}
        {entityType === "Case" && (
          <div>
            <label
              htmlFor="entityId"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              اختر القضية
            </label>
            <Controller
              name="entityId"
              control={control}
              render={({ field }) => (
                <select
                  id="entityId"
                  value={field.value || ""}
                  onChange={(e) =>
                    field.onChange(
                      e.target.value ? Number(e.target.value) : undefined
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                >
                  <option value="">اختر قضية</option>
                  {cases.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} - {c.caseNumber}
                    </option>
                  ))}
                </select>
              )}
            />
          </div>
        )}

        {/* Recurring Every */}
        <div>
          <label
            htmlFor="recurringEvery"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            تكرار كل (أيام)
          </label>
          <Controller
            name="recurringEvery"
            control={control}
            render={({ field }) => (
              <input
                type="number"
                id="recurringEvery"
                value={field.value}
                onChange={(e) => field.onChange(Number(e.target.value))}
                min={0}
                className={`w-full px-3 py-2 border rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.recurringEvery ? "border-red-500" : "border-gray-200"
                }`}
                placeholder="0 يعني بدون تكرار"
              />
            )}
          />
          {errors.recurringEvery && (
            <p className="mt-1 text-sm text-red-500">
              {errors.recurringEvery.message}
            </p>
          )}
        </div>
      </div>

      {/* Description - Full width */}
      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          وصف المهمة
        </label>
        <textarea
          id="description"
          {...register("description")}
          rows={3}
          className={`w-full px-3 py-2 border rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
            errors.description ? "border-red-500" : "border-gray-200"
          }`}
          placeholder="وصف المهمة..."
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-500">
            {errors.description.message}
          </p>
        )}
      </div>

      {/* Assigned Users */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          تعيين المستخدمين
        </label>
        {errors.users && (
          <p className="mb-2 text-sm text-red-500">{errors.users.message}</p>
        )}
        <div className="border border-gray-200 rounded-lg p-3 max-h-40 overflow-y-auto">
          {users.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-2">
              لا يوجد مستخدمين
            </p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {users.map((user) => {
                const isSelected = selectedUsers?.includes(user.id);
                return (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => toggleUser(user.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all border ${
                      isSelected
                        ? "bg-blue-50 text-blue-700 border-blue-200"
                        : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded border flex items-center justify-center ${
                        isSelected
                          ? "bg-blue-500 border-blue-500"
                          : "border-gray-300"
                      }`}
                    >
                      {isSelected && (
                        <svg
                          className="w-3 h-3 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                    </div>
                    <span className="truncate">{user.name}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
        >
          إلغاء
        </button>
        <button
          type="submit"
          disabled={mutation.isPending}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {mutation.isPending ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              جاري الإضافة...
            </>
          ) : (
            <>
              <CheckCircle size={16} />
              إضافة المهمة
            </>
          )}
        </button>
      </div>
    </form>
  );
}
