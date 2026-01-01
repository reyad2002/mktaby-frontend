import React from "react";
import type { LucideIcon } from "lucide-react";
import { Loader2, RefreshCcw, Plus } from "lucide-react";

interface PageHeaderAction {
  label: string;
  onClick: () => void;
  icon?: LucideIcon;
  variant?: "primary" | "secondary" | "ghost";
  disabled?: boolean;
}

interface PageHeaderProps {
  // Required props
  title: string;
  subtitle: string;
  icon: LucideIcon;

  // Optional stats/badges
  isFetching?: boolean;
  countLabel?: string;

  // Optional actions
  onRefresh?: () => void;
  onAdd?: () => void;
  addButtonLabel?: string;
  customActions?: PageHeaderAction[];

  // Optional custom children for complex scenarios
  children?: React.ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  icon: Icon,
  isFetching = false,
  countLabel,
  onRefresh,
  onAdd,
  addButtonLabel = "إضافة",
  customActions = [],
  children,
}) => {
  return (
    <div className="rounded-xl bg-white border border-gray-200 shadow-sm p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        {/* Title Section */}
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold text-gray-900 flex items-center gap-3">
            <Icon className="text-blue-600" size={32} />
            {title}
          </h1>
          <p className="text-sm text-gray-600">{subtitle}</p>
        </div>

        {/* Actions Section */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Fetching Indicator */}
          {isFetching && (
            <span className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-50 text-blue-700 text-sm border border-blue-200">
              <span
                className="h-2 w-2 rounded-full bg-blue-600 animate-pulse"
                aria-hidden="true"
              />
              يتم التحديث...
            </span>
          )}

          {/* Count Badge */}
          {countLabel && (
            <span className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 text-gray-700 text-sm border border-gray-200">
              <span
                className="h-2 w-2 rounded-full bg-green-500"
                aria-hidden="true"
              />
              {countLabel}
            </span>
          )}

          {/* Custom Children (for additional badges or elements) */}
          {children}

          {/* Refresh Button */}
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              disabled={isFetching}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="تحديث"
            >
              {isFetching ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <RefreshCcw size={16} />
              )}
              تحديث
            </button>
          )}

          {/* Custom Actions */}
          {customActions.map((action, index) => {
            const ActionIcon = action.icon;
            const buttonClass =
              action.variant === "primary"
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : action.variant === "ghost"
                ? "border border-gray-200 text-gray-700 hover:bg-gray-50"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200";

            return (
              <button
                key={index}
                type="button"
                onClick={action.onClick}
                disabled={action.disabled}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${buttonClass}`}
              >
                {ActionIcon && <ActionIcon size={18} />}
                {action.label}
              </button>
            );
          })}

          {/* Add Button */}
          {onAdd && (
            <button
              type="button"
              onClick={onAdd}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
            >
              <Plus size={18} />
              {addButtonLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PageHeader;
