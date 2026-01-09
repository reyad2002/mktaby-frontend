"use client";

import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  Briefcase,
  CalendarDays,
  Clock,
  Edit,
  Eye,
  FileText,
  Loader2,
  MoreHorizontal,
  Plus,
  RefreshCcw,
  Scale,
  Trash2,
  X,
  Info,
} from "lucide-react";
import toast from "react-hot-toast";

import {
  fetchSessionsList,
  softDeleteSession,
} from "@/features/sessions/apis/sessionsApis";
import { getCaseById } from "@/features/cases/apis/casesApis";
import AddCaseSessionForm from "@/features/sessions/components/AddCaseSessionForm";
import EditSessionForm from "@/features/sessions/components/EditSessionForm";
import type { SessionListItem } from "@/features/sessions/types/sessionsTypes";

/* ========== Styles ========== */
const ui = {
  page: "space-y-5 pb-12",
  card: "rounded-2xl border border-slate-200 bg-white shadow-sm",
  cardHeader:
    "px-5 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3",
  cardBody: "p-5",
  badge:
    "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold",
  pill: "inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold border",
};

const statusPill = (status: string) => {
  const map: Record<string, string> = {
    Scheduled: "bg-blue-50 text-blue-700 border-blue-200",
    InProgress: "bg-amber-50 text-amber-800 border-amber-200",
    Postponed: "bg-orange-50 text-orange-800 border-orange-200",
    Cancelled: "bg-red-50 text-red-800 border-red-200",
    AwaitingDecision: "bg-purple-50 text-purple-700 border-purple-200",
    Completed: "bg-emerald-50 text-emerald-800 border-emerald-200",
  };
  return map[status] || "bg-gray-50 text-gray-700 border-gray-200";
};

