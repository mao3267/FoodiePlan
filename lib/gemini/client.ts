import { GoogleGenerativeAI } from "@google/generative-ai";
import { recipeSuggestionPrompt, mealPlanPrompt } from "./prompts";
import {
  suggestRecipesResponseSchema,
  generatePlanResponseSchema,
} from "@/lib/validations/ai";
import type { z } from "zod";

export const GEMINI_MODEL = "gemini-2.0-flash";

export function getClient(userApiKey?: string | null) {
  if (!userApiKey) {
    throw new Error(
      "No Gemini API key configured. Please add your API key in Settings."
    );
  }
  return new GoogleGenerativeAI(userApiKey);
}

export function parseJsonResponse(text: string): unknown {
  const cleaned = text.replace(/```(?:json)?\n?/g, "").trim();
  return JSON.parse(cleaned);
}

export async function suggestRecipes(
  ingredients: string[],
  preferences?: string,
  apiKey?: string | null
): Promise<z.infer<typeof suggestRecipesResponseSchema>> {
  const genAI = getClient(apiKey);
  const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });

  const prompt = recipeSuggestionPrompt(ingredients, preferences);
  const result = await model.generateContent(prompt);
  const text = result.response.text();

  const parsed = parseJsonResponse(text);
  return suggestRecipesResponseSchema.parse(parsed);
}

export async function generateMealPlan(
  options: {
    days: number;
    preferences: Record<string, string>;
    servings: number;
  },
  apiKey?: string | null
): Promise<z.infer<typeof generatePlanResponseSchema>> {
  const genAI = getClient(apiKey);
  const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });

  const prompt = mealPlanPrompt(options);
  const result = await model.generateContent(prompt);
  const text = result.response.text();

  const parsed = parseJsonResponse(text);
  return generatePlanResponseSchema.parse(parsed);
}
