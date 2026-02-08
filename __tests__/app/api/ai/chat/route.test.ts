import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/auth/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/db/connection", () => ({
  connectDB: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/lib/gemini/get-user-api-key", () => ({
  getUserGeminiApiKey: vi.fn().mockResolvedValue(null),
}));

vi.mock("@/lib/gemini/chat", () => ({
  chatWithAgent: vi.fn(),
}));

vi.mock("@/lib/db/models/meal-plan", () => {
  const mockPlan = {
    days: [
      { day: "Monday", meals: [], find: undefined as unknown },
      { day: "Tuesday", meals: [] },
      { day: "Wednesday", meals: [] },
      { day: "Thursday", meals: [] },
      { day: "Friday", meals: [] },
      { day: "Saturday", meals: [] },
      { day: "Sunday", meals: [] },
    ],
    save: vi.fn().mockResolvedValue(undefined),
  };
  mockPlan.days[0].find = undefined;

  return {
    MealPlan: {
      findOne: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockImplementation((data) => ({
        ...data,
        days: data.days.map((d: { day: string; meals: unknown[] }) => ({
          ...d,
          meals: [...d.meals],
        })),
        save: vi.fn().mockResolvedValue(undefined),
      })),
    },
  };
});

import { auth } from "@/lib/auth/auth";
import { getUserGeminiApiKey } from "@/lib/gemini/get-user-api-key";
import { chatWithAgent } from "@/lib/gemini/chat";
import { MealPlan } from "@/lib/db/models/meal-plan";
import { POST } from "@/app/api/ai/chat/route";

