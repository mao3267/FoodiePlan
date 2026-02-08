import type { Types } from "mongoose";

export type ReminderOffset = 10 | 30 | 60;

export interface IDefaultMealTimes {
  Breakfast: string;
  Lunch: string;
  Dinner: string;
}

export interface INotificationPreferences {
  emailEnabled: boolean;
  pushEnabled: boolean;
  reminderOffset: ReminderOffset;
}

export interface IUserSettings {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  notifications: INotificationPreferences;
  defaultMealTimes: IDefaultMealTimes;
  publicProfile: boolean;
  encryptedGeminiKey?: string | null;
  geminiKeyLastFour?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ClientUserSettings {
  _id: string;
  notifications: INotificationPreferences;
  defaultMealTimes: IDefaultMealTimes;
  publicProfile: boolean;
  hasGeminiKey: boolean;
  maskedGeminiKey: string | null;
}

export interface IUser {
  _id: Types.ObjectId;
  name: string;
  email: string;
  bio?: string;
  image?: string;
  emailVerified?: Date | null;
}

export interface IRecipeIngredient {
  ingredientId: Types.ObjectId;
  name: string;
  quantity: number;
  unit: string;
}

export interface IRecipe {
  _id: Types.ObjectId;
  name: string;
  servings: number;
  ingredients: IRecipeIngredient[];
  userId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface IIngredient {
  _id: Types.ObjectId;
  name: string;
  quantity: number;
  unit: string;
  usedInRecipes: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IMealIngredient {
  name: string;
  quantity: number;
  unit: string;
}

export interface IMealPlanMeal {
  _id?: Types.ObjectId;
  recipeId?: Types.ObjectId;
  name: string;
  time: "Breakfast" | "Lunch" | "Dinner" | "Snack";
  servings: number;
  ingredients: IMealIngredient[];
  seasonings: IMealIngredient[];
}

export interface IMealPlanDay {
  day: string;
  meals: IMealPlanMeal[];
}

export interface IMealPlan {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  weekStart: Date;
  days: IMealPlanDay[];
  createdAt: Date;
  updatedAt: Date;
}

export type MealTime = "Breakfast" | "Lunch" | "Dinner" | "Snack";

export interface ClientMealIngredient {
  name: string;
  quantity: number;
  unit: string;
}

export interface ClientMeal {
  _id: string;
  recipeId?: string;
  name: string;
  time: MealTime;
  servings: number;
  ingredients: ClientMealIngredient[];
  seasonings: ClientMealIngredient[];
}

export interface ClientDayPlan {
  day: string;
  meals: ClientMeal[];
}

export interface ClientMealPlan {
  _id: string;
  weekStart: string;
  days: ClientDayPlan[];
}

export interface IShoppingListItem {
  _id?: Types.ObjectId;
  name: string;
  quantity: number;
  unit: string;
  source: "plan" | "manual";
  checked: boolean;
  planKey?: string;
  category: "food" | "seasoning";
}

export interface IShoppingList {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  items: IShoppingListItem[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ClientShoppingItem {
  _id: string;
  name: string;
  quantity: number;
  unit: string;
  source: "plan" | "manual";
  checked: boolean;
  category: "food" | "seasoning";
}

export interface IPost {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  content: string;
  image: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ClientPost {
  _id: string;
  content: string;
  image: string;
  createdAt: string;
  updatedAt: string;
}
