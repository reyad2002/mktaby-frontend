import { z } from "zod";

export const updateFolderSchema = z.object({
  name: z.string().min(1, "اسم المجلد مطلوب").max(255, "اسم المجلد طويل جداً"),
  entityType: z.enum(["Case", "Client", "Session", "Task", "Court"], {
    message: "نوع الكيان مطلوب",
  }),
  entityId: z
    .number({ message: "معرف الكيان مطلوب" })
    .min(1, "معرف الكيان مطلوب"),
  parentFolderId: z.number().optional(),
});

export type UpdateFolderFormData = z.infer<typeof updateFolderSchema>;
