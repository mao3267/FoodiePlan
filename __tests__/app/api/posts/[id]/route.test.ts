import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/lib/auth/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/db/connection", () => ({
  connectDB: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/lib/db/models/post", () => ({
  Post: {
    findOneAndUpdate: vi.fn(),
    findOneAndDelete: vi.fn(),
  },
}));

import { auth } from "@/lib/auth/auth";
import { Post } from "@/lib/db/models/post";
import { PATCH, DELETE } from "@/app/api/posts/[id]/route";

const VALID_ID = "507f1f77bcf86cd799439011";
const INVALID_ID = "not-a-valid-id";

function makeContext(id: string) {
  return { params: Promise.resolve({ id }) };
}

function makeRequest(
  method: string,
  body?: unknown
): NextRequest {
  const init: RequestInit = { method };
  if (body) {
    init.headers = { "Content-Type": "application/json" };
    init.body = JSON.stringify(body);
  }
  return new NextRequest(`http://localhost:3000/api/posts/${VALID_ID}`, init);
}

describe("PATCH /api/posts/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 401 if not authenticated", async () => {
    vi.mocked(auth).mockResolvedValueOnce(null);
    const res = await PATCH(
      makeRequest("PATCH", { content: "Updated" }),
      makeContext(VALID_ID)
    );
    expect(res.status).toBe(401);
  });

  it("should return 400 for invalid post ID", async () => {
    vi.mocked(auth).mockResolvedValueOnce({
      user: { id: "user123" },
      expires: "2099-01-01",
    });

    const res = await PATCH(
      makeRequest("PATCH", { content: "Updated" }),
      makeContext(INVALID_ID)
    );
    expect(res.status).toBe(400);

    const data = await res.json();
    expect(data.error).toBe("Invalid post ID");
  });

  it("should return 404 if post not found or not owned", async () => {
    vi.mocked(auth).mockResolvedValueOnce({
      user: { id: "user123" },
      expires: "2099-01-01",
    });
    vi.mocked(Post.findOneAndUpdate).mockResolvedValueOnce(null);

    const res = await PATCH(
      makeRequest("PATCH", { content: "Updated" }),
      makeContext(VALID_ID)
    );
    expect(res.status).toBe(404);

    expect(Post.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: VALID_ID, userId: "user123" },
      { content: "Updated" },
      { new: true }
    );
  });

  it("should update post content", async () => {
    vi.mocked(auth).mockResolvedValueOnce({
      user: { id: "user123" },
      expires: "2099-01-01",
    });

    const updated = {
      _id: VALID_ID,
      content: "Updated content",
      image: "",
      toJSON: () => ({
        _id: VALID_ID,
        content: "Updated content",
        image: "",
      }),
    };
    vi.mocked(Post.findOneAndUpdate).mockResolvedValueOnce(updated as never);

    const res = await PATCH(
      makeRequest("PATCH", { content: "Updated content" }),
      makeContext(VALID_ID)
    );
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.content).toBe("Updated content");
  });

  it("should return 400 for invalid image", async () => {
    vi.mocked(auth).mockResolvedValueOnce({
      user: { id: "user123" },
      expires: "2099-01-01",
    });

    const res = await PATCH(
      makeRequest("PATCH", { image: "https://bad.com/img.jpg" }),
      makeContext(VALID_ID)
    );
    expect(res.status).toBe(400);
  });

  it("should return 400 for empty update body", async () => {
    vi.mocked(auth).mockResolvedValueOnce({
      user: { id: "user123" },
      expires: "2099-01-01",
    });

    const res = await PATCH(
      makeRequest("PATCH", {}),
      makeContext(VALID_ID)
    );
    expect(res.status).toBe(400);
  });
});

describe("DELETE /api/posts/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 401 if not authenticated", async () => {
    vi.mocked(auth).mockResolvedValueOnce(null);
    const res = await DELETE(
      makeRequest("DELETE"),
      makeContext(VALID_ID)
    );
    expect(res.status).toBe(401);
  });

  it("should return 400 for invalid post ID", async () => {
    vi.mocked(auth).mockResolvedValueOnce({
      user: { id: "user123" },
      expires: "2099-01-01",
    });

    const res = await DELETE(
      makeRequest("DELETE"),
      makeContext(INVALID_ID)
    );
    expect(res.status).toBe(400);
  });

  it("should return 404 if post not found or not owned", async () => {
    vi.mocked(auth).mockResolvedValueOnce({
      user: { id: "user123" },
      expires: "2099-01-01",
    });
    vi.mocked(Post.findOneAndDelete).mockResolvedValueOnce(null);

    const res = await DELETE(
      makeRequest("DELETE"),
      makeContext(VALID_ID)
    );
    expect(res.status).toBe(404);

    expect(Post.findOneAndDelete).toHaveBeenCalledWith({
      _id: VALID_ID,
      userId: "user123",
    });
  });

  it("should delete post successfully", async () => {
    vi.mocked(auth).mockResolvedValueOnce({
      user: { id: "user123" },
      expires: "2099-01-01",
    });
    vi.mocked(Post.findOneAndDelete).mockResolvedValueOnce({
      _id: VALID_ID,
    } as never);

    const res = await DELETE(
      makeRequest("DELETE"),
      makeContext(VALID_ID)
    );
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.success).toBe(true);
  });
});
