import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { connectDB } from "@/lib/db/connection";
import { MealPlan } from "@/lib/db/models/meal-plan";
import { chatWithAgent } from "@/lib/gemini/chat";
import { getUserGeminiApiKey } from "@/lib/gemini/get-user-api-key";
import { chatRequestSchema } from "@/lib/validations/chat";
import { getWeekDays } from "@/lib/utils/week-dates";
import { getGeminiErrorMessage, getGeminiErrorStatus } from "@/lib/gemini/error";
import type { AiPlanMeal, ChatApiResponse } from "@/lib/types/chat";

async function saveMealsToDB(
  userId: string,
  weekStart: string,
  meals: AiPlanMeal[]
): Promise<number> {
  await connectDB();

  const [y, m, d] = weekStart.split("-").map(Number);
  const weekDate = new Date(y, m - 1, d);
  if (isNaN(weekDate.getTime())) {
    throw new Error("Invalid weekStart date from AI response");
  }
  weekDate.setHours(0, 0, 0, 0);

  let plan = await MealPlan.findOne({ userId, weekStart: weekDate });

  if (!plan) {
    const days = getWeekDays().map((day) => ({ day, meals: [] as typeof meals }));
    plan = await MealPlan.create({ userId, weekStart: weekDate, days });
  }

  const matchedMeals = meals.filter((meal) =>
    plan.days.some((d) => d.day === meal.day)
  );

  let added = 0;
  for (const meal of matchedMeals) {
    const dayEntry = plan.days.find((d) => d.day === meal.day);
    if (!dayEntry) continue;

    const alreadyExists = dayEntry.meals.some(
      (existing) =>
        existing.name === meal.name &&
        existing.time === meal.time
    );
    if (!alreadyExists) {
      dayEntry.meals.push({
        name: meal.name,
        time: meal.time,
        servings: meal.servings,
        ingredients: meal.ingredients,
        seasonings: meal.seasonings ?? [],
      });
      added++;
    }
  }

  await plan.save();
  return added;
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = chatRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.message },
        { status: 400 }
      );
    }

    const userApiKey = await getUserGeminiApiKey(session.user.id);
    if (!userApiKey) {
      return NextResponse.json(
        { error: "No Gemini API key configured. Please add your API key in Settings." },
        { status: 400 }
      );
    }
    const aiResponse = await chatWithAgent(parsed.data.messages, userApiKey);

    if (aiResponse.type === "message") {
      const response: ChatApiResponse = {
        type: "message",
        content: aiResponse.content,
      };
      return NextResponse.json(response);
    }

    const mealsAdded = await saveMealsToDB(
      session.user.id,
      aiResponse.weekStart,
      aiResponse.meals
    );

    const response: ChatApiResponse = {
      type: "plan",
      content: aiResponse.content,
      weekStart: aiResponse.weekStart,
      mealsAdded,
      mealNames: aiResponse.meals.map((m) => m.name),
    };
    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      { error: getGeminiErrorMessage(error, "Failed to process chat message") },
      { status: getGeminiErrorStatus(error) }
    );
  }
}
