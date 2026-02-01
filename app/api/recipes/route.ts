import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { connectDB } from "@/lib/db/connection";
import { Recipe } from "@/lib/db/models/recipe";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  const recipes = await Recipe.find({ userId: session.user.id }).sort({ createdAt: -1 });
  return NextResponse.json(recipes);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  const body = await request.json();
  const recipe = await Recipe.create({ ...body, userId: session.user.id });
  return NextResponse.json(recipe, { status: 201 });
}
