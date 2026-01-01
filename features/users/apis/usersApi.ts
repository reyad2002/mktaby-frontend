import apiClient from "@/lib/apiClient";
import { USERS_LIST_PATH, ADD_USER_PATH } from "../PATHES";
import {
  UsersQueryParams,
  UsersResponse,
  AddUserRequest,
  AddUserResponse,
  UpdateUserRequest,
  UpdateUserResponse,
  GetUserResponse,
  DeleteUserResponse,
  CurrentUserResponse,
  SetProfileImageResponse,
} from "../types/userTypes";

// Fetch paginated users list
export async function fetchUsers(
  params: UsersQueryParams = {}
): Promise<UsersResponse> {
  const response = await apiClient.get<UsersResponse>(USERS_LIST_PATH, {
    params,
  });
  return response.data;
}

// Add new user
export async function addUser(
  userData: AddUserRequest
): Promise<AddUserResponse> {
  const response = await apiClient.post<AddUserResponse>(
    ADD_USER_PATH,
    userData
  );
  return response.data;
}

// Update user
export async function updateUser(
  userData: UpdateUserRequest
): Promise<UpdateUserResponse> {
  const response = await apiClient.patch<UpdateUserResponse>(
    "/Users",
    userData
  );
  return response.data;
}

// Get user by ID
export async function getUserById(id: number): Promise<GetUserResponse> {
  const response = await apiClient.get<GetUserResponse>(`/Users/${id}`);
  return response.data;
}

// Delete user
export async function deleteUser(id: number): Promise<DeleteUserResponse> {
  const response = await apiClient.delete<DeleteUserResponse>(`/Users/${id}`);
  return response.data;
}

// Get current user
export async function getCurrentUser(): Promise<CurrentUserResponse> {
  const response = await apiClient.get<CurrentUserResponse>(
    "/Users/CurrentUser"
  );
  // console.log(response.data);
  return response.data;
}

// Set profile image
export async function setProfileImage(
  id: number,
  imageFile: File
): Promise<SetProfileImageResponse> {
  const formData = new FormData();
  formData.append("Image", imageFile);

  const response = await apiClient.post<SetProfileImageResponse>(
    "/Users/SetProfileImage",
    formData,
    {
      params: { Id: id },
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return response.data;
}
