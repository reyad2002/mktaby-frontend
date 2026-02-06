// API paths for case module
// Adjust the base path if backend routes change.

export const CASES_LIST_PATH = "/Case"; // GET
export const ADD_CASE_PATH = "/Case"; // POST

export const GET_CASE_BY_ID_PATH = (id: number | string) => `/Case/${id}`; // GET
export const UPDATE_CASE_PATH = (id: number | string) => `/Case/${id}`; // PUT

export const CASE_STATISTICS_PATH = (id: number | string) =>
  `/Case/statistics/${id}`; // GET

export const SOFT_DELETE_CASE_PATH = (id: number | string) =>
  `/Case/soft/${id}`; // DELETE
export const HARD_DELETE_CASE_PATH = (id: number | string) =>
  `/Case/hard/${id}`; // DELETE
export const RESTORE_CASE_PATH = (id: number | string) => `/Case/restore/${id}`; // POST

export const ARCHIVE_CASE_PATH = (id: number | string) => `/Case/${id}/archive`; // PATCH
export const UNARCHIVE_CASE_PATH = (id: number | string) =>
  `/Case/${id}/unarchive`; // PATCH

export const CASE_TYPES_PATH = "/Case/casetypes"; // GET
export const CASE_STATUS_PATH = "/Case/casestatus"; // GET

export const CASE_RESOURCES_PATH = (id: number | string) =>
  `/Case/resources/${id}`; // GET
export const CASE_DROPDOWN_PATH = "/Case/dropdown"; // GET

export const CHECK_CASE_NAME_EXISTS_PATH = "/Case/check-name-exists"; // GET
export const CHECK_CASE_NUMBER_EXISTS_PATH = "/Case/check-casenumber-exists"; // GET

// case total finance
export const CASE_TOTAL_FINANCE_PATH = "/Finance/cases";