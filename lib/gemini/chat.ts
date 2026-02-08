import { getClient, parseJsonResponse, GEMINI_MODEL } from "@/lib/gemini/client";
import { buildChatSystemPrompt } from "@/lib/gemini/chat-prompt";
import { aiChatResponseSchema } from "@/lib/validations/chat";
import type { ChatMessage, AiChatResponse } from "@/lib/types/chat";

export async function chatWithAgent(
  messages: ChatMessage[],
  apiKey?: string | null
): Promise<AiChatResponse> {
  const genAI = getClient(apiKey);
  const model = genAI.getGenerativeModel({
    model: GEMINI_MODEL,
    systemInstruction: buildChatSystemPrompt(),
  });

  const contents = messages.map((msg) => ({
    role: msg.role === "assistant" ? "model" : "user",
    parts: [{ text: msg.content }],
  }));

  const result = await model.generateContent({ contents });
  const text = result.response.text();

  let parsed: unknown;
  try {
    parsed = parseJsonResponse(text);
  } catch {
    // AI responded with plain text instead of JSON — wrap it as a message
    return { type: "message" as const, content: text };
  }

  return aiChatResponseSchema.parse(parsed);
}
