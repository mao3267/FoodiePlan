import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { suggestRecipes } from "@/lib/gemini/client";
import { getUserGeminiApiKey } from "@/lib/gemini/get-user-api-key";
import { getGeminiErrorMessage, getGeminiErrorStatus } from "@/lib/gemini/error";
import { suggestRecipesSchema } from "@/lib/validations/ai";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = suggestRecipesSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input" },
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
    const suggestions = await suggestRecipes(
      parsed.data.ingredients,
      parsed.data.preferences,
      userApiKey
    );
    return NextResponse.json({ suggestions });
  } catch (error) {
    return NextResponse.json(
      { error: getGeminiErrorMessage(error, "Failed to generate suggestions") },
      { status: getGeminiErrorStatus(error) }
    );
  }
}
