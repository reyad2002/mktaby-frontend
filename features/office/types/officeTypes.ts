// Types for office

export interface OfficeData {
  id: number;
  name: string;
  address: string;
  phoneNumber: string;
  email: string;
  usersCount: number;
  maxUsersCount: number;
  usedStorageInBytes: number;
  maxStorageInBytes: number;
  imageURL: string;
  subscribedTill: string;
  createdAt: string;
}

export interface OfficeResponse {
  succeeded: boolean;
  message: string;
  data: OfficeData;
}

// Types for the resource item and paginated response
export interface OfficeResource {
  id: number;
  name: string;
  type: string;
  contentType: string;
  size: number;
  userId: number;
  userFullName: string;
  userImageURL: string;
  createdAt: string;
}

export interface OfficeResourceListResponse {
  succeeded: boolean;
  message: string;
  data: {
    pageNumber: number;
    pageSize: number;
    count: number;
    data: OfficeResource[];
  };
}

export interface GetOfficeResourcesParams {
  PageNumber?: number;
  PageSize?: number;
  Search?: string;
  Sort?: string;
  IsDeleted?: boolean;
}
// Types for updating office
export interface UpdateOfficePayload {
  name: string;
  email: string;
  phoneNumber: string;
  address: string;
}

export interface UpdateOfficeResponse {
  succeeded: boolean;
  message: string;
  data: boolean;
}

// Types for setting office logo
export interface SetOfficeLogoResponse {
  succeeded: boolean;
  message: string;
  data: boolean;
}
