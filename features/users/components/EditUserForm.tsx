"use client";

import { useState, useEffect } from "react";
import { Loader2, Upload } from "lucide-react";
import Image from "next/image";
import {
  useUserById,
  useUpdateUser,
  useSetProfileImage,
} from "../hooks/usersHooks";
import { usePermissions } from "@/features/permissions/hooks/permissionsHooks";
import type { UpdateUserRequest } from "../types/userTypes";

interface EditUserFormProps {
  userId: number;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function EditUserForm({
  userId,
  onSuccess,
  onCancel,
}: EditUserFormProps) {
  const [formData, setFormData] = useState<UpdateUserRequest>({
    id: userId,
    name: "",
    email: "",
    phoneNumber: "",
    permissionId: 0,
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Fetch user details
  const { data: userResponse, isLoading: isLoadingUser } = useUserById(userId);

  // Fetch permissions
  const { data: permissionsData } = usePermissions({});

  const permissions = permissionsData?.data?.data ?? [];
  const user = userResponse?.data;

  // Initialize form data from user response
  useEffect(() => {
    if (user && !formData.name) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData({
        id: userId,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        permissionId: user.userPermissionId,
      });
      if (user.imageURL && !imagePreview) {
        setImagePreview(user.imageURL);
      }
    }
  }, [user, userId, formData.name, imagePreview]);

  const updateMutation = useUpdateUser();

  const imageMutation = useSetProfileImage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateMutation.mutateAsync(formData);
      if (selectedImage) {
        await imageMutation.mutateAsync({ id: userId, imageFile: selectedImage });
      }
      onSuccess?.();
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  if (isLoadingUser) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-8 h-8 animate-spin text-yellow-500" />
      </div>
    );
  }

  const isLoading = updateMutation.isPending || imageMutation.isPending;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Profile Image */}
      <div className="flex flex-col items-center gap-3">
        <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-gray-300">
          {imagePreview ? (
            <Image
              src={imagePreview}
              alt="Profile"
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">
              <Upload size={32} />
            </div>
          )}
        </div>
        <label className="cursor-pointer px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm transition-colors">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />
          تغيير الصورة
        </label>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          الاسم
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          البريد الإلكتروني
        </label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          رقم الهاتف
        </label>
        <input
          type="tel"
          value={formData.phoneNumber}
          onChange={(e) =>
            setFormData({ ...formData, phoneNumber: e.target.value })
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          الصلاحية
        </label>
        <select
          value={formData.permissionId}
          onChange={(e) =>
            setFormData({ ...formData, permissionId: Number(e.target.value) })
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
          required
        >
          <option value={0}>اختر الصلاحية</option>
          {permissions.map((permission) => (
            <option key={permission.id} value={permission.id}>
              {permission.name}
            </option>
          ))}
        </select>
      </div>

      {(updateMutation.isError || imageMutation.isError) && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          حدث خطأ أثناء تحديث البيانات. يرجى المحاولة مرة أخرى.
        </div>
      )}

      {updateMutation.isSuccess && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
          تم تحديث بيانات المستخدم بنجاح!
        </div>
      )}

      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
          حفظ التعديلات
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 transition-colors"
        >
          إلغاء
        </button>
      </div>
    </form>
  );
}
