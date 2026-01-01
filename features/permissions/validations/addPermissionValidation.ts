import { z } from "zod";

export const addPermissionSchema = z.object({
  name: z.string().min(2, "اسم الصلاحية يجب أن يحتوي على 2 أحرف على الأقل"),
  documentPermissions: z.number().min(0, "قيمة غير صالحة"),
  clientPermissions: z.number().min(0, "قيمة غير صالحة"),
  sessionPermission: z.number().min(0, "قيمة غير صالحة"),
  financePermission: z.number().min(0, "قيمة غير صالحة"),
  viewCasePermissions: z.number().min(0, "قيمة غير صالحة"),
  dmlCasePermissions: z.number().min(0, "قيمة غير صالحة"),
  viewTaskPermissions: z.number().min(0, "قيمة غير صالحة"),
  dmlTaskPermissions: z.number().min(0, "قيمة غير صالحة"),
});

export type AddPermissionFormData = z.infer<typeof addPermissionSchema>;
