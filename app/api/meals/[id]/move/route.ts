import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth/auth";
import { connectDB } from "@/lib/db/connection";
import { MealPlan } from "@/lib/db/models/meal-plan";
import { normalizePlanResponse } from "@/lib/utils/plan-response";
import { VALID_DAYS } from "@/lib/constants/days";

const moveBodySchema = z.object({
  fromDay: z.enum(VALID_DAYS),
  toDay: z.enum(VALID_DAYS),
  mealId: z.string().min(1),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = moveBodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.message },
        { status: 400 }
      );
    }

    const { fromDay, toDay, mealId } = parsed.data;
    await connectDB();
    const { id } = await params;

    const plan = await MealPlan.findOne({
      _id: id,
      userId: session.user.id,
    });
    if (!plan) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (fromDay === toDay) {
      return NextResponse.json(normalizePlanResponse(plan));
    }

    const fromEntry = plan.days.find((d) => d.day === fromDay);
    const toEntry = plan.days.find((d) => d.day === toDay);
    if (!fromEntry || !toEntry) {
      return NextResponse.json({ error: "Day not found" }, { status: 404 });
    }

    const mealDoc = fromEntry.meals.find(
      (m) => m._id?.toString() === mealId
    );
    if (!mealDoc) {
      return NextResponse.json({ error: "Meal not found" }, { status: 404 });
    }

    const mealObject = (mealDoc as unknown as { toObject: () => unknown }).toObject();
    fromEntry.meals = fromEntry.meals.filter(
      (m) => m._id?.toString() !== mealId
    );
    toEntry.meals.push(mealObject as never);

    await plan.save();
    return NextResponse.json(normalizePlanResponse(plan));
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to move meal";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
