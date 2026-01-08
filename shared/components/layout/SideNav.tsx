"use client";

import React, { useState, useMemo, useCallback, memo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Scale,
  LayoutDashboard,
  Users,
  Building2,
  Clock,
  CheckSquare,
  CalendarDays,
  Wallet,
  Bell,
  Settings,
  ChevronLeft,
  ChevronDown,
  UserCog,
  Shield,
  User,
  Building,
  Gavel,
} from "lucide-react";
import { useSelector } from "react-redux";
import { selectUserPermissions } from "@/features/permissions/permissionsSlice";
import { selectUserProfile } from "@/features/userprofile/userProfileSlice";
import { PermissionDetail } from "@/features/permissions/types/permissionTypes";

// Permission keys that map to PermissionDetail fields
type PermissionKey =
  | "viewCasePermissions"
  | "clientPermissions"
  | "documentPermissions"
  | "sessionPermission"
  | "viewTaskPermissions"
  | "financePermission";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  submenu?: NavItem[];
  permissionKey?: PermissionKey;
  adminOnly?: boolean;
  badge?: string | number;
}

interface SideNavProps {
  isOpen?: boolean;
  onClose?: () => void;
}

// Helper function to check if user has permission
const hasPermission = (
  permissions: PermissionDetail,
  key: PermissionKey
): boolean => {
  return permissions[key] > 0;
};

