import type { ClientMealIngredient, ClientMealPlan } from "@/lib/types";

export interface ConsolidatedIngredient {
  displayName: string;
  quantity: number;
  unit: string;
  planKey: string;
}

export function buildPlanKey(name: string, unit: string): string {
  return `${name.toLowerCase().trim()}|${unit.toLowerCase().trim()}`;
}

export function consolidateIngredients(
  plans: ClientMealPlan[]
): ConsolidatedIngredient[] {
  const map = new Map<string, ConsolidatedIngredient>();

  for (const plan of plans) {
    for (const day of plan.days) {
      for (const meal of day.meals) {
        for (const ing of meal.ingredients) {
          addIngredient(map, ing);
        }
      }
    }
  }

  return Array.from(map.values()).sort((a, b) =>
    a.displayName.localeCompare(b.displayName)
  );
}

function addIngredient(
  map: Map<string, ConsolidatedIngredient>,
  ing: ClientMealIngredient
): void {
  const key = buildPlanKey(ing.name, ing.unit);
  const quantity = Number(ing.quantity) || 0;
  const existing = map.get(key);

  if (existing) {
    map.set(key, {
      ...existing,
      quantity: existing.quantity + quantity,
    });
  } else {
    map.set(key, {
      displayName: ing.name.trim(),
      quantity,
      unit: ing.unit.trim(),
      planKey: key,
    });
  }
}
