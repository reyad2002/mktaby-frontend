"use client";

import React, { memo } from "react";
import { LucideIcon, AlertCircle, RefreshCw } from "lucide-react";

interface ErrorStateProps {
  icon?: LucideIcon;
  title?: string;
  description?: string;
  onRetry?: () => void;
  retryText?: string;
  className?: string;
}

const ErrorState: React.FC<ErrorStateProps> = ({
  icon: Icon = AlertCircle,
  title = "حدث خطأ",
  description = "حدث خطأ أثناء تحميل البيانات. يرجى المحاولة مرة أخرى.",
  onRetry,
  retryText = "إعادة المحاولة",
  className = "",
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center py-12 px-4 ${className}`}
      role="alert"
    >
      <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-red-500" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2 text-center">
        {title}
      </h3>
      <p className="text-sm text-gray-500 text-center max-w-sm mb-4">
        {description}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          {retryText}
        </button>
      )}
    </div>
  );
};

export default memo(ErrorState);
