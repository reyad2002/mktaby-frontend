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
      <div className="flex h-screen bg-gray-50 overflow-hidden ">
        {/* Main Content */}
        <div className=" overflow-hidden flex w-full">
          {/* Sidebar */}
          <SideNav isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          {/* Page Content */}
          <main className=" bg-white overflow-y-auto flex flex-col overflow-x-hidden w-full">
            {/* Header */}
            <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
            <div className="p-4 sm:p-6 lg:p-8">
              <div className="max-w-7xl mx-auto">{children}</div>
            </div>
          </main>
        </div>
      </div>
    </AuthGuard>
  );
};

export default DashboardLayout;
