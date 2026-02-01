import { z } from "zod";

const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;

export const updateProfileSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  bio: z.string().max(500, "Bio must be less than 500 characters").optional(),
});

export const updateSettingsSchema = z.object({
  notifications: z
    .object({
      emailEnabled: z.boolean(),
      pushEnabled: z.boolean(),
      reminderOffset: z.union([
        z.literal(10),
        z.literal(30),
        z.literal(60),
      ]),
    })
    .optional(),
  defaultMealTimes: z
    .object({
      Breakfast: z.string().regex(TIME_REGEX, "Invalid time format (HH:mm)"),
      Lunch: z.string().regex(TIME_REGEX, "Invalid time format (HH:mm)"),
      Dinner: z.string().regex(TIME_REGEX, "Invalid time format (HH:mm)"),
    })
    .optional(),
  publicProfile: z.boolean().optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;
