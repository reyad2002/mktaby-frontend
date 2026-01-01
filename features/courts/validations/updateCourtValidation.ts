import { z } from "zod";

export const updateCourtSchema = z.object({
  name: z.string().min(1, "اسم المحكمة مطلوب"),
  city: z.string().min(1, "المدينة مطلوبة"),
  address: z.string().min(1, "العنوان مطلوب"),
  phoneNumber: z.string().min(1, "رقم الهاتف مطلوب"),
  type: z.string().min(1, "نوع المحكمة مطلوب"),
});

export type UpdateCourtFormData = z.infer<typeof updateCourtSchema>;
