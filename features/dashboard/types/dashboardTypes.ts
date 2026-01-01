// Types for dashboard

export interface DashboardData {
  totalCases: number;
  activeCases: number;
  totalTasks: number;
  totalClients: number;
  todaySessions: number;
  thisWeekSessions: number;
}

export interface DashboardResponse {
  succeeded: boolean;
  message: string;
  data: DashboardData;
}
