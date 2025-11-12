/**
 * Maps short suggestion phrases to full sentences for AI assistant
 * Example: "Báo cáo hôm nay" => "Hãy gửi cho tôi báo cáo ngày hôm nay"
 */

export const mapSuggestionToFullMessage = (suggestion: string): string => {
	const lowerSuggestion = suggestion.toLowerCase().trim();

	// Mapping rules for common suggestions
	const mappings: Record<string, string> = {
		// Receptionist - Tìm kiếm Khách hàng
		'tìm Khách hàng theo số điện thoại': 'Tìm Khách hàng theo số điện thoại',
		'có bao nhiêu cuộc hẹn hôm nay?': 'Có bao nhiêu cuộc hẹn hôm nay?',
		'Khách hàng nào chưa đến khám lâu nhất?':
			'Khách hàng nào chưa đến khám lâu nhất?',
		'xem danh sách cuộc hẹn đã hủy': 'Xem danh sách cuộc hẹn đã hủy',

		// Doctor - Quản lý khách hàng và phác đồ
		'có bao nhiêu khách hàng đang chờ khám?':
			'Có bao nhiêu khách hàng đang chờ khám?',
		'Khách hàng nào cần tái khám trong tuần này?':
			'Khách hàng nào cần tái khám trong tuần này?',
		'khách hàng nào có chẩn đoán nhưng chưa có phác đồ?':
			'khách hàng nào có chẩn đoán nhưng chưa có phác đồ?',
		'tôi đã khám bao nhiêu Khách hàng hôm nay?':
			'Tôi đã khám bao nhiêu Khách hàng hôm nay?',

		// Nurse - Quản lý xét nghiệm
		'có bao nhiêu xét nghiệm đang chờ xử lý?':
			'Có bao nhiêu xét nghiệm đang chờ xử lý?',
		'xét nghiệm nào đã hoàn thành nhưng chưa có kết quả?':
			'Xét nghiệm nào đã hoàn thành nhưng chưa có kết quả?',
		'Khách hàng nào có xét nghiệm máu?': 'Khách hàng nào có xét nghiệm máu?',
		'xét nghiệm nào cần ưu tiên?': 'Xét nghiệm nào cần ưu tiên?',

		// Admin - Thống kê và quản lý
		'tổng số Khách hàng, cuộc hẹn, khách hàng là bao nhiêu?':
			'Tổng số Khách hàng, cuộc hẹn, khách hàng là bao nhiêu?',
		'doanh thu tổng cộng hôm nay là bao nhiêu?':
			'Doanh thu tổng cộng hôm nay là bao nhiêu?',
		'bác sĩ nào khám nhiều Khách hàng nhất?':
			'Bác sĩ nào khám nhiều Khách hàng nhất?',
		'có bao nhiêu khách hàng chưa thanh toán?':
			'Có bao nhiêu khách hàng chưa thanh toán?',

		// Báo cáo và thống kê (giữ lại cho tương thích)
		'báo cáo hôm nay': 'Hãy gửi cho tôi báo cáo ngày hôm nay',
		'thống kê hôm nay': 'Hãy gửi cho tôi thống kê ngày hôm nay',
		'xuất báo cáo': 'Hãy xuất báo cáo cho tôi',
		'xem chi tiết': 'Hãy cho tôi xem chi tiết',

		// Tiếp nhận và quản lý khách hàng (giữ lại cho tương thích)
		'tiếp nhận khách hàng mới': 'Hãy giúp tôi tiếp nhận khách hàng mới',
		'tìm kiếm khách hàng': 'Hãy giúp tôi tìm kiếm khách hàng',
		'xem danh sách khách hàng': 'Hãy cho tôi xem danh sách khách hàng',
		'danh sách khách hàng': 'Hãy cho tôi xem danh sách khách hàng',
		'lọc theo trạng thái': 'Hãy giúp tôi lọc theo trạng thái',

		// Bác sĩ (giữ lại cho tương thích)
		'khách hàng chờ khám': 'Hãy cho tôi xem khách hàng chờ khám',
		'xem khách hàng cần xử lý': 'Hãy cho tôi xem khách hàng cần xử lý',
		'gợi ý chẩn đoán': 'Hãy gợi ý chẩn đoán cho tôi',
		'thống kê ca khám': 'Hãy gửi cho tôi thống kê ca khám',

		// Điều dưỡng (giữ lại cho tương thích)
		'xét nghiệm chờ xử lý': 'Hãy cho tôi xem các xét nghiệm chờ xử lý',
		'nhập kết quả': 'Hãy giúp tôi nhập kết quả xét nghiệm',
		'xem danh sách mẫu': 'Hãy cho tôi xem danh sách mẫu',
		'thống kê xét nghiệm': 'Hãy gửi cho tôi thống kê xét nghiệm',

		// Admin (giữ lại cho tương thích)
		'tổng quan hệ thống': 'Hãy cho tôi xem tổng quan hệ thống',
		'quản lý người dùng': 'Hãy giúp tôi quản lý người dùng',
		'báo cáo tổng hợp': 'Hãy gửi cho tôi báo cáo tổng hợp',
		'cài đặt hệ thống': 'Hãy mở cài đặt hệ thống cho tôi',

		// Tìm kiếm
		'tìm theo mã khách hàng': 'Hãy giúp tôi tìm theo mã khách hàng',
		'tìm theo số điện thoại': 'Hãy giúp tôi tìm theo số điện thoại',
		'tìm theo tên': 'Hãy giúp tôi tìm theo tên',
	};

	// Check exact match first
	if (mappings[lowerSuggestion]) {
		return mappings[lowerSuggestion];
	}

	// Pattern-based mapping for flexible matching
	if (
		lowerSuggestion.includes('báo cáo') &&
		lowerSuggestion.includes('hôm nay')
	) {
		return 'Hãy gửi cho tôi báo cáo ngày hôm nay';
	}

	if (
		lowerSuggestion.includes('thống kê') &&
		lowerSuggestion.includes('hôm nay')
	) {
		return 'Hãy gửi cho tôi thống kê ngày hôm nay';
	}

	if (lowerSuggestion.includes('tiếp nhận')) {
		return `Hãy giúp tôi ${suggestion.toLowerCase()}`;
	}

	if (lowerSuggestion.includes('tìm') || lowerSuggestion.includes('tìm kiếm')) {
		return `Hãy giúp tôi ${suggestion.toLowerCase()}`;
	}

	if (
		lowerSuggestion.includes('xem') ||
		lowerSuggestion.includes('cho tôi xem')
	) {
		return `Hãy ${suggestion.toLowerCase()}`;
	}

	if (lowerSuggestion.includes('nhập')) {
		return `Hãy giúp tôi ${suggestion.toLowerCase()}`;
	}

	if (lowerSuggestion.includes('quản lý')) {
		return `Hãy giúp tôi ${suggestion.toLowerCase()}`;
	}

	// Default: add "Hãy" prefix if not already present
	if (!lowerSuggestion.startsWith('hãy')) {
		return `Hãy ${suggestion}`;
	}

	return suggestion;
};
