import { Suspense } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import { connectDB } from "@/lib/db/connection";
import { MealPlan } from "@/lib/db/models/meal-plan";
import { getWeekStart, getWeekDays, formatWeekStart } from "@/lib/utils/week-dates";
import { PlanPageContent } from "@/components/plan/plan-page-content";
import type { ClientMealPlan, ClientDayPlan } from "@/lib/types";

function buildFullWeek(
  plan: { _id: string | null; weekStart: string; days: ClientDayPlan[] }
): ClientMealPlan {
  const allDays = getWeekDays();
  const existingDays = new Map(plan.days.map((d) => [d.day, d]));

  const days: ClientDayPlan[] = allDays.map((day) => ({
    day,
    meals: existingDays.get(day)?.meals ?? [],
  }));

  return {
    _id: plan._id ?? "",
    weekStart: plan.weekStart,
    days,
  };
}

export default async function PlanPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  await connectDB();

  const thisWeekDate = getWeekStart(0);
  const nextWeekDate = getWeekStart(1);

  const [thisWeekDoc, nextWeekDoc] = await Promise.all([
    MealPlan.findOne({ userId: session.user.id, weekStart: thisWeekDate }),
    MealPlan.findOne({ userId: session.user.id, weekStart: nextWeekDate }),
  ]);

  const emptyDays: ClientDayPlan[] = getWeekDays().map((day) => ({
    day,
    meals: [],
  }));

  const thisWeekRaw = thisWeekDoc
    ? JSON.parse(JSON.stringify(thisWeekDoc))
    : { _id: null, weekStart: thisWeekDate.toISOString(), days: emptyDays };

  const nextWeekRaw = nextWeekDoc
    ? JSON.parse(JSON.stringify(nextWeekDoc))
    : { _id: null, weekStart: nextWeekDate.toISOString(), days: emptyDays };

  const thisWeekPlan = buildFullWeek(thisWeekRaw);
  const nextWeekPlan = buildFullWeek(nextWeekRaw);

  return (
    <Suspense>
      <PlanPageContent
        thisWeekPlan={thisWeekPlan}
        nextWeekPlan={nextWeekPlan}
        thisWeekStart={formatWeekStart(thisWeekDate)}
        nextWeekStart={formatWeekStart(nextWeekDate)}
      />
    </Suspense>
  );
}
