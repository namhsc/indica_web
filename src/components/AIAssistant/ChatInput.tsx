import React from 'react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Send } from 'lucide-react';
import { motion } from 'motion/react';
import { AIConfig } from './types';

interface ChatInputProps {
  input: string;
  onInputChange: (value: string) => void;
  onSend: () => void;
  aiConfig: AIConfig;
}

export function ChatInput({ input, onInputChange, onSend, aiConfig }: ChatInputProps) {
  return (
    <div className="flex flex-col gap-3 mt-6 pt-5 border-t-2 border-gradient-to-r from-violet-100 to-purple-100 flex-shrink-0">
      <div className="flex gap-3">
        <Input
          value={input}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && onSend()}
          placeholder="Nhập câu hỏi hoặc yêu cầu của bạn..."
          className="flex-1 border-2 border-violet-200/50 focus:border-violet-400 rounded-2xl px-5 py-6 text-base shadow-sm"
        />
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button 
            onClick={onSend}
            disabled={!input.trim()}
            className={`bg-gradient-to-r ${aiConfig.color} hover:opacity-90 text-white h-full px-6 rounded-2xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <Send className="w-5 h-5" />
          </Button>
        </motion.div>
      </div>
    </div>
  );
}

