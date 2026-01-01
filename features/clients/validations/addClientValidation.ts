import { z } from "zod";

export const addClientSchema = z.object({
  name: z.string().min(2, "اسم العميل يجب أن يحتوي على 2 أحرف على الأقل"),
  phoneNumber: z
    .string()
    .min(10, "رقم الهاتف يجب أن يحتوي على 10 أرقام على الأقل"),
  phoneCode: z.string().min(1, "كود الهاتف مطلوب"),
  email: z.string().email("البريد الإلكتروني غير صالح"),
  address: z.string().min(5, "العنوان يجب أن يحتوي على 5 أحرف على الأقل"),
  clientType: z.enum(["Individual", "Company"], {
    message: "نوع العميل مطلوب",
  }),
  imageURL: z.string().url("رابط الصورة غير صالح").optional().or(z.literal("")),
});

export type AddClientFormData = z.infer<typeof addClientSchema>;
