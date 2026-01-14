import { ClientRoleValues } from "../../clients/types/clientTypes";
// ===========================
// Common API response type
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
// Case Types (GET /Case/casetypes)
// ===========================

export type CaseTypeValues =
  | "Criminal"
  | "Civil"
  | "Commercial"
  | "Labor"
  | "PersonalStatus"
  | "Family"
  | "Inheritance"
  | "RealEstate"
  | "Administrative"
  | "Tax"
  | "Traffic"
  | "Bankruptcy"
  | "Insurance"
  | "Customs"
  | "Environmental"
  | "Cybercrime"
  | "IntellectualProperty"
  | "ContractDispute"
  | "Financial"
  | "AntiCorruption";

// ===========================
// Case Status (GET /Case/casestatus)
// ===========================

export type CaseStatusValues =
  | "Active"
  | "UnderReview"
  | "UnderInvestigation"
  | "ReadyForHearing"
  | "InCourt"
  | "Postponed"
  | "ReservedForJudgment"
  | "Completed"
  | "Closed"
  | "Rejected"
  | "Cancelled"
  | "Settled"
  | "Suspended"
  | "Archived"
  | "Appealed"
  | "Executed";

export type CaseStatusOption = SelectOption<CaseStatusValues>;

export type GetCaseStatusResponse = CaseStatusOption[];

// ===========================
// Case (POST /Case)
// ===========================

export type CaseTypeOption = SelectOption<CaseTypeValues>;

export type GetCaseTypesResponse = CaseTypeOption[];

export type CreateCaseRequest = {
  caseNumber: string;
  name: string;
  caseType: CaseTypeValues;

  caseStatus: CaseStatusValues;
  clientRole: ClientRoleValues;

  isPrivate: boolean;

  clientId: number;
  opponent: string;
  courtId: number;

  notes?: string | null;

  openedAt: string; // ISO string
  closedAt?: string | null;

  caseLawyers: number[];
};

export type CreateCaseResponse = ApiResponse<number>; // example returns 0 (likely created id)

// ===========================
// GET /Case query params
// ===========================

export type GetCasesQuery = {
  CaseStatus?: CaseStatusValues;
  CaseType?: CaseTypeValues;

  LawyerId?: number;
  ClientId?: number;
  CourtId?: number;

  IsArchived?: boolean;

  OpenedFrom?: string; // date-time string
  OpenedTo?: string; // date-time string
  ClosedFrom?: string; // date-time string
  ClosedTo?: string; // date-time string

  AssignedToMe?: boolean;

  PageNumber?: number;
  PageSize?: number;

  Search?: string;
  Sort?: string;

  IsDeleted?: boolean;
};

// ===========================
// GET /Case response item + response
// ===========================

export type CaseListItem = {
  id: number;
  caseNumber: string;
  name: string;

  caseType: SelectOption<CaseTypeValues>;
  caseStatus: SelectOption<CaseStatusValues>;

  clientId: number;
  clientName: string;

  courtId: number;
  courtName: string;

  openedAt: string; // ISO date-time
  createdAt: string; // ISO date-time

  isAssignedToMe: boolean;
  isPrivate: boolean;
};

export type GetCasesResponse = ApiResponse<PaginatedResponse<CaseListItem>>;

// ===========================
// GET /Case/{id} types
// ===========================

export type CaseLawyer = {
  id: number;
  name: string;
};

export type CaseDetails = {
  id: number;
  caseNumber: string;
  name: string;

  caseType: SelectOption<CaseTypeValues>;
  caseStatus: SelectOption<CaseStatusValues>;
  clientRole: SelectOption<ClientRoleValues>;

  clientId: number;
  clientName: string;

  opponent: string;

  courtId: number;
  courtName: string;

  openedAt: string; // ISO date-time
  closedAt?: string | null; // ISO date-time (nullable)

  isPrivate: boolean;
  notes?: string | null;

  caseLawyers: CaseLawyer[];
};

export type GetCaseByIdResponse = ApiResponse<CaseDetails>;

// ===========================
// PUT /Case/{id} types
// ===========================

export type UpdateCaseRequest = {
  caseNumber: string;
  name: string;

  caseType: CaseTypeValues;
  caseStatus: CaseStatusValues;
  clientRole: ClientRoleValues;

  isPrivate: boolean;

  clientId: number;
  opponent: string;
  courtId: number;

  notes?: string | null;

  openedAt: string; // ISO date-time
  closedAt?: string | null; // ISO date-time

  caseLawyers: number[]; // lawyer ids
};

export type UpdateCaseResponse = ApiResponse<boolean>;

// ===========================
// GET /Case/statistics/{id} types
// ===========================

export type CaseStatistics = {
  nextSessionType: string;
  nextSessionDate: string; // ISO date-time
  sessionsCount: number;
  completedSessions: number;
  openedSessions: number;
  documentsCount: number;
};

export type GetCaseStatisticsResponse = ApiResponse<CaseStatistics>;

// DELETE /Case/soft/{id}
export type SoftDeleteCaseResponse = ApiResponse<boolean>;

// DELETE /Case/hard/{id}
export type HardDeleteCaseResponse = ApiResponse<boolean>;

// POST /Case/restore/{id}
export type RestoreCaseResponse = ApiResponse<boolean>;

// PATCH /Case/{id}/archive
export type ArchiveCaseResponse = ApiResponse<boolean>;

// PATCH /Case/{id}/unarchive
export type UnarchiveCaseResponse = ApiResponse<boolean>;

// ===========================
// GET /Case/dropdown types
// ===========================

export type CaseDropdownQuery = {
  PageNumber?: number;
  PageSize?: number;
  Search?: string;
  Sort?: string;
  IsDeleted?: boolean;
};

export type CaseDropdownItem = {
  id: number;
  name: string;
  caseNumber: string;
  clientName: string;
};

// This endpoint returns pagination object directly (not wrapped)
export type GetCaseDropdownResponse = PaginatedResponse<CaseDropdownItem>;

// ===========================
// GET /Case/resources/{id} types (full)
// ===========================

export type CaseResourcesQuery = {
  // path param
  id: number | string;

  // query params
  PageNumber?: number;
  PageSize?: number;
  Search?: string;
  Sort?: string;
  IsDeleted?: boolean;
};

export type CaseResource = {
  id: number;
  name: string;
  type: string;
  contentType: string;
  size: number;

  userId: number;
  userFullName: string;
  userImageURL: string; // note: Swagger shows userImageURL (capital URL)

  createdAt: string; // ISO date-time
};

export type GetCaseResourcesResponse = ApiResponse<
  PaginatedResponse<CaseResource>
>;


// ===========================
// Case Total Finance Response (GET /Finance/cases)
// ===========================
export interface CaseTotalFinance {
  caseId: number;
  name: string;
  caseNumber: string;
  clientId: number;
  clientName: string;
  fees: number;
  paid: number;
  remaining: number;
  expenses: number;
}
export type GetCaseTotalFinanceResponse = ApiResponse<PaginatedResponse<CaseTotalFinance>>;