"use client";

import React, { useEffect, useRef, useState } from "react";
import { UploadCloud, Upload, Loader2, AlertCircle, Info } from "lucide-react";
import { useForm } from "react-hook-form";
import { useUploadFile } from "@/features/fileAtt/hooks/fileAttHooks";
import type {
  EntityType,
  UploadFileRequest,
} from "@/features/fileAtt/types/fileAttTypes";

/* ================= ModalShell ================= */
function ModalShell({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-2xl mx-4 bg-white rounded-2xl border border-gray-200 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur border-b border-gray-100 px-6 py-4 flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200/60 shadow-sm">
              <UploadCloud size={18} className="text-blue-700" />
            </span>
            {title}
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-gray-100 text-gray-600 transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

/* ================= Types ================= */
type UploadFilesProps = {
  open: boolean;
  onOpenChange: (v: boolean) => void;

  entityType: EntityType;
  entityId: number | null;
  folderId?: number | null;

  onSuccess?: () => void;

};

/* ================= Component ================= */
export default function UploadFiles({
  open,
  onOpenChange,
  entityType,
  entityId,
  folderId,
  onSuccess,
}: UploadFilesProps) {
  const [file, setFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const uploadFileMutation = useUploadFile();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<{
    displayName: string;
    description?: string;
  }>({
    defaultValues: {
      displayName: "",
      description: "",
    },
  });
 
  /* reset form كل مرة المودال يتفتح */
  useEffect(() => {
    if (!open) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFile(null);
    reset({ displayName: "", description: "" });
  }, [open, reset]);

  const submit = handleSubmit((data) => {
    
    if (!file) return;

    const payload: UploadFileRequest = {
      file,
      entityType,
      entityId,
      folderId: folderId ?? undefined,
      displayName: data.displayName.trim(),
      description: data.description?.trim() || undefined,
    };
 console.log();
    uploadFileMutation.mutate(payload, {
      onSuccess: (res) => {
        if (res?.succeeded) {
          onOpenChange(false);
          onSuccess?.();
        }
      },
    });
  });

  if (!open) return null;

  return (
    <ModalShell
      title="إضافة ملف جديد"
      onClose={() => onOpenChange(false)}
    >
      <form onSubmit={submit} className="space-y-6">
        {/* File picker */}
        <div
          onClick={() => inputRef.current?.click()}
          className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-all"
        >
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0] ?? null;
              setFile(f);

              if (f) {
                reset({
                  displayName: f.name.replace(/\.[^/.]+$/, ""),
                  description: "",
                });
              }
            }}
          />

          <Upload className="mx-auto mb-4 text-gray-400" size={40} />

          {file ? (
            <div className="text-gray-700 font-bold">{file.name}</div>
          ) : (
            <>
              <p className="text-gray-700 font-bold">
                اضغط لاختيار ملف أو اسحبه هنا
              </p>
              <p className="text-sm text-gray-500 mt-1">
                يمكنك رفع أي نوع من الملفات
              </p>
            </>
          )}
        </div>

        {/* Display Name */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            اسم العرض
          </label>
          <input
            {...register("displayName", {
              required: "اسم العرض مطلوب",
            })}
            className="w-full px-4 py-3.5 bg-gray-50/50 border border-gray-200 rounded-2xl"
          />
          {errors.displayName && (
            <p className="mt-1.5 text-sm text-red-600">
              {errors.displayName.message}

            </p>
            
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            الوصف (اختياري)
          </label>
          <textarea
            {...register("description")}
            rows={3}
            className="w-full px-4 py-3.5 bg-gray-50/50 border border-gray-200 rounded-2xl resize-none"
          />
        </div>

        {/* Status */}
        {uploadFileMutation.isPending && (
          <div className="flex items-center gap-2 text-sm text-gray-700 font-semibold">
            <Loader2 className="animate-spin" size={16} />
            جاري رفع الملف...
          </div>
        )}

        {uploadFileMutation.isError && (
          <div className="flex items-center gap-2 text-sm text-red-700 font-semibold">
            <AlertCircle size={16} />
            فشل رفع الملف.
          </div>
        )}

        {uploadFileMutation.isSuccess &&
          uploadFileMutation.data?.succeeded && (
            <div className="flex items-center gap-2 text-sm text-green-700 font-semibold">
              <Info size={16} />
              تم رفع الملف بنجاح.
            </div>
          )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="flex-1 px-4 py-3 text-sm font-extrabold rounded-2xl text-gray-700 bg-gray-100 hover:bg-gray-200"
          >
            إلغاء
          </button>

          <button
            type="submit"
            disabled={!file || uploadFileMutation.isPending}
            className="flex-1 px-4 py-3 text-sm font-extrabold rounded-2xl text-white bg-primary hover:bg-primary-dark disabled:opacity-50"
            
          >
            رفع الملف
          </button>
        </div>
      </form>
    </ModalShell>
  );
}
