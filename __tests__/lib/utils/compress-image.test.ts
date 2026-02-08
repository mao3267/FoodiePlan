import { describe, it, expect } from "vitest";
import { calculateDimensions } from "@/lib/utils/compress-image";

describe("calculateDimensions", () => {
  it("should not resize images smaller than max dimension", () => {
    expect(calculateDimensions(800, 600)).toEqual({ width: 800, height: 600 });
  });

  it("should not resize images at exactly max dimension", () => {
    expect(calculateDimensions(1200, 1200)).toEqual({
      width: 1200,
      height: 1200,
    });
  });

  it("should scale down wide images", () => {
    const result = calculateDimensions(2400, 1200);
    expect(result.width).toBe(1200);
    expect(result.height).toBe(600);
  });

  it("should scale down tall images", () => {
    const result = calculateDimensions(600, 2400);
    expect(result.width).toBe(300);
    expect(result.height).toBe(1200);
  });

  it("should scale down square images larger than max", () => {
    const result = calculateDimensions(2400, 2400);
    expect(result.width).toBe(1200);
    expect(result.height).toBe(1200);
  });

  it("should accept custom max dimension", () => {
    const result = calculateDimensions(1000, 500, 500);
    expect(result.width).toBe(500);
    expect(result.height).toBe(250);
  });

  it("should handle very small images", () => {
    expect(calculateDimensions(1, 1)).toEqual({ width: 1, height: 1 });
  });
});
