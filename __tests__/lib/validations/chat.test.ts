import { describe, it, expect } from "vitest";
import { chatRequestSchema, aiChatResponseSchema } from "@/lib/validations/chat";

describe("chatRequestSchema", () => {
  it("should accept a valid request with one user message", () => {
    const result = chatRequestSchema.safeParse({
      messages: [{ role: "user", content: "Plan my meals" }],
    });
    expect(result.success).toBe(true);
  });

  it("should accept a conversation with multiple messages", () => {
    const result = chatRequestSchema.safeParse({
      messages: [
        { role: "user", content: "Hello" },
        { role: "assistant", content: "Hi there!" },
        { role: "user", content: "Plan Italian dinners" },
      ],
    });
    expect(result.success).toBe(true);
  });

  it("should reject empty messages array", () => {
    const result = chatRequestSchema.safeParse({ messages: [] });
    expect(result.success).toBe(false);
  });

  it("should reject missing messages field", () => {
    const result = chatRequestSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("should reject message with empty content", () => {
    const result = chatRequestSchema.safeParse({
      messages: [{ role: "user", content: "" }],
    });
    expect(result.success).toBe(false);
  });

  it("should reject message with whitespace-only content", () => {
    const result = chatRequestSchema.safeParse({
      messages: [{ role: "user", content: "   " }],
    });
    expect(result.success).toBe(false);
  });

  it("should reject message with invalid role", () => {
    const result = chatRequestSchema.safeParse({
      messages: [{ role: "system", content: "Hello" }],
    });
    expect(result.success).toBe(false);
  });

  it("should reject message content exceeding 5000 characters", () => {
    const result = chatRequestSchema.safeParse({
      messages: [{ role: "user", content: "a".repeat(5001) }],
    });
    expect(result.success).toBe(false);
  });

  it("should accept message content at 5000 characters", () => {
    const result = chatRequestSchema.safeParse({
      messages: [{ role: "user", content: "a".repeat(5000) }],
    });
    expect(result.success).toBe(true);
  });

  it("should reject more than 50 messages", () => {
    const messages = Array.from({ length: 51 }, (_, i) => ({
      role: i % 2 === 0 ? ("user" as const) : ("assistant" as const),
      content: `Message ${i}`,
    }));
    const result = chatRequestSchema.safeParse({ messages });
    expect(result.success).toBe(false);
  });
});

describe("aiChatResponseSchema", () => {
  it("should accept a valid message response", () => {
    const result = aiChatResponseSchema.safeParse({
      type: "message",
      content: "What cuisine do you prefer?",
    });
    expect(result.success).toBe(true);
  });

  it("should accept a valid plan response", () => {
    const result = aiChatResponseSchema.safeParse({
      type: "plan",
      content: "Here is your Italian dinner plan!",
      weekStart: "2025-02-03",
      meals: [
        {
          name: "Pasta Carbonara",
          day: "Monday",
          time: "Dinner",
          servings: 2,
          ingredients: [
            { name: "Spaghetti", quantity: 200, unit: "g" },
            { name: "Eggs", quantity: 3, unit: "" },
          ],
        },
      ],
    });
    expect(result.success).toBe(true);
  });

  it("should reject plan response with invalid weekStart format", () => {
    const result = aiChatResponseSchema.safeParse({
      type: "plan",
      content: "Plan summary",
      weekStart: "Feb 3, 2025",
      meals: [
        {
          name: "Pasta",
          day: "Monday",
          time: "Dinner",
          servings: 2,
          ingredients: [],
        },
      ],
    });
    expect(result.success).toBe(false);
  });

  it("should reject plan response with empty meals array", () => {
    const result = aiChatResponseSchema.safeParse({
      type: "plan",
      content: "Plan summary",
      weekStart: "2025-02-03",
      meals: [],
    });
    expect(result.success).toBe(false);
  });

  it("should reject plan response with invalid meal time", () => {
    const result = aiChatResponseSchema.safeParse({
      type: "plan",
      content: "Plan summary",
      weekStart: "2025-02-03",
      meals: [
        {
          name: "Pasta",
          day: "Monday",
          time: "Brunch",
          servings: 2,
          ingredients: [],
        },
      ],
    });
    expect(result.success).toBe(false);
  });

  it("should reject message response with empty content", () => {
    const result = aiChatResponseSchema.safeParse({
      type: "message",
      content: "",
    });
    expect(result.success).toBe(false);
  });

  it("should reject unknown type", () => {
    const result = aiChatResponseSchema.safeParse({
      type: "unknown",
      content: "Hello",
    });
    expect(result.success).toBe(false);
  });

  it("should reject plan response with invalid day name", () => {
    const result = aiChatResponseSchema.safeParse({
      type: "plan",
      content: "Plan summary",
      weekStart: "2025-02-03",
      meals: [
        {
          name: "Pasta",
          day: "monday",
          time: "Dinner",
          servings: 2,
          ingredients: [],
        },
      ],
    });
    expect(result.success).toBe(false);
  });

  it("should reject plan response with semantically invalid date", () => {
    const result = aiChatResponseSchema.safeParse({
      type: "plan",
      content: "Plan summary",
      weekStart: "2025-13-45",
      meals: [
        {
          name: "Pasta",
          day: "Monday",
          time: "Dinner",
          servings: 2,
          ingredients: [],
        },
      ],
    });
    expect(result.success).toBe(false);
  });

  it("should accept plan with null ingredient unit and coerce to empty string", () => {
    const result = aiChatResponseSchema.safeParse({
      type: "plan",
      content: "Plan summary",
      weekStart: "2025-02-03",
      meals: [
        {
          name: "Scrambled Eggs",
          day: "Monday",
          time: "Breakfast",
          servings: 2,
          ingredients: [
            { name: "Eggs", quantity: 3, unit: null },
          ],
        },
      ],
    });
    expect(result.success).toBe(true);
    if (result.success && result.data.type === "plan") {
      expect(result.data.meals[0].ingredients[0].unit).toBe("");
    }
  });

  it("should reject plan with zero servings", () => {
    const result = aiChatResponseSchema.safeParse({
      type: "plan",
      content: "Plan summary",
      weekStart: "2025-02-03",
      meals: [
        {
          name: "Pasta",
          day: "Monday",
          time: "Dinner",
          servings: 0,
          ingredients: [],
        },
      ],
    });
    expect(result.success).toBe(false);
  });
});
