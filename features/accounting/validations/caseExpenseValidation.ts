import { z } from "zod";

export const addCaseExpenseSchema = z.object({
  caseId: z
    .number({ required_error: "يرجى اختيار القضية" })
    .min(1, "يرجى اختيار القضية"),
  amount: z
    .number({ required_error: "يرجى إدخال المبلغ" })
    .min(0.01, "المبلغ يجب أن يكون أكبر من صفر"),
  expenseDate: z
    .string({ required_error: "يرجى إدخال تاريخ المصروف" })
    .min(1, "يرجى إدخال تاريخ المصروف"),
});

export const updateCaseExpenseSchema = z.object({
  caseId: z
    .number({ required_error: "يرجى اختيار القضية" })
    .min(1, "يرجى اختيار القضية"),
  amount: z
    .number({ required_error: "يرجى إدخال المبلغ" })
    .min(0.01, "المبلغ يجب أن يكون أكبر من صفر"),
  expenseDate: z
    .string({ required_error: "يرجى إدخال تاريخ المصروف" })
    .min(1, "يرجى إدخال تاريخ المصروف"),
});

export type AddCaseExpenseFormData = z.infer<typeof addCaseExpenseSchema>;
export type UpdateCaseExpenseFormData = z.infer<typeof updateCaseExpenseSchema>;
