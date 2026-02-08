"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChatMessage, chatApiResponseToProps } from "@/components/chat/chat-message";
import { ChatInput } from "@/components/chat/chat-input";
import type { ChatMessage as ChatMessageType, ChatApiResponse } from "@/lib/types/chat";

interface UiMessage extends ChatMessageType {
  id: string;
}

interface ChatWindowProps {
  isOpen: boolean;
  onClose: () => void;
}

let nextMsgId = 0;
function createMsg(msg: ChatMessageType): UiMessage {
  return { ...msg, id: `msg-${++nextMsgId}` };
}

const WELCOME_CONTENT =
  "Hi! I'm your meal planning assistant. Tell me about what you're looking for — what kind of food you're in the mood for, any dietary needs, or how many people you're cooking for — and I'll put together a plan for your approval.";

export function ChatWindow({ isOpen, onClose }: ChatWindowProps) {
  const router = useRouter();
  const [messages, setMessages] = useState<UiMessage[]>(() => [
    createMsg({ role: "assistant", content: WELCOME_CONTENT }),
  ]);
  const [planData, setPlanData] = useState<
    Map<string, { weekStart: string; mealsAdded: number; mealNames: string[] }>
  >(new Map());
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, scrollToBottom]);

  useEffect(() => {
    if (!isOpen) {
      setMessages([createMsg({ role: "assistant", content: WELCOME_CONTENT })]);
      setPlanData(new Map());
    }
  }, [isOpen]);

  async function handleSend(content: string) {
    const userMessage = createMsg({ role: "user", content });
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setIsLoading(true);

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error ?? "Failed to get response");
      }

      const data: ChatApiResponse = await response.json();
      const { content: aiContent, plan } = chatApiResponseToProps(data);

      const assistantContent = plan
        ? `${aiContent}\n\nMeals added: ${plan.mealNames.join(", ")}`
        : aiContent;

      const assistantMessage = createMsg({
        role: "assistant",
        content: assistantContent,
      });

      setMessages((prev) => [...prev, assistantMessage]);

      if (plan) {
        setPlanData((prev) => {
          const next = new Map(prev);
          next.set(assistantMessage.id, plan);
          return next;
        });
        router.refresh();
        router.push("/plan");
      }
    } catch (error) {
      const message = error instanceof Error
        ? error.message
        : "Sorry, something went wrong. Please try again.";
      const errorMessage = createMsg({
        role: "assistant",
        content: message,
      });
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className={`fixed bottom-20 right-6 z-50 flex max-h-[50vh] w-[380px] flex-col rounded-lg border border-border bg-card shadow-xl max-sm:bottom-0 max-sm:right-0 max-sm:max-h-full max-sm:h-full max-sm:w-full max-sm:rounded-none transition-all duration-200 ease-out ${isOpen ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-4 scale-95 pointer-events-none"}`}>
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h3 className="text-sm font-semibold">Meal Plan Assistant</h3>
        <Button variant="ghost" size="icon" onClick={onClose} className="size-7">
          <X className="size-4" />
          <span className="sr-only">Close chat</span>
        </Button>
      </div>

      <div
        ref={scrollRef}
        className="flex flex-1 flex-col gap-3 overflow-y-auto p-4 max-sm:h-[calc(100vh-8rem)]"
      >
        {messages.map((msg) => (
          <ChatMessage
            key={msg.id}
            role={msg.role}
            content={msg.content}
            plan={planData.get(msg.id) ?? null}
          />
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              Thinking...
            </div>
          </div>
        )}
      </div>

      <ChatInput onSend={handleSend} isLoading={isLoading} />
    </div>
  );
}
