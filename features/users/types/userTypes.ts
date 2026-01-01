// Types for users listing

export interface UserSummary {
  id: number;
  name: string;
  email: string;
  phoneNumber: string;
  role:string;
  officeName: string;
  createdAt: string;
  imageUrl: string;
  userPermissionId: number;
  userPermissionName: string;
}

export interface UsersQueryParams {
  pageNumber?: number;
  pageSize?: number;
  search?: string;
  sort?: string;
  isDeleted?: boolean;
}

export interface UsersPage {
  pageNumber: number;
  pageSize: number;
  count: number;
  data: UserSummary[];
}

export interface UsersResponse {
  succeeded: boolean;
  message: string;
  data: UsersPage;
}

// Add User types
export interface AddUserRequest {
  name: string;
  email: string;
  phoneNumber: string;
  password: string;
  permissionId: number;
}

export interface AddUserResponse {
  succeeded: boolean;
  message: string;
  data: number; // returns the new user ID
}

// Update User types
export interface UpdateUserRequest {
  id: number;
  name: string;
  email: string;
  phoneNumber: string;
  permissionId: number;
}

export interface UpdateUserResponse {
  succeeded: boolean;
  message: string;
  data: boolean;
}

// Get User by ID types
export interface UserDetail {
  id: number;
  name: string;
  email: string;
  phoneNumber: string;
  role:string;
  officeName: string;
  createdAt: string;
  imageURL: string;
  userPermissionId: number;
  userPermissionName: string;
}

export interface GetUserResponse {
  succeeded: boolean;
  message: string;
  data: UserDetail;
}

// Delete User types
export interface DeleteUserResponse {
  succeeded: boolean;
  message: string;
  data: boolean;
}

// Current User types
export interface CurrentUserResponse {
  succeeded: boolean;
  message: string;
  data: UserDetail;
}

// Set Profile Image types
export interface SetProfileImageResponse {
  succeeded: boolean;
  message: string;
  data: boolean;
}
