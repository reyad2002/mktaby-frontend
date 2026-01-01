// Types for clients listing

export interface ClientType {
  value: string;
  label: string;
}

export interface ClientSummary {
  id: number;
  name: string;
  phoneNumber: string;
  phoneCode: string;
  email: string;
  address: string;
  clientType: ClientType;
  imageURL: string;
  createdAt: string;
}

export interface ClientsQueryParams {
  clientType?: string; // "Individual" or "Company"
  pageNumber?: number;
  pageSize?: number;
  search?: string;
  sort?: string;
  isDeleted?: boolean;
}

export interface ClientsPage {
  pageNumber: number;
  pageSize: number;
  count: number;
  data: ClientSummary[];
}

export interface ClientsResponse {
  succeeded: boolean;
  message: string;
  data: ClientsPage;
}

// Add Client types
export interface AddClientRequest {
  name: string;
  phoneNumber: string;
  phoneCode: string;
  email: string;
  address: string;
  clientType: string; // "Individual" or "Company"
  imageURL?: string;
}

export interface AddClientResponse {
  succeeded: boolean;
  message: string;
  data: number; // returns the new client ID
}

// Common response wrapper
export type ApiResponse<T> = {
  succeeded: boolean;
  message: string;
  data: T;
};

export interface CompanyEmployee {
  id?: number;
  name: string;
  email: string;
  phoneNumber: string;
  nationalIdCard: string;
  position: string;
}

// Get Client by ID types
export interface ClientDetail {
  companyEmployees: CompanyEmployee[];
  id: number;
  name: string;
  phoneNumber: string;
  phoneCode: string;
  email: string | null;
  address: string | null;
  clientType: ClientType;
  imageURL: string | null;
  createdAt: string; // ISO date string
}
export type GetClientResponse = ApiResponse<ClientDetail>;

// Add Company Employee types
export interface AddCompanyEmployeeRequest {
  name: string;
  email: string;
  phoneNumber: string;
  nationalIdCard: string;
  position: string;
}

export interface AddCompanyEmployeeResponse {
  succeeded: boolean;
  message: string;
  data: boolean;
}

// Update Company Employee types
export interface UpdateCompanyEmployeeRequest {
  name: string;
  email: string;
  phoneNumber: string;
  nationalIdCard: string;
  position: string;
}

export interface UpdateCompanyEmployeeResponse {
  succeeded: boolean;
  message: string;
  data: boolean;
}

// Delete Company Employee types
export interface DeleteCompanyEmployeeResponse {
  succeeded: boolean;
  message: string;
  data: boolean;
}

// Update Client types
export interface UpdateClientRequest {
  name: string;
  phoneNumber: string;
  phoneCode: string;
  email: string;
  address: string;
  clientType: string;
  imageURL?: string;
}

export interface UpdateClientResponse {
  succeeded: boolean;
  message: string;
  data: boolean;
}

// Delete Client types
export interface DeleteClientResponse {
  succeeded: boolean;
  message: string;
  data: boolean;
}

// Restore Client types
export interface RestoreClientResponse {
  succeeded: boolean;
  message: string;
  data: boolean;
}

// ===========================
// Shared dropdown option type
// ===========================

export type SelectOption<TValue extends string = string> = {
  value: TValue;
  label: string;
};

// ===========================
// Client Role (for Case)
// ===========================

export type ClientRoleValues =
  | "Undefined"
  | "Accused"
  | "Victim"
  | "Witness"
  | "CivilClaimant"
  | "CivillyResponsible"
  | "Plaintiff"
  | "Defendant"
  | "Intervener"
  | "Opponent"
  | "Husband"
  | "Wife"
  | "AlimonyClaimant"
  | "AlimonyDefendant"
  | "Guardian"
  | "Trustee"
  | "Minor"
  | "Appellant"
  | "Appellee"
  | "Challenger"
  | "Respondent";

export type ClientRoleOption = SelectOption<ClientRoleValues>;

export type GetClientRolesResponse = ClientRoleOption[];

