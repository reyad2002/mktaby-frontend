import { z } from "zod";

export const updateProfileSchema = z.object({
  name: z
    .string()
    .min(1, "الاسم مطلوب")
    .min(3, "الاسم يجب أن يكون 3 أحرف على الأقل"),
  email: z
    .string()
    .min(1, "البريد الإلكتروني مطلوب")
    .email("البريد الإلكتروني غير صحيح"),
  phoneNumber: z
    .string()
    .min(1, "رقم الهاتف مطلوب")
    .regex(/^[0-9]{11}$/, "رقم الهاتف يجب أن يكون 11 رقم"),
});

export type UpdateProfileFormData = z.infer<typeof updateProfileSchema>;
