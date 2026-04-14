import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/auth/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/db/connection", () => ({
  connectDB: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/lib/db/models/meal-plan", () => ({
  MealPlan: {
    findOne: vi.fn(),
  },
}));

import { auth } from "@/lib/auth/auth";
import { MealPlan } from "@/lib/db/models/meal-plan";
import { POST } from "@/app/api/meals/[id]/move/route";

type TestMeal = {
  _id: { toString: () => string };
  name: string;
  time: "Breakfast" | "Lunch" | "Dinner" | "Snack";
  servings: number;
  ingredients: Array<{ name: string; quantity: number; unit: string }>;
  seasonings: Array<{ name: string; quantity: number; unit: string }>;
  toObject: () => Omit<TestMeal, "toObject">;
};

type TestDay = { day: string; meals: TestMeal[] };

type TestPlan = {
  _id: string;
  userId: string;
  days: TestDay[];
  save: ReturnType<typeof vi.fn>;
};

function makeMeal(id: string, name: string, time: TestMeal["time"]): TestMeal {
  const meal: TestMeal = {
    _id: { toString: () => id },
    name,
    time,
    servings: 1,
    ingredients: [{ name: "ing", quantity: 1, unit: "cup" }],
    seasonings: [],
    toObject: () => ({
      _id: meal._id,
      name: meal.name,
      time: meal.time,
      servings: meal.servings,
      ingredients: meal.ingredients,
      seasonings: meal.seasonings,
    }),
  };
  return meal;
}

function makePlan(meals: Record<string, TestMeal[]>): TestPlan {
  return {
    _id: "plan1",
    userId: "user123",
    days: Object.entries(meals).map(([day, ms]) => ({ day, meals: ms })),
    save: vi.fn().mockResolvedValue(undefined),
  };
}

function makeRequest(body: unknown): Request {
  return new Request("http://localhost:3000/api/meals/plan1/move", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const params = Promise.resolve({ id: "plan1" });

describe("POST /api/meals/[id]/move", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when not authenticated", async () => {
    vi.mocked(auth).mockResolvedValueOnce(null as never);
    const res = await POST(
      makeRequest({ fromDay: "Monday", toDay: "Tuesday", mealId: "m1" }),
      { params }
    );
    expect(res.status).toBe(401);
  });

  it("returns 400 on invalid body", async () => {
    vi.mocked(auth).mockResolvedValueOnce({
      user: { id: "user123" },
      expires: "2099-01-01",
    } as never);
    const res = await POST(
      makeRequest({ fromDay: "NotADay", toDay: "Tuesday", mealId: "m1" }),
      { params }
    );
    expect(res.status).toBe(400);
  });

  it("returns 404 when plan not found", async () => {
    vi.mocked(auth).mockResolvedValueOnce({
      user: { id: "user123" },
      expires: "2099-01-01",
    } as never);
    vi.mocked(MealPlan.findOne).mockResolvedValueOnce(null as never);

    const res = await POST(
      makeRequest({ fromDay: "Monday", toDay: "Tuesday", mealId: "m1" }),
      { params }
    );
    expect(res.status).toBe(404);
    expect(MealPlan.findOne).toHaveBeenCalledWith({
      _id: "plan1",
      userId: "user123",
    });
  });

  it("returns 404 when mealId not found in fromDay", async () => {
    vi.mocked(auth).mockResolvedValueOnce({
      user: { id: "user123" },
      expires: "2099-01-01",
    } as never);
    const plan = makePlan({
      Monday: [makeMeal("m-other", "Oatmeal", "Breakfast")],
      Tuesday: [],
    });
    vi.mocked(MealPlan.findOne).mockResolvedValueOnce(plan as never);

    const res = await POST(
      makeRequest({ fromDay: "Monday", toDay: "Tuesday", mealId: "m1" }),
      { params }
    );
    expect(res.status).toBe(404);
    expect(plan.save).not.toHaveBeenCalled();
  });

  it("returns 404 when toDay does not exist", async () => {
    vi.mocked(auth).mockResolvedValueOnce({
      user: { id: "user123" },
      expires: "2099-01-01",
    } as never);
    const plan = makePlan({
      Monday: [makeMeal("m1", "Oatmeal", "Breakfast")],
    });
    vi.mocked(MealPlan.findOne).mockResolvedValueOnce(plan as never);

    const res = await POST(
      makeRequest({ fromDay: "Monday", toDay: "Tuesday", mealId: "m1" }),
      { params }
    );
    expect(res.status).toBe(404);
  });

  it("moves meal from fromDay to toDay preserving _id", async () => {
    vi.mocked(auth).mockResolvedValueOnce({
      user: { id: "user123" },
      expires: "2099-01-01",
    } as never);
    const plan = makePlan({
      Monday: [
        makeMeal("m1", "Oatmeal", "Breakfast"),
        makeMeal("m2", "Salad", "Lunch"),
      ],
      Tuesday: [makeMeal("m3", "Pasta", "Dinner")],
    });
    vi.mocked(MealPlan.findOne).mockResolvedValueOnce(plan as never);

    const res = await POST(
      makeRequest({ fromDay: "Monday", toDay: "Tuesday", mealId: "m1" }),
      { params }
    );
    expect(res.status).toBe(200);
    expect(plan.save).toHaveBeenCalledTimes(1);

    const monday = plan.days.find((d) => d.day === "Monday");
    const tuesday = plan.days.find((d) => d.day === "Tuesday");
    expect(monday?.meals.map((m) => m._id.toString())).toEqual(["m2"]);
    expect(tuesday?.meals.map((m) => m._id.toString())).toEqual(["m3", "m1"]);

    const moved = tuesday?.meals.find((m) => m._id.toString() === "m1");
    expect(moved?.name).toBe("Oatmeal");
    expect(moved?.time).toBe("Breakfast");
  });

  it("returns plan unchanged when fromDay equals toDay", async () => {
    vi.mocked(auth).mockResolvedValueOnce({
      user: { id: "user123" },
      expires: "2099-01-01",
    } as never);
    const plan = makePlan({
      Monday: [makeMeal("m1", "Oatmeal", "Breakfast")],
    });
    vi.mocked(MealPlan.findOne).mockResolvedValueOnce(plan as never);

    const res = await POST(
      makeRequest({ fromDay: "Monday", toDay: "Monday", mealId: "m1" }),
      { params }
    );
    expect(res.status).toBe(200);
    expect(plan.save).not.toHaveBeenCalled();
    expect(plan.days[0].meals).toHaveLength(1);
  });

  it("scopes findOne to the authenticated user", async () => {
    vi.mocked(auth).mockResolvedValueOnce({
      user: { id: "user-A" },
      expires: "2099-01-01",
    } as never);
    vi.mocked(MealPlan.findOne).mockResolvedValueOnce(null as never);

    await POST(
      makeRequest({ fromDay: "Monday", toDay: "Tuesday", mealId: "m1" }),
      { params }
    );

    expect(MealPlan.findOne).toHaveBeenCalledWith({
      _id: "plan1",
      userId: "user-A",
    });
  });
});
