import { describe, it, expect } from "vitest";
import {
  consolidateIngredients,
  buildPlanKey,
} from "@/lib/utils/consolidate-ingredients";
import type { ClientMealPlan } from "@/lib/types";

function makePlan(meals: { name: string; ingredients: { name: string; quantity: number; unit: string }[] }[]): ClientMealPlan {
  return {
    _id: "plan-1",
    weekStart: "2025-01-27",
    days: [
      {
        day: "Monday",
        meals: meals.map((m, i) => ({
          _id: `meal-${i}`,
          name: m.name,
          time: "Lunch" as const,
          servings: 1,
          ingredients: m.ingredients,
        })),
      },
    ],
  };
}

describe("buildPlanKey", () => {
  it("creates a lowercase key from name and unit", () => {
    expect(buildPlanKey("Chicken", "kg")).toBe("chicken|kg");
  });

  it("trims whitespace", () => {
    expect(buildPlanKey(" Rice ", " cups ")).toBe("rice|cups");
  });

  it("handles empty unit", () => {
    expect(buildPlanKey("eggs", "")).toBe("eggs|");
  });
});

describe("consolidateIngredients", () => {
  it("returns empty array for empty plans", () => {
    expect(consolidateIngredients([])).toEqual([]);
  });

  it("returns single ingredient from single meal", () => {
    const plan = makePlan([
      { name: "Toast", ingredients: [{ name: "bread", quantity: 2, unit: "slices" }] },
    ]);

    const result = consolidateIngredients([plan]);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      displayName: "bread",
      quantity: 2,
      unit: "slices",
      planKey: "bread|slices",
    });
  });

  it("sums quantities for same ingredient with same unit", () => {
    const plan = makePlan([
      { name: "Meal A", ingredients: [{ name: "chicken", quantity: 200, unit: "g" }] },
      { name: "Meal B", ingredients: [{ name: "chicken", quantity: 300, unit: "g" }] },
    ]);

    const result = consolidateIngredients([plan]);
    expect(result).toHaveLength(1);
    expect(result[0].quantity).toBe(500);
  });

  it("keeps separate entries for different units", () => {
    const plan = makePlan([
      { name: "Meal A", ingredients: [{ name: "milk", quantity: 1, unit: "cup" }] },
      { name: "Meal B", ingredients: [{ name: "milk", quantity: 500, unit: "ml" }] },
    ]);

    const result = consolidateIngredients([plan]);
    expect(result).toHaveLength(2);
  });

  it("consolidates case-insensitively", () => {
    const plan = makePlan([
      { name: "Meal A", ingredients: [{ name: "Chicken", quantity: 1, unit: "kg" }] },
      { name: "Meal B", ingredients: [{ name: "chicken", quantity: 2, unit: "kg" }] },
    ]);

    const result = consolidateIngredients([plan]);
    expect(result).toHaveLength(1);
    expect(result[0].quantity).toBe(3);
  });

  it("sorts results alphabetically by displayName", () => {
    const plan = makePlan([
      {
        name: "Meal",
        ingredients: [
          { name: "Zucchini", quantity: 1, unit: "" },
          { name: "Apple", quantity: 2, unit: "" },
          { name: "Milk", quantity: 1, unit: "l" },
        ],
      },
    ]);

    const result = consolidateIngredients([plan]);
    expect(result.map((r) => r.displayName)).toEqual([
      "Apple",
      "Milk",
      "Zucchini",
    ]);
  });

  it("consolidates across multiple plans", () => {
    const plan1 = makePlan([
      { name: "Meal A", ingredients: [{ name: "rice", quantity: 1, unit: "cup" }] },
    ]);
    const plan2 = makePlan([
      { name: "Meal B", ingredients: [{ name: "rice", quantity: 2, unit: "cup" }] },
    ]);

    const result = consolidateIngredients([plan1, plan2]);
    expect(result).toHaveLength(1);
    expect(result[0].quantity).toBe(3);
  });
});
