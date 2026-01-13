"use client";

import React, { memo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";

export interface BackButtonProps {
  /** Custom label for the button */
  label?: string;
  /** Custom fallback URL if there's no history */
  fallbackUrl?: string;
  /** Additional CSS classes */
  className?: string;
  /** Button variant */
  variant?: "default" | "outline" | "ghost" | "link";
  /** Button size */
  size?: "sm" | "md" | "lg";
  /** Show icon */
  showIcon?: boolean;
  /** Custom onClick handler (overrides default back behavior) */
  onClick?: () => void;
}

const BackButton: React.FC<BackButtonProps> = ({
  label = "رجوع",
  fallbackUrl = "/dashboard",
  className = "",
  variant = "ghost",
  size = "md",
  showIcon = true,
  onClick,
}) => {
  const router = useRouter();

  const handleBack = useCallback(() => {
    if (onClick) {
      onClick();
      return;
    }

    // Check if there's browser history
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      // Fallback to the provided URL
      router.push(fallbackUrl);
    }
  }, [onClick, router, fallbackUrl]);

  // Variant styles
  const variantStyles = {
    default:
      "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 shadow-sm",
    outline:
      "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-blue-500",
    ghost:
      "text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:ring-gray-500",
    link: "text-blue-600 hover:text-blue-800 hover:underline p-0",
  };

  // Size styles
  const sizeStyles = {
    sm: "px-2.5 py-1.5 text-xs gap-1",
    md: "px-3 py-2 text-sm gap-1.5",
    lg: "px-4 py-2.5 text-base gap-2",
  };

  // Icon size based on button size
  const iconSizes = {
    sm: "w-3.5 h-3.5",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  return (
    <button
      type="button"
      onClick={handleBack}
      className={`
        inline-flex items-center justify-center font-medium rounded-lg
        transition-all duration-200 ease-in-out
        focus:outline-none focus:ring-2 focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variantStyles[variant]}
        ${variant !== "link" ? sizeStyles[size] : "text-sm"}
        ${className}
      `}
      aria-label={label}
    >
      {showIcon && <ArrowRight className={iconSizes[size]} />}
      <span>{label}</span>
    </button>
  );
};

export default memo(BackButton);
