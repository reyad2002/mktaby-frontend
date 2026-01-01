import { z } from "zod";

export const updateSessionSchema = z.object({
  sessionDate: z.string().min(1, "تاريخ الجلسة مطلوب"),
  sessionType: z.string().min(1, "نوع الجلسة مطلوب"),
  sessionStatus: z.string().min(1, "حالة الجلسة مطلوبة"),
  caseId: z.number({ message: "القضية مطلوبة" }).min(1, "القضية مطلوبة"),
  courtId: z.number({ message: "المحكمة مطلوبة" }).min(1, "المحكمة مطلوبة"),
  notes: z.string().optional().nullable(),
  result: z.string().optional().nullable(),
});

export type UpdateSessionFormData = z.infer<typeof updateSessionSchema>;
