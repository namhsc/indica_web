import React from 'react';
import { motion } from 'motion/react';
import { Message, AIConfig } from './types';

interface MessageBubbleProps {
  message: Message;
  aiConfig: AIConfig;
  onSuggestionClick?: (suggestion: string) => void;
}

export const MessageBubble = React.memo(function MessageBubble({ message, aiConfig, onSuggestionClick }: MessageBubbleProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
    >
      <div className={`max-w-[85%] ${message.type === 'user' ? 'order-2' : 'order-1'}`}>
        <motion.div 
          className={`rounded-3xl p-4 shadow-md ${
            message.type === 'user' 
              ? `bg-gradient-to-br ${aiConfig.color} text-white` 
              : 'bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200'
          }`}
        >
          <p className="whitespace-pre-line leading-relaxed">{message.content}</p>
        </motion.div>
        
        {message.suggestions && message.suggestions.length > 0 && (
          <SuggestionButtons 
            suggestions={message.suggestions}
            aiConfig={aiConfig}
            onSuggestionClick={onSuggestionClick}
          />
        )}
      </div>
    </motion.div>
  );
});

interface SuggestionButtonsProps {
  suggestions: string[];
  aiConfig: AIConfig;
  onSuggestionClick?: (suggestion: string) => void;
}

function SuggestionButtons({ suggestions, aiConfig, onSuggestionClick }: SuggestionButtonsProps) {
  return (
    <motion.div 
      className="flex flex-wrap gap-2 mt-3"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3 }}
    >
      {suggestions.map((suggestion, idx) => (
        <motion.div
          key={idx}
        >
          <button
            onClick={() => onSuggestionClick?.(suggestion)}
            className={`text-xs bg-white border border-violet-200 px-3 py-1.5 rounded-lg cursor-pointer`}
          >
            {suggestion}
          </button>
        </motion.div>
      ))}
    </motion.div>
  );
}

