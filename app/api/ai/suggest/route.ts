import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { suggestRecipes } from "@/lib/gemini/client";
import { getUserGeminiApiKey } from "@/lib/gemini/get-user-api-key";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { ingredients, preferences } = body;

    if (!ingredients || !Array.isArray(ingredients)) {
      return NextResponse.json(
        { error: "ingredients must be an array of strings" },
        { status: 400 }
      );
    }

    const userApiKey = await getUserGeminiApiKey(session.user.id);
    const suggestions = await suggestRecipes(
      ingredients,
      preferences,
      userApiKey
    );
    return NextResponse.json({ suggestions });
  } catch {
    return NextResponse.json(
      { error: "Failed to generate suggestions" },
      { status: 500 }
    );
  }
}
