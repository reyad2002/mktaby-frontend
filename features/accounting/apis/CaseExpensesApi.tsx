import * as PATHES from "../PATHES";
import * as TYPES from "../types/CaseExpensesTypes";
import apiClient from "@/lib/apiClient";

// Get All Case Expenses
export async function getCaseExpenses(
  params: TYPES.GetCaseExpensesQuery = {}
): Promise<TYPES.GetCaseExpensesResponse> {
  const response = await apiClient.get<TYPES.GetCaseExpensesResponse>(
    PATHES.CASE_EXPENSES_PATH,
    {
      params,
    }
  );
  return response.data;
}

// Create a new Case Expense
export async function createCaseExpense(
  payload: TYPES.CreateCaseExpenseRequest
): Promise<TYPES.CreateCaseExpenseResponse> {
  const response = await apiClient.post<TYPES.CreateCaseExpenseResponse>(
    PATHES.CASE_EXPENSES_PATH,
    payload
  );
  return response.data;
}

// Get Case Expense by ID
export async function getCaseExpenseById(
  id: number
): Promise<TYPES.CaseExpenseDetailsDto> {
  const response = await apiClient.get<TYPES.CaseExpenseDetailsDto>(
    PATHES.GET_CASE_EXPENSES_BY_ID_PATH(id)
  );
  return response.data;
}

// Update Case Expense
export async function updateCaseExpense(
  id: number,
    payload: TYPES.UpdateCaseExpenseRequest
): Promise<TYPES.UpdateCaseExpenseResponse> {
  const response = await apiClient.put<TYPES.UpdateCaseExpenseResponse>(
    PATHES.UPDATE_CASE_EXPENSE_PATH(id),
    payload
  );
  return response.data;
}

// Delete Case Expense (Soft Delete)
export async function deleteCaseExpense(
  id: number
): Promise<TYPES.ApiResponse<boolean>> {
  const response = await apiClient.delete<TYPES.ApiResponse<boolean>>(
    PATHES.DELETE_CASE_EXPENSE_PATH(id)
  );
  return response.data;
}
