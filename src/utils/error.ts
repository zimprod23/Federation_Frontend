import axios from "axios";

/**
 * Extracts a human-readable message from any error type.
 * Handles Axios errors where the real message is in response.data.error
 */
export function getErrorMessage(err: unknown): string {
  // Axios error — backend returned a structured response
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as
      | { error?: string; message?: string }
      | undefined;

    if (data?.error) return data.error;
    if (data?.message) return data.message;

    // Fallback to HTTP status text
    return err.response?.statusText ?? err.message;
  }

  // Standard JS error
  if (err instanceof Error) return err.message;

  // Unknown
  return "An unexpected error occurred";
}
