import { z } from "zod";

import { contactDetailSchema } from "./card.schema";

export const scanConfirmSchema = z.object({
  scanId: z.string().min(1),
  name: z.string().min(1).max(100),
  company: z.string().max(100).optional(),
  jobTitle: z.string().max(100).optional(),
  contactDetails: z.array(contactDetailSchema).optional(),
  address: z.string().max(500).optional(),
  website: z.string().url().max(500).optional().or(z.literal("")),
  memo: z.string().max(2000).optional(),
  folderId: z.string().cuid().optional().nullable(),
  tagIds: z.array(z.string().cuid()).max(10).optional(),
});

export type ScanConfirmInput = z.infer<typeof scanConfirmSchema>;
