import * as SessionPaths from "../PATHES";
import type * as SessionTypes from "../types/sessionsTypes";
import apiClient from "../../../lib/apiClient";

// ===========================
// GET /Session
// ===========================
export async function fetchSessionsList(
  params: SessionTypes.GetSessionsQuery
): Promise<SessionTypes.GetSessionsResponse> {
  const response = await apiClient.get<SessionTypes.GetSessionsResponse>(
    SessionPaths.SESSIONS_LIST_PATH,
    { params }
  );
  return response.data;
}
// ===========================
// POST /Session
// ===========================
export async function createSession(
  payload: SessionTypes.CreateSessionRequest
): Promise<SessionTypes.SessionListItem> {
  const response = await apiClient.post<SessionTypes.SessionListItem>(
    SessionPaths.ADD_SESSION_PATH,
    payload
  );
  return response.data;
}
// Additional API functions (e.g., GET by ID, UPDATE, DELETE) can be added here following the same pattern.
// ===========================
// GET /Session/:id
// ===========================
export async function fetchSessionById(
  id: number | string
): Promise<SessionTypes.SessionDetails> {
  const response = await apiClient.get<SessionTypes.GetSessionByIdResponse>(
    SessionPaths.GET_SESSION_BY_ID_PATH(id)
  );
  // API returns ApiResponse<T>, unwrap the session details
  return response.data.data;
}
// ===========================
// PUT /Session/:id
// ===========================
export async function updateSession(
  id: number | string,
  payload: SessionTypes.CreateSessionRequest
): Promise<SessionTypes.SessionListItem> {
  const response = await apiClient.put<SessionTypes.SessionListItem>(
    SessionPaths.UPDATE_SESSION_PATH(id),
    payload
  );
  return response.data;
}
// ===========================
// DELETE /Session/soft/:id
// ===========================
export async function softDeleteSession(id: number | string): Promise<void> {
  await apiClient.delete(SessionPaths.SOFT_DELETE_SESSION_PATH(id));
}
// ===========================
// GET /Session/sessiontypes
// ===========================
export async function fetchSessionTypes(): Promise<
  SessionTypes.SelectOption<SessionTypes.SessionTypeValue>[]
> {
  const response = await apiClient.get<
    SessionTypes.SelectOption<SessionTypes.SessionTypeValue>[]
  >(SessionPaths.SESSION_TYPES_PATH);
  return response.data;
}
// ===========================
// GET /Session/sessionstatus
// ===========================
export async function fetchSessionStatuses(): Promise<
  SessionTypes.SelectOption<SessionTypes.SessionStatusValue>[]
> {
  const response = await apiClient.get<
    SessionTypes.SelectOption<SessionTypes.SessionStatusValue>[]
  >(SessionPaths.SESSION_STATUS_PATH);
  return response.data;
}
