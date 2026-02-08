"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { MoreHorizontal, Pencil, Trash2, X, ImagePlus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ImageWithFallback } from "@/components/figma/image-with-fallback";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { formatRelativeTime } from "@/lib/utils/relative-time";
import { compressImage } from "@/lib/utils/compress-image";
import type { ClientPost } from "@/lib/types";

interface PostCardProps {
  post: ClientPost;
  onPostUpdated: (post: ClientPost) => void;
  onPostDeleted: (postId: string) => void;
}

export function PostCard({ post, onPostUpdated, onPostDeleted }: PostCardProps) {
  const { data: session } = useSession();
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const [editImage, setEditImage] = useState(post.image);
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");

  const handleStartEdit = () => {
    setEditContent(post.content);
    setEditImage(post.image);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const compressed = await compressImage(file);
      if (compressed.length > 2 * 1024 * 1024) {
        setError("Image is too large. Please use a smaller image.");
        return;
      }
      setError("");
      setEditImage(compressed);
    } catch {
      setError("Failed to process image.");
    }

    e.target.value = "";
  };

  const handleSave = async () => {
    const trimmed = editContent.trim();
    if (!trimmed || isSaving) return;

    setError("");
    setIsSaving(true);
    try {
      const res = await fetch(`/api/posts/${post._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: trimmed, image: editImage }),
      });

      if (!res.ok) {
        throw new Error("Failed to update post");
      }

      const updated = await res.json();
      onPostUpdated(updated);
      setIsEditing(false);
    } catch {
      setError("Failed to save changes. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/posts/${post._id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete post");
      }

      onPostDeleted(post._id);
    } catch {
      setError("Failed to delete post. Please try again.");
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  return (
    <>
      <Card className="overflow-hidden">
        <div className="p-4">
          <div className="flex items-center gap-3 mb-3">
            {session?.user?.image && (
              <ImageWithFallback
                src={session.user.image}
                alt={session.user.name ?? "User"}
                className="size-10 rounded-full object-cover"
              />
            )}
            <div className="flex-1">
              <div className="font-semibold">
                {session?.user?.name ?? "User"}
              </div>
              <div className="text-sm text-muted-foreground">
                {formatRelativeTime(post.createdAt)}
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="size-8" aria-label="Post options">
                  <MoreHorizontal className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleStartEdit}>
                  <Pencil className="size-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setShowDeleteDialog(true)}
                  className="text-destructive"
                >
                  <Trash2 className="size-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {isEditing ? (
            <div>
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="mb-3 min-h-[80px]"
                maxLength={2000}
              />
              {editImage && (
                <div className="relative mb-3 inline-block">
                  <ImageWithFallback
                    src={editImage}
                    alt="Edit preview"
                    className="max-h-48 rounded-lg object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setEditImage("")}
                    aria-label="Remove image"
                    className="absolute top-1 right-1 rounded-full bg-black/60 p-1 text-white hover:bg-black/80"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              )}
              {error && (
                <p className="text-sm text-destructive mb-2">{error}</p>
              )}
              <div className="flex items-center gap-2">
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <Button variant="ghost" size="sm" asChild>
                    <span>
                      <ImagePlus className="size-4 mr-1" />
                      Photo
                    </span>
                  </Button>
                </label>
                <div className="flex-1" />
                <Button variant="ghost" size="sm" onClick={handleCancelEdit}>
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={!editContent.trim() || isSaving}
                >
                  {isSaving ? "Saving..." : "Save"}
                </Button>
              </div>
            </div>
          ) : (
            <p className="whitespace-pre-wrap">{post.content}</p>
          )}
        </div>

        {!isEditing && post.image && (
          <ImageWithFallback
            src={post.image}
            alt="Post content"
            className="w-full max-h-[480px] object-cover"
          />
        )}
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete post?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This post will be permanently
              deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
