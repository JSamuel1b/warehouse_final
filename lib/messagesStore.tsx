import React, { createContext, useContext, useMemo, useState } from "react";

export type Message = {
  id: string;
  orderId: string;

  fromUserId: string;
  fromName: string;

  toUserId: string;
  text: string;

  createdAt: string;
};

type MessagesContextValue = {
  messages: Message[];

  sendMessage: (
    orderId: string,
    fromUserId: string,
    fromName: string,
    toUserId: string,
    text: string
  ) => void;

  getMessagesForOrder: (orderId: string) => Message[];
};

const MessagesContext = createContext<MessagesContextValue | null>(null);

export function MessagesProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([]);

  const value = useMemo<MessagesContextValue>(
    () => ({
      messages,

      sendMessage: (orderId, fromUserId, fromName, toUserId, text) => {
        const now = new Date().toISOString();

        const newMessage: Message = {
          id: `msg_${Date.now()}`,
          orderId,
          fromUserId,
          fromName,
          toUserId,
          text: text.trim(),
          createdAt: now,
        };

        setMessages((prev) => [newMessage, ...prev]);
      },

      getMessagesForOrder: (orderId: string) => {
        return messages.filter((m) => m.orderId === orderId);
      },
    }),
    [messages]
  );

  return (
    <MessagesContext.Provider value={value}>
      {children}
    </MessagesContext.Provider>
  );
}

export function useMessages() {
  const ctx = useContext(MessagesContext);
  if (!ctx) throw new Error("useMessages must be used within MessagesProvider");
  return ctx;
}