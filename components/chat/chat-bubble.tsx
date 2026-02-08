"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { MessageCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChatWindow } from "@/components/chat/chat-window";

export function ChatBubble() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);

  if (!session?.user) return null;

  return (
    <>
      <ChatWindow isOpen={isOpen} onClose={() => setIsOpen(false)} />
      <Button
        onClick={() => setIsOpen((prev) => !prev)}
        size="icon"
        className="fixed bottom-6 right-6 z-50 size-14 rounded-full shadow-lg transition-transform duration-200 ease-out hover:scale-105"
      >
        <MessageCircle
          className={`size-6 absolute transition-all duration-200 ${isOpen ? "scale-0 opacity-0" : "scale-100 opacity-100"}`}
        />
        <X
          className={`size-6 absolute transition-all duration-200 ${isOpen ? "scale-100 opacity-100" : "scale-0 opacity-0"}`}
        />
        <span className="sr-only">
          {isOpen ? "Close" : "Open"} meal planning chat
        </span>
      </Button>
    </>
  );
}
