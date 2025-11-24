/**
 * Booking Form Validation Utils
 * Các hàm validate cho form đặt lịch khám - Theo spec validate_field.txt
 */

export interface ValidationResult {
	isValid: boolean;
	message?: string;
}

/**
 * Validate họ tên
 * Rules: Required, Min 2 chars, Max 100 chars, Chỉ chữ cái và khoảng trắng
 */
export const validateFullName = (name: string): ValidationResult => {
	if (!name || !name.trim()) {
		return { isValid: false, message: 'Vui lòng nhập họ và tên' };
	}

	if (name.trim().length < 2) {
		return { isValid: false, message: 'Họ tên phải có ít nhất 2 ký tự' };
	}

	if (name.trim().length > 100) {
		return { isValid: false, message: 'Họ tên không được vượt quá 100 ký tự' };
	}

	// Cho phép chữ cái, khoảng trắng, dấu tiếng Việt
	const nameRegex = /^[a-zA-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂẾưăạảấầẩẫậắằẳẵặẹẻẽềềểếỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹ\s]+$/;
	if (!nameRegex.test(name)) {
		return {
			isValid: false,
			message: 'Họ tên chỉ được chứa chữ cái và khoảng trắng',
		};
	}

	return { isValid: true };
};

/**
 * Validate giới tính
 * Rules: Required, Value must be 'male' or 'female'
 */
export const validateGender = (
	gender: string | undefined,
): ValidationResult => {
	if (!gender) {
		return { isValid: false, message: 'Vui lòng chọn giới tính' };
	}

	if (gender !== 'male' && gender !== 'female') {
		return { isValid: false, message: 'Giới tính không hợp lệ' };
	}

	return { isValid: true };
};

/**
 * Validate năm sinh
 * Rules: Required, Must be number, Min 1900, Max current year, Age < 100 tuổi
 */
export const validateYearOfBirth = (year: string): ValidationResult => {
	if (!year || !year.trim()) {
		return { isValid: false, message: 'Vui lòng nhập năm sinh' };
	}

	const yearNum = parseInt(year);
	const currentYear = new Date().getFullYear();

	if (isNaN(yearNum)) {
		return { isValid: false, message: 'Năm sinh không hợp lệ' };
	}

	if (yearNum < 1900) {
		return { isValid: false, message: 'Năm sinh phải từ 1900 trở lên' };
	}

	if (yearNum > currentYear) {
		return {
			isValid: false,
			message: 'Năm sinh không được lớn hơn năm hiện tại',
		};
	}

	// Kiểm tra tuổi < 100
	const age = currentYear - yearNum;
	if (age >= 100) {
		return { isValid: false, message: 'Năm sinh không hợp lý' };
	}

	return { isValid: true };
};

/**
 * Validate số CCCD/Hộ chiếu
 * Rules: Required, CCCD: 12 số hoặc CMND: 9 số, Hộ chiếu: 8-9 ký tự
 */
export const validateCCCD = (cccd: string): ValidationResult => {
	if (!cccd || !cccd.trim()) {
		return { isValid: false, message: 'Vui lòng nhập số CCCD/Hộ chiếu' };
	}

	// Loại bỏ khoảng trắng
	const cleanCCCD = cccd.replace(/\s/g, '');

	// CCCD: 12 số, CMND cũ: 9 số, Hộ chiếu: 8-9 ký tự
	if (!/^[A-Z0-9]{8,12}$/i.test(cleanCCCD)) {
		return {
			isValid: false,
			message: 'CCCD phải có 12 số hoặc CMND 9 số',
		};
	}

	// Nếu là số thuần (CCCD/CMND)
	if (/^\d+$/.test(cleanCCCD)) {
		if (cleanCCCD.length !== 9 && cleanCCCD.length !== 12) {
			return {
				isValid: false,
				message: 'CCCD phải có 12 số hoặc CMND 9 số',
			};
		}
	} else {
		// Hộ chiếu
		if (cleanCCCD.length < 8 || cleanCCCD.length > 9) {
			return {
				isValid: false,
				message: 'Hộ chiếu phải có 8-9 ký tự',
			};
		}
	}

	return { isValid: true };
};

/**
 * Validate ngày cấp CCCD
 * Rules: Required, Format dd/mm/yyyy, Valid date, Min year 1950, Not future, Max 50 years old
 */
