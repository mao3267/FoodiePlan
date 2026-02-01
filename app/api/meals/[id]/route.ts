import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth/auth";
import { connectDB } from "@/lib/db/connection";
import { MealPlan } from "@/lib/db/models/meal-plan";
import { normalizeIngredients } from "@/lib/utils/normalize-ingredient";

const VALID_DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

const ingredientSchema = z.object({
  name: z.string().trim().min(1).max(200),
  quantity: z.number().min(0).default(1),
  unit: z.string().trim().max(50).default(""),
});

const patchBodySchema = z.object({
  day: z.enum(VALID_DAYS),
  mealId: z.string().min(1),
  updates: z.object({
    name: z.string().trim().min(1).max(200).optional(),
    time: z.enum(["Breakfast", "Lunch", "Dinner", "Snack"]).optional(),
    servings: z.number().int().min(1).max(100).optional(),
    ingredients: z.array(ingredientSchema).max(50).optional(),
  }),
});

const deleteBodySchema = z.object({
  day: z.enum(VALID_DAYS),
  mealId: z.string().min(1),
});

function normalizePlanResponse(plan: unknown): unknown {
  const serialized = JSON.parse(JSON.stringify(plan));
  for (const day of serialized.days ?? []) {
    for (const meal of day.meals ?? []) {
      meal.ingredients = normalizeIngredients(meal.ingredients ?? []);
    }
  }
  return serialized;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();
    const { id } = await params;
    const plan = await MealPlan.findOne({ _id: id, userId: session.user.id });
    if (!plan) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(normalizePlanResponse(plan));
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch plan";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = patchBodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.message },
        { status: 400 }
      );
    }

    const { day, mealId, updates } = parsed.data;
    await connectDB();
    const { id } = await params;

    const plan = await MealPlan.findOne({
      _id: id,
      userId: session.user.id,
    });
    if (!plan) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const dayEntry = plan.days.find((d) => d.day === day);
    if (!dayEntry) {
      return NextResponse.json({ error: "Day not found" }, { status: 404 });
    }

    const meal = dayEntry.meals.find(
      (m) => m._id?.toString() === mealId
    );
    if (!meal) {
      return NextResponse.json({ error: "Meal not found" }, { status: 404 });
    }

    if (updates.name !== undefined) meal.name = updates.name;
    if (updates.time !== undefined) meal.time = updates.time;
    if (updates.servings !== undefined) meal.servings = updates.servings;
    if (updates.ingredients !== undefined) meal.ingredients = updates.ingredients;

    await plan.save();
    return NextResponse.json(normalizePlanResponse(plan));
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to update meal";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = deleteBodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.message },
        { status: 400 }
      );
    }

    const { day, mealId } = parsed.data;
    await connectDB();
    const { id } = await params;

    const plan = await MealPlan.findOne({
      _id: id,
      userId: session.user.id,
    });
    if (!plan) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const dayEntry = plan.days.find((d) => d.day === day);
    if (!dayEntry) {
      return NextResponse.json({ error: "Day not found" }, { status: 404 });
    }

    dayEntry.meals = dayEntry.meals.filter(
      (m) => m._id?.toString() !== mealId
    );
    await plan.save();
    return NextResponse.json(normalizePlanResponse(plan));
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to delete meal";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
