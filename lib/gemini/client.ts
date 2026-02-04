import { GoogleGenerativeAI } from "@google/generative-ai";
import { recipeSuggestionPrompt, mealPlanPrompt } from "./prompts";

function getClient(userApiKey?: string | null) {
  const apiKey = userApiKey || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "No Gemini API key available. Set GEMINI_API_KEY or configure a key in Settings."
    );
  }
  return new GoogleGenerativeAI(apiKey);
}

function parseJsonResponse(text: string): unknown {
  // Strip markdown code fences if present
  const cleaned = text.replace(/```(?:json)?\n?/g, "").trim();
  return JSON.parse(cleaned);
}

export async function suggestRecipes(
  ingredients: string[],
  preferences?: string,
  apiKey?: string | null
) {
  const genAI = getClient(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const prompt = recipeSuggestionPrompt(ingredients, preferences);
  const result = await model.generateContent(prompt);
  const text = result.response.text();

  return parseJsonResponse(text);
}

export async function generateMealPlan(
  options: {
    days: number;
    preferences: Record<string, string>;
    servings: number;
  },
  apiKey?: string | null
) {
  const genAI = getClient(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const prompt = mealPlanPrompt(options);
  const result = await model.generateContent(prompt);
  const text = result.response.text();

  return parseJsonResponse(text);
}
