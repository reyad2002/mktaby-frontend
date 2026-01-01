"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Users,
  UserPlus,
  X,
  Loader2,
  Edit,
  Eye,
  Trash2,
  RefreshCcw,
  Search,
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
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-2xl mx-4 bg-white rounded-lg border border-gray-200 shadow-xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded hover:bg-gray-100 text-gray-500 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export default function UsersPage() {
  const [filters, setFilters] = useState<UsersQueryParams>(DEFAULT_FILTERS);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [viewingUserId, setViewingUserId] = useState<number | null>(null);

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

  // Users list
  const { data, isLoading, isError, error, isFetching, refetch } = useQuery({
    queryKey: ["users", queryParams],
    queryFn: () => fetchUsers(queryParams),
  });

  // View user details
  const { data: userDetailsResponse, isFetching: isFetchingUserDetails } =
    useQuery({
      queryKey: ["user", viewingUserId],
      queryFn: () => getUserById(viewingUserId!),
      enabled: !!viewingUserId,
    });

  const userDetails = userDetailsResponse?.data;

  // Delete user
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
  // نفس سلوكك: إخفاء OfficeAdmin
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

  const pendingAny = isFetching || deleteMutation.isPending;

  return (
    <section className="space-y-6">
      {/* Header */}
      <PageHeader
        title="المستخدمون"
        subtitle="إدارة ومتابعة أعضاء الفريق وصلاحياتهم."
        icon={Users}
        isFetching={isFetching}
        countLabel={`${totalCount} مستخدم`}
        // onRefresh={refetch}
        onAdd={() => setShowAddUserModal(true)}
        addButtonLabel="إضافة مستخدم"
      />

      <div className="space-y-4">
        {/* Filters - زي cases */}
        <div className="rounded-lg bg-white border border-gray-200 shadow-sm p-4">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="text-sm text-gray-600">فلاتر تفاعلية</div>
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            >
              إعادة ضبط الفلاتر
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3">
            {/* Search */}
            <label className="flex flex-col gap-2 lg:col-span-2">
              <span className="text-sm font-medium text-gray-700">بحث</span>
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
                  className="w-full pr-9 px-3 py-2 border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </label>

            {/* Sort */}
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-gray-700">الترتيب</span>
              <select
                value={filters.sort || ""}
                onChange={(e) => updateFilter("sort", e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            {/* Status */}
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-gray-700">الحالة</span>
              <div className="flex gap-2">
                {[
                  { value: false, label: "نشط" },
                  { value: true, label: "محذوف" },
                ].map((opt) => {
                  const isActive = filters.isDeleted === opt.value;
                  return (
                    <button
                      key={String(opt.value)}
                      type="button"
                      onClick={() => updateFilter("isDeleted", opt.value)}
                      className={`flex-1 rounded-lg px-3 py-2 text-sm transition-all border ${
                        isActive
                          ? "bg-blue-50 text-blue-700 border-blue-200"
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
            <label className="flex flex-col gap-2 lg:col-span-2">
              <span className="text-sm font-medium text-gray-700">
                عدد العناصر
              </span>
              <div className="flex flex-wrap gap-2">
                {[5, 10, 20, 50].map((size) => {
                  const isActive = pageSize === size;
                  return (
                    <button
                      key={size}
                      type="button"
                      onClick={() => updateFilter("pageSize", size)}
                      className={`px-3 py-2 text-sm rounded-lg transition-all border ${
                        isActive
                          ? "bg-blue-50 text-blue-700 border-blue-200"
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
            <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
              حدث خطأ أثناء جلب البيانات:{" "}
              {error instanceof Error ? error.message : ""}
            </div>
          )}
        </div>

        {/* Table - زي cases */}
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr className="text-right text-sm font-semibold text-gray-700">
                  <th className="px-4 py-3">الاسم</th>
                  <th className="px-4 py-3">البريد</th>
                  <th className="px-4 py-3">الهاتف</th>
                  <th className="px-4 py-3">المكتب</th>
                  <th className="px-4 py-3">الصلاحية</th>
                  <th className="px-4 py-3">تاريخ الإنشاء</th>
                  <th className="px-4 py-3">الإجراءات</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200 bg-white">
                {isLoading ? (
                  [...Array(6)].map((_, idx) => (
                    <tr key={idx} className="animate-pulse">
                      {[...Array(7)].map((__, cellIdx) => (
                        <td key={cellIdx} className="px-4 py-3">
                          <div className="h-4 w-full rounded bg-gray-200" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : users.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-10 text-center text-gray-500"
                    >
                      لا توجد بيانات مستخدمين مطابقة.
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr
                      key={user.id}
                      className="text-sm text-gray-700 transition-colors hover:bg-gray-50"
                    >
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {user.name}
                      </td>
                      <td className="px-4 py-3 text-gray-700">{user.email}</td>
                      <td className="px-4 py-3 text-gray-700">
                        {user.phoneNumber}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {user.officeName}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-2 px-3 py-1 text-xs font-medium rounded-lg bg-blue-50 text-blue-700 border border-blue-200">
                          {user.userPermissionName}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {formatDateAr(user.createdAt)}
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setViewingUserId(user.id)}
                            className="text-blue-600 hover:text-blue-800 transition-colors text-sm"
                            title="عرض"
                          >
                            عرض
                          </button>

                          <button
                            type="button"
                            onClick={() => setEditingUserId(user.id)}
                            className="text-blue-600 hover:text-blue-800 transition-colors text-sm"
                            title="تعديل"
                          >
                            تعديل
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(user.id, user.name)}
                            disabled={deleteMutation.isPending}
                            className="text-red-600 hover:text-red-800 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            title="حذف"
                          >
                            {deleteMutation.isPending ? (
                              <Loader2
                                size={14}
                                className="animate-spin inline"
                              />
                            ) : (
                              "حذف"
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination - زي cases */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-600 shadow-sm">
          <div>
            صفحة {pageNumber} من {totalPages}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(pageNumber - 1)}
              disabled={pageNumber <= 1}
              className="px-3 py-2 rounded-lg border border-gray-200 text-gray-700 disabled:opacity-50 hover:bg-gray-50 transition-colors"
            >
              السابق
            </button>
            <button
              onClick={() => handlePageChange(pageNumber + 1)}
              disabled={pageNumber >= totalPages}
              className="px-3 py-2 rounded-lg border border-gray-200 text-gray-700 disabled:opacity-50 hover:bg-gray-50 transition-colors"
            >
              التالي
            </button>
          </div>
        </div>
      </div>

      {/* Add modal */}
      {showAddUserModal && (
        <ModalShell
          title="إضافة مستخدم جديد"
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
          onClose={() => setViewingUserId(null)}
        >
          {userDetails ? (
            <div className="space-y-4">
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

              <div className="space-y-3">
                <div className="flex flex-col gap-1">
                  <span className="text-sm text-gray-500 font-medium">
                    الاسم
                  </span>
                  <span className="text-base text-gray-900 font-semibold">
                    {userDetails.name}
                  </span>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-sm text-gray-500 font-medium">
                    البريد الإلكتروني
                  </span>
                  <span className="text-base text-gray-900">
                    {userDetails.email}
                  </span>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-sm text-gray-500 font-medium">
                    رقم الهاتف
                  </span>
                  <span className="text-base text-gray-900">
                    {userDetails.phoneNumber || "—"}
                  </span>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-sm text-gray-500 font-medium">
                    المكتب
                  </span>
                  <span className="text-base text-gray-900">
                    {userDetails.officeName || "—"}
                  </span>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-sm text-gray-500 font-medium">
                    الصلاحية
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-800 border border-blue-200 w-fit">
                    {userDetails.userPermissionName || "—"}
                  </span>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-sm text-gray-500 font-medium">
                    تاريخ الإنشاء
                  </span>
                  <span className="text-base text-gray-900">
                    {userDetails.createdAt
                      ? new Date(userDetails.createdAt).toLocaleDateString(
                          "ar-EG",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          }
                        )
                      : "—"}
                  </span>
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
