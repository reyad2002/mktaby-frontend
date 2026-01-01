"use client";

import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { LucideIcon } from "lucide-react";
import {
  Scale,
  Plus,
  X,
  Loader2,
  Edit,
  Trash2,
  Archive,
  RotateCcw,
  Building2,
  Phone,
  MapPin,
  AlertCircle,
} from "lucide-react";
import toast from "react-hot-toast";

import {
  getCourtsResourcesApi,
  softDeleteCourtApi,
  hardDeleteCourtApi,
  restoreCourtApi,
} from "@/features/courts/apis/courtsApis";

import AddCourtForm from "@/features/courts/components/AddCourtForm";
import EditCourtForm from "@/features/courts/components/EditCourtForm";
import PageHeader from "@/shared/components/dashboard/PageHeader";
import type {
  Params,
  CourtsResource,
} from "@/features/courts/types/courtsTypes";

const DEFAULT_FILTERS: Params = {
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
  { value: "name asc", label: "الاسم (أ-ي)" },
  { value: "name desc", label: "الاسم (ي-أ)" },
];

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
      <p className="text-gray-800 font-medium">لا توجد محاكم مطابقة.</p>
      <p className="text-sm text-gray-600 mt-1">جرّب تغيير الفلاتر أو البحث.</p>
    </div>
  );
}

