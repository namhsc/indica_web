import React, { useState, useEffect } from "react";
import { Card, CardContent } from "./ui/card";
import { motion } from "motion/react";
import { DashboardStats } from "../types";
import { UserRole } from "../types/auth";
import { Message } from "./AIAssistant/types";
import { getAIConfig } from "./AIAssistant/config";
import { AIHeader } from "./AIAssistant/AIHeader";
import { MessageList } from "./AIAssistant/MessageList";
import { ChatInput } from "./AIAssistant/ChatInput";
import { mapSuggestionToFullMessage } from "./AIAssistant/suggestionMapper";
import { ChatMessageAI } from "../hook/useDualSocket";

interface AIAssistantProps {
  stats: DashboardStats;
  onNewRecord: () => void;
  onViewRecords: () => void;
  userRole: UserRole;
  handSendMessage: (text: string) => void;
  messagesAI: ChatMessageAI[];
  isTyping: boolean;
  setIsTyping: (isDone: boolean) => void;
  streamingMessage: string;
  isStreaming: boolean;
  onEndDemo?: () => void;
}

export function AIAssistant({
  stats,
  onNewRecord,
  onViewRecords,
  userRole,
  messagesAI,
  handSendMessage,
  isTyping,
  setIsTyping,
  streamingMessage,
  isStreaming,
  onEndDemo,
}: AIAssistantProps) {
  const aiConfig = getAIConfig(userRole);

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  // const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    console.log("isStreaming", isStreaming);
    if (!messagesAI.length) {
      setMessages([
        {
          id: "1",
          type: "ai",
          content: aiConfig.greeting,
          timestamp: new Date(),
          suggestions: aiConfig.suggestions,
        },
      ]);
    } else {
      setMessages([
        {
          id: "1",
          type: "ai",
          content: aiConfig.greeting,
          timestamp: new Date(),
          suggestions: aiConfig.suggestions,
        },
        ...messagesAI.map((itemMess: ChatMessageAI) => {
          const { content } = itemMess;
          const inforCretor = JSON.parse(content.author);
          const isUser = inforCretor.type === "user";
          const rawText = content.content;

          // Chỉ trích xuất gợi ý và loại bỏ dấu ngoặc khi là tin nhắn từ AI
          // const matches = isUser ? [] : rawText.match(/\(([^)]+)\)/g) || [];
          // const suggestionIds = matches.map((m) => m.slice(1, -1));
          // const suggestions = suggestionIds
          //   .map((id) => menuData.find((item) => item.id === id))
          //   .filter(Boolean) as MenuItem[];
          const displayText = isUser
            ? rawText
            : rawText.replace(/\s*\([^)]*\)/g, "");

          return {
            id: content.id,
            content: displayText,
            type: (isUser ? "user" : "ai") as "user" | "ai",
            timestamp: new Date(content.created_at),
          };
        }),
        // Thêm streaming message nếu đang streaming
        ...(isStreaming && streamingMessage
          ? [
              {
                id: "streaming",
                content: streamingMessage,
                type: "ai",
                timestamp: new Date(),
              },
            ]
          : []),
      ]);
    }
  }, [messagesAI, streamingMessage, isStreaming]);

  const sendMessage = (message: string) => {
    if (!message.trim()) return;

    const userInput = message.trim();
    handSendMessage(userInput);
    setIsTyping(true);
  };

  const handleSend = () => {
    if (!input.trim()) return;
    const userInput = input.trim();
    setInput("");
    sendMessage(userInput);
  };

  const handleSuggestionClick = (suggestion: string) => {
    const fullMessage = mapSuggestionToFullMessage(suggestion);
    sendMessage(fullMessage);
  };

  return (
    <div className="h-full flex flex-col">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className="h-full flex flex-col"
      >
        <Card className="border-none shadow-none bg-white/95 backdrop-blur-sm h-full flex flex-col">
          <CardContent className="p-6 flex flex-col h-full">
            <AIHeader config={aiConfig} />

            <MessageList
              messages={messages}
              isTyping={isTyping}
              aiConfig={aiConfig}
              onSuggestionClick={handleSuggestionClick}
            />

            <ChatInput
              input={input}
              onInputChange={setInput}
              onSend={handleSend}
              aiConfig={aiConfig}
            />
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
