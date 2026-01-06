import React from "react";

interface SkeletonProps {
  className?: string;
}

// Base Skeleton component
export const Skeleton: React.FC<SkeletonProps> = ({ className = "" }) => {
  return (
    <div
      className={`animate-pulse bg-gray-200 rounded ${className}`}
      aria-hidden="true"
    />
  );
};

// Text skeleton
export const SkeletonText: React.FC<{ lines?: number; className?: string }> = ({
  lines = 1,
  className = "",
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={`h-4 ${i === lines - 1 && lines > 1 ? "w-3/4" : "w-full"}`}
        />
      ))}
    </div>
  );
};

// Avatar skeleton
export const SkeletonAvatar: React.FC<{
  size?: "sm" | "md" | "lg";
  className?: string;
}> = ({ size = "md", className = "" }) => {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-16 h-16",
  };

  return (
    <Skeleton className={`${sizeClasses[size]} rounded-full ${className}`} />
  );
};

// Button skeleton
export const SkeletonButton: React.FC<{
  size?: "sm" | "md" | "lg";
  className?: string;
}> = ({ size = "md", className = "" }) => {
  const sizeClasses = {
    sm: "h-8 w-20",
    md: "h-10 w-28",
    lg: "h-12 w-36",
  };

  return (
    <Skeleton className={`${sizeClasses[size]} rounded-lg ${className}`} />
  );
};

// Card skeleton
export const SkeletonCard: React.FC<{ className?: string }> = ({
  className = "",
}) => {
  return (
    <div
      className={`bg-white rounded-xl border border-gray-200 p-6 ${className}`}
    >
      <div className="flex items-center gap-4 mb-4">
        <SkeletonAvatar />
        <div className="flex-1">
          <Skeleton className="h-4 w-1/2 mb-2" />
          <Skeleton className="h-3 w-1/3" />
        </div>
      </div>
      <SkeletonText lines={3} />
    </div>
  );
};

// Table row skeleton
export const SkeletonTableRow: React.FC<{
  columns?: number;
  className?: string;
}> = ({ columns = 5, className = "" }) => {
  return (
    <tr className={className}>
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <Skeleton className="h-4 w-full" />
        </td>
      ))}
    </tr>
  );
};

// Table skeleton
export const SkeletonTable: React.FC<{
  rows?: number;
  columns?: number;
  className?: string;
}> = ({ rows = 5, columns = 5, className = "" }) => {
  return (
    <div
      className={`bg-white rounded-xl border border-gray-200 overflow-hidden ${className}`}
    >
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            {Array.from({ length: columns }).map((_, i) => (
              <th key={i} className="px-4 py-3">
                <Skeleton className="h-4 w-3/4" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, i) => (
            <SkeletonTableRow key={i} columns={columns} />
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Page header skeleton
export const SkeletonPageHeader: React.FC<{ className?: string }> = ({
  className = "",
}) => {
  return (
    <div className={`flex items-center justify-between mb-6 ${className}`}>
      <div className="flex items-center gap-4">
        <Skeleton className="w-12 h-12 rounded-xl" />
        <div>
          <Skeleton className="h-6 w-40 mb-2" />
          <Skeleton className="h-4 w-60" />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <SkeletonButton size="sm" />
        <SkeletonButton size="md" />
      </div>
    </div>
  );
};

// Stats card skeleton
export const SkeletonStatsCard: React.FC<{ className?: string }> = ({
  className = "",
}) => {
  return (
    <div
      className={`bg-white rounded-xl border border-gray-200 p-4 ${className}`}
    >
      <div className="flex items-center justify-between mb-3">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="w-8 h-8 rounded-lg" />
      </div>
      <Skeleton className="h-8 w-16 mb-1" />
      <Skeleton className="h-3 w-20" />
    </div>
  );
};

// List item skeleton
export const SkeletonListItem: React.FC<{ className?: string }> = ({
  className = "",
}) => {
  return (
    <div className={`flex items-center gap-4 p-4 ${className}`}>
      <SkeletonAvatar />
      <div className="flex-1">
        <Skeleton className="h-4 w-1/2 mb-2" />
        <Skeleton className="h-3 w-3/4" />
      </div>
      <Skeleton className="h-6 w-16 rounded-full" />
    </div>
  );
};

// Full page loading skeleton
export const SkeletonPage: React.FC = () => {
  return (
    <div className="space-y-6 p-6">
      <SkeletonPageHeader />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <SkeletonStatsCard />
        <SkeletonStatsCard />
        <SkeletonStatsCard />
        <SkeletonStatsCard />
      </div>
      <SkeletonTable rows={8} columns={6} />
    </div>
  );
};

// Form skeleton
export const SkeletonForm: React.FC<{
  fields?: number;
  className?: string;
}> = ({ fields = 4, className = "" }) => {
  return (
    <div className={`space-y-4 ${className}`}>
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i}>
          <Skeleton className="h-4 w-24 mb-2" />
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
      ))}
      <div className="flex justify-end gap-2 pt-4">
        <SkeletonButton size="md" />
        <SkeletonButton size="md" />
      </div>
    </div>
  );
};

// Detail page skeleton
export const SkeletonDetailPage: React.FC<{ className?: string }> = ({
  className = "",
}) => {
  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center gap-4">
        <Skeleton className="w-16 h-16 rounded-xl" />
        <div>
          <Skeleton className="h-6 w-48 mb-2" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-xl border border-gray-200 p-4"
          >
            <Skeleton className="h-4 w-20 mb-2" />
            <Skeleton className="h-5 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
};

// Notification skeleton
export const SkeletonNotification: React.FC<{ className?: string }> = ({
  className = "",
}) => {
  return (
    <div className={`flex gap-3 p-3 ${className}`}>
      <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />
      <div className="flex-1">
        <Skeleton className="h-4 w-3/4 mb-2" />
        <Skeleton className="h-3 w-full mb-1" />
        <Skeleton className="h-3 w-24" />
      </div>
    </div>
  );
};

export default Skeleton;
