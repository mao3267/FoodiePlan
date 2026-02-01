import mongoose, { Schema, type Model } from "mongoose";
import type { IRecipe, IRecipeIngredient } from "@/lib/types";

const recipeIngredientSchema = new Schema<IRecipeIngredient>(
  {
    ingredientId: {
      type: Schema.Types.ObjectId,
      ref: "Ingredient",
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    quantity: { type: Number, required: true },
    unit: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const recipeSchema = new Schema<IRecipe>(
  {
    name: { type: String, required: true, trim: true },
    servings: { type: Number, required: true },
    ingredients: [recipeIngredientSchema],
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  },
  { timestamps: true }
);

export const Recipe: Model<IRecipe> =
  mongoose.models.Recipe || mongoose.model<IRecipe>("Recipe", recipeSchema);
