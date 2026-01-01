// API paths for task module
// Adjust the base path if backend routes change.

export const TASKS_LIST_PATH = "/Task"; // GET
export const ADD_TASK_PATH = "/Task";   // POST

export const GET_TASK_BY_ID_PATH = (id: number | string) => `/Task/${id}`; // GET
export const UPDATE_TASK_PATH = (id: number | string) => `/Task/${id}`;    // PUT

export const UPDATE_TASK_STATUS_PATH = (id: number | string) => `/Task/status/${id}`; // PATCH

export const SOFT_DELETE_TASK_PATH = (id: number | string) => `/Task/soft/${id}`; // DELETE

export const TASK_STATUS_PATH = "/Task/taskstatus";             // GET
export const TASK_PRIORITIES_PATH = "/Task/taskpriorities";     // GET
export const TASK_DASHBOARD_PATH = "/Task/dashboard";           // GET
