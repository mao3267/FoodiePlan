import { describe, it, expect } from "vitest";
import {
  normalizeIngredient,
  normalizeIngredients,
} from "@/lib/utils/normalize-ingredient";

describe("normalizeIngredient", () => {
  it("converts a string to structured ingredient with defaults", () => {
    expect(normalizeIngredient("chicken")).toEqual({
      name: "chicken",
      quantity: 1,
      unit: "",
    });
  });

  it("returns a fully structured object as-is", () => {
    const input = { name: "rice", quantity: 2, unit: "cups" };
    expect(normalizeIngredient(input)).toEqual({
      name: "rice",
      quantity: 2,
      unit: "cups",
    });
  });

  it("defaults missing quantity to 1", () => {
    expect(normalizeIngredient({ name: "salt" })).toEqual({
      name: "salt",
      quantity: 1,
      unit: "",
    });
  });

  it("defaults missing unit to empty string", () => {
    expect(normalizeIngredient({ name: "egg", quantity: 3 })).toEqual({
      name: "egg",
      quantity: 3,
      unit: "",
    });
  });

  it("handles null input with safe defaults", () => {
    expect(normalizeIngredient(null)).toEqual({
      name: "",
      quantity: 1,
      unit: "",
    });
  });

  it("handles undefined input with safe defaults", () => {
    expect(normalizeIngredient(undefined)).toEqual({
      name: "",
      quantity: 1,
      unit: "",
    });
  });

  it("handles numeric input with safe defaults", () => {
    expect(normalizeIngredient(42)).toEqual({
      name: "",
      quantity: 1,
      unit: "",
    });
  });

  it("coerces non-string name to string", () => {
    expect(normalizeIngredient({ name: 123 })).toEqual({
      name: "123",
      quantity: 1,
      unit: "",
    });
  });
});

describe("normalizeIngredients", () => {
  it("normalizes an array of mixed formats", () => {
    const result = normalizeIngredients([
      "chicken",
      { name: "rice", quantity: 2, unit: "cups" },
      { name: "salt" },
    ]);

    expect(result).toEqual([
      { name: "chicken", quantity: 1, unit: "" },
      { name: "rice", quantity: 2, unit: "cups" },
      { name: "salt", quantity: 1, unit: "" },
    ]);
  });

  it("returns empty array for empty input", () => {
    expect(normalizeIngredients([])).toEqual([]);
  });
});
