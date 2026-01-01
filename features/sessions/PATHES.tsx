// API paths for session module
// Adjust the base path if backend routes change.

export const SESSIONS_LIST_PATH = "/Session"; // GET
export const ADD_SESSION_PATH = "/Session";   // POST

export const GET_SESSION_BY_ID_PATH = (id: number | string) => `/Session/${id}`; // GET
export const UPDATE_SESSION_PATH = (id: number | string) => `/Session/${id}`;    // PUT

export const SOFT_DELETE_SESSION_PATH = (id: number | string) => `/Session/soft/${id}`; // DELETE

export const SESSION_TYPES_PATH = "/Session/sessiontypes";   // GET
export const SESSION_STATUS_PATH = "/Session/sessionstatus"; // GET
