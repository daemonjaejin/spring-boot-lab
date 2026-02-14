import axios from "axios";

export function getErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const payload = error.response?.data;
    const baseMessage =
      (typeof payload === "string" && payload) ||
      (payload?.message as string | undefined) ||
      error.message ||
      fallback;

    return status ? `${baseMessage} (${status})` : baseMessage;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
}
