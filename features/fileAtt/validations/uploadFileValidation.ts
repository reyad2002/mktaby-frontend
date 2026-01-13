import { z } from "zod";

// Maximum file size (10MB)
const MAX_FILE_SIZE = 10 * 1024 * 1024;

// Allowed file types
const ALLOWED_FILE_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "image/jpeg",
  "image/png",
  "image/gif",
  "text/plain",
];

export const uploadFileSchema = z.object({
  file: z
    .instanceof(File, { message: "الملف مطلوب" })
    .refine((file) => file.size <= MAX_FILE_SIZE, {
      message: "حجم الملف يجب أن يكون أقل من 10 ميجابايت",
    })
    .refine((file) => ALLOWED_FILE_TYPES.includes(file.type), {
      message: "نوع الملف غير مدعوم",
    }),
  entityType: z.enum(["Case", "Client", "Session", "Task", "Court"], {
    message: "نوع الكيان مطلوب",
  }),
  entityId: z
    .number({ message: "معرف الكيان مطلوب" })
    .min(1, "معرف الكيان مطلوب"),
  folderId: z.number().optional(),
  displayName: z
    .string()
    .min(1, "اسم الملف مطلوب")
    .max(255, "اسم الملف طويل جداً"),
  description: z.string().max(500, "الوصف طويل جداً").optional(),
});

export type UploadFileFormData = z.infer<typeof uploadFileSchema>;
