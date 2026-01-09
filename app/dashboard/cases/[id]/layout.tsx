"use client";
import React from "react";
import {
  LayoutDashboard,
  Gavel,
  FileText,
  ClipboardList,
  Wallet,
  ShieldCheck,
} from "lucide-react";
import { useParams, usePathname } from "next/navigation";

const CaseLayout = ({ children }: { children: React.ReactNode }) => {
  const params = useParams();
  const pathname = usePathname();
  const caseId = params.id;

  const basePath = `/dashboard/cases/${caseId}`;

  const caseNav = [
    {
      name: "Overview",
      trans: "نظرة عامة",
      href: basePath,
      icon: LayoutDashboard,
    },
    {
      name: "sessions",
      trans: "الجلسات",
      href: `${basePath}/sessions`,
      icon: Gavel,
    },
    {
      name: "Documents",
      trans: "المستندات",
      href: `${basePath}/documents`,
      icon: FileText,
    },
    {
      name: "tasks",
      trans: "المهام",
      href: `${basePath}/tasks`,
      icon: ClipboardList,
    },
    {
      name: "payments",
      trans: "المدفوعات",
      href: `${basePath}/payments`,
      icon: Wallet,
    },
    {
      name: "management tasks",
      trans: "مهام الإدارة",
      href: `${basePath}/management`,
      icon: ShieldCheck,
    },
  ];

  const isActive = (href: string) => {
    if (href === basePath) {
      return pathname === basePath;
    }
    return pathname.startsWith(href);
  };

  return (
    <div className="case-layout space-y-6">
      {/* Navigation Bar Container */}
      <div className="w-full bg-primary p-2 rounded-xl shadow-sm shadow-primary/20 border border-white/10 sticky top-0 z-10">
        <nav className="flex items-center justify-start lg:justify-between gap-1 overflow-x-auto no-scrollbar py-1 px-7">
          {caseNav.map((item) => {
            const Icon = item.icon;
            const current = isActive(item.href);
            return (
              <a
                key={item.name}
                href={item.href}
                className={`
                  relative flex items-center gap-2.5 px-6 py-3 rounded-2xl text-sm font-bold transition-all duration-300 whitespace-nowrap group
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
              </a>
            );
          })}
        </nav>
      </div>

      {/* Content Area */}
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        {children}
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
};

export default CaseLayout;
