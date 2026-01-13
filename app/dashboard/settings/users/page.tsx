"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import {
  Users,
  Plus,
  X,
  Loader2,
  Edit,
  Trash2,
  Search,
  AlertCircle,
  UserCircle2,
  Mail,
  Phone,
  Building2,
  ShieldCheck,
  CalendarDays,
  SlidersHorizontal,
  RefreshCw,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Info,
  Eye,
} from "lucide-react";

import type { LucideIcon } from "lucide-react";

import {
  useUsers,
  useDeleteUser,
  useUserById,
} from "@/features/users/hooks/usersHooks";
import AddUserForm from "@/features/users/components/AddUserForm";
import EditUserForm from "@/features/users/components/EditUserForm";
import PageHeader from "@/shared/components/dashboard/PageHeader";
import type { UsersQueryParams, UserSummary } from "@/features/users/types/userTypes";

const DEFAULT_FILTERS: UsersQueryParams = {
  pageNumber: 1,
  pageSize: 10,
  search: "",
  sort: "createdAt desc",
  isDeleted: false,
};

const SORT_OPTIONS = [
  { value: "createdAt desc", label: "الأحدث أولاً" },
  { value: "createdAt asc", label: "الأقدم أولاً" },
];

const formatDateAr = (date?: string | null) =>
  date ? new Date(date).toLocaleDateString("ar-EG") : "—";

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
      <div className="relative w-full max-w-3xl mx-4 bg-white rounded-2xl border border-gray-200 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur border-b border-gray-100 px-6 py-4 flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center gap-2">
            {Icon ? (
              <span className="inline-flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200/60 shadow-sm">
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

/** Icon Button (Premium) */
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
          <Users className="text-gray-500" size={20} />
        </div>
        <p className="text-gray-800 font-semibold">لا توجد بيانات مستخدمين مطابقة.</p>
        <p className="text-sm text-gray-600 mt-1">جرّب تغيير الفلاتر أو البحث.</p>
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
      className={[
        "inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold border",
        className,
      ].join(" ")}
    >
      {Icon ? <Icon size={12} /> : null}
      {text}
    </span>
  );
}

