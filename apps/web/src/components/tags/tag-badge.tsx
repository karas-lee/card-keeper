import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface TagBadgeProps {
  name: string;
  color: string;
  onRemove?: () => void;
  className?: string;
}

export function TagBadge({ name, color, onRemove, className }: TagBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
        className
      )}
      style={{
        backgroundColor: `${color}15`,
        color: color,
        border: `1px solid ${color}30`,
      }}
    >
      <span
        className="h-2 w-2 shrink-0 rounded-full"
        style={{ backgroundColor: color }}
      />
      {name}
      {onRemove && (
        <button
          type="button"
          className="ml-0.5 rounded-full p-0.5 transition-colors hover:bg-black/10"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          aria-label={`${name} 태그 제거`}
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </span>
  );
}
