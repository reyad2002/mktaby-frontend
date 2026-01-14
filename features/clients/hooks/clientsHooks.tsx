import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  fetchClients,
  softDeleteClient,
  hardDeleteClient,
  restoreClient,
  addClient,
  updateClient,
  getClientById,
  getClientFinance,
  getAllClientsFinance,
} from "@/features/clients/apis/clientsApi";
import type { ClientsQueryParams } from "@/features/clients/types/clientTypes";

// ===========================
export function useClients(filters: ClientsQueryParams) {
  return useQuery({
    queryKey: ["clients", filters],
    queryFn: () => fetchClients(filters),
    staleTime: 10_000,
  });
}
// ===========================

export function useAddClient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (clientData: Parameters<typeof addClient>[0]) =>
      addClient(clientData),
    onSuccess: (response) => {
      if (response?.succeeded) {
        toast.success(response.message || "تم إضافة العميل بنجاح");
        queryClient.invalidateQueries({ queryKey: ["clients"] });
      } else {
        toast.error(response?.message || "تعذر إضافة العميل");
      }
    },
  });
}
// ===========================
export function useUpdateClient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      clientData,
    }: {
      id: number;
      clientData: Parameters<typeof updateClient>[1];
    }) => updateClient(id, clientData),
    onSuccess: (response) => {
      if (response?.succeeded) {
        toast.success(response.message || "تم تحديث العميل بنجاح");
        queryClient.invalidateQueries({ queryKey: ["clients"] });
      } else {
        toast.error(response?.message || "تعذر تحديث العميل");
      }
    },
  });
}
// ===========================
export function useClientById(id: number, enabled = true) {
  return useQuery({
    queryKey: ["client", id],
    queryFn: () => getClientById(id),
    enabled: !!id && enabled,
  });
}
// ===========================

export function useSoftDeleteClient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => softDeleteClient(id),
    onSuccess: () => {
      toast.success("تم حذف العميل بنجاح");
      queryClient.invalidateQueries({ queryKey: ["clients"] });
    },
  });
}
// ===========================

export function useHardDeleteClient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => hardDeleteClient(id),
    onSuccess: () => {
      toast.success("تم الحذف النهائي للعميل بنجاح");
      queryClient.invalidateQueries({ queryKey: ["clients"] });
    },
  });
}
// ===========================

export function useRestoreClient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => restoreClient(id),
    onSuccess: () => {
      toast.success("تم استعادة العميل بنجاح");
      queryClient.invalidateQueries({ queryKey: ["clients"] });
    },
  });
}

/**
 * Fetch finance summary for a specific client
 */
export function useClientFinance(clientId: number, enabled = true) {
  return useQuery({
    queryKey: ["clientFinance", clientId],
    queryFn: () => getClientFinance(clientId),
    enabled: !!clientId && enabled,
    staleTime: 60_000,
  });
}

/**
 * Fetch finance summary for all clients
 */
export function useAllClientsFinance() {
  return useQuery({
    queryKey: ["allClientsFinance"],
    queryFn: () => getAllClientsFinance(),
    staleTime: 60_000,
  });
}
