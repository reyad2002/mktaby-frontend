"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import type { LucideIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  Plus,
  X,
  Loader2,
  Edit,
  Trash2,
  AlertCircle,
  Calendar,
  Briefcase,
  Scale,
  Search,
  SlidersHorizontal,
  RefreshCw,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Info,
  Eye,
  FileText,
  CheckCircle2,
  Check,
} from "lucide-react";

import {
  useSessions,
  useSessionTypes,
  useSessionStatuses,
  useSoftDeleteSession,
} from "@/features/sessions/hooks/sessionsHooks";
import AddSessionForm from "@/features/sessions/components/AddSessionForm";
import EditSessionForm from "@/features/sessions/components/EditSessionForm";
import PageHeader from "@/shared/components/dashboard/PageHeader";
import { usePermissions } from "@/features/permissions/hooks/usePermissions";
import type {
  GetSessionsQuery,
  SessionListItem,
  SessionTypeValue,
  SessionStatusValue,
} from "@/features/sessions/types/sessionsTypes";

const DEFAULT_FILTERS: GetSessionsQuery = {
  PageNumber: 1,
  PageSize: 10,
  Search: "",
  Sort: "",
  SessionType: undefined,
  SessionStatus: undefined,
  IsDeleted: false,
};

const SORT_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "بدون ترتيب" },
  { value: "sessionDate desc", label: "التاريخ (الأحدث)" },
  { value: "sessionDate asc", label: "التاريخ (الأقدم)" },
  { value: "createdAt desc", label: "الإنشاء (الأحدث)" },
  { value: "createdAt asc", label: "الإنشاء (الأقدم)" },
];

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

