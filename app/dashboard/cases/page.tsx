"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Briefcase,
  X,
  Loader2,
  Lock,
  Search,
  SlidersHorizontal,
  Trash2,
  Archive,
  RotateCcw,
  Eye,
  Pencil,
} from "lucide-react";
import toast from "react-hot-toast";

import {
  getCases,
  getCaseTypes,
  getCaseStatuses,
  softDeleteCase,
  hardDeleteCase,
  restoreCase,
} from "@/features/cases/apis/casesApis";

import AddCaseForm from "@/features/cases/components/AddCaseForm";
import EditCaseForm from "@/features/cases/components/EditCaseForm";
import PageHeader from "@/shared/components/dashboard/PageHeader";

import type {
  GetCasesQuery,
  CaseListItem,
  CaseTypeValues,
  CaseStatusValues,
} from "@/features/cases/types/casesTypes";

const DEFAULT_FILTERS: GetCasesQuery = {
  PageNumber: 1,
  PageSize: 10,
  Search: "",
  Sort: "",
  CaseType: undefined,
  CaseStatus: undefined,
  IsDeleted: false,
};

const SORT_OPTIONS = [
  { value: "", label: "بدون ترتيب" },
  { value: "createdAt desc", label: "الأحدث أولاً" },
  { value: "createdAt asc", label: "الأقدم أولاً" },
  { value: "name asc", label: "الاسم (أ-ي)" },
  { value: "name desc", label: "الاسم (ي-أ)" },
  { value: "openedAt desc", label: "تاريخ الفتح (الأحدث)" },
  { value: "openedAt asc", label: "تاريخ الفتح (الأقدم)" },
];

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    Active: "bg-green-50 text-green-700 border-green-200",
    UnderReview: "bg-yellow-50 text-yellow-700 border-yellow-200",
    UnderInvestigation: "bg-orange-50 text-orange-700 border-orange-200",
    ReadyForHearing: "bg-blue-50 text-blue-700 border-blue-200",
    InCourt: "bg-purple-50 text-purple-700 border-purple-200",
    Postponed: "bg-gray-50 text-gray-700 border-gray-200",
    ReservedForJudgment: "bg-indigo-50 text-indigo-700 border-indigo-200",
    Completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
    Closed: "bg-slate-50 text-slate-700 border-slate-200",
    Rejected: "bg-red-50 text-red-700 border-red-200",
    Cancelled: "bg-rose-50 text-rose-700 border-rose-200",
    Settled: "bg-teal-50 text-teal-700 border-teal-200",
    Suspended: "bg-amber-50 text-amber-700 border-amber-200",
    Archived: "bg-zinc-50 text-zinc-700 border-zinc-200",
    Appealed: "bg-cyan-50 text-cyan-700 border-cyan-200",
    Executed: "bg-lime-50 text-lime-700 border-lime-200",
  };
  return colors[status] || "bg-gray-50 text-gray-700 border-gray-200";
};

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
      <div className="relative w-full max-w-2xl mx-4 bg-white rounded-2xl border border-gray-200 shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900">
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

