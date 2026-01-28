import { z } from "zod";

export const exportSchema = z
  .object({
    version: z.enum(["3.0", "4.0"]).optional(),
    scope: z.enum(["single", "selected", "folder", "tag", "all"]),
    cardIds: z.array(z.string().cuid()).optional(),
    folderId: z.string().cuid().optional(),
    tagId: z.string().cuid().optional(),
  })
  .refine(
    (data) => {
      if (data.scope === "selected" && (!data.cardIds || data.cardIds.length === 0)) {
        return false;
      }
      if (data.scope === "folder" && !data.folderId) return false;
      if (data.scope === "tag" && !data.tagId) return false;
      return true;
    },
    { message: "범위에 맞는 ID를 지정해주세요" }
  );

export type ExportInput = z.infer<typeof exportSchema>;
