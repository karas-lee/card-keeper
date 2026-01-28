import type {
  ApiResponse,
  CardDetail,
  CardListParams,
  CardSummary,
  CreateCardRequest,
  PaginatedResponse,
  UpdateCardRequest,
} from "@cardkeeper/shared-types";

import type { HttpClient } from "../client";

export function createCardsEndpoints(client: HttpClient) {
  return {
    list: (params: CardListParams) => {
      const queryParams: Record<string, string | number | boolean | undefined> = {
        ...params,
        tagIds: params.tagIds?.join(","),
        isFavorite: params.isFavorite,
      };
      return client.get<PaginatedResponse<CardSummary>>("/cards", queryParams);
    },

    get: (id: string) =>
      client.get<ApiResponse<CardDetail>>(`/cards/${id}`).then((r) => r.data),

    create: (data: CreateCardRequest) =>
      client.post<ApiResponse<CardDetail>>("/cards", data).then((r) => r.data),

    update: (id: string, data: UpdateCardRequest) =>
      client.put<ApiResponse<CardDetail>>(`/cards/${id}`, data).then((r) => r.data),

    delete: (id: string) => client.delete<void>(`/cards/${id}`),

    toggleFavorite: (id: string, isFavorite: boolean) =>
      client.patch<void>(`/cards/${id}/favorite`, { isFavorite }),

    moveToFolder: (id: string, folderId: string | null) =>
      client.patch<void>(`/cards/${id}/folder`, { folderId }),

    addTag: (id: string, tagId: string) => client.post<void>(`/cards/${id}/tags`, { tagId }),

    removeTag: (id: string, tagId: string) => client.delete<void>(`/cards/${id}/tags/${tagId}`),

    batchDelete: (cardIds: string[]) => client.post<void>("/cards/batch/delete", { cardIds }),

    batchMove: (cardIds: string[], folderId: string | null) =>
      client.post<void>("/cards/batch/move", { cardIds, folderId }),

    batchTag: (cardIds: string[], tagIds: string[], action: "add" | "remove") =>
      client.post<void>("/cards/batch/tag", { cardIds, tagIds, action }),
  };
}
