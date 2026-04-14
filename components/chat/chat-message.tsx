"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ChatApiResponse } from "@/lib/types/chat";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  plan?: { weekStart: string; mealsAdded: number; mealNames: string[] } | null;
}

export function ChatMessage({ role, content, plan }: ChatMessageProps) {
  const isUser = role === "user";

  return (
    <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
          isUser
            ? "signature-gradient"
            : "bg-muted text-foreground"
        )}
      >
        <p className="whitespace-pre-wrap">{content}</p>
        {plan && plan.mealsAdded > 0 && (
          <div className="mt-2 flex items-center gap-2">
            <Badge className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full font-headline font-bold">
              {plan.mealsAdded} {plan.mealsAdded === 1 ? "meal" : "meals"} added
            </Badge>
            <Link
              href="/plan"
              className="text-xs font-headline font-bold underline underline-offset-2 opacity-80 hover:opacity-100"
            >
              View plan
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export function chatApiResponseToProps(response: ChatApiResponse): {
  content: string;
  plan: { weekStart: string; mealsAdded: number; mealNames: string[] } | null;
} {
  if (response.type === "plan") {
    return {
      content: response.content,
      plan: {
        weekStart: response.weekStart,
        mealsAdded: response.mealsAdded,
        mealNames: response.mealNames,
      },
    };
  }
  return { content: response.content, plan: null };
}
