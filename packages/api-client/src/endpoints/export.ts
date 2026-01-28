import type { ExportParams } from "@cardkeeper/shared-types";

import type { HttpClient } from "../client";

export function createExportEndpoints(client: HttpClient) {
  return {
    vcard: (params: ExportParams) => client.post<Blob>("/export/vcard", params),

    csv: (params: ExportParams) => client.post<Blob>("/export/csv", params),
  };
}
