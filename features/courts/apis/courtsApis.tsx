import {
  ApiResponse,
  PaginatedResponse,
  SelectOption,
  CourtsResource,
  GetCourtsResponse,
  CourtType,
  CreateCourtRequest,
  CreateCourtResponse,
  UpdateCourtRequest,
  UpdateCourtResponse,
  CourtDropdownItem,
  CourtDropdownQuery,
  GetCourtDropdownResponse,
  Court,
  GetCourtByIdResponse,
  SoftDeleteCourtResponse,
  HardDeleteCourtResponse,
  RestoreCourtResponse,
  SelectOptionCourtsType,
  CourtTypeValue,
  CourtTypeOption,
  GetCourtTypesResponse,
  Params
} from "../types/courtsTypes";
import {
  COURTS_LIST_PATH,
  ADD_COURT_PATH,
  GET_COURT_BY_ID_PATH,
  UPDATE_COURT_PATH,
  SOFT_DELETE_COURT_PATH,
  HARD_DELETE_COURT_PATH,
  RESTORE_COURT_PATH,
  COURTS_DROPDOWN_PATH,
  COURT_TYPES_PATH,
} from "../PATHES";
import apiClient from "@/lib/apiClient";
// ===========================
// Court Resources (GET /Court/resources)
// ===========================
export async function getCourtsResourcesApi(params:Params ): Promise<GetCourtsResponse> {
  const response = await apiClient.get<GetCourtsResponse>(COURTS_LIST_PATH, {
    params,
  });
  return response.data;
}
// ===========================
// Create Court (POST /Court)
// ===========================
export async function createCourtApi(
  courtData: CreateCourtRequest
): Promise<CreateCourtResponse> {
    const response = await apiClient.post<CreateCourtResponse>(
    ADD_COURT_PATH,
    courtData
  );
  return response.data;
}

// ===========================
// Update Court (PUT /Court/{id})
// ===========================
export async function updateCourtApi(
  id: number,
  courtData: UpdateCourtRequest
): Promise<UpdateCourtResponse> {
  const response = await apiClient.put<UpdateCourtResponse>(
    UPDATE_COURT_PATH(id),
    courtData
  );
  return response.data;
}
// ===========================
// Get Court by ID (GET /Court/{id})
// ===========================
export async function getCourtByIdApi(id: number): Promise<GetCourtByIdResponse> {
  const response = await apiClient.get<GetCourtByIdResponse>(
    GET_COURT_BY_ID_PATH(id)
  );
  return response.data;
}
// ===========================
// Soft Delete Court (DELETE /Court/soft/{id})
// ===========================
export async function softDeleteCourtApi(id: number): Promise<SoftDeleteCourtResponse> {
  const response = await apiClient.delete<SoftDeleteCourtResponse>(
    SOFT_DELETE_COURT_PATH(id)
  );
  return response.data;
}
// ===========================
// Hard Delete Court (DELETE /Court/hard/{id})
// ===========================
export async function hardDeleteCourtApi(id: number): Promise<HardDeleteCourtResponse> {
  const response = await apiClient.delete<HardDeleteCourtResponse>(
    HARD_DELETE_COURT_PATH(id)
  );
  return response.data;
}
// ===========================
// Restore Court (POST /Court/restore/{id})
// ===========================
export async function restoreCourtApi(id: number): Promise<RestoreCourtResponse> {
  const response = await apiClient.post<RestoreCourtResponse>(
    RESTORE_COURT_PATH(id)
  );
  return response.data;
}
// ===========================
// Court Dropdown (GET /Court/dropdown)
// ===========================
export async function getCourtDropdownApi(
  params: CourtDropdownQuery = {}
): Promise<GetCourtDropdownResponse> {
    const response = await apiClient.get<GetCourtDropdownResponse>(
    COURTS_DROPDOWN_PATH,
    {
      params,
    }
  );
  return response.data;
}
// ===========================
// Court Types (GET /Court/courtTypes)
// ===========================
export async function getCourtTypesApi(): Promise<GetCourtTypesResponse> {
  const response = await apiClient.get<GetCourtTypesResponse>(
    COURT_TYPES_PATH
  );
  return response.data;
}
