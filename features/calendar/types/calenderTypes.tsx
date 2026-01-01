// ===== shared =====
export type ISODateTimeString = string;

export type EntityType =
  | "Case"
  | "Session"
  | "ApplicationUser"
  | "Client"
  | "CompanyEmployee"
  | "Task"
  | "Office"
  | "Folder";

export interface ApiResponse<T> {
  succeeded: boolean;
  message: string;
  data: T;
}

// ===== GET /api/Calendar/month =====

export interface GetCalendarMonthQuery {
  startDate?: ISODateTimeString; // date-time (query)
  endDate?: ISODateTimeString;   // date-time (query)
  entityType?: EntityType;       // string enum (query)
}

export interface CalendarMonthItemDto {
  date: ISODateTimeString; // example shows full datetime string
  count: number;
}

export type GetCalendarMonthResponse = ApiResponse<CalendarMonthItemDto[]>;


// ===== GET /api/Calendar/day =====

export interface GetCalendarDayQuery {
  startDate?: ISODateTimeString; // date-time (query)
  endDate?: ISODateTimeString;   // date-time (query)
  entityType?: EntityType;       // string enum (query)
}

export interface CalendarDayItemDto {
  name: string;
  entityId: number;
  entityType: EntityType; // example shows "Case"
  status: string;         // swagger shows just "string" (no enum shown)
}

export type GetCalendarDayResponse = ApiResponse<CalendarDayItemDto[]>;



