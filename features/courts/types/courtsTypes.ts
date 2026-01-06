// ===========================
// Common API response types
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

export type SelectOption = {
  value: string;
  label: string;
};
export type Params  = {
  pageNumber?: number;
  pageSize?: number;
  search?: string;
  sort?: string;
  isDeleted?: boolean;
}
// ===========================
// COURTS GET types 
// ===========================

export type CourtsResource = {
  id: number;
  name: string;
  city: string;
  address: string;
  phoneNumber: string;
  type: SelectOption;
};

// GET /Courts response
export type GetCourtsResponse = ApiResponse<PaginatedResponse<CourtsResource>>;


// ===========================
// Court types (POST /Court)
// ===========================

export type CourtType = "General" | string;

export type CreateCourtRequest = {
  name: string;
  city: string;
  address: string;
  phoneNumber: string;
  type: CourtType;
};

export type CreateCourtResponse = ApiResponse<number>; // returns created id (example: 1)

//  PUT /Court/{id}
export type UpdateCourtRequest = CreateCourtRequest;
export type UpdateCourtResponse = ApiResponse<boolean>;

// ===========================
// Court Dropdown (GET /Court/dropdown)
// ===========================

export type CourtDropdownItem = {
  id: number;
  name: string;
};

export type CourtDropdownQuery = {
  PageNumber?: number;
  PageSize?: number;
  Search?: string;
  Sort?: string;
  IsDeleted?: boolean;
};

export type GetCourtDropdownResponse = PaginatedResponse<CourtDropdownItem>;


// ===========================
// Court types (GET /Court/{id})
// ===========================

export type Court = {
  id: number;
  name: string;
  city: string;
  address: string;
  phoneNumber: string;
  type: SelectOption;
};

export type GetCourtByIdResponse = ApiResponse<Court>;

// ===========================
// Court Soft Delete/Restore types
// ===========================
export type SoftDeleteCourtResponse = ApiResponse<boolean>;
// ===========================
// Court Hard Delete/Restore types
// ===========================
export type HardDeleteCourtResponse = ApiResponse<boolean>;
// ===========================
// Court Restore types
// ===========================
export type RestoreCourtResponse = ApiResponse<boolean>;


// ===========================
// Court Types (GET /Court/courtTypes)
// ===========================
export type SelectOptionCourtsType<TValue extends string = string> = {
  value: TValue;
  label: string;
};

export type CourtTypeValue =
  | "General"
  | "Criminal"
  | "Civil"
  | "Commercial"
  | "Labor"
  | "PersonalStatus"
  | "Family"
  | "Traffic"
  | "Administrative"
  | "Execution"
  | "Appeals"
  | "Supreme"
  | "Juvenile"
  | "Customs"
  | "Tax"
  | "Environmental"
  | "AntiCorruption"
  | "Bankruptcy"
  | "ConsumerProtection";

export type CourtTypeOption = SelectOptionCourtsType<CourtTypeValue>;

export type GetCourtTypesResponse = CourtTypeOption[];

