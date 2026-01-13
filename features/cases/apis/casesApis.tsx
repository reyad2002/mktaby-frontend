import type {
  GetCaseStatusResponse,
  GetCaseTypesResponse,
  CreateCaseRequest,
  CreateCaseResponse,
  GetCasesQuery,
  GetCasesResponse,
  GetCaseByIdResponse,
  UpdateCaseRequest,
  UpdateCaseResponse,
  GetCaseStatisticsResponse,
  SoftDeleteCaseResponse,
  HardDeleteCaseResponse,
  RestoreCaseResponse,
  ArchiveCaseResponse,
  UnarchiveCaseResponse,
  CaseDropdownQuery,
  GetCaseDropdownResponse,
  CaseResourcesQuery,
  GetCaseResourcesResponse,
} from "@/features/cases/types/casesTypes";
import {
  CASES_LIST_PATH,
  ADD_CASE_PATH,
  GET_CASE_BY_ID_PATH,
  UPDATE_CASE_PATH,
  CASE_STATISTICS_PATH,
  SOFT_DELETE_CASE_PATH,
  HARD_DELETE_CASE_PATH,
  RESTORE_CASE_PATH,
  ARCHIVE_CASE_PATH,
  UNARCHIVE_CASE_PATH,
  CASE_TYPES_PATH,
  CASE_STATUS_PATH,
  CASE_RESOURCES_PATH,
  CASE_DROPDOWN_PATH,
} from "@/features/cases/PATHES";
import apiClient from "@/lib/apiClient";

// ===========================
// GET /Case/statuses
// ===========================
export async function getCaseStatuses(): Promise<GetCaseStatusResponse> {
  const response = await apiClient.get<GetCaseStatusResponse>(CASE_STATUS_PATH);
  return response.data;
}
// ===========================
// GET /Case/casetypes
// ===========================
export async function getCaseTypes(): Promise<GetCaseTypesResponse> {
  const response = await apiClient.get<GetCaseTypesResponse>(CASE_TYPES_PATH);
  return response.data;
}
// ===========================
// GET /Case
// ===========================
export async function getCases(
  queryParams: GetCasesQuery
): Promise<GetCasesResponse> {
  const response = await apiClient.get<GetCasesResponse>(CASES_LIST_PATH, {
    params: queryParams,
  });
  return response.data;
}
// ===========================
// GET /Case/{id}
// ===========================
export async function getCaseById(
  id: number | string
): Promise<GetCaseByIdResponse> {
  const response = await apiClient.get<GetCaseByIdResponse>(
    GET_CASE_BY_ID_PATH(id)
  );
  return response.data;
}
// ===========================
// POST /Case
// ===========================
export async function createCase(
  data: CreateCaseRequest
): Promise<CreateCaseResponse> {
  const response = await apiClient.post<CreateCaseResponse>(
    ADD_CASE_PATH,
    data
  );
  return response.data;
}
// ===========================
// PUT /Case/{id}
// ===========================
export async function updateCase(
  id: number | string,
  data: UpdateCaseRequest
): Promise<UpdateCaseResponse> {
  const response = await apiClient.put<UpdateCaseResponse>(
    UPDATE_CASE_PATH(id),
    data
  );
  return response.data;
}
// ===========================
// GET /Case/statistics/{id}
// ===========================
export async function getCaseStatistics(
  id: number | string
): Promise<GetCaseStatisticsResponse> {
  const response = await apiClient.get<GetCaseStatisticsResponse>(
    CASE_STATISTICS_PATH(id)
  );
  return response.data;
}
// ===========================
// DELETE /Case/soft/{id}
// ===========================
export async function softDeleteCase(
  id: number | string
): Promise<SoftDeleteCaseResponse> {
  const response = await apiClient.delete<SoftDeleteCaseResponse>(
    SOFT_DELETE_CASE_PATH(id)
  );
  return response.data;
}
// ===========================
// DELETE /Case/hard/{id}
// ===========================
export async function hardDeleteCase(
  id: number | string
): Promise<HardDeleteCaseResponse> {
  const response = await apiClient.delete<HardDeleteCaseResponse>(
    HARD_DELETE_CASE_PATH(id)
  );
  return response.data;
}
// ===========================
// POST /Case/restore/{id}
// ===========================
export async function restoreCase(
  id: number | string
): Promise<RestoreCaseResponse> {
  const response = await apiClient.post<RestoreCaseResponse>(
    RESTORE_CASE_PATH(id)
  );
  return response.data;
}
// ===========================
// PATCH /Case/{id}/archive
// ===========================
export async function archiveCase(
  id: number | string
): Promise<ArchiveCaseResponse> {
  const response = await apiClient.patch<ArchiveCaseResponse>(
    ARCHIVE_CASE_PATH(id)
  );
  return response.data;
}
// ===========================
// PATCH /Case/{id}/unarchive
// ===========================
export async function unarchiveCase(
  id: number | string
): Promise<UnarchiveCaseResponse> {
  const response = await apiClient.patch<UnarchiveCaseResponse>(
    UNARCHIVE_CASE_PATH(id)
  );
  return response.data;
}
// ===========================
// GET /Case/dropdown
// ===========================
export async function getCaseDropdown(
  queryParams: CaseDropdownQuery
): Promise<GetCaseDropdownResponse> {
  const response = await apiClient.get<GetCaseDropdownResponse>(
    CASE_DROPDOWN_PATH,
    {
      params: queryParams,
    }
  );
  return response.data;
}
// ===========================
// GET /Case/resources/{id}
// ===========================
export async function getCaseResources(
  id: number | string,
  queryParams: CaseResourcesQuery
): Promise<GetCaseResourcesResponse> {
  const response = await apiClient.get<GetCaseResourcesResponse>(
    CASE_RESOURCES_PATH(id),
    {
      params: queryParams,
    }
  );
  return response.data;
}
