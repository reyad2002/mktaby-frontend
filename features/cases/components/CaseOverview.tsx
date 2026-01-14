"use client";

import React, { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowRight,
  AlertCircle,
  Loader2,
  Briefcase,
  Scale,
  Calendar,
  Lock,
  Unlock,
  Users,
  FileText,
  Clock,
  CheckCircle2,
  StickyNote,
  User,
  UserMinus,
  RefreshCcw,
  Gavel,
  TrendingUp,
  Share2,
  ChevronLeft,
  MapPin,
  Edit,
  X,
  Link2,
  Copy,
  Mail,
  CheckCircle,
} from "lucide-react";
import toast from "react-hot-toast";

import {
  getCaseById,
  getCaseStatistics,
} from "@/features/cases/apis/casesApis";
import EditCaseForm from "@/features/cases/components/EditCaseForm";

/* ---------------- Helpers ---------------- */

const formatDateAr = (date?: string | null) =>
  date ? new Date(date).toLocaleDateString("ar-EG") : "—";

const initials = (name: string) => {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase()).join("") || "U";
};

const statusBadge = (status: string) => {
  const map: Record<string, string> = {
    Active: "bg-emerald-50 text-emerald-700 border-emerald-200",
    UnderReview: "bg-amber-50 text-amber-700 border-amber-200",
    Completed: "bg-blue-50 text-blue-700 border-blue-200",
    Closed: "bg-slate-100 text-slate-700 border-slate-200",
    Rejected: "bg-rose-50 text-rose-700 border-rose-200",
    InCourt: "bg-purple-50 text-purple-700 border-purple-200",
  };
  return map[status] || "bg-slate-100 text-slate-700 border-slate-200";
};

const ui = {
  page: "min-h-screen bg-slate-50 space-y-5 pb-10",
  card: "rounded-2xl border border-slate-200 bg-white shadow-sm",
  cardHeader:
    "px-5 py-4 border-b border-slate-100 flex items-center justify-between",
  cardBody: "p-5",
  title: "text-base font-bold text-slate-900",
  muted: "text-sm text-slate-500",
  btnPrimary:
    "inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-700 transition disabled:opacity-60",
  btnGhost:
    "inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition",
  badge:
    "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold",
};

/* ---------------- Reusable UI ---------------- */

function SectionCard({
  title,
  icon: Icon,
  actions,
  children,
}: {
  title: string;
  icon: React.ElementType;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className={ui.card}>
      <div className={ui.cardHeader}>
        <div className="flex items-center gap-2">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 text-teal-700">
            <Icon size={18} />
          </span>
          <h2 className={ui.title}>{title}</h2>
        </div>
        {actions}
      </div>
      <div className={ui.cardBody}>{children}</div>
    </div>
  );
}

function KeyValue({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4">
      <div className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-700">
        <Icon size={18} />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold text-slate-500">{label}</p>
        <p className="mt-1 text-sm font-bold text-slate-900 truncate">
          {value}
        </p>
      </div>
    </div>
  );
}

function Stat({
  icon: Icon,
  title,
  value,
  subtitle,
}: {
  icon: React.ElementType;
  title: string;
  value: string | number;
  subtitle?: string;
}) {
  return (
    <div className={ui.card + " p-5"}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-slate-500">{title}</p>
          <p className="mt-1 text-2xl font-extrabold text-slate-900">{value}</p>
          {subtitle ? (
            <p className="mt-1 text-xs text-slate-500">{subtitle}</p>
          ) : null}
        </div>
        <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-teal-700">
          <Icon size={18} />
        </div>
      </div>
    </div>
  );
}

function Progress({ value }: { value: number }) {
  return (
    <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
      <div
        className="h-full bg-teal-600 rounded-full transition-all"
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  );
}