function CustomSelect({
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
    value === "" ? placeholder : selected?.label ?? placeholder;

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

          <div className="max-h-72 overflow-auto p-2">
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
      <div className="relative w-full max-w-4xl mx-4 bg-white rounded-2xl border border-gray-200 shadow-2xl max-h-[90vh] overflow-y-auto">
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
  variant?: "neutral" | "green" | "orange" | "red" | "blue" | "purple" | "primary";
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
      primary: "border-primary/10 bg-white text-primary  ",
  };

  const glow: Record<string, string> = {
    neutral: "hover:shadow-sm",
    blue: "hover:shadow-[0_10px_25px_-15px_rgba(59,130,246,0.7)]",
    green: "hover:shadow-[0_10px_25px_-15px_rgba(16,185,129,0.7)]",
    orange: "hover:shadow-[0_10px_25px_-15px_rgba(249,115,22,0.7)]",
    red: "hover:shadow-[0_10px_25px_-15px_rgba(239,68,68,0.7)]",
    purple: "hover:shadow-[0_10px_25px_-15px_rgba(168,85,247,0.7)]",
    primary: "hover:shadow-[0_10px_25px_-15px_rgba(23,83,110,0.7)]",
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
          <CalendarDays className="text-gray-500" size={20} />
        </div>
        <p className="text-gray-800 font-semibold">لا توجد جلسات مطابقة.</p>
        <p className="text-sm text-gray-600 mt-1">
          جرّب تغيير الفلاتر أو البحث.
        </p>
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
      className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold border ${className}`}
    >
      {Icon ? <Icon size={12} /> : null}
      {text}
    </span>
  );
}

const formatSessionDate = (date: string) =>
  new Date(date).toLocaleDateString("ar-EG", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

export default function SessionsPage() {
  const { can } = usePermissions();
  const [filters, setFilters] = useState<GetSessionsQuery>(DEFAULT_FILTERS);
  const [showAddSessionModal, setShowAddSessionModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editSessionId, setEditSessionId] = useState<number | null>(null);

  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedSession, setSelectedSession] =
    useState<SessionListItem | null>(null);

  const [moreOpen, setMoreOpen] = useState(false);

  useLockBodyScroll(showAddSessionModal || showEditModal || showViewModal);

  const { data: sessionTypes = [] } = useSessionTypes();
  const { data: sessionStatuses = [] } = useSessionStatuses();
  const softDeleteMutation = useSoftDeleteSession();

  const handleSoftDelete = (id: number, caseName: string) => {
    if (window.confirm(`هل تريد حذف جلسة القضية "${caseName}"؟`)) {
      softDeleteMutation.mutate(id);
    }
  };

  const queryParams = useMemo(() => {
    return {
      ...filters,
      Search: filters.Search?.trim() || undefined,
      Sort: filters.Sort || undefined,
      SessionType: filters.SessionType || undefined,
      SessionStatus: filters.SessionStatus || undefined,
      IsDeleted: filters.IsDeleted ? true : undefined,
    } satisfies GetSessionsQuery;
  }, [filters]);

  const { data, isLoading, isError, error, isFetching, refetch } =
    useSessions(queryParams);

  const sessions: SessionListItem[] = data?.data?.data ?? [];
  const totalCount = data?.data?.count ?? 0;

  const pageNumber = filters.PageNumber ?? 1;
  const pageSize = filters.PageSize ?? 10;
  const totalPages = Math.max(1, Math.ceil(totalCount / (pageSize || 1)));

  const updateFilter = <K extends keyof GetSessionsQuery>(
    key: K,
    value: GetSessionsQuery[K]
  ) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      PageNumber: key === "Search" || key === "PageSize" ? 1 : prev.PageNumber,
    }));
  };

  const handlePageChange = (nextPage: number) => {
    if (nextPage < 1 || nextPage > totalPages) return;
    setFilters((prev) => ({ ...prev, PageNumber: nextPage }));
  };

  const resetFilters = () => setFilters(DEFAULT_FILTERS);

  const getStatusPillClass = (status: string) => {
    const colors: Record<string, string> = {
      Scheduled: "bg-blue-50 text-blue-700 border-blue-200",
      InProgress: "bg-amber-50 text-amber-800 border-amber-200",
      Postponed: "bg-orange-50 text-orange-800 border-orange-200",
      Cancelled: "bg-red-50 text-red-800 border-red-200",
      AwaitingDecision: "bg-purple-50 text-purple-700 border-purple-200",
      Completed: "bg-emerald-50 text-emerald-800 border-emerald-200",
    };
    return colors[status] || "bg-gray-50 text-gray-700 border-gray-200";
  };

  const getTypePillClass = (type: string) => {
    const colors: Record<string, string> = {
      Preliminary: "bg-cyan-50 text-cyan-800 border-cyan-200",
      Hearing: "bg-blue-50 text-blue-700 border-blue-200",
      Trial: "bg-indigo-50 text-indigo-700 border-indigo-200",
      Sentencing: "bg-purple-50 text-purple-700 border-purple-200",
      Adjourned: "bg-gray-50 text-gray-700 border-gray-200",
      Investigation: "bg-amber-50 text-amber-800 border-amber-200",
      Appeal: "bg-orange-50 text-orange-800 border-orange-200",
      Review: "bg-teal-50 text-teal-800 border-teal-200",
      Execution: "bg-red-50 text-red-800 border-red-200",
      Mediation: "bg-emerald-50 text-emerald-800 border-emerald-200",
      Settlement: "bg-lime-50 text-lime-800 border-lime-200",
      Pleading: "bg-yellow-50 text-yellow-800 border-yellow-200",
      ClosingArguments: "bg-rose-50 text-rose-800 border-rose-200",
      ExpertReview: "bg-violet-50 text-violet-800 border-violet-200",
      Administrative: "bg-slate-50 text-slate-800 border-slate-200",
      Reconciliation: "bg-green-50 text-green-800 border-green-200",
    };
    return colors[type] || "bg-gray-50 text-gray-700 border-gray-200";
  };

  const sessionTypeOptions: Opt[] = useMemo(
    () => sessionTypes.map((t) => ({ label: t.label, value: t.value })),
    [sessionTypes]
  );
  const sessionStatusOptions: Opt[] = useMemo(
    () => sessionStatuses.map((s) => ({ label: s.label, value: s.value })),
    [sessionStatuses]
  );
  const router = useRouter();
  return (
    <section className="space-y-6 relative">
      {/* Soft premium background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-blue-200/40 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-indigo-200/40 blur-3xl" />
        <div className="absolute inset-0 bg-linear-to-b from-slate-50 via-white to-white" />
      </div>

      <PageHeader
        title="الجلسات"
        subtitle="إدارة ومتابعة جلسات القضايا والمواعيد."
        icon={CalendarDays}
        isFetching={isFetching}
        countLabel={`${totalCount} جلسة`}
        onAdd={can.canCreateSession() ? () => setShowAddSessionModal(true) : undefined}
        addButtonLabel="إضافة جلسة"
      />

      {/* Main Content Area (Cases UI) */}
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end">
          {/* Search Input (ONLY visible filter) */}
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
                value={filters.Search ?? ""}
                onChange={(e) => updateFilter("Search", e.target.value)}
                placeholder="ابحث بالقضية أو المحكمة..."
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
                              onClick={() => updateFilter("PageSize", size)}
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
                    <CustomSelect
                      label="نوع الجلسة"
                      value={String(filters.SessionType || "")}
                      options={sessionTypeOptions}
                      placeholder="الكل"
                      onChange={(val) =>
                        updateFilter(
                          "SessionType",
                          val === "" ? undefined : (String(val) as SessionTypeValue)
                        )
                      }
                    />

                    <CustomSelect
                      label="حالة الجلسة"
                      value={String(filters.SessionStatus || "")}
                      options={sessionStatusOptions}
                      placeholder="الكل"
                      onChange={(val) =>
                        updateFilter(
                          "SessionStatus",
                          val === ""
                            ? undefined
                            : (String(val) as SessionStatusValue)
                        )
                      }
                    />

                    <CustomSelect
                      label="ترتيب حسب"
                      value={String(filters.Sort || "")}
                      options={SORT_OPTIONS}
                      placeholder="بدون ترتيب"
                      onChange={(val) =>
                        updateFilter("Sort", val === "" ? "" : String(val))
                      }
                    />

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

                    <button
                      type="button"
                      onClick={() => refetch()}
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-extrabold rounded-2xl text-gray-700 bg-white border border-gray-200 hover:bg-gray-50"
                    >
                      <RefreshCw
                        size={16}
                        className={isFetching ? "animate-spin" : ""}
                      />
                      تحديث النتائج
                    </button>

                    {isError && (
                      <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 px-3 py-2 rounded-2xl font-bold">
                        <Info size={16} />
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
        {/* <div className="mt-6">
          <label className="block text-sm font-bold text-gray-700 mb-2">
            حالة السجلات
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
              const isActive = opt.key === "active" && !filters.IsDeleted;
              const isDeleted = opt.key === "deleted" && !!filters.IsDeleted;
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
                        IsDeleted: false,
                        PageNumber: 1,
                      }));
                    } else {
                      setFilters((prev) => ({
                        ...prev,
                        IsDeleted: true,
                        PageNumber: 1,
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
        </div> */}
      </div>

      {/* Table / States */}
      {isLoading ? (
        <LoadingState />
      ) : isError ? (
        <ErrorState
          message={error instanceof Error ? error.message : undefined}
        />
      ) : sessions.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="overflow-hidden rounded-3xl border border-gray-200/60 bg-white/80 backdrop-blur-xl shadow-[0_20px_50px_-20px_rgba(0,0,0,0.1)] ring-1 ring-gray-200/50">
          <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-200">
            <table className="min-w-full border-separate border-spacing-0">
              <thead className="bg-gray-50/50 sticky top-0 z-10 backdrop-blur-md">
                <tr className="text-right text-xs font-bold uppercase tracking-wider text-gray-500">
                  <th className="px-6 py-4 border-b border-gray-100 whitespace-nowrap">
                    تاريخ الجلسة
                  </th>
                  <th className="px-6 py-4 border-b border-gray-100 whitespace-nowrap">
                    النوع
                  </th>
                  <th className="px-6 py-4 border-b border-gray-100 whitespace-nowrap">
                    الحالة
                  </th>
                  <th className="px-6 py-4 border-b border-gray-100 whitespace-nowrap">
                    القضية
                  </th>
                  <th className="px-6 py-4 border-b border-gray-100 whitespace-nowrap">
                    المحكمة
                  </th>
                  <th className="px-6 py-4 border-b border-gray-100 whitespace-nowrap text-center">
                    الإجراءات
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-50 bg-transparent">
                {sessions.map((session) => (
                  <tr
                    key={session.id}
                    className="group transition-all duration-200 hover:bg-primary/2"
                  >
                    {/* Date */}
                    <td className="px-6 py-5 whitespace-nowrap min-w-[320px]">
                      {session.sessionDate ? (
                        <div className="flex items-center gap-3">
                          <span className="inline-flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200/60 shadow-sm">
                            <Calendar size={18} className="text-blue-700" />
                          </span>
                          <div className="min-w-0">
                            <div className="font-bold text-gray-900 leading-tight">
                              {formatSessionDate(session.sessionDate)}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              جلسة رقم:{" "}
                              <span className="font-mono font-semibold text-gray-700">
                                #{session.id}
                              </span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-500">—</span>
                      )}
                    </td>

                    {/* Type */}
                    <td className="px-6 py-5 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border shadow-sm ${getTypePillClass(
                          session.sessionType?.value || ""
                        )}`}
                      >
                        {session.sessionType?.label || "—"}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-5 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border shadow-sm ${getStatusPillClass(
                          session.sessionStatus?.value || ""
                        )}`}
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" />
                        {session.sessionStatus?.label || "—"}
                      </span>
                    </td>

                    {/* Case */}
                    <td className="px-6 py-5 min-w-[320px]">
                      <div className="flex items-start gap-3">
                        <span className="inline-flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200/60 shadow-sm">
                          <Briefcase size={18} className="text-blue-700" />
                        </span>

                        <div className="min-w-0">
                          <button
                            onClick={()=>router.push( `/dashboard/cases/${session.caseId}` )}
                            className=" cursor-pointer font-bold text-gray-900 truncate max-w-130 underline hover:text-primary text-left"
                            title={session.caseName}
                          >
                            {session.caseName || "—"}
                          </button>
                          <div className="text-xs text-gray-500 mt-1" dir="ltr">
                            رقم القضية:{" "}
                            <span className="font-mono font-semibold text-gray-700">
                              {session.caseNumber || "—"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Court */}
                    <td className="px-6 py-5 min-w-[220px]">
                      <span
                        className="text-sm font-medium text-gray-600 truncate block"
                        title={session.court}
                      >
                        {session.court || "—"}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-5">
                      <div className="flex items-center justify-center gap-2">
                        <IconButton
                          title="عرض التفاصيل"
                          variant="primary"
                          onClick={() => {
                            setSelectedSession(session);
                            setShowViewModal(true);
                          }}
                        >
                          <Eye size={16} strokeWidth={2.5} />
                        </IconButton>

                        {can.canUpdateSession() && (
                        <IconButton
                          title="تعديل"
                          variant="primary"
                          onClick={() => {
                            setEditSessionId(session.id);
                            setShowEditModal(true);
                          }}
                        >
                          <Edit size={16} strokeWidth={2.5} />
                        </IconButton>
                        )}

                        {can.canDeleteSession() && (
                        <IconButton
                          title="حذف"
                          variant="red"
                          disabled={softDeleteMutation.isPending}
                          onClick={() => handleSoftDelete(session.id, session.caseName)}
                        >
                          {softDeleteMutation.isPending ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            <Trash2 size={16} strokeWidth={2.5} />
                          )}
                        </IconButton>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination (Cases UI) */}
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
              <span className="text-primary font-bold">{sessions.length}</span>{" "}
              من أصل <span className="font-bold text-gray-900">{totalCount}</span>{" "}
              سجل
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
      {showAddSessionModal && (
        <ModalShell
          title="إضافة جلسة جديدة"
          icon={Plus}
          iconClassName="text-blue-700"
          onClose={() => setShowAddSessionModal(false)}
        >
          <AddSessionForm
            onSuccess={() => setShowAddSessionModal(false)}
            onCancel={() => setShowAddSessionModal(false)}
          />
        </ModalShell>
      )}

      {/* Edit Modal */}
      {showEditModal && editSessionId && (
        <ModalShell
          title="تعديل الجلسة"
          icon={Edit}
          iconClassName="text-purple-700"
          onClose={() => {
            setShowEditModal(false);
            setEditSessionId(null);
          }}
        >
          <EditSessionForm
            sessionId={editSessionId}
            onSuccess={() => {
              setShowEditModal(false);
              setEditSessionId(null);
            }}
            onCancel={() => {
              setShowEditModal(false);
              setEditSessionId(null);
            }}
          />
        </ModalShell>
      )}

      {/* View Modal */}
      {showViewModal && selectedSession && (
        <ModalShell
          title="تفاصيل الجلسة"
          icon={Eye}
          iconClassName="text-blue-700"
          onClose={() => {
            setShowViewModal(false);
            setSelectedSession(null);
          }}
        >
          <div className="space-y-6">
            <div className="rounded-xl border border-gray-200 bg-gradient-to-br from-blue-50 to-white p-4">
              <div className="flex items-start gap-3">
                <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-blue-100 border border-blue-200">
                  <Calendar size={18} className="text-blue-700" />
                </span>
                <div>
                  <div className="text-xs font-medium text-gray-600 mb-1">
                    تاريخ الجلسة
                  </div>
                  <div className="text-base font-semibold text-gray-900">
                    {selectedSession.sessionDate
                      ? formatSessionDate(selectedSession.sessionDate)
                      : "—"}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-xl border border-gray-200 bg-white p-4">
                <div className="flex items-start gap-3">
                  <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gray-50 border border-gray-200">
                    <Scale size={18} className="text-gray-700" />
                  </span>
                  <div>
                    <div className="text-xs font-medium text-gray-600 mb-1">
                      نوع الجلسة
                    </div>
                    <div className="text-sm font-semibold text-gray-900">
                      {selectedSession.sessionType?.label || "—"}
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-gray-200 bg-white p-4">
                <div className="flex items-start gap-3">
                  <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gray-50 border border-gray-200">
                    <Info size={18} className="text-gray-700" />
                  </span>
                  <div>
                    <div className="text-xs font-medium text-gray-600 mb-1">
                      حالة الجلسة
                    </div>
                    <div className="text-sm font-semibold text-gray-900">
                      {selectedSession.sessionStatus?.label || "—"}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-gradient-to-br from-indigo-50 to-white p-4">
              <div className="flex items-start gap-3">
                <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-100 border border-indigo-200">
                  <Briefcase size={18} className="text-indigo-700" />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-gray-600 mb-1">
                    القضية
                  </div>
                  <div
                    className="text-base font-semibold text-gray-900 truncate"
                    title={selectedSession.caseName}
                  >
                    {selectedSession.caseName || "—"}
                  </div>
                  <div className="text-xs text-gray-600 mt-1" dir="ltr">
                    رقم القضية: {selectedSession.caseNumber || "—"}
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <div className="flex items-start gap-3">
                <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gray-50 border border-gray-200">
                  <Scale size={18} className="text-gray-700" />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-gray-600 mb-1">
                    المحكمة
                  </div>
                  <div className="text-sm font-semibold text-gray-900">
                    {selectedSession.court || "—"}
                  </div>
                </div>
              </div>
            </div>

            {selectedSession.notes && (
              <div className="rounded-xl border border-gray-200 bg-white p-4">
                <div className="flex items-start gap-3">
                  <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gray-50 border border-gray-200">
                    <FileText size={18} className="text-gray-700" />
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-gray-600 mb-2">
                      الملاحظات
                    </div>
                    <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {selectedSession.notes}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4">
              <div className="text-xs text-gray-600">
                معرّف الجلسة:{" "}
                <span className="font-mono font-semibold text-gray-900">
                  #{selectedSession.id}
                </span>
              </div>
            </div>
          </div>
        </ModalShell>
      )}
    </section>
  );
}
