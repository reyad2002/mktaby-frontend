// API paths for file attachments module

// Upload file (multipart/form-data)
export const UPLOAD_FILE_PATH = "/Files";

// Download file by ID
export const DOWNLOAD_FILE_PATH = (id: number) => `/Files/${id}`;

// Get file metadata by ID
export const FILE_METADATA_PATH = (id: number) => `/Files/metadata/${id}`;

// Update file metadata
export const UPDATE_FILE_PATH = "/Files/Update";

// Soft delete file (recoverable)
export const SOFT_DELETE_FILE_PATH = (id: number) => `/Files/soft/${id}`;

// Hard delete file (permanent)
export const HARD_DELETE_FILE_PATH = (id: number) => `/Files/hard/${id}`;

// Restore deleted file
export const RESTORE_FILE_PATH = (id: number) => `/Files/restore/${id}`;
