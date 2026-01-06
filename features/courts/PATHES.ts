// API paths for court module
// Adjust the base path if backend routes change.

export const COURTS_LIST_PATH = "/Court"; // GET
export const ADD_COURT_PATH = "/Court"; // POST

export const GET_COURT_BY_ID_PATH = (id: number | string) => `/Court/${id}`; // GET
export const UPDATE_COURT_PATH = (id: number | string) => `/Court/${id}`; // PUT

export const SOFT_DELETE_COURT_PATH = (id: number | string) => 
  `/Court/soft/${id}`; // DELETE
export const HARD_DELETE_COURT_PATH = (id: number | string) =>
  `/Court/hard/${id}`; // DELETE
export const RESTORE_COURT_PATH = (id: number | string) =>
  `/Court/restore/${id}`; // POST

export const COURTS_DROPDOWN_PATH = "/Court/dropdown"; // GET
export const COURT_TYPES_PATH = "/Court/courtTypes"; // GET
