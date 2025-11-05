import React, { useRef, useEffect, useState } from 'react';
import { AnimatePresence } from 'motion/react';
import { Message } from './types';
import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';
import { AIConfig } from './types';

interface MessageListProps {
  messages: Message[];
  isTyping: boolean;
  aiConfig: AIConfig;
  onSuggestionClick?: (suggestion: string) => void;
}

export function MessageList({ messages, isTyping, aiConfig, onSuggestionClick }: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [hasOverflow, setHasOverflow] = useState(false);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  useEffect(() => {
    const checkOverflow = () => {
      if (scrollRef.current) {
        const hasScroll = scrollRef.current.scrollHeight > scrollRef.current.clientHeight;
        setHasOverflow(hasScroll);
      }
    };

    checkOverflow();
    const resizeObserver = new ResizeObserver(checkOverflow);
    if (scrollRef.current) {
      resizeObserver.observe(scrollRef.current);
    }

    return () => resizeObserver.disconnect();
  }, [messages, isTyping]);

  return (
    <div 
      className={`flex-1 overflow-y-auto min-h-0 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full transition-colors ${
        hasOverflow 
          ? '[&::-webkit-scrollbar-thumb]:bg-violet-200/50 hover:[&::-webkit-scrollbar-thumb]:bg-violet-300/70' 
          : '[&::-webkit-scrollbar-thumb]:bg-transparent'
      }`}
      style={{
        scrollbarWidth: 'thin',
        scrollbarColor: hasOverflow ? 'rgba(196, 181, 253, 0.5) transparent' : 'transparent transparent'
      }}
      ref={scrollRef}
    >
      <div className="space-y-5 pb-4 pr-3">
        <AnimatePresence>
          {messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              aiConfig={aiConfig}
              onSuggestionClick={onSuggestionClick}
            />
          ))}
        </AnimatePresence>

        {isTyping && <TypingIndicator aiConfig={aiConfig} />}
      </div>
    </div>
  );
}

