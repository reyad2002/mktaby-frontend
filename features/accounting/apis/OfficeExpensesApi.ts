import * as PATHES from "../PATHES";
import * as TYPES from "../types/OfficeExpensesTypes";
import apiClient from "@/lib/apiClient";

// Get All Office Expenses
export async function getOfficeExpenses(
  params: TYPES.GetOfficeExpensesQuery = {}
): Promise<TYPES.GetOfficeExpensesResponse> {
  const response = await apiClient.get<TYPES.GetOfficeExpensesResponse>(
    PATHES.OFFICE_EXPENSES_PATH,
    {
      params,
    }
  );
  return response.data;
}

// Create a new Office Expense
export async function createOfficeExpense(
  payload: TYPES.CreateOfficeExpenseRequest
): Promise<TYPES.CreateOfficeExpenseResponse> {
  const response = await apiClient.post<TYPES.CreateOfficeExpenseResponse>(
    PATHES.OFFICE_EXPENSES_PATH,
    payload
  );
  return response.data;
}
// Get Office Expense by ID
export async function getOfficeExpenseById(
  id: number
): Promise<TYPES.OfficeExpenseDetailsDto> {
  const response = await apiClient.get<TYPES.OfficeExpenseDetailsDto>(
    PATHES.GET_OFFICE_EXPENSE_BY_ID_PATH(id)
  );
  return response.data;
}
// Update Office Expense
export async function updateOfficeExpense(
  id: number,
  payload: TYPES.UpdateOfficeExpenseRequest
): Promise<TYPES.UpdateOfficeExpenseResponse> {
  const response = await apiClient.put<TYPES.UpdateOfficeExpenseResponse>(
    PATHES.UPDATE_OFFICE_EXPENSE_PATH(id),
    payload
  );
  return response.data;
}
// Delete Office Expense (Soft Delete)
export async function deleteOfficeExpense(
  id: number
): Promise<TYPES.ApiResponse<boolean>> {
  const response = await apiClient.delete<TYPES.ApiResponse<boolean>>(
    PATHES.DELETE_OFFICE_EXPENSE_PATH(id)
  );
  return response.data;
}
