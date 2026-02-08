"use client";

import Image from "next/image";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";

const MEAL_IMAGES = [
  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&h=200&fit=crop",
  "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=200&h=200&fit=crop",
  "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=200&h=200&fit=crop",
  "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=200&h=200&fit=crop",
  "https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=200&h=200&fit=crop",
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=200&h=200&fit=crop",
  "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=200&h=200&fit=crop",
  "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=200&h=200&fit=crop",
  "https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=200&h=200&fit=crop",
  "https://images.unsplash.com/photo-1529042410759-befb1204b468?w=200&h=200&fit=crop",
];

const FOOD_EMOJI = ["🍕", "🥗", "🍜", "🌮", "🍣", "🥑", "🍰", "🍝"];

interface FloatingItem {
  type: "image" | "emoji";
  src?: string;
  emoji?: string;
  delay: number;
  duration: number;
  startX: number;
  size: number;
}

const FLOATING_ITEMS: FloatingItem[] = [
  ...MEAL_IMAGES.map((src, i) => ({
    type: "image" as const,
    src,
    delay: i * 2.5,
    duration: 18 + (i % 3) * 4,
    startX: (i * 10) % 80 + 10,
    size: 80 + (i % 3) * 20,
  })),
  ...FOOD_EMOJI.map((emoji, i) => ({
    type: "emoji" as const,
    emoji,
    delay: i * 3 + 1.2,
    duration: 15 + (i % 3) * 5,
    startX: (i * 12 + 5) % 80 + 10,
    size: 40 + (i % 2) * 16,
  })),
];

export function LandingPage() {
  return (
    <div className="fixed inset-0 overflow-hidden bg-background">
      {/* Floating items */}
      <div className="absolute inset-0" aria-hidden="true">
        {FLOATING_ITEMS.map((item, i) => (
          <div
            key={i}
            className="absolute animate-float-diagonal"
            style={{
              animationDelay: `${item.delay}s`,
              animationDuration: `${item.duration}s`,
              left: `${item.startX}%`,
              top: "-10%",
            }}
          >
            {item.type === "image" && item.src ? (
              <div
                className="rounded-xl overflow-hidden shadow-lg opacity-80"
                style={{ width: item.size, height: item.size }}
              >
                <Image
                  src={item.src}
                  alt=""
                  width={item.size}
                  height={item.size}
                  className="object-cover w-full h-full"
                  unoptimized
                />
              </div>
            ) : (
              <span
                className="opacity-70 select-none"
                style={{ fontSize: item.size }}
              >
                {item.emoji}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 bg-background/40" />

      {/* Center content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full px-4 text-center">
        <h1 className="text-6xl font-bold tracking-tight sm:text-7xl mb-4">
          FoodiePlan
        </h1>
        <p className="text-xl text-muted-foreground max-w-md mb-8">
          Plan your meals, organize your groceries, and discover new recipes
        </p>
        <Button
          size="lg"
          className="gap-2 text-base px-6 py-5"
          onClick={() => signIn("google")}
        >
          <svg className="size-5" viewBox="0 0 24 24">
            <path
              fill="#fff"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#fff"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#fff"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#fff"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Sign in with Google
        </Button>
      </div>
    </div>
  );
}
