"use client";

import React, { useState, useEffect } from "react";
import Header from "./Header";
import SideNav from "./SideNav";
import AuthGuard from "../auth/AuthGuard";

interface DashboardLayoutProps {
  children?: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <AuthGuard>
      <div className="flex h-screen bg-gray-100 overflow-hidden" dir="rtl">
        {/* Sidebar - Right Side (RTL) */}
        <SideNav isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto overflow-x-hidden ">
            <div className="p-4 sm:p-6 lg:p-8 ">
              <div className=" ">{children}</div>
            </div>
          </main>
        </div>
      </div>
    </AuthGuard>
  );
};

export default DashboardLayout;