function makeRequest(body: unknown): Request {
  return new Request("http://localhost:3000/api/ai/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/ai/chat", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 401 if not authenticated", async () => {
    vi.mocked(auth).mockResolvedValueOnce(null);

    const response = await POST(
      makeRequest({ messages: [{ role: "user", content: "Hello" }] })
    );
    expect(response.status).toBe(401);

    const data = await response.json();
    expect(data.error).toBe("Unauthorized");
  });

  it("should return 400 for invalid request body", async () => {
    vi.mocked(auth).mockResolvedValueOnce({
      user: { id: "user123" },
      expires: "2099-01-01",
    });

    const response = await POST(makeRequest({ messages: [] }));
    expect(response.status).toBe(400);
  });

  it("should return 400 for missing messages", async () => {
    vi.mocked(auth).mockResolvedValueOnce({
      user: { id: "user123" },
      expires: "2099-01-01",
    });

    const response = await POST(makeRequest({}));
    expect(response.status).toBe(400);
  });

  it("should return 400 when no API key is configured", async () => {
    vi.mocked(auth).mockResolvedValueOnce({
      user: { id: "user123" },
      expires: "2099-01-01",
    });
    vi.mocked(getUserGeminiApiKey).mockResolvedValueOnce(null);

    const response = await POST(
      makeRequest({ messages: [{ role: "user", content: "Hello" }] })
    );
    expect(response.status).toBe(400);

    const data = await response.json();
    expect(data.error).toBe(
      "No Gemini API key configured. Please add your API key in Settings."
    );
  });

  it("should return a message response when AI responds with message type", async () => {
    vi.mocked(auth).mockResolvedValueOnce({
      user: { id: "user123" },
      expires: "2099-01-01",
    });
    vi.mocked(getUserGeminiApiKey).mockResolvedValueOnce("test-api-key");
    vi.mocked(chatWithAgent).mockResolvedValueOnce({
      type: "message",
      content: "What cuisine do you prefer?",
    });

    const response = await POST(
      makeRequest({ messages: [{ role: "user", content: "Plan my meals" }] })
    );
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.type).toBe("message");
    expect(data.content).toBe("What cuisine do you prefer?");
  });

  it("should save meals and return plan response when AI responds with plan type", async () => {
    vi.mocked(auth).mockResolvedValueOnce({
      user: { id: "user123" },
      expires: "2099-01-01",
    });
    vi.mocked(getUserGeminiApiKey).mockResolvedValueOnce("test-api-key");

    const mockSave = vi.fn().mockResolvedValue(undefined);
    vi.mocked(MealPlan.create).mockResolvedValueOnce({
      userId: "user123",
      weekStart: new Date("2025-02-03"),
      days: [
        { day: "Monday", meals: [] },
        { day: "Tuesday", meals: [] },
        { day: "Wednesday", meals: [] },
        { day: "Thursday", meals: [] },
        { day: "Friday", meals: [] },
        { day: "Saturday", meals: [] },
        { day: "Sunday", meals: [] },
      ],
      save: mockSave,
    } as never);

    vi.mocked(chatWithAgent).mockResolvedValueOnce({
      type: "plan",
      content: "Here is your Italian dinner plan!",
      weekStart: "2025-02-03",
      meals: [
        {
          name: "Pasta Carbonara",
          day: "Monday",
          time: "Dinner",
          servings: 2,
          ingredients: [{ name: "Spaghetti", quantity: 200, unit: "g" }],
          seasonings: [],
        },
        {
          name: "Margherita Pizza",
          day: "Tuesday",
          time: "Dinner",
          servings: 2,
          ingredients: [{ name: "Pizza dough", quantity: 1, unit: "ball" }],
          seasonings: [],
        },
      ],
    });

    const response = await POST(
      makeRequest({
        messages: [
          { role: "user", content: "Plan Italian dinners for this week" },
        ],
      })
    );
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.type).toBe("plan");
    expect(data.content).toBe("Here is your Italian dinner plan!");
    expect(data.weekStart).toBe("2025-02-03");
    expect(data.mealsAdded).toBe(2);
    expect(data.mealNames).toEqual(["Pasta Carbonara", "Margherita Pizza"]);
  });

  it("should append meals to existing plan", async () => {
    vi.mocked(auth).mockResolvedValueOnce({
      user: { id: "user123" },
      expires: "2099-01-01",
    });
    vi.mocked(getUserGeminiApiKey).mockResolvedValueOnce("test-api-key");

    const existingMeals: unknown[] = [
      { name: "Existing Meal", time: "Breakfast", servings: 1, ingredients: [] },
    ];
    const mockSave = vi.fn().mockResolvedValue(undefined);
    vi.mocked(MealPlan.findOne).mockResolvedValueOnce({
      userId: "user123",
      weekStart: new Date("2025-02-03"),
      days: [
        { day: "Monday", meals: existingMeals },
        { day: "Tuesday", meals: [] },
        { day: "Wednesday", meals: [] },
        { day: "Thursday", meals: [] },
        { day: "Friday", meals: [] },
        { day: "Saturday", meals: [] },
        { day: "Sunday", meals: [] },
      ],
      save: mockSave,
    } as never);

    vi.mocked(chatWithAgent).mockResolvedValueOnce({
      type: "plan",
      content: "Added dinner to Monday",
      weekStart: "2025-02-03",
      meals: [
        {
          name: "New Dinner",
          day: "Monday",
          time: "Dinner",
          servings: 2,
          ingredients: [{ name: "Chicken", quantity: 500, unit: "g" }],
          seasonings: [],
        },
      ],
    });

    const response = await POST(
      makeRequest({
        messages: [{ role: "user", content: "Add a dinner to Monday" }],
      })
    );
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.mealsAdded).toBe(1);
    expect(existingMeals).toHaveLength(2);
    expect(mockSave).toHaveBeenCalled();
  });

  it("should skip duplicate meals that already exist in the plan", async () => {
    vi.mocked(auth).mockResolvedValueOnce({
      user: { id: "user123" },
      expires: "2099-01-01",
    });
    vi.mocked(getUserGeminiApiKey).mockResolvedValueOnce("test-api-key");

    const existingMeals: unknown[] = [
      { name: "Pasta Carbonara", time: "Dinner", servings: 2, ingredients: [] },
    ];
    const mockSave = vi.fn().mockResolvedValue(undefined);
    vi.mocked(MealPlan.findOne).mockResolvedValueOnce({
      userId: "user123",
      weekStart: new Date("2025-02-03"),
      days: [
        { day: "Monday", meals: existingMeals },
        { day: "Tuesday", meals: [] },
        { day: "Wednesday", meals: [] },
        { day: "Thursday", meals: [] },
        { day: "Friday", meals: [] },
        { day: "Saturday", meals: [] },
        { day: "Sunday", meals: [] },
      ],
      save: mockSave,
    } as never);

    vi.mocked(chatWithAgent).mockResolvedValueOnce({
      type: "plan",
      content: "Here are your meals",
      weekStart: "2025-02-03",
      meals: [
        {
          name: "Pasta Carbonara",
          day: "Monday",
          time: "Dinner",
          servings: 2,
          ingredients: [{ name: "Spaghetti", quantity: 200, unit: "g" }],
          seasonings: [],
        },
        {
          name: "Grilled Salmon",
          day: "Tuesday",
          time: "Dinner",
          servings: 2,
          ingredients: [{ name: "Salmon", quantity: 300, unit: "g" }],
          seasonings: [],
        },
      ],
    });

    const response = await POST(
      makeRequest({
        messages: [{ role: "user", content: "Plan more meals" }],
      })
    );
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.mealsAdded).toBe(1);
    // Monday still has only the original meal (duplicate was skipped)
    expect(existingMeals).toHaveLength(1);
    expect(mockSave).toHaveBeenCalled();
  });

  it("should return 500 when chatWithAgent throws", async () => {
    vi.mocked(auth).mockResolvedValueOnce({
      user: { id: "user123" },
      expires: "2099-01-01",
    });
    vi.mocked(getUserGeminiApiKey).mockResolvedValueOnce("test-api-key");
    vi.mocked(chatWithAgent).mockRejectedValueOnce(new Error("Gemini API failed"));

    const response = await POST(
      makeRequest({ messages: [{ role: "user", content: "Hello" }] })
    );
    expect(response.status).toBe(500);

    const data = await response.json();
    expect(data.error).toBe("Gemini API failed");
  });

  it("should return 429 with quota message when Gemini rate limit is hit", async () => {
    const { GoogleGenerativeAIFetchError } = await import("@google/generative-ai");

    vi.mocked(auth).mockResolvedValueOnce({
      user: { id: "user123" },
      expires: "2099-01-01",
    });
    vi.mocked(getUserGeminiApiKey).mockResolvedValueOnce("test-api-key");

    const quotaError = new GoogleGenerativeAIFetchError("Resource exhausted", 429, "Too Many Requests");
    vi.mocked(chatWithAgent).mockRejectedValueOnce(quotaError);

    const response = await POST(
      makeRequest({ messages: [{ role: "user", content: "Hello" }] })
    );
    expect(response.status).toBe(429);

    const data = await response.json();
    expect(data.error).toContain("quota exceeded");
  });
});
