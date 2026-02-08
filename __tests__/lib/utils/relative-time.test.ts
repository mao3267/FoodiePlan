import { describe, it, expect, vi, afterEach } from "vitest";
import { formatRelativeTime } from "@/lib/utils/relative-time";

describe("formatRelativeTime", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("should return 'Just now' for less than a minute ago", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-06-01T12:00:30Z"));
    expect(formatRelativeTime("2025-06-01T12:00:00Z")).toBe("Just now");
  });

  it("should return minutes ago", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-06-01T12:05:00Z"));
    expect(formatRelativeTime("2025-06-01T12:00:00Z")).toBe("5m ago");
  });

  it("should return hours ago", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-06-01T15:00:00Z"));
    expect(formatRelativeTime("2025-06-01T12:00:00Z")).toBe("3h ago");
  });

  it("should return days ago for less than 7 days", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-06-03T12:00:00Z"));
    expect(formatRelativeTime("2025-06-01T12:00:00Z")).toBe("2d ago");
  });

  it("should return locale date for 7+ days ago", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-06-15T12:00:00Z"));
    const result = formatRelativeTime("2025-06-01T12:00:00Z");
    // Should be a locale date string, not relative
    expect(result).not.toContain("ago");
    expect(result).not.toBe("Just now");
  });

  it("should return '1m ago' at exactly 60 seconds", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-06-01T12:01:00Z"));
    expect(formatRelativeTime("2025-06-01T12:00:00Z")).toBe("1m ago");
  });

  it("should return '1h ago' at exactly 60 minutes", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-06-01T13:00:00Z"));
    expect(formatRelativeTime("2025-06-01T12:00:00Z")).toBe("1h ago");
  });

  it("should return 'Unknown date' for invalid date string", () => {
    expect(formatRelativeTime("not-a-date")).toBe("Unknown date");
  });
});
