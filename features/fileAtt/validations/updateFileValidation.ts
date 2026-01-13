import { z } from "zod";

export const updateFileSchema = z.object({
  id: z.number({ message: "معرف الملف مطلوب" }).min(1, "معرف الملف مطلوب"),
  displayName: z
    .string()
    .min(1, "اسم الملف مطلوب")
    .max(255, "اسم الملف طويل جداً"),
  description: z.string().max(500, "الوصف طويل جداً").optional(),
});

export type UpdateFileFormData = z.infer<typeof updateFileSchema>;
