import type { CardListParams } from "@cardkeeper/shared-types";

export const queryKeys = {
  cards: {
    all: ["cards"] as const,
    lists: () => [...queryKeys.cards.all, "list"] as const,
    list: (filters: CardListParams) => [...queryKeys.cards.lists(), filters] as const,
    details: () => [...queryKeys.cards.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.cards.details(), id] as const,
  },

  folders: {
    all: ["folders"] as const,
    list: () => [...queryKeys.folders.all, "list"] as const,
    detail: (id: string) => [...queryKeys.folders.all, "detail", id] as const,
  },

  tags: {
    all: ["tags"] as const,
    list: () => [...queryKeys.tags.all, "list"] as const,
  },

  user: {
    me: ["user", "me"] as const,
  },

  scan: {
    result: (scanId: string) => ["scan", scanId] as const,
  },
} as const;
