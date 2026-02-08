import { z } from "zod";

const chatMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().trim().min(1, "Message cannot be empty").max(5000),
});

export const chatRequestSchema = z.object({
  messages: z
    .array(chatMessageSchema)
    .min(1, "At least one message is required")
    .max(50, "Too many messages"),
});

const mealIngredientSchema = z.object({
  name: z.string().min(1),
  quantity: z.number().min(0),
  unit: z.string().nullable().transform((v) => v ?? ""),
});

const aiPlanMealSchema = z.object({
  name: z.string().min(1),
  day: z.enum([
    "Monday", "Tuesday", "Wednesday", "Thursday",
    "Friday", "Saturday", "Sunday",
  ]),
  time: z.enum(["Breakfast", "Lunch", "Dinner", "Snack"]),
  servings: z.number().int().min(1),
  ingredients: z.array(mealIngredientSchema),
  seasonings: z.array(mealIngredientSchema).default([]),
});

const aiMessageResponseSchema = z.object({
  type: z.literal("message"),
  content: z.string().min(1),
});

const aiPlanResponseSchema = z.object({
  type: z.literal("plan"),
  content: z.string().min(1),
  weekStart: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Must be YYYY-MM-DD")
    .refine((val) => !isNaN(new Date(val).getTime()), "Must be a valid date"),
  meals: z.array(aiPlanMealSchema).min(1),
});

export const aiChatResponseSchema = z.discriminatedUnion("type", [
  aiMessageResponseSchema,
  aiPlanResponseSchema,
]);
