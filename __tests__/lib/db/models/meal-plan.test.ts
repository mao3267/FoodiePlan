import { describe, it, expect, beforeAll, afterAll, afterEach } from "vitest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { MealPlan } from "@/lib/db/models/meal-plan";

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterEach(async () => {
  await MealPlan.deleteMany({});
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe("MealPlan Model", () => {
  it("should create a meal plan with ingredients on meals", async () => {
    const userId = new mongoose.Types.ObjectId();

    const plan = await MealPlan.create({
      userId,
      weekStart: new Date("2025-01-27"),
      days: [
        {
          day: "Monday",
          meals: [
            {
              name: "Avocado Toast",
              time: "Breakfast",
              servings: 2,
              ingredients: [
                { name: "bread", quantity: 2, unit: "slices" },
                { name: "avocado", quantity: 1, unit: "" },
                { name: "eggs", quantity: 2, unit: "" },
              ],
            },
          ],
        },
      ],
    });

    expect(plan.days[0].meals[0].ingredients).toHaveLength(3);
    expect(plan.days[0].meals[0].ingredients[0].name).toBe("bread");
    expect(plan.days[0].meals[0].ingredients[0].quantity).toBe(2);
    expect(plan.days[0].meals[0].ingredients[0].unit).toBe("slices");
  });

  it("should auto-generate _id on meal sub-documents", async () => {
    const userId = new mongoose.Types.ObjectId();

    const plan = await MealPlan.create({
      userId,
      weekStart: new Date("2025-01-27"),
      days: [
        {
          day: "Monday",
          meals: [
            {
              name: "Oatmeal",
              time: "Breakfast",
              servings: 1,
              ingredients: [
                { name: "oats", quantity: 1, unit: "cup" },
                { name: "milk", quantity: 1, unit: "cup" },
              ],
            },
          ],
        },
      ],
    });

    const meal = plan.days[0].meals[0] as unknown as { _id: mongoose.Types.ObjectId };
    expect(meal._id).toBeDefined();
    expect(mongoose.Types.ObjectId.isValid(meal._id)).toBe(true);
  });

  it("should default ingredients to empty array when not provided", async () => {
    const userId = new mongoose.Types.ObjectId();

    const plan = await MealPlan.create({
      userId,
      weekStart: new Date("2025-01-27"),
      days: [
        {
          day: "Tuesday",
          meals: [
            {
              name: "Quick Snack",
              time: "Snack",
              servings: 1,
            },
          ],
        },
      ],
    });

    expect(plan.days[0].meals[0].ingredients).toEqual([]);
  });

  it("should require meal name and time", async () => {
    const userId = new mongoose.Types.ObjectId();

    await expect(
      MealPlan.create({
        userId,
        weekStart: new Date("2025-01-27"),
        days: [
          {
            day: "Monday",
            meals: [{ servings: 1 }],
          },
        ],
      })
    ).rejects.toThrow();
  });

  it("should only allow valid meal times", async () => {
    const userId = new mongoose.Types.ObjectId();

    await expect(
      MealPlan.create({
        userId,
        weekStart: new Date("2025-01-27"),
        days: [
          {
            day: "Monday",
            meals: [
              {
                name: "Test",
                time: "Brunch",
                servings: 1,
              },
            ],
          },
        ],
      })
    ).rejects.toThrow();
  });
});
