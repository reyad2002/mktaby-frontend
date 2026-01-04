"use client";

import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Shield,
  ShieldPlus,
  X,
  Eye,
  Loader2,
  Edit,
  Trash2,
  AlertCircle,
} from "lucide-react";
import toast from "react-hot-toast";

import {
  fetchPermissions,
  getPermissionById,
  deletePermission,
} from "@/features/permissions/apis/permissionsApi";
import AddPermissionForm from "@/features/permissions/components/AddPermissionForm";
import EditPermissionForm from "@/features/permissions/components/EditPermissionForm";
import PageHeader from "@/shared/components/dashboard/PageHeader";
import type {
  PermissionsQueryParams,
  PermissionSummary,
} from "@/features/permissions/types/permissionTypes";

const DEFAULT_FILTERS: PermissionsQueryParams = {
  pageNumber: 1,
  pageSize: 10,
  search: "",
  sort: "",
  isDeleted: false,
};

const SORT_OPTIONS = [
  { value: "", label: "بدون ترتيب" },
  { value: "createdAt desc", label: "الأحدث أولاً" },
  { value: "createdAt asc", label: "الأقدم أولاً" },
];

const levelPill = (v: number) => {
  if (v === 0) return "bg-gray-50 text-gray-700 border-gray-200";
  if (v === 1) return "bg-blue-50 text-blue-700 border-blue-200";
  if (v === 2) return "bg-emerald-50 text-emerald-700 border-emerald-200";
  return "bg-purple-50 text-purple-700 border-purple-200";
};

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
      <p className="text-gray-800 font-medium">لا توجد صلاحيات مطابقة.</p>
      <p className="text-sm text-gray-600 mt-1">جرّب تغيير الفلاتر أو البحث.</p>
    </div>
  );
}

