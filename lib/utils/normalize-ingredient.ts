import type { IMealIngredient } from "@/lib/types";

export function normalizeIngredient(raw: unknown): IMealIngredient {
  if (typeof raw === "string") {
    return { name: raw, quantity: 1, unit: "" };
  }

  if (raw && typeof raw === "object" && "name" in raw) {
    const obj = raw as Record<string, unknown>;
    return {
      name: String(obj.name ?? ""),
      quantity: typeof obj.quantity === "number" ? obj.quantity : 1,
      unit: typeof obj.unit === "string" ? obj.unit : "",
    };
  }

  return { name: "", quantity: 1, unit: "" };
}

export function normalizeIngredients(raw: unknown[]): IMealIngredient[] {
  return raw.map(normalizeIngredient);
}
