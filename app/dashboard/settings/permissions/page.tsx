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
  { value: "createdAt desc", label: "الأحدث أولاً" },
  { value: "createdAt asc", label: "الأقدم أولاً" },
];

const levelPill = (v: number) => {
  // 0..3
  if (v === 0) return "bg-gray-50 text-gray-700 border-gray-200";
  if (v === 1) return "bg-blue-50 text-blue-700 border-blue-200";
  if (v === 2) return "bg-emerald-50 text-emerald-700 border-emerald-200";
  return "bg-purple-50 text-purple-700 border-purple-200";
};

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
      if (response?.succeeded) {
        toast.success(response.message || "تم حذف الصلاحية بنجاح");
        queryClient.invalidateQueries({ queryKey: ["permissions"] });
      } else {
        toast.error(response?.message || "تعذر حذف الصلاحية");
      }
    },
    onError: (error: unknown) => {
      const err = error as {
        response?: {
          data?: { message?: string; errors?: Record<string, string[]> };
        };
      };
      toast.error(
        err?.response?.data?.message || "حدث خطأ أثناء حذف الصلاحية"
      );
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
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize || 1));

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

  // view permission details
  const { data: permissionResponseByID, isLoading: isLoadingPermission } =
    useQuery({
      queryKey: ["permission", viewPermissionId],
      queryFn: () => getPermissionById(viewPermissionId as number),
      enabled: !!viewPermissionId,
    });

  const permissionDetails = permissionResponseByID;

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
      {/* Header (Cases Style) */}
      <div className="rounded-xl bg-white border border-gray-200 shadow-sm p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-semibold text-gray-900 flex items-center gap-3">
              <Shield className="text-blue-600" size={32} />
              الصلاحيات
            </h1>
            <p className="text-sm text-gray-600">
              إدارة صلاحيات المستخدمين والتحكم في مستويات الوصول.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {isFetching && (
              <span className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-50 text-blue-700 text-sm border border-blue-200">
                <span
                  className="h-2 w-2 rounded-full bg-blue-500 animate-pulse"
                  aria-hidden
                />
                يتم التحديث...
              </span>
            )}

            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-50 text-gray-700 text-sm border border-gray-200">
              <span className="h-2 w-2 rounded-full bg-green-500" aria-hidden />
              {totalCount} صلاحية
            </span>

            <button
              type="button"
              onClick={() => setShowAddPermissionModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
            >
              <ShieldPlus size={18} />
              إضافة صلاحية
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {/* Filters (Cases Style) */}
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Search */}
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-gray-700">بحث</span>
              <input
                type="text"
                value={filters.search ?? ""}
                onChange={(e) => updateFilter("search", e.target.value)}
                placeholder="ابحث باسم الصلاحية..."
                className="px-3 py-2 border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
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

            {/* Page Size */}
            <label className="flex flex-col gap-2">
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
            <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700 flex items-start gap-2">
              <AlertCircle size={18} className="mt-0.5" />
              <div>
                حدث خطأ أثناء جلب البيانات:{" "}
                {error instanceof Error ? error.message : ""}
              </div>
            </div>
          )}
        </div>

        {/* Table (Cases Style) */}
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr className="text-right text-sm font-semibold text-gray-700">
                  <th className="px-4 py-3">#</th>
                  <th className="px-4 py-3">اسم الصلاحية</th>
                  <th className="px-4 py-3">تاريخ الإنشاء</th>
                  <th className="px-4 py-3">الإجراءات</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200 bg-white">
                {isLoading ? (
                  [...Array(3)].map((_, idx) => (
                    <tr key={idx} className="animate-pulse">
                      {[...Array(4)].map((__, cellIdx) => (
                        <td key={cellIdx} className="px-4 py-3">
                          <div className="h-4 w-full rounded bg-gray-200" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : permissions.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-4 py-6 text-center text-gray-500"
                    >
                      لا توجد صلاحيات مطابقة.
                    </td>
                  </tr>
                ) : (
                  permissions.map((permission, index) => (
                    <tr
                      key={permission.id}
                      className="text-sm text-gray-700 transition-colors hover:bg-gray-50"
                    >
                      <td className="px-4 py-3 text-gray-500">
                        {(pageNumber - 1) * pageSize + index + 1}
                      </td>

                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 font-medium">
                          <Shield size={16} />
                          {permission.name}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-gray-600">
                        {permission.createdAt
                          ? new Date(permission.createdAt).toLocaleDateString(
                              "ar-EG"
                            )
                          : "—"}
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setViewPermissionId(permission.id);
                              setShowViewModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-800 transition-colors text-sm"
                          >
                            عرض
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setEditPermissionId(permission.id);
                              setShowEditModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-800 transition-colors text-sm"
                          >
                            تعديل
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleDelete(permission.id, permission.name)
                            }
                            disabled={deleteMutation.isPending}
                            className="text-red-600 hover:text-red-800 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {deleteMutation.isPending ? (
                              <Loader2 size={14} className="animate-spin inline" />
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

        {/* Pagination (Cases Style) */}
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

      {/* Add Modal (Cases Style) */}
      {showAddPermissionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setShowAddPermissionModal(false)}
          />
          <div className="relative w-full max-w-2xl mx-4 bg-white rounded-lg border border-gray-200 shadow-xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <ShieldPlus className="text-blue-600" size={20} />
                إضافة صلاحية جديدة
              </h2>
              <button
                type="button"
                onClick={() => setShowAddPermissionModal(false)}
                className="p-1 rounded hover:bg-gray-100 text-gray-500 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <AddPermissionForm
              onSuccess={() => setShowAddPermissionModal(false)}
              onCancel={() => setShowAddPermissionModal(false)}
            />
          </div>
        </div>
      )}

      {/* Edit Modal (Cases Style) */}
      {showEditModal && editPermissionId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => {
              setShowEditModal(false);
              setEditPermissionId(null);
            }}
          />
          <div className="relative w-full max-w-2xl mx-4 bg-white rounded-lg border border-gray-200 shadow-xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Edit className="text-blue-600" size={20} />
                تعديل الصلاحية
              </h2>
              <button
                type="button"
                onClick={() => {
                  setShowEditModal(false);
                  setEditPermissionId(null);
                }}
                className="p-1 rounded hover:bg-gray-100 text-gray-500 transition-colors"
              >
                <X size={20} />
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

      {/* View Modal (Clean) */}
      {showViewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={closeViewModal}
          />
          <div className="relative w-full max-w-2xl mx-4 bg-white rounded-lg border border-gray-200 shadow-xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Eye className="text-blue-600" size={20} />
                تفاصيل الصلاحية
              </h2>
              <button
                type="button"
                onClick={closeViewModal}
                className="p-1 rounded hover:bg-gray-100 text-gray-500 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {isLoadingPermission ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="animate-spin text-blue-600" size={40} />
              </div>
            ) : permissionDetails ? (
              <div className="space-y-4">
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
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
                      className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3"
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
