import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { buildChatSystemPrompt } from "@/lib/gemini/chat-prompt";

describe("buildChatSystemPrompt", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-02-05T12:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should include today's date", () => {
    const prompt = buildChatSystemPrompt();
    expect(prompt).toContain("2025-02-05");
  });

  it("should include this week's Monday date", () => {
    const prompt = buildChatSystemPrompt();
    expect(prompt).toContain("This week's Monday: 2025-02-03");
  });

  it("should include next week's Monday date", () => {
    const prompt = buildChatSystemPrompt();
    expect(prompt).toContain("Next week's Monday: 2025-02-10");
  });

  it("should instruct to return JSON format", () => {
    const prompt = buildChatSystemPrompt();
    expect(prompt).toContain('"type": "message"');
    expect(prompt).toContain('"type": "plan"');
  });

  it("should include valid day names", () => {
    const prompt = buildChatSystemPrompt();
    expect(prompt).toContain("Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday");
  });

  it("should include valid meal times", () => {
    const prompt = buildChatSystemPrompt();
    expect(prompt).toContain("Breakfast, Lunch, Dinner, Snack");
  });

  it("should include three conversation phases", () => {
    const prompt = buildChatSystemPrompt();
    expect(prompt).toContain("Phase 1");
    expect(prompt).toContain("Phase 2");
    expect(prompt).toContain("Phase 3");
  });

  it("should default to 2 servings", () => {
    const prompt = buildChatSystemPrompt();
    expect(prompt).toContain("Servings: 2");
  });

  it("should require user confirmation before generating plan", () => {
    const prompt = buildChatSystemPrompt();
    expect(prompt).toContain('Never use "plan" type until the user has confirmed');
  });

  it("should instruct to avoid duplicate meals", () => {
    const prompt = buildChatSystemPrompt();
    expect(prompt).toContain("MUST NOT include any meal that appears in a \"Meals added:\" line");
  });
});
