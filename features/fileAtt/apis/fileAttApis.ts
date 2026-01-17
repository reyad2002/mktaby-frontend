import apiClient from "@/lib/apiClient";
import {
  UPLOAD_FILE_PATH,
  DOWNLOAD_FILE_PATH,
  FILE_METADATA_PATH,
  UPDATE_FILE_PATH,
  SOFT_DELETE_FILE_PATH,
  HARD_DELETE_FILE_PATH,
  RESTORE_FILE_PATH,
} from "../PATHES";
import type {
  UploadFileRequest,
  UploadFileResponse,
  DownloadFileResponse,
  GetFileMetadataResponse,
  UpdateFileRequest,
  UpdateFileResponse,
  SoftDeleteFileResponse,
  HardDeleteFileResponse,
  RestoreFileResponse,
} from "../types/fileAttTypes";

// ===========================
// Post /Files - Upload file
// ===========================
export async function uploadFile(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data : any
): Promise<UploadFileResponse> {
  const formData = new FormData();
  formData.append("File", data.file);
  formData.append("EntityType", data.entityType);

  // Ensure entityId is not null before appending
  if (data.entityId === null) {
    throw new Error("EntityId is required and cannot be null");
  }
  formData.append("EntityId", data.entityId);

  if (data.folderId) {
    formData.append("FolderId", data.folderId );
  }
  formData.append("DisplayName", data.displayName);
  if (data.description) {
    formData.append("Description", data.description);
  }

  const response = await apiClient.post<UploadFileResponse>(
    UPLOAD_FILE_PATH,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return response.data;
}

// ===========================
// GET /Files/{id} - Download file
// ===========================
export async function downloadFile(id: number): Promise<DownloadFileResponse> {
  const response = await apiClient.get<Blob>(DOWNLOAD_FILE_PATH(id), {
    responseType: "blob",
  });
  return response.data;
}

// ===========================
// GET /Files/metadata/{id} - Get file metadata
// ===========================
export async function getFileMetadata(
  id: number
): Promise<GetFileMetadataResponse> {
  const response = await apiClient.get<GetFileMetadataResponse>(
    FILE_METADATA_PATH(id)
  );
  return response.data;
}

// ===========================
// PUT /Files/Update - Update file metadata
// ===========================
export async function updateFile(
  data: UpdateFileRequest
): Promise<UpdateFileResponse> {
  const response = await apiClient.put<UpdateFileResponse>(
    UPDATE_FILE_PATH,
    data
  );
  return response.data;
}

// ===========================
// DELETE /Files/soft/{id} - Soft delete file
// ===========================
export async function softDeleteFile(
  id: number
): Promise<SoftDeleteFileResponse> {
  const response = await apiClient.delete<SoftDeleteFileResponse>(
    SOFT_DELETE_FILE_PATH(id)
  );
  return response.data;
}

// ===========================
// DELETE /Files/hard/{id} - Hard delete file
// ===========================
export async function hardDeleteFile(
  id: number
): Promise<HardDeleteFileResponse> {
  const response = await apiClient.delete<HardDeleteFileResponse>(
    HARD_DELETE_FILE_PATH(id)
  );
  return response.data;
}

// ===========================
// POST /Files/restore/{id} - Restore deleted file
// ===========================
export async function restoreFile(id: number): Promise<RestoreFileResponse> {
  const response = await apiClient.post<RestoreFileResponse>(
    RESTORE_FILE_PATH(id)
  );
  return response.data;
}
