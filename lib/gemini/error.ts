import { GoogleGenerativeAIFetchError } from "@google/generative-ai";

const QUOTA_MESSAGE =
  "Gemini API quota exceeded. Please wait a minute and try again, or check your API key's usage limits at https://aistudio.google.com/apikey";

export function getGeminiErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof GoogleGenerativeAIFetchError && error.status === 429) {
    return QUOTA_MESSAGE;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return fallback;
}

export function getGeminiErrorStatus(error: unknown): number {
  if (error instanceof GoogleGenerativeAIFetchError && error.status === 429) {
    return 429;
  }
  return 500;
}
