import apiClient from "@/lib/apiClient";
import {
  FOLDER_RESOURCES_PATH,
  GET_FOLDER_PATH,
  UPDATE_FOLDER_PATH,
  CREATE_FOLDER_PATH,
  SOFT_DELETE_FOLDER_PATH,
  HARD_DELETE_FOLDER_PATH,
  RESTORE_FOLDER_PATH,
} from "../PATHES";
import type {
  GetFolderResourcesResponse,
  GetFolderResponse,
  CreateFolderRequest,
  CreateFolderResponse,
  UpdateFolderRequest,
  UpdateFolderResponse,
  SoftDeleteFolderResponse,
  HardDeleteFolderResponse,
  RestoreFolderResponse,
} from "../types/folderTypes";

// ===========================
// GET /Folder/resources/{id} - Get folder resources
// ===========================
export async function getFolderResources(
  id: number
): Promise<GetFolderResourcesResponse> {
  const response = await apiClient.get<GetFolderResourcesResponse>(
    FOLDER_RESOURCES_PATH(id)
  );
  return response.data;
}

// ===========================
// GET /Folder/{id} - Get folder by ID
// ===========================
export async function getFolderById(id: number): Promise<GetFolderResponse> {
  const response = await apiClient.get<GetFolderResponse>(GET_FOLDER_PATH(id));
  return response.data;
}

// ===========================
// POST /Folder - Create new folder
// ===========================
export async function createFolder(
  data: CreateFolderRequest
): Promise<CreateFolderResponse> {
  const response = await apiClient.post<CreateFolderResponse>(
    CREATE_FOLDER_PATH,
    data
  );
  return response.data;
}

// ===========================
// PUT /Folder/{id} - Update folder
// ===========================
export async function updateFolder(
  id: number,
  data: UpdateFolderRequest
): Promise<UpdateFolderResponse> {
  const response = await apiClient.put<UpdateFolderResponse>(
    UPDATE_FOLDER_PATH(id),
    data
  );
  return response.data;
}

// ===========================
// DELETE /Folder/soft/{id} - Soft delete folder
// ===========================
export async function softDeleteFolder(
  id: number
): Promise<SoftDeleteFolderResponse> {
  const response = await apiClient.delete<SoftDeleteFolderResponse>(
    SOFT_DELETE_FOLDER_PATH(id)
  );
  return response.data;
}

// ===========================
// DELETE /Folder/Hard/{id} - Hard delete folder
// ===========================
export async function hardDeleteFolder(
  id: number
): Promise<HardDeleteFolderResponse> {
  const response = await apiClient.delete<HardDeleteFolderResponse>(
    HARD_DELETE_FOLDER_PATH(id)
  );
  return response.data;
}

// ===========================
// POST /Folder/restore/{id} - Restore deleted folder
// ===========================
export async function restoreFolder(
  id: number
): Promise<RestoreFolderResponse> {
  const response = await apiClient.post<RestoreFolderResponse>(
    RESTORE_FOLDER_PATH(id)
  );
  return response.data;
}
