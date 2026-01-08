"use client";

import React, { useState, useCallback, memo } from "react";
import Link from "next/link";
import { logout } from "../../../features/auth/apis/authApi";
import { clearTokens } from "@/lib/authTokens";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getCurrentUser } from "@/features/users/apis/usersApi";
import NotificationDropdown from "@/features/notification/components/NotificationDropdown";
import toast from "react-hot-toast";
import {
  Search,
  Menu,
  Settings,
  LogOut,
  User,
  ChevronDown,
} from "lucide-react";

interface HeaderProps {
  toggleSidebar?: () => void;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar }) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const logoutMethod = useCallback(async () => {
    try {
      await logout("browser-device", true);
    } catch {
      // Continue with logout even if API fails
    } finally {
      clearTokens();
      queryClient.clear();
      toast.success("تم تسجيل الخروج بنجاح");
      router.replace("/auth/login");
    }
  }, [router, queryClient]);

  const toggleProfile = useCallback(() => {
    setIsProfileOpen((prev) => !prev);
  }, []);

  const closeProfile = useCallback(() => {
    setIsProfileOpen(false);
  }, []);

  // Fetch current user details
  const { data: userResponse } = useQuery({
    queryKey: ["currentUser"],
    queryFn: getCurrentUser,
  });

  // Get user initials
  const getUserInitials = (name: string | undefined) => {
    if (!name) return "م";
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return parts[0][0] + parts[1][0];
    }
    return name.substring(0, 2);
  };

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm w-full sticky top-0 z-30">
      <div className="px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        {/* Right Side - Mobile Menu & Search */}
        <div className="flex items-center gap-3">
          {/* Mobile Menu Button */}
          <button
            onClick={toggleSidebar}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600"
            aria-label="فتح القائمة الجانبية"
          >
            <Menu size={22} />
          </button>

          {/* Search Bar */}
          <div className="hidden md:flex items-center">
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-50 border border-gray-200 text-sm focus-within:border-[#17536e] focus-within:ring-2 focus-within:ring-[#6B1D2C]/20 min-w-75">
              <Search size={18} className="text-gray-400" />
              <input
                type="text"
                placeholder="بحث في النظام..."
                className="w-full bg-transparent border-0 focus:outline-none text-gray-700 placeholder:text-gray-400"
              />
            </div>
          </div>
        </div>

        {/* Left Side - Actions & Profile */}
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <NotificationDropdown />

          {/* Divider */}
          <div className="h-8 w-px bg-gray-200 hidden sm:block" />

          {/* Profile Dropdown */}
          <div className="relative">
            <button
              onClick={toggleProfile}
              aria-expanded={isProfileOpen}
              aria-haspopup="true"
              aria-label="قائمة الملف الشخصي"
              className="flex items-center gap-3 p-1.5 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {/* User Avatar */}
              <div className="w-9 h-9 bg-linear-to-br from-[#17536e] to-[#287599] rounded-full flex items-center justify-center text-white text-sm font-bold shadow-md">
                {getUserInitials(userResponse?.data?.name)}
              </div>

              {/* User Info - Desktop Only */}
              <div className="hidden sm:block text-right">
                <p className="font-semibold text-gray-800 text-sm">
                  {userResponse?.data?.name || "المستخدم"}
                </p>
                <p className="text-xs text-gray-500">
                  {userResponse?.data?.role === "OfficeAdmin"
                    ? "مدير المكتب"
                    : userResponse?.data?.role === "NormalUser"
                    ? "موظف"
                    : userResponse?.data?.role || "مستخدم"}
                </p>
              </div>

              <ChevronDown
                size={16}
                className={`text-gray-400 hidden sm:block transition-transform duration-200 ${
                  isProfileOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Dropdown Menu */}
            {isProfileOpen && (
              <>
                {/* Backdrop */}
                <div className="fixed inset-0 z-40" onClick={closeProfile} />

                <div className="absolute left-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  {/* User Info Header */}
                  <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
                    <p className="font-semibold text-gray-800">
                      {userResponse?.data?.name}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {userResponse?.data?.email}
                    </p>
                  </div>

                  {/* Menu Items */}
                  <div className="py-1">
                    <Link
                      href="/dashboard/settings/userprofile"
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      onClick={closeProfile}
                    >
                      <User size={16} className="text-gray-400" />
                      <span>الملف الشخصي</span>
                    </Link>
                    <Link
                      href="/dashboard/settings/office"
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      onClick={closeProfile}
                    >
                      <Settings size={16} className="text-gray-400" />
                      <span>إعدادات المكتب</span>
                    </Link>
                  </div>

                  {/* Logout */}
                  <div className="border-t border-gray-100">
                    <button
                      onClick={logoutMethod}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut size={16} />
                      <span>تسجيل الخروج</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default memo(Header);
