
export type ApiResponse<T> = {
  succeeded: boolean;
  message: string;
  data: T;
};

// ✅ Query Params لـ GET /api/CaseExpenses
export type GetCaseExpensesQuery = {
  CaseId?: number;            // int64 (query)
  CreatedAtStart?: string;    // date-time (ISO)
  CreatedAtEnd?: string;      // date-time (ISO)
  ExpenseDateStart?: string;  // date-time (ISO)
  ExpenseDateEnd?: string;    // date-time (ISO)
  PageNumber?: number;        // int32
  PageSize?: number;          // int32
  Search?: string;
  Sort?: string;
  IsDeleted?: boolean;
};


export type CaseExpenseDto = {
  id: number;
  amount: number;
  caseId: number;
  expenseDate: string;  // date-time (ISO)
  createdAt: string;    // date-time (ISO)
};

// ✅ Pagination object داخل data
export type PaginatedCaseExpenses = {
  pageNumber: number;
  pageSize: number;
  count: number;
  data: CaseExpenseDto[];
};

// ✅ Response النهائي لـ GET /api/CaseExpenses
export type GetCaseExpensesResponse = ApiResponse<PaginatedCaseExpenses>;




// ✅ Request Body لـ POST /api/CaseExpenses
export type CreateCaseExpenseRequest = {
  caseId: number;        // int64
  amount: number;        // number
  expenseDate: string;   // date-time (ISO)
};

// ✅ Response لـ POST /api/CaseExpenses
export type CreateCaseExpenseResponse = ApiResponse<number>;



// ✅ Response Body لـ GET /api/CaseExpenses/{id}
export type CaseExpenseDetailsDto = {
  id: number;
  amount: number;
  caseId: number;
  expenseDate: string;  // ISO date-time
  createdAt: string;    // ISO date-time
};
export type GetCaseExpenseByIdResponse = ApiResponse<CaseExpenseDetailsDto>;



// ✅ Request Body لـ PUT /api/CaseExpenses/{id}
export type UpdateCaseExpenseRequest = {
  caseId: number;        // int64
  amount: number;        // number
  expenseDate: string;   // ISO date-time
};

export type UpdateCaseExpenseResponse = ApiResponse<boolean>;

// ✅ Response لـ DELETE /api/CaseExpenses/soft/{id}
export type DeleteCaseExpenseResponse = ApiResponse<boolean>;
