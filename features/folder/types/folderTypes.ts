// ===========================
// Common API response types
// ===========================

export type ApiResponse<T> = {
  succeeded: boolean;
  message: string;
  data: T;
};

export type PaginatedResponse<TItem> = {
  pageNumber: number;
  pageSize: number;
  count: number;
  data: TItem[];
};

// ===========================
// Entity Type for folder
// ===========================

export type EntityType = "Case" | "Client" | "Session" | "Task" | "Court" | "Office";

// ===========================
// Folder Resource Item
// ===========================

export interface FolderResource {
  id: number;
  name: string;
  type: string;
  contentType: string;
  size: number;
  userId: number;
  userFullName: string;
  userImageUrl: string;
  createdAt: string; // ISO date string
}

// ===========================
// Get Folder Resources (GET /Folder/resources/{id})
// ===========================

export type GetFolderResourcesResponse = ApiResponse<
  PaginatedResponse<FolderResource>
>;

// ===========================
// Get Folder (GET /Folder/{id})
// ===========================

export interface Folder {
  id: number;
  name: string;
  createdAt: string; // ISO date string
}

export type GetFolderResponse = ApiResponse<Folder>;

// ===========================
// Create Folder (POST /Folder)
// ===========================

export interface CreateFolderRequest {
  name: string;
  entityType: EntityType;
  entityId: number | null;
  parentFolderId?: number | null;
}

export type CreateFolderResponse = ApiResponse<number>;

// ===========================
// Update Folder (PUT /Folder/{id})
// ===========================

export interface UpdateFolderRequest {
  name: string;
  entityType: EntityType;
  entityId: number;
  parentFolderId?: number;
}

export type UpdateFolderResponse = ApiResponse<boolean>;

// ===========================
// Delete Folder Responses
// ===========================

export type SoftDeleteFolderResponse = ApiResponse<boolean>;

export type HardDeleteFolderResponse = ApiResponse<boolean>;

// ===========================
// Restore Folder (POST /Folder/restore/{id})
// ===========================

export type RestoreFolderResponse = ApiResponse<boolean>;
