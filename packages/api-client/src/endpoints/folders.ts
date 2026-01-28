import type {
  ApiResponse,
  CreateFolderRequest,
  Folder,
  FolderTree,
  UpdateFolderRequest,
} from "@cardkeeper/shared-types";

import type { HttpClient } from "../client";

export function createFoldersEndpoints(client: HttpClient) {
  return {
    list: () => client.get<ApiResponse<FolderTree[]>>("/folders").then((r) => r.data),

    create: (data: CreateFolderRequest) =>
      client.post<ApiResponse<Folder>>("/folders", data).then((r) => r.data),

    update: (id: string, data: UpdateFolderRequest) =>
      client.put<ApiResponse<Folder>>(`/folders/${id}`, data).then((r) => r.data),

    delete: (id: string) => client.delete<void>(`/folders/${id}`),
  };
}
