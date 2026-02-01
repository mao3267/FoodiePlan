import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { suggestRecipes } from "@/lib/gemini/client";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { ingredients, preferences } = body;

  if (!ingredients || !Array.isArray(ingredients)) {
    return NextResponse.json(
      { error: "ingredients must be an array of strings" },
      { status: 400 }
    );
  }

  const suggestions = await suggestRecipes(ingredients, preferences);
  return NextResponse.json({ suggestions });
}
