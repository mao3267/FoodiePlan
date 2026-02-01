import mongoose, { Schema, type Model } from "mongoose";
import type { IMealPlan, IMealPlanMeal, IMealPlanDay, IMealIngredient } from "@/lib/types";

const mealIngredientSchema = new Schema<IMealIngredient>(
  {
    name: { type: String, required: true, trim: true },
    quantity: { type: Number, required: true, default: 1 },
    unit: { type: String, default: "", trim: true },
  },
  { _id: false }
);

const mealSchema = new Schema<IMealPlanMeal>({
  recipeId: { type: Schema.Types.ObjectId, ref: "Recipe" },
  name: { type: String, required: true, trim: true },
  time: {
    type: String,
    enum: ["Breakfast", "Lunch", "Dinner", "Snack"],
    required: true,
  },
  servings: { type: Number, required: true, default: 1 },
  ingredients: [mealIngredientSchema],
});

const dayPlanSchema = new Schema<IMealPlanDay>(
  {
    day: { type: String, required: true },
    meals: [mealSchema],
  },
  { _id: false }
);

const mealPlanSchema = new Schema<IMealPlan>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    weekStart: { type: Date, required: true },
    days: [dayPlanSchema],
  },
  { timestamps: true }
);

mealPlanSchema.index({ userId: 1, weekStart: 1 }, { unique: true });

export const MealPlan: Model<IMealPlan> =
  mongoose.models.MealPlan ||
  mongoose.model<IMealPlan>("MealPlan", mealPlanSchema);
