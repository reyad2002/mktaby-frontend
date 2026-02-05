import { z } from "zod";

// Bitwise: 1=create, 2=update, 4=delete, 8=view — max 15
const bitwisePermission = z.number().min(0).max(15, "قيمة غير صالحة");

export const addPermissionSchema = z.object({
  name: z.string().min(2, "اسم الصلاحية يجب أن يحتوي على 2 أحرف على الأقل"),
  documentPermissions: bitwisePermission,
  clientPermissions: bitwisePermission,
  sessionPermission: bitwisePermission,
  financePermission: bitwisePermission,
  // View: 0-3
  viewCasePermissions: z.number().min(0).max(3, "قيمة غير صالحة"),
  viewTaskPermissions: z.number().min(0).max(3, "قيمة غير صالحة"),
  // DML: 0-14 (2+4+8)
  dmlCasePermissions: z.number().min(0).max(14, "قيمة غير صالحة"),
  dmlTaskPermissions: z.number().min(0).max(14, "قيمة غير صالحة"),
});

export type AddPermissionFormData = z.infer<typeof addPermissionSchema>;
