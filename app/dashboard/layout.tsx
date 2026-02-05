import type { Metadata } from "next";
import DashboardLayout from "@/shared/components/layout/DashboardLayout";
import React from "react";

export const metadata: Metadata = {
  title: "لوحة التحكم",
  description: "لوحة تحكم نظام محاماة لإدارة المكاتب القانونية",
};

const layout = ({ children }: { children: React.ReactNode }) => {
  return <DashboardLayout>{children}</DashboardLayout>;
};

export default layout;
