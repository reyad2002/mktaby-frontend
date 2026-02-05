"use client";

import { useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import toast from "react-hot-toast";
import {
  Loader2,
  User,
  Mail,
  Phone,
  Shield,
  Camera,
  Building2,
  Calendar,
  Hash,
  Edit,
  ArrowRight,
  AlertCircle,
  RefreshCcw,
  BadgeCheck,
  IdCard,
  ClipboardCopy,
  Check,
  Sparkles,
} from "lucide-react";

import {
  getCurrentUser,
  setProfileImage,
} from "@/features/users/apis/usersApi";
import EditProfileForm from "@/features/userprofile/components/EditProfileForm";

type TabKey = "overview" | "system";

/* ===================== NEW DESIGN SYSTEM ===================== */
const ui = {
  // Page Background
  page: "max-w-7xl mx-auto space-y-8 pb-20 pt-6 px-4 sm:px-6",

  // Cards
  card: "group relative overflow-hidden rounded-3xl bg-white border border-gray-100 shadow-[0_2px_20px_rgb(0,0,0,0.04)] transition-all duration-300",
  cardHover: "hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)]",

  // Buttons
  btnPrimary:
    "inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-bold text-white shadow-lg shadow-primary/20 hover:bg-primary/90 cursor-pointer hover:shadow-primary/10 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed",
  btnGhost:
    "inline-flex items-center justify-center gap-2 rounded-2xl border border-transparent bg-transparent px-5 py-3 text-sm font-bold text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed",
  btnLight:
    "inline-flex items-center justify-center gap-2 rounded-2xl border border-indigo-100 bg-primary px-5 py-3 text-sm font-bold text-white cursor-pointer hover:bg-primary/90 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed",

  // Status Chips
  chip: "inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-gray-50/80 px-3 py-1 text-xs font-bold text-gray-700 backdrop-blur-sm",

  // Icons
  iconSoft:
    "inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100/50",

  // Inputs/Interactive
  tabBase:
    "flex-1 rounded-xl py-2.5 text-sm font-bold transition-all duration-200",
  tabActive: "bg-white text-indigo-600 shadow-sm ring-1 ring-gray-200",
  tabInactive: "text-gray-500 hover:text-gray-900 hover:bg-gray-100/50",
};

function formatDateLong(value?: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("ar-EG", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function safeText(v?: string | null) {
  return v && String(v).trim() ? String(v) : "—";
}

export default function UserProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [tab, setTab] = useState<TabKey>("overview");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const { data, isLoading, isError, error, isFetching, refetch } = useQuery({
    queryKey: ["currentUser"],
    queryFn: getCurrentUser,
  });

  const user = data?.data;

  const createdAtText = useMemo(
    () => formatDateLong(user?.createdAt),
    [user?.createdAt]
  );

  const uploadImageMutation = useMutation({
    mutationFn: ({ id, file }: { id: number; file: File }) =>
      setProfileImage(id, file),
    onSuccess: (res) => {
      if (res.succeeded) {
        toast.success("تم تحديث الصورة بنجاح");
        queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      } else {
        toast.error(res.message || "فشل التحديث");
      }
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "حدث خطأ");
    },
  });

  const handlePickImage = () => fileInputRef.current?.click();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith("image/")) {
      toast.error("يرجى اختيار ملف صورة");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("حجم الصورة يجب أن يكون أقل من 5 ميجابايت");
      return;
    }

    uploadImageMutation.mutate({ id: user.id, file });
  };

  /* ===================== LOADING STATE ===================== */
  if (isLoading) {
    return (
      <section className={ui.page}>
        <div className="flex items-center justify-between mb-8 animate-pulse">
          <div className="h-8 w-48 bg-gray-200 rounded-xl" />
          <div className="h-10 w-32 bg-gray-200 rounded-xl" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4 space-y-6">
            <SkeletonCard height={480} />
          </div>
          <div className="lg:col-span-8 space-y-6">
            <SkeletonCard height={300} />
            <SkeletonCard height={200} />
          </div>
        </div>
      </section>
    );
  }

  /* ===================== ERROR STATE ===================== */
  if (isError || !user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-red-50 text-red-600 ring-8 ring-red-50/50">
          <AlertCircle size={32} />
        </div>
        <h2 className="text-xl font-bold text-gray-900">
          فشل في تحميل البيانات
        </h2>
        <p className="text-gray-500 max-w-md text-center">
          {error instanceof Error ? error.message : "حدث خطأ غير متوقع"}
        </p>
        <button onClick={() => refetch()} className={ui.btnGhost}>
          <RefreshCcw size={18} />
          إعادة المحاولة
        </button>
      </div>
    );
  }

  /* ===================== MAIN UI ===================== */
  return (
    <section className={ui.page}>
      {/* --- HEADER --- */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-gray-200/60">
        <div>
          <div className="flex items-center gap-3 text-indigo-600 mb-2">
            {/* <Sparkles size={18} /> */}
            <span className="text-xs font-bold uppercase tracking-wider text-primary">
              الملف الشخصي
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            مرحباً، {user.name.split(" ")[0]}
          </h1>
          <p className="text-gray-500 mt-1 font-medium">
            تحكم في بيانات حسابك وتفضيلاتك الشخصية.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className={`${ui.btnGhost} !px-3`}
            title="تحديث البيانات"
          >
            <RefreshCcw
              size={20}
              className={
                isFetching ? "animate-spin text-indigo-600" : "text-gray-400"
              }
            />
          </button>

          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className={ui.btnPrimary}
            >
              <Edit size={18} />
              <span>تعديل الملف</span>
            </button>
          ) : (
            <button onClick={() => setIsEditing(false)} className={ui.btnLight}>
              <ArrowRight size={18} />
              <span>العودة للملف</span>
            </button>
          )}
        </div>
      </header>

      <div className=" flex flex-col gap-8 ">
        {/* --- LEFT COLUMN: PROFILE CARD --- */}
        {/* <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-8">
          <div className={`${ui.card} ${ui.cardHover} text-center`}>
      
            <div className="h-32 bg-gradient-to-br from-primary to-slate-900 relative">
              <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150"></div>
            </div>

            <div className="px-6 pb-8 relative">
           
              <div className="relative -mt-16 mb-4 inline-block">
                <div className="relative w-32 h-32 rounded-[2rem] p-1 bg-white ring-4 ring-white shadow-xl overflow-hidden">
                  <div className="relative w-full h-full rounded-[1.8rem] overflow-hidden bg-gray-100">
                    {user.imageURL ? (
                      <Image
                        src={user.imageURL}
                        alt="Profile"
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 33vw"
                        priority
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <User size={48} />
                      </div>
                    )}
                  </div>

                
                  <button
                    onClick={handlePickImage}
                    disabled={uploadImageMutation.isPending}
                    className="absolute bottom-2 right-2 p-2 rounded-xl bg-gray-900 text-white shadow-lg hover:bg-black transition-transform hover:scale-105 active:scale-95 disabled:opacity-70"
                  >
                    {uploadImageMutation.isPending ? (
                      <Loader2 className="animate-spin" size={16} />
                    ) : (
                      <Camera size={16} />
                    )}
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </div>
              </div>

          
              <div className="space-y-1 mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  {safeText(user.name)}
                </h2>
                <p className="text-sm font-medium text-gray-500">
                  {user.email}
                </p>
              </div>

         
              <div className="flex flex-wrap justify-center gap-2 mb-6">
                <span className={ui.chip}>
                  <Hash size={12} className="text-gray-400" />
                  ID: {user.id}
                </span>
               
              </div>

            
              <div className="grid grid-cols-2 gap-3">
                <CopyChip label="نسخ البريد" value={user.email} />
                <CopyChip label="نسخ الهاتف" value={user.phoneNumber || ""} />
              </div>
            </div>
          </div>
        </aside> */}

        {/* --- RIGHT COLUMN: CONTENT --- */}
        <main className="lg:col-span-8 space-y-6">
          {isEditing ? (
            <div className={`${ui.card} p-8`}>
              <div className="mb-6 pb-6 border-b border-gray-100">
                <h3 className="text-lg font-bold text-gray-900">
                  تعديل البيانات
                </h3>
                <p className="text-sm text-gray-500">
                  قم بتحديث معلوماتك الشخصية أدناه.
                </p>
              </div>
              <EditProfileForm
                user={user}
                onCancel={() => setIsEditing(false)}
                onSuccess={() => setIsEditing(false)}
              />
            </div>
          ) : (
            <>
              {tab === "overview" && (
                <div
                  className={`${ui.card} ${ui.cardHover} p-6 sm:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500`}
                >
                  <div className="flex items-center gap-4 mb-8">
                    <span className={ui.iconSoft}>
                      <User size={20} />
                    </span>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">
                        التفاصيل الشخصية
                      </h3>
                      <p className="text-sm text-gray-500">
                        البيانات المعروضة للآخرين في النظام
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <DataField
                      label="الاسم الكامل"
                      value={safeText(user.name)}
                    />
                    <DataField
                      label="البريد الإلكتروني"
                      value={safeText(user.email)}
                    />
                    <DataField
                      label="رقم الهاتف"
                      value={safeText(user.phoneNumber)}
                      dir="ltr"
                    />
                    <DataField
                      label="المكتب التابع له"
                      value={safeText(user.officeName)}
                    />
                  </div>

                  <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end">
                    <button
                      onClick={() => setIsEditing(true)}
                      className={ui.btnLight}
                    >
                      تحديث البيانات
                    </button>
                  </div>
                </div>
              )}

              {tab === "system" && (
                <div
                  className={`${ui.card} ${ui.cardHover} p-6 sm:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500`}
                >
                  <div className="flex items-center gap-4 mb-8">
                    <span className={ui.iconSoft}>
                      <BadgeCheck size={20} />
                    </span>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">
                        حالة النظام
                      </h3>
                      <p className="text-sm text-gray-500">
                        معلومات تقنية حول صلاحياتك وحسابك
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <SystemStat
                      icon={Hash}
                      label="ID المستخدم"
                      value={`#${user.id}`}
                    />
                    <SystemStat
                      icon={Shield}
                      label="نوع الصلاحية"
                      value={safeText(user.userPermissionName)}
                      highlighted
                    />
                    <SystemStat
                      icon={Calendar}
                      label="تاريخ الانضمام"
                      value={createdAtText}
                    />
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </section>
  );
}

/* ===================== NEW COMPONENT PIECES ===================== */

function CopyChip({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);
  const canCopy = !!value;

  const onCopy = async () => {
    if (!canCopy) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
      toast.success("تم النسخ");
    } catch {
      toast.error("تعذر النسخ");
    }
  };

  return (
    <button
      onClick={onCopy}
      disabled={!canCopy}
      className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all border ${
        canCopy
          ? "border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-300"
          : "border-transparent bg-gray-50 text-gray-400 cursor-not-allowed"
      }`}
    >
      {copied ? (
        <Check size={14} className="text-green-600" />
      ) : (
        <ClipboardCopy size={14} />
      )}
      {label}
    </button>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function SideInfoRow({ icon: Icon, label, value, dir }: any) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-2xl hover:bg-gray-50 transition-colors">
      <Icon size={18} className="text-gray-400 mt-0.5" />
      <div>
        <p className="text-xs font-semibold text-gray-500 mb-0.5">{label}</p>
        <p className="text-sm font-bold text-gray-900" dir={dir}>
          {value}
        </p>
      </div>
    </div>
  );
}

function DataField({
  label,
  value,
  dir,
}: {
  label: string;
  value: string;
  dir?: string;
}) {
  return (
    <div className="group rounded-2xl bg-gray-50/50 p-4 border border-transparent hover:border-indigo-100 hover:bg-indigo-50/30 transition-all">
      <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
        {label}
      </p>
      <p className="text-base font-bold text-gray-900" dir={dir}>
        {value}
      </p>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function SystemStat({ icon: Icon, label, value, highlighted }: any) {
  return (
    <div
      className={`flex flex-col items-center justify-center p-6 rounded-3xl border text-center transition-all ${
        highlighted
          ? "bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-200"
          : "bg-white border-gray-100 text-gray-900 hover:border-indigo-200"
      }`}
    >
      <div
        className={`mb-3 p-3 rounded-2xl ${
          highlighted ? "bg-white/20" : "bg-gray-50 text-indigo-600"
        }`}
      >
        <Icon size={24} />
      </div>
      <span
        className={`text-xs font-bold mb-1 ${
          highlighted ? "text-indigo-100" : "text-gray-500"
        }`}
      >
        {label}
      </span>
      <span className="text-lg font-extrabold">{value}</span>
    </div>
  );
}

/* ===================== SKELETONS ===================== */
function SkeletonCard({ height = 240 }: { height?: number }) {
  return (
    <div
      className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm animate-pulse"
      style={{ height }}
    >
      <div className="h-6 w-32 rounded-lg bg-gray-100 mb-6" />
      <div className="space-y-4">
        <div className="h-4 w-full rounded-lg bg-gray-100" />
        <div className="h-4 w-5/6 rounded-lg bg-gray-100" />
        <div className="h-4 w-4/6 rounded-lg bg-gray-100" />
      </div>
    </div>
  );
}
