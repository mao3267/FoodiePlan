import { describe, it, expect } from "vitest";
import {
  consolidateIngredients,
  buildPlanKey,
} from "@/lib/utils/consolidate-ingredients";
import type { ClientMealPlan } from "@/lib/types";

function makePlan(
  meals: {
    name: string;
    ingredients: { name: string; quantity: number; unit: string }[];
    seasonings?: { name: string; quantity: number; unit: string }[];
  }[]
): ClientMealPlan {
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
          seasonings: m.seasonings ?? [],
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
      category: "food",
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

  it("assigns category 'food' to ingredients", () => {
    const plan = makePlan([
      { name: "Meal", ingredients: [{ name: "chicken", quantity: 1, unit: "kg" }] },
    ]);

    const result = consolidateIngredients([plan]);
    expect(result[0].category).toBe("food");
  });

  it("assigns category 'seasoning' to seasonings", () => {
    const plan = makePlan([
      {
        name: "Meal",
        ingredients: [],
        seasonings: [{ name: "olive oil", quantity: 2, unit: "tbsp" }],
      },
    ]);

    const result = consolidateIngredients([plan]);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      displayName: "olive oil",
      quantity: 2,
      unit: "tbsp",
      planKey: "olive oil|tbsp",
      category: "seasoning",
    });
  });

  it("consolidates seasonings across meals", () => {
    const plan = makePlan([
      {
        name: "Meal A",
        ingredients: [{ name: "chicken", quantity: 500, unit: "g" }],
        seasonings: [{ name: "soy sauce", quantity: 1, unit: "tbsp" }],
      },
      {
        name: "Meal B",
        ingredients: [{ name: "tofu", quantity: 200, unit: "g" }],
        seasonings: [{ name: "soy sauce", quantity: 2, unit: "tbsp" }],
      },
    ]);

    const result = consolidateIngredients([plan]);
    const soySauce = result.find((r) => r.displayName === "soy sauce");
    expect(soySauce).toBeDefined();
    expect(soySauce!.quantity).toBe(3);
    expect(soySauce!.category).toBe("seasoning");
  });

  it("keeps food and seasonings separate in output", () => {
    const plan = makePlan([
      {
        name: "Stir Fry",
        ingredients: [
          { name: "chicken", quantity: 500, unit: "g" },
          { name: "broccoli", quantity: 1, unit: "head" },
        ],
        seasonings: [
          { name: "sesame oil", quantity: 1, unit: "tbsp" },
          { name: "garlic powder", quantity: 1, unit: "tsp" },
        ],
      },
    ]);

    const result = consolidateIngredients([plan]);
    expect(result).toHaveLength(4);

    const foodItems = result.filter((r) => r.category === "food");
    const seasoningItems = result.filter((r) => r.category === "seasoning");
    expect(foodItems).toHaveLength(2);
    expect(seasoningItems).toHaveLength(2);
  });

  it("handles meals with empty seasonings array", () => {
    const plan = makePlan([
      {
        name: "Simple Meal",
        ingredients: [{ name: "rice", quantity: 1, unit: "cup" }],
        seasonings: [],
      },
    ]);

    const result = consolidateIngredients([plan]);
    expect(result).toHaveLength(1);
    expect(result[0].category).toBe("food");
  });

  it("handles meals with missing seasonings (backward compat)", () => {
    const plan: ClientMealPlan = {
      _id: "plan-1",
      weekStart: "2025-01-27",
      days: [
        {
          day: "Monday",
          meals: [
            {
              _id: "meal-0",
              name: "Old Meal",
              time: "Lunch",
              servings: 1,
              ingredients: [{ name: "pasta", quantity: 200, unit: "g" }],
              seasonings: [],
            },
          ],
        },
      ],
    };

    const result = consolidateIngredients([plan]);
    expect(result).toHaveLength(1);
    expect(result[0].category).toBe("food");
  });
});
