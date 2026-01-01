import apiClient from "@/lib/apiClient";
import { DASHBOARD_DATA_PATH } from "../PATHES";
import { DashboardResponse } from "../types/dashboardTypes";

// Fetch dashboard data
export async function fetchDashboardData(): Promise<DashboardResponse> {
  const response = await apiClient.get<DashboardResponse>(DASHBOARD_DATA_PATH);
  return response.data;
}
