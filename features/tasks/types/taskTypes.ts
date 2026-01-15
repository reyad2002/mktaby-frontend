// ===== Enums from the Swagger UI =====

export type TaskStatus =
  | "Pending"
  | "InProgress"
  | "OnHold"
  | "Overdue"
  | "Completed"
  | "Cancelled";

export type TaskPriority = "Low" | "Normal" | "High" ;
export const TaskPrioritiesArabicMap: Record<TaskPriority, string> = {
  Low: "منخفضة",
  Normal: "عادية",
  High: "عالية",
};
export const TaskStatusesArabicMap: Record<TaskStatus, string> = {
  Pending: "قيد الانتظار",
  InProgress: "قيد التنفيذ",
  OnHold: "معلق",
  Overdue: "متأخر",
  Completed: "مكتمل",
  Cancelled: "ملغي",
};
export type EntityType =
  | "Case"
  | "Session"
  | "ApplicationUser"
  | "Client"
  | "CompanyEmployee"
  | "Task"
  | "Office"
  | "Folder";

// ===== Common helpers =====

export type ISODateTimeString = string;

export interface LabeledValue {
  value: string;
  label: string;
}



// ===== GET /api/Task query params =====
export interface GetTasksQuery {
  statuses?: TaskStatus[];          // array[string]
  priority?: TaskPriority;          // string
  userId?: number;                 // int64

  dueDateFrom?: ISODateTimeString; // date-time string
  dueDateTo?: ISODateTimeString;   // date-time string
  createdFrom?: ISODateTimeString; // date-time string
  createdTo?: ISODateTimeString;   // date-time string

  entityId?: number;               // int64
  entityType?: EntityType;         // string enum
  assignedToMe?: boolean;

  pageNumber?: number;             // int32
  pageSize?: number;               // int32
  search?: string;
  sort?: string;

  isDeleted?: boolean;
}
// ===== Response types (based on the Example Value shown) =====
export interface TaskDto {
  id: number;
  title: string;
  description: string;
  dueDate: ISODateTimeString;

  priority: LabeledValue;
  status: LabeledValue;

  entityId: number;
  entityType: EntityType;

  recurringEvery: number;
  isAssignedToMe: boolean;

  createdAt: ISODateTimeString;
}
export interface PagedResult<T> {
  pageNumber: number;
  pageSize: number;
  count: number;
  data: T[];
}
export interface ApiResponse<T> {
  succeeded: boolean;
  message: string;
  data: T;
}
// The concrete response for GET /api/Task
export type GetTasksResponse = ApiResponse<PagedResult<TaskDto>>;



// ===== POST /api/Task =====
// Request body (from the example value in your screenshot)
export interface CreateTaskRequest {
  title: string;
  description: string;
  dueDate: ISODateTimeString;

  priority: TaskPriority; // e.g. "Low"
  status: TaskStatus;     // e.g. "Pending"

  entityId: number;       // int64 in query elsewhere; treat as number in TS
  entityType: EntityType;

  recurringEvery: number;
  users: number[];
}
// Response example shows: { succeeded: true, message: "string", data: 0 }
export type CreateTaskResponse = ApiResponse<number>; // data = created task id (or 0 in example)



// ===== GET /api/Task/{id} =====
export interface GetTaskByIdPathParams {
  id: number; // int64
}
// From the example value in your screenshot (note: includes users objects)
export interface TaskUserDto {
  id: number;
  name: string;
  imageURL: string;
}
export interface TaskDetailsDto {
  id: number;
  title: string;
  description: string;
  dueDate: ISODateTimeString;

  priority: LabeledValue;
  status: LabeledValue;

  entityId: number;
  entityType: EntityType;

  recurringEvery: number;
  isAssignedToMe: boolean;

  createdAt: ISODateTimeString;

  users: TaskUserDto[];
}
export type GetTaskByIdResponse = ApiResponse<TaskDetailsDto>;


// ===== PUT /api/Task/{id} =====
export interface UpdateTaskPathParams {
  id: number; // int64
}
// Request body example matches POST (users are ids)
export interface UpdateTaskRequest {
  title: string;
  description: string;
  dueDate: ISODateTimeString;

  priority: TaskPriority;
  status: TaskStatus;

  entityId: number;
  entityType: EntityType;

  recurringEvery: number;

  users: number[]; // assigned user ids
}
// Response example: data: true
export type UpdateTaskResponse = ApiResponse<boolean>;



// ===== PATCH /api/Task/status/{id} =====
export interface PatchTaskStatusPathParams {
  id: number; // int64
}
// Request body example is just a JSON string: "Pending"
export type PatchTaskStatusRequest = TaskStatus;
// Response example: data: true
export type PatchTaskStatusResponse = ApiResponse<boolean>;



// ===== DELETE /api/Task/soft/{id} =====
export interface SoftDeleteTaskPathParams {
  id: number; // int64
}
// Response example: data: true
export type SoftDeleteTaskResponse = ApiResponse<boolean>;


// ===== GET /api/Task/dashboard =====
export interface TaskDashboardDto {
  totalTasks: number;
  completedTasks: number;
  uncompletedTasks: number;
  overdueTasks: number;
}
export type GetTaskDashboardResponse = ApiResponse<TaskDashboardDto>;