export default function PermissionsPage() {
  const [filters, setFilters] =
    useState<PermissionsQueryParams>(DEFAULT_FILTERS);

  const [showAddPermissionModal, setShowAddPermissionModal] = useState(false);

  const [showViewModal, setShowViewModal] = useState(false);
  const [viewPermissionId, setViewPermissionId] = useState<number | null>(null);

  const [showEditModal, setShowEditModal] = useState(false);
  const [editPermissionId, setEditPermissionId] = useState<number | null>(null);

  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: deletePermission,
    onSuccess: (response) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((response as any)?.succeeded) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        toast.success((response as any)?.message || "تم حذف الصلاحية بنجاح");
        queryClient.invalidateQueries({ queryKey: ["permissions"] });
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        toast.error((response as any)?.message || "تعذر حذف الصلاحية");
      }
    },
    onError: (error: unknown) => {
      const err = error as {
        response?: {
          data?: { message?: string; errors?: Record<string, string[]> };
        };
      };
      toast.error(err?.response?.data?.message || "حدث خطأ أثناء حذف الصلاحية");
    },
  });

  const handleDelete = (id: number, name: string) => {
    if (window.confirm(`هل أنت متأكد من حذف الصلاحية "${name}"؟`)) {
      deleteMutation.mutate(id);
    }
  };

  const queryParams = useMemo(() => {
    return {
      ...filters,
      search: filters.search?.trim() || undefined,
      sort: filters.sort || undefined,
      isDeleted: filters.isDeleted ? true : undefined,
    } satisfies PermissionsQueryParams;
  }, [filters]);

  const { data, isLoading, isError, error, isFetching } = useQuery({
    queryKey: ["permissions", queryParams],
    queryFn: () => fetchPermissions(queryParams),
  });

  const permissions: PermissionSummary[] = data?.data?.data ?? [];
  const totalCount = data?.data?.count ?? 0;

  const pageNumber = filters.pageNumber ?? 1;
  const pageSize = filters.pageSize ?? 10;
  const totalPages = Math.max(1, Math.ceil(totalCount / (pageSize || 1)));

  const updateFilter = <K extends keyof PermissionsQueryParams>(
    key: K,
    value: PermissionsQueryParams[K]
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

  // View details
  const { data: permissionResponseByID, isLoading: isLoadingPermission } =
    useQuery({
      queryKey: ["permission", viewPermissionId],
      queryFn: () => getPermissionById(viewPermissionId as number),
      enabled: !!viewPermissionId,
    });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const permissionDetails = permissionResponseByID as any;

  const closeViewModal = () => {
    setShowViewModal(false);
    setViewPermissionId(null);
  };

  const getPermissionLabel = (level: number) => {
    switch (level) {
      case 0:
        return "لا يوجد";
      case 1:
        return "قراءة فقط";
      case 2:
        return "قراءة وكتابة";
      case 3:
        return "كامل الصلاحيات";
      default:
        return "غير محدد";
    }
  };

  return (
    <section className="space-y-6">
      {/* Header (Unified) */}
      <PageHeader
        title="الصلاحيات"
        subtitle="إدارة صلاحيات المستخدمين والتحكم في مستويات الوصول."
        icon={Shield}
        countLabel={`${totalCount} صلاحية`}
        onAdd={() => setShowAddPermissionModal(true)}
        addButtonLabel="إضافة صلاحية"
        isFetching={isFetching}
      />

      {/* Filters (White Card - same UI) */}
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search */}
          <label className="flex flex-col gap-2 text-sm">
            <span className="text-gray-700 font-medium">بحث</span>
            <input
              type="text"
              value={filters.search ?? ""}
              onChange={(e) => updateFilter("search", e.target.value)}
              placeholder="ابحث باسم الصلاحية..."
              className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-300"
            />
          </label>

          {/* Sort */}
          <label className="flex flex-col gap-2 text-sm">
            <span className="text-gray-700 font-medium">الترتيب</span>
            <select
              value={filters.sort || ""}
              onChange={(e) => updateFilter("sort", e.target.value)}
              className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-300"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>

          {/* Status */}
          <label className="flex flex-col gap-2 text-sm">
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
                        ? "bg-gray-900 text-white border-gray-900"
                        : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
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
        <ErrorState message={error instanceof Error ? error.message : ""} />
      ) : permissions.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="rounded-xl bg-white border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr className="text-right text-sm text-gray-700">
                  <th className="px-4 py-3 font-semibold">#</th>
                  <th className="px-4 py-3 font-semibold">اسم الصلاحية</th>
                  <th className="px-4 py-3 font-semibold">تاريخ الإنشاء</th>
                  <th className="px-4 py-3 font-semibold">الإجراءات</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200">
                {permissions.map((permission, index) => (
                  <tr
                    key={permission.id}
                    className="text-sm text-gray-800 hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3 text-gray-500">
                      {(pageNumber - 1) * pageSize + index + 1}
                    </td>

                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 font-semibold">
                        <Shield size={16} />
                        {permission.name}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-gray-700">
                      {permission.createdAt
                        ? new Date(permission.createdAt).toLocaleDateString(
                            "ar-EG"
                          )
                        : "—"}
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setViewPermissionId(permission.id);
                            setShowViewModal(true);
                          }}
                          className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium border border-blue-200 bg-blue-50 text-blue-800 hover:bg-blue-100 transition-colors"
                        >
                          <Eye size={14} />
                          عرض
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setEditPermissionId(permission.id);
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
                            handleDelete(permission.id, permission.name)
                          }
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

      {/* Add Modal (Premium) */}
      {showAddPermissionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowAddPermissionModal(false)}
          />
          <div className="relative w-full max-w-2xl mx-4 bg-white rounded-2xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <ShieldPlus className="text-emerald-600" size={22} />
                إضافة صلاحية جديدة
              </h2>
              <button
                type="button"
                onClick={() => setShowAddPermissionModal(false)}
                className="p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <AddPermissionForm
              onSuccess={() => setShowAddPermissionModal(false)}
              onCancel={() => setShowAddPermissionModal(false)}
            />
          </div>
        </div>
      )}

      {/* Edit Modal (Premium) */}
      {showEditModal && editPermissionId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => {
              setShowEditModal(false);
              setEditPermissionId(null);
            }}
          />
          <div className="relative w-full max-w-2xl mx-4 bg-white rounded-2xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <Edit className="text-cyan-600" size={22} />
                تعديل الصلاحية
              </h2>
              <button
                type="button"
                onClick={() => {
                  setShowEditModal(false);
                  setEditPermissionId(null);
                }}
                className="p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <EditPermissionForm
              permissionId={editPermissionId}
              onSuccess={() => {
                setShowEditModal(false);
                setEditPermissionId(null);
              }}
              onCancel={() => {
                setShowEditModal(false);
                setEditPermissionId(null);
              }}
            />
          </div>
        </div>
      )}

      {/* View Modal (Premium) */}
      {showViewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={closeViewModal}
          />
          <div className="relative w-full max-w-2xl mx-4 bg-white rounded-2xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <Eye className="text-blue-600" size={22} />
                تفاصيل الصلاحية
              </h2>
              <button
                type="button"
                onClick={closeViewModal}
                className="p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {isLoadingPermission ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="animate-spin text-blue-600" size={40} />
              </div>
            ) : permissionDetails ? (
              <div className="space-y-4">
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <p className="text-sm text-gray-600">اسم الصلاحية</p>
                  <p className="text-xl font-semibold text-gray-900 mt-1">
                    {permissionDetails.name}
                  </p>
                  {permissionDetails.createdAt && (
                    <p className="text-xs text-gray-600 mt-2">
                      تاريخ الإنشاء:{" "}
                      {new Date(permissionDetails.createdAt).toLocaleDateString(
                        "ar-EG"
                      )}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    {
                      label: "صلاحيات المستندات",
                      value: permissionDetails.documentPermissions,
                    },
                    {
                      label: "صلاحيات العملاء",
                      value: permissionDetails.clientPermissions,
                    },
                    {
                      label: "صلاحيات الجلسات",
                      value: permissionDetails.sessionPermission,
                    },
                    {
                      label: "صلاحيات المالية",
                      value: permissionDetails.financePermission,
                    },
                    {
                      label: "عرض القضايا",
                      value: permissionDetails.viewCasePermissions,
                    },
                    {
                      label: "إدارة القضايا",
                      value: permissionDetails.dmlCasePermissions,
                    },
                    {
                      label: "عرض المهام",
                      value: permissionDetails.viewTaskPermissions,
                    },
                    {
                      label: "إدارة المهام",
                      value: permissionDetails.dmlTaskPermissions,
                    },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-3"
                    >
                      <span className="text-sm text-gray-700">
                        {item.label}
                      </span>
                      <span
                        className={`text-xs font-medium px-2 py-1 rounded-full border ${levelPill(
                          item.value
                        )}`}
                      >
                        {getPermissionLabel(item.value)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={closeViewModal}
                    className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition-colors"
                  >
                    إغلاق
                  </button>
                </div>
              </div>
            ) : (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
                تعذر جلب بيانات الصلاحية.
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
