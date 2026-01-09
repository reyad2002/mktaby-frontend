import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getCourtsResourcesApi,
  softDeleteCourtApi,
  hardDeleteCourtApi,
  restoreCourtApi,
  createCourtApi,
  getCourtTypesApi,
  updateCourtApi,
  getCourtByIdApi,
} from "@/features/courts/apis/courtsApis";
import { Params, CreateCourtRequest } from "../types/courtsTypes";
export function useCourtsResources(params: Params) {
  return useQuery({
    queryKey: ["courts", params],
    queryFn: () => getCourtsResourcesApi(params),
    staleTime: 10_000,
  });
}
// ===========================

export function useSoftDeleteCourt() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => softDeleteCourtApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courts"] });
    },
  });
}
// ===========================
export function useHardDeleteCourt() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => hardDeleteCourtApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courts"] });
    },
  });
}
// ===========================
export function useRestoreCourt() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => restoreCourtApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courts"] });
    },
  });
}
// ===========================
export function useCreateCourts() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCourtRequest) => createCourtApi(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courts"] });
    },
  });
}
// ===========================
export function useCourtTypes() {
  return useQuery({
    queryKey: ["courtTypes"],
    queryFn: () => getCourtTypesApi(),
    staleTime: 10_000,
  });
}
// ===========================
export function useUpdateCourt(courtId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCourtRequest) => updateCourtApi(courtId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courts"] });
      queryClient.invalidateQueries({ queryKey: ["court", courtId] });
    },
  });
}
// ===========================
export function useCourtById(courtId: number) {
  return useQuery({
    queryKey: ["court", courtId],
    queryFn: () => getCourtByIdApi(courtId),
    enabled: !!courtId,
    staleTime: 10_000,
  });
}
// ===========================
// ===========================
// ===========================
