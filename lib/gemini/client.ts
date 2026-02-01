import { GoogleGenerativeAI } from "@google/generative-ai";
import { recipeSuggestionPrompt, mealPlanPrompt } from "./prompts";

function getClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is not set");
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
  preferences?: string
) {
  const genAI = getClient();
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const prompt = recipeSuggestionPrompt(ingredients, preferences);
  const result = await model.generateContent(prompt);
  const text = result.response.text();

  return parseJsonResponse(text);
}

export async function generateMealPlan(options: {
  days: number;
  preferences: Record<string, string>;
  servings: number;
}) {
  const genAI = getClient();
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const prompt = mealPlanPrompt(options);
  const result = await model.generateContent(prompt);
  const text = result.response.text();

  return parseJsonResponse(text);
}
