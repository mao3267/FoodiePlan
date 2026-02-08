import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/auth/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/db/connection", () => ({
  connectDB: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/lib/db/models/post", () => ({
  Post: {
    find: vi.fn(),
    create: vi.fn(),
  },
}));

import { auth } from "@/lib/auth/auth";
import { Post } from "@/lib/db/models/post";
import { GET, POST } from "@/app/api/posts/route";

function makeRequest(body?: unknown): Request {
  if (!body) {
    return new Request("http://localhost:3000/api/posts");
  }
  return new Request("http://localhost:3000/api/posts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("GET /api/posts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 401 if not authenticated", async () => {
    vi.mocked(auth).mockResolvedValueOnce(null);
    const res = await GET();
    expect(res.status).toBe(401);
  });

  it("should return posts for authenticated user", async () => {
    vi.mocked(auth).mockResolvedValueOnce({
      user: { id: "user123" },
      expires: "2099-01-01",
    });

    const mockPosts = [
      { _id: "p1", content: "Hello", image: "", createdAt: new Date() },
    ];

    const mockQuery = {
      sort: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      lean: vi.fn().mockResolvedValue(mockPosts),
    };
    vi.mocked(Post.find).mockReturnValue(mockQuery as never);

    const res = await GET();
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data).toHaveLength(1);
    expect(data[0].content).toBe("Hello");

    expect(Post.find).toHaveBeenCalledWith({ userId: "user123" });
  });
});

describe("POST /api/posts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 401 if not authenticated", async () => {
    vi.mocked(auth).mockResolvedValueOnce(null);
    const res = await POST(makeRequest({ content: "Hello" }));
    expect(res.status).toBe(401);
  });

  it("should return 400 for empty content", async () => {
    vi.mocked(auth).mockResolvedValueOnce({
      user: { id: "user123" },
      expires: "2099-01-01",
    });

    const res = await POST(makeRequest({ content: "" }));
    expect(res.status).toBe(400);
  });

  it("should return 400 for missing content", async () => {
    vi.mocked(auth).mockResolvedValueOnce({
      user: { id: "user123" },
      expires: "2099-01-01",
    });

    const res = await POST(makeRequest({}));
    expect(res.status).toBe(400);
  });

  it("should create post with valid content", async () => {
    vi.mocked(auth).mockResolvedValueOnce({
      user: { id: "user123" },
      expires: "2099-01-01",
    });

    const mockPost = {
      _id: "p1",
      userId: "user123",
      content: "My meal",
      image: "",
      toJSON: () => ({
        _id: "p1",
        userId: "user123",
        content: "My meal",
        image: "",
      }),
    };
    vi.mocked(Post.create).mockResolvedValueOnce(mockPost as never);

    const res = await POST(makeRequest({ content: "My meal" }));
    expect(res.status).toBe(201);

    const data = await res.json();
    expect(data.content).toBe("My meal");
    expect(Post.create).toHaveBeenCalledWith({
      userId: "user123",
      content: "My meal",
      image: "",
    });
  });

  it("should create post with image", async () => {
    vi.mocked(auth).mockResolvedValueOnce({
      user: { id: "user123" },
      expires: "2099-01-01",
    });

    const mockPost = {
      _id: "p1",
      userId: "user123",
      content: "Photo post",
      image: "data:image/jpeg;base64,abc",
      toJSON: () => ({
        _id: "p1",
        content: "Photo post",
        image: "data:image/jpeg;base64,abc",
      }),
    };
    vi.mocked(Post.create).mockResolvedValueOnce(mockPost as never);

    const res = await POST(
      makeRequest({
        content: "Photo post",
        image: "data:image/jpeg;base64,abc",
      })
    );
    expect(res.status).toBe(201);
  });

  it("should return 400 for invalid image URL", async () => {
    vi.mocked(auth).mockResolvedValueOnce({
      user: { id: "user123" },
      expires: "2099-01-01",
    });

    const res = await POST(
      makeRequest({
        content: "Post",
        image: "https://example.com/img.jpg",
      })
    );
    expect(res.status).toBe(400);
  });
});
