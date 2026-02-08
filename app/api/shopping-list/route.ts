import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth/auth";
import { connectDB } from "@/lib/db/connection";
import { MealPlan } from "@/lib/db/models/meal-plan";
import { ShoppingList } from "@/lib/db/models/shopping-list";
import { normalizeIngredients } from "@/lib/utils/normalize-ingredient";
import {
  consolidateIngredients,
  buildPlanKey,
} from "@/lib/utils/consolidate-ingredients";
import { getWeekStart, getTodayDayIndex, getWeekDays } from "@/lib/utils/week-dates";
import type { ClientMealPlan } from "@/lib/types";

const weeksSchema = z.enum(["this", "next", "both"]).default("this");

const addItemSchema = z.object({
  name: z.string().trim().min(1).max(200),
  quantity: z.number().min(0).default(1),
  unit: z.string().trim().max(50).default(""),
});

function getWeekDates(weeks: "this" | "next" | "both"): Date[] {
  switch (weeks) {
    case "this":
      return [getWeekStart(0)];
    case "next":
      return [getWeekStart(1)];
    case "both":
      return [getWeekStart(0), getWeekStart(1)];
  }
}

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const weeksParam = request.nextUrl.searchParams.get("weeks") ?? "this";
    const parsed = weeksSchema.safeParse(weeksParam);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid weeks parameter" },
        { status: 400 }
      );
    }

    await connectDB();

    const weekDates = getWeekDates(parsed.data);
    const plans = await MealPlan.find({
      userId: session.user.id,
      weekStart: { $in: weekDates },
    });

    const serializedPlans: ClientMealPlan[] = plans.map((plan) => {
      const serialized = JSON.parse(JSON.stringify(plan));
      for (const day of serialized.days ?? []) {
        for (const meal of day.meals ?? []) {
          meal.ingredients = normalizeIngredients(meal.ingredients ?? []);
          meal.seasonings = normalizeIngredients(meal.seasonings ?? []);
        }
      }
      return serialized;
    });

    const thisWeekStart = getWeekStart(0).getTime();
    const todayIndex = getTodayDayIndex();
    const allDays = getWeekDays();

    const filteredPlans = serializedPlans.map((plan) => {
      const isThisWeek = new Date(plan.weekStart).getTime() === thisWeekStart;
      if (!isThisWeek) return plan;
      return {
        ...plan,
        days: plan.days.filter((d) => allDays.indexOf(d.day) >= todayIndex),
      };
    });

    const consolidated = consolidateIngredients(filteredPlans);

    let shoppingList = await ShoppingList.findOne({
      userId: session.user.id,
    });

    if (!shoppingList) {
      shoppingList = await ShoppingList.create({
        userId: session.user.id,
        items: [],
      });
    }

    const existingPlanItems = new Map<string, (typeof shoppingList.items)[number]>();
    for (const item of shoppingList.items) {
      if (item.source === "plan" && item.planKey) {
        existingPlanItems.set(item.planKey, item);
      }
    }

    const updatedPlanItems = consolidated.map((c) => {
      const existing = existingPlanItems.get(c.planKey);
      return {
        name: c.displayName,
        quantity: c.quantity,
        unit: c.unit,
        source: "plan" as const,
        checked: existing?.checked ?? false,
        planKey: c.planKey,
        category: c.category,
      };
    });

    shoppingList.items = [
      ...updatedPlanItems,
      ...shoppingList.items.filter((item) => item.source === "manual"),
    ];

    await shoppingList.save();

    const responseItems = JSON.parse(JSON.stringify(shoppingList.items));
    return NextResponse.json({ items: responseItems });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch shopping list";
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
    const parsed = addItemSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.message },
        { status: 400 }
      );
    }

    await connectDB();

    let shoppingList = await ShoppingList.findOne({
      userId: session.user.id,
    });

    if (!shoppingList) {
      shoppingList = await ShoppingList.create({
        userId: session.user.id,
        items: [],
      });
    }

    const newItem = {
      name: parsed.data.name,
      quantity: parsed.data.quantity,
      unit: parsed.data.unit,
      source: "manual" as const,
      checked: false,
      planKey: buildPlanKey(parsed.data.name, parsed.data.unit),
      category: "food" as const,
    };

    shoppingList.items.push(newItem);
    await shoppingList.save();

    const savedItem =
      shoppingList.items[shoppingList.items.length - 1];
    return NextResponse.json(
      JSON.parse(JSON.stringify(savedItem)),
      { status: 201 }
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to add item";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
