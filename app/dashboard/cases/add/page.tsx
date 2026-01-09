"use client";

import { useRouter } from "next/navigation";
import { Briefcase, ArrowRight } from "lucide-react";
import AddCaseForm from "@/features/cases/components/AddCaseForm";
import PageHeader from "@/shared/components/dashboard/PageHeader";

export default function AddCasePage() {
  const router = useRouter();

  const handleSuccess = () => {
    router.push("/dashboard/cases");
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <section className="space-y-6 relative">
      {/* Soft premium background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-blue-200/40 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-indigo-200/40 blur-3xl" />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-50 via-white to-white" />
      </div>

      {/* Header with Back Button */}
      <div className="flex items-center gap-4">
        <button
          onClick={handleCancel}
          className="inline-flex items-center justify-center w-10 h-10 rounded-2xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
          title="رجوع"
        >
          <ArrowRight size={20} />
        </button>
        <div className="flex-1">
          <PageHeader
            title="إضافة قضية جديدة"
            subtitle="أدخل بيانات القضية الجديدة."
            icon={Briefcase}
          />
        </div>
      </div>

      {/* Form Card */}
      <div className="rounded-2xl bg-white/90 backdrop-blur border border-gray-200/70 shadow-[0_10px_30px_-18px_rgba(0,0,0,0.35)] ring-1 ring-gray-200/50 overflow-hidden">
        {/* Accent line */}
        <div className="h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-500" />

        <div className="p-6">
          <AddCaseForm onSuccess={handleSuccess} onCancel={handleCancel} />
        </div>
      </div>
    </section>
  );
}
