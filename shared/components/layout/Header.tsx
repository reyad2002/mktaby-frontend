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
  //  console.log("Header User Response:", userResponse);
  return (
    <header className="bg-linear-to-r from-slate-950 via-slate-900 to-slate-800 border-b border-yellow-400/40 shadow-xl shadow-yellow-900/20 w-full sticky top-0 z-30">
      <div className="px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-4">
        {/* Logo and Brand */}
        <div className="flex items-center gap-3 sm:gap-4 text-yellow-100">
          <button
            onClick={toggleSidebar}
            className="lg:hidden p-2 rounded-lg hover:bg-white/10 transition-colors border border-white/10"
            aria-label="فتح القائمة الجانبية"
          >
            <svg
              className="w-5 h-5 sm:w-6 sm:h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>

          <Link
            href="/"
            className="hidden sm:flex items-center gap-3 px-3 py-2 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm hover:border-yellow-300/60 transition-all"
          >
            <span className="bg-yellow-400/90 text-slate-900 px-3 py-1 rounded-lg text-sm font-semibold shadow-sm">
              Elite
            </span>
            <span className="text-lg font-semibold">مكتبي</span>
          </Link>
        </div>

        {/* Search Bar */}
        <div className="hidden md:flex flex-1 mx-2 lg:mx-8 max-w-xl">
          <div className="w-full flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-gray-200 focus-within:border-yellow-300/60 focus-within:ring-2 focus-within:ring-yellow-300/30">
            <svg
              className="w-4 h-4 text-gray-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="بحث..."
              className="w-full bg-transparent border-0 focus:outline-none text-gray-100 placeholder:text-gray-400"
            />
          </div>
        </div>

        {/* Left Actions (Right in RTL) */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Notifications */}
          <NotificationDropdown />

          {/* Profile Dropdown */}
          <div className="relative">
            <button
              onClick={toggleProfile}
              aria-expanded={isProfileOpen}
              aria-haspopup="true"
              aria-label="قائمة الملف الشخصي"
              className="flex items-center gap-2 sm:gap-3 p-1.5 sm:p-2 rounded-lg border border-white/10 hover:border-yellow-300/60 hover:bg-white/5 transition-colors"
            >
              <div className="hidden sm:block text-sm text-right text-gray-100">
                <p className="font-semibold">{userResponse?.data?.name} </p>
                <p className="text-xs text-gray-300">
                  {userResponse?.data?.role || "دور غير معروف"}
                </p>
              </div>
              <div className="w-8 h-8 sm:w-9 sm:h-9 bg-linear-to-br from-yellow-300 to-yellow-500 rounded-full flex items-center justify-center text-slate-900 text-sm font-bold shadow-lg shadow-yellow-900/30">
                أم
              </div>
            </button>

            {/* Dropdown Menu */}
            {isProfileOpen && (
              <div className="absolute left-0 mt-2 w-52 bg-slate-900/95 backdrop-blur-xl rounded-xl shadow-2xl border border-white/10 z-50 overflow-hidden">
                <Link
                  href="/dashboard/settings/userprofile"
                  className="block px-4 py-3 text-sm text-gray-100 hover:bg-white/10 text-right"
                  onClick={closeProfile}
                >
                  إعدادات الملف الشخصي
                </Link>
                <button className="w-full text-right px-4 py-3 text-sm text-gray-100 hover:bg-white/10">
                  تغيير كلمة المرور
                </button>
                <button
                  onClick={logoutMethod}
                  className="w-full text-right px-4 py-3 text-sm text-red-300 hover:bg-red-400/10 border-t border-white/10"
                >
                  تسجيل الخروج
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default memo(Header);
