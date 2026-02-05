import apiClient from "@/lib/apiClient";
import {
  PERMISSIONS_LIST_PATH,
  ADD_PERMISSION_PATH,
  GET_PERMISSION_PATH,
  UPDATE_PERMISSION_PATH,
  DELETE_PERMISSION_PATH,
} from "../PATHES";
import {
  PermissionsQueryParams,
  PermissionsResponse,
  AddPermissionRequest,
  AddPermissionResponse,
  GetPermissionResponse,
  UpdatePermissionRequest,
  UpdatePermissionResponse,
  DeletePermissionResponse,
} from "../types/permissionTypes";

// Fetch paginated permissions list
export async function fetchPermissions(
  params: PermissionsQueryParams = {},
): Promise<PermissionsResponse> {
  const response = await apiClient.get<PermissionsResponse>(
    PERMISSIONS_LIST_PATH,
    { params },
  );
  return response.data;
}

// Add new permission
export async function addPermission(
  permissionData: AddPermissionRequest,
): Promise<AddPermissionResponse> {
  const response = await apiClient.post<AddPermissionResponse>(
    ADD_PERMISSION_PATH,
    permissionData,
  );
  return response.data;
}

// Get permission by ID
export async function getPermissionById(
  id: number,
): Promise<GetPermissionResponse> {
  const response = await apiClient.get<GetPermissionResponse>(
    `${GET_PERMISSION_PATH}/${id}`,
  );

  return response.data;
}

// Update permission by ID
export async function updatePermission(
  id: number,
  permissionData: UpdatePermissionRequest,
): Promise<UpdatePermissionResponse> {
  const response = await apiClient.put<UpdatePermissionResponse>(
    `${UPDATE_PERMISSION_PATH}/${id}`,
    permissionData,
  );
  return response.data;
}

// Delete permission by ID
export async function deletePermission(
  id: number,
): Promise<DeletePermissionResponse> {
  const response = await apiClient.delete<DeletePermissionResponse>(
    `${DELETE_PERMISSION_PATH}/${id}`,
  );
  return response.data;
}
