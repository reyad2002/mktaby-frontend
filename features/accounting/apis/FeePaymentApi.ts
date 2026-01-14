import * as PATHES from "../PATHES";
import * as TYPES from "../types/FeePaymentTypes";
import apiClient from "@/lib/apiClient";

// Get All Fee Payments
export async function getFeePayments(
  params: TYPES.GetFeePaymentsQuery = {}
): Promise<TYPES.GetFeePaymentsResponse> {
  const response = await apiClient.get<TYPES.GetFeePaymentsResponse>(
    PATHES.FEE_PAYMENT_PATH,
    {
      params,
    }
  );
  return response.data;
}
// Create a new Fee Payment
export async function createFeePayment(
  payload: TYPES.CreateFeePaymentRequest
): Promise<TYPES.CreateFeePaymentResponse> {
  const response = await apiClient.post<TYPES.CreateFeePaymentResponse>(
    PATHES.FEE_PAYMENT_PATH,
    payload
  );
  return response.data;
}
// Get Fee Payment by ID
export async function getFeePaymentById(
  id: number    
): Promise<TYPES.GetFeePaymentByIdResponse> {
  const response = await apiClient.get<TYPES.GetFeePaymentByIdResponse>(
    PATHES.GET_FEE_PAYMENT_BY_ID_PATH(id)
  );
  return response.data;
}
// Update Fee Payment
export async function updateFeePayment(
  id: number,
    payload: TYPES.UpdateFeePaymentRequest
): Promise<TYPES.UpdateFeePaymentResponse> {
  const response = await apiClient.put<TYPES.UpdateFeePaymentResponse>(
    PATHES.UPDATE_FEE_PAYMENT_PATH(id),
    payload
  );
  return response.data;
}
// Delete Fee Payment (Soft Delete)
export async function deleteFeePayment(
  id: number
): Promise<TYPES.ApiResponse<boolean>> {
  const response = await apiClient.delete<TYPES.ApiResponse<boolean>>(
    PATHES.DELETE_FEE_PAYMENT_PATH(id)
  );
  return response.data;
}
