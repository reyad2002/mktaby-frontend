import apiClient from "@/lib/apiClient";
import {
  UpdateProfileRequest,
  UpdateProfileResponse,
} from "../types/userProfileTypes";

// Update current user profile
// export async function updateProfile(
//   profileData: UpdateProfileRequest
// ): Promise<UpdateProfileResponse> {
//   const response = await apiClient.patch<UpdateProfileResponse>(
//     "/Users/UpdateProfile",
//     profileData
//   );
//   return response.data;
// }
