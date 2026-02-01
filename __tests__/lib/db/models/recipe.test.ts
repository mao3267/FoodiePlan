import { describe, it, expect, beforeAll, afterAll, afterEach } from "vitest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { Recipe } from "@/lib/db/models/recipe";

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterEach(async () => {
  await Recipe.deleteMany({});
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe("Recipe Model", () => {
  it("should create a recipe with valid fields", async () => {
    const userId = new mongoose.Types.ObjectId();
    const ingredientId = new mongoose.Types.ObjectId();

    const recipe = await Recipe.create({
      name: "Test Recipe",
      servings: 4,
      userId,
      ingredients: [
        { ingredientId, name: "Salt", quantity: 1, unit: "tsp" },
      ],
    });

    expect(recipe.name).toBe("Test Recipe");
    expect(recipe.servings).toBe(4);
    expect(recipe.ingredients).toHaveLength(1);
    expect(recipe.ingredients[0].name).toBe("Salt");
  });

  it("should require name and servings", async () => {
    const userId = new mongoose.Types.ObjectId();

    await expect(
      Recipe.create({ userId, servings: 2 })
    ).rejects.toThrow();

    await expect(
      Recipe.create({ userId, name: "Test" })
    ).rejects.toThrow();
  });

  it("should trim the recipe name", async () => {
    const userId = new mongoose.Types.ObjectId();

    const recipe = await Recipe.create({
      name: "  Trimmed Recipe  ",
      servings: 2,
      userId,
      ingredients: [],
    });

    expect(recipe.name).toBe("Trimmed Recipe");
  });
});
