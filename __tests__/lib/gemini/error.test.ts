import { describe, it, expect } from "vitest";
import { GoogleGenerativeAIFetchError } from "@google/generative-ai";
import { getGeminiErrorMessage, getGeminiErrorStatus } from "@/lib/gemini/error";

const QUOTA_MESSAGE =
  "Gemini API quota exceeded. Please wait a minute and try again, or check your API key's usage limits at https://aistudio.google.com/apikey";

function make429Error(): GoogleGenerativeAIFetchError {
  return new GoogleGenerativeAIFetchError("quota exceeded", 429);
}

function make500Error(): GoogleGenerativeAIFetchError {
  return new GoogleGenerativeAIFetchError("server error", 500);
}

describe("getGeminiErrorMessage", () => {
  it("should return quota message for 429 GoogleGenerativeAIFetchError", () => {
    const result = getGeminiErrorMessage(make429Error(), "fallback");
    expect(result).toBe(QUOTA_MESSAGE);
  });

  it("should return error.message for non-429 GoogleGenerativeAIFetchError", () => {
    const result = getGeminiErrorMessage(make500Error(), "fallback");
    expect(result).toContain("server error");
  });

  it("should return error.message for generic Error", () => {
    const result = getGeminiErrorMessage(new Error("something broke"), "fallback");
    expect(result).toBe("something broke");
  });

  it("should return fallback for non-Error values", () => {
    expect(getGeminiErrorMessage("string error", "fallback")).toBe("fallback");
    expect(getGeminiErrorMessage(null, "fallback")).toBe("fallback");
    expect(getGeminiErrorMessage(undefined, "fallback")).toBe("fallback");
    expect(getGeminiErrorMessage(42, "fallback")).toBe("fallback");
  });
});

describe("getGeminiErrorStatus", () => {
  it("should return 429 for 429 GoogleGenerativeAIFetchError", () => {
    expect(getGeminiErrorStatus(make429Error())).toBe(429);
  });

  it("should return 500 for non-429 GoogleGenerativeAIFetchError", () => {
    expect(getGeminiErrorStatus(make500Error())).toBe(500);
  });

  it("should return 500 for generic Error", () => {
    expect(getGeminiErrorStatus(new Error("fail"))).toBe(500);
  });

  it("should return 500 for non-Error values", () => {
    expect(getGeminiErrorStatus("string")).toBe(500);
    expect(getGeminiErrorStatus(null)).toBe(500);
  });
});
