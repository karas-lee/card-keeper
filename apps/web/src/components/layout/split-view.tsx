"use client";

import type { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface SplitViewProps {
  list: ReactNode;
  detail?: ReactNode;
}

export function SplitView({ list, detail }: SplitViewProps) {
  return (
    <div className="flex h-full overflow-hidden">
      {/* List panel */}
      <div
        className={cn(
          "h-full flex-shrink-0 overflow-auto border-r border-gray-200",
          detail
            ? "hidden w-full md:block md:w-80 lg:w-96"
            : "w-full"
        )}
      >
        {list}
      </div>

      {/* Detail panel */}
      {detail && (
        <div className="flex h-full w-full flex-1 flex-col overflow-auto">
          {/* Mobile back button */}
          <div className="flex items-center border-b border-gray-200 px-4 py-2 md:hidden">
            <Button
              variant="ghost"
              size="sm"
              className="gap-1"
              onClick={() => window.history.back()}
            >
              <ArrowLeft className="h-4 w-4" />
              뒤로
            </Button>
          </div>
          <div className="flex-1 overflow-auto">{detail}</div>
        </div>
      )}

      {/* Empty detail state on desktop */}
      {!detail && (
        <div className="hidden flex-1 items-center justify-center md:flex">
          <p className="text-sm text-gray-500">
            목록에서 항목을 선택하세요
          </p>
        </div>
      )}
    </div>
  );
}
