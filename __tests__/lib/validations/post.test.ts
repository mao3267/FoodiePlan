import { describe, it, expect } from "vitest";
import { createPostSchema, updatePostSchema } from "@/lib/validations/post";

describe("createPostSchema", () => {
  it("should accept valid content", () => {
    const result = createPostSchema.safeParse({ content: "Hello world" });
    expect(result.success).toBe(true);
  });

  it("should trim whitespace from content", () => {
    const result = createPostSchema.safeParse({ content: "  Hello  " });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.content).toBe("Hello");
    }
  });

  it("should reject empty content", () => {
    const result = createPostSchema.safeParse({ content: "" });
    expect(result.success).toBe(false);
  });

  it("should reject whitespace-only content", () => {
    const result = createPostSchema.safeParse({ content: "   " });
    expect(result.success).toBe(false);
  });

  it("should reject content over 2000 chars", () => {
    const result = createPostSchema.safeParse({
      content: "a".repeat(2001),
    });
    expect(result.success).toBe(false);
  });

  it("should accept content at exactly 2000 chars", () => {
    const result = createPostSchema.safeParse({
      content: "a".repeat(2000),
    });
    expect(result.success).toBe(true);
  });

  it("should accept valid JPEG data URL image", () => {
    const result = createPostSchema.safeParse({
      content: "Photo post",
      image: "data:image/jpeg;base64,abc123",
    });
    expect(result.success).toBe(true);
  });

  it("should accept valid PNG data URL image", () => {
    const result = createPostSchema.safeParse({
      content: "Photo post",
      image: "data:image/png;base64,abc123",
    });
    expect(result.success).toBe(true);
  });

  it("should reject SVG data URL image", () => {
    const result = createPostSchema.safeParse({
      content: "Photo post",
      image: "data:image/svg+xml;base64,abc123",
    });
    expect(result.success).toBe(false);
  });

  it("should reject non-data-URL image", () => {
    const result = createPostSchema.safeParse({
      content: "Photo post",
      image: "https://example.com/img.jpg",
    });
    expect(result.success).toBe(false);
  });

  it("should accept empty string image", () => {
    const result = createPostSchema.safeParse({
      content: "Text post",
      image: "",
    });
    expect(result.success).toBe(true);
  });

  it("should default image to empty string when omitted", () => {
    const result = createPostSchema.safeParse({ content: "Text post" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.image).toBe("");
    }
  });

  it("should reject missing content field", () => {
    const result = createPostSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

describe("updatePostSchema", () => {
  it("should accept partial update with content only", () => {
    const result = updatePostSchema.safeParse({ content: "Updated" });
    expect(result.success).toBe(true);
  });

  it("should accept partial update with image only", () => {
    const result = updatePostSchema.safeParse({
      image: "data:image/png;base64,xyz",
    });
    expect(result.success).toBe(true);
  });

  it("should reject empty object (at least one field required)", () => {
    const result = updatePostSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("should reject content exceeding 2000 chars", () => {
    const result = updatePostSchema.safeParse({
      content: "a".repeat(2001),
    });
    expect(result.success).toBe(false);
  });

  it("should reject non-data-URL image", () => {
    const result = updatePostSchema.safeParse({
      image: "https://example.com/img.jpg",
    });
    expect(result.success).toBe(false);
  });
});
