/**
 * Custom error type for API errors
 */
export interface ApiError extends Error {
  message: string;
  status?: number;
  code?: string;
  details?: unknown;
}
