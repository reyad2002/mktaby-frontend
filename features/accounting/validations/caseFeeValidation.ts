import { z } from "zod";

export const addCaseFeeSchema = z.object({
  caseId: z.number().int().positive("يجب اختيار قضية"),
  amount: z.number().positive("المبلغ يجب أن يكون أكبر من صفر"),
  toBePaidAt: z.string().min(1, "تاريخ الاستحقاق مطلوب"),
});

export const updateCaseFeeSchema = z.object({
  amount: z.number().positive("المبلغ يجب أن يكون أكبر من صفر"),
  toBePaidAt: z.string().min(1, "تاريخ الاستحقاق مطلوب"),
});

export type AddCaseFeeFormData = z.infer<typeof addCaseFeeSchema>;
export type UpdateCaseFeeFormData = z.infer<typeof updateCaseFeeSchema>;
