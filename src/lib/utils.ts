/**
 * Format date to Vietnamese locale string
 */
export const formatDate = (dateString: string): string => {
	const date = new Date(dateString);
	return date.toLocaleDateString('vi-VN', {
		day: '2-digit',
		month: '2-digit',
		year: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
	});
};

/**
 * Format date to Vietnamese locale string (date only)
 */
export const formatDateOnly = (dateString: string): string => {
	const date = new Date(dateString);
	return date.toLocaleDateString('vi-VN', {
		day: '2-digit',
		month: '2-digit',
		year: 'numeric',
	});
};

/**
 * Generate receive code for medical records
 */
export const generateReceiveCode = (recordNumber: number): string => {
	const today = new Date();
	const dateStr = today.toISOString().split('T')[0].replace(/-/g, '');
	const paddedNumber = String(recordNumber).padStart(3, '0');
	return `RC${dateStr}${paddedNumber}`;
};

/**
 * Get function name by tab ID
 */
export const getFunctionName = (tabId: string): string => {
	const functionNames: Record<string, string> = {
		ai: 'Trợ lý AI',
		records: 'Hồ sơ',
		doctor: 'Bác sĩ',
		nurse: 'Điều dưỡng',
		return: 'Trả hồ sơ',
	};
	return functionNames[tabId] || 'Hệ thống quản lý phòng khám đa khoa Indica';
};
