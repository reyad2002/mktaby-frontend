"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Building2, MapPin, Phone, Map } from "lucide-react";
import toast from "react-hot-toast";

import { createCourtApi, getCourtTypesApi } from "../apis/courtsApis";
import {
  addCourtSchema,
  type AddCourtFormData,
} from "../validations/addCourtValidation";

interface AddCourtFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function AddCourtForm({
  onSuccess,
  onCancel,
}: AddCourtFormProps) {
  const queryClient = useQueryClient();

  // Fetch court types
  const { data: courtTypes = [] } = useQuery({
    queryKey: ["courtTypes"],
    queryFn: getCourtTypesApi,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AddCourtFormData>({
    resolver: zodResolver(addCourtSchema),
    defaultValues: {
      name: "",
      city: "",
      address: "",
      phoneNumber: "",
      type: "",
    },
  });

  const mutation = useMutation({
    mutationFn: createCourtApi,
    onSuccess: (response) => {
      if (response?.succeeded) {
        toast.success(response.message || "تم إضافة المحكمة بنجاح");
        queryClient.invalidateQueries({ queryKey: ["courts"] });
        reset();
        onSuccess?.();
      } else {
        toast.error(response?.message || "تعذر إضافة المحكمة");
      }
    },
    onError: (error: unknown) => {
      const err = error as {
        response?: {
          data?: { message?: string; errors?: Record<string, string[]> };
        };
      };
      console.error("Add court error:", err?.response?.data);

      if (err?.response?.data?.errors) {
        const errorMessages = Object.values(err.response.data.errors).flat();
        errorMessages.forEach((msg) => toast.error(msg));
      } else {
        toast.error(
          err?.response?.data?.message || "حدث خطأ أثناء إضافة المحكمة"
        );
      }
    },
  });

  const onSubmit = (data: AddCourtFormData) => {
    mutation.mutate(data);
  };

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
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
        >
          {mutation.isPending && <Loader2 className="animate-spin" size={16} />}
          {mutation.isPending ? "جاري الإضافة..." : "إضافة"}
        </button>
      </div>
    </form>
  );
}
