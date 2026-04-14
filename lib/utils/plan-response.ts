import { normalizeIngredients } from "@/lib/utils/normalize-ingredient";

export function normalizePlanResponse(plan: unknown): unknown {
  const serialized = JSON.parse(JSON.stringify(plan));
  for (const day of serialized.days ?? []) {
    for (const meal of day.meals ?? []) {
      meal.ingredients = normalizeIngredients(meal.ingredients ?? []);
      meal.seasonings = normalizeIngredients(meal.seasonings ?? []);
    }
  }
  return serialized;
}
