import mongoose, { Schema, type Model } from "mongoose";
import type {
  IUserSettings,
  INotificationPreferences,
  IDefaultMealTimes,
} from "@/lib/types";

const notificationPreferencesSchema = new Schema<INotificationPreferences>(
  {
    emailEnabled: { type: Boolean, default: false },
    pushEnabled: { type: Boolean, default: false },
    reminderOffset: { type: Number, enum: [10, 30, 60], default: 30 },
  },
  { _id: false }
);

const defaultMealTimesSchema = new Schema<IDefaultMealTimes>(
  {
    Breakfast: { type: String, default: "08:00" },
    Lunch: { type: String, default: "12:00" },
    Dinner: { type: String, default: "18:00" },
  },
  { _id: false }
);

const userSettingsSchema = new Schema<IUserSettings>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    notifications: {
      type: notificationPreferencesSchema,
      default: () => ({}),
    },
    defaultMealTimes: {
      type: defaultMealTimesSchema,
      default: () => ({}),
    },
    publicProfile: { type: Boolean, default: true },
    encryptedGeminiKey: { type: String, default: null },
    geminiKeyLastFour: { type: String, default: null },
  },
  { timestamps: true }
);

export const UserSettings: Model<IUserSettings> =
  mongoose.models.UserSettings ||
  mongoose.model<IUserSettings>("UserSettings", userSettingsSchema);
