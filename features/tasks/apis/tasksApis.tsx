import apiClient from "@/lib/apiClient";
import * as taskTypes from "../types/taskTypes";
import * as pathes from "../PATHES";

export const fetchTasksApi = async (params: taskTypes.GetTasksQuery) => {
  return apiClient.get<taskTypes.GetTasksResponse>(pathes.TASKS_LIST_PATH, { params });
};

export const fetchTaskByIdApi = async (taskId: number) => {
  return apiClient.get<taskTypes.GetTaskByIdResponse>(
    `${pathes.TASKS_LIST_PATH}/${taskId}`
  );
};

export const fetchTaskPrioritiesApi = async () => {
  return apiClient.get<taskTypes.TaskPriority[]>(pathes.TASK_PRIORITIES_PATH);
};

export const fetchTaskStatusesApi = async () => {
  return apiClient.get<taskTypes.TaskStatus[]>(pathes.TASK_STATUS_PATH);
};

export const addTaskApi = async (taskData: taskTypes.CreateTaskRequest) => {
  return apiClient.post<taskTypes.CreateTaskResponse>(
    pathes.ADD_TASK_PATH,
    taskData
  );
};

export const updateTaskApi = async (
  taskId: number,
  taskData: taskTypes.UpdateTaskRequest
) => {
  return apiClient.put<taskTypes.UpdateTaskResponse>(
    `${pathes.UPDATE_TASK_PATH(taskId)}`,
    taskData
  );
};

export const updateTaskStatusApi = async (
  taskId: number,
  statusData: taskTypes.PatchTaskStatusRequest
) => {
  return apiClient.patch<taskTypes.PatchTaskStatusResponse>(
    `${pathes.UPDATE_TASK_STATUS_PATH(taskId)}`,
    statusData
  );
};

export const softDeleteTaskApi = async (taskId: number) => {
  return apiClient.delete<taskTypes.SoftDeleteTaskResponse>(
    `${pathes.SOFT_DELETE_TASK_PATH(taskId)}`
  );
};
export const fetchTaskDashboardApi = async () => {
  return apiClient.get<taskTypes.TaskDashboardDto>(pathes.TASK_DASHBOARD_PATH);
};
