"use client";
import React, { useState } from "react";
import {
  LayoutDashboard,
  Gavel,
  FileText,
  ClipboardList,
  Wallet,
  ShieldCheck,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";

// Import all tab components
import CaseOverview from "@/features/cases/components/CaseOverview";
import CaseSessions from "@/features/cases/components/CaseSessions";
import CaseDocuments from "@/features/cases/components/CaseDocuments";
import CaseTasks from "@/features/cases/components/CaseTasks";
import CasePayments from "@/features/cases/components/CasePayments";
import CaseManagement from "@/features/cases/components/CaseManagement";

type TabKey =
  | "overview"
  | "sessions"
  | "documents"
  | "tasks"
  | "payments"
  | "management";

interface NavItem {
  key: TabKey;
  name: string;
  trans: string;
  icon: React.ElementType;
}

export default function CaseDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const caseId = Number(params.id);

  // State for active tab
  const [activeTab, setActiveTab] = useState<TabKey>("overview");

  const caseNav: NavItem[] = [
    {
      key: "overview",
      name: "Overview",
      trans: "نظرة عامة",
      icon: LayoutDashboard,
    },
    {
      key: "sessions",
      name: "sessions",
      trans: "الجلسات",
      icon: Gavel,
    },
    {
      key: "documents",
      name: "Documents",
      trans: "المستندات",
      icon: FileText,
    },
    {
      key: "tasks",
      name: "tasks",
      trans: "المهام",
      icon: ClipboardList,
    },
    {
      key: "payments",
      name: "payments",
      trans: "المدفوعات",
      icon: Wallet,
    },
    // {
    //   key: "management",
    //   name: "management tasks",
    //   trans: "مهام الإدارة",
    //   icon: ShieldCheck,
    // },
  ];

  const handleBack = () => {
    router.push("/dashboard/cases");
  };

  // Render the active tab content
  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return <CaseOverview caseId={caseId} onBack={handleBack} />;
      case "sessions":
        return <CaseSessions caseId={caseId} />;
      case "documents":
        return <CaseDocuments caseId={caseId} />;
      case "tasks":
        return <CaseTasks caseId={caseId} />;
      case "payments":
        return <CasePayments caseId={caseId} />;
      case "management":
        return <CaseManagement caseId={caseId} />;
      default:
        return <CaseOverview caseId={caseId} onBack={handleBack} />;
    }
  };

  return (
    <div className="case-page flex flex-col h-full">
      {/* Navigation Bar Container - Fixed */}
      <div className="sticky top-0 z-20 bg-background pb-4">
        <div className="w-full bg-primary p-2 rounded-xl shadow-sm shadow-primary/20 border border-white/10">
          <nav className="flex items-center justify-start lg:justify-between gap-1 overflow-x-auto no-scrollbar py-1 px-7">
            {caseNav.map((item) => {
              const Icon = item.icon;
              const current = activeTab === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => setActiveTab(item.key)}
                  className={`
                    relative flex items-center gap-2.5 px-6 py-3 rounded-2xl text-sm font-bold transition-all duration-300 whitespace-nowrap group cursor-pointer
                    ${
                      current
                        ? "bg-white text-primary shadow-lg shadow-black/10 scale-105 active:scale-95"
                        : "text-white/70 hover:text-white hover:bg-white/10"
                    }
                  `}
                  aria-current={current ? "page" : undefined}
                >
                  <Icon
                    size={18}
                    strokeWidth={current ? 2.5 : 2}
                    className={`transition-transform duration-300 ${
                      !current && "group-hover:-translate-y-0.5"
                    }`}
                  />

                  <span>{item.trans}</span>

                  {/* Optional: Active Indicator Dot */}
                  {current && (
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Content Area - Scrollable */}
      <div className="flex-1 overflow-y-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
        {renderContent()}
      </div>

      <style jsx>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
