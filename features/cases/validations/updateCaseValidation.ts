import { z } from "zod";

export const updateCaseSchema = z.object({
  caseNumber: z.string().min(1, "رقم القضية مطلوب"),
  name: z.string().min(2, "اسم القضية يجب أن يحتوي على حرفين على الأقل"),
  caseType: z.string().min(1, "نوع القضية مطلوب"),
  caseStatus: z.string().min(1, "حالة القضية مطلوبة"),
  clientRole: z.string().min(1, "صفة العميل مطلوبة"),
  isPrivate: z.boolean(),
  clientId: z.number({ message: "العميل مطلوب" }).min(1, "العميل مطلوب"),
  opponent: z.string().min(2, "اسم الخصم يجب أن يحتوي على حرفين على الأقل"),
  courtId: z.number({ message: "المحكمة مطلوبة" }).min(1, "المحكمة مطلوبة"),
  notes: z.string().optional().nullable(),
  openedAt: z.string().min(1, "تاريخ الفتح مطلوب"),
  closedAt: z.string().optional().nullable(),
  caseLawyers: z.array(z.number()).min(1, "يجب اختيار محامي واحد على الأقل"),
});

export type UpdateCaseFormData = z.infer<typeof updateCaseSchema>;
