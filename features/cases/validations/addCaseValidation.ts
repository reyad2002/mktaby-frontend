import { z } from "zod";
import {
  checkCaseNameExists,
  checkCaseNumberExists,
} from "@/features/cases/apis/casesApis";

export const addCaseSchema = z
  .object({
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
  })
  .superRefine(async (data, ctx) => {
    if (!data.caseNumber?.trim()) return;
    try {
      const res = await checkCaseNumberExists(data.caseNumber.trim());
      if (res.succeeded && res.data) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "رقم القضية مستخدم مسبقاً",
          path: ["caseNumber"],
        });
      }
    } catch {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "تعذر التحقق من رقم القضية",
        path: ["caseNumber"],
      });
    }
  })
  .superRefine(async (data, ctx) => {
    if (!data.name?.trim() || data.name.trim().length < 2) return;
    try {
      const res = await checkCaseNameExists(data.name.trim());
      if (res.succeeded && res.data) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "اسم القضية مستخدم مسبقاً",
          path: ["name"],
        });
      }
    } catch {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "تعذر التحقق من اسم القضية",
        path: ["name"],
      });
    }
  });

export type AddCaseFormData = z.infer<typeof addCaseSchema>;
