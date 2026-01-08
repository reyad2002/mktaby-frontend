// Generic API wrapper
export type ApiResponse<T> = {
  succeeded: boolean;
  message: string;
  data: T;
};

// ✅ Query Params  GET /api/CaseFees
export type GetCaseFeesQuery = {
  CaseId?: number; // int64 (query)
  ClientId?: number; // int64 (query)

  CreatedAtStart?: string; // date-time (ISO)
  CreatedAtEnd?: string; // date-time (ISO)

  ToBePaidAtStart?: string; // date-time (ISO)
  ToBePaidAtEnd?: string; // date-time (ISO)

  PageNumber?: number; // int32
  PageSize?: number; // int32

  Search?: string;
  Sort?: string;

  IsDeleted?: boolean;
};

// ✅ Item DTO (Fee واحد)
export type CaseFeeDto = {
  description: string;
  id: number;
  amount: number;
  caseId: number;
  clientId: number;
  toBePaidAt: string; // date-time (ISO)
  createdAt: string; // date-time (ISO)
};

// ✅ Pagination داخل data
export type PaginatedCaseFees = {
  pageNumber: number;
  pageSize: number;
  count: number;
  data: CaseFeeDto[];
};

// ✅ Response   GET /api/CaseFees
export type GetCaseFeesResponse = ApiResponse<PaginatedCaseFees>;

// ✅ Request Body  POST /api/CaseFees
export type CreateCaseFeeRequest = {
  // caseId: number; // int64
  amount: number; // number
  toBePaidAt: string; // date-time (ISO)
};

// ✅ Response  POST /api/CaseFees
export type CreateCaseFeeResponse = ApiResponse<number>;

export type CaseFeeDetailsDto = {
  id: number;
  amount: number;
  caseId: number;
  clientId: number;
  toBePaidAt: string; // ISO date-time
  createdAt: string; // ISO date-time
};
// ✅ Response  GET /api/CaseFees/{id}
export type GetCaseFeeByIdResponse = ApiResponse<CaseFeeDetailsDto>;

// ✅ Request Body  PUT /api/CaseFees/{id}
export type UpdateCaseFeeRequest = {
  amount: number;
  toBePaidAt: string; // ISO date-time
};
export type UpdateCaseFeeResponse = ApiResponse<boolean>;

// Delete Case Fee (Soft Delete) Response
export type DeleteCaseFeeResponse = ApiResponse<boolean>;
