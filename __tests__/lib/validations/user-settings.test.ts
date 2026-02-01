import { describe, it, expect } from "vitest";
import {
  updateProfileSchema,
  updateSettingsSchema,
} from "@/lib/validations/user-settings";

describe("updateProfileSchema", () => {
  it("should accept a valid name", () => {
    const result = updateProfileSchema.safeParse({ name: "Alice" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe("Alice");
    }
  });

  it("should trim whitespace from name", () => {
    const result = updateProfileSchema.safeParse({ name: "  Bob  " });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe("Bob");
    }
  });

  it("should reject empty name", () => {
    const result = updateProfileSchema.safeParse({ name: "" });
    expect(result.success).toBe(false);
  });

  it("should reject whitespace-only name", () => {
    const result = updateProfileSchema.safeParse({ name: "   " });
    expect(result.success).toBe(false);
  });

  it("should reject name exceeding 100 characters", () => {
    const result = updateProfileSchema.safeParse({ name: "a".repeat(101) });
    expect(result.success).toBe(false);
  });

  it("should reject missing name", () => {
    const result = updateProfileSchema.safeParse({});
    expect(result.success).toBe(false);
  });
  it("should accept valid bio", () => {
    const result = updateProfileSchema.safeParse({ name: "Alice", bio: "Hello world" });
    expect(result.success).toBe(true);
  });

  it("should reject bio exceeding 500 characters", () => {
    const result = updateProfileSchema.safeParse({ name: "Alice", bio: "a".repeat(501) });
    expect(result.success).toBe(false);
  });
});

describe("updateSettingsSchema", () => {
  it("should accept valid full settings", () => {
    const result = updateSettingsSchema.safeParse({
      notifications: {
        emailEnabled: true,
        pushEnabled: false,
        reminderOffset: 60,
      },
      defaultMealTimes: {
        Breakfast: "07:30",
        Lunch: "12:00",
        Dinner: "18:30",
      },
      publicProfile: false,
    });
    expect(result.success).toBe(true);
  });

  it("should accept partial settings (notifications only)", () => {
    const result = updateSettingsSchema.safeParse({
      notifications: {
        emailEnabled: true,
        pushEnabled: false,
        reminderOffset: 30,
      },
    });
    expect(result.success).toBe(true);
  });

  it("should accept partial settings (publicProfile only)", () => {
    const result = updateSettingsSchema.safeParse({
      publicProfile: true,
    });
    expect(result.success).toBe(true);
  });

  it("should accept empty object", () => {
    const result = updateSettingsSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("should reject invalid reminderOffset", () => {
    const result = updateSettingsSchema.safeParse({
      notifications: {
        emailEnabled: true,
        pushEnabled: false,
        reminderOffset: 45,
      },
    });
    expect(result.success).toBe(false);
  });

  it("should reject invalid time format", () => {
    const result = updateSettingsSchema.safeParse({
      defaultMealTimes: {
        Breakfast: "7:30",
        Lunch: "12:00",
        Dinner: "18:30",
      },
    });
    expect(result.success).toBe(false);
  });

  it("should reject time with invalid hours", () => {
    const result = updateSettingsSchema.safeParse({
      defaultMealTimes: {
        Breakfast: "25:00",
        Lunch: "12:00",
        Dinner: "18:30",
      },
    });
    expect(result.success).toBe(false);
  });

  it("should reject time with invalid minutes", () => {
    const result = updateSettingsSchema.safeParse({
      defaultMealTimes: {
        Breakfast: "08:00",
        Lunch: "12:60",
        Dinner: "18:30",
      },
    });
    expect(result.success).toBe(false);
  });

  it("should accept valid boundary times", () => {
    const result = updateSettingsSchema.safeParse({
      defaultMealTimes: {
        Breakfast: "00:00",
        Lunch: "23:59",
        Dinner: "12:30",
      },
    });
    expect(result.success).toBe(true);
  });
});
