// API paths for folder module

// Get folder resources by ID
export const FOLDER_RESOURCES_PATH = (id: number) => `/Folder/resources/${id}`;

// Get folder by ID
export const GET_FOLDER_PATH = (id: number) => `/Folder/${id}`;

// Update folder
export const UPDATE_FOLDER_PATH = (id: number) => `/Folder/${id}`;

// Create folder
export const CREATE_FOLDER_PATH = "/Folder";

// Soft delete folder (recoverable)
export const SOFT_DELETE_FOLDER_PATH = (id: number) => `/Folder/soft/${id}`;

// Hard delete folder (permanent)
export const HARD_DELETE_FOLDER_PATH = (id: number) => `/Folder/Hard/${id}`;

// Restore deleted folder
export const RESTORE_FOLDER_PATH = (id: number) => `/Folder/restore/${id}`;

