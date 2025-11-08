// Mock data for existing patients - Generated for AI training
// Tổng cộng: 500 bệnh nhân và 200 cuộc hẹn

const ho = [
	'Nguyễn',
	'Trần',
	'Lê',
	'Phạm',
	'Hoàng',
	'Huỳnh',
	'Phan',
	'Vũ',
	'Võ',
	'Đặng',
	'Bùi',
	'Đỗ',
	'Hồ',
	'Ngô',
	'Dương',
	'Lý',
	'Đinh',
	'Trịnh',
	'Đào',
	'Mai',
];
const tenDem = [
	'Văn',
	'Thị',
	'Hoàng',
	'Minh',
	'Đức',
	'Thu',
	'Thành',
	'Hồng',
	'Thanh',
	'Quang',
	'Xuân',
	'Hữu',
	'Công',
	'Đình',
	'Ngọc',
	'Kim',
	'Bảo',
	'Anh',
	'Tuấn',
	'Hải',
];
const ten = [
	'An',
	'Bình',
	'Minh',
	'Hoa',
	'Lan',
	'Mai',
	'Hùng',
	'Dũng',
	'Thắng',
	'Hà',
	'Hương',
	'Linh',
	'Phương',
	'Trang',
	'Nam',
	'Đức',
	'Tuấn',
	'Hải',
	'Quang',
	'Thành',
	'Hồng',
	'Thanh',
	'Nga',
	'Yến',
	'Vy',
	'Anh',
	'Bảo',
	'Cường',
	'Dương',
	'Giang',
];

const duong = [
	'Lê Lợi',
	'Nguyễn Huệ',
	'Trần Hưng Đạo',
	'Lý Thường Kiệt',
	'Cách Mạng Tháng 8',
	'Điện Biên Phủ',
	'Võ Văn Tần',
	'Hai Bà Trưng',
	'Nguyễn Văn Linh',
	'Lê Văn Việt',
	'Hoàng Diệu',
	'Phan Văn Trị',
	'Nguyễn Trãi',
	'Lê Duẩn',
	'Võ Thị Sáu',
	'Nguyễn Thị Minh Khai',
	'Pasteur',
	'Điện Biên Phủ',
	'Nam Kỳ Khởi Nghĩa',
	'Đinh Tiên Hoàng',
];
const phuong = [
	'Bến Thành',
	'Tân Định',
	'Tân Phú',
	'Tân Hưng',
	'An Phú',
	'Đa Kao',
	'Cô Giang',
	'Cầu Kho',
	'Đa Kao',
	'Nguyễn Thái Bình',
	'Phạm Ngũ Lão',
	'Cầu Ông Lãnh',
	'Cô Giang',
	'Đa Kao',
	'Nguyễn Cư Trinh',
	'Phạm Ngũ Lão',
	'Cầu Kho',
	'Đa Kao',
	'Nguyễn Thái Bình',
	'Cô Giang',
];

const services = [
	['Khám nội tổng quát'],
	['Khám nội tổng quát', 'Xét nghiệm máu'],
	['Khám tim mạch'],
	['Khám tim mạch', 'Siêu âm tim'],
	['Khám da liễu'],
	['Khám tổng quát'],
	['Xét nghiệm máu'],
	['Siêu âm bụng'],
	['Chụp X-quang'],
	['Khám mắt'],
	['Khám tai mũi họng'],
	['Khám phụ khoa'],
	['Khám nam khoa'],
];

const reasons = [
	'Khám định kỳ',
	'Đau ngực, khó thở',
	'Dị ứng da',
	'Khám sức khỏe tổng quát',
	'Đau đầu',
	'Sốt, ho',
	'Đau bụng',
	'Khám mắt',
	'Khám răng',
	'Kiểm tra sức khỏe',
	'Khám phụ khoa',
	'Khám nam khoa',
	'Tiêm chủng',
	'Tái khám',
];

const doctors = [
	{ name: 'BS. Nguyễn Văn Hải', id: 'doc001' },
	{ name: 'BS. Trần Minh Tuấn', id: 'doc002' },
	{ name: 'BS. Lê Thị Hương', id: 'doc003' },
	{ name: 'BS. Phạm Hoàng Nam', id: 'doc004' },
	{ name: 'BS. Hoàng Thị Lan', id: 'doc005' },
	{ name: 'BS. Võ Đức Thắng', id: 'doc006' },
	{ name: 'BS. Đặng Thu Hà', id: 'doc007' },
	{ name: 'BS. Ngô Văn Tuấn', id: 'doc008' },
];

const insurancePrefixes = [
	'DN',
	'HS',
	'SG',
	'HN',
	'BT',
	'Q',
	'GV',
	'HP',
	'HY',
	'QB',
	'QT',
	'BD',
	'BL',
	'BP',
	'BR',
	'CM',
	'CT',
	'DB',
	'DG',
	'DL',
];

