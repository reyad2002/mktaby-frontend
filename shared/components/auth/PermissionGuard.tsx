"use client";

import { usePathname } from "next/navigation";
import { usePermissions } from "@/features/permissions/hooks/usePermissions";
import { useMemo } from "react";
import UnauthorizedContent from "./UnauthorizedContent";

/**
 * Route patterns and their required permission check.
 * Order matters: more specific paths should come first.
 */
const ROUTE_PERMISSION_MAP: Array<{
  pattern: RegExp | string;
  check: (
    can: ReturnType<typeof usePermissions>["can"],
    isOfficeAdmin: boolean
  ) => boolean;
}> = [
  // Settings - OfficeAdmin only
  {
    pattern: /^\/dashboard\/settings\/(office|users|permissions)/,
    check: (_, isOfficeAdmin) => isOfficeAdmin,
  },
  // User profile - always allowed for authenticated users
  { pattern: /^\/dashboard\/settings\/userprofile/, check: () => true },
  // Cases
  {
    pattern: /^\/dashboard\/cases-finance/,
    check: (can) => can.canViewFinance(),
  },
  { pattern: /^\/dashboard\/cases(\/|$)/, check: (can) => can.canViewCases() },
  // Clients
  {
    pattern: /^\/dashboard\/clients-finance/,
    check: (can) => can.canViewFinance(),
  },
  {
    pattern: /^\/dashboard\/clients(\/|$)/,
    check: (can) => can.canViewClients(),
  },
  // Sessions & Calendar
  { pattern: /^\/dashboard\/calendar/, check: (can) => can.canViewSessions() },
  {
    pattern: /^\/dashboard\/sessions(\/|$)/,
    check: (can) => can.canViewSessions(),
  },
  // Tasks
  { pattern: /^\/dashboard\/tasks(\/|$)/, check: (can) => can.canViewTasks() },
  // Documents (courts, files)
  { pattern: /^\/dashboard\/courts/, check: (can) => can.canViewDocuments() },
  {
    pattern: /^\/dashboard\/files(\/|$)/,
    check: (can) => can.canViewDocuments(),
  },
  // Accounting
  { pattern: /^\/dashboard\/accounting/, check: (can) => can.canViewFinance() },
  // Dashboard home - always allowed
  { pattern: /^\/dashboard\/?$/, check: () => true },
  // Notifications - if we add permission later
  { pattern: /^\/dashboard\/notifications/, check: () => true },
];

interface PermissionGuardProps {
  children: React.ReactNode;
}

export default function PermissionGuard({ children }: PermissionGuardProps) {
  const pathname = usePathname();
  const { can, isOfficeAdmin } = usePermissions();

  const hasPermission = useMemo(() => {
    for (const { pattern, check } of ROUTE_PERMISSION_MAP) {
      const matches =
        typeof pattern === "string"
          ? pathname === pattern || pathname.startsWith(pattern + "/")
          : pattern.test(pathname);
      if (matches) {
        return check(can, isOfficeAdmin);
      }
    }
    // Unknown route - allow by default (e.g. /dashboard)
    return true;
  }, [pathname, can, isOfficeAdmin]);

  if (!hasPermission) {
    return <UnauthorizedContent />;
  }

  return <>{children}</>;
}
