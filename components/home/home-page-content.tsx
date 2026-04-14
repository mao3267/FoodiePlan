"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { AnimatePresence, motion } from "motion/react";
import { LandingPage } from "@/components/home/landing-page";
import { PostForm } from "@/components/home/post-form";
import { PostCard } from "@/components/home/post-card";
import type { ClientPost } from "@/lib/types";

export function HomePageContent() {
  const { status } = useSession();
  const [posts, setPosts] = useState<ClientPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);

  useEffect(() => {
    if (status !== "authenticated") return;

    const fetchPosts = async () => {
      try {
        const res = await fetch("/api/posts");
        if (res.ok) {
          const data = await res.json();
          setPosts(data);
        }
      } catch {
        setFetchError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, [status]);

  const handlePostCreated = useCallback((post: ClientPost) => {
    setPosts((prev) => [post, ...prev]);
  }, []);

  const handlePostUpdated = useCallback((updated: ClientPost) => {
    setPosts((prev) =>
      prev.map((p) => (p._id === updated._id ? updated : p))
    );
  }, []);

  const handlePostDeleted = useCallback((postId: string) => {
    setPosts((prev) => prev.filter((p) => p._id !== postId));
  }, []);

  if (status === "unauthenticated") {
    return <LandingPage />;
  }

  if (status === "loading" || isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 pt-10 pb-28">
        <div className="animate-pulse space-y-6">
          <div className="h-48 bg-muted rounded-3xl" />
          <div className="h-64 bg-muted rounded-3xl" />
          <div className="h-64 bg-muted rounded-3xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 pt-10 pb-28">
      <header className="mb-10">
        <span className="block text-xs font-headline font-bold tracking-widest uppercase text-[var(--color-secondary-strong)] mb-2">
          The Feed
        </span>
        <h1 className="text-5xl font-headline font-extrabold tracking-tight text-foreground mb-3">
          What&apos;s <span className="italic text-primary">cooking</span>.
        </h1>
        <p className="text-muted-foreground font-medium leading-relaxed">
          Share a plate, a tip, a triumph — your kitchen journal.
        </p>
      </header>

      <PostForm onPostCreated={handlePostCreated} />

      <div className="space-y-6">
        {fetchError && (
          <p className="text-center text-destructive py-4 font-medium">
            Failed to load posts. Please refresh the page.
          </p>
        )}
        {posts.length === 0 && !fetchError ? (
          <p className="text-center text-muted-foreground py-12 font-medium">
            No posts yet. Share what you&apos;re cooking!
          </p>
        ) : (
          <AnimatePresence initial={false}>
            {posts.map((post) => (
              <motion.div
                key={post._id}
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
              >
                <PostCard
                  post={post}
                  onPostUpdated={handlePostUpdated}
                  onPostDeleted={handlePostDeleted}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
