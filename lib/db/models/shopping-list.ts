import mongoose, { Schema, type Model } from "mongoose";
import type { IShoppingList, IShoppingListItem } from "@/lib/types";

const shoppingListItemSchema = new Schema<IShoppingListItem>({
  name: { type: String, required: true, trim: true },
  quantity: { type: Number, required: true, default: 1 },
  unit: { type: String, default: "", trim: true },
  source: {
    type: String,
    enum: ["plan", "manual"],
    required: true,
    default: "manual",
  },
  checked: { type: Boolean, default: false },
  planKey: { type: String },
});

const shoppingListSchema = new Schema<IShoppingList>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    items: [shoppingListItemSchema],
  },
  { timestamps: true }
);

export const ShoppingList: Model<IShoppingList> =
  mongoose.models.ShoppingList ||
  mongoose.model<IShoppingList>("ShoppingList", shoppingListSchema);
