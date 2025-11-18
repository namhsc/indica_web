import { UserRole } from '../../types/auth';
import { DashboardStats } from '../../types';
import { Message } from './types';
import { parseTaskFromConversation, generateTaskCreationResponse } from '../TaskManagement/taskAIHandler';

export interface AIResponseHandlerProps {
	userInput: string;
	userRole: UserRole;
	stats: DashboardStats;
	onNewRecord: () => void;
	onViewRecords: () => void;
	onCreateTask?: (taskData: any) => void;
	onViewTasks?: () => void;
	currentUser?: { id: string; name: string; role: UserRole };
}

export const handleAIResponse = ({
	userInput,
	userRole,
	stats,
	onNewRecord,
	onViewRecords,
	onCreateTask,
	onViewTasks,
	currentUser,
}: AIResponseHandlerProps): { content: string; suggestions?: string[]; taskCreated?: boolean } => {
	const lowerInput = userInput.toLowerCase();

	// Xử lý yêu cầu tạo công việc
	if (currentUser && onCreateTask) {
		const parsedTask = parseTaskFromConversation(
			userInput,
			currentUser,
			undefined,
		);

		if (parsedTask) {
			// Tạo công việc
			const taskData = {
				...parsedTask,
				assignedTo: {
					id: currentUser.id,
					name: currentUser.name,
					role: currentUser.role,
				},
			};

			onCreateTask(taskData);

			// Tạo phản hồi
			const response = generateTaskCreationResponse(parsedTask);
			return {
				...response,
				taskCreated: true,
				suggestions: [
					...response.suggestions || [],
					'Xem danh sách công việc',
				],
			};
		}
	}

	// Xử lý yêu cầu xem công việc
	if (
		(lowerInput.includes('công việc') || lowerInput.includes('task') || lowerInput.includes('todo')) &&
		(lowerInput.includes('xem') || lowerInput.includes('danh sách') || lowerInput.includes('list'))
	) {
		if (onViewTasks) {
			onViewTasks();
		}
		return {
			content: 'Đang mở danh sách công việc của bạn...',
			suggestions: ['Xem công việc ưu tiên cao', 'Xem công việc quá hạn'],
		};
	}

	// Common responses for all roles
	if (lowerInput.includes('thống kê') || lowerInput.includes('báo cáo')) {
		return {
			content: `📊 Thống kê hôm nay:\n• Tổng khách hàng: ${stats.totalRecords}\n• Chờ khám: ${stats.pendingExamination}\n• Đang xử lý: ${stats.inProgress}\n• Hoàn thành: ${stats.completed}\n• Đã trả: ${stats.returned}`,
			suggestions: ['Xuất báo cáo', 'Xem chi tiết'],
		};
	}

	if (
		lowerInput.includes('danh sách') ||
		lowerInput.includes('xem khách hàng')
	) {
		return {
			content:
				'Bạn muốn xem danh sách khách hàng? Tôi có thể giúp bạn:\n✓ Xem tất cả khách hàng\n✓ Lọc theo trạng thái\n✓ Tìm kiếm khách hàng cụ thể',
			suggestions: ['Lọc theo trạng thái', 'Tìm kiếm khách hàng'],
		};
	}

	// Role-specific responses
	if (userRole === 'receptionist') {
		return handleReceptionistResponse(lowerInput, onNewRecord);
	}

	if (userRole === 'doctor') {
		return handleDoctorResponse(lowerInput, stats);
	}

	if (userRole === 'nurse') {
		return handleTechnicianResponse(lowerInput);
	}

	if (userRole === 'admin') {
		return handleAdminResponse(lowerInput, stats);
	}

	if (userRole === 'patient') {
		return handlePatientResponse(lowerInput, onViewRecords);
	}

	return {
		content: `Tôi hiểu bạn đang hỏi về "${userInput}". Hãy thử các gợi ý bên dưới!`,
		suggestions: [],
	};
};

