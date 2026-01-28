"use client";

import { Check } from "lucide-react";
import { CONFIG } from "@cardkeeper/shared-constants";
import { cn } from "@/lib/utils";

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
}

export function ColorPicker({ value, onChange }: ColorPickerProps) {
  return (
    <div className="grid grid-cols-6 gap-2">
      {CONFIG.PRESET_COLORS.map((color) => {
        const isSelected = value === color;

        return (
          <button
            key={color}
            type="button"
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-full transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2",
              isSelected && "ring-2 ring-offset-2"
            )}
            style={{
              backgroundColor: color,
              ...(isSelected ? { ringColor: color } : {}),
            }}
            onClick={() => onChange(color)}
            aria-label={`Select color ${color}`}
            aria-pressed={isSelected}
          >
            {isSelected && <Check className="h-4 w-4 text-white" />}
          </button>
        );
      })}
    </div>
  );
}