const SideNav: React.FC<SideNavProps> = ({ isOpen = true, onClose }) => {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const userPermissions = useSelector(selectUserPermissions);
  const userProfile = useSelector(selectUserProfile);
  const isOfficeAdmin = userProfile.role === "OfficeAdmin";

  const allNavItems: NavItem[] = [
    {
      label: "الصفحة الرئيسية",
      href: "/dashboard",
      icon: <LayoutDashboard size={20} />,
    },
    {
      label: "إدارة القضايا",
      href: "/dashboard/cases",
      icon: <Gavel size={20} />,
      permissionKey: "viewCasePermissions",
    },
    {
      label: "إدارة الموكلين",
      href: "/dashboard/clients",
      icon: <Users size={20} />,
      permissionKey: "clientPermissions",
    },
    {
      label: "المحاكم",
      href: "/dashboard/courts",
      icon: <Building2 size={20} />,
      permissionKey: "documentPermissions",
    },
    {
      label: "إدارة الجلسات",
      href: "/dashboard/sessions",
      icon: <Clock size={20} />,
      permissionKey: "sessionPermission",
    },
    {
      label: "المهام",
      href: "/dashboard/tasks",
      icon: <CheckSquare size={20} />,
      permissionKey: "viewTaskPermissions",
    },
    {
      label: "التقويم",
      href: "/dashboard/calendar",
      icon: <CalendarDays size={20} />,
    },
    {
      label: "إدارة الماليات",
      href: "/dashboard/accounting",
      icon: <Wallet size={20} />,
      permissionKey: "financePermission",
    },
    {
      label: "إدارة الإشعارات",
      href: "/dashboard/notifications",
      icon: <Bell size={20} />,
    },
    {
      label: "الإعدادات",
      href: "#",
      icon: <Settings size={20} />,
      adminOnly: true,
      submenu: [
        {
          label: "المكتب",
          href: "/dashboard/settings/office",
          icon: <Building size={18} />,
        },
        {
          label: "المستخدمون",
          href: "/dashboard/settings/users",
          icon: <UserCog size={18} />,
        },
        {
          label: "الصلاحيات",
          href: "/dashboard/settings/permissions",
          icon: <Shield size={18} />,
        },
        {
          label: "الملف الشخصي",
          href: "/dashboard/settings/userprofile",
          icon: <User size={18} />,
        },
      ],
    },
  ];

  // Filter nav items based on user role and permissions
  const navItems = useMemo(() => {
    if (isOfficeAdmin) {
      return allNavItems;
    }

    return allNavItems.filter((item) => {
      if (item.adminOnly) {
        return false;
      }
      if (
        item.permissionKey &&
        !hasPermission(userPermissions, item.permissionKey)
      ) {
        return false;
      }
      return true;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userPermissions, isOfficeAdmin]);

  const toggleSubmenu = useCallback((label: string) => {
    setExpandedItems((prev) =>
      prev.includes(label)
        ? prev.filter((item) => item !== label)
        : [...prev, label]
    );
  }, []);

  const isActiveRoute = useCallback(
    (href: string) => {
      if (href === "#") return false;
      return pathname === href || pathname.startsWith(href + "/");
    },
    [pathname]
  );

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 lg:hidden z-30 backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static right-0 top-0 h-screen w-70 bg-[#17536e] transition-transform duration-300 z-40 flex flex-col ${
          isOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Logo Section */}
        <div className="p-4 border-b border-white/10">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 text-white"
          >
            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
              <Scale className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold">مكتبي</h1>
              <p className="text-[10px] text-white/60 uppercase tracking-wider">
                Management System
              </p>
            </div>
          </Link>

          {/* Mobile Close Button */}
          <button
            onClick={onClose}
            className="absolute left-3 top-4 p-2 hover:bg-white/10 rounded-lg text-white lg:hidden"
            aria-label="إغلاق القائمة"
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
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 custom-scrollbar">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.label}>
                {item.submenu ? (
                  <>
                    <button
                      onClick={() => toggleSubmenu(item.label)}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm transition-all group ${
                        expandedItems.includes(item.label)
                          ? "bg-white/15 text-white"
                          : "text-white/80 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        <span
                          className={`transition-colors ${
                            expandedItems.includes(item.label)
                              ? "text-white"
                              : "text-white/70 group-hover:text-white"
                          }`}
                        >
                          {item.icon}
                        </span>
                        <span className="font-medium">{item.label}</span>
                      </span>
                      <ChevronDown
                        size={16}
                        className={`transition-transform duration-200 ${
                          expandedItems.includes(item.label) ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    {expandedItems.includes(item.label) && (
                      <ul className="mt-1 mr-4 space-y-1 border-r-2 border-white/20 pr-4">
                        {item.submenu.map((subitem) => (
                          <li key={subitem.label}>
                            <Link
                              href={subitem.href}
                              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-all ${
                                isActiveRoute(subitem.href)
                                  ? "bg-white text-[#17536e] font-semibold"
                                  : "text-white/70 hover:bg-white/10 hover:text-white"
                              }`}
                              onClick={() => {
                                if (window.innerWidth < 1024) onClose?.();
                              }}
                            >
                              {subitem.icon && (
                                <span
                                  className={
                                    isActiveRoute(subitem.href)
                                      ? "text-[#6B1D2C]"
                                      : ""
                                  }
                                >
                                  {subitem.icon}
                                </span>
                              )}
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
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all group ${
                      isActiveRoute(item.href)
                        ? "bg-white text-[#17536e] font-semibold shadow-lg"
                        : "text-white/80 hover:bg-white/10 hover:text-white"
                    }`}
                    onClick={() => {
                      if (window.innerWidth < 1024) onClose?.();
                    }}
                  >
                    <span
                      className={`transition-colors ${
                        isActiveRoute(item.href)
                          ? "text-[#17536e]"
                          : "text-white/70 group-hover:text-white"
                      }`}
                    >
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className="mr-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                        {item.badge}
                      </span>
                    )}
                    <ChevronLeft
                      size={16}
                      className={`mr-auto opacity-0 group-hover:opacity-100 transition-opacity ${
                        isActiveRoute(item.href) ? "opacity-100" : ""
                      }`}
                    />
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-white/10">
          <div className="text-center text-white/50 text-xs">
            <p>© 2025 مكتبي</p>
            <p className="mt-1">الإصدار 1.0.0</p>
          </div>
        </div>
      </aside>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }
      `}</style>
    </>
  );
};

export default memo(SideNav);
