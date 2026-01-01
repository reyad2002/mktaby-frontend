"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, User, Mail, Phone, MapPin, Building2 } from "lucide-react";
import toast from "react-hot-toast";

import { addClient } from "../apis/clientsApi";
import {
  addClientSchema,
  type AddClientFormData,
} from "../validations/addClientValidation";

interface AddClientFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function AddClientForm({
  onSuccess,
  onCancel,
}: AddClientFormProps) {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AddClientFormData>({
    resolver: zodResolver(addClientSchema),
    defaultValues: {
      name: "",
      phoneNumber: "",
      phoneCode: "+20",
      email: "",
      address: "",
      clientType: "Individual",
      imageURL: "",
    },
  });

  const mutation = useMutation({
    mutationFn: addClient,
    onSuccess: (response) => {
      if (response?.succeeded) {
        toast.success(response.message || "تم إضافة العميل بنجاح");
        queryClient.invalidateQueries({ queryKey: ["clients"] });
        reset();
        onSuccess?.();
      } else {
        toast.error(response?.message || "تعذر إضافة العميل");
      }
    },
    onError: (error: unknown) => {
      const err = error as {
        response?: {
          data?: { message?: string; errors?: Record<string, string[]> };
        };
      };
      console.error("Add client error:", err?.response?.data);

      if (err?.response?.data?.errors) {
        const errorMessages = Object.values(err.response.data.errors).flat();
        errorMessages.forEach((msg) => toast.error(msg));
      } else {
        toast.error(
          err?.response?.data?.message || "حدث خطأ أثناء إضافة العميل"
        );
      }
    },
  });

  const onSubmit = (data: AddClientFormData) => {
    mutation.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Client Name */}
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          اسم العميل
        </label>
        <div className="relative">
          <input
            type="text"
            id="name"
            {...register("name")}
            className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.name ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="اسم العميل"
          />
          <User className="absolute left-3 top-2.5 text-gray-400" size={20} />
        </div>
        {errors.name && (
          <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
        )}
      </div>

      {/* Client Type */}
      <div>
        <label
          htmlFor="clientType"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          نوع العميل
        </label>
        <div className="relative">
          <select
            id="clientType"
            {...register("clientType")}
            className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.clientType ? "border-red-500" : "border-gray-300"
            }`}
          >
            <option value="Individual">فرد</option>
            <option value="Company">شركة</option>
          </select>
          <Building2
            className="absolute left-3 top-2.5 text-gray-400"
            size={20}
          />
        </div>
        {errors.clientType && (
          <p className="text-red-500 text-sm mt-1">
            {errors.clientType.message}
          </p>
        )}
      </div>

      {/* Phone Number and Code */}
      <div className="grid grid-cols-4 gap-3">
        <div className="col-span-1">
          <label
            htmlFor="phoneCode"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            كود الدولة
          </label>
          <input
            type="text"
            id="phoneCode"
            {...register("phoneCode")}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.phoneCode ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="+20"
          />
          {errors.phoneCode && (
            <p className="text-red-500 text-sm mt-1">
              {errors.phoneCode.message}
            </p>
          )}
        </div>
        <div className="col-span-3">
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
            <Phone
              className="absolute left-3 top-2.5 text-gray-400"
              size={20}
            />
          </div>
          {errors.phoneNumber && (
            <p className="text-red-500 text-sm mt-1">
              {errors.phoneNumber.message}
            </p>
          )}
        </div>
      </div>

      {/* Email */}
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          البريد الإلكتروني
        </label>
        <div className="relative">
          <input
            type="email"
            id="email"
            {...register("email")}
            className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.email ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="البريد الإلكتروني"
          />
          <Mail className="absolute left-3 top-2.5 text-gray-400" size={20} />
        </div>
        {errors.email && (
          <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
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
            placeholder="العنوان"
          />
          <MapPin className="absolute left-3 top-2.5 text-gray-400" size={20} />
        </div>
        {errors.address && (
          <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>
        )}
      </div>

      {/* Image URL (optional) */}
      <div>
        <label
          htmlFor="imageURL"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          رابط الصورة (اختياري)
        </label>
        <input
          type="url"
          id="imageURL"
          {...register("imageURL")}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.imageURL ? "border-red-500" : "border-gray-300"
          }`}
          placeholder="https://example.com/image.jpg"
        />
        {errors.imageURL && (
          <p className="text-red-500 text-sm mt-1">{errors.imageURL.message}</p>
        )}
      </div>

      {/* Buttons */}
      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={mutation.isPending}
          className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {mutation.isPending ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              جاري الإضافة...
            </>
          ) : (
            "إضافة عميل"
          )}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            إلغاء
          </button>
        )}
      </div>
    </form>
  );
}