export const validateCCCDIssueDate = (dateStr: string): ValidationResult => {
	if (!dateStr || !dateStr.trim()) {
		return { isValid: false, message: 'Vui lòng nhập ngày cấp' };
	}

	// Kiểm tra format dd/mm/yyyy
	if (!/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
		return {
			isValid: false,
			message: 'Ngày cấp phải có định dạng dd/mm/yyyy',
		};
	}

	const [day, month, year] = dateStr.split('/').map(Number);

	// Kiểm tra tháng hợp lệ
	if (month < 1 || month > 12) {
		return { isValid: false, message: 'Tháng không hợp lệ (1-12)' };
	}

	// Kiểm tra ngày hợp lệ
	const daysInMonth = new Date(year, month, 0).getDate();
	if (day < 1 || day > daysInMonth) {
		return {
			isValid: false,
			message: `Ngày không hợp lệ (1-${daysInMonth})`,
		};
	}

	// Tạo date object
	const issueDate = new Date(year, month - 1, day);
	const today = new Date();
	today.setHours(0, 0, 0, 0);

	// Kiểm tra năm >= 1950
	if (year < 1950) {
		return { isValid: false, message: 'Năm cấp phải từ 1950 trở lên' };
	}

	// Kiểm tra không được trong tương lai
	if (issueDate > today) {
		return { isValid: false, message: 'Ngày cấp không được sau ngày hôm nay' };
	}

	// Kiểm tra không quá 50 năm
	const fiftyYearsAgo = new Date();
	fiftyYearsAgo.setFullYear(fiftyYearsAgo.getFullYear() - 50);
	if (issueDate < fiftyYearsAgo) {
		return {
			isValid: false,
			message: 'Ngày cấp không được quá 50 năm',
		};
	}

	return { isValid: true };
};

/**
 * Validate nơi cấp
 * Rules: Required, Max 255 chars
 */
export const validateIssuePlace = (place: string): ValidationResult => {
	if (!place || !place.trim()) {
		return { isValid: false, message: 'Vui lòng nhập nơi cấp' };
	}

	if (place.trim().length > 255) {
		return {
			isValid: false,
			message: 'Nơi cấp không được vượt quá 255 ký tự',
		};
	}

	return { isValid: true };
};

/**
 * Validate hộ khẩu thường trú
 * Rules: Required, Max 500 chars
 */
export const validatePermanentAddress = (address: string): ValidationResult => {
	if (!address || !address.trim()) {
		return { isValid: false, message: 'Vui lòng nhập hộ khẩu thường trú' };
	}

	if (address.trim().length > 500) {
		return {
			isValid: false,
			message: 'Hộ khẩu thường trú không được vượt quá 500 ký tự',
		};
	}

	return { isValid: true };
};

/**
 * Validate chỗ ở hiện tại
 * Rules: Required, Max 500 chars
 */
export const validateCurrentAddress = (address: string): ValidationResult => {
	if (!address || !address.trim()) {
		return { isValid: false, message: 'Vui lòng nhập chỗ ở hiện tại' };
	}

	if (address.trim().length > 500) {
		return {
			isValid: false,
			message: 'Chỗ ở hiện tại không được vượt quá 500 ký tự',
		};
	}

	return { isValid: true };
};

/**
 * Validate nơi làm việc
 * Rules: Required, Max 255 chars
 */
export const validateWorkplace = (workplace: string): ValidationResult => {
	if (!workplace || !workplace.trim()) {
		return { isValid: false, message: 'Vui lòng nhập nơi làm việc' };
	}

	if (workplace.trim().length > 255) {
		return {
			isValid: false,
			message: 'Nơi làm việc không được vượt quá 255 ký tự',
		};
	}

	return { isValid: true };
};

/**
 * Validate bộ phận
 * Rules: Required, Max 255 chars
 */
export const validateDepartment = (department: string): ValidationResult => {
	if (!department || !department.trim()) {
		return { isValid: false, message: 'Vui lòng nhập bộ phận' };
	}

	if (department.trim().length > 255) {
		return {
			isValid: false,
			message: 'Bộ phận không được vượt quá 255 ký tự',
		};
	}

	return { isValid: true };
};

/**
 * Validate lý do khám
 * Rules: Required, Max 1000 chars
 */
export const validateReason = (reason: string): ValidationResult => {
	if (!reason || !reason.trim()) {
		return { isValid: false, message: 'Vui lòng nhập lý do khám sức khỏe' };
	}

	if (reason.trim().length > 1000) {
		return {
			isValid: false,
			message: 'Lý do khám không được vượt quá 1000 ký tự',
		};
	}

	return { isValid: true };
};

/**
 * Validate số điện thoại
 * Rules: Required, Only digits, Length: 10 số, Start with 0, Valid prefix (03, 05, 07, 08, 09)
 */
