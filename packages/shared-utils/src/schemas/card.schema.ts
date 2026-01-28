import { z } from "zod";

export const contactDetailSchema = z.object({
  type: z.enum(["PHONE", "EMAIL", "FAX", "MOBILE", "OTHER"]),
  label: z.string().max(50).optional(),
  value: z.string().min(1, "값을 입력해주세요").max(200),
  isPrimary: z.boolean().default(false),
});

export const createCardSchema = z.object({
  name: z.string().min(1, "이름을 입력해주세요").max(100),
  company: z.string().max(100).optional(),
  jobTitle: z.string().max(100).optional(),
  address: z.string().max(500).optional(),
  website: z.string().url("유효한 URL을 입력해주세요").max(500).optional().or(z.literal("")),
  memo: z.string().max(2000).optional(),
  folderId: z.string().cuid().optional().nullable(),
  tagIds: z
    .array(z.string().cuid())
    .max(10, "태그는 최대 10개까지 추가할 수 있습니다")
    .optional(),
  contactDetails: z.array(contactDetailSchema).optional(),
});

export const updateCardSchema = createCardSchema.partial();

export const cardListQuerySchema = z.object({
  search: z.string().max(100).optional(),
  folderId: z.string().cuid().optional(),
  tagIds: z.string().optional(),
  tagMode: z.enum(["AND", "OR"]).default("OR"),
  isFavorite: z.coerce.boolean().optional(),
  company: z.string().max(100).optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  sort: z.enum(["name", "createdAt", "updatedAt", "company"]).default("createdAt"),
  order: z.enum(["asc", "desc"]).default("desc"),
  cursor: z.string().cuid().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const batchDeleteSchema = z.object({
  cardIds: z.array(z.string().cuid()).min(1).max(100),
});

export const batchMoveSchema = z.object({
  cardIds: z.array(z.string().cuid()).min(1).max(100),
  folderId: z.string().cuid().nullable(),
});

export const batchTagSchema = z.object({
  cardIds: z.array(z.string().cuid()).min(1).max(100),
  tagIds: z.array(z.string().cuid()).min(1).max(10),
  action: z.enum(["add", "remove"]),
});

export type CreateCardInput = z.infer<typeof createCardSchema>;
export type UpdateCardInput = z.infer<typeof updateCardSchema>;
export type CardListQueryInput = z.infer<typeof cardListQuerySchema>;
export type ContactDetailInput = z.infer<typeof contactDetailSchema>;
