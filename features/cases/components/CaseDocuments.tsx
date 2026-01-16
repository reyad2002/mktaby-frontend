"use client";

import React from "react";
import FileManager from "@/features/fileAtt/components/FileManager";

/* ========== Component Props ========== */
interface CaseDocumentsProps {
  caseId: number;
}

/* ========== Main Component ========== */
export default function CaseDocuments({ caseId }: CaseDocumentsProps) {
  return (
    <FileManager
      entityType="Case"
      entityId={caseId}
      title="مستندات القضية"
      subtitle="عرض وإدارة مستندات القضية والمجلدات."
      showCreateFolder={true}
    />
  );
}