function handleReceptionistResponse(
	lowerInput: string,
	onNewRecord: () => void,
) {
	if (
		lowerInput.includes('tiếp nhận') ||
		lowerInput.includes('tạo') ||
		lowerInput.includes('mới')
	) {
		return {
			content:
				'Bạn muốn tiếp nhận khách hàng mới? Tôi có thể hướng dẫn bạn:\n✓ Điền thông tin khách hàng\n✓ Chọn dịch vụ khám\n✓ Phân công bác sĩ',
			suggestions: ['Danh sách bác sĩ trực', 'Dịch vụ phổ biến'],
		};
	}

	if (lowerInput.includes('tìm') || lowerInput.includes('search')) {
		return {
			content:
				'Bạn muốn tìm theo mã khách hàng, số điện thoại hay tên Khách hàng?',
			suggestions: [
				'Tìm theo mã khách hàng',
				'Tìm theo số điện thoại',
				'Tìm theo tên',
			],
		};
	}

	if (lowerInput.includes('bác sĩ')) {
		return {
			content:
				'Danh sách bác sĩ đang trực:\n• BS. Nguyễn Văn An (Nội khoa)\n• BS. Trần Thị Bình (Ngoại khoa)\n• BS. Lê Hoàng Cường (Tim mạch)\n• BS. Phạm Thị Dung (Nhi khoa)',
			suggestions: ['Lịch trực', 'Phân công khám'],
		};
	}

	return {
		content:
			'Tôi có thể giúp bạn:\n✓ Tiếp nhận khách hàng mới\n✓ Tìm kiếm khách hàng\n✓ Xem thống kê\n✓ Quản lý danh sách khách hàng',
		suggestions: [],
	};
}

function handleDoctorResponse(lowerInput: string, stats: DashboardStats) {
	if (lowerInput.includes('chờ khám') || lowerInput.includes('khám')) {
		return {
			content: `Hiện có ${stats.pendingExamination} khách hàng chờ khám. Bạn muốn xem danh sách?`,
			suggestions: [
				'Xem danh sách chờ khám',
				'Lọc theo khoa',
				'Ưu tiên khẩn cấp',
			],
		};
	}

	if (lowerInput.includes('chẩn đoán') || lowerInput.includes('gợi ý')) {
		return {
			content:
				'Tôi có thể giúp:\n✓ Gợi ý chẩn đoán dựa trên triệu chứng\n✓ Đề xuất xét nghiệm cần thiết\n✓ Tham khảo tiêu chuẩn lâm sàng\n✓ Tra cứu thuốc và tương tác',
			suggestions: ['Triệu chứng thường gặp', 'Xét nghiệm khuyến nghị'],
		};
	}

	if (lowerInput.includes('xử lý') || lowerInput.includes('cần')) {
		return {
			content: `Có ${stats.inProgress} khách hàng đang chờ bạn xử lý. Muốn xem chi tiết?`,
			suggestions: ['Xem khách hàng ưu tiên', 'Sắp xếp theo thời gian'],
		};
	}

	return {
		content:
			'Tôi có thể hỗ trợ:\n✓ Quản lý khách hàng khám\n✓ Gợi ý chẩn đoán\n✓ Chỉ định xét nghiệm\n✓ Kê đơn thuốc',
		suggestions: [],
	};
}

function handleTechnicianResponse(lowerInput: string) {
	if (lowerInput.includes('xét nghiệm') || lowerInput.includes('chờ')) {
		return {
			content:
				'Hiện có các xét nghiệm chờ xử lý:\n• 5 xét nghiệm máu\n• 3 xét nghiệm nước tiểu\n• 2 X-quang\n• 1 siêu âm',
			suggestions: ['Xem chi tiết', 'Ưu tiên khẩn cấp', 'Nhập kết quả'],
		};
	}

	if (lowerInput.includes('nhập') || lowerInput.includes('kết quả')) {
		return {
			content: 'Bạn muốn nhập kết quả loại xét nghiệm nào?',
			suggestions: [
				'Xét nghiệm máu',
				'Xét nghiệm nước tiểu',
				'Hình ảnh (X-quang, CT)',
				'Siêu âm',
			],
		};
	}

	if (lowerInput.includes('mẫu')) {
		return {
			content:
				'Quản lý mẫu xét nghiệm:\n✓ Tiếp nhận mẫu mới\n✓ Kiểm tra chất lượng mẫu\n✓ Phân loại và lưu trữ\n✓ Theo dõi tiến độ',
			suggestions: ['Mẫu mới hôm nay', 'Mẫu chờ xử lý'],
		};
	}

	return {
		content:
			'Tôi có thể giúp:\n✓ Quản lý xét nghiệm\n✓ Nhập kết quả\n✓ Kiểm tra mẫu\n✓ Báo cáo thống kê',
		suggestions: [],
	};
}

