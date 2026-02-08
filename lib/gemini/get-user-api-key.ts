import { connectDB } from "@/lib/db/connection";
import { UserSettings } from "@/lib/db/models/user-settings";
import { decrypt } from "@/lib/crypto/encryption";

export async function getUserGeminiApiKey(
  userId: string
): Promise<string | null> {
  await connectDB();
  const settings = await UserSettings.findOne(
    { userId },
    { encryptedGeminiKey: 1 }
  ).lean();

  if (!settings?.encryptedGeminiKey) {
    return null;
  }

  try {
    return decrypt(settings.encryptedGeminiKey);
  } catch {
    return null;
  }
}
