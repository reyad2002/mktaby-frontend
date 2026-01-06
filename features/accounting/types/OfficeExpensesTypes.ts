// ✅ أنواع المصاريف المكتبية
export type OfficeExpenseType =
  | "Rent"
  | "Utilities"
  | "OfficeSupplies"
  | "Maintenance"
  | "Marketing"
  | "Travel"
  | "Salaries"
  | "Other";

export type PaymentMethod =
  | "Cash"
  | "CreditCard"
  | "BankTransfer"
  | "MobilePayment"
  | "Check";

// ✅ Query Params لـ GET /api/OfficeExpenses
export type GetOfficeExpensesQuery = {
  AmountStart?: number; // double
  AmountEnd?: number; // double
  ExpenseType?: OfficeExpenseType;
  PaymentMethod?: PaymentMethod;
  ExpenseDateStart?: string; // date-time (ISO)
  ExpenseDateEnd?: string; // date-time (ISO)
  PageNumber?: number; // int32
  PageSize?: number; // int32
  Search?: string;
  Sort?: string;
  IsDeleted?: boolean;
};

// ✅ عنصر واحد في الداتا الراجعة
export type OfficeExpenseDto = {
  id: number;
  amount: number;
  title: string;
  expenseType: OfficeExpenseType;
  expenseDate: string; // date-time (ISO)
  paymentMethod: PaymentMethod;
  createdAt: string; // date-time (ISO)
};

// ✅ Pagination object اللي جوه data
export type PaginatedOfficeExpenses = {
  pageNumber: number;
  pageSize: number;
  count: number;
  data: OfficeExpenseDto[];
};

// ✅ الشكل العام للـ API Response (Wrapper)
export type ApiResponse<T> = {
  succeeded: boolean;
  message: string;
  data: T;
};

// ✅ Response النهائي لـ GET /api/OfficeExpenses
export type GetOfficeExpensesResponse = ApiResponse<PaginatedOfficeExpenses>;




// ✅ Request body لـ POST /api/OfficeExpenses
export type CreateOfficeExpenseRequest = {
  title: string;
  amount: number;
  expenseType: OfficeExpenseType;
  expenseDate: string; // ISO date-time
  paymentMethod: PaymentMethod;
  createdAt: string; // ISO date-time (حسب الـ API)
};
// ✅ Response النهائي لـ POST /api/OfficeExpenses
export type CreateOfficeExpenseResponse = ApiResponse<number>;






// ✅ Response body لـ GET /api/OfficeExpenses/{id}
export type OfficeExpenseDetailsDto = {
  id: number;
  amount: number;
  title: string;
  expenseType: OfficeExpenseType;
  expenseDate: string; // ISO date-time
  paymentMethod: PaymentMethod;
  createdAt: string; // ISO date-time
};
export type GetOfficeExpenseByIdResponse = ApiResponse<OfficeExpenseDetailsDto>;



// ✅ Request body لـ PUT /api/OfficeExpenses/{id}
export type UpdateOfficeExpenseRequest = {
  title: string;
  amount: number;
  expenseType: OfficeExpenseType;
  expenseDate: string;    // ISO date-time
  paymentMethod: PaymentMethod;
  createdAt: string;      // ISO date-time
};
// ✅ Response النهائي لـ PUT /api/OfficeExpenses/{id}
export type UpdateOfficeExpenseResponse = ApiResponse<boolean>;

// ✅ Response النهائي لـ DELETE /api/OfficeExpenses/soft/{id}
export type DeleteOfficeExpenseResponse = ApiResponse<boolean>;
