import type { ApiResponse, CardDetail, ScanConfirmRequest, ScanUploadResponse } from "@cardkeeper/shared-types";

import type { HttpClient } from "../client";

export function createScanEndpoints(client: HttpClient) {
  return {
    upload: (image: File | Blob) => {
      const formData = new FormData();
      formData.append("image", image);
      return client
        .post<ApiResponse<ScanUploadResponse>>("/scan/upload", formData, { isFormData: true })
        .then((r) => r.data);
    },

    confirm: (data: ScanConfirmRequest) =>
      client.post<ApiResponse<CardDetail>>("/scan/confirm", data).then((r) => r.data),
  };
}
