export class ApiClientError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number,
    public details?: Array<{ field?: string; message: string }>
  ) {
    super(message);
    this.name = "ApiClientError";
  }
}
