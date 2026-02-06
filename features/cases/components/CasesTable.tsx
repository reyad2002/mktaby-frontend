import React, { useState } from "react";
import {
  Eye,
  Pencil,
  Trash2,
  Archive,
  Lock,
  RotateCcw,
  Briefcase,
  Loader2,
  ChevronLeft,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  useHardDeleteCase,
  useRestoreCase,
  useSoftDeleteCase,
} from "../hooks/caseHooks";
import { useConfirm } from "@/shared/providers/ConfirmProvider";
const formatDateAr = (date?: string | null) =>
  date ? new Date(date).toLocaleDateString("ar-EG") : "—";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CasesTable = ({
  cases,
  isLoading,
  filters,
  
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  cases: any[];
  isLoading: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  filters: any;
  isFetching: boolean;
}) => {
  const router = useRouter();
  const confirm = useConfirm();
  const [editCaseId, setEditCaseId] = useState<number | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const restoreMutation = useRestoreCase();
  const hardDeleteMutation = useHardDeleteCase();
  const softDeleteMutation = useSoftDeleteCase();
  const handleRestore = (id: number, name: string) => {
    confirm({
      title: "استعادة القضية",
      description: `هل تريد استعادة القضية "${name}"؟`,
      confirmText: "استعادة",
      cancelText: "إلغاء",
    }).then((ok) => ok && restoreMutation.mutate(id));
  };
  const handleHardDelete = (id: number, name: string) => {
    confirm({
      title: "حذف نهائي",
      description: `⚠️ تحذير: هل أنت متأكد من حذف القضية "${name}" نهائياً؟\nلا يمكن التراجع عن هذا الإجراء!`,
      confirmText: "حذف نهائياً",
      cancelText: "إلغاء",
      variant: "danger",
    }).then((ok) => ok && hardDeleteMutation.mutate(id));
  };
  const handleSoftDelete = (id: number, name: string) => {
    confirm({
      title: "أرشفة القضية",
      description: `هل تريد أرشفة القضية "${name}"؟\nيمكن استعادتها لاحقاً.`,
      confirmText: "أرشفة",
      cancelText: "إلغاء",
    }).then((ok) => ok && softDeleteMutation.mutate(id));
  };
  return (
    <div className="relative overflow-hidden rounded-3xl border border-gray-200/60 bg-white/80 backdrop-blur-xl shadow-[0_20px_50px_-20px_rgba(0,0,0,0.1)]">
      {/* Table Container with Custom Scrollbar */}
      <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
        <table className="min-w-full border-separate border-spacing-0">
          <thead>
            <tr className="bg-gray-50/50">
              {[
                "رقم القضية",
                "تفاصيل القضية",
                "النوع",
                "الحالة",
                "العميل",
                "المحكمة",
                "تاريخ الفتح",
                "الإجراءات",
              ].map((header, i) => (
                <th
                  key={i}
                  className="sticky top-0 z-10 border-b border-gray-100 px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-gray-500 backdrop-blur-md"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-50">
            {isLoading ? (
              // Enhanced Skeleton Loading
              [...Array(6)].map((_, idx) => (
                <tr key={idx} className="animate-pulse">
                  <td className="px-6 py-5">
                    <div className="h-4 w-16 rounded-lg bg-gray-100" />
                  </td>
                  <td className="px-6 py-5">
                    <div className="space-y-2">
                      <div className="h-4 w-48 rounded-lg bg-gray-100" />
                      <div className="h-3 w-24 rounded-lg bg-gray-50" />
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="h-6 w-20 rounded-full bg-gray-100" />
                  </td>
                  <td className="px-6 py-5">
                    <div className="h-6 w-20 rounded-full bg-gray-100" />
                  </td>
                  <td className="px-6 py-5">
                    <div className="h-4 w-28 rounded-lg bg-gray-100" />
                  </td>
                  <td className="px-6 py-5">
                    <div className="h-4 w-24 rounded-lg bg-gray-100" />
                  </td>
                  <td className="px-6 py-5">
                    <div className="h-4 w-24 rounded-lg bg-gray-100" />
                  </td>
                  <td className="px-6 py-5">
                    <div className="h-8 w-24 rounded-xl bg-gray-100" />
                  </td>
                </tr>
              ))
            ) : cases.length === 0 ? (
              // Modern Empty State
              <tr>
                <td colSpan={8} className="px-6 py-24 text-center">
                  <div className="flex flex-col items-center">
                    <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-gray-50 text-gray-400 ring-8 ring-gray-50/50">
                      <Briefcase size={40} strokeWidth={1.5} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">
                      لا توجد قضايا حالياً
                    </h3>
                    <p className="mt-1 text-gray-500">
                      جرب تعديل فلاتر البحث أو إضافة قضية جديدة
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              cases.map((caseItem) => (
                <tr
                  key={caseItem.id}
                  className="group transition-all duration-200 hover:bg-primary/2"
                >
                  {/* Case Number - Styled as a badge */}
                  <td className="px-6 py-5">
                    <span className="font-mono text-sm font-bold text-primary bg-primary/5 px-3 py-1 rounded-lg border border-primary/10">
                      {caseItem.caseNumber}
                    </span>
                  </td>

                  {/* Name & ID */}
                  <td className="px-6 py-5">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900 group-hover:text-primary transition-colors">
                          {caseItem.name}
                        </span>
                        {caseItem.isPrivate && (
                          <div
                            className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-50 text-amber-600 border border-amber-100"
                            title="قضية خاصة"
                          >
                            <Lock size={10} />
                          </div>
                        )}
                      </div>
                      <span className="text-[10px] font-medium tracking-widest text-gray-400 uppercase">
                        رقم التعريف: {caseItem.id.slice(0, 8)}...
                      </span>
                    </div>
                  </td>

                  {/* Type Badge */}
                  <td className="px-6 py-5">
                    <span className="inline-flex items-center rounded-xl bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700 border border-indigo-100">
                      {caseItem.caseType.label}
                    </span>
                  </td>

                  {/* Status Badge */}
                  <td className="px-6 py-5">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1 text-xs font-bold border ${getStatusStyles(
                        caseItem.caseStatus.value
                      )}`}
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-current" />
                      {caseItem.caseStatus.label}
                    </span>
                  </td>

                  {/* Client & Court - Clean typography */}
                  <td className="px-6 py-5 text-sm font-medium text-gray-600">
                    {caseItem.clientName || "—"}
                  </td>
                  <td className="px-6 py-5 text-sm font-medium text-gray-600">
                    {caseItem.courtName || "—"}
                  </td>

                  {/* Date - Arabic Formatting */}
                  <td className="px-6 py-5 text-sm font-medium text-gray-500">
                    {formatDateAr(caseItem.openedAt)}
                  </td>

                  {/* Action Buttons - Premium Design */}
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <IconButton
                        title="عرض"
                        variant="blue"
                        onClick={() =>
                          router.push(`/dashboard/cases/${caseItem.id}`)
                        }
                      >
                        <Eye size={16} />
                      </IconButton>

                      <IconButton
                        title="تعديل"
                        variant="purple"
                        onClick={() => {
                          setEditCaseId(caseItem.id);
                          setShowEditModal(true);
                        }}
                      >
                        <Pencil size={16} />
                      </IconButton>

                      {filters.IsDeleted ? (
                        <>
                          <IconButton
                            title="استعادة"
                            variant="green"
                            disabled={restoreMutation.isPending}
                            onClick={() =>
                              handleRestore(caseItem.id, caseItem.name)
                            }
                          >
                            {restoreMutation.isPending ? (
                              <Loader2 size={16} className="animate-spin" />
                            ) : (
                              <RotateCcw size={16} />
                            )}
                          </IconButton>

                          <IconButton
                            title="حذف نهائي"
                            variant="red"
                            disabled={hardDeleteMutation.isPending}
                            onClick={() =>
                              handleHardDelete(caseItem.id, caseItem.name)
                            }
                          >
                            {hardDeleteMutation.isPending ? (
                              <Loader2 size={16} className="animate-spin" />
                            ) : (
                              <Trash2 size={16} />
                            )}
                          </IconButton>
                        </>
                      ) : (
                        <IconButton
                          title="أرشفة"
                          variant="orange"
                          disabled={softDeleteMutation.isPending}
                          onClick={() =>
                            handleSoftDelete(caseItem.id, caseItem.name)
                          }
                        >
                          {softDeleteMutation.isPending ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            <Archive size={16} />
                          )}
                        </IconButton>
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
  );
};

// --- Reusable Sub-components for Cleanliness ---

// const ActionBtn = ({ icon: Icon, color, onClick, disabled }: { icon: React.ElementType; color: "blue" | "indigo" | "green" | "red" | "orange"; onClick: () => void; disabled?: boolean }) => {
//   const colors = {
//     blue: "text-blue-600 hover:bg-blue-50 border-blue-100",
//     indigo: "text-indigo-600 hover:bg-indigo-50 border-indigo-100",
//     green: "text-green-600 hover:bg-green-50 border-green-100",
//     red: "text-red-600 hover:bg-red-50 border-red-100",
//     orange: "text-orange-600 hover:bg-orange-50 border-orange-100",
//   };

//   return (
//     <button
//       onClick={onClick}
//       disabled={disabled}
//       className={`flex h-9 w-9 items-center justify-center rounded-xl border bg-white transition-all active:scale-90 disabled:opacity-30 shadow-sm ${colors[color]}`}
//     >
//       <Icon size={16} strokeWidth={2.5} />
//     </button>
//   );
// };
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
const getStatusStyles = (status: string) => {
  // يمكنك ربط هذه الحالات ببياناتك الحقيقية
  switch (status) {
    case "closed":
      return "bg-gray-100 text-gray-600 border-gray-200";
    case "active":
      return "bg-emerald-50 text-emerald-700 border-emerald-100";
    case "pending":
      return "bg-amber-50 text-amber-700 border-amber-100";
    default:
      return "bg-blue-50 text-blue-700 border-blue-100";
  }
};

export default CasesTable;