function handleAdminResponse(lowerInput: string, stats: DashboardStats) {
	if (lowerInput.includes('tổng quan') || lowerInput.includes('overview')) {
		return {
			content: `📊 Tổng quan hệ thống:\n• Tổng khách hàng: ${stats.totalRecords}\n• Hiệu suất: 98.5%\n• Người dùng hoạt động: 12\n• Thời gian phản hồi TB: 2.3s`,
			suggestions: ['Chi tiết hiệu suất', 'Cảnh báo hệ thống'],
		};
	}

	if (lowerInput.includes('người dùng') || lowerInput.includes('user')) {
		return {
			content:
				'Quản lý người dùng:\n✓ Thêm/xóa người dùng\n✓ Phân quyền vai trò\n✓ Theo dõi hoạt động\n✓ Đặt lại mật khẩu',
			suggestions: ['Danh sách người dùng', 'Thêm người dùng mới'],
		};
	}

	if (lowerInput.includes('cài đặt') || lowerInput.includes('setting')) {
		return {
			content:
				'Cài đặt hệ thống:\n• Cấu hình phòng khám\n• Quản lý dịch vụ\n• Thiết lập bảo mật\n• Sao lưu & phục hồi',
			suggestions: ['Cài đặt chung', 'Bảo mật'],
		};
	}

	return {
		content:
			'Tôi có thể giúp:\n✓ Giám sát hệ thống\n✓ Quản lý người dùng\n✓ Báo cáo tổng hợp\n✓ Cấu hình hệ thống',
		suggestions: [],
	};
}

function handlePatientResponse(lowerInput: string, onViewRecords: () => void) {
	if (
		lowerInput.includes('lịch hẹn') ||
		lowerInput.includes('hẹn') ||
		lowerInput.includes('appointment')
	) {
		return {
			content:
				'Bạn muốn xem lịch hẹn của mình? Tôi có thể giúp bạn:\n✓ Xem các cuộc hẹn sắp tới\n✓ Đặt lịch hẹn mới\n✓ Hủy hoặc thay đổi lịch hẹn\n✓ Xem lịch sử khám',
			suggestions: ['Xem lịch hẹn', 'Đặt lịch hẹn mới'],
		};
	}

	if (
		lowerInput.includes('phác đồ') ||
		lowerInput.includes('điều trị') ||
		lowerInput.includes('treatment')
	) {
		return {
			content:
				'Bạn muốn xem phác đồ điều trị? Tôi có thể giúp:\n✓ Xem danh sách thuốc đang uống\n✓ Hướng dẫn cách uống thuốc\n✓ Cập nhật tình hình điều trị\n✓ Gửi phản hồi cho bác sĩ',
			suggestions: ['Xem phác đồ điều trị', 'Cách cập nhật tình hình'],
		};
	}

	if (
		lowerInput.includes('thuốc') ||
		lowerInput.includes('medication') ||
		lowerInput.includes('uống')
	) {
		return {
			content:
				'Về thuốc bạn đang uống:\n✓ Xem danh sách thuốc\n✓ Hướng dẫn cách uống\n✓ Tác dụng phụ\n✓ Tương tác thuốc\n✓ Thời gian uống',
			suggestions: ['Danh sách thuốc', 'Hướng dẫn uống thuốc'],
		};
	}

	if (
		lowerInput.includes('cập nhật') ||
		lowerInput.includes('tình hình') ||
		lowerInput.includes('update')
	) {
		return {
			content:
				'Cập nhật tình hình điều trị:\n✓ Nhập các chỉ số sức khỏe (huyết áp, đường huyết, nhịp tim)\n✓ Ghi nhận tình trạng uống thuốc\n✓ Ghi chú về tác dụng phụ\n✓ Gửi phản hồi cho bác sĩ',
			suggestions: ['Cập nhật hôm nay', 'Xem hướng dẫn'],
		};
	}

	if (
		lowerInput.includes('khách hàng') ||
		lowerInput.includes('record') ||
		lowerInput.includes('medical')
	) {
		return {
			content:
				'Bạn muốn xem khách hàng y tế của mình? Tôi có thể giúp:\n✓ Xem lịch sử khám\n✓ Xem kết quả xét nghiệm\n✓ Xem chẩn đoán và điều trị\n✓ Tải xuống khách hàng',
			suggestions: ['Xem khách hàng y tế'],
		};
	}

	if (
		lowerInput.includes('sức khỏe') ||
		lowerInput.includes('health') ||
		lowerInput.includes('bệnh')
	) {
		return {
			content:
				'Tôi có thể tư vấn về:\n✓ Các triệu chứng thường gặp\n✓ Cách chăm sóc sức khỏe\n✓ Chế độ ăn uống\n✓ Tập luyện\n\n⚠️ Lưu ý: Thông tin chỉ mang tính tham khảo. Vui lòng tham khảo ý kiến bác sĩ cho các vấn đề nghiêm trọng.',
			suggestions: ['Chế độ ăn uống', 'Tập luyện'],
		};
	}

	return {
		content:
			'Tôi có thể giúp bạn:\n✓ Quản lý lịch hẹn\n✓ Theo dõi phác đồ điều trị\n✓ Xem khách hàng y tế\n✓ Giải đáp thắc mắc về sức khỏe\n✓ Hướng dẫn sử dụng hệ thống',
		suggestions: [
			'Xem lịch hẹn',
			'Xem phác đồ điều trị',
			'Xem khách hàng y tế',
		],
	};
}
