import {
  describe,
  it,
  expect,
  beforeAll,
  afterAll,
  afterEach,
  vi,
} from "vitest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { randomBytes } from "crypto";
import { UserSettings } from "@/lib/db/models/user-settings";
import { encrypt } from "@/lib/crypto/encryption";

vi.mock("@/lib/db/connection", () => ({
  connectDB: vi.fn().mockResolvedValue(undefined),
}));

const VALID_KEY = randomBytes(32).toString("hex");

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  process.env.ENCRYPTION_KEY = VALID_KEY;
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterEach(async () => {
  await UserSettings.deleteMany({});
  vi.restoreAllMocks();
});

afterAll(async () => {
  delete process.env.ENCRYPTION_KEY;
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe("getUserGeminiApiKey", () => {
  it("should return null when user has no settings", async () => {
    const { getUserGeminiApiKey } = await import(
      "@/lib/gemini/get-user-api-key"
    );
    const userId = new mongoose.Types.ObjectId().toString();
    const result = await getUserGeminiApiKey(userId);
    expect(result).toBeNull();
  });

  it("should return null when user has no encrypted key", async () => {
    const { getUserGeminiApiKey } = await import(
      "@/lib/gemini/get-user-api-key"
    );
    const userId = new mongoose.Types.ObjectId();
    await UserSettings.create({ userId });

    const result = await getUserGeminiApiKey(userId.toString());
    expect(result).toBeNull();
  });

  it("should decrypt and return the stored key", async () => {
    const { getUserGeminiApiKey } = await import(
      "@/lib/gemini/get-user-api-key"
    );
    const userId = new mongoose.Types.ObjectId();
    const apiKey = "AIzaSyD-test-key-1234567890";
    const encryptedGeminiKey = encrypt(apiKey);

    await UserSettings.create({
      userId,
      encryptedGeminiKey,
      geminiKeyLastFour: apiKey.slice(-4),
    });

    const result = await getUserGeminiApiKey(userId.toString());
    expect(result).toBe(apiKey);
  });

  it("should return null silently when decryption fails", async () => {
    const { getUserGeminiApiKey } = await import(
      "@/lib/gemini/get-user-api-key"
    );
    const userId = new mongoose.Types.ObjectId();

    await UserSettings.create({
      userId,
      encryptedGeminiKey: "invalid:corrupted:data",
      geminiKeyLastFour: "data",
    });

    const result = await getUserGeminiApiKey(userId.toString());
    expect(result).toBeNull();
  });

  it("should return null when encryptedGeminiKey is explicitly null", async () => {
    const { getUserGeminiApiKey } = await import(
      "@/lib/gemini/get-user-api-key"
    );
    const userId = new mongoose.Types.ObjectId();
    await UserSettings.create({
      userId,
      encryptedGeminiKey: null,
      geminiKeyLastFour: null,
    });

    const result = await getUserGeminiApiKey(userId.toString());
    expect(result).toBeNull();
  });
});
