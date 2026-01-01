// ===========================
// Shared/common types
// ===========================

export type ApiResponse<T> = {
  succeeded: boolean;
  message: string;
  data: T;
};

export type PaginatedResponse<TItem> = {
  pageNumber: number;
  pageSize: number;
  count: number;
  data: TItem[];
};

export type SelectOption<TValue extends string = string> = {
  value: TValue;
  label: string;
};

// ===========================
// Session enums (from Swagger "Available values")
// ===========================

export type SessionTypeValue =
  | "Preliminary"
  | "Hearing"
  | "Trial"
  | "Sentencing"
  | "Adjourned"
  | "Investigation"
  | "Appeal"
  | "Review"
  | "Execution"
  | "Mediation"
  | "Settlement"
  | "Pleading"
  | "ClosingArguments"
  | "ExpertReview"
  | "Administrative"
  | "Reconciliation";

export type SessionStatusValue =
  | "Scheduled"
  | "InProgress"
  | "Postponed"
  | "Cancelled"
  | "AwaitingDecision"
  | "Completed";

// ===========================
// GET /Session query params
// ===========================

export type GetSessionsQuery = {
  LawyerId?: number;
  ClientId?: number;
  CourtId?: number;
  CaseId?: number;

  SessionType?: SessionTypeValue;
  SessionStatus?: SessionStatusValue;

  SessionDateFrom?: string; // ISO date-time
  SessionDateTo?: string; // ISO date-time

  IsAssigned?: boolean;
  NextWeek?: boolean;

  PageNumber?: number;
  PageSize?: number;

  Search?: string;
  Sort?: string;

  IsDeleted?: boolean;
};

// ===========================
// GET /Session response item + response
// ===========================

export type SessionListItem = {
  id: number;
  sessionDate: string; // ISO date-time

  sessionType: SelectOption<SessionTypeValue>;
  sessionStatus: SelectOption<SessionStatusValue>;

  notes: string;
  result: string;

  caseId: number;
  caseName: string;
  caseNumber: string;

  courtId: number;
  court: string;

  isAssigned: boolean;

  createdAt: string; // ISO date-time

  nextSessionId: number;
  nextSessionDate: string; // ISO date-time

  prevSessionId: number;
  prevSessionDate: string; // ISO date-time
};

export type GetSessionsResponse = ApiResponse<
  PaginatedResponse<SessionListItem>
>;

// ===========================
// POST /Session types
// ===========================

export type CreateSessionRequest = {
  sessionDate: string; // ISO date-time
  sessionType: SessionTypeValue;
  sessionStatus: SessionStatusValue;

  caseId: number;
  courtId: number;

  notes: string;
  result: string;
};

export type CreateSessionResponse = ApiResponse<number>; // created session id (example: 0)

// ===========================
// GET /api/Session/{id}
// ===========================

export type SessionDetails = {
  id: number;

  sessionDate: string; // ISO date-time

  sessionType: SelectOption<SessionTypeValue>;
  sessionStatus: SelectOption<SessionStatusValue>;

  notes: string;
  result: string;

  caseId: number;
  caseName: string;
  caseNumber: string;

  courtId: number;
  court: string;

  isAssigned: boolean;

  createdAt: string; // ISO date-time

  nextSessionId: number;
  nextSessionDate: string | null;

  prevSessionId: number;
  prevSessionDate: string | null;
};

export type GetSessionByIdResponse = ApiResponse<SessionDetails>;

// ===========================
// PUT /Session/{id} types
// ===========================

export type UpdateSessionRequest = {
  sessionDate: string; // ISO date-time
  sessionType: SessionTypeValue;
  sessionStatus: SessionStatusValue;

  caseId: number;
  courtId: number;

  notes: string;
  result: string;
};

export type UpdateSessionResponse = ApiResponse<boolean>; // example: data: true

// ===========================
// DELETE /api/Session/soft/{id}
// ===========================

export type DeleteSessionSoftParams = {
  id: number; // path parameter
};

export type DeleteSessionSoftResponse = ApiResponse<boolean>;