/* ---------------- Modal Shell ---------------- */
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
  iconClassName = "text-teal-700",
  onClose,
  children,
}: {
  title: string;
  icon?: React.ElementType;
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
            {Icon && (
              <span className="inline-flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-br from-teal-50 to-emerald-50 border border-teal-200/60 shadow-sm">
                <Icon size={18} className={iconClassName} />
              </span>
            )}
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

/* ---------------- Skeleton & Error ---------------- */

const PageSkeleton = () => (
  <div className="min-h-screen bg-slate-50 p-6">
    <div className="rounded-2xl bg-white border border-slate-200 p-5">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-slate-200 animate-pulse" />
        <div className="space-y-2 flex-1">
          <div className="h-4 w-40 bg-slate-200 rounded animate-pulse" />
          <div className="h-3 w-64 bg-slate-200 rounded animate-pulse" />
        </div>
      </div>
    </div>

    <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="h-27.5 rounded-2xl bg-white border border-slate-200 animate-pulse"
        />
      ))}
    </div>

    <div className="mt-5 h-65 rounded-2xl bg-white border border-slate-200 animate-pulse" />
  </div>
);

const PageError = ({
  message,
  onBack,
}: {
  message?: string;
  onBack: () => void;
}) => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
    <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 p-6 text-center shadow-sm">
      <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <AlertCircle size={26} />
      </div>
      <h2 className="text-lg font-bold text-slate-900 mb-1">
        فشل جلب البيانات
      </h2>
      <p className="text-sm text-slate-500 mb-5">
        {message || "حدث خطأ غير متوقع أثناء محاولة الوصول لبيانات القضية."}
      </p>
      <button
        onClick={onBack}
        className="w-full rounded-xl bg-teal-600 text-white font-semibold py-3 flex items-center justify-center gap-2"
      >
        <ArrowRight size={18} /> العودة للقائمة
      </button>
    </div>
  </div>
);

/* ---------------- Component Props ---------------- */
interface CaseOverviewProps {
  caseId: number;
  onBack: () => void;
}

