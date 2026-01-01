"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Building2, MapPin, Phone, Map } from "lucide-react";
import toast from "react-hot-toast";

import {
  updateCourtApi,
  getCourtByIdApi,
  getCourtTypesApi,
} from "../apis/courtsApis";
import {
  updateCourtSchema,
  type UpdateCourtFormData,
} from "../validations/updateCourtValidation";

interface EditCourtFormProps {
  courtId: number;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function EditCourtForm({
  courtId,
  onSuccess,
  onCancel,
}: EditCourtFormProps) {
  const queryClient = useQueryClient();

  // Fetch court data
  const { data: courtData, isLoading: isLoadingCourt } = useQuery({
    queryKey: ["court", courtId],
    queryFn: () => getCourtByIdApi(courtId),
    enabled: !!courtId,
  });

  // Fetch court types
  const { data: courtTypes = [] } = useQuery({
    queryKey: ["courtTypes"],
    queryFn: getCourtTypesApi,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UpdateCourtFormData>({
    resolver: zodResolver(updateCourtSchema),
    values: courtData?.data
      ? {
          name: courtData.data.name,
          city: courtData.data.city,
          address: courtData.data.address,
          phoneNumber: courtData.data.phoneNumber,
          type: courtData.data.type.value,
        }
      : undefined,
  });

  const mutation = useMutation({
    mutationFn: (data: UpdateCourtFormData) => updateCourtApi(courtId, data),
    onSuccess: (response) => {
      if (response?.succeeded) {
        toast.success(response.message || "تم تحديث المحكمة بنجاح");
        queryClient.invalidateQueries({ queryKey: ["courts"] });
        queryClient.invalidateQueries({ queryKey: ["court", courtId] });
        onSuccess?.();
      } else {
        toast.error(response?.message || "تعذر تحديث المحكمة");
      }
    },
    onError: (error: unknown) => {
      const err = error as {
        response?: {
          data?: { message?: string; errors?: Record<string, string[]> };
        };
      };
      console.error("Update court error:", err?.response?.data);

      if (err?.response?.data?.errors) {
        const errorMessages = Object.values(err.response.data.errors).flat();
        errorMessages.forEach((msg) => toast.error(msg));
      } else {
        toast.error(
          err?.response?.data?.message || "حدث خطأ أثناء تحديث المحكمة"
        );
      }
    },
  });

  const onSubmit = (data: UpdateCourtFormData) => {
    mutation.mutate(data);
  };

  if (isLoadingCourt) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Court Name */}
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          اسم المحكمة
        </label>
        <div className="relative">
          <input
            type="text"
            id="name"
            {...register("name")}
            className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.name ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="اسم المحكمة"
          />
          <Building2
            className="absolute left-3 top-2.5 text-gray-400"
            size={20}
          />
        </div>
        {errors.name && (
          <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
        )}
      </div>

      {/* Court Type */}
      <div>
        <label
          htmlFor="type"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          نوع المحكمة
        </label>
        <div className="relative">
          <select
            id="type"
            {...register("type")}
            className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.type ? "border-red-500" : "border-gray-300"
            }`}
          >
            <option value="">اختر نوع المحكمة</option>
            {courtTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
          <Building2
            className="absolute left-3 top-2.5 text-gray-400"
            size={20}
          />
        </div>
        {errors.type && (
          <p className="text-red-500 text-sm mt-1">{errors.type.message}</p>
        )}
      </div>

      {/* City */}
      <div>
        <label
          htmlFor="city"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          المدينة
        </label>
        <div className="relative">
          <input
            type="text"
            id="city"
            {...register("city")}
            className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.city ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="المدينة"
          />
          <Map className="absolute left-3 top-2.5 text-gray-400" size={20} />
        </div>
        {errors.city && (
          <p className="text-red-500 text-sm mt-1">{errors.city.message}</p>
        )}
      </div>

      {/* Address */}
      <div>
        <label
          htmlFor="address"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          العنوان
        </label>
        <div className="relative">
          <textarea
            id="address"
            {...register("address")}
            rows={3}
            className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.address ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="العنوان الكامل"
          />
          <MapPin className="absolute left-3 top-2.5 text-gray-400" size={20} />
        </div>
        {errors.address && (
          <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>
        )}
      </div>

      {/* Phone Number */}
      <div>
        <label
          htmlFor="phoneNumber"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          رقم الهاتف
        </label>
        <div className="relative">
          <input
            type="text"
            id="phoneNumber"
            {...register("phoneNumber")}
            className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.phoneNumber ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="رقم الهاتف"
          />
          <Phone className="absolute left-3 top-2.5 text-gray-400" size={20} />
        </div>
        {errors.phoneNumber && (
          <p className="text-red-500 text-sm mt-1">
            {errors.phoneNumber.message}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={mutation.isPending}
          className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          إلغاء
        </button>
        <button
          type="submit"
          disabled={mutation.isPending}
          className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 disabled:opacity-50 flex items-center gap-2"
        >
          {mutation.isPending && <Loader2 className="animate-spin" size={16} />}
          {mutation.isPending ? "جاري التحديث..." : "تحديث"}
        </button>
      </div>
    </form>
  );
}
