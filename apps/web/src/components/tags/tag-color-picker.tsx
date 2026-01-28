"use client";

import { ColorPicker } from "@/components/common/color-picker";

interface TagColorPickerProps {
  value: string;
  onChange: (color: string) => void;
}

/**
 * Tag-specific color picker.
 * Wraps the common ColorPicker component for consistent API.
 */
export function TagColorPicker({ value, onChange }: TagColorPickerProps) {
  return <ColorPicker value={value} onChange={onChange} />;
}
