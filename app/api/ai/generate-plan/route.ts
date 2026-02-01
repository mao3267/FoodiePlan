import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { generateMealPlan } from "@/lib/gemini/client";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { days, preferences, servings } = body;

  const plan = await generateMealPlan({
    days: days || 7,
    preferences: preferences || {},
    servings: servings || 2,
  });
  return NextResponse.json({ plan });
}
