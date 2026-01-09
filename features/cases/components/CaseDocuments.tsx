"use client";

import React from "react";
import { FileText, Upload, FolderOpen } from "lucide-react";

/* ========== Styles ========== */
const ui = {
  page: "space-y-5 pb-12",
  card: "rounded-2xl border border-slate-200 bg-white shadow-sm",
  cardHeader:
    "px-5 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3",
  cardBody: "p-5",
};

/* ========== Component Props ========== */
interface CaseDocumentsProps {
  caseId: number;
}

/* ========== Main Component ========== */
export default function CaseDocuments({ caseId }: CaseDocumentsProps) {
  return (
    <section className={ui.page}>
      <div className={ui.card}>
        <div className={ui.cardHeader}>
          <div className="flex items-center gap-2">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-teal-700">
              <FileText size={20} />
            </span>
            <h1 className="text-xl font-bold text-slate-900">مستندات القضية</h1>
          </div>
          <button className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-700 transition">
            <Upload size={16} />
            رفع مستند
          </button>
        </div>

        <div className={ui.cardBody}>
          <div className="text-center py-16">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50 text-slate-400 border border-slate-200 mb-4">
              <FolderOpen size={32} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              لا توجد مستندات
            </h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto mb-6">
              لم يتم رفع أي مستندات لهذه القضية بعد. ابدأ برفع المستندات
              المطلوبة.
            </p>
            <button className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-6 py-3 text-sm font-semibold text-white hover:bg-teal-700 transition">
              <Upload size={18} />
              رفع أول مستند
            </button>
          </div>
        </div>
      </div>

      {/* Placeholder for document ID usage */}
      <input type="hidden" value={caseId} />
    </section>
  );
}
