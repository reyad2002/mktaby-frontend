import * as calendarTypes from "../types/calenderTypes";
import apiClient from "../../../lib/apiClient";
import * as PATHES from "../PATHES";

export const getMonthEventsApi = async (
  queryParams: calendarTypes.GetCalendarMonthQuery
): Promise<calendarTypes.GetCalendarMonthResponse> => {
  const response = await apiClient.get<calendarTypes.GetCalendarMonthResponse>(
    PATHES.CALENDAR_MONTH_PATH,
    { params: queryParams }
  );
  return response.data;
};
export const getDayEventsApi = async (
  queryParams: calendarTypes.GetCalendarDayQuery
): Promise<calendarTypes.GetCalendarDayResponse> => {
  const response = await apiClient.get<calendarTypes.GetCalendarDayResponse>(
    PATHES.CALENDAR_DAY_PATH,
    { params: queryParams }
  );
  return response.data;
};
