"use client";

import React from "react";
import type { LucideIcon } from "lucide-react";
import { Loader2, RefreshCcw, Plus, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

interface PageHeaderAction {
  label: string;
  onClick: () => void;
  icon?: LucideIcon;
  variant?: "primary" | "secondary" | "ghost";
  disabled?: boolean;
}

interface PageHeaderProps {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  isFetching?: boolean;
  countLabel?: string;
  onRefresh?: () => void;
  onAdd?: () => void;
  addButtonLabel?: string;
  customActions?: PageHeaderAction[];
  children?: React.ReactNode;
  /** Show back button */
  showBackButton?: boolean;
  /** Custom back button handler */
  onBack?: () => void;
  /** Fallback URL when there's no history */
  backFallbackUrl?: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  icon: Icon,
  isFetching = false,
  countLabel,
  onRefresh,
  onAdd,
  addButtonLabel = "إضافة جديد",
  customActions = [],
  children,
  showBackButton = false,
  onBack,
  backFallbackUrl = "/dashboard",
}) => {
  const router = useRouter();

  const handleBack = () => {
    if (onBack) {
      onBack();
      return;
    }
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push(backFallbackUrl);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-2xl bg-white border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 transition-all duration-300">
      {/* Background Decor - لمسة جمالية خلفية */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />

      <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        {/* Title & Info Section */}
        <div className="flex items-start md:items-center gap-5">
          {/* Back Button */}
          {showBackButton && (
            <button
              onClick={handleBack}
              className="flex items-center justify-center w-11 h-11 rounded-xl border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 hover:text-primary hover:border-primary/30 transition-all duration-200 active:scale-90 shrink-0"
              title="رجوع"
            >
              <ArrowRight size={20} />
            </button>
          )}

          <div className="relative shrink-0">
            <div className="relative z-10 w-14 h-14 flex items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary-dark shadow-lg shadow-primary/20 transition-transform duration-300 hover:scale-105">
              <Icon className="text-white" size={28} strokeWidth={2.2} />
            </div>
            {/* Loading Ring */}
            {isFetching && (
              <div className="absolute inset-0 z-0 animate-ping rounded-2xl bg-primary/20 scale-125" />
            )}
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
                {title}
              </h1>
              {countLabel && (
                <span className="hidden md:inline-flex px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-600 text-xs font-bold border border-gray-200">
                  {countLabel}
                </span>
              )}
            </div>
            <p className="text-gray-500 font-medium leading-relaxed max-w-xl">
              {subtitle}
            </p>
          </div>
        </div>

        {/* Actions Section */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Status Chips */}
          <div className="flex items-center gap-2">
            {isFetching && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-100/50">
                <Loader2 size={14} className="animate-spin text-blue-500" />
                <span className="text-xs font-bold uppercase tracking-wide">
                  جاري التحديث
                </span>
              </div>
            )}
            {children}
          </div>

          {/* Separator Line */}
          {(onRefresh || onAdd || customActions.length > 0) && (
            <div className="hidden sm:block h-10 w-px bg-gray-100 mx-2" />
          )}

          {/* Main Actions Group */}
          <div className="flex items-center flex-wrap gap-3">
            {onRefresh && (
              <button
                type="button"
                onClick={onRefresh}
                disabled={isFetching}
                className="group flex items-center justify-center w-11 h-11 rounded-xl border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 hover:text-primary hover:border-primary/30 transition-all duration-200 active:scale-90 disabled:opacity-40"
              >
                <RefreshCcw
                  size={20}
                  className={`${
                    isFetching
                      ? "animate-spin"
                      : "group-hover:rotate-180 transition-transform duration-500"
                  }`}
                />
              </button>
            )}

            {customActions.map((action, index) => {
              const ActionIcon = action.icon;
              const variants = {
                primary:
                  "bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-200",
                ghost:
                  "border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                secondary: "bg-gray-100 text-gray-700 hover:bg-gray-200",
              };

              return (
                <button
                  key={index}
                  onClick={action.onClick}
                  disabled={action.disabled}
                  className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 active:scale-95 disabled:opacity-50 ${
                    variants[action.variant || "secondary"]
                  }`}
                >
                  {ActionIcon && <ActionIcon size={18} />}
                  {action.label}
                </button>
              );
            })}

            {onAdd && (
              <button
                type="button"
                onClick={onAdd}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-white font-bold text-sm shadow-md shadow-primary/25 hover:shadow-lg hover:shadow-primary/40 hover:-translate-y-0.5 transition-all duration-200 active:scale-95"
              >
                <Plus size={20} strokeWidth={3} />
                <span>{addButtonLabel}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PageHeader;
