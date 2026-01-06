"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSelector } from "react-redux";
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
} from "lucide-react";
import toast from "react-hot-toast";

import {
  fetchUsers,
  deleteUser,
  getUserById,
} from "@/features/users/apis/usersApi";
import AddUserForm from "@/features/users/components/AddUserForm";
import EditUserForm from "@/features/users/components/EditUserForm";
import PageHeader from "@/shared/components/dashboard/PageHeader";
import { selectUserPermissions } from "@/features/permissions/permissionsSlice";
import type {
  UsersQueryParams,
  UserSummary,
} from "@/features/users/types/userTypes";

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
  onClose,
  children,
}: {
  title: string;
  icon?: React.ElementType;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-2xl mx-4 bg-white rounded-2xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            {Icon ? <Icon className="text-blue-600" size={22} /> : null}
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
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
      <p className="text-gray-800 font-medium">لا توجد بيانات مستخدمين مطابقة.</p>
      <p className="text-sm text-gray-600 mt-1">جرّب تغيير الفلاتر أو البحث.</p>
    </div>
  );
}

export default function UsersPage() {
  const [filters, setFilters] = useState<UsersQueryParams>(DEFAULT_FILTERS);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [viewingUserId, setViewingUserId] = useState<number | null>(null);

  // Permissions (kept as-is)
  // const permissions = useSelector(selectUserPermissions);
  // console.log("User Permissions from Redux:", permissions);

  useLockBodyScroll(showAddUserModal || !!editingUserId || !!viewingUserId);

  const queryClient = useQueryClient();

  const queryParams = useMemo(() => {
    return {
      ...filters,
      search: filters.search?.trim() || undefined,
      sort: filters.sort || undefined,
      isDeleted: filters.isDeleted ? true : undefined,
    } satisfies UsersQueryParams;
  }, [filters]);

  const { data, isLoading, isError, error, isFetching } = useQuery({
    queryKey: ["users", queryParams],
    queryFn: () => fetchUsers(queryParams),
  });

  const { data: userDetailsResponse, isFetching: isFetchingUserDetails } =
    useQuery({
      queryKey: ["user", viewingUserId],
      queryFn: () => getUserById(viewingUserId!),
      enabled: !!viewingUserId,
    });

  const userDetails = userDetailsResponse?.data;

  const deleteMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      toast.success("تم حذف المستخدم بنجاح");
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: () => toast.error("حدث خطأ أثناء حذف المستخدم"),
  });

  const handleDelete = async (userId: number, userName: string) => {
    if (
      confirm(`هل أنت متأكد من حذف المستخدم "${userName}"؟ لا يمكن التراجع.`)
    ) {
      await deleteMutation.mutateAsync(userId);
    }
  };

  const usersAll: UserSummary[] = data?.data?.data ?? [];
  const users = usersAll.filter((u) => u.role !== "OfficeAdmin");

  const totalCount = data?.data?.count ?? 0;
  const pageNumber = filters.pageNumber ?? 1;
  const pageSize = filters.pageSize ?? 10;
  const totalPages = Math.max(1, Math.ceil(totalCount / (pageSize || 1)));

  const updateFilter = <K extends keyof UsersQueryParams>(
    key: K,
    value: UsersQueryParams[K]
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

  return (
    <section className="space-y-6">
      {/* Header (same as other pages) */}
      <PageHeader
        title="المستخدمون"
        subtitle="إدارة ومتابعة أعضاء الفريق وصلاحياتهم."
        icon={Users}
        isFetching={isFetching}
        countLabel={`${totalCount} مستخدم`}
        onAdd={() => setShowAddUserModal(true)}
        addButtonLabel="إضافة مستخدم"
      />

      {/* Filters (White Card - same UI) */}
      <div className="rounded-xl bg-white border border-gray-200 shadow-sm p-4 sm:p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 text-gray-700 text-sm border border-gray-200">
            <span
              className="h-2 w-2 rounded-full bg-blue-600 animate-pulse"
              aria-hidden
            />
            فلاتر
          </div>

          <button
            type="button"
            onClick={resetFilters}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 bg-white text-gray-700 text-sm hover:bg-gray-50 transition-colors"
          >
            <span className="h-2 w-2 rounded-full bg-blue-600" aria-hidden />
            إعادة ضبط الفلاتر
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3">
          {/* Search */}
          <label className="flex flex-col gap-2 text-sm lg:col-span-2">
            <span className="text-gray-700 font-medium">بحث</span>
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
                className="w-full pr-9 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300"
              />
            </div>
          </label>

          {/* Sort */}
          <label className="flex flex-col gap-2 text-sm">
            <span className="text-gray-700 font-medium">الترتيب</span>
            <select
              value={filters.sort || ""}
              onChange={(e) => updateFilter("sort", e.target.value)}
              className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>

          {/* Status */}
          <label className="flex flex-col gap-2 text-sm lg:col-span-2">
            <span className="text-gray-700 font-medium">الحالة</span>
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
                    className={`rounded-lg px-3 py-2 text-sm border transition-colors ${
                      active
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </label>

          {/* Page size */}
          <label className="flex flex-col gap-2 text-sm">
            <span className="text-gray-700 font-medium">عدد العناصر</span>
            <div className="grid grid-cols-4 gap-2">
              {[5, 10, 20, 50].map((size) => {
                const active = pageSize === size;
                return (
                  <button
                    key={size}
                    type="button"
                    onClick={() => updateFilter("pageSize", size)}
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
      ) : users.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="rounded-xl bg-white border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr className="text-right text-sm text-gray-700">
                  <th className="px-4 py-3 font-semibold">الاسم</th>
                  <th className="px-4 py-3 font-semibold">البريد</th>
                  <th className="px-4 py-3 font-semibold">الهاتف</th>
                  <th className="px-4 py-3 font-semibold">المكتب</th>
                  <th className="px-4 py-3 font-semibold">الصلاحية</th>
                  <th className="px-4 py-3 font-semibold">تاريخ الإنشاء</th>
                  <th className="px-4 py-3 font-semibold">الإجراءات</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200">
                {users.map((user) => (
                  <tr
                    key={user.id}
                    className="text-sm text-gray-800 hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 min-w-[220px]">
                        <UserCircle2
                          size={16}
                          className="text-blue-600 shrink-0"
                        />
                        <span className="font-semibold text-gray-900 truncate">
                          {user.name}
                        </span>
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <div className="inline-flex items-center gap-2">
                        <Mail size={14} className="text-gray-400" />
                        <span className="text-gray-700">{user.email}</span>
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <div className="inline-flex items-center gap-2">
                        <Phone size={14} className="text-gray-400" />
                        <span className="text-gray-700" dir="ltr">
                          {user.phoneNumber || "—"}
                        </span>
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <div className="inline-flex items-center gap-2">
                        <Building2 size={14} className="text-gray-400" />
                        <span className="text-gray-700">
                          {user.officeName || "—"}
                        </span>
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium border bg-blue-50 text-blue-700 border-blue-200">
                        <ShieldCheck size={12} />
                        {user.userPermissionName}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <div className="inline-flex items-center gap-2">
                        <CalendarDays size={14} className="text-gray-400" />
                        <span className="text-gray-700">
                          {formatDateAr(user.createdAt)}
                        </span>
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setViewingUserId(user.id)}
                          className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium border border-blue-200 bg-blue-50 text-blue-800 hover:bg-blue-100 transition-colors"
                        >
                          عرض
                        </button>

                        <button
                          type="button"
                          onClick={() => setEditingUserId(user.id)}
                          className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium border border-cyan-200 bg-cyan-50 text-cyan-800 hover:bg-cyan-100 transition-colors"
                        >
                          <Edit size={14} />
                          تعديل
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(user.id, user.name)}
                          disabled={deleteMutation.isPending}
                          className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium border border-red-200 bg-red-50 text-red-800 hover:bg-red-100 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          {deleteMutation.isPending ? (
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

      {/* Add modal */}
      {showAddUserModal && (
        <ModalShell
          title="إضافة مستخدم جديد"
          icon={Plus}
          onClose={() => setShowAddUserModal(false)}
        >
          <AddUserForm
            onSuccess={() => setShowAddUserModal(false)}
            onCancel={() => setShowAddUserModal(false)}
          />
        </ModalShell>
      )}

      {/* Edit modal */}
      {editingUserId && (
        <ModalShell
          title="تعديل بيانات المستخدم"
          icon={Edit}
          onClose={() => setEditingUserId(null)}
        >
          <EditUserForm
            userId={editingUserId}
            onSuccess={() => setEditingUserId(null)}
            onCancel={() => setEditingUserId(null)}
          />
        </ModalShell>
      )}

      {/* View details modal */}
      {viewingUserId && (
        <ModalShell
          title="تفاصيل المستخدم"
          icon={Users}
          onClose={() => setViewingUserId(null)}
        >
          {userDetails ? (
            <div className="space-y-5">
              {userDetails.imageURL && (
                <div className="flex justify-center">
                  <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-gray-200">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={userDetails.imageURL}
                      alt={userDetails.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <div className="text-xs text-gray-500 font-medium">الاسم</div>
                  <div className="mt-1 text-gray-900 font-semibold">
                    {userDetails.name}
                  </div>
                </div>

                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <div className="text-xs text-gray-500 font-medium">
                    البريد الإلكتروني
                  </div>
                  <div className="mt-1 text-gray-900">{userDetails.email}</div>
                </div>

                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <div className="text-xs text-gray-500 font-medium">
                    رقم الهاتف
                  </div>
                  <div className="mt-1 text-gray-900">
                    {userDetails.phoneNumber || "—"}
                  </div>
                </div>

                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <div className="text-xs text-gray-500 font-medium">المكتب</div>
                  <div className="mt-1 text-gray-900">
                    {userDetails.officeName || "—"}
                  </div>
                </div>

                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 sm:col-span-2">
                  <div className="text-xs text-gray-500 font-medium">
                    الصلاحية
                  </div>
                  <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-800 border border-blue-200 w-fit">
                    <ShieldCheck size={14} />
                    {userDetails.userPermissionName || "—"}
                  </div>
                </div>

                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 sm:col-span-2">
                  <div className="text-xs text-gray-500 font-medium">
                    تاريخ الإنشاء
                  </div>
                  <div className="mt-1 text-gray-900">
                    {userDetails.createdAt
                      ? new Date(userDetails.createdAt).toLocaleDateString(
                          "ar-EG",
                          { year: "numeric", month: "long", day: "numeric" }
                        )
                      : "—"}
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
