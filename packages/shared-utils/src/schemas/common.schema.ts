import { z } from "zod";

export const cuidSchema = z.string().cuid();

export const paginationSchema = z.object({
  cursor: z.string().cuid().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type PaginationInput = z.infer<typeof paginationSchema>;

export const colorHexSchema = z
  .string()
  .regex(/^#[0-9A-Fa-f]{6}$/, "유효한 HEX 색상 코드를 입력해주세요");

export const sortOrderSchema = z.enum(["asc", "desc"]).default("desc");

export const dateRangeSchema = z.object({
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
});

export type DateRangeInput = z.infer<typeof dateRangeSchema>;
