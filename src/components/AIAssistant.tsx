import React, { useState } from 'react';
import { Card, CardContent } from './ui/card';
import { motion } from 'motion/react';
import { DashboardStats } from '../types';
import { UserRole } from '../types/auth';
import { Message } from './AIAssistant/types';
import { getAIConfig } from './AIAssistant/config';
import { AIHeader } from './AIAssistant/AIHeader';
import { MessageList } from './AIAssistant/MessageList';
import { ChatInput } from './AIAssistant/ChatInput';
import { handleAIResponse } from './AIAssistant/aiResponseHandler';
import { mapSuggestionToFullMessage } from './AIAssistant/suggestionMapper';

interface AIAssistantProps {
  stats: DashboardStats;
  onNewRecord: () => void;
  onViewRecords: () => void;
  userRole: UserRole;
}

export function AIAssistant({ stats, onNewRecord, onViewRecords, userRole }: AIAssistantProps) {
  const aiConfig = getAIConfig(userRole);
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: aiConfig.greeting,
      timestamp: new Date(),
      suggestions: aiConfig.suggestions
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const addUserMessage = (content: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const addAIMessage = (content: string, suggestions?: string[]) => {
    setIsTyping(false);
    const newMessage: Message = {
      id: Date.now().toString(),
      type: 'ai',
      content,
      timestamp: new Date(),
      suggestions,
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const sendMessage = (message: string) => {
    if (!message.trim()) return;

    const userInput = message.trim();
    addUserMessage(userInput);
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const response = handleAIResponse({
        userInput,
        userRole,
        stats,
        onNewRecord,
        onViewRecords,
      });
      addAIMessage(response.content, response.suggestions);
    }, 1000);
  };

  const handleSend = () => {
    if (!input.trim()) return;
    const userInput = input.trim();
    setInput('');
    sendMessage(userInput);
  };

  const handleSuggestionClick = (suggestion: string) => {
    // Map suggestion to full message and send directly
    const fullMessage = mapSuggestionToFullMessage(suggestion);
    sendMessage(fullMessage);
  };

  return (
    <div className="h-full flex flex-col">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
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