export default function UsersPage() {
  const [filters, setFilters] = useState<UsersQueryParams>(DEFAULT_FILTERS);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [viewingUserId, setViewingUserId] = useState<number | null>(null);

  useLockBodyScroll(showAddUserModal || !!editingUserId || !!viewingUserId);

  const queryParams = useMemo(() => {
    return {
      ...filters,
      search: filters.search?.trim() || undefined,
      sort: filters.sort || undefined,
      isDeleted: filters.isDeleted ? true : undefined,
    } satisfies UsersQueryParams;
  }, [filters]);

  const { data, isLoading, isError, error, isFetching, refetch } = useUsers(queryParams);

  const { data: userDetailsResponse, isFetching: isFetchingUserDetails } =
    useUserById(viewingUserId ?? 0, !!viewingUserId);

  const userDetails = userDetailsResponse?.data;

  const deleteMutation = useDeleteUser();

  const usersAll: UserSummary[] = data?.data?.data ?? [];
  const users = usersAll.filter((u) => u.role !== "OfficeAdmin");

  const totalCount = data?.data?.count ?? 0;
  const pageNumber = filters.pageNumber ?? 1;
  const pageSize = filters.pageSize ?? 10;
  const totalPages = Math.max(1, Math.ceil(totalCount / (pageSize || 1)));

  const updateFilter = useCallback(
    <K extends keyof UsersQueryParams>(key: K, value: UsersQueryParams[K]) => {
      setFilters((prev) => ({
        ...prev,
        [key]: value,
        pageNumber: key === "search" || key === "pageSize" ? 1 : prev.pageNumber,
      }));
    },
    []
  );

  const handlePageChange = (nextPage: number) => {
    if (nextPage < 1 || nextPage > totalPages) return;
    setFilters((prev) => ({ ...prev, pageNumber: nextPage }));
  };

  const resetFilters = () => setFilters(DEFAULT_FILTERS);

  const handleDelete = async (userId: number, userName: string) => {
    if (confirm(`هل أنت متأكد من حذف المستخدم "${userName}"؟ لا يمكن التراجع.`)) {
      await deleteMutation.mutateAsync(userId);
      if (viewingUserId === userId) setViewingUserId(null);
      if (editingUserId === userId) setEditingUserId(null);
    }
  };

  return (
    <section className="space-y-6 relative">
      {/* Soft premium background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-blue-200/40 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-indigo-200/40 blur-3xl" />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-50 via-white to-white" />
      </div>

      <PageHeader
        title="المستخدمون"
        subtitle="إدارة ومتابعة أعضاء الفريق وصلاحياتهم."
        icon={Users}
        isFetching={isFetching}
        countLabel={`${totalCount} مستخدم`}
        onAdd={() => setShowAddUserModal(true)}
        addButtonLabel="إضافة مستخدم"
      />

      {/* Filters (Premium) */}
      <div className="rounded-2xl bg-white/90 backdrop-blur border border-gray-200/70 shadow-[0_10px_30px_-18px_rgba(0,0,0,0.35)] ring-1 ring-gray-200/50 overflow-hidden">
        <div className="px-4 sm:px-5 py-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3 relative">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-500" />

          <div className="flex items-center gap-2 text-sm font-medium text-gray-800">
            <span className="inline-flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200/60 shadow-sm">
              <SlidersHorizontal size={16} className="text-blue-700" />
            </span>
            فلاتر البحث
            <span className="text-gray-500 font-normal">• {totalCount} نتيجة</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => refetch()}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <RefreshCw size={16} className={isFetching ? "animate-spin" : ""} />
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
            <div className="lg:col-span-5">
              <label className="block text-sm font-medium text-gray-700 mb-2">بحث</label>
              <div className="relative">
                <Search
                  size={16}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  value={filters.search ?? ""}
                  onChange={(e) => updateFilter("search", e.target.value)}
                  placeholder="ابحث بالاسم أو البريد..."
                  className="w-full pr-9 pl-3 py-2.5 border border-gray-200 rounded-xl text-gray-700 bg-white focus:outline-none focus:ring-4 focus:ring-blue-200/70 focus:border-blue-300"
                />
              </div>
            </div>

            {/* Sort */}
            <div className="lg:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">الترتيب</label>
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

            {/* Page size */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">عدد العناصر</label>
              <div className="flex flex-wrap gap-2">
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
            </div>

            {/* Status */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">الحالة</label>
              <div className="grid grid-cols-2 gap-2">
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
                      className={`rounded-xl px-3 py-2 text-sm transition-all border ${
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
            </div>

            {/* Error */}
            <div className="lg:col-span-12">
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

      {/* Table / States */}
      {isLoading ? (
        <LoadingState />
      ) : isError ? (
        <ErrorState message={error instanceof Error ? error.message : undefined} />
      ) : users.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-gray-200/70 bg-white/90 backdrop-blur shadow-[0_10px_30px_-18px_rgba(0,0,0,0.35)] ring-1 ring-gray-200/50">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-b from-gray-50 to-white sticky top-0 z-10">
                <tr className="text-right text-xs font-semibold text-gray-700">
                  <th className="px-4 py-3">الاسم</th>
                  <th className="px-4 py-3 whitespace-nowrap">البريد</th>
                  <th className="px-4 py-3 whitespace-nowrap">الهاتف</th>
                  <th className="px-4 py-3">المكتب</th>
                  <th className="px-4 py-3 whitespace-nowrap">الصلاحية</th>
                  <th className="px-4 py-3 whitespace-nowrap">تاريخ الإنشاء</th>
                  <th className="px-4 py-3 whitespace-nowrap">الإجراءات</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200 bg-white">
                {users.map((user, index) => (
                  <tr
                    key={user.id}
                    className={`text-sm text-gray-800 transition-colors ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50/40"
                    } hover:bg-gradient-to-r hover:from-blue-50/60 hover:to-transparent`}
                  >
                    {/* Name */}
                    <td className="px-4 py-4 min-w-[260px]">
                      <div className="flex items-center gap-3">
                        <span className="inline-flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200/60 shadow-sm">
                          <UserCircle2 size={18} className="text-blue-700" />
                        </span>
                        <div className="min-w-0">
                          <div className="font-semibold text-gray-900 truncate" title={user.name}>
                            {user.name}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">ID: {user.id}</div>
                        </div>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="inline-flex items-center gap-2">
                        <Mail size={14} className="text-gray-400" />
                        <span className="text-gray-700">{user.email}</span>
                      </div>
                    </td>

                    {/* Phone */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="inline-flex items-center gap-2">
                        <Phone size={14} className="text-gray-400" />
                        <span className="text-gray-700" dir="ltr">
                          {user.phoneNumber || "—"}
                        </span>
                      </div>
                    </td>

                    {/* Office */}
                    <td className="px-4 py-4">
                      <div className="inline-flex items-center gap-2">
                        <Building2 size={14} className="text-gray-400" />
                        <span className="text-gray-700">{user.officeName || "—"}</span>
                      </div>
                    </td>

                    {/* Permission */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      <Pill
                        icon={ShieldCheck}
                        text={user.userPermissionName}
                        className="bg-blue-50 text-blue-700 border-blue-200"
                      />
                    </td>

                    {/* Created */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="inline-flex items-center gap-2">
                        <CalendarDays size={14} className="text-gray-400" />
                        <span className="text-gray-700">{formatDateAr(user.createdAt)}</span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <IconButton
                          title="عرض"
                          variant="blue"
                          onClick={() => setViewingUserId(user.id)}
                        >
                          <Eye size={14} />
                        </IconButton>

                        <IconButton
                          title="تعديل"
                          variant="purple"
                          onClick={() => setEditingUserId(user.id)}
                        >
                          <Edit size={16} />
                        </IconButton>

                        <IconButton
                          title="حذف"
                          variant="red"
                          disabled={deleteMutation.isPending}
                          onClick={() => handleDelete(user.id, user.name)}
                        >
                          {deleteMutation.isPending ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            <Trash2 size={16} />
                          )}
                        </IconButton>
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
            صفحة <span className="font-semibold text-gray-900">{pageNumber}</span> من{" "}
            <span className="font-semibold text-gray-900">{totalPages}</span>
          </span>
          <span className="text-gray-400">•</span>
          <span>
            عرض <span className="font-semibold text-gray-900">{users.length}</span> من{" "}
            <span className="font-semibold text-gray-900">{totalCount}</span>
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
      {showAddUserModal && (
        <ModalShell
          title="إضافة مستخدم جديد"
          icon={Plus}
          iconClassName="text-blue-700"
          onClose={() => setShowAddUserModal(false)}
        >
          <AddUserForm
            onSuccess={() => setShowAddUserModal(false)}
            onCancel={() => setShowAddUserModal(false)}
          />
        </ModalShell>
      )}

      {/* Edit Modal */}
      {editingUserId && (
        <ModalShell
          title="تعديل بيانات المستخدم"
          icon={Edit}
          iconClassName="text-purple-700"
          onClose={() => setEditingUserId(null)}
        >
          <EditUserForm
            userId={editingUserId}
            onSuccess={() => setEditingUserId(null)}
            onCancel={() => setEditingUserId(null)}
          />
        </ModalShell>
      )}

      {/* View Modal */}
      {viewingUserId && (
        <ModalShell
          title="تفاصيل المستخدم"
          icon={Eye}
          iconClassName="text-blue-700"
          onClose={() => setViewingUserId(null)}
        >
          {userDetails ? (
            <div className="space-y-6">
              {userDetails.imageURL && (
                <div className="flex justify-center">
                  <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-gray-200 shadow-sm">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={userDetails.imageURL}
                      alt={userDetails.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-xl border border-gray-200 bg-gradient-to-br from-blue-50 to-white p-4">
                  <div className="text-xs font-medium text-gray-600 mb-1">الاسم</div>
                  <div className="text-sm font-semibold text-gray-900">{userDetails.name}</div>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-4">
                  <div className="text-xs font-medium text-gray-600 mb-1">البريد الإلكتروني</div>
                  <div className="text-sm text-gray-900 break-words">{userDetails.email}</div>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-4">
                  <div className="text-xs font-medium text-gray-600 mb-1">رقم الهاتف</div>
                  <div className="text-sm text-gray-900" dir="ltr">
                    {userDetails.phoneNumber || "—"}
                  </div>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-4">
                  <div className="text-xs font-medium text-gray-600 mb-1">المكتب</div>
                  <div className="text-sm text-gray-900">{userDetails.officeName || "—"}</div>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-4 md:col-span-2">
                  <div className="text-xs font-medium text-gray-600 mb-2">الصلاحية</div>
                  <Pill
                    icon={ShieldCheck}
                    text={userDetails.userPermissionName || "—"}
                    className="bg-blue-50 text-blue-700 border-blue-200"
                  />
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-4 md:col-span-2">
                  <div className="text-xs font-medium text-gray-600 mb-1">تاريخ الإنشاء</div>
                  <div className="text-sm text-gray-900">
                    {userDetails.createdAt
                      ? new Date(userDetails.createdAt).toLocaleDateString("ar-EG", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : "—"}
                  </div>
                </div>

                <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4 md:col-span-2">
                  <div className="text-xs text-gray-600">
                    معرّف المستخدم:{" "}
                    <span className="font-mono font-semibold text-gray-900">
                      #{userDetails.id}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center py-10">
              {isFetchingUserDetails ? (
                <Loader2 className="animate-spin text-blue-600" size={28} />
              ) : (
                <p className="text-gray-600">لا توجد بيانات.</p>
              )}
            </div>
          )}
        </ModalShell>
      )}
    </section>
  );
}
