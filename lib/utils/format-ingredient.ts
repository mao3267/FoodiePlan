import type { IMealIngredient } from "@/lib/types";

export function formatIngredient(ing: IMealIngredient): string {
  const parts: string[] = [];

  if (ing.quantity > 0) {
    parts.push(String(ing.quantity));
  }

  if (ing.unit) {
    parts.push(ing.unit);
  }

  parts.push(ing.name);

  return parts.join(" ");
}
