import { z } from "zod";

// --- Request schemas ---

export const suggestRecipesSchema = z.object({
  ingredients: z
    .array(z.string().trim().min(1).max(100))
    .min(1, "At least one ingredient is required")
    .max(30, "Too many ingredients"),
  preferences: z.string().trim().max(500).optional(),
});

export const generatePlanSchema = z.object({
  days: z.number().int().min(1).max(14).default(7),
  servings: z.number().int().min(1).max(50).default(2),
  preferences: z.record(z.string(), z.string().max(200)).default({}),
});

// --- Response schemas (validate AI output before sending to client) ---

const recipeIngredientSchema = z.object({
  name: z.string(),
  quantity: z.union([z.string(), z.number()]),
  unit: z.string(),
});

const suggestedRecipeSchema = z.object({
  name: z.string(),
  servings: z.number(),
  prepTime: z.string().optional(),
  ingredients: z.array(recipeIngredientSchema),
  instructions: z.array(z.string()).optional(),
});

export const suggestRecipesResponseSchema = z.array(suggestedRecipeSchema);

const mealPlanMealSchema = z.object({
  name: z.string(),
  time: z.enum(["Breakfast", "Lunch", "Dinner", "Snack"]),
  servings: z.number(),
  ingredients: z.array(
    z.object({
      name: z.string(),
      quantity: z.number(),
      unit: z.string(),
    })
  ),
  seasonings: z.array(
    z.object({
      name: z.string(),
      quantity: z.number(),
      unit: z.string(),
    })
  ).default([]),
});

const mealPlanDaySchema = z.object({
  day: z.string(),
  meals: z.array(mealPlanMealSchema),
});

export const generatePlanResponseSchema = z.array(mealPlanDaySchema);
