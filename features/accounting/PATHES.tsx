//CaseExpenses Paths
const CASE_EXPENSES_PATH = "/CaseExpenses";
const GET_CASE_EXPENSES_BY_ID_PATH = (id: number) => `/CaseExpenses/${id}`;
const UPDATE_CASE_EXPENSE_PATH = (id: number) => `/CaseExpenses/${id}`;
const DELETE_CASE_EXPENSE_PATH = (id: number) => `/CaseExpenses/soft/${id}`;

export {
  CASE_EXPENSES_PATH,
  GET_CASE_EXPENSES_BY_ID_PATH,
  UPDATE_CASE_EXPENSE_PATH,
  DELETE_CASE_EXPENSE_PATH,
};

//CaseFees Paths
const CASE_FEES_PATH = "/CaseFees";
const GET_CASE_FEE_BY_ID_PATH = (id: number) => `/CaseFees/${id}`;
const UPDATE_CASE_FEE_PATH = (id: number) => `/CaseFees/${id}`;
const DELETE_CASE_FEE_PATH = (id: number) => `/CaseFees/soft/${id}`;

export {
  CASE_FEES_PATH,
  GET_CASE_FEE_BY_ID_PATH,
  UPDATE_CASE_FEE_PATH,
  DELETE_CASE_FEE_PATH,
};

//fee payments Paths
const FEE_PAYMENT_PATH = "/FeePayment";
const GET_FEE_PAYMENT_BY_ID_PATH = (id: number) => `/FeePayment/${id}`;
const UPDATE_FEE_PAYMENT_PATH = (id: number) => `/FeePayment/${id}`;
const DELETE_FEE_PAYMENT_PATH = (id: number) => `/FeePayment/soft/${id}`;

export {
  FEE_PAYMENT_PATH,
  GET_FEE_PAYMENT_BY_ID_PATH,
  UPDATE_FEE_PAYMENT_PATH,
  DELETE_FEE_PAYMENT_PATH,
};

//office expenses Paths
const OFFICE_EXPENSES_PATH = "/OfficeExpenses";
const GET_OFFICE_EXPENSE_BY_ID_PATH = (id: number) => `/OfficeExpenses/${id}`;
const UPDATE_OFFICE_EXPENSE_PATH = (id: number) => `/OfficeExpenses/${id}`;
const DELETE_OFFICE_EXPENSE_PATH = (id: number) => `/OfficeExpenses/soft/${id}`;

export {
  OFFICE_EXPENSES_PATH,
  GET_OFFICE_EXPENSE_BY_ID_PATH,
  UPDATE_OFFICE_EXPENSE_PATH,
  DELETE_OFFICE_EXPENSE_PATH,
};
