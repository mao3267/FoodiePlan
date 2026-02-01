import { describe, it, expect } from "vitest";
import { formatIngredient } from "@/lib/utils/format-ingredient";

describe("formatIngredient", () => {
  it("formats ingredient with quantity, unit, and name", () => {
    expect(
      formatIngredient({ name: "rice", quantity: 2, unit: "cups" })
    ).toBe("2 cups rice");
  });

  it("formats ingredient with quantity and no unit", () => {
    expect(
      formatIngredient({ name: "eggs", quantity: 3, unit: "" })
    ).toBe("3 eggs");
  });

  it("formats ingredient with zero quantity as name only", () => {
    expect(
      formatIngredient({ name: "salt", quantity: 0, unit: "" })
    ).toBe("salt");
  });

  it("formats ingredient with decimal quantity", () => {
    expect(
      formatIngredient({ name: "chicken", quantity: 0.5, unit: "kg" })
    ).toBe("0.5 kg chicken");
  });

  it("formats ingredient with unit but zero quantity", () => {
    expect(
      formatIngredient({ name: "pepper", quantity: 0, unit: "tsp" })
    ).toBe("tsp pepper");
  });
});
