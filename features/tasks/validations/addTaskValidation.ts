import { z } from "zod";

export const addTaskSchema = z.object({
  title: z.string().min(2, "عنوان المهمة يجب أن يحتوي على حرفين على الأقل"),
  description: z.string().min(2, "وصف المهمة يجب أن يحتوي على حرفين على الأقل"),
  dueDate: z.string().min(1, "تاريخ الاستحقاق مطلوب"),
  priority: z.string().min(1, "الأولوية مطلوبة"),
  status: z.string().min(1, "حالة المهمة مطلوبة"),
  entityId: z.number().optional(),
  entityType: z.string().optional(),
  recurringEvery: z.number().min(0, "قيمة التكرار يجب أن تكون 0 أو أكثر"),
  users: z.array(z.number()).min(1, "يجب تعيين مستخدم واحد على الأقل"),
});

export type AddTaskFormData = z.infer<typeof addTaskSchema>;
