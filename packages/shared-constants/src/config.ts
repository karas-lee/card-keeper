export const CONFIG = {
  SUPPORTED_IMAGE_TYPES: [
    "image/jpeg",
    "image/png",
    "image/heic",
    "image/heif",
    "image/webp",
  ] as const,

  SUPPORTED_IMAGE_EXTENSIONS: [".jpg", ".jpeg", ".png", ".heic", ".heif", ".webp"] as const,

  OCR_SUPPORTED_LANGUAGES: ["ko", "en", "ja", "zh"] as const,

  BUSINESS_CARD_ASPECT_RATIO: 1.75, // 3.5:2

  DEFAULT_FOLDER_COLOR: "#6366F1",
  DEFAULT_TAG_COLOR: "#8B5CF6",

  PRESET_COLORS: [
    "#EF4444",
    "#F97316",
    "#F59E0B",
    "#84CC16",
    "#10B981",
    "#06B6D4",
    "#3B82F6",
    "#6366F1",
    "#8B5CF6",
    "#A855F7",
    "#EC4899",
    "#F43F5E",
  ] as const,

  VCARD_VERSIONS: ["3.0", "4.0"] as const,

  EXPORT_SCOPES: ["single", "selected", "folder", "tag", "all"] as const,

  SORT_OPTIONS: ["name", "createdAt", "updatedAt", "company"] as const,
} as const;