function Pill({
  icon: Icon,
  text,
  tone = "blue",
}: {
  icon?: LucideIcon;
  text: string;
  tone?: "blue" | "gray";
}) {
  const cls =
    tone === "blue"
      ? "bg-blue-50 text-blue-700 border-blue-200"
      : "bg-gray-50 text-gray-700 border-gray-200";
  return (
    <span
      className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium border ${cls}`}
    >
      {Icon ? <Icon size={12} /> : null}
      {text}
    </span>
  );
}

export default function CourtsPage() {
  const [filters, setFilters] = useState<Params>(DEFAULT_FILTERS);
  const [showAddCourtModal, setShowAddCourtModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editCourtId, setEditCourtId] = useState<number | null>(null);

  const queryClient = useQueryClient();

  // Soft delete
  const softDeleteMutation = useMutation({
    mutationFn: softDeleteCourtApi,
    onSuccess: (response) => {
      if (response?.succeeded) {
        toast.success(response.message || "تم أرشفة المحكمة بنجاح");
        queryClient.invalidateQueries({ queryKey: ["courts"] });
      } else {
        toast.error(response?.message || "تعذر أرشفة المحكمة");
      }
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(
        err?.response?.data?.message || "حدث خطأ أثناء أرشفة المحكمة"
      );
    },
  });

  // Hard delete
  const hardDeleteMutation = useMutation({
    mutationFn: hardDeleteCourtApi,
    onSuccess: (response) => {
      if (response?.succeeded) {
        toast.success(response.message || "تم حذف المحكمة نهائياً");
        queryClient.invalidateQueries({ queryKey: ["courts"] });
      } else {
        toast.error(response?.message || "تعذر حذف المحكمة");
      }
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err?.response?.data?.message || "حدث خطأ أثناء حذف المحكمة");
    },
  });

  // Restore
  const restoreMutation = useMutation({
    mutationFn: restoreCourtApi,
    onSuccess: (response) => {
      if (response?.succeeded) {
        toast.success(response.message || "تم استعادة المحكمة بنجاح");
        queryClient.invalidateQueries({ queryKey: ["courts"] });
      } else {
        toast.error(response?.message || "تعذر استعادة المحكمة");
      }
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(
        err?.response?.data?.message || "حدث خطأ أثناء استعادة المحكمة"
      );
    },
  });

  const handleSoftDelete = (id: number, name: string) => {
    if (
      window.confirm(`هل تريد أرشفة المحكمة "${name}"؟\nيمكن استعادتها لاحقاً.`)
    ) {
      softDeleteMutation.mutate(id);
    }
  };

  const handleHardDelete = (id: number, name: string) => {
    if (
      window.confirm(
        `⚠️ تحذير: هل أنت متأكد من حذف المحكمة "${name}" نهائياً؟\nلا يمكن التراجع عن هذا الإجراء!`
      )
    ) {
      hardDeleteMutation.mutate(id);
    }
  };

  const handleRestore = (id: number, name: string) => {
    if (window.confirm(`هل تريد استعادة المحكمة "${name}"؟`)) {
      restoreMutation.mutate(id);
    }
  };

  const queryParams = useMemo(() => {
    return {
      ...filters,
      search: filters.search?.trim() || undefined,
      sort: filters.sort || undefined,
      isDeleted: filters.isDeleted ? true : undefined,
    } satisfies Params;
  }, [filters]);

  const { data, isLoading, isError, error, isFetching } = useQuery({
    queryKey: ["courts", queryParams],
    queryFn: () => getCourtsResourcesApi(queryParams),
  });

  const courts: CourtsResource[] = data?.data?.data ?? [];
  const totalCount = data?.data?.count ?? 0;

  const pageNumber = filters.pageNumber ?? 1;
  const pageSize = filters.pageSize ?? 10;
  const totalPages = Math.max(1, Math.ceil(totalCount / (pageSize || 1)));

  const updateFilter = <K extends keyof Params>(key: K, value: Params[K]) => {
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
      {/* Header (Cases-style White) */}
      <PageHeader
        title="المحاكم"
        subtitle="إدارة بيانات المحاكم ومعلومات الاتصال الخاصة بها."
        icon={Scale}
        countLabel={`${totalCount} محكمة`}
        onAdd={() => setShowAddCourtModal(true)}
        addButtonLabel="إضافة محكمة"
        isFetching={isFetching}
      />

      {/* Filters (White Card) */}
      <div className="rounded-xl bg-white border border-gray-200 shadow-sm p-4 sm:p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 text-gray-700 text-sm border border-gray-200">
            <span
              className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search */}
          <label className="flex flex-col gap-2 text-sm">
            <span className="text-gray-700 font-medium">بحث</span>
            <div className="relative">
              <input
                type="text"
                value={filters.search ?? ""}
                onChange={(e) => updateFilter("search", e.target.value)}
                placeholder="ابحث باسم المحكمة"
                className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300"
              />
            </div>
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

      {/* Table (White) */}
      {isLoading ? (
        <LoadingState />
      ) : isError ? (
        <ErrorState />
      ) : courts.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="rounded-xl bg-white border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr className="text-right text-sm text-gray-700">
                  <th className="px-4 py-3 font-semibold">ID</th>
                  <th className="px-4 py-3 font-semibold">اسم المحكمة</th>
                  <th className="px-4 py-3 font-semibold">النوع</th>
                  <th className="px-4 py-3 font-semibold">المدينة</th>
                  <th className="px-4 py-3 font-semibold">العنوان</th>
                  <th className="px-4 py-3 font-semibold">الهاتف</th>
                  <th className="px-4 py-3 font-semibold">الإجراءات</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200">
                {courts.map((court) => {
                  const busy =
                    softDeleteMutation.isPending ||
                    hardDeleteMutation.isPending ||
                    restoreMutation.isPending;

                  return (
                    <tr
                      key={court.id}
                      className="text-sm text-gray-800 hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-3 text-gray-500">{court.id}</td>

                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 min-w-[200px]">
                          <Building2
                            size={16}
                            className="text-blue-600 shrink-0"
                          />
                          <span
                            className="font-semibold text-gray-900 truncate"
                            title={court.name}
                          >
                            {court.name}
                          </span>
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <Pill
                          icon={Scale}
                          text={court.type?.label || "—"}
                          tone="blue"
                        />
                      </td>

                      <td className="px-4 py-3">
                        <div className="inline-flex items-center gap-2">
                          <MapPin size={14} className="text-gray-400" />
                          <span className="text-gray-700">
                            {court.city || "—"}
                          </span>
                        </div>
                      </td>

                      <td className="px-4 py-3 max-w-[340px]">
                        <span
                          className="text-gray-700 break-words"
                          title={court.address}
                        >
                          {court.address || "—"}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        <div className="inline-flex items-center gap-2">
                          <Phone size={14} className="text-gray-400" />
                          <span className="text-gray-700" dir="ltr">
                            {court.phoneNumber || "—"}
                          </span>
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setEditCourtId(court.id);
                              setShowEditModal(true);
                            }}
                            className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium border border-cyan-200 bg-cyan-50 text-cyan-800 hover:bg-cyan-100 transition-colors"
                          >
                            <Edit size={14} />
                            تعديل
                          </button>

                          {filters.isDeleted ? (
                            <button
                              type="button"
                              onClick={() =>
                                handleRestore(court.id, court.name)
                              }
                              disabled={restoreMutation.isPending}
                              className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium border border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                              title="استعادة المحكمة"
                            >
                              {restoreMutation.isPending ? (
                                <Loader2 size={14} className="animate-spin" />
                              ) : (
                                <RotateCcw size={14} />
                              )}
                              استعادة
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() =>
                                handleSoftDelete(court.id, court.name)
                              }
                              disabled={softDeleteMutation.isPending}
                              className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium border border-amber-200 bg-amber-50 text-amber-900 hover:bg-amber-100 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                              title="أرشفة (يمكن الاستعادة)"
                            >
                              {softDeleteMutation.isPending ? (
                                <Loader2 size={14} className="animate-spin" />
                              ) : (
                                <Archive size={14} />
                              )}
                              أرشفة
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() =>
                              handleHardDelete(court.id, court.name)
                            }
                            disabled={hardDeleteMutation.isPending}
                            className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium border border-red-200 bg-red-50 text-red-800 hover:bg-red-100 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                            title="حذف نهائي (لا يمكن التراجع)"
                          >
                            {hardDeleteMutation.isPending ? (
                              <Loader2 size={14} className="animate-spin" />
                            ) : (
                              <Trash2 size={14} />
                            )}
                            حذف
                          </button>
                        </div>

                        {busy && (
                          <div className="mt-2 text-[11px] text-gray-500">
                            جاري تنفيذ عملية...
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
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

      {/* Add Modal */}
      {showAddCourtModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowAddCourtModal(false)}
          />
          <div className="relative w-full max-w-2xl mx-4 bg-white rounded-2xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <Plus className="text-blue-600" size={22} />
                إضافة محكمة جديدة
              </h2>
              <button
                type="button"
                onClick={() => setShowAddCourtModal(false)}
                className="p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <AddCourtForm
              onSuccess={() => setShowAddCourtModal(false)}
              onCancel={() => setShowAddCourtModal(false)}
            />
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editCourtId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => {
              setShowEditModal(false);
              setEditCourtId(null);
            }}
          />
          <div className="relative w-full max-w-2xl mx-4 bg-white rounded-2xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <Edit className="text-cyan-600" size={22} />
                تعديل المحكمة
              </h2>
              <button
                type="button"
                onClick={() => {
                  setShowEditModal(false);
                  setEditCourtId(null);
                }}
                className="p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <EditCourtForm
              courtId={editCourtId}
              onSuccess={() => {
                setShowEditModal(false);
                setEditCourtId(null);
              }}
              onCancel={() => {
                setShowEditModal(false);
                setEditCourtId(null);
              }}
            />
          </div>
        </div>
      )}
    </section>
  );
}
