"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
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
  Search,
  SlidersHorizontal,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  FileText,
  Check,
} from "lucide-react";

import {
  useClients,
  useRestoreClient,
  useHardDeleteClient,
  useSoftDeleteClient,
} from "@/features/clients/hooks/clientsHooks";

import AddClientForm from "@/features/clients/components/AddClientForm";
import EditClientForm from "@/features/clients/components/EditClientForm";
import PageHeader from "@/shared/components/dashboard/PageHeader";
import { usePermissions } from "@/features/permissions/hooks/usePermissions";

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

const CLIENT_TYPE_OPTIONS = [
  { value: "Individual", label: "فرد" },
  { value: "Company", label: "شركة" },
];

const formatDateAr = (date?: string | null) =>
  date ? new Date(date).toLocaleDateString("ar-EG") : "—";

// to prevent background scroll when modal is open
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

type Opt = { label: string; value: string | number };

type CustomSelectProps = {
  label: string;
  value: string | number | "";
  options: Opt[];
  placeholder?: string;
  onChange: (val: string | number | "") => void;
};

export function CustomSelect({
  label,
  value,
  options,
  placeholder = "الكل",
  onChange,
}: CustomSelectProps) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const wrapRef = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => String(o.value) === String(value));
  const shownLabel =
    value === "" ? placeholder : (selected?.label ?? placeholder);

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    if (!qq) return options;
    return options.filter((o) => o.label.toLowerCase().includes(qq));
  }, [q, options]);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  return (
    <div ref={wrapRef} className="relative" dir="rtl">
      <label className="block text-sm font-bold text-gray-700 mb-2 mr-1">
        {label}
      </label>

      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className={`w-full flex items-center justify-between gap-3 px-4 py-3.5 rounded-2xl border transition-all ${
          open
            ? "bg-white border-primary/40 ring-4 ring-primary/10"
            : "bg-gray-50/60 border-gray-200 hover:bg-white"
        }`}
      >
        <span className="text-gray-800 font-bold truncate">{shownLabel}</span>
        <ChevronDown
          size={18}
          className={`text-gray-400 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div className="absolute left-0 right-0 mt-3 z-50 rounded-3xl bg-white/95 backdrop-blur-xl border border-gray-200/70 shadow-[0_30px_70px_-30px_rgba(0,0,0,0.3)] overflow-hidden">
          {/* Search inside dropdown */}
          <div className="p-3 border-b border-gray-100">
            <div className="relative">
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 pointer-events-none">
                <Search size={16} />
              </div>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="ابحث..."
                className="w-full pr-9 pl-3 py-2.5 rounded-2xl bg-gray-50/70 border border-gray-200 text-sm font-semibold text-gray-700 placeholder:text-gray-400 outline-none focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 appearance-none"
              />
            </div>
          </div>

          {/* Options */}
          <div className="max-h-72 overflow-auto p-2">
            {/* All option */}
            <OptionRow
              active={value === ""}
              label={placeholder}
              onClick={() => {
                onChange("");
                setOpen(false);
                setQ("");
              }}
            />

            {filtered.map((o) => (
              <OptionRow
                key={String(o.value)}
                active={String(value) === String(o.value)}
                label={o.label}
                onClick={() => {
                  onChange(o.value);
                  setOpen(false);
                  setQ("");
                }}
              />
            ))}

            {filtered.length === 0 && (
              <div className="p-4 text-sm font-bold text-gray-500 text-center">
                لا توجد نتائج
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function OptionRow({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${
        active
          ? "bg-primary/10 text-primary"
          : "text-gray-700 hover:bg-gray-100/70"
      }`}
    >
      <span className="truncate">{label}</span>
      {active && <Check size={16} className="shrink-0" />}
    </button>
  );
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
      <div className="relative w-full max-w-2xl mx-4 bg-white rounded-2xl border border-gray-200 shadow-2xl max-h-[90vh] overflow-y-auto">
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

