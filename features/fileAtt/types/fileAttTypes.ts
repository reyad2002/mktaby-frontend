// ===========================
// Common API response types
// ===========================

export type ApiResponse<T> = {
  succeeded: boolean;
  message: string;
  data: T;
};

// ===========================
// Entity Type for file attachment
// ===========================

export type EntityType = "Case" | "Client" | "Session" | "Task" | "Court";

// ===========================
// Upload File Request (PUT /Files)
// multipart/form-data
// ===========================

export interface UploadFileRequest {
  file: File;
  entityType: EntityType;
  entityId: number;
  folderId?: number;
  displayName: string;
  description?: string;
}

export type UploadFileResponse = ApiResponse<boolean>;

// ===========================
// Download File (GET /Files/{id})
// ===========================

export type DownloadFileResponse = Blob;

// ===========================
// File Metadata (GET /Files/metadata/{id})
// ===========================

export interface FileMetadata {
  id: number;
  displayName: string;
  description: string;
  contentType: string;
  fileSize: number;
  createdAt: string; // ISO date string
}

export type GetFileMetadataResponse = ApiResponse<FileMetadata>;

// ===========================
// Update File Metadata (PUT /Files/Update)
// ===========================

export interface UpdateFileRequest {
  id: number;
  displayName: string;
  description?: string;
}

export type UpdateFileResponse = ApiResponse<boolean>;

// ===========================
// Delete File Responses
// ===========================

export type SoftDeleteFileResponse = ApiResponse<boolean>;

export type HardDeleteFileResponse = ApiResponse<boolean>;

// ===========================
// Restore File (POST /Files/restore/{id})
// ===========================

export type RestoreFileResponse = ApiResponse<boolean>;
