import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth/auth";
import { connectDB } from "@/lib/db/connection";
import { MealPlan } from "@/lib/db/models/meal-plan";
import { getWeekDays } from "@/lib/utils/week-dates";
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

const mealBodySchema = z.object({
  name: z.string().trim().min(1).max(200),
  time: z.enum(["Breakfast", "Lunch", "Dinner", "Snack"]),
  servings: z.number().int().min(1).max(100),
  ingredients: z.array(ingredientSchema).max(50).default([]),
});

const postBodySchema = z.object({
  weekStart: z.string().min(1),
  day: z.enum(VALID_DAYS),
  meal: mealBodySchema,
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

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();

    const weekStartParam = request.nextUrl.searchParams.get("weekStart");

    if (weekStartParam) {
      const weekStart = new Date(weekStartParam);
      if (isNaN(weekStart.getTime())) {
        return NextResponse.json(
          { error: "Invalid weekStart date" },
          { status: 400 }
        );
      }

      const plan = await MealPlan.findOne({
        userId: session.user.id,
        weekStart,
      });

      if (plan) {
        return NextResponse.json(normalizePlanResponse(plan));
      }

      const emptyDays = getWeekDays().map((day) => ({ day, meals: [] }));
      return NextResponse.json({
        _id: null,
        weekStart: weekStart.toISOString(),
        days: emptyDays,
      });
    }

    const plans = await MealPlan.find({ userId: session.user.id }).sort({
      weekStart: -1,
    });
    return NextResponse.json(plans.map(normalizePlanResponse));
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch meal plans";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = postBodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.message },
        { status: 400 }
      );
    }

    const { weekStart, day, meal } = parsed.data;
    const weekDate = new Date(weekStart);
    if (isNaN(weekDate.getTime())) {
      return NextResponse.json(
        { error: "Invalid weekStart date" },
        { status: 400 }
      );
    }

    await connectDB();

    let plan = await MealPlan.findOne({
      userId: session.user.id,
      weekStart: weekDate,
    });

    if (!plan) {
      const days = getWeekDays().map((d) => ({
        day: d,
        meals: d === day ? [meal] : [],
      }));
      plan = await MealPlan.create({
        userId: session.user.id,
        weekStart: weekDate,
        days,
      });
    } else {
      const dayEntry = plan.days.find((d) => d.day === day);
      if (dayEntry) {
        dayEntry.meals.push(meal);
      } else {
        plan.days.push({ day, meals: [meal] });
      }
      await plan.save();
    }

    return NextResponse.json(normalizePlanResponse(plan), { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create meal";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
