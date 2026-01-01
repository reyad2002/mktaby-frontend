import { z } from "zod";

export const addCourtSchema = z.object({
  name: z.string().min(1, "اسم المحكمة مطلوب"),
  city: z.string().min(1, "المدينة مطلوبة"),
  address: z.string().min(1, "العنوان مطلوب"),
  phoneNumber: z.string().min(1, "رقم الهاتف مطلوب"),
  type: z.string().min(1, "نوع المحكمة مطلوب"),
});

export type AddCourtFormData = z.infer<typeof addCourtSchema>;