const typePill = (type: string) => {
  const map: Record<string, string> = {
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
  return map[type] || "bg-gray-50 text-gray-700 border-gray-200";
};

const formatDateTime = (value?: string | null) =>
  value
    ? new Date(value).toLocaleString("ar-EG", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

/* ========== Modal Shell ========== */
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
      <div className="relative w-full max-w-3xl mx-4 bg-white rounded-2xl border border-gray-200 shadow-2xl max-h-[90vh] overflow-y-auto">
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

/* ========== Sub Components ========== */
function LoadingCard() {
  return (
    <div className="flex items-center justify-center min-h-[320px]">
      <div className="flex items-center gap-2 text-slate-600">
        <Loader2 className="animate-spin text-teal-600" size={24} />
        جاري تحميل بيانات الجلسات...
      </div>
    </div>
  );
}

function ErrorCard({ message }: { message?: string }) {
  return (
    <div className="text-center py-12">
      <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 border border-rose-200">
        <AlertCircle size={22} />
      </div>
      <p className="mt-3 text-sm font-semibold text-slate-900">
        فشل جلب الجلسات
      </p>
      <p className="mt-1 text-sm text-slate-600">
        {message || "حدث خطأ غير متوقع أثناء تحميل الجلسات الخاصة بالقضية."}
      </p>
    </div>
  );
}

function EmptyCard({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="text-center py-12">
      <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 text-slate-600 border border-slate-200">
        <CalendarDays size={20} />
      </div>
      <p className="mt-3 text-sm font-semibold text-slate-900">
        لا توجد جلسات مسجلة لهذه القضية
      </p>
      <p className="mt-1 text-sm text-slate-600 mb-4">
        أضف أول جلسة لهذه القضية.
      </p>
      <button
        onClick={onAdd}
        className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700 transition"
      >
        <Plus size={16} />
        إضافة جلسة
      </button>
    </div>
  );
}

/* ========== Session Card with Actions ========== */
function SessionCard({
  session,
  onEdit,
  onView,
  onDelete,
}: {
  session: SessionListItem;
  onEdit: (id: number) => void;
  onView: (session: SessionListItem) => void;
  onDelete: (id: number, name: string) => void;
}) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-slate-500">تاريخ الجلسة</p>
          <p className="text-base font-bold text-slate-900">
            {formatDateTime(session.sessionDate)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`${ui.pill} ${statusPill(session.sessionStatus.value)}`}
          >
            {session.sessionStatus.label}
          </span>
          <span className={`${ui.pill} ${typePill(session.sessionType.value)}`}>
            {session.sessionType.label}
          </span>

          {/* Actions Menu */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
            >
              <MoreHorizontal size={18} />
            </button>

            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowMenu(false)}
                />
                <div className="absolute left-0 top-full mt-1 z-20 w-44 bg-white rounded-xl border border-slate-200 shadow-lg py-1">
                  <button
                    onClick={() => {
                      onView(session);
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <Eye size={16} className="text-blue-600" />
                    عرض التفاصيل
                  </button>
                  <button
                    onClick={() => {
                      onEdit(session.id);
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <Edit size={16} className="text-amber-600" />
                    تعديل
                  </button>
                  <hr className="my-1 border-slate-100" />
                  <button
                    onClick={() => {
                      onDelete(session.id, session.caseName);
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 size={16} />
                    حذف
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-slate-700">
        <div className="flex items-center gap-2">
          <Scale size={16} className="text-slate-700" />
          <div className="space-y-0.5">
            <p className="text-xs text-slate-500">المحكمة</p>
            <p className="font-semibold">{session.court}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Clock size={16} className="text-amber-700" />
          <div className="space-y-0.5">
            <p className="text-xs text-slate-500">الجلسة التالية</p>
            <p className="font-semibold">
              {session.nextSessionDate
                ? formatDateTime(session.nextSessionDate)
                : "—"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:col-span-2">
          <FileText size={16} className="text-slate-600" />
          <div className="space-y-0.5 min-w-0 flex-1">
            <p className="text-xs text-slate-500">النتيجة</p>
            <p className="font-semibold truncate" title={session.result || "—"}>
              {session.result || "—"}
            </p>
          </div>
        </div>
      </div>

      {session.notes && (
        <div className="mt-3 rounded-lg bg-slate-50 border border-slate-200 p-3 text-sm text-slate-700 leading-relaxed">
          {session.notes}
        </div>
      )}
    </div>
  );
}

/* ========== View Session Modal ========== */
function ViewSessionModal({
  session,
  onClose,
}: {
  session: SessionListItem;
  onClose: () => void;
}) {
  return (
    <ModalShell title="تفاصيل الجلسة" icon={Info} onClose={onClose}>
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold text-slate-500 mb-1">
              تاريخ الجلسة
            </p>
            <p className="text-base font-bold text-slate-900">
              {formatDateTime(session.sessionDate)}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold text-slate-500 mb-1">المحكمة</p>
            <p className="text-base font-bold text-slate-900">
              {session.court}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold text-slate-500 mb-1">
              نوع الجلسة
            </p>
            <span
              className={`${ui.pill} ${typePill(session.sessionType.value)}`}
            >
              {session.sessionType.label}
            </span>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold text-slate-500 mb-1">
              حالة الجلسة
            </p>
            <span
              className={`${ui.pill} ${statusPill(
                session.sessionStatus.value
              )}`}
            >
              {session.sessionStatus.label}
            </span>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold text-slate-500 mb-1">القضية</p>
            <p className="text-base font-bold text-slate-900">
              {session.caseName}
            </p>
            <p className="text-xs text-slate-500">{session.caseNumber}</p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold text-slate-500 mb-1">
              الجلسة التالية
            </p>
            <p className="text-base font-bold text-slate-900">
              {session.nextSessionDate
                ? formatDateTime(session.nextSessionDate)
                : "لا توجد"}
            </p>
          </div>
        </div>

        {session.notes && (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold text-slate-500 mb-2">
              الملاحظات
            </p>
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
              {session.notes}
            </p>
          </div>
        )}

        {session.result && (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold text-slate-500 mb-2">النتيجة</p>
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
              {session.result}
            </p>
          </div>
        )}

        <div className="flex justify-end pt-4 border-t border-slate-200">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
          >
            إغلاق
          </button>
        </div>
      </div>
    </ModalShell>
  );
}

/* ========== Confirm Delete Modal ========== */
function ConfirmDeleteModal({
  sessionName,
  isDeleting,
  onConfirm,
  onClose,
}: {
  sessionName: string;
  isDeleting: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <ModalShell
      title="تأكيد الحذف"
      icon={Trash2}
      iconClassName="text-red-600"
      onClose={onClose}
    >
      <div className="text-center py-4">
        <div className="w-16 h-16 rounded-full bg-red-50 border border-red-200 flex items-center justify-center mx-auto mb-4">
          <Trash2 size={28} className="text-red-600" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 mb-2">
          هل أنت متأكد من حذف هذه الجلسة؟
        </h3>
        <p className="text-sm text-slate-600 mb-6">
          سيتم حذف جلسة قضية &quot;{sessionName}&quot; بشكل نهائي. هذا الإجراء
          لا يمكن التراجع عنه.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="px-5 py-2.5 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-colors font-semibold disabled:opacity-50"
          >
            إلغاء
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-semibold disabled:opacity-50"
          >
            {isDeleting ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                جاري الحذف...
              </>
            ) : (
              <>
                <Trash2 size={18} />
                تأكيد الحذف
              </>
            )}
          </button>
        </div>
      </div>
    </ModalShell>
  );
}

/* ========== Component Props ========== */
interface CaseSessionsProps {
  caseId: number;
}

/* ========== Main Component ========== */
export default function CaseSessions({ caseId }: CaseSessionsProps) {
  const queryClient = useQueryClient();

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editSessionId, setEditSessionId] = useState<number | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedSession, setSelectedSession] =
    useState<SessionListItem | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteSessionId, setDeleteSessionId] = useState<number | null>(null);
  const [deleteSessionName, setDeleteSessionName] = useState("");

  useLockBodyScroll(
    showAddModal || showEditModal || showViewModal || showDeleteModal
  );

  // Fetch case details
  const { data: caseData } = useQuery({
    queryKey: ["case", caseId],
    queryFn: () => getCaseById(caseId),
    enabled: Number.isFinite(caseId) && caseId > 0,
  });

  // Fetch sessions
  const {
    data: sessionsData,
    isLoading: isLoadingSessions,
    isError: isSessionsError,
    error: sessionsError,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["caseSessions", caseId],
    queryFn: () =>
      fetchSessionsList({
        CaseId: caseId,
        PageNumber: 1,
        PageSize: 50,
        Sort: "sessionDate desc",
      }),
    enabled: Number.isFinite(caseId) && caseId > 0,
    staleTime: 10_000,
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: softDeleteSession,
    onSuccess: () => {
      toast.success("تم حذف الجلسة بنجاح");
      queryClient.invalidateQueries({ queryKey: ["caseSessions", caseId] });
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
      setShowDeleteModal(false);
      setDeleteSessionId(null);
      setDeleteSessionName("");
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err?.response?.data?.message || "حدث خطأ أثناء حذف الجلسة");
    },
  });

  const sessions: SessionListItem[] = sessionsData?.data?.data ?? [];
  const totalCount = sessionsData?.data?.count ?? 0;
  const caseDetails = caseData?.data;

  // Handlers
  const handleEdit = (id: number) => {
    setEditSessionId(id);
    setShowEditModal(true);
  };

  const handleView = (session: SessionListItem) => {
    setSelectedSession(session);
    setShowViewModal(true);
  };

  const handleDeleteClick = (id: number, name: string) => {
    setDeleteSessionId(id);
    setDeleteSessionName(name);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    if (deleteSessionId) {
      deleteMutation.mutate(deleteSessionId);
    }
  };

  return (
    <section className={ui.page}>
      <div className={ui.card}>
        <div className={ui.cardHeader}>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                جلسات القضية
              </h1>
              {caseDetails?.caseNumber && (
                <span
                  className={`${ui.badge} border-teal-200 bg-teal-50 text-teal-700`}
                >
                  <Briefcase size={12} />
                  {caseDetails.caseNumber}
                </span>
              )}
              {caseDetails?.caseType?.label && (
                <span
                  className={`${ui.badge} border-slate-200 bg-slate-50 text-slate-700`}
                >
                  <Scale size={12} />
                  {caseDetails.caseType.label}
                </span>
              )}
            </div>
            <p className="text-sm text-slate-500">
              {totalCount} جلسة مرتبطة بهذه القضية
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => refetch()}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition disabled:opacity-60"
              disabled={isFetching}
            >
              <RefreshCcw
                size={16}
                className={isFetching ? "animate-spin" : ""}
              />
              تحديث
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700 transition"
            >
              <Plus size={16} />
              إضافة جلسة
            </button>
          </div>
        </div>

        <div className={ui.cardBody}>
          {isLoadingSessions ? (
            <LoadingCard />
          ) : isSessionsError ? (
            <ErrorCard
              message={
                sessionsError instanceof Error
                  ? sessionsError.message
                  : undefined
              }
            />
          ) : sessions.length === 0 ? (
            <EmptyCard onAdd={() => setShowAddModal(true)} />
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {sessions.map((session) => (
                <SessionCard
                  key={session.id}
                  session={session}
                  onEdit={handleEdit}
                  onView={handleView}
                  onDelete={handleDeleteClick}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Session Modal */}
      {showAddModal && (
        <ModalShell
          title="إضافة جلسة جديدة"
          icon={Plus}
          onClose={() => setShowAddModal(false)}
        >
          <AddCaseSessionForm
            caseId={caseId}
            caseName={caseDetails?.name}
            onSuccess={() => setShowAddModal(false)}
            onCancel={() => setShowAddModal(false)}
          />
        </ModalShell>
      )}

      {/* Edit Session Modal */}
      {showEditModal && editSessionId && (
        <ModalShell
          title="تعديل الجلسة"
          icon={Edit}
          iconClassName="text-amber-600"
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
              queryClient.invalidateQueries({
                queryKey: ["caseSessions", caseId],
              });
            }}
            onCancel={() => {
              setShowEditModal(false);
              setEditSessionId(null);
            }}
          />
        </ModalShell>
      )}

      {/* View Session Modal */}
      {showViewModal && selectedSession && (
        <ViewSessionModal
          session={selectedSession}
          onClose={() => {
            setShowViewModal(false);
            setSelectedSession(null);
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <ConfirmDeleteModal
          sessionName={deleteSessionName}
          isDeleting={deleteMutation.isPending}
          onConfirm={handleConfirmDelete}
          onClose={() => {
            setShowDeleteModal(false);
            setDeleteSessionId(null);
            setDeleteSessionName("");
          }}
        />
      )}
    </section>
  );
}
