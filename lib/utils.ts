import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function initials(name?: string) {
  return (name || "Admin")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export function errorMessage(error: unknown) {
  if (typeof error === "object" && error) {
    const requestError = error as {
      code?: string;
      message?: string;
      response?: {
        status?: number;
        statusText?: string;
        data?: string | {
          message?: string;
          error?: string;
          errorSources?: Array<{ message?: string }>;
        };
      };
    };
    const response = requestError.response;
    const data = response?.data;

    if (typeof data === "string" && data.trim() && !data.trim().startsWith("<")) {
      return data.trim();
    }
    if (typeof data === "object" && data) {
      const detailedMessage = data.message || data.error || data.errorSources?.find((item) => item.message)?.message;
      if (detailedMessage) return detailedMessage;
    }
    if (response?.status === 413) return "The media is too large for the upload server. Please choose a smaller file.";
    if (response?.status === 502) return "The media service could not complete the upload. Please try again.";
    if (response?.status === 504) return "The upload took too long. Please try again with a smaller file.";
    if (response?.status) return `Request failed (${response.status}${response.statusText ? ` ${response.statusText}` : ""}).`;
    if (requestError.code === "ECONNABORTED" || requestError.code === "ETIMEDOUT") {
      return "The upload took too long. Please check your connection and try again.";
    }
    if (requestError.message === "Network Error") {
      return "Could not reach the server. Please check your connection and try again.";
    }
  }
  return error instanceof Error ? error.message : "Something went wrong";
}
