import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { generateMealPlan } from "@/lib/gemini/client";
import { getUserGeminiApiKey } from "@/lib/gemini/get-user-api-key";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { days, preferences, servings } = body;

    const userApiKey = await getUserGeminiApiKey(session.user.id);
    const plan = await generateMealPlan(
      {
        days: days || 7,
        preferences: preferences || {},
        servings: servings || 2,
      },
      userApiKey
    );
    return NextResponse.json({ plan });
  } catch {
    return NextResponse.json(
      { error: "Failed to generate meal plan" },
      { status: 500 }
    );
  }
}
