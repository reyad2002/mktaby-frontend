"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { LucideIcon } from "lucide-react";
import {
  Users,
  UserPlus,
  X,
  Eye,
  Loader2,
  Edit,
  Trash2,
  Archive,
  RotateCcw,
  Building2,
  User as UserIcon,
  AlertCircle,
} from "lucide-react";
import toast from "react-hot-toast";

import {
  fetchClients,
  softDeleteClient,
  hardDeleteClient,
  restoreClient,
} from "@/features/clients/apis/clientsApi";
import AddClientForm from "@/features/clients/components/AddClientForm";
import EditClientForm from "@/features/clients/components/EditClientForm";
import PageHeader from "@/shared/components/dashboard/PageHeader";
import type {
  ClientsQueryParams,
  ClientSummary,
} from "@/features/clients/types/clientTypes";

const DEFAULT_FILTERS: ClientsQueryParams = {
  pageNumber: 1,
  pageSize: 10,
  search: "",
  sort: "",
  clientType: undefined,
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
      <p className="text-gray-800 font-medium">لا توجد عملاء مطابقين.</p>
      <p className="text-sm text-gray-600 mt-1">جرّب تغيير الفلاتر أو البحث.</p>
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
      className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium border ${className}`}
    >
      {Icon ? <Icon size={12} /> : null}
      {text}
    </span>
  );
}

const formatDateShortAr = (date: string) =>
  new Date(date).toLocaleDateString("ar-EG", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

export default function ClientsPage() {
  const router = useRouter();
  const [filters, setFilters] = useState<ClientsQueryParams>(DEFAULT_FILTERS);
  const [showAddClientModal, setShowAddClientModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editClientId, setEditClientId] = useState<number | null>(null);

  const queryClient = useQueryClient();

  const softDeleteMutation = useMutation({
    mutationFn: softDeleteClient,
    onSuccess: (response) => {
      if (response?.succeeded) {
        toast.success(response.message || "تم أرشفة العميل بنجاح");
        queryClient.invalidateQueries({ queryKey: ["clients"] });
      } else {
        toast.error(response?.message || "تعذر أرشفة العميل");
      }
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err?.response?.data?.message || "حدث خطأ أثناء أرشفة العميل");
    },
  });

  const hardDeleteMutation = useMutation({
    mutationFn: hardDeleteClient,
    onSuccess: (response) => {
      if (response?.succeeded) {
        toast.success(response.message || "تم حذف العميل نهائياً");
        queryClient.invalidateQueries({ queryKey: ["clients"] });
      } else {
        toast.error(response?.message || "تعذر حذف العميل");
      }
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err?.response?.data?.message || "حدث خطأ أثناء حذف العميل");
    },
  });

  const restoreMutation = useMutation({
    mutationFn: restoreClient,
    onSuccess: (response) => {
      if (response?.succeeded) {
        toast.success(response.message || "تم استعادة العميل بنجاح");
        queryClient.invalidateQueries({ queryKey: ["clients"] });
      } else {
        toast.error(response?.message || "تعذر استعادة العميل");
      }
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(
        err?.response?.data?.message || "حدث خطأ أثناء استعادة العميل"
      );
    },
  });

  const handleSoftDelete = (id: number, name: string) => {
    if (
      window.confirm(`هل تريد أرشفة العميل "${name}"؟\nيمكن استعادته لاحقاً.`)
    ) {
      softDeleteMutation.mutate(id);
    }
  };

  const handleHardDelete = (id: number, name: string) => {
    if (
      window.confirm(
        `⚠️ تحذير: هل أنت متأكد من حذف العميل "${name}" نهائياً؟\nلا يمكن التراجع عن هذا الإجراء!`
      )
    ) {
      hardDeleteMutation.mutate(id);
    }
  };

  const handleRestore = (id: number, name: string) => {
    if (window.confirm(`هل تريد استعادة العميل "${name}"؟`)) {
      restoreMutation.mutate(id);
    }
  };

  const queryParams = useMemo(() => {
    return {
      ...filters,
      search: filters.search?.trim() || undefined,
      sort: filters.sort || undefined,
      clientType: filters.clientType || undefined,
      isDeleted: filters.isDeleted ? true : undefined,
    } satisfies ClientsQueryParams;
  }, [filters]);

  const { data, isLoading, isError, error, isFetching } = useQuery({
    queryKey: ["clients", queryParams],
    queryFn: () => fetchClients(queryParams),
  });

  const clients: ClientSummary[] = data?.data?.data ?? [];
  const totalCount = data?.data?.count ?? 0;

  const pageNumber = filters.pageNumber ?? 1;
  const pageSize = filters.pageSize ?? 10;
  const totalPages = Math.max(1, Math.ceil(totalCount / (pageSize || 1)));

  const updateFilter = <K extends keyof ClientsQueryParams>(
    key: K,
    value: ClientsQueryParams[K]
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

  const clientTypePill = (value: string) => {
    const isIndividual = value === "Individual";
    return (
      <Pill
        icon={isIndividual ? UserIcon : Building2}
        text={isIndividual ? "فرد" : "شركة"}
        className={
          isIndividual
            ? "bg-emerald-50 text-emerald-800 border-emerald-200"
            : "bg-blue-50 text-blue-800 border-blue-200"
        }
      />
    );
  };

  return (
    <section className="space-y-6">
      <PageHeader
        title="العملاء"
        subtitle="إدارة بيانات العملاء والتواصل معهم."
        icon={Users}
        countLabel={`${totalCount} عميل`}
        onAdd={() => setShowAddClientModal(true)}
        addButtonLabel="إضافة عميل"
        isFetching={isFetching}
      />

      {/* Filters (White Card) */}
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search */}
          <label className="flex flex-col gap-2 text-sm">
            <span className="text-gray-700 font-medium">بحث</span>
            <input
              type="text"
              value={filters.search ?? ""}
              onChange={(e) => updateFilter("search", e.target.value)}
              placeholder="ابحث باسم العميل"
              className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300"
            />
          </label>

          {/* Client Type */}
          <label className="flex flex-col gap-2 text-sm">
            <span className="text-gray-700 font-medium">نوع العميل</span>
            <select
              value={filters.clientType || ""}
              onChange={(e) =>
                updateFilter(
                  "clientType",
                  (e.target.value ||
                    undefined) as ClientsQueryParams["clientType"]
                )
              }
              className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300"
            >
              <option value="">الكل</option>
              <option value="Individual">فرد</option>
              <option value="Company">شركة</option>
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

      {/* Content */}
      {isLoading ? (
        <LoadingState />
      ) : isError ? (
        <ErrorState
          message={error instanceof Error ? error.message : undefined}
        />
      ) : clients.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="rounded-xl bg-white border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr className="text-right text-sm text-gray-700">
                  <th className="px-4 py-3 font-semibold">ID</th>
                  <th className="px-4 py-3 font-semibold">الاسم</th>
                  <th className="px-4 py-3 font-semibold">النوع</th>
                  <th className="px-4 py-3 font-semibold">الهاتف</th>
                  <th className="px-4 py-3 font-semibold">البريد الإلكتروني</th>
                  <th className="px-4 py-3 font-semibold">تاريخ الإنشاء</th>
                  <th className="px-4 py-3 font-semibold">الإجراءات</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200">
                {clients.map((client) => (
                  <tr
                    key={client.id}
                    className="text-sm text-gray-800 hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3 text-gray-500">{client.id}</td>

                    <td className="px-4 py-3 min-w-[220px]">
                      <div className="flex items-center gap-2">
                        <UserIcon
                          size={14}
                          className="text-blue-600 shrink-0"
                        />
                        <span
                          className="font-semibold text-gray-900 truncate"
                          title={client.name}
                        >
                          {client.name}
                        </span>
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      {clientTypePill(client.clientType.value)}
                    </td>

                    <td className="px-4 py-3" dir="ltr">
                      <span className="text-gray-700">
                        {client.phoneCode} {client.phoneNumber}
                      </span>
                    </td>

                    <td className="px-4 py-3 max-w-[260px]" dir="ltr">
                      <span
                        className="text-gray-700 truncate block"
                        title={client.email}
                      >
                        {client.email}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-gray-700">
                      {client.createdAt
                        ? formatDateShortAr(client.createdAt)
                        : "—"}
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            router.push(`/dashboard/clients/${client.id}`)
                          }
                          className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium border border-blue-200 bg-blue-50 text-blue-800 hover:bg-blue-100 transition-colors"
                        >
                          <Eye size={14} />
                          عرض
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setEditClientId(client.id);
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
                              handleRestore(client.id, client.name)
                            }
                            disabled={restoreMutation.isPending}
                            className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium border border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
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
                              handleSoftDelete(client.id, client.name)
                            }
                            disabled={softDeleteMutation.isPending}
                            className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium border border-orange-200 bg-orange-50 text-orange-800 hover:bg-orange-100 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
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
                            handleHardDelete(client.id, client.name)
                          }
                          disabled={hardDeleteMutation.isPending}
                          className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium border border-red-200 bg-red-50 text-red-800 hover:bg-red-100 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
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

      {/* Add Modal */}
      {showAddClientModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowAddClientModal(false)}
          />
          <div className="relative w-full max-w-2xl mx-4 bg-white rounded-2xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <UserPlus className="text-blue-600" size={22} />
                إضافة عميل جديد
              </h2>
              <button
                type="button"
                onClick={() => setShowAddClientModal(false)}
                className="p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <AddClientForm
              onSuccess={() => setShowAddClientModal(false)}
              onCancel={() => setShowAddClientModal(false)}
            />
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editClientId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => {
              setShowEditModal(false);
              setEditClientId(null);
            }}
          />
          <div className="relative w-full max-w-2xl mx-4 bg-white rounded-2xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <Edit className="text-cyan-600" size={22} />
                تعديل العميل
              </h2>
              <button
                type="button"
                onClick={() => {
                  setShowEditModal(false);
                  setEditClientId(null);
                }}
                className="p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <EditClientForm
              clientId={editClientId}
              onSuccess={() => {
                setShowEditModal(false);
                setEditClientId(null);
              }}
              onCancel={() => {
                setShowEditModal(false);
                setEditClientId(null);
              }}
            />
          </div>
        </div>
      )}
    </section>
  );
}
