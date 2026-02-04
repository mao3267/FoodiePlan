import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { connectDB } from "@/lib/db/connection";
import { UserSettings } from "@/lib/db/models/user-settings";
import { updateSettingsSchema } from "@/lib/validations/user-settings";
import type { ClientUserSettings } from "@/lib/types";

function toClientSettings(doc: {
  _id: unknown;
  notifications: {
    emailEnabled: boolean;
    pushEnabled: boolean;
    reminderOffset: number;
  };
  defaultMealTimes: {
    Breakfast: string;
    Lunch: string;
    Dinner: string;
  };
  publicProfile: boolean;
  encryptedGeminiKey?: string | null;
  geminiKeyLastFour?: string | null;
}): ClientUserSettings {
  return {
    _id: String(doc._id),
    notifications: {
      emailEnabled: doc.notifications.emailEnabled,
      pushEnabled: doc.notifications.pushEnabled,
      reminderOffset: doc.notifications.reminderOffset as 10 | 30 | 60,
    },
    defaultMealTimes: {
      Breakfast: doc.defaultMealTimes.Breakfast,
      Lunch: doc.defaultMealTimes.Lunch,
      Dinner: doc.defaultMealTimes.Dinner,
    },
    publicProfile: doc.publicProfile,
    hasGeminiKey: !!doc.encryptedGeminiKey,
    maskedGeminiKey: doc.geminiKeyLastFour
      ? `****${doc.geminiKeyLastFour}`
      : null,
  };
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();
    const settings = await UserSettings.findOneAndUpdate(
      { userId: session.user.id },
      { $setOnInsert: { userId: session.user.id } },
      { upsert: true, new: true }
    );

    return NextResponse.json(toClientSettings(settings));
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch settings";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = updateSettingsSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.message },
        { status: 400 }
      );
    }

    const updateFields: Record<string, unknown> = {};

    if (parsed.data.notifications) {
      const { emailEnabled, pushEnabled, reminderOffset } =
        parsed.data.notifications;
      updateFields["notifications.emailEnabled"] = emailEnabled;
      updateFields["notifications.pushEnabled"] = pushEnabled;
      updateFields["notifications.reminderOffset"] = reminderOffset;
    }

    if (parsed.data.defaultMealTimes) {
      const { Breakfast, Lunch, Dinner } = parsed.data.defaultMealTimes;
      updateFields["defaultMealTimes.Breakfast"] = Breakfast;
      updateFields["defaultMealTimes.Lunch"] = Lunch;
      updateFields["defaultMealTimes.Dinner"] = Dinner;
    }

    if (parsed.data.publicProfile !== undefined) {
      updateFields.publicProfile = parsed.data.publicProfile;
    }

    await connectDB();
    const settings = await UserSettings.findOneAndUpdate(
      { userId: session.user.id },
      { $set: updateFields, $setOnInsert: { userId: session.user.id } },
      { upsert: true, new: true }
    );

    return NextResponse.json(toClientSettings(settings));
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to update settings";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