function clientTypeBadge(value: string) {
  const isIndividual = value === "Individual";
  const Icon = isIndividual ? UserIcon : Building2;

  return (
    <span
      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold border shadow-sm ${
        isIndividual
          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
          : "bg-blue-50 text-blue-700 border-blue-200"
      }`}
    >
      <Icon size={14} />
      {isIndividual ? "فرد" : "شركة"}
    </span>
  );
}

export default function ClientsPage() {
  const router = useRouter();
  const { can } = usePermissions();

  const [filters, setFilters] = useState<ClientsQueryParams>(DEFAULT_FILTERS);
  const [moreOpen, setMoreOpen] = useState(false);

  const [showAddClientModal, setShowAddClientModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editClientId, setEditClientId] = useState<number | null>(null);

  useLockBodyScroll(showAddClientModal || showEditModal);

  const softDeleteMutation = useSoftDeleteClient();
  const hardDeleteMutation = useHardDeleteClient();
  const restoreMutation = useRestoreClient();

  const queryParams = useMemo(() => {
    return {
      ...filters,
      search: filters.search?.trim() || undefined,
      sort: filters.sort || undefined,
      clientType: filters.clientType || undefined,
      isDeleted: filters.isDeleted ? true : undefined,
    } satisfies ClientsQueryParams;
  }, [filters]);

  const { data, isLoading, isError, error, isFetching, refetch } =
    useClients(queryParams);

  const clients: ClientSummary[] = data?.data?.data ?? [];
  const totalCount = data?.data?.count ?? 0;

  const pageNumber = filters.pageNumber ?? 1;
  const pageSize = filters.pageSize ?? 10;
  const totalPages = Math.max(1, Math.ceil(totalCount / (pageSize || 1)));

  const updateFilter = <K extends keyof ClientsQueryParams>(
    key: K,
    value: ClientsQueryParams[K],
  ) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      pageNumber: key === "search" || key === "pageSize" ? 1 : prev.pageNumber,
    }));
  };

  const resetFilters = () => setFilters(DEFAULT_FILTERS);

  const handlePageChange = (nextPage: number) => {
    if (nextPage < 1 || nextPage > totalPages) return;
    setFilters((prev) => ({ ...prev, pageNumber: nextPage }));
  };

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
        `⚠️ تحذير: هل أنت متأكد من حذف العميل "${name}" نهائياً؟\nلا يمكن التراجع عن هذا الإجراء!`,
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

  return (
    <section className="space-y-6 relative">
      {/* Soft premium background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-blue-200/40 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-indigo-200/40 blur-3xl" />
        <div className="absolute inset-0 bg-linear-to-b from-slate-50 via-white to-white" />
      </div>

      <PageHeader
        title="العملاء"
        subtitle="إدارة بيانات العملاء والتواصل معهم."
        icon={Users}
        isFetching={isFetching}
        countLabel={`${totalCount} عميل`}
        onAdd={can.canCreateClient() ? () => setShowAddClientModal(true) : undefined}
        addButtonLabel="إضافة عميل"
        finance={can.canViewFinance() ? () => router.push("/dashboard/clients-finance") : undefined}
        financeLabel="المحاسبة المالية للعملاء"
      />

      {/* Main Content Area */}
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end">
          {/* Search Input */}
          <div className="lg:col-span-9">
            <label className="block text-sm font-bold text-gray-700 mb-2 mr-1">
              بحث متقدم
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-gray-400 group-focus-within:text-primary transition-colors">
                <Search size={20} />
              </div>
              <input
                type="text"
                value={filters.search ?? ""}
                onChange={(e) => updateFilter("search", e.target.value)}
                placeholder="ابحث باسم العميل، الهاتف، أو البريد..."
                className="w-full pr-12 pl-4 py-3.5 bg-gray-50/50 border border-gray-200 rounded-2xl text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary focus:bg-white transition-all shadow-sm"
              />
            </div>
          </div>

          {/* Filters Dropdown Button */}
          <div className="lg:col-span-3 relative">
            <button
              type="button"
              onClick={() => setMoreOpen((p) => !p)}
              className={`w-full h-13 flex items-center justify-between gap-3 px-5 rounded-2xl border font-extrabold transition-all ${
                moreOpen
                  ? "bg-white border-primary/40 ring-4 ring-primary/10"
                  : "bg-gray-50/50 border-gray-200 hover:bg-white"
              }`}
            >
              <span className="flex items-center gap-2 text-gray-700">
                <SlidersHorizontal size={18} className="text-primary" />
                الفلاتر
              </span>
              <ChevronDown
                size={18}
                className={`transition-transform ${moreOpen ? "rotate-180" : ""}`}
              />
            </button>

            {moreOpen && (
              <>
                {/* click away */}
                <button
                  type="button"
                  onClick={() => setMoreOpen(false)}
                  className="fixed inset-0 z-40 cursor-default"
                />

                <div className="absolute left-0 right-0 mt-3 z-50 rounded-3xl bg-white/95 backdrop-blur-xl border border-gray-200/70 shadow-[0_30px_70px_-30px_rgba(0,0,0,0.3)]">
                  <div className="p-5 grid grid-cols-1 gap-5">
                    {/* Page Size */}
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        عدد النتائج
                      </label>
                      <div className="inline-flex p-1.5 bg-gray-100/80 rounded-2xl">
                        {[5, 10, 20, 50].map((size) => {
                          const active = pageSize === size;
                          return (
                            <button
                              key={size}
                              type="button"
                              onClick={() => updateFilter("pageSize", size)}
                              className={`px-4 py-2 text-sm font-bold rounded-xl transition-all ${
                                active
                                  ? "bg-white text-primary shadow-sm"
                                  : "text-gray-500 hover:text-gray-700"
                              }`}
                            >
                              {size}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Select Filters */}
                    {[
                      {
                        label: "نوع العميل",
                        key: "clientType" as const,
                        options: CLIENT_TYPE_OPTIONS,
                      },
                      {
                        label: "ترتيب حسب",
                        key: "sort" as const,
                        options: SORT_OPTIONS,
                      },
                    ].map((select) => (
                      <CustomSelect
                        key={select.key}
                        label={select.label}
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        value={String((filters as any)[select.key] || "")}
                        options={select.options}
                        placeholder="الكل"
                        onChange={(val) =>
                          updateFilter(
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            select.key as any,
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            val === "" ? (undefined as any) : (val as any),
                          )
                        }
                      />
                    ))}

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                      <button
                        type="button"
                        onClick={resetFilters}
                        className="flex-1 px-4 py-3 text-sm font-extrabold rounded-2xl text-red-500 bg-red-50 hover:bg-red-100"
                      >
                        إعادة ضبط
                      </button>
                      <button
                        type="button"
                        onClick={() => setMoreOpen(false)}
                        className="flex-1 px-4 py-3 text-sm font-extrabold rounded-2xl text-gray-700 bg-gray-100 hover:bg-gray-200"
                      >
                        تم
                      </button>
                    </div>

                    {/* Refresh */}
                    <button
                      type="button"
                      onClick={() => refetch()}
                      className="w-full px-4 py-3 text-sm font-extrabold rounded-2xl text-gray-700 bg-white border border-gray-200 hover:bg-gray-50"
                    >
                      {isFetching ? "جاري التحديث..." : "تحديث النتائج"}
                    </button>

                    {isError && (
                      <div className="px-4 py-3 rounded-2xl border border-red-200 bg-red-50 text-red-700 text-sm font-bold">
                        حدث خطأ: {error instanceof Error ? error.message : "—"}
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Status */}
        <div className="mt-6">
          <label className="block text-sm font-bold text-gray-700 mb-2">
            حالة العملاء
          </label>
          <div className="flex items-center p-1.5 bg-gray-100/80 rounded-2xl">
            {[
              {
                key: "active",
                label: "النشطة",
                icon: CheckCircle2,
                color: "bg-primary",
              },
              {
                key: "deleted",
                label: "المحذوفة",
                icon: Trash2,
                color: "bg-red-500",
              },
            ].map((opt) => {
              const isActive = opt.key === "active" && !filters.isDeleted;
              const isDeleted = opt.key === "deleted" && !!filters.isDeleted;
              const active = isActive || isDeleted;
              const Icon = opt.icon;

              return (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => {
                    if (opt.key === "active") {
                      setFilters((prev) => ({
                        ...prev,
                        isDeleted: false,
                        pageNumber: 1,
                      }));
                    } else {
                      setFilters((prev) => ({
                        ...prev,
                        isDeleted: true,
                        pageNumber: 1,
                      }));
                    }
                  }}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-bold rounded-xl transition-all ${
                    active
                      ? `${opt.color} text-white`
                      : "text-gray-500 hover:bg-gray-200/50"
                  }`}
                >
                  <Icon size={16} />
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-3xl border border-gray-200/60 bg-white/80 backdrop-blur-xl shadow-[0_20px_50px_-20px_rgba(0,0,0,0.1)] ring-1 ring-gray-200/50">
        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-200">
          <table className="min-w-full border-separate border-spacing-0">
            <thead className="bg-gray-50/50 sticky top-0 z-10 backdrop-blur-md">
              <tr className="text-right text-xs font-bold uppercase tracking-wider text-gray-500">
                <th className="px-6 py-4 border-b border-gray-100 whitespace-nowrap">
                  رقم
                </th>
                <th className="px-6 py-4 border-b border-gray-100">العميل</th>
                <th className="px-6 py-4 border-b border-gray-100 whitespace-nowrap">
                  النوع
                </th>
                <th className="px-6 py-4 border-b border-gray-100 whitespace-nowrap">
                  الهاتف
                </th>
                <th className="px-6 py-4 border-b border-gray-100 whitespace-nowrap">
                  البريد
                </th>
                <th className="px-6 py-4 border-b border-gray-100 whitespace-nowrap text-center">
                  تاريخ الإنشاء
                </th>
                <th className="px-6 py-4 border-b border-gray-100 whitespace-nowrap text-center">
                  الإجراءات
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-50 bg-transparent">
              {isLoading ? (
                [...Array(6)].map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    {[...Array(7)].map((__, cellIdx) => (
                      <td key={cellIdx} className="px-6 py-5">
                        <div
                          className={`h-4 rounded-lg bg-gray-100 ${
                            cellIdx === 1 ? "w-48" : "w-full"
                          }`}
                        />
                      </td>
                    ))}
                  </tr>
                ))
              ) : clients.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-24 text-center">
                    <div className="flex flex-col items-center">
                      <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-gray-50 text-gray-400 ring-8 ring-gray-50/50">
                        <Users size={40} strokeWidth={1.5} />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900">
                        لا توجد نتائج
                      </h3>
                      <p className="mt-1 text-gray-500">
                        جرّب تغيير البحث أو الفلاتر للعثور على ما تبحث عنه.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                clients.map((client) => (
                  <tr
                    key={client.id}
                    className="group transition-all duration-200 hover:bg-primary/2"
                  >
                    {/* ID */}
                    <td className="px-6 py-5 whitespace-nowrap">
                      <span className="font-mono text-sm font-bold text-primary bg-primary/5 px-3 py-1.5 rounded-xl border border-primary/10 group-hover:bg-primary/10 transition-colors">
                        {client.id}
                      </span>
                    </td>

                    {/* Name */}
                    <td className="px-6 py-5">
                      <button
                        onClick={() =>
                          router.push(`/dashboard/clients/${client.id}`)
                        }
                        className="flex items-center gap-3 max-w-90 cursor-pointer"
                      >
                        <span className="inline-flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200/60 shadow-sm">
                          <UserIcon size={18} className="text-blue-700" />
                        </span>

                        <div className="flex flex-col items-start min-w-0">
                          <span className="underline font-bold text-gray-900 leading-tight group-hover:text-primary transition-colors truncate max-w-[360px]">
                            {client.name}
                          </span>
                          <span className="text-xs text-gray-500 truncate max-w-[360px]">
                            {client.email || "—"}
                          </span>
                        </div>
                      </button>
                    </td>

                    {/* Type */}
                    <td className="px-6 py-5 whitespace-nowrap">
                      {clientTypeBadge(client.clientType.value)}
                    </td>

                    {/* Phone */}
                    <td
                      className="px-6 py-5 text-sm font-medium text-gray-600 whitespace-nowrap"
                      dir="ltr"
                    >
                      {client.phoneCode} {client.phoneNumber}
                    </td>

                    {/* Email */}
                    <td
                      className="px-6 py-5 text-sm font-medium text-gray-600 max-w-[280px]"
                      dir="ltr"
                    >
                      <span
                        className="truncate block"
                        title={client.email || ""}
                      >
                        {client.email || "—"}
                      </span>
                    </td>

                    {/* Created At */}
                    <td className="px-6 py-5 text-center text-sm font-medium text-gray-500 whitespace-nowrap">
                      {formatDateAr(client.createdAt)}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-5">
                      <div className="flex items-center justify-center gap-2">
                        <IconButton
                          title="عرض"
                          onClick={() =>
                            router.push(`/dashboard/clients/${client.id}`)
                          }
                        >
                          <Eye size={16} strokeWidth={2.5} />
                        </IconButton>

                        {can.canUpdateClient() && (
                        <IconButton
                          title="تعديل"
                          onClick={() => {
                            setEditClientId(client.id);
                            setShowEditModal(true);
                          }}
                        >
                          <Edit size={16} strokeWidth={2.5} />
                        </IconButton>
                        )}

                        {filters.isDeleted ? (
                          <>
                            {can.canUpdateClient() && (
                            <IconButton
                              title="استعادة"
                              variant="green"
                              disabled={restoreMutation.isPending}
                              onClick={() =>
                                handleRestore(client.id, client.name)
                              }
                            >
                              {restoreMutation.isPending ? (
                                <Loader2 size={16} className="animate-spin" />
                              ) : (
                                <RotateCcw size={16} strokeWidth={2.5} />
                              )}
                            </IconButton>
                            )}
                            {can.canDeleteClient() && (
                            <IconButton
                              title="حذف نهائي"
                              variant="red"
                              disabled={hardDeleteMutation.isPending}
                              onClick={() =>
                                handleHardDelete(client.id, client.name)
                              }
                            >
                              {hardDeleteMutation.isPending ? (
                                <Loader2 size={16} className="animate-spin" />
                              ) : (
                                <Trash2 size={16} strokeWidth={2.5} />
                              )}
                            </IconButton>
                            )}
                          </>
                        ) : (
                          <>
                            {can.canDeleteClient() && (
                            <IconButton
                              title="حذف"
                              variant="red"
                              disabled={softDeleteMutation.isPending}
                              onClick={() =>
                                handleSoftDelete(client.id, client.name)
                              }
                            >
                              {softDeleteMutation.isPending ? (
                                <Loader2 size={16} className="animate-spin" />
                              ) : (
                                <Trash2 size={16} strokeWidth={2.5} />
                              )}
                            </IconButton>
                            )}
                            {/* <IconButton
                              title="حذف نهائي"
                              variant="red"
                              disabled={hardDeleteMutation.isPending}
                              onClick={() =>
                                handleHardDelete(client.id, client.name)
                              }
                            >
                              {hardDeleteMutation.isPending ? (
                                <Loader2 size={16} className="animate-spin" />
                              ) : (
                                <Trash2 size={16} strokeWidth={2.5} />
                              )}
                            </IconButton> */}
                          </>
                        )}
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
      <div className="flex flex-col md:flex-row items-center justify-between gap-5 rounded-3xl border border-gray-200/60 bg-white/80 backdrop-blur-xl px-6 py-4 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.1)] ring-1 ring-gray-200/50 mt-6">
        {/* Stats */}
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/5 text-primary shadow-inner">
            <FileText size={18} />
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
            <div className="text-sm font-medium text-gray-500">
              صفحة <span className="font-bold text-gray-900">{pageNumber}</span>{" "}
              من <span className="font-bold text-gray-900">{totalPages}</span>
            </div>
            <span className="hidden sm:block h-4 w-px bg-gray-200" />
            <div className="text-sm font-medium text-gray-500">
              عرض{" "}
              <span className="text-primary font-bold">{clients.length}</span>{" "}
              من أصل{" "}
              <span className="font-bold text-gray-900">{totalCount}</span> سجل
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => handlePageChange(pageNumber - 1)}
            disabled={pageNumber <= 1}
            className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl border border-gray-200 bg-white text-sm font-bold text-gray-600 transition-all hover:border-primary/30 hover:bg-primary/5 hover:text-primary disabled:opacity-30 disabled:pointer-events-none active:scale-95 shadow-sm"
          >
            <ChevronRight
              size={18}
              className="transition-transform group-hover:translate-x-1"
            />
            السابق
          </button>

          <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-2xl border border-gray-100 focus-within:border-primary/30 focus-within:ring-4 focus-within:ring-primary/10 transition-all">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-tighter">
              اذهب لـ
            </span>
            <input
              type="number"
              min={1}
              max={totalPages}
              value={pageNumber}
              onChange={(e) => handlePageChange(Number(e.target.value))}
              className="w-12 bg-transparent text-center text-sm font-extrabold text-primary focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>

          <button
            onClick={() => handlePageChange(pageNumber + 1)}
            disabled={pageNumber >= totalPages}
            className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl border border-gray-200 bg-white text-sm font-bold text-gray-600 transition-all hover:border-primary/30 hover:bg-primary/5 hover:text-primary disabled:opacity-30 disabled:pointer-events-none active:scale-95 shadow-sm"
          >
            التالي
            <ChevronLeft
              size={18}
              className="transition-transform group-hover:-translate-x-1"
            />
          </button>
        </div>
      </div>

      {/* Add Modal */}
      {showAddClientModal && (
        <ModalShell
          title="إضافة عميل جديد"
          icon={UserPlus}
          iconClassName="text-blue-700"
          onClose={() => setShowAddClientModal(false)}
        >
          <AddClientForm
            onSuccess={() => setShowAddClientModal(false)}
            onCancel={() => setShowAddClientModal(false)}
          />
        </ModalShell>
      )}

      {/* Edit Modal */}
      {showEditModal && editClientId && (
        <ModalShell
          title="تعديل العميل"
          icon={Edit}
          iconClassName="text-purple-700"
          onClose={() => {
            setShowEditModal(false);
            setEditClientId(null);
          }}
        >
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
        </ModalShell>
      )}
    </section>
  );
}