/* ---------------- Main Component ---------------- */
export default function CaseOverview({ caseId, onBack }: CaseOverviewProps) {
  const queryClient = useQueryClient();

  // Edit modal state
  const [showEditModal, setShowEditModal] = useState(false);
  // Share modal state
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);

  useLockBodyScroll(showEditModal || showShareModal);

  const {
    data: caseData,
    isLoading: isLoadingCase,
    isError,
    error,
    refetch: refetchCase,
    isFetching: isFetchingCase,
  } = useQuery({
    queryKey: ["case", caseId],
    queryFn: () => getCaseById(caseId),
    enabled: Number.isFinite(caseId) && caseId > 0,
  });

  const {
    data: statsData,
    refetch: refetchStats,
    isFetching: isFetchingStats,
  } = useQuery({
    queryKey: ["caseStatistics", caseId],
    queryFn: () => getCaseStatistics(caseId),
    enabled: Number.isFinite(caseId) && caseId > 0,
  });

  const caseDetails = caseData?.data;
  const stats = statsData?.data;

  const handleRefresh = async () => {
    await Promise.all([refetchCase(), refetchStats()]);
  };

  const handleEditSuccess = () => {
    setShowEditModal(false);
    queryClient.invalidateQueries({ queryKey: ["case", caseId] });
    queryClient.invalidateQueries({ queryKey: ["cases"] });
  };

  const handleCopyLink = async () => {
    const url = `${window.location.origin}/dashboard/cases/${caseId}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("تم نسخ الرابط بنجاح");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("فشل نسخ الرابط");
    }
  };

  const handleNativeShare = async () => {
    const url = `${window.location.origin}/dashboard/cases/${caseId}`;
    const shareData = {
      title: `قضية: ${caseDetails?.name || ""}`,
      text: `تفاصيل القضية\n\nاسم القضية: ${
        caseDetails?.name || ""
      }\nرقم القضية: ${caseDetails?.caseNumber || ""}`,
      url: url,
    };

    try {
      if (navigator.share && navigator.canShare(shareData)) {
        await navigator.share(shareData);
        toast.success("تمت المشاركة بنجاح");
      } else {
        // Fallback to copy if share is not supported
        await navigator.clipboard.writeText(url);
        toast.success("تم نسخ الرابط بنجاح");
      }
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        toast.error("فشلت المشاركة");
      }
    }
  };

  if (isLoadingCase) return <PageSkeleton />;
  if (isError || !caseDetails) {
    const msg = error instanceof Error ? error.message : undefined;
    return <PageError message={msg} onBack={onBack} />;
  }

  const completionRate =
    stats && stats.sessionsCount > 0
      ? (stats.completedSessions / stats.sessionsCount) * 100
      : 0;

  return (
    <section className={ui.page}>
      {/* Header */}
      <div className={ui.card}>
        <div
          className={
            ui.cardBody + " flex flex-wrap items-center justify-between gap-4"
          }
        >
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <button
                onClick={onBack}
                className="hover:text-teal-700 transition"
              >
                القضايا
              </button>
              <ChevronLeft size={16} className="text-slate-400" />
              <span className="font-semibold text-slate-700">
                {caseDetails.caseNumber}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-extrabold text-slate-900">
                {caseDetails.name}
              </h1>

              <span
                className={`${ui.badge} border-teal-200 bg-teal-50 text-teal-700`}
              >
                <Briefcase size={12} />
                {caseDetails.caseNumber}
              </span>

              <span
                className={`${ui.badge} ${statusBadge(
                  caseDetails.caseStatus.value
                )}`}
              >
                <Gavel size={12} />
                {caseDetails.caseStatus.label}
              </span>

              <span
                className={`${ui.badge} border-slate-200 bg-white text-slate-700`}
              >
                <Scale size={12} />
                {caseDetails.caseType.label}
              </span>

              <span
                className={`${ui.badge} ${
                  caseDetails.isPrivate
                    ? "border-amber-200 bg-amber-50 text-amber-700"
                    : "border-slate-200 bg-slate-50 text-slate-700"
                }`}
              >
                {caseDetails.isPrivate ? (
                  <Lock size={12} />
                ) : (
                  <Unlock size={12} />
                )}
                {caseDetails.isPrivate ? "خاصة" : "عامة"}
              </span>
            </div>

            <p className={ui.muted}>
              <MapPin size={14} className="inline-block ml-1 text-slate-400" />
              {caseDetails.courtName || "—"}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowEditModal(true)}
              className={ui.btnGhost}
              title="تعديل القضية"
            >
              <Edit size={16} />
              <span className="hidden sm:inline">تعديل</span>
            </button>

            <button
              onClick={() => setShowShareModal(true)}
              className={ui.btnGhost}
              title="مشاركة"
            >
              <Share2 size={16} />
              <span className="hidden sm:inline">مشاركة</span>
            </button>

            <button
              onClick={handleRefresh}
              className={ui.btnPrimary}
              disabled={isFetchingCase || isFetchingStats}
              title="تحديث"
            >
              {isFetchingCase || isFetchingStats ? (
                <Loader2 className="animate-spin" size={16} />
              ) : (
                <RefreshCcw size={16} />
              )}
              <span className="hidden sm:inline">تحديث</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      {stats ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Stat
            icon={Calendar}
            title="الجلسة القادمة"
            value={
              stats.nextSessionDate
                ? formatDateAr(stats.nextSessionDate)
                : "لا توجد"
            }
            subtitle={stats.nextSessionType}
          />
          <Stat
            icon={Clock}
            title="إجمالي الجلسات"
            value={stats.sessionsCount}
          />
          <Stat
            icon={CheckCircle2}
            title="جلسات منتهية"
            value={stats.completedSessions}
          />
          <div className={ui.card + " p-5"}>
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-slate-500">
                نسبة الإنجاز
              </p>
              <TrendingUp size={18} className="text-teal-700" />
            </div>
            <p className="mt-2 text-2xl font-extrabold text-slate-900">
              {Math.round(completionRate)}%
            </p>
            <div className="mt-3">
              <Progress value={completionRate} />
            </div>
            <p className="mt-2 text-xs text-slate-500">
              {stats.completedSessions} من {stats.sessionsCount} جلسة
            </p>
          </div>
        </div>
      ) : null}

      {/* Content */}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-8 space-y-4">
          <SectionCard title="بيانات القضية" icon={FileText}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <KeyValue
                icon={User}
                label="العميل"
                value={caseDetails.clientName}
              />
              <KeyValue
                icon={UserMinus}
                label="الخصم"
                value={caseDetails.opponent || "—"}
              />
              <KeyValue
                icon={MapPin}
                label="المحكمة"
                value={caseDetails.courtName || "—"}
              />
              <KeyValue
                icon={Calendar}
                label="تاريخ الفتح"
                value={formatDateAr(caseDetails.openedAt)}
              />
              {caseDetails.closedAt ? (
                <KeyValue
                  icon={Calendar}
                  label="تاريخ الإغلاق"
                  value={formatDateAr(caseDetails.closedAt)}
                />
              ) : null}
              <KeyValue
                icon={caseDetails.isPrivate ? Lock : Unlock}
                label="الخصوصية"
                value={caseDetails.isPrivate ? "قضية خاصة" : "قضية عامة"}
              />
            </div>
          </SectionCard>

          {caseDetails.notes ? (
            <SectionCard title="ملاحظات" icon={StickyNote}>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                  {caseDetails.notes}
                </p>
              </div>
            </SectionCard>
          ) : null}
        </div>

        <div className="lg:col-span-4">
          <SectionCard
            title="المحامون المكلفون"
            icon={Users}
            actions={
              <span className="text-xs font-semibold text-slate-600 bg-slate-100 border border-slate-200 px-3 py-1 rounded-full">
                {caseDetails.caseLawyers?.length ?? 0}
              </span>
            }
          >
            {caseDetails.caseLawyers?.length ? (
              <div className="space-y-2">
                {caseDetails.caseLawyers.map(
                  (lawyer: { id: number; name: string }) => (
                    <div
                      key={lawyer.id}
                      className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3"
                    >
                      <div className="h-10 w-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center font-bold text-slate-700">
                        {initials(lawyer.name)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-900 truncate">
                          {lawyer.name}
                        </p>
                        <p className="text-xs text-slate-500">محامي</p>
                      </div>
                    </div>
                  )
                )}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
                <Users className="mx-auto text-slate-400" size={28} />
                <p className="mt-2 text-sm font-semibold text-slate-700">
                  لا يوجد محامون مكلفون
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  قم بإسناد محامٍ للقضية من صفحة الإدارة.
                </p>
              </div>
            )}
          </SectionCard>
        </div>
      </div>

      {/* Edit Case Modal */}
      {showEditModal && (
        <ModalShell
          onClose={() => setShowEditModal(false)}
          title="تعديل بيانات القضية"
        >
          <EditCaseForm
            caseId={Number(caseId)}
            onSuccess={handleEditSuccess}
            onCancel={() => setShowEditModal(false)}
          />
        </ModalShell>
      )}

      {/* Share Modal */}
      {showShareModal && (
        <ModalShell
          onClose={() => setShowShareModal(false)}
          title="مشاركة القضية"
          icon={Share2}
        >
          <div className="space-y-4">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-900 mb-2">
                {caseDetails.name}
              </p>
              <p className="text-xs text-slate-500">
                رقم القضية: {caseDetails.caseNumber}
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleCopyLink}
                className="w-full flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 text-right hover:bg-slate-50 transition-colors"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
                  {copied ? <CheckCircle size={20} /> : <Copy size={20} />}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-900">
                    {copied ? "تم النسخ!" : "نسخ الرابط"}
                  </p>
                  <p className="text-xs text-slate-500">
                    انسخ رابط القضية للمشاركة
                  </p>
                </div>
                <Link2 size={18} className="text-slate-400" />
              </button>

              <button
                onClick={handleNativeShare}
                className="w-full flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 text-right hover:bg-slate-50 transition-colors"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                  <Share2 size={20} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-900">مشاركة</p>
                  <p className="text-xs text-slate-500">
                    شارك القضية مع التطبيقات المثبتة
                  </p>
                </div>
              </button>
            </div>

            <div className="pt-4 border-t border-slate-200">
              <button
                onClick={() => setShowShareModal(false)}
                className="w-full rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-200 transition-colors"
              >
                إغلاق
              </button>
            </div>
          </div>
        </ModalShell>
      )}
    </section>
  );
}
