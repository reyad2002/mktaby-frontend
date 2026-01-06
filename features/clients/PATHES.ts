// API paths for clients module
export const CLIENTS_LIST_PATH = "/Client";
export const ADD_CLIENT_PATH = "/Client";
export const GET_CLIENT_PATH = "/Client"; // GET /Client/{id}
export const UPDATE_CLIENT_PATH = "/Client"; // PUT /Client/{id}
export const SOFT_DELETE_CLIENT_PATH = "/Client/soft"; // DELETE /Client/soft/{id}
export const HARD_DELETE_CLIENT_PATH = "/Client/hard"; // DELETE /Client/hard/{id}
export const RESTORE_CLIENT_PATH = "/Client/restore"; // PATCH /Client/restore/{id}
export const ADD_COMPANY_EMPLOYEE_PATH = "/Client/CompanyEmployee"; // POST /Client/CompanyEmployee/{companyId}
export const UPDATE_COMPANY_EMPLOYEE_PATH = "/Client/CompanyEmployee"; // PUT /Client/CompanyEmployee/{id}
export const SOFT_DELETE_EMPLOYEE_PATH = "/Client/CompanyEmployee/Soft"; // DELETE /Client/CompanyEmployee/Soft/{id}
