// Types for permissions listing

export interface PermissionSummary {
  id: number;
  name: string;
  createdAt: string;
}

export interface PermissionsQueryParams {
  pageNumber?: number;
  pageSize?: number;
  search?: string;
  sort?: string;
  isDeleted?: boolean;
}

export interface PermissionsPage {
  pageNumber: number;
  pageSize: number;
  count: number;
  data: PermissionSummary[];
}

export interface PermissionsResponse {
  succeeded: boolean;
  message: string;
  data: PermissionsPage;
}

// Add Permission types
export interface AddPermissionRequest {
  name: string;
  documentPermissions: number;
  clientPermissions: number;
  sessionPermission: number;
  financePermission: number;
  viewCasePermissions: number;
  dmlCasePermissions: number;
  viewTaskPermissions: number;
  dmlTaskPermissions: number;
}

export interface AddPermissionResponse {
  succeeded: boolean;
  message: string;
  data: number; // returns the new permission ID
}

// Get Permission by ID types
export interface PermissionDetail {
  id: number;
  name: string;
  createdAt: string;
  documentPermissions: number;
  clientPermissions: number;
  sessionPermission: number;
  financePermission: number;
  viewCasePermissions: number;
  dmlCasePermissions: number;
  viewTaskPermissions: number;
  dmlTaskPermissions: number;
}

// API returns PermissionDetail directly (not wrapped)
export type GetPermissionResponse = PermissionDetail;

// Update Permission types
export interface UpdatePermissionRequest {
  name: string;
  documentPermissions: number;
  clientPermissions: number;
  sessionPermission: number;
  financePermission: number;
  viewCasePermissions: number;
  dmlCasePermissions: number;
  viewTaskPermissions: number;
  dmlTaskPermissions: number;
}

export interface UpdatePermissionResponse {
  succeeded: boolean;
  message: string;
  data: boolean;
}

// Delete Permission types
export interface DeletePermissionResponse {
  succeeded: boolean;
  message: string;
  data: boolean;
}
