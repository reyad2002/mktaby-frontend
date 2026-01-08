import { z } from "zod";

export const createFeePaymentSchema = z.object({
  title: z.string().min(1, "يرجى إدخال العنوان"),
  caseFeeId: z
    .number({ message: "يرجى اختيار الرسوم" })
    .min(1, "يرجى اختيار الرسوم"),
  amount: z
    .number({ message: "يرجى إدخال المبلغ" })
    .min(0.01, "المبلغ يجب أن يكون أكبر من صفر"),
  paymentDate: z
    .string({ message: "يرجى إدخال تاريخ الدفع" })
    .min(1, "يرجى إدخال تاريخ الدفع"),
  paymentMethod: z.enum(
    ["Cash", "CreditCard", "BankTransfer", "MobilePayment", "Check"],
    {
      message: "يرجى اختيار طريقة الدفع",
    }
  ),
  dueDate: z
    .string({ message: "يرجى إدخال تاريخ الاستحقاق" })
    .min(1, "يرجى إدخال تاريخ الاستحقاق"),
  status: z.enum(["Unpaid", "Paid", "Overdue"], {
    message: "يرجى اختيار حالة الدفع",
  }),
});

export const updateFeePaymentSchema = createFeePaymentSchema;

export type CreateFeePaymentFormData = z.infer<typeof createFeePaymentSchema>;
export type UpdateFeePaymentFormData = z.infer<typeof updateFeePaymentSchema>;
