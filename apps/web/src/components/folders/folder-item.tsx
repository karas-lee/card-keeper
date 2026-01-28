"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Folder } from "@/hooks/use-folders";

interface FolderItemProps {
  folder: Folder;
  level: number;
  activeFolderId?: string;
  onSelect?: (folderId: string) => void;
  onEdit?: (folder: Folder) => void;
  onDelete?: (folder: Folder) => void;
}

export function FolderItem({
  folder,
  level,
  activeFolderId,
  onSelect,
  onEdit,
  onDelete,
}: FolderItemProps) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const isActive = activeFolderId === folder.id;
  const hasChildren = folder.children && folder.children.length > 0;

  function handleClick() {
    if (onSelect) {
      onSelect(folder.id);
    } else {
      router.push(`/folders/${folder.id}`);
    }
  }

  function handleToggle(e: React.MouseEvent) {
    e.stopPropagation();
    setExpanded((prev) => !prev);
  }

  return (
    <div>
      <div
        className={cn(
          "group flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-gray-100 cursor-pointer",
          isActive && "bg-primary-50 text-primary-700 font-medium"
        )}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        onClick={handleClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") handleClick();
        }}
      >
        {/* Expand/collapse toggle */}
        <button
          type="button"
          className={cn(
            "flex h-5 w-5 shrink-0 items-center justify-center rounded transition-transform",
            hasChildren ? "hover:bg-gray-200" : "invisible"
          )}
          onClick={handleToggle}
          tabIndex={-1}
        >
          <ChevronRight
            className={cn(
              "h-3.5 w-3.5 text-gray-400 transition-transform",
              expanded && "rotate-90"
            )}
          />
        </button>

        {/* Color dot */}
        <span
          className="h-3 w-3 shrink-0 rounded-full"
          style={{ backgroundColor: folder.color }}
        />

        {/* Name */}
        <span className="flex-1 truncate">{folder.name}</span>

        {/* Card count */}
        <Badge variant="secondary" className="ml-auto text-xs font-normal">
          {folder.cardCount}
        </Badge>

        {/* Context menu */}
        {!folder.isDefault && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 opacity-0 group-hover:opacity-100"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation();
                  onEdit?.(folder);
                }}
              >
                <Pencil className="mr-2 h-4 w-4" />
                수정
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-red-600 focus:text-red-600"
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation();
                  onDelete?.(folder);
                }}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                삭제
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Children */}
      {hasChildren && expanded && (
        <div>
          {folder.children.map((child) => (
            <FolderItem
              key={child.id}
              folder={child}
              level={level + 1}
              activeFolderId={activeFolderId}
              onSelect={onSelect}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
