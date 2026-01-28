"use client";

import { FileDown } from "lucide-react";
import { ExportWizard } from "@/components/settings/export-wizard";

export default function ExportPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <FileDown className="h-6 w-6 text-gray-700" />
        <h1 className="text-2xl font-bold text-gray-900">데이터 내보내기</h1>
      </div>
      <ExportWizard />
    </div>
  );
}
