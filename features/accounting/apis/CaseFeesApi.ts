import * as PATHES from "../PATHES";
import * as TYPES from "../types/CaseFeesTypes";
import apiClient from "@/lib/apiClient";

// ✅ GET /api/CaseFees
export async function getCaseFees(
  params: TYPES.GetCaseFeesQuery = {}
): Promise<TYPES.GetCaseFeesResponse> {
  const response = await apiClient.get<TYPES.GetCaseFeesResponse>(
    PATHES.CASE_FEES_PATH,
    {
      params,
    }
  );
  return response.data;
}

// ✅ POST /api/CaseFees/{caseId}
export async function createCaseFee(
  caseId: number,
  payload: TYPES.CreateCaseFeeRequest
): Promise<TYPES.CreateCaseFeeResponse> {
  const response = await apiClient.post<TYPES.CreateCaseFeeResponse>(
    PATHES.CREATE_CASE_FEE_PATH(caseId),
    payload
  );
  return response.data;
}
// ✅ GET /api/CaseFees/{id}
export async function getCaseFeeById(
  id: number
): Promise<TYPES.GetCaseFeeByIdResponse> {
  const response = await apiClient.get<TYPES.GetCaseFeeByIdResponse>(
    PATHES.GET_CASE_FEE_BY_ID_PATH(id)
  );
  return response.data;
}

// ✅ PUT /api/CaseFees/{id}
export async function updateCaseFee(
  id: number,
  payload: Partial<TYPES.UpdateCaseFeeRequest>
): Promise<TYPES.UpdateCaseFeeResponse> {
  const response = await apiClient.put<TYPES.UpdateCaseFeeResponse>(
    PATHES.UPDATE_CASE_FEE_PATH(id),
    payload
  );
  return response.data;
}
// ✅ DELETE /api/CaseFees/{id}
export async function deleteCaseFee(
  id: number
): Promise<TYPES.DeleteCaseFeeResponse> {
  const response = await apiClient.delete<TYPES.DeleteCaseFeeResponse>(
    PATHES.DELETE_CASE_FEE_PATH(id)
  );
  return response.data;
}
