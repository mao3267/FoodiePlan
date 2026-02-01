import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { connectDB } from "@/lib/db/connection";
import { Ingredient } from "@/lib/db/models/ingredient";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  const ingredients = await Ingredient.find().sort({ name: 1 });
  return NextResponse.json(ingredients);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  const body = await request.json();
  const ingredient = await Ingredient.create(body);
  return NextResponse.json(ingredient, { status: 201 });
}