export default function CasesPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [filters, setFilters] = useState<GetCasesQuery>(DEFAULT_FILTERS);
  const [showAddCaseModal, setShowAddCaseModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editCaseId, setEditCaseId] = useState<number | null>(null);

  useLockBodyScroll(showAddCaseModal || showEditModal);

  // Lookups
  const { data: caseTypes = [] } = useQuery({
    queryKey: ["caseTypes"],
    queryFn: getCaseTypes,
  });

  const { data: caseStatuses = [] } = useQuery({
    queryKey: ["caseStatuses"],
    queryFn: getCaseStatuses,
  });

  // Mutations
  const softDeleteMutation = useMutation({
    mutationFn: softDeleteCase,
    onSuccess: (response) => {
      if (response?.succeeded) {
        toast.success(response.message || "تم أرشفة القضية بنجاح");
        queryClient.invalidateQueries({ queryKey: ["cases"] });
      } else toast.error(response?.message || "تعذر أرشفة القضية");
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err?.response?.data?.message || "حدث خطأ أثناء أرشفة القضية");
    },
  });

  const hardDeleteMutation = useMutation({
    mutationFn: hardDeleteCase,
    onSuccess: (response) => {
      if (response?.succeeded) {
        toast.success(response.message || "تم حذف القضية نهائياً");
        queryClient.invalidateQueries({ queryKey: ["cases"] });
      } else toast.error(response?.message || "تعذر حذف القضية");
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err?.response?.data?.message || "حدث خطأ أثناء حذف القضية");
    },
  });

  const restoreMutation = useMutation({
    mutationFn: restoreCase,
    onSuccess: (response) => {
      if (response?.succeeded) {
        toast.success(response.message || "تم استعادة القضية بنجاح");
        queryClient.invalidateQueries({ queryKey: ["cases"] });
      } else toast.error(response?.message || "تعذر استعادة القضية");
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err?.response?.data?.message || "حدث خطأ أثناء الاستعادة");
    },
  });

  const queryParams = useMemo(() => {
    return {
      ...filters,
      Search: filters.Search?.trim() || undefined,
      Sort: filters.Sort || undefined,
      CaseType: filters.CaseType || undefined,
      CaseStatus: filters.CaseStatus || undefined,
      IsDeleted: filters.IsDeleted ? true : undefined,
    } satisfies GetCasesQuery;
  }, [filters]);

  const { data, isLoading, isError, error, isFetching, refetch } = useQuery({
    queryKey: ["cases", queryParams],
    queryFn: () => getCases(queryParams),
  });

  const cases: CaseListItem[] = data?.data?.data ?? [];
  const totalCount = data?.data?.count ?? 0;
  const pageNumber = filters.PageNumber ?? 1;
  const pageSize = filters.PageSize ?? 10;
  const totalPages = Math.max(1, Math.ceil(totalCount / (pageSize || 1)));

  const updateFilter = <K extends keyof GetCasesQuery>(
    key: K,
    value: GetCasesQuery[K]
  ) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      PageNumber: key === "Search" ? 1 : prev.PageNumber,
    }));
  };

  const resetFilters = () => setFilters(DEFAULT_FILTERS);

  const handlePageChange = (nextPage: number) => {
    if (nextPage < 1 || nextPage > totalPages) return;
    setFilters((prev) => ({ ...prev, PageNumber: nextPage }));
  };

  const handleSoftDelete = (id: number, name: string) => {
    if (
      window.confirm(`هل تريد أرشفة القضية "${name}"؟\nيمكن استعادتها لاحقاً.`)
    ) {
      softDeleteMutation.mutate(id);
    }
  };

  const handleHardDelete = (id: number, name: string) => {
    if (
      window.confirm(
        `⚠️ تحذير: هل أنت متأكد من حذف القضية "${name}" نهائياً؟\nلا يمكن التراجع عن هذا الإجراء!`
      )
    ) {
      hardDeleteMutation.mutate(id);
    }
  };

  const handleRestore = (id: number, name: string) => {
    if (window.confirm(`هل تريد استعادة القضية "${name}"؟`)) {
      restoreMutation.mutate(id);
    }
  };

  return (
    <section className="space-y-6">
      {/* Header */}
      <PageHeader
        title="القضايا"
        subtitle="إدارة ومتابعة القضايا والملفات القانونية."
        icon={Briefcase}
        isFetching={isFetching}
        countLabel={`${totalCount} قضية`}
        // onRefresh={refetch}
        onAdd={() => setShowAddCaseModal(true)}
        addButtonLabel="إضافة قضية"
      />

      {/* Filters toolbar */}
      <div className="rounded-2xl bg-white border border-gray-200 shadow-sm p-4">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <SlidersHorizontal size={16} className="text-gray-500" />
            فلاتر البحث
          </div>

          <button
            type="button"
            onClick={resetFilters}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-xl transition-colors border border-gray-200"
          >
            إعادة ضبط
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
          {/* Search */}
          <div className="lg:col-span-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              بحث
            </label>
            <div className="relative">
              <Search
                size={16}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                value={filters.Search ?? ""}
                onChange={(e) => updateFilter("Search", e.target.value)}
                placeholder="ابحث باسم القضية..."
                className="w-full pr-9 pl-3 py-2.5 border border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Case Type */}
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              نوع القضية
            </label>
            <select
              value={filters.CaseType || ""}
              onChange={(e) =>
                updateFilter(
                  "CaseType",
                  (e.target.value as CaseTypeValues) || undefined
                )
              }
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            >
              <option value="">الكل</option>
              {caseTypes.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          {/* Case Status */}
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              حالة القضية
            </label>
            <select
              value={filters.CaseStatus || ""}
              onChange={(e) =>
                updateFilter(
                  "CaseStatus",
                  (e.target.value as CaseStatusValues) || undefined
                )
              }
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            >
              <option value="">الكل</option>
              {caseStatuses.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              الترتيب
            </label>
            <select
              value={filters.Sort || ""}
              onChange={(e) => updateFilter("Sort", e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          {/* Page size */}
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              عدد العناصر
            </label>
            <div className="flex flex-wrap gap-2">
              {[5, 10, 20, 50].map((size) => {
                const active = pageSize === size;
                return (
                  <button
                    key={size}
                    type="button"
                    onClick={() => updateFilter("PageSize", size)}
                    className={`px-3 py-2 text-sm rounded-xl transition-all border ${
                      active
                        ? "bg-blue-50 text-blue-700 border-blue-200"
                        : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active/Deleted toggle */}
          <div className="lg:col-span-12">
            <div className="mt-2 flex items-center justify-between gap-3">
              <div className="flex gap-2">
                {[
                  { value: false, label: "نشط" },
                  { value: true, label: "محذوف" },
                ].map((opt) => {
                  const active = filters.IsDeleted === opt.value;
                  return (
                    <button
                      key={String(opt.value)}
                      type="button"
                      onClick={() => updateFilter("IsDeleted", opt.value)}
                      className={`rounded-xl px-4 py-2 text-sm transition-all border ${
                        active
                          ? "bg-blue-50 text-blue-700 border-blue-200"
                          : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>

              {isError && (
                <div className="text-sm text-red-700 bg-red-50 border border-red-200 px-3 py-2 rounded-xl">
                  حدث خطأ: {error instanceof Error ? error.message : ""}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr className="text-right text-xs font-semibold text-gray-700">
                <th className="px-4 py-3">رقم القضية</th>
                <th className="px-4 py-3">الاسم</th>
                <th className="px-4 py-3">النوع</th>
                <th className="px-4 py-3">الحالة</th>
                <th className="px-4 py-3">العميل</th>
                <th className="px-4 py-3">المحكمة</th>
                <th className="px-4 py-3">تاريخ الفتح</th>
                <th className="px-4 py-3">الإجراءات</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200 bg-white">
              {isLoading ? (
                [...Array(6)].map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    {[...Array(8)].map((__, cellIdx) => (
                      <td key={cellIdx} className="px-4 py-4">
                        <div className="h-4 w-full rounded bg-gray-200" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : cases.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-10 text-center text-gray-500"
                  >
                    لا توجد قضايا مطابقة.
                  </td>
                </tr>
              ) : (
                cases.map((caseItem) => (
                  <tr
                    key={caseItem.id}
                    className="text-sm text-gray-700 hover:bg-gray-50/60 transition-colors"
                  >
                    <td className="px-4 py-4 font-semibold text-blue-700">
                      {caseItem.caseNumber}
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">
                          {caseItem.name}
                        </span>
                        {caseItem.isPrivate && (
                          <span className="inline-flex items-center gap-1 rounded-lg border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs text-amber-700">
                            <Lock size={12} />
                            خاصة
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-lg bg-blue-50 text-blue-700 border border-blue-200">
                        {caseItem.caseType.label}
                      </span>
                    </td>

                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-lg border ${getStatusColor(
                          caseItem.caseStatus.value
                        )}`}
                      >
                        {caseItem.caseStatus.label}
                      </span>
                    </td>

                    <td className="px-4 py-4">{caseItem.clientName}</td>
                    <td className="px-4 py-4">{caseItem.courtName}</td>

                    <td className="px-4 py-4 text-gray-600">
                      {formatDateAr(caseItem.openedAt)}
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            router.push(`/dashboard/cases/${caseItem.id}`)
                          }
                          className="inline-flex items-center gap-1 rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50 transition-colors"
                          title="عرض"
                        >
                          <Eye size={14} />
                          عرض
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setEditCaseId(caseItem.id);
                            setShowEditModal(true);
                          }}
                          className="inline-flex items-center gap-1 rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50 transition-colors"
                          title="تعديل"
                        >
                          <Pencil size={14} />
                          تعديل
                        </button>

                        {filters.IsDeleted ? (
                          <button
                            type="button"
                            onClick={() =>
                              handleRestore(caseItem.id, caseItem.name)
                            }
                            disabled={restoreMutation.isPending}
                            className="inline-flex items-center gap-1 rounded-xl border border-green-200 bg-green-50 px-3 py-1.5 text-xs text-green-700 hover:bg-green-100 transition-colors disabled:opacity-50"
                            title="استعادة"
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
                              handleSoftDelete(caseItem.id, caseItem.name)
                            }
                            disabled={softDeleteMutation.isPending}
                            className="inline-flex items-center gap-1 rounded-xl border border-orange-200 bg-orange-50 px-3 py-1.5 text-xs text-orange-700 hover:bg-orange-100 transition-colors disabled:opacity-50"
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

                        <button
                          type="button"
                          onClick={() =>
                            handleHardDelete(caseItem.id, caseItem.name)
                          }
                          disabled={hardDeleteMutation.isPending}
                          className="inline-flex items-center gap-1 rounded-xl border border-red-200 bg-red-50 px-3 py-1.5 text-xs text-red-700 hover:bg-red-100 transition-colors disabled:opacity-50"
                          title="حذف نهائي"
                        >
                          {hardDeleteMutation.isPending ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <Trash2 size={14} />
                          )}
                          حذف
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

      {/* Pagination */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-600 shadow-sm">
        <div>
          صفحة <span className="font-semibold text-gray-900">{pageNumber}</span>{" "}
          من <span className="font-semibold text-gray-900">{totalPages}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handlePageChange(pageNumber - 1)}
            disabled={pageNumber <= 1}
            className="px-4 py-2 rounded-xl border border-gray-200 text-gray-700 disabled:opacity-50 hover:bg-gray-50 transition-colors"
          >
            السابق
          </button>
          <button
            onClick={() => handlePageChange(pageNumber + 1)}
            disabled={pageNumber >= totalPages}
            className="px-4 py-2 rounded-xl border border-gray-200 text-gray-700 disabled:opacity-50 hover:bg-gray-50 transition-colors"
          >
            التالي
          </button>
        </div>
      </div>

      {/* Add Modal */}
      {showAddCaseModal && (
        <ModalShell
          title="إضافة قضية جديدة"
          onClose={() => setShowAddCaseModal(false)}
        >
          <AddCaseForm
            onSuccess={() => setShowAddCaseModal(false)}
            onCancel={() => setShowAddCaseModal(false)}
          />
        </ModalShell>
      )}

      {/* Edit Modal */}
      {showEditModal && editCaseId && (
        <ModalShell
          title="تعديل القضية"
          onClose={() => {
            setShowEditModal(false);
            setEditCaseId(null);
          }}
        >
          <EditCaseForm
            caseId={editCaseId}
            onSuccess={() => {
              setShowEditModal(false);
              setEditCaseId(null);
            }}
            onCancel={() => {
              setShowEditModal(false);
              setEditCaseId(null);
            }}
          />
        </ModalShell>
      )}
    </section>
  );
}
