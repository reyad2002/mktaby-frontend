export type PaymentMethod =
  | "Cash"
  | "CreditCard"
  | "BankTransfer"
  | "MobilePayment"
  | "Check";

export type FeePaymentStatus = "Unpaid" | "Paid" | "Overdue";

export type GetFeePaymentsQuery = {
  CaseId?: number; // int64 (query) - Filter by case
  CaseFeeId?: number; // int64 (query)

  AmountStart?: number; // double
  AmountEnd?: number; // double

  PaymentDateStart?: string; // date-time (ISO)
  PaymentDateEnd?: string; // date-time (ISO)

  PaymentMethod?: PaymentMethod;

  DueDateStart?: string; // date-time (ISO)
  DueDateEnd?: string; // date-time (ISO)

  Status?: FeePaymentStatus;

  PageNumber?: number; // int32
  PageSize?: number; // int32

  Search?: string;
  Sort?: string;

  IsDeleted?: boolean;
};

export type FeePaymentDto = {
  id: number;
  caseFeeId: number;
  amount: number;

  paymentDate: string; // ISO date-time
  paymentMethod: PaymentMethod;

  dueDate: string; // ISO date-time
  status: FeePaymentStatus;

  createdAt: string; // ISO date-time
};

export type PaginatedFeePayments = {
  pageNumber: number;
  pageSize: number;
  count: number;
  data: FeePaymentDto[];
};

export type ApiResponse<T> = {
  succeeded: boolean;
  message: string;
  data: T;
};

export type GetFeePaymentsResponse = ApiResponse<PaginatedFeePayments>;

//   /////////////////////////////

export type CreateFeePaymentRequest = {
  title: string;
  caseFeeId: number; // int64
  amount: number; // double/number
  paymentDate: string; // date-time (ISO)
  paymentMethod: PaymentMethod;
  dueDate: string; // date-time (ISO)
  status: FeePaymentStatus;
};

export type CreateFeePaymentResponse = ApiResponse<number>;

export type FeePaymentDetailsDto = {
  id: number;
  caseFeeId: number;
  amount: number;

  paymentDate: string; // ISO date-time
  paymentMethod: PaymentMethod;

  dueDate: string; // ISO date-time
  status: FeePaymentStatus;

  createdAt: string; // ISO date-time
};

export type GetFeePaymentByIdResponse = ApiResponse<FeePaymentDetailsDto>;

export type UpdateFeePaymentRequest = {
  title: string;
  caseFeeId: number; // int64
  amount: number; // number
  paymentDate: string; // ISO date-time
  paymentMethod: PaymentMethod;
  dueDate: string; // ISO date-time
  status: FeePaymentStatus;
};
export type UpdateFeePaymentResponse = ApiResponse<boolean>;

export type DeleteFeePaymentResponse = ApiResponse<boolean>;
