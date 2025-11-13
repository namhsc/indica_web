import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { v4 as uuidv4 } from 'uuid';

// 🔧 Config endpoint
const SOCKET_CS_ENDPOINT = 'https://dev.dxconnect.lifesup.ai';
const SOCKET_MESSAGE_ENDPOINT = 'https://dev.dx-socket.lifesup.ai';

// 🔧 Thông tin kết nối
const AI_ID = 'd6260b64-0dc7-4629-aa65-3092d1cf657f';
const DOMAIN = 'lifesup.vn';

// 🧩 Interface định nghĩa kiểu dữ liệu
export interface UserInfo {
	id?: string;
	name?: string;
	role?: string; // Thêm role vào interface
	[key: string]: any;
}

export interface PartitionResponse {
	conversation_id: string;
	partition_ordinal: string;
}

export interface ChatMessageAI {
	conversation_id: string;
	content: {
		id: string;
		conversation_id: string;
		author: string;
		content: string;
		agent_id: boolean;
		created_at: string;
		creator: boolean;
		message_state: boolean;
		ai_id?: string;
		cost?: number;
	};
}

export interface IncomingMessage {
	type: string;
	content: ChatMessageAI;
}

export interface OutgoingMessage {
	author: {
		type: 'user';
		data_info: string | null;
		user_info: any;
	};
	content: string;
	interactive: boolean;
	action_id: string | null;
	internal: boolean;
	debug: boolean;
	preview: boolean;
	partition_ordinal: string | number | null;
}

// 🧠 Hook chính
export default function useDualSocket() {
	const [partitionOrdinal, setPartitionOrdinal] = useState<string | null>(null);
	const [conversationId] = useState<string>(uuidv4());
	const [messages, setMessages] = useState<ChatMessageAI[]>([]);
	const socketCs = useRef<Socket | null>(null);
	const [streamingMessage, setStreamingMessage] = useState<string>('');
	const [isStreaming, setIsStreaming] = useState<boolean>(false);
	const socketMessage = useRef<Socket | null>(null);
	const [typing, setTyping] = useState(false);
	const [dataSocketPlus, setDataSocketPlus] = useState<any>({});

	// Khôi phục lịch sử chat từ localStorage khi component mount
	useEffect(() => {
		const hasConfirmedGuestCount =
			localStorage.getItem('hasConfirmedGuestCount') === 'true';

		if (hasConfirmedGuestCount) {
			try {
				const savedChatHistory = localStorage.getItem('chatHistory');
				if (savedChatHistory) {
					const parsedMessages = JSON.parse(savedChatHistory);
					if (Array.isArray(parsedMessages) && parsedMessages.length > 0) {
						setMessages(parsedMessages);
					}
				}
			} catch (e) {
				console.error('Error loading chat history:', e);
			}
		}
	}, []);

	const handleCheckDone = useCallback(
		(dataMess: IncomingMessage) => {
			if (!dataMess) return;
			const { type, content } = dataMess;

			if (!type || !content) return;
			const { conversation_id } = content;
			const innerContent = content?.content;
			const textChunk = innerContent?.content;
			const isDone = textChunk === 'DONE';

			if (conversation_id !== conversationId) return;

			switch (type) {
				case 'NEW_MESSAGE_CS_CHAT_PAUSE':
					console.log('⏸️ AI paused response');
					break;

				case 'message/new_for_cs_chat':
					if (isDone) {
						// Khi gặp DONE, hoàn thành message streaming
						const currentStreaming = streamingMessage;
						if (currentStreaming.trim()) {
							const finalMessage: ChatMessageAI = {
								conversation_id: conversation_id,
								content: {
									id: uuidv4(),
									conversation_id: conversation_id,
									author: '{"type": "ai", "need_human": false}',
									content: currentStreaming,
									agent_id: true,
									created_at: new Date().toISOString(),
									creator: true,
									message_state: true,
								},
							};
							setMessages((prevMessages) => [...prevMessages, finalMessage]);
						}
						setStreamingMessage('');
						setIsStreaming(false);
						setTyping(false);
						return;
					}

					// Xử lý streaming message
					if (textChunk && textChunk !== 'DONE') {
						setIsStreaming(true);
						setTyping(true);
						setStreamingMessage((prev) => prev + textChunk);
					}
					break;

				case 'message/full_message':
					if (conversation_id === conversationId) {
						setMessages((prev) => [
							...prev,
							{ ...content, content: { ...content.content, id: uuidv4() } },
						]);
					}
					return;

				default:
					break;
			}
		},
		[conversationId, streamingMessage],
	);

	useEffect(() => {
		if (!conversationId) return;
		const query = {
			ai_id: AI_ID,
			domain: DOMAIN,
			user: null,
		};

		socketCs.current = io(SOCKET_CS_ENDPOINT, { query });
		socketMessage.current = io(SOCKET_MESSAGE_ENDPOINT, { query });

		// Lắng nghe partition_ordinal
		socketMessage.current.on('partition_ordinal', (data: PartitionResponse) => {
			setPartitionOrdinal(data.partition_ordinal);
		});

		// Lắng nghe message
		socketCs.current.on('message', (msg: IncomingMessage) => {
			// console.log("socketCs", msg);
		});

		// Lắng nghe message
		socketMessage.current.on('message', handleCheckDone);

		// Khi CS socket connect
		socketCs.current.on('connect', () => {
			console.log('✅ Connected to CS Socket');
			socketCs.current?.emit('join_room_conversation', {
				prevConversationId: null,
				conversationId,
			});
		});

		// Khi Message socket connect
		socketMessage.current.on('connect', () => {
			console.log('✅ Connected to Message Socket');
			socketMessage.current?.emit('join_room_conversation', {
				prevConversationId: null,
				conversationId,
			});
		});

		// Cleanup khi unmount
		return () => {
			socketCs.current?.off('message');
			socketCs.current?.off('connect');
			socketMessage.current?.off('message');
			socketMessage.current?.off('partition_ordinal');
			socketMessage.current?.off('connect');
			socketCs.current?.disconnect();
			socketMessage.current?.disconnect();
		};
	}, [conversationId, handleCheckDone]);

	// Gửi tin nhắn đến AI
	const sendMessage = useCallback(
		(text: string) => {
			if (!socketCs.current) {
				console.warn('⛔ Cannot send message: socket not ready');
				return;
			}

			const message_chat: OutgoingMessage = {
				author: {
					type: 'user',
					data_info: null,
					user_info: { ...dataSocketPlus },
				},
				content: text,
				interactive: false,
				action_id: null,
				internal: false,
				debug: false,
				preview: false,
				partition_ordinal: partitionOrdinal,
			};

			const content: ChatMessageAI = {
				conversation_id: conversationId,
				content: {
					id: uuidv4(),
					conversation_id: conversationId,
					author: '{"type": "user", "need_human": false}',
					content: text,
					agent_id: false,
					created_at: `${new Date()}`,
					creator: false,
					message_state: false,
				},
			};
			setMessages((prev) => [...prev, content]);
			socketCs.current.emit('query_chat_message', message_chat, {
				conversationId,
			});
		},
		[conversationId, partitionOrdinal, dataSocketPlus],
	);

	return {
		messages,
		sendMessage,
		partitionOrdinal,
		conversationId,
		typing,
		setTyping,
		streamingMessage,
		isStreaming,
		setDataSocketPlus,
	};
}
