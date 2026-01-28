import { HttpClient } from "./client";
import type { HttpClientConfig } from "./client";
import { createAuthEndpoints } from "./endpoints/auth";
import { createCardsEndpoints } from "./endpoints/cards";
import { createExportEndpoints } from "./endpoints/export";
import { createFoldersEndpoints } from "./endpoints/folders";
import { createScanEndpoints } from "./endpoints/scan";
import { createTagsEndpoints } from "./endpoints/tags";

export function createApiClient(config: HttpClientConfig) {
  const client = new HttpClient(config);

  return {
    auth: createAuthEndpoints(client),
    cards: createCardsEndpoints(client),
    scan: createScanEndpoints(client),
    folders: createFoldersEndpoints(client),
    tags: createTagsEndpoints(client),
    export: createExportEndpoints(client),
  };
}

export type ApiClient = ReturnType<typeof createApiClient>;

export { queryKeys } from "./query-keys";
export { ApiClientError } from "./errors";
export { HttpClient } from "./client";
export type { HttpClientConfig } from "./client";
