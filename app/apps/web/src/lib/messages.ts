import type { AxiosError } from "axios";

export function getErrorMessage(error: AxiosError) {
  const data = error.response?.data;
  return data && typeof data === "object" && "error" in data
    ? String(data.error)
    : "An unexpected error occurred";
}
