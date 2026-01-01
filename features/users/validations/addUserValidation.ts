import { z } from "zod";

export const addUserSchema = z.object({
  name: z.string().min(2, "الاسم يجب أن يحتوي على 2 أحرف على الأقل"),
  email: z.string().email("صيغة بريد إلكتروني غير صحيحة"),
  phoneNumber: z.string().regex(/^\+?[0-9]{8,15}$/i, "رقم هاتف غير صحيح"),
  password: z.string().min(6, "كلمة المرور يجب ألا تقل عن 6 أحرف"),
  permissionId: z.number().min(0, "يجب اختيار صلاحية"),
});

export type AddUserFormData = z.infer<typeof addUserSchema>;
