"use client";

import { useSelector } from "react-redux";
import { selectUserPermissions } from "../permissionsSlice";
import { selectUserProfile } from "@/features/userprofile/userProfileSlice";
import { getPermission, getDmlPermission } from "../constants/permissionFlags";

/**
 * Hook to check user permissions. OfficeAdmin bypasses all checks.
 * يستخدم جدول الـ 16 احتمال — if بسيط بدل bitwise
 */
export function usePermissions() {
  const permissions = useSelector(selectUserPermissions);
  const userProfile = useSelector(selectUserProfile);
  const isOfficeAdmin = userProfile.role === "OfficeAdmin";

  // صلاحيات bitwise (0-15): document, client, session, finance
  const docPerm = getPermission(permissions.documentPermissions);
  const clientPerm = getPermission(permissions.clientPermissions);
  const sessionPerm = getPermission(permissions.sessionPermission);
  const financePerm = getPermission(permissions.financePermission);

  // صلاحيات DML للقضايا والمهام
  const caseDml = getDmlPermission(permissions.dmlCasePermissions);
  const taskDml = getDmlPermission(permissions.dmlTaskPermissions);

  const can = {
    // Cases
    canViewCases: () => isOfficeAdmin || permissions.viewCasePermissions > 0,
    canCreateCase: () => isOfficeAdmin || caseDml.create,
    canUpdateCase: () => isOfficeAdmin || caseDml.update,
    canDeleteCase: () => isOfficeAdmin || caseDml.delete,

    // Clients
    canViewClients: () => isOfficeAdmin || clientPerm.view,
    canCreateClient: () => isOfficeAdmin || clientPerm.create,
    canUpdateClient: () => isOfficeAdmin || clientPerm.update,
    canDeleteClient: () => isOfficeAdmin || clientPerm.delete,

    // Sessions
    canViewSessions: () => isOfficeAdmin || sessionPerm.view,
    canCreateSession: () => isOfficeAdmin || sessionPerm.create,
    canUpdateSession: () => isOfficeAdmin || sessionPerm.update,
    canDeleteSession: () => isOfficeAdmin || sessionPerm.delete,

    // Tasks
    canViewTasks: () => isOfficeAdmin || permissions.viewTaskPermissions > 0,
    canCreateTask: () => isOfficeAdmin || taskDml.create,
    canUpdateTask: () => isOfficeAdmin || taskDml.update,
    canDeleteTask: () => isOfficeAdmin || taskDml.delete,

    // Documents
    canViewDocuments: () => isOfficeAdmin || docPerm.view,
    canCreateDocument: () => isOfficeAdmin || docPerm.create,
    canUpdateDocument: () => isOfficeAdmin || docPerm.update,
    canDeleteDocument: () => isOfficeAdmin || docPerm.delete,

    // Finance
    canViewFinance: () => isOfficeAdmin || financePerm.view,
    canCreateFinance: () => isOfficeAdmin || financePerm.create,
    canUpdateFinance: () => isOfficeAdmin || financePerm.update,
    canDeleteFinance: () => isOfficeAdmin || financePerm.delete,
  };

  console.log(can.canViewCases(), "canViewCases");
  console.log(can.canCreateCase(), "canCreateCase");
  console.log(can.canUpdateCase(), "canUpdateCase");
  console.log(can.canDeleteCase(), "canDeleteCase");
  console.log(can.canViewClients(), "canViewClients");
  console.log(can.canCreateClient(), "canCreateClient");
  console.log(can.canUpdateClient(), "canUpdateClient");
  console.log(can.canDeleteClient(), "canDeleteClient");
  console.log(can.canViewSessions(), "canViewSessions");
  console.log(can.canCreateSession(), "canCreateSession");
  console.log(can.canUpdateSession(), "canUpdateSession");
  console.log(can.canDeleteSession(), "canDeleteSession");
  console.log(can.canViewTasks(), "canViewTasks");
  console.log(can.canCreateTask(), "canCreateTask");
  console.log(can.canUpdateTask(), "canUpdateTask");
  console.log(can.canDeleteTask(), "canDeleteTask");
  console.log(can.canViewDocuments(), "canViewDocuments");
  console.log(can.canCreateDocument(), "canCreateDocument");
  console.log(can.canUpdateDocument(), "canUpdateDocument");
  console.log(can.canDeleteDocument(), "canDeleteDocument");
  console.log(can.canViewFinance(), "canViewFinance");
  console.log(can.canCreateFinance(), "canCreateFinance");
  console.log(can.canUpdateFinance(), "canUpdateFinance");
  console.log(can.canDeleteFinance(), "canDeleteFinance");
  return { can, isOfficeAdmin };
}
