import { z } from "zod";

export const createFolderSchema = z.object({
  name: z.string().min(1, "폴더 이름을 입력해주세요").max(50),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "유효한 HEX 색상을 입력해주세요")
    .default("#6366F1"),
  parentId: z.string().cuid().optional().nullable(),
});

export const updateFolderSchema = z.object({
  name: z.string().min(1).max(50).optional(),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/)
    .optional(),
  order: z.number().int().min(0).optional(),
});

export type CreateFolderInput = z.infer<typeof createFolderSchema>;
export type UpdateFolderInput = z.infer<typeof updateFolderSchema>;
