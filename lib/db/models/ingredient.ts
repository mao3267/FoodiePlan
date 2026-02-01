import mongoose, { Schema, type Model } from "mongoose";
import type { IIngredient } from "@/lib/types";

const ingredientSchema = new Schema<IIngredient>(
  {
    name: { type: String, required: true, trim: true },
    quantity: { type: Number, required: true },
    unit: { type: String, required: true, trim: true },
    usedInRecipes: [{ type: Schema.Types.ObjectId, ref: "Recipe" }],
  },
  { timestamps: true }
);

export const Ingredient: Model<IIngredient> =
  mongoose.models.Ingredient ||
  mongoose.model<IIngredient>("Ingredient", ingredientSchema);
