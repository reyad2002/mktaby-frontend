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
  Sparkles,
} from "lucide-react";

import { getCurrentUser, setProfileImage } from "@/features/users/apis/usersApi";
import EditProfileForm from "@/features/userprofile/components/EditProfileForm";

type TabKey = "basic" | "meta";

export default function UserProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [tab, setTab] = useState<TabKey>("basic");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const {
    data,
    isLoading,
    isError,
    error,
    isFetching,
  } = useQuery({
    queryKey: ["currentUser"],
    queryFn: getCurrentUser,
  });

  const user = data?.data;

  const createdAtText = useMemo(() => {
    if (!user?.createdAt) return "—";
    return new Date(user?.createdAt).toLocaleDateString("ar-EG", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }, [user?.createdAt]);

  const uploadImageMutation = useMutation({
    mutationFn: ({ id, file }: { id: number; file: File }) =>
      setProfileImage(id, file),
    onSuccess: (res) => {
      if (res.succeeded) {
        toast.success("تم تحديث صورة الملف الشخصي بنجاح");
        queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      } else {
        toast.error(res.message || "فشل تحديث صورة الملف الشخصي");
      }
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "حدث خطأ أثناء تحميل الصورة");
    },
  });

  const handlePickImage = () => fileInputRef.current?.click();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith("image/")) {
      toast.error("يرجى اختيار ملف صورة صحيح");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("حجم الصورة يجب أن يكون أقل من 5 ميجابايت");
      return;
    }

    uploadImageMutation.mutate({ id: user.id, file });
  };

  /* ---------------- Loading (Skeleton) ---------------- */
  if (isLoading) {
    return (
      <section className="space-y-6 max-w-6xl mx-auto">
        <SkeletonHero />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 space-y-6">
            <SkeletonCard height={360} />
          </div>
          <div className="lg:col-span-8 space-y-6">
            <SkeletonCard height={56} />
            <SkeletonCard height={320} />
          </div>
        </div>
      </section>
    );
  }

  /* ---------------- Error ---------------- */
  if (isError || !user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <AlertCircle className="text-red-600" size={48} />
        <p className="text-red-700 text-lg">حدث خطأ أثناء جلب بيانات الحساب</p>
        <p className="text-gray-600 text-sm">
          {error instanceof Error ? error.message : "خطأ غير معروف"}
        </p>
      </div>
    );
  }

  return (
    <section className="space-y-6 max-w-6xl mx-auto relative">
      {/* HERO */}
      <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="relative px-6 py-6 sm:py-8">
          {/* background */}
          <div className="absolute inset-0">
            <div className="absolute -top-24 -left-24 h-64 w-64 rounded-full bg-blue-200/40 blur-3xl" />
            <div className="absolute -bottom-24 -right-24 h-64 w-64 rounded-full bg-indigo-200/40 blur-3xl" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(2,6,23,0.04)_1px,transparent_0)] [background-size:18px_18px]" />
          </div>

          <div className="relative flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 text-xs font-medium">
                <Sparkles size={14} />
                إعدادات الحساب
              </div>

              <h1 className="text-3xl font-semibold text-gray-900">
                الملف الشخصي
              </h1>

              <p className="text-sm text-gray-600">
                إدارة بيانات حسابك وتحديث صورة الملف الشخصي بسهولة.
              </p>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                {isFetching && (
                  <span className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-gray-50 text-gray-700 border border-gray-200 text-xs">
                    <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                    يتم التحديث...
                  </span>
                )}
              </div>
            </div>

            {/* Desktop edit button */}
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-900 text-white font-medium hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              >
                <Edit size={18} />
                تعديل البيانات
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Floating Edit Button (Mobile, RTL-safe + Safe-area) */}
      {!isEditing && (
        <button
          onClick={() => setIsEditing(true)}
          className="sm:hidden fixed z-50 inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-gray-900 text-white font-semibold shadow-xl hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/30"
          style={{
            insetInlineEnd: "16px",
            bottom: "calc(16px + env(safe-area-inset-bottom))",
          }}
        >
          <Edit size={18} />
          تعديل
        </button>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT: Profile Card (بدون تكرار) */}
        <aside className="lg:col-span-4 space-y-6">
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow overflow-hidden">
            <div className="relative h-24 bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900">
              <div className="absolute inset-0 opacity-25 bg-[radial-gradient(circle_at_1px_1px,#fff_1px,transparent_0)] [background-size:16px_16px]" />
            </div>

            <div className="p-6 -mt-10">
              <div className="flex items-end justify-between gap-4">
                <div className="relative">
                  <div className="relative w-24 h-24 rounded-2xl overflow-hidden border-4 border-white shadow-lg bg-gray-50">
                    {user.imageURL ? (
                      <Image
                        src={user.imageURL}
                        alt="Profile"
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-500">
                        <User size={34} />
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={handlePickImage}
                      disabled={uploadImageMutation.isPending}
                      className="absolute bottom-2 left-2 inline-flex items-center justify-center w-9 h-9 rounded-xl bg-white/95 border border-gray-200 shadow-sm hover:bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/30 disabled:opacity-60"
                      title="تغيير الصورة"
                    >
                      {uploadImageMutation.isPending ? (
                        <Loader2 className="animate-spin text-blue-600" size={18} />
                      ) : (
                        <Camera className="text-gray-800" size={18} />
                      )}
                    </button>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </div>

                <div className="text-left">
                  <div className="text-xs text-gray-500">معرف المستخدم</div>
                  <div className="text-sm font-semibold text-gray-900">
                    #{user.id}
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  {user.name}
                </h2>
                <p className="text-sm text-gray-600 break-words">{user.email}</p>
              </div>

              <div className="mt-5 space-y-3">
                <KeyLine icon={Building2} label="المكتب" value={user.officeName || "—"} />
                <KeyLine icon={Phone} label="رقم الهاتف" value={user.phoneNumber || "—"} dir="ltr" />
                <KeyLine icon={Shield} label="الصلاحية" value={user.userPermissionName || "—"} />
                <KeyLine icon={Calendar} label="تاريخ الإنشاء" value={createdAtText} />
              </div>
            </div>
          </div>
        </aside>

        {/* RIGHT: Details (Tabs + forms) */}
        <main className="lg:col-span-8 space-y-6">
          {isEditing ? (
            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow p-6">
              <div className="flex items-center justify-between gap-3 mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    تعديل الملف الشخصي
                  </h3>
                  <p className="text-sm text-gray-600">
                    عدّل بياناتك ثم احفظ التغييرات.
                  </p>
                </div>

                <button
                  onClick={() => setIsEditing(false)}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                >
                  <ArrowRight size={16} />
                  رجوع
                </button>
              </div>

              <EditProfileForm
                user={user}
                onCancel={() => setIsEditing(false)}
                onSuccess={() => setIsEditing(false)}
              />
            </div>
          ) : (
            <>
              <SegmentedTabs<TabKey>
                value={tab}
                onChange={setTab}
                options={[
                  { key: "basic", label: "البيانات الأساسية" },
                  { key: "meta", label: "بيانات النظام" },
                ]}
              />

              {tab === "basic" ? (
                <div className="rounded-2xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow p-6">
                  <div className="mb-5">
                    <h3 className="text-lg font-semibold text-gray-900">
                      البيانات الأساسية
                    </h3>
                    <p className="text-sm text-gray-600">
                      معلوماتك الأساسية كما تظهر داخل النظام.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field icon={User} label="الاسم" value={user.name} />
                    <Field icon={Mail} label="البريد الإلكتروني" value={user.email} />
                    <Field
                      icon={Phone}
                      label="رقم الهاتف"
                      value={user.phoneNumber || "—"}
                      dir="ltr"
                    />
                    <Field
                      icon={Building2}
                      label="المكتب"
                      value={user.officeName || "—"}
                    />
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow p-6">
                  <div className="mb-5">
                    <h3 className="text-lg font-semibold text-gray-900">
                      بيانات النظام
                    </h3>
                    <p className="text-sm text-gray-600">
                      بيانات مرجعية للحساب داخل النظام.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <StatCard icon={Hash} title="معرف المستخدم" value={`#${user.id}`} />
                    <StatCard icon={Calendar} title="تاريخ الإنشاء" value={createdAtText} />
                    <StatCard icon={Shield} title="الصلاحية" value={user.userPermissionName || "—"} />
                    <StatCard icon={Building2} title="المكتب" value={user.officeName || "—"} />
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

/* ---------------- Segmented Tabs (RTL-safe) ---------------- */

function SegmentedTabs<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: Array<{ key: T; label: string }>;
}) {
  const activeIndex = Math.max(
    0,
    options.findIndex((o) => o.key === value)
  );

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-2">
      <div className="relative grid grid-cols-2 gap-2">
        <div
          className="absolute top-0 bottom-0 rounded-xl bg-gray-900 transition-all duration-300 ease-out"
          style={{
            width: "calc(50% - 4px)",
            insetInlineStart: activeIndex === 0 ? "0px" : "calc(50% + 4px)",
          }}
        />
        {options.map((opt) => {
          const isActive = opt.key === value;
          return (
            <button
              key={opt.key}
              type="button"
              onClick={() => onChange(opt.key)}
              className={`relative z-10 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/30 ${
                isActive ? "text-white" : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------- UI Pieces ---------------- */

function KeyLine({
  icon: Icon,
  label,
  value,
  dir,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: any;
  label: string;
  value: string;
  dir?: "ltr" | "rtl";
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="p-2 rounded-xl bg-blue-50 border border-blue-200">
        <Icon className="text-blue-700" size={16} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-gray-600">{label}</p>
        <p className="text-sm font-semibold text-gray-900 break-words" dir={dir}>
          {value}
        </p>
      </div>
    </div>
  );
}

function Field({
  icon: Icon,
  label,
  value,
  dir,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: any;
  label: string;
  value: string;
  dir?: "ltr" | "rtl";
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 hover:shadow-sm transition-shadow">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-xl bg-blue-50 border border-blue-200">
          <Icon className="text-blue-700" size={18} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm text-gray-600">{label}</p>
          <p className="mt-1 font-semibold text-gray-900 break-words" dir={dir}>
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  title,
  value,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: any;
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-blue-50 border border-blue-200">
          <Icon className="text-blue-700" size={18} />
        </div>
        <div className="min-w-0">
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-gray-900 font-semibold break-words">{value}</p>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Skeletons ---------------- */

function SkeletonHero() {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-6 sm:p-8">
      <div className="animate-pulse space-y-4">
        <div className="h-6 w-40 rounded bg-gray-200" />
        <div className="h-8 w-56 rounded bg-gray-200" />
        <div className="h-4 w-80 rounded bg-gray-200" />
        <div className="flex gap-2">
          <div className="h-7 w-28 rounded bg-gray-200" />
          <div className="h-7 w-28 rounded bg-gray-200" />
        </div>
      </div>
    </div>
  );
}

function SkeletonCard({ height = 220 }: { height?: number }) {
  return (
    <div
      className="rounded-2xl border border-gray-200 bg-white shadow-sm p-6 animate-pulse"
      style={{ height }}
    >
      <div className="h-5 w-40 rounded bg-gray-200 mb-4" />
      <div className="space-y-3">
        <div className="h-4 w-full rounded bg-gray-200" />
        <div className="h-4 w-5/6 rounded bg-gray-200" />
        <div className="h-4 w-4/6 rounded bg-gray-200" />
      </div>
    </div>
  );
}
