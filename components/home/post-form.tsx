"use client";

import { useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { Send, ImagePlus, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ImageWithFallback } from "@/components/figma/image-with-fallback";
import { compressImage } from "@/lib/utils/compress-image";
import type { ClientPost } from "@/lib/types";

interface PostFormProps {
  onPostCreated: (post: ClientPost) => void;
}

export function PostForm({ onPostCreated }: PostFormProps) {
  const { data: session } = useSession();
  const [content, setContent] = useState("");
  const [image, setImage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const compressed = await compressImage(file);
      if (compressed.length > 2 * 1024 * 1024) {
        setError("Image is too large even after compression. Please use a smaller image.");
        return;
      }
      setError("");
      setImage(compressed);
    } catch {
      setError("Failed to process image. Please try a different file.");
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async () => {
    const trimmed = content.trim();
    if (!trimmed || isSubmitting) return;

    setError("");
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: trimmed, image }),
      });

      if (!res.ok) {
        throw new Error("Failed to create post");
      }

      const post = await res.json();
      onPostCreated(post);
      setContent("");
      setImage("");
    } catch {
      setError("Failed to create post. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="p-4 mb-6">
      <div className="flex items-center gap-3 mb-3">
        {session?.user?.image && (
          <ImageWithFallback
            src={session.user.image}
            alt={session.user.name ?? "User"}
            className="size-10 rounded-full object-cover"
          />
        )}
        <span className="font-semibold">{session?.user?.name ?? "User"}</span>
      </div>

      <Textarea
        placeholder="What's cooking?"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="mb-3 min-h-[100px]"
        maxLength={2000}
      />

      {image && (
        <div className="relative mb-3 inline-block">
          <ImageWithFallback
            src={image}
            alt="Upload preview"
            className="max-h-48 rounded-lg object-cover"
          />
          <button
            type="button"
            onClick={() => setImage("")}
            aria-label="Remove image"
            className="absolute top-1 right-1 rounded-full bg-black/60 p-1 text-white hover:bg-black/80"
          >
            <X className="size-4" />
          </button>
        </div>
      )}

      {error && (
        <p className="text-sm text-destructive mb-3">{error}</p>
      )}

      <div className="flex justify-between items-center">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageSelect}
          className="hidden"
        />
        <Button
          variant="ghost"
          size="sm"
          type="button"
          onClick={() => fileInputRef.current?.click()}
        >
          <ImagePlus className="size-5 mr-1" />
          Photo
        </Button>

        <Button
          onClick={handleSubmit}
          disabled={!content.trim() || isSubmitting}
          className="bg-green-600 hover:bg-green-700"
        >
          <Send className="size-4 mr-2" />
          {isSubmitting ? "Posting..." : "Post"}
        </Button>
      </div>
    </Card>
  );
}
