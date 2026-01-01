import { z } from "zod";

export const registerSchema = z
  .object({
    officeName: z
      .string()
      .min(2, "اسم المكتب يجب أن يحتوي على 2 أحرف على الأقل"),
    fullName: z
      .string()
      .min(2, "الاسم الكامل يجب أن يحتوي على 2 أحرف على الأقل"),
    email: z.string().email("صيغة بريد إلكتروني غير صحيحة"),
    phoneNumber: z.string().regex(/^\+?[0-9]{8,15}$/i, "رقم هاتف غير صحيح"),
    password: z.string().min(6, "كلمة المرور يجب ألا تقل عن 6 أحرف"),
    confirmPassword: z
      .string()
      .min(6, "تأكيد كلمة المرور يجب ألا يقل عن 6 أحرف"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "كلمتا المرور غير متطابقتين",
    path: ["confirmPassword"],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;
