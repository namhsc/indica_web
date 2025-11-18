import { Task, TaskPriority, TaskType } from '../../types';
import { UserRole } from '../../types/auth';

interface ParsedTaskData {
	title: string;
	description?: string;
	priority: TaskPriority;
	dueDate?: string;
	dueTime?: string;
	category?: string;
	tags?: string[];
	type: TaskType;
	assignedBy?: {
		id: string;
		name: string;
		role: UserRole;
	};
	reminderEnabled: boolean;
	reminderTime?: string;
	reminderDate?: string;
	estimatedDuration?: number;
}

/**
 * Phân tích câu nói tự nhiên để tạo công việc
 */
export function parseTaskFromConversation(
	userInput: string,
	currentUser: { id: string; name: string; role: UserRole },
	assignedBy?: { id: string; name: string; role: UserRole },
): ParsedTaskData | null {
	const lowerInput = userInput.toLowerCase().trim();

	// Kiểm tra xem có phải là yêu cầu tạo công việc không
	const createTaskKeywords = [
		'tạo công việc',
		'thêm công việc',
		'nhắc tôi',
		'nhớ giúp tôi',
		'cần làm',
		'phải làm',
		'giao việc',
		'giao cho',
		'nhờ',
		'giúp',
	];

	const isCreateTaskRequest = createTaskKeywords.some((keyword) =>
		lowerInput.includes(keyword),
	);

	if (!isCreateTaskRequest && !lowerInput.includes(':')) {
		// Nếu không có từ khóa tạo công việc và không có dấu hai chấm, có thể là câu nói tự nhiên
		// Thử phân tích nếu có các từ khóa thời gian hoặc hành động
		const hasActionKeywords = [
			'ngày mai',
			'hôm nay',
			'tuần này',
			'tháng này',
			'vào lúc',
			'lúc',
			'phải',
			'cần',
			'nhớ',
		].some((keyword) => lowerInput.includes(keyword));

		if (!hasActionKeywords) {
			return null;
		}
	}

	// Xác định loại công việc
	let type: TaskType = 'personal';
	if (assignedBy) {
		type = 'assigned';
	} else if (
		lowerInput.includes('giao') ||
		lowerInput.includes('nhờ') ||
		lowerInput.includes('giúp')
	) {
		// Có thể là công việc được giao, nhưng chưa có assignedBy
		// Giữ là personal nếu không có assignedBy
	}

	// Trích xuất tiêu đề
	let title = userInput.trim();
	
	// Loại bỏ các từ khóa tạo công việc
	createTaskKeywords.forEach((keyword) => {
		title = title.replace(new RegExp(keyword, 'gi'), '').trim();
	});

	// Loại bỏ các từ khóa thời gian ở đầu
	title = title.replace(/^(nhắc|nhớ|giúp|giao|nhờ)\s+/i, '').trim();

	// Nếu có dấu hai chấm, lấy phần sau dấu hai chấm
	if (title.includes(':')) {
		const parts = title.split(':');
		title = parts.slice(1).join(':').trim();
	}

	// Nếu title quá ngắn, sử dụng toàn bộ input
	if (title.length < 3) {
		title = userInput.trim();
	}

	// Trích xuất mức độ ưu tiên
	let priority: TaskPriority = 'medium';
	if (
		lowerInput.includes('khẩn cấp') ||
		lowerInput.includes('gấp') ||
		lowerInput.includes('urgent') ||
		lowerInput.includes('ngay lập tức')
	) {
		priority = 'urgent';
	} else if (
		lowerInput.includes('quan trọng') ||
		lowerInput.includes('ưu tiên cao') ||
		lowerInput.includes('high priority')
	) {
		priority = 'high';
	} else if (
		lowerInput.includes('không quan trọng') ||
		lowerInput.includes('ưu tiên thấp') ||
		lowerInput.includes('low priority')
	) {
		priority = 'low';
	}

	// Trích xuất thời hạn
	let dueDate: string | undefined;
	let dueTime: string | undefined;
	const now = new Date();

	// Ngày mai
	if (lowerInput.includes('ngày mai') || lowerInput.includes('mai')) {
		const tomorrow = new Date(now);
		tomorrow.setDate(tomorrow.getDate() + 1);
		dueDate = tomorrow.toISOString().split('T')[0];
	}

	// Hôm nay
	if (lowerInput.includes('hôm nay') || lowerInput.includes('hôm nay')) {
		dueDate = now.toISOString().split('T')[0];
	}

	// Tuần này
	if (lowerInput.includes('tuần này')) {
		const endOfWeek = new Date(now);
		endOfWeek.setDate(endOfWeek.getDate() + (7 - endOfWeek.getDay()));
		dueDate = endOfWeek.toISOString().split('T')[0];
	}

	// Tháng này
	if (lowerInput.includes('tháng này')) {
		const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
		dueDate = endOfMonth.toISOString().split('T')[0];
	}

	// Ngày cụ thể (ví dụ: "ngày 15", "15/12", "15-12")
	const datePatterns = [
		/(\d{1,2})\/(\d{1,2})(?:\/(\d{4}))?/,
		/(\d{1,2})-(\d{1,2})(?:-(\d{4}))?/,
		/ngày\s+(\d{1,2})(?:\s+tháng\s+(\d{1,2}))?(?:\s+năm\s+(\d{4}))?/,
	];

	for (const pattern of datePatterns) {
		const match = lowerInput.match(pattern);
		if (match) {
			let day: number;
			let month: number;
			let year: number = now.getFullYear();

			if (pattern === datePatterns[0] || pattern === datePatterns[1]) {
				// Format: dd/mm hoặc dd-mm
				day = parseInt(match[1], 10);
				month = parseInt(match[2], 10);
				if (match[3]) year = parseInt(match[3], 10);
			} else {
				// Format: ngày X tháng Y
				day = parseInt(match[1], 10);
				month = match[2] ? parseInt(match[2], 10) : now.getMonth() + 1;
				if (match[3]) year = parseInt(match[3], 10);
			}

			const date = new Date(year, month - 1, day);
			if (!isNaN(date.getTime())) {
				dueDate = date.toISOString().split('T')[0];
			}
			break;
		}
	}

	// Thời gian cụ thể (ví dụ: "lúc 9h", "vào lúc 14:30", "9 giờ sáng")
	const timePatterns = [
		/(?:lúc|vào lúc)\s*(\d{1,2}):?(\d{2})?/,
		/(\d{1,2})\s*giờ(?:\s*(\d{1,2}))?(?:\s*(sáng|chiều|tối))?/,
	];

	for (const pattern of timePatterns) {
		const match = lowerInput.match(pattern);
		if (match) {
			let hours = parseInt(match[1], 10);
			const minutes = match[2] ? parseInt(match[2], 10) : 0;
			const period = match[3] || match[4]; // sáng/chiều/tối

			if (period === 'chiều' && hours < 12) hours += 12;
			if (period === 'tối' && hours < 12) hours += 12;
			if (period === 'sáng' && hours === 12) hours = 0;

			dueTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
			break;
		}
	}

	// Trích xuất phân loại/category
	let category: string | undefined;
	const categoryKeywords: Record<string, string[]> = {
		'công việc': ['công việc', 'work', 'task'],
		'học tập': ['học', 'study', 'bài tập'],
		'cá nhân': ['cá nhân', 'personal'],
		'sức khỏe': ['sức khỏe', 'health', 'tập thể dục'],
		'mua sắm': ['mua', 'shopping', 'mua sắm'],
		'cuộc hẹn': ['hẹn', 'appointment', 'meeting'],
	};

	for (const [cat, keywords] of Object.entries(categoryKeywords)) {
		if (keywords.some((kw) => lowerInput.includes(kw))) {
			category = cat;
			break;
		}
	}

	// Trích xuất tags
	const tags: string[] = [];
	const commonTags = ['quan trọng', 'gấp', 'khẩn cấp', 'học tập', 'công việc'];
	commonTags.forEach((tag) => {
		if (lowerInput.includes(tag)) {
			tags.push(tag);
		}
	});

	// Trích xuất mô tả (nếu có)
	let description: string | undefined;
	if (title.length < userInput.length) {
		// Có thể có mô tả thêm
		const descMatch = userInput.match(/[:：]\s*(.+)/);
		if (descMatch) {
			description = descMatch[1].trim();
		}
	}

	// Xác định có bật nhắc nhở không
	const reminderEnabled = 
		lowerInput.includes('nhắc') ||
		lowerInput.includes('remind') ||
		dueDate !== undefined ||
		dueTime !== undefined;

	// Tính toán thời gian nhắc nhở (mặc định: 1 giờ trước thời hạn)
	let reminderTime: string | undefined;
	let reminderDate: string | undefined;
	if (reminderEnabled && dueDate) {
		reminderDate = dueDate;
		if (dueTime) {
			// Nhắc 1 giờ trước
			const [hours, minutes] = dueTime.split(':').map(Number);
			const reminderHour = hours > 0 ? hours - 1 : 23;
			reminderTime = `${reminderHour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
		} else {
			// Nhắc vào 8h sáng
			reminderTime = '08:00';
		}
	}

	// Ước tính thời gian (nếu có đề cập)
	let estimatedDuration: number | undefined;
	const durationMatch = lowerInput.match(/(\d+)\s*(phút|giờ|giờ đồng hồ)/);
	if (durationMatch) {
		const value = parseInt(durationMatch[1], 10);
		const unit = durationMatch[2];
		estimatedDuration = unit.includes('giờ') ? value * 60 : value;
	}

	return {
		title: title || 'Công việc mới',
		description,
		priority,
		dueDate,
		dueTime,
		category,
		tags: tags.length > 0 ? tags : undefined,
		type,
		assignedBy,
		reminderEnabled,
		reminderTime,
		reminderDate,
		estimatedDuration,
	};
}

/**
 * Tạo phản hồi AI khi nhận diện được yêu cầu tạo công việc
 */
export function generateTaskCreationResponse(
	parsedData: ParsedTaskData,
): { content: string; suggestions?: string[] } {
	const parts: string[] = [];
	
	parts.push(`✅ Tôi đã tạo công việc: **${parsedData.title}**`);
	
	if (parsedData.description) {
		parts.push(`📝 Mô tả: ${parsedData.description}`);
	}
	
	if (parsedData.dueDate) {
		const date = new Date(parsedData.dueDate);
		const dateStr = date.toLocaleDateString('vi-VN', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric',
		});
		parts.push(`📅 Hạn chót: ${dateStr}`);
		if (parsedData.dueTime) {
			parts.push(`⏰ Thời gian: ${parsedData.dueTime}`);
		}
	}
	
	const priorityLabels: Record<TaskPriority, string> = {
		low: 'Thấp',
		medium: 'Trung bình',
		high: 'Cao',
		urgent: 'Khẩn cấp',
	};
	parts.push(`⚡ Ưu tiên: ${priorityLabels[parsedData.priority]}`);
	
	if (parsedData.category) {
		parts.push(`🏷️ Phân loại: ${parsedData.category}`);
	}
	
	if (parsedData.reminderEnabled) {
		parts.push(`🔔 Đã bật nhắc nhở`);
	}
	
	return {
		content: parts.join('\n'),
		suggestions: ['Xem danh sách công việc', 'Tạo công việc khác', 'Xem công việc ưu tiên cao'],
	};
}

