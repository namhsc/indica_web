import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent } from './ui/card';
import { motion } from 'motion/react';
import { DashboardStats } from '../types';
import { UserRole } from '../types/auth';
import { Message } from './AIAssistant/types';
import { getAIConfig } from './AIAssistant/config';
import { AIHeader } from './AIAssistant/AIHeader';
import { MessageList } from './AIAssistant/MessageList';
import { ChatInput } from './AIAssistant/ChatInput';
import { mapSuggestionToFullMessage } from './AIAssistant/suggestionMapper';
import { ChatMessageAI } from '../hooks/useDualSocket';

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

	const [input, setInput] = useState('');

	// Memoized greeting message
	const greetingMessage = useMemo(
		() => ({
			id: '1',
			type: 'ai' as const,
			content: aiConfig.greeting,
			timestamp: new Date(),
			suggestions: aiConfig.suggestions,
		}),
		[aiConfig.greeting, aiConfig.suggestions],
	);

	// Memoized messages transformation
	const messages = useMemo(() => {
		const transformedMessages = messagesAI.map((itemMess: ChatMessageAI) => {
			const { content } = itemMess;
			const inforCretor = JSON.parse(content.author);
			const isUser = inforCretor.type === 'user';
			const rawText = content.content;

			const displayText = isUser
				? rawText
				: rawText.replace(/\s*\([^)]*\)/g, '');

			return {
				id: content.id,
				content: displayText,
				type: (isUser ? 'user' : 'ai') as 'user' | 'ai',
				timestamp: new Date(content.created_at),
			};
		});

		const streamingMsg =
			isStreaming && streamingMessage
				? [
						{
							id: 'streaming',
							content: streamingMessage,
							type: 'ai' as const,
							timestamp: new Date(),
						},
				  ]
				: [];

		return [greetingMessage, ...transformedMessages, ...streamingMsg];
	}, [messagesAI, streamingMessage, isStreaming, greetingMessage]);

	const sendMessage = useCallback(
		(message: string) => {
			if (!message.trim()) return;

			const userInput = message.trim();
			handSendMessage(userInput);
			setIsTyping(true);
		},
		[handSendMessage, setIsTyping],
	);

	const handleSend = useCallback(() => {
		if (!input.trim()) return;
		const userInput = input.trim();
		setInput('');
		sendMessage(userInput);
	}, [input, sendMessage]);

	const handleSuggestionClick = useCallback(
		(suggestion: string) => {
			const fullMessage = mapSuggestionToFullMessage(suggestion);
			sendMessage(fullMessage);
		},
		[sendMessage],
	);

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
