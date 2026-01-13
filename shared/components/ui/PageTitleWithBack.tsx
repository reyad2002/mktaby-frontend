"use client";

import React, { memo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface PageTitleWithBackProps {
  /** Page title */
  title: string;
  /** Optional subtitle */
  subtitle?: string;
  /** Optional icon */
  icon?: LucideIcon;
  /** Custom back handler */
  onBack?: () => void;
  /** Fallback URL when there's no history */
  fallbackUrl?: string;
  /** Additional CSS classes */
  className?: string;
  /** Children to render on the right side */
  children?: React.ReactNode;
}

const PageTitleWithBack: React.FC<PageTitleWithBackProps> = ({
  title,
  subtitle,
  icon: Icon,
  onBack,
  fallbackUrl = "/dashboard",
  className = "",
  children,
}) => {
  const router = useRouter();

  const handleBack = useCallback(() => {
    if (onBack) {
      onBack();
      return;
    }
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push(fallbackUrl);
    }
  }, [onBack, router, fallbackUrl]);

  return (
    <div
      className={`flex flex-wrap items-center justify-between gap-4 ${className}`}
    >
      <div className="flex items-center gap-3">
        {/* Back Button */}
        <button
          onClick={handleBack}
          className="flex items-center justify-center w-10 h-10 rounded-xl border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 hover:text-primary hover:border-primary/30 transition-all duration-200 active:scale-90 shrink-0 shadow-sm"
          title="رجوع"
        >
          <ArrowRight size={18} />
        </button>

        {/* Icon */}
        {Icon && (
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 text-primary shrink-0">
            <Icon size={20} />
          </div>
        )}

        {/* Title & Subtitle */}
        <div className="flex flex-col">
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">
            {title}
          </h1>
          {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
        </div>
      </div>

      {/* Right side actions */}
      {children && <div className="flex items-center gap-2">{children}</div>}
    </div>
  );
};

export default memo(PageTitleWithBack);
