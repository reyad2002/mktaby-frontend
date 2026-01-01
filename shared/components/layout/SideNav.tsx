"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Scale } from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  submenu?: NavItem[];
}

interface SideNavProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const SideNav: React.FC<SideNavProps> = ({ isOpen = true, onClose }) => {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const navItems: NavItem[] = [
    {
      label: "لوحة التحكم",
      href: "/dashboard",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 12l2-3m0 0l7-4 7 4M5 7v10a1 1 0 001 1h12a1 1 0 001-1V7m0 0l-7 4m7-4L9 7"
          />
        </svg>
      ),
    },
    {
      label: "القضايا",
      href: "/dashboard/cases",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      ),
    },
    {
      label: "العملاء",
      href: "/dashboard/clients",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4.354a4 4 0 110 5.292M15 4H9m6 16H9m6-7a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      ),
    },
    {
      label: "المحاكم",
      href: "/dashboard/courts",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
          />
        </svg>
      ),
    },
    {
      label: "الجلسات",
      href: "/dashboard/sessions",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
    {
      label: "المهام",
      href: "/dashboard/tasks",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
          />
        </svg>
      ),
    },
    {
      label: "التقويم",
      href: "/dashboard/calendar",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
          />
        </svg>
      ),
    },
    {
      label: "الإعدادات",
      href: "#",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      ),
      submenu: [
        {
          label: "المكتب",
          href: "/dashboard/settings/office",
          icon: null,
        },
        {
          label: "المستخدمون",
          href: "/dashboard/settings/users",
          icon: null,
        },
        {
          label: "الصلاحيات",
          href: "/dashboard/settings/permissions",
          icon: null,
        },
        {
          label: "الملف الشخصي",
          href: "/dashboard/settings/userprofile",
          icon: null,
        },
      ],
    },
  ];

  const toggleSubmenu = (label: string) => {
    setExpandedItems((prev) =>
      prev.includes(label)
        ? prev.filter((item) => item !== label)
        : [...prev, label]
    );
  };

  const isActiveRoute = (href: string) => {
    if (href === "#") return false;
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 lg:hidden z-30 backdrop-blur-sm"
          onClick={onClose}
        ></div>
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static right-0 top-0 h-screen w-64 sm:w-72 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 border-l border-yellow-400/40 shadow-2xl lg:shadow-none transition-transform duration-300 z-40 ${
          isOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Close button for mobile */}

        {/* Navigation Items */}
        <nav className="px-3 sm:px-4 pb-6 flex flex-col space-y-5 mt-4 h-full">
          <Link
            href="/"
            className="w-full flex items-center sm:gap-3 px-3 sm:px-4 py-3 rounded-xl bg-white/5 border border-white/5 backdrop-blur-sm transition-all hover:border-yellow-300/60 hover:shadow-lg"
          >
            <div className="flex items-center justify-between w-full gap-3 text-yellow-100">
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-lg text-yellow-100 lg:hidden cursor-pointer"
                aria-label="إغلاق القائمة الجانبية"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
              <div className="flex items-center gap-3">
                <span className="bg-yellow-400/90 text-slate-900 p-2 rounded-2xl hidden sm:inline-flex shadow-sm">
                  <Scale />
                </span>
                <p className="text-lg font-semibold">مكتبي</p>
              </div>
              <span className="text-xs uppercase tracking-[0.2em] text-white/60">
                Elite
              </span>
            </div>
          </Link>

          <div className="flex-1 overflow-y-auto">
            <ul className="space-y-2">
              {navItems.map((item) => (
                <li key={item.label}>
                  {item.submenu ? (
                    <>
                      <button
                        onClick={() => toggleSubmenu(item.label)}
                        className={`w-full flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl transition-all text-sm sm:text-base border border-transparent ${
                          expandedItems.includes(item.label)
                            ? "bg-white/10 border-yellow-300/60 text-yellow-200 shadow-lg shadow-yellow-900/20"
                            : "text-gray-200 hover:bg-white/5 hover:border-white/10"
                        }`}
                      >
                        <span className="flex items-center gap-2 sm:gap-3">
                          {item.icon}
                          {item.label}
                        </span>
                        <svg
                          className={`w-4 h-4 transition-transform ${
                            expandedItems.includes(item.label)
                              ? "rotate-180"
                              : ""
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 14l-7 7m0 0l-7-7m7 7V3"
                          />
                        </svg>
                      </button>
                      {expandedItems.includes(item.label) && (
                        <ul className="mt-2 mr-6 sm:mr-8 space-y-1.5 border-r border-white/10 pr-3 sm:pr-4">
                          {item.submenu.map((subitem) => (
                            <li key={subitem.label}>
                              <Link
                                href={subitem.href}
                                className={`block px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm transition-colors border border-transparent ${
                                  isActiveRoute(subitem.href)
                                    ? "bg-yellow-400/20 text-yellow-100 border-yellow-300/60"
                                    : "text-gray-300 hover:text-white hover:bg-white/5 hover:border-white/10"
                                }`}
                                onClick={() => {
                                  if (window.innerWidth < 1024) onClose?.();
                                }}
                              >
                                {subitem.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </>
                  ) : (
                    <Link
                      href={item.href}
                      className={`flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl transition-all text-sm sm:text-base border border-transparent ${
                        isActiveRoute(item.href)
                          ? "bg-yellow-400/90 text-slate-900 font-semibold shadow-xl shadow-yellow-900/30"
                          : "text-gray-100 hover:bg-white/5 hover:border-white/10"
                      }`}
                      onClick={() => {
                        if (window.innerWidth < 1024) onClose?.();
                      }}
                    >
                      {item.icon}
                      {item.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </nav>
      </aside>
    </>
  );
};

export default SideNav;
