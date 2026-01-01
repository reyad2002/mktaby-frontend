import apiClient from "@/lib/apiClient";
import {
  CLIENTS_LIST_PATH,
  ADD_CLIENT_PATH,
  GET_CLIENT_PATH,
  UPDATE_CLIENT_PATH,
  SOFT_DELETE_CLIENT_PATH,
  HARD_DELETE_CLIENT_PATH,
  RESTORE_CLIENT_PATH,
  ADD_COMPANY_EMPLOYEE_PATH,
  UPDATE_COMPANY_EMPLOYEE_PATH,
  SOFT_DELETE_EMPLOYEE_PATH,
} from "../PATHES";
import {
  ClientsQueryParams,
  ClientsResponse,
  AddClientRequest,
  AddClientResponse,
  GetClientResponse,
  UpdateClientRequest,
  UpdateClientResponse,
  DeleteClientResponse,
  RestoreClientResponse,
  AddCompanyEmployeeRequest,
  AddCompanyEmployeeResponse,
  UpdateCompanyEmployeeRequest,
  UpdateCompanyEmployeeResponse,
  DeleteCompanyEmployeeResponse,
} from "../types/clientTypes";

// Fetch paginated clients list
export async function fetchClients(
  params: ClientsQueryParams = {}
): Promise<ClientsResponse> {
  const response = await apiClient.get<ClientsResponse>(CLIENTS_LIST_PATH, {
    params,
  });
  return response.data;
}

// Add new client
export async function addClient(
  clientData: AddClientRequest
): Promise<AddClientResponse> {
  const response = await apiClient.post<AddClientResponse>(
    ADD_CLIENT_PATH,
    clientData
  );
  return response.data;
}

// Get client by ID
export async function getClientById(id: number): Promise<GetClientResponse> {
  const response = await apiClient.get<GetClientResponse>(
    `${GET_CLIENT_PATH}/${id}`
  );
  return response.data;
}

// Update client by ID
export async function updateClient(
  id: number,
  clientData: UpdateClientRequest
): Promise<UpdateClientResponse> {
  const response = await apiClient.put<UpdateClientResponse>(
    `${UPDATE_CLIENT_PATH}/${id}`,
    clientData
  );
  return response.data;
}

// Soft delete client by ID (recoverable)
export async function softDeleteClient(
  id: number
): Promise<DeleteClientResponse> {
  const response = await apiClient.delete<DeleteClientResponse>(
    `${SOFT_DELETE_CLIENT_PATH}/${id}`
  );
  return response.data;
}

// Hard delete client by ID (permanent)
export async function hardDeleteClient(
  id: number
): Promise<DeleteClientResponse> {
  const response = await apiClient.delete<DeleteClientResponse>(
    `${HARD_DELETE_CLIENT_PATH}/${id}`
  );
  return response.data;
}

// Restore deleted client by ID
export async function restoreClient(
  id: number
): Promise<RestoreClientResponse> {
  const response = await apiClient.patch<RestoreClientResponse>(
    `${RESTORE_CLIENT_PATH}/${id}`
  );
  return response.data;
}

// Add company employee
export async function addCompanyEmployee(
  companyId: number,
  employeeData: AddCompanyEmployeeRequest
): Promise<AddCompanyEmployeeResponse> {
  const response = await apiClient.post<AddCompanyEmployeeResponse>(
    `${ADD_COMPANY_EMPLOYEE_PATH}/${companyId}`,
    employeeData
  );
  return response.data;
}

// Update company employee
export async function updateCompanyEmployee(
  employeeId: number,
  employeeData: UpdateCompanyEmployeeRequest
): Promise<UpdateCompanyEmployeeResponse> {
  const response = await apiClient.put<UpdateCompanyEmployeeResponse>(
    `${UPDATE_COMPANY_EMPLOYEE_PATH}/${employeeId}`,
    employeeData
  );
  return response.data;
}

//  delete company employee
export async function softDeleteEmployee(
  id: number
): Promise<DeleteCompanyEmployeeResponse> {
  const response = await apiClient.delete<DeleteCompanyEmployeeResponse>(
    `${SOFT_DELETE_EMPLOYEE_PATH}/${id}`
  );
  return response.data;
}