function randomElement<T>(arr: T[]): T {
	return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min: number, max: number): number {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function padZero(num: number, length: number): string {
	return num.toString().padStart(length, '0');
}

function generatePhoneNumber(): string {
	const prefix = [
		'090',
		'091',
		'092',
		'093',
		'094',
		'095',
		'096',
		'097',
		'098',
		'099',
		'032',
		'033',
		'034',
		'035',
		'036',
		'037',
		'038',
		'039',
	];
	return randomElement(prefix) + padZero(randomInt(1000000, 9999999), 7);
}

function generateDateOfBirth(): string {
	const year = randomInt(1950, 2010);
	const month = padZero(randomInt(1, 12), 2);
	const day = padZero(randomInt(1, 28), 2);
	return `${year}-${month}-${day}`;
}

function generateLastVisit(): string {
	const year = 2024;
	const month = padZero(randomInt(1, 11), 2);
	const day = padZero(randomInt(1, 28), 2);
	return `${year}-${month}-${day}`;
}

function generateAppointmentDate(): string {
	const year = 2024;
	const month = padZero(randomInt(11, 12), 2);
	const day = padZero(randomInt(1, 28), 2);
	return `${year}-${month}-${day}`;
}

function generateAppointmentTime(): string {
	const hours = padZero(randomInt(7, 17), 2);
	const minutes = randomElement(['00', '15', '30', '45']);
	return `${hours}:${minutes}`;
}

function generateFullName(): string {
	const hoName = randomElement(ho);
	const tenDemName = randomElement(tenDem);
	const tenName = randomElement(ten);
	return `${hoName} ${tenDemName} ${tenName}`;
}

function generateAddress(): string {
	const soNha = randomInt(1, 999);
	const duongName = randomElement(duong);
	const phuongName = randomElement(phuong);
	return `${soNha} Đường ${duongName}, Phường ${phuongName}, TP.HCM`;
}

function generateEmail(fullName: string): string {
	const nameParts = fullName.toLowerCase().replace(/\s+/g, '');
	const domain = randomElement([
		'email.com',
		'gmail.com',
		'yahoo.com',
		'hotmail.com',
		'outlook.com',
	]);
	return `${nameParts}@${domain}`;
}

function generateInsurance(): string {
	if (Math.random() < 0.3) return ''; // 30% không có bảo hiểm
	const prefix = randomElement(insurancePrefixes);
	const number = padZero(randomInt(1000000000, 9999999999), 10);
	return `${prefix}${number}`;
}

// Generate 500 patients
const generatedPatients: Array<{
	id: string;
	fullName: string;
	phoneNumber: string;
	dateOfBirth: string;
	gender: 'male' | 'female';
	address: string;
	email: string;
	customerId: string;
	cccdNumber: string;
	insurance: string;
	lastVisit: string;
	visitCount: number;
	faceId: string;
}> = [];
for (let i = 1; i <= 500; i++) {
	const fullName = generateFullName();
	const gender = Math.random() < 0.5 ? 'male' : 'female';
	const patientId = `p${padZero(i, 3)}`;
	const customerId = `KH${padZero(i, 3)}`;
	const cccdNumber = padZero(randomInt(100000000000, 999999999999), 12);

	generatedPatients.push({
		id: patientId,
		fullName,
		phoneNumber: generatePhoneNumber(),
		dateOfBirth: generateDateOfBirth(),
		gender: gender as 'male' | 'female',
		address: generateAddress(),
		email: generateEmail(fullName),
		customerId,
		cccdNumber,
		insurance: generateInsurance(),
		lastVisit: generateLastVisit(),
		visitCount: randomInt(1, 20),
		faceId: `face_${padZero(i, 3)}`,
	});
}

// Generate 200 appointments
const generatedAppointments: Array<{
	id: string;
	code: string;
	patientName: string;
	phoneNumber: string;
	dateOfBirth: string;
	gender: 'male' | 'female';
	email: string;
	address: string;
	customerId: string;
	insurance: string;
	appointmentDate: string;
	appointmentTime: string;
	services: string[];
	doctor: string;
	doctorId: string;
	reason: string;
	status: 'confirmed' | 'pending' | 'cancelled';
}> = [];
for (let i = 1; i <= 200; i++) {
	const fullName = generateFullName();
	const gender = Math.random() < 0.5 ? 'male' : 'female';
	const appointmentId = `apt${padZero(i, 3)}`;
	const customerId = `KH${padZero(i + 500, 3)}`;
	const date = generateAppointmentDate();
	const dateStr = date.replace(/-/g, '');
	const code = `LH${dateStr}${padZero(i, 3)}`;
	const doctor = randomElement(doctors);

	generatedAppointments.push({
		id: appointmentId,
		code,
		patientName: fullName,
		phoneNumber: generatePhoneNumber(),
		dateOfBirth: generateDateOfBirth(),
		gender: gender as 'male' | 'female',
		email: generateEmail(fullName),
		address: generateAddress(),
		customerId,
		insurance: generateInsurance(),
		appointmentDate: date,
		appointmentTime: generateAppointmentTime(),
		services: randomElement(services),
		doctor: doctor.name,
		doctorId: doctor.id,
		reason: randomElement(reasons),
		status: randomElement(['confirmed', 'pending', 'cancelled']) as
			| 'confirmed'
			| 'pending'
			| 'cancelled',
	});
}

export const mockExistingPatients = generatedPatients;
export const mockAppointments = generatedAppointments;
