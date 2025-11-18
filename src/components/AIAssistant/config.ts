import { UserRole } from '../../types/auth';
import { AIConfig } from './types';

export const getAIConfig = (role: UserRole): AIConfig => {
	const configs: Record<UserRole, AIConfig> = {
		receptionist: {
			greeting:
				'Xin chào! Tôi là trợ lý AI của Indica Clinic. Tôi sẽ giúp bạn tiếp nhận khách hàng nhanh chóng và quản lý công việc. Bạn cần hỗ trợ gì hôm nay?',
			suggestions: [
				'Tìm Khách hàng theo số điện thoại',
				'Có bao nhiêu cuộc hẹn hôm nay?',
				'Tạo công việc mới',
				'Xem danh sách công việc',
			],
			color: 'from-blue-500 via-cyan-500 to-blue-600',
		},
		doctor: {
			greeting:
				'Xin chào Bác sĩ! Tôi là trợ lý AI hỗ trợ khám chữa bệnh. Tôi sẽ giúp bạn quản lý khách hàng khám, chuẩn đoán và công việc. Bạn cần hỗ trợ gì?',
			suggestions: [
				'Có bao nhiêu khách hàng đang chờ khám?',
				'Xem phác đồ điều trị',
				'Tạo công việc mới',
				'Xem danh sách công việc',
			],
			color: 'from-emerald-500 via-teal-500 to-emerald-600',
		},
		nurse: {
			greeting:
				'Xin chào! Tôi là trợ lý AI hỗ trợ xét nghiệm. Tôi sẽ giúp bạn quản lý và nhập kết quả xét nghiệm. Bạn cần hỗ trợ gì?',
			suggestions: [
				'Có bao nhiêu xét nghiệm đang chờ xử lý?',
				'Xét nghiệm nào đã hoàn thành nhưng chưa có kết quả?',
				'Khách hàng nào có xét nghiệm máu?',
				'Xét nghiệm nào cần ưu tiên?',
			],
			color: 'from-violet-500 via-purple-500 to-fuchsia-600',
		},
		admin: {
			greeting:
				'Xin chào Admin! Tôi là trợ lý AI quản trị hệ thống. Tôi sẽ giúp bạn giám sát toàn bộ hoạt động của phòng khám. Bạn cần gì?',
			suggestions: [
				'Tổng số Khách hàng, cuộc hẹn, khách hàng là bao nhiêu?',
				'Doanh thu tổng cộng hôm nay là bao nhiêu?',
				'Bác sĩ nào khám nhiều Khách hàng nhất?',
				'Có bao nhiêu khách hàng chưa thanh toán?',
			],
			color: 'from-rose-500 via-pink-500 to-rose-600',
		},
		patient: {
			greeting:
				'Xin chào! Tôi là trợ lý AI của Indica Clinic. Tôi sẽ giúp bạn quản lý lịch hẹn, theo dõi phác đồ điều trị, quản lý công việc và giải đáp các thắc mắc về sức khỏe. Bạn cần hỗ trợ gì hôm nay?',
			suggestions: [
				'Xem lịch hẹn của tôi',
				'Tạo công việc mới',
				'Xem danh sách công việc',
				'Xem phác đồ điều trị',
			],
			color: 'from-rose-500 via-pink-500 to-rose-600',
		},
	};
	return configs[role];
};
