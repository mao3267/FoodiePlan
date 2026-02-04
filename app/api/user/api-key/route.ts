import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { connectDB } from "@/lib/db/connection";
import { UserSettings } from "@/lib/db/models/user-settings";
import { saveApiKeySchema } from "@/lib/validations/user-settings";
import { encrypt } from "@/lib/crypto/encryption";

export async function PUT(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = saveApiKeySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid API key" },
        { status: 400 }
      );
    }

    const { apiKey } = parsed.data;
    const encryptedGeminiKey = encrypt(apiKey);
    const geminiKeyLastFour = apiKey.slice(-4);

    await connectDB();
    await UserSettings.findOneAndUpdate(
      { userId: session.user.id },
      {
        $set: { encryptedGeminiKey, geminiKeyLastFour },
        $setOnInsert: { userId: session.user.id },
      },
      { upsert: true }
    );

    return NextResponse.json({
      hasGeminiKey: true,
      maskedGeminiKey: `****${geminiKeyLastFour}`,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to save API key" },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();
    await UserSettings.findOneAndUpdate(
      { userId: session.user.id },
      { $set: { encryptedGeminiKey: null, geminiKeyLastFour: null } }
    );

    return NextResponse.json({
      hasGeminiKey: false,
      maskedGeminiKey: null,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to remove API key" },
      { status: 500 }
    );
  }
}