export const validatePhoneNumber = (phone: string): ValidationResult => {
	if (!phone || !phone.trim()) {
		return { isValid: false, message: 'Vui lòng nhập số điện thoại' };
	}

	// Loại bỏ khoảng trắng và dấu gạch ngang
	const cleanPhone = phone.replace(/[\s-]/g, '');

	// Kiểm tra chỉ chứa số
	if (!/^\d+$/.test(cleanPhone)) {
		return { isValid: false, message: 'Số điện thoại chỉ được chứa chữ số' };
	}

	// Kiểm tra độ dài đúng 10 số
	if (cleanPhone.length !== 10) {
		return {
			isValid: false,
			message: 'Số điện thoại phải có 10 chữ số',
		};
	}

	// Kiểm tra bắt đầu bằng 0
	if (!cleanPhone.startsWith('0')) {
		return { isValid: false, message: 'Số điện thoại phải bắt đầu bằng số 0' };
	}

	// Kiểm tra đầu số hợp lệ (03, 05, 07, 08, 09)
	const validPrefixes = ['03', '05', '07', '08', '09'];
	const prefix = cleanPhone.substring(0, 2);
	if (!validPrefixes.includes(prefix)) {
		return {
			isValid: false,
			message: 'Đầu số điện thoại không hợp lệ (phải là 03, 05, 07, 08, 09)',
		};
	}

	return { isValid: true };
};

/**
 * Validate tiền sử gia đình
 * Rules: Required, Value: 'yes' or 'no'
 */
export const validateFamilyHistory = (
	value: string | undefined,
): ValidationResult => {
	if (!value || (value !== 'yes' && value !== 'no')) {
		return {
			isValid: false,
			message: 'Vui lòng trả lời có bệnh gia đình không',
		};
	}

	return { isValid: true };
};

/**
 * Validate tên bệnh gia đình
 * Rules: Required if familyHasDisease = 'yes', Max 500 chars
 */
export const validateFamilyDiseaseDetail = (
	detail: string,
): ValidationResult => {
	if (!detail || !detail.trim()) {
		return {
			isValid: false,
			message: 'Vui lòng mô tả chi tiết bệnh gia đình',
		};
	}

	if (detail.trim().length > 500) {
		return {
			isValid: false,
			message: 'Mô tả bệnh gia đình không được vượt quá 500 ký tự',
		};
	}

	return { isValid: true };
};

/**
 * Validate tiền sử bản thân (yes/no questions)
 * Rules: Required, Value: 'yes' or 'no'
 */
export const validatePersonalHistoryItem = (
	value: string | undefined,
	questionName: string,
): ValidationResult => {
	if (!value || (value !== 'yes' && value !== 'no')) {
		return {
			isValid: false,
			message: 'Vui lòng trả lời tất cả các câu hỏi về tiền sử bệnh',
		};
	}

	return { isValid: true };
};

/**
 * Validate bệnh khác chi tiết
 * Rules: Required if otherDisease = 'yes', Max 500 chars
 */
export const validateOtherDiseaseDetail = (detail: string): ValidationResult => {
	if (!detail || !detail.trim()) {
		return {
			isValid: false,
			message: 'Vui lòng mô tả chi tiết bệnh khác',
		};
	}

	if (detail.trim().length > 500) {
		return {
			isValid: false,
			message: 'Mô tả bệnh khác không được vượt quá 500 ký tự',
		};
	}

	return { isValid: true };
};

/**
 * Validate đang điều trị
 * Rules: Required, Value: 'yes' or 'no'
 */
export const validateCurrentTreatment = (
	value: string | undefined,
): ValidationResult => {
	if (!value || (value !== 'yes' && value !== 'no')) {
		return {
			isValid: false,
			message: 'Vui lòng trả lời có đang điều trị không',
		};
	}

	return { isValid: true };
};

/**
 * Validate thuốc đang dùng
 * Rules: Required if currentTreatment = 'yes', Max 500 chars
 */
export const validateMedicationDetail = (detail: string): ValidationResult => {
	if (!detail || !detail.trim()) {
		return {
			isValid: false,
			message: 'Vui lòng mô tả chi tiết thuốc đang dùng',
		};
	}

	if (detail.trim().length > 500) {
		return {
			isValid: false,
			message: 'Mô tả thuốc đang dùng không được vượt quá 500 ký tự',
		};
	}

	return { isValid: true };
};

/**
 * Validate tiền sử thai sản
 * Rules: Required, Value: 'yes' or 'no'
 */
export const validatePregnancyHistory = (
	value: string | undefined,
): ValidationResult => {
	if (!value || (value !== 'yes' && value !== 'no')) {
		return {
			isValid: false,
			message: 'Vui lòng trả lời có tiền sử thai sản không',
		};
	}

	return { isValid: true };
};

/**
 * Validate chi tiết thai sản
 * Rules: Required if hasPregnancyHistory = 'yes', Max 500 chars
 */
export const validatePregnancyDetail = (detail: string): ValidationResult => {
	if (!detail || !detail.trim()) {
		return {
			isValid: false,
			message: 'Vui lòng mô tả chi tiết tiền sử thai sản',
		};
	}

	if (detail.trim().length > 500) {
		return {
			isValid: false,
			message: 'Mô tả tiền sử thai sản không được vượt quá 500 ký tự',
		};
	}

	return { isValid: true };
};
