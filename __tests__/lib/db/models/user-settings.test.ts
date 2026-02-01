import { describe, it, expect, beforeAll, afterAll, afterEach } from "vitest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { UserSettings } from "@/lib/db/models/user-settings";

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterEach(async () => {
  await UserSettings.deleteMany({});
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe("UserSettings Model", () => {
  it("should create settings with default values", async () => {
    const userId = new mongoose.Types.ObjectId();
    const settings = await UserSettings.create({ userId });

    expect(settings.userId.toString()).toBe(userId.toString());
    expect(settings.notifications.emailEnabled).toBe(false);
    expect(settings.notifications.pushEnabled).toBe(false);
    expect(settings.notifications.reminderOffset).toBe(30);
    expect(settings.defaultMealTimes.Breakfast).toBe("08:00");
    expect(settings.defaultMealTimes.Lunch).toBe("12:00");
    expect(settings.defaultMealTimes.Dinner).toBe("18:00");
    expect(settings.publicProfile).toBe(true);
    expect(settings.createdAt).toBeInstanceOf(Date);
    expect(settings.updatedAt).toBeInstanceOf(Date);
  });

  it("should create settings with custom values", async () => {
    const userId = new mongoose.Types.ObjectId();
    const settings = await UserSettings.create({
      userId,
      notifications: {
        emailEnabled: true,
        pushEnabled: true,
        reminderOffset: 60,
      },
      defaultMealTimes: {
        Breakfast: "07:30",
        Lunch: "11:30",
        Dinner: "19:00",
      },
      publicProfile: false,
    });

    expect(settings.notifications.emailEnabled).toBe(true);
    expect(settings.notifications.pushEnabled).toBe(true);
    expect(settings.notifications.reminderOffset).toBe(60);
    expect(settings.defaultMealTimes.Breakfast).toBe("07:30");
    expect(settings.publicProfile).toBe(false);
  });

  it("should enforce unique userId constraint", async () => {
    const userId = new mongoose.Types.ObjectId();
    await UserSettings.create({ userId });

    await expect(UserSettings.create({ userId })).rejects.toThrow();
  });

  it("should require userId", async () => {
    await expect(UserSettings.create({})).rejects.toThrow();
  });

  it("should reject invalid reminderOffset values", async () => {
    const userId = new mongoose.Types.ObjectId();

    await expect(
      UserSettings.create({
        userId,
        notifications: { reminderOffset: 45 as any },
      })
    ).rejects.toThrow();
  });

  it("should find settings by userId", async () => {
    const userId = new mongoose.Types.ObjectId();
    await UserSettings.create({ userId });

    const found = await UserSettings.findOne({ userId });
    expect(found).not.toBeNull();
    expect(found!.userId.toString()).toBe(userId.toString());
  });

  it("should update settings without mutation", async () => {
    const userId = new mongoose.Types.ObjectId();
    const original = await UserSettings.create({ userId });

    const updated = await UserSettings.findOneAndUpdate(
      { userId },
      { $set: { "notifications.emailEnabled": true, publicProfile: false } },
      { new: true }
    );

    expect(updated!.notifications.emailEnabled).toBe(true);
    expect(updated!.publicProfile).toBe(false);
    expect(updated!.notifications.reminderOffset).toBe(30);
    expect(original.notifications.emailEnabled).toBe(false);
  });
});
