import type {
  ApiResponse,
  CreateTagRequest,
  Tag,
  TagWithCount,
  UpdateTagRequest,
} from "@cardkeeper/shared-types";

import type { HttpClient } from "../client";

export function createTagsEndpoints(client: HttpClient) {
  return {
    list: () => client.get<ApiResponse<TagWithCount[]>>("/tags").then((r) => r.data),

    create: (data: CreateTagRequest) =>
      client.post<ApiResponse<Tag>>("/tags", data).then((r) => r.data),

    update: (id: string, data: UpdateTagRequest) =>
      client.put<ApiResponse<Tag>>(`/tags/${id}`, data).then((r) => r.data),

    delete: (id: string) => client.delete<void>(`/tags/${id}`),
  };
}
