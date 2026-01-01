// Types for user profile update

export interface UpdateProfileRequest {
  id: number;
  name: string;
  email: string;
  phoneNumber: string;
}

export interface UpdateProfileResponse {
  succeeded: boolean;
  message: string;
  data: boolean;
}
