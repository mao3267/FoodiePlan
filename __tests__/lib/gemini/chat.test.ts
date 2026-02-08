import { describe, it, expect, vi, beforeEach } from "vitest";
import { chatWithAgent } from "@/lib/gemini/chat";

vi.mock("@/lib/gemini/client", () => ({
  getClient: vi.fn(),
  parseJsonResponse: vi.fn(),
  GEMINI_MODEL: "gemini-2.0-flash",
}));

vi.mock("@/lib/gemini/chat-prompt", () => ({
  buildChatSystemPrompt: vi.fn(() => "system prompt"),
}));

import { getClient, parseJsonResponse } from "@/lib/gemini/client";

const mockGetClient = vi.mocked(getClient);
const mockParseJsonResponse = vi.mocked(parseJsonResponse);

function createMockModel(responseText: string) {
  return {
    getGenerativeModel: vi.fn(() => ({
      generateContent: vi.fn().mockResolvedValue({
        response: { text: () => responseText },
      }),
    })),
  };
}

describe("chatWithAgent", () => {
  const messages = [{ role: "user" as const, content: "Hello" }];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return parsed message response when JSON is valid", async () => {
    const validResponse = { type: "message", content: "Hello! How can I help?" };
    mockGetClient.mockReturnValue(createMockModel('{"type":"message","content":"Hello! How can I help?"}') as never);
    mockParseJsonResponse.mockReturnValue(validResponse);

    const result = await chatWithAgent(messages);

    expect(result).toEqual(validResponse);
    expect(mockParseJsonResponse).toHaveBeenCalledOnce();
  });

  it("should return plain text as message when JSON parsing fails", async () => {
    const plainText = "Got it! To clarify, do you prefer Italian or Mexican food?";
    mockGetClient.mockReturnValue(createMockModel(plainText) as never);
    mockParseJsonResponse.mockImplementation(() => {
      throw new SyntaxError("Unexpected token 'G'");
    });

    const result = await chatWithAgent(messages);

    expect(result).toEqual({ type: "message", content: plainText });
  });

  it("should return parsed plan response when AI returns a plan", async () => {
    const planResponse = {
      type: "plan",
      content: "Here's your meal plan!",
      weekStart: "2025-02-03",
      meals: [
        {
          name: "Pasta",
          day: "Monday",
          time: "Dinner",
          servings: 2,
          ingredients: [{ name: "pasta", quantity: 200, unit: "g" }],
          seasonings: [],
        },
      ],
    };
    mockGetClient.mockReturnValue(createMockModel(JSON.stringify(planResponse)) as never);
    mockParseJsonResponse.mockReturnValue(planResponse);

    const result = await chatWithAgent(messages);

    expect(result).toEqual(planResponse);
  });

  it("should pass apiKey to getClient", async () => {
    const validResponse = { type: "message", content: "Hi" };
    mockGetClient.mockReturnValue(createMockModel("{}") as never);
    mockParseJsonResponse.mockReturnValue(validResponse);

    await chatWithAgent(messages, "test-api-key");

    expect(mockGetClient).toHaveBeenCalledWith("test-api-key");
  });

  it("should map assistant role to model for Gemini API", async () => {
    const validResponse = { type: "message", content: "Sure" };
    const mockGenerateContent = vi.fn().mockResolvedValue({
      response: { text: () => '{"type":"message","content":"Sure"}' },
    });
    mockGetClient.mockReturnValue({
      getGenerativeModel: vi.fn(() => ({ generateContent: mockGenerateContent })),
    } as never);
    mockParseJsonResponse.mockReturnValue(validResponse);

    await chatWithAgent([
      { role: "user", content: "Hi" },
      { role: "assistant", content: "Hello" },
      { role: "user", content: "Help me plan" },
    ]);

    const { contents } = mockGenerateContent.mock.calls[0][0];
    expect(contents[0].role).toBe("user");
    expect(contents[1].role).toBe("model");
    expect(contents[2].role).toBe("user");
  });
});
