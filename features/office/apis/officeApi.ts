import apiClient from "@/lib/apiClient";
import { OFFICE_PATH } from "../PATHES";
import {
  OfficeResponse,
  OfficeResourceListResponse,
  GetOfficeResourcesParams,
  UpdateOfficeResponse,
  UpdateOfficePayload,
  SetOfficeLogoResponse,
} from "../types/officeTypes";
import { AxiosResponse } from "axios";

// GET /api/Office/resources
export const getOfficeResources = async (
  params: GetOfficeResourcesParams = {}
): Promise<OfficeResourceListResponse> => {
  const response: AxiosResponse<OfficeResourceListResponse> =
    await apiClient.get("/api/Office/resources", {
      params,
    });
  return response.data;
};

// PUT /api/Office
export const updateOffice = async (
  payload: UpdateOfficePayload
): Promise<UpdateOfficeResponse> => {
  const response: AxiosResponse<UpdateOfficeResponse> = await apiClient.put(
    "/api/Office",
    payload
  );
  return response.data;
};

// POST /api/Office/SetOfficeLogo
export const setOfficeLogo = async (
  imageFile: File
): Promise<SetOfficeLogoResponse> => {
  const formData = new FormData();
  formData.append("Image", imageFile);

  const response: AxiosResponse<SetOfficeLogoResponse> = await apiClient.post(
    "/api/Office/SetOfficeLogo",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return response.data;
};

// Fetch office data
export async function fetchOffice(): Promise<OfficeResponse> {
  const response = await apiClient.get<OfficeResponse>(OFFICE_PATH);
  return response.data;
}
