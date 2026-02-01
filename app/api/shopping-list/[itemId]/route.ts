import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth/auth";
import { connectDB } from "@/lib/db/connection";
import { ShoppingList } from "@/lib/db/models/shopping-list";

const patchSchema = z.object({
  checked: z.boolean().optional(),
  name: z.string().trim().min(1).max(200).optional(),
  quantity: z.number().min(0).optional(),
  unit: z.string().trim().max(50).optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ itemId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = patchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.message },
        { status: 400 }
      );
    }

    await connectDB();
    const { itemId } = await params;

    const shoppingList = await ShoppingList.findOne({
      userId: session.user.id,
    });
    if (!shoppingList) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const item = shoppingList.items.find(
      (i) => i._id?.toString() === itemId
    );
    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    const { checked, name, quantity, unit } = parsed.data;
    const hasNonCheckedUpdates =
      name !== undefined || quantity !== undefined || unit !== undefined;

    if (item.source === "plan" && hasNonCheckedUpdates) {
      return NextResponse.json(
        { error: "Plan items can only be checked/unchecked. Edit them in your meal plan." },
        { status: 403 }
      );
    }

    if (checked !== undefined) item.checked = checked;
    if (name !== undefined) item.name = name;
    if (quantity !== undefined) item.quantity = quantity;
    if (unit !== undefined) item.unit = unit;

    await shoppingList.save();
    return NextResponse.json(JSON.parse(JSON.stringify(item)));
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to update item";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ itemId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();
    const { itemId } = await params;

    const shoppingList = await ShoppingList.findOne({
      userId: session.user.id,
    });
    if (!shoppingList) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const item = shoppingList.items.find(
      (i) => i._id?.toString() === itemId
    );
    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    if (item.source === "plan") {
      return NextResponse.json(
        { error: "Plan items cannot be deleted from cart. Edit them in your meal plan." },
        { status: 403 }
      );
    }

    shoppingList.items = shoppingList.items.filter(
      (i) => i._id?.toString() !== itemId
    );
    await shoppingList.save();

    return NextResponse.json({ success: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to delete item";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
