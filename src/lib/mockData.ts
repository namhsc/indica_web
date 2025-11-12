import {
	MedicalRecord,
	TestOrder,
	DashboardStats,
	TreatmentPlan,
	Medication,
	Appointment,
	Notification,
	TreatmentReminder,
	Service,
	ServicePackage,
	Staff,
	MedicationCatalog,
	Department,
	Position,
	Specialty,
	UserRole,
} from '../types';
import { mockAppointments } from './mockPatients';

// Mock doctors
export const mockDoctors = [
	// Nội khoa
	{ id: 'doc1', name: 'BS. Nguyễn Văn An', specialty: 'Nội khoa' },
	{ id: 'doc5', name: 'BS. Hoàng Thị Lan', specialty: 'Nội khoa' },
	{ id: 'doc6', name: 'BS. Phạm Văn Đức', specialty: 'Nội khoa' },
	// Ngoại khoa
	{ id: 'doc2', name: 'BS. Trần Thị Bình', specialty: 'Ngoại khoa' },
	{ id: 'doc7', name: 'BS. Lê Văn Hùng', specialty: 'Ngoại khoa' },
	{ id: 'doc8', name: 'BS. Nguyễn Thị Mai', specialty: 'Ngoại khoa' },
	// Tim mạch
	{ id: 'doc3', name: 'BS. Lê Hoàng Cường', specialty: 'Tim mạch' },
	{ id: 'doc9', name: 'BS. Trần Văn Nam', specialty: 'Tim mạch' },
	{ id: 'doc10', name: 'BS. Phạm Thị Hoa', specialty: 'Tim mạch' },
	// Nhi khoa
	{ id: 'doc4', name: 'BS. Phạm Thị Dung', specialty: 'Nhi khoa' },
	{ id: 'doc11', name: 'BS. Nguyễn Văn Tuấn', specialty: 'Nhi khoa' },
	{ id: 'doc12', name: 'BS. Lê Thị Hương', specialty: 'Nhi khoa' },
	// Sản phụ khoa
	{ id: 'doc13', name: 'BS. Trần Thị Hồng', specialty: 'Sản phụ khoa' },
	{ id: 'doc14', name: 'BS. Nguyễn Thị Linh', specialty: 'Sản phụ khoa' },
	// Tai mũi họng
	{ id: 'doc15', name: 'BS. Phạm Văn Sơn', specialty: 'Tai mũi họng' },
	{ id: 'doc16', name: 'BS. Lê Thị Lan', specialty: 'Tai mũi họng' },
	// Mắt
	{ id: 'doc17', name: 'BS. Nguyễn Văn Minh', specialty: 'Mắt' },
	{ id: 'doc18', name: 'BS. Trần Thị Nga', specialty: 'Mắt' },
	// Da liễu
	{ id: 'doc19', name: 'BS. Phạm Thị Hạnh', specialty: 'Da liễu' },
	{ id: 'doc20', name: 'BS. Lê Văn Thành', specialty: 'Da liễu' },
	// Thần kinh
	{ id: 'doc21', name: 'BS. Nguyễn Thị Loan', specialty: 'Thần kinh' },
	{ id: 'doc22', name: 'BS. Trần Văn Bình', specialty: 'Thần kinh' },
	// Chấn thương chỉnh hình
	{
		id: 'doc23',
		name: 'BS. Phạm Văn Đông',
		specialty: 'Chấn thương chỉnh hình',
	},
	{ id: 'doc24', name: 'BS. Lê Thị Thu', specialty: 'Chấn thương chỉnh hình' },
	// Ung bướu
	{ id: 'doc25', name: 'BS. Nguyễn Văn Hải', specialty: 'Ung bướu' },
	{ id: 'doc26', name: 'BS. Trần Thị Vân', specialty: 'Ung bướu' },
	// Hồi sức cấp cứu
	{ id: 'doc27', name: 'BS. Phạm Văn Long', specialty: 'Hồi sức cấp cứu' },
	{ id: 'doc28', name: 'BS. Lê Thị Hoa', specialty: 'Hồi sức cấp cứu' },
	// Xét nghiệm
	{ id: 'doc29', name: 'BS. Nguyễn Thị Phương', specialty: 'Xét nghiệm' },
	// Chẩn đoán hình ảnh
	{ id: 'doc30', name: 'BS. Trần Văn Quang', specialty: 'Chẩn đoán hình ảnh' },
	{ id: 'doc31', name: 'BS. Phạm Thị Thảo', specialty: 'Chẩn đoán hình ảnh' },
];

// Mock services (deprecated - kept for backward compatibility)
export const mockServices = [
	'Khám tổng quát',
	'Xét nghiệm máu',
	'Xét nghiệm nước tiểu',
	'Chụp X-quang',
	'Siêu âm',
	'Chụp CT',
	'Chụp MRI',
	'Điện tim',
];

// Mock Services data
export const mockServicesData: Service[] = [
	{
		id: 'svc1',
		name: 'Khám tổng quát',
		code: 'K001',
		description: 'Khám sức khỏe tổng quát cơ bản',
		category: 'examination',
		price: 200000,
		unit: 'lần',
		duration: 30,
		isActive: true,
		createdAt: new Date('2024-01-01').toISOString(),
		updatedAt: new Date('2024-01-01').toISOString(),
	},
	{
		id: 'svc2',
		name: 'Xét nghiệm máu',
		code: 'XN001',
		description: 'Xét nghiệm máu tổng quát',
		category: 'test',
		price: 300000,
		unit: 'lần',
		duration: 15,
		isActive: true,
		createdAt: new Date('2024-01-01').toISOString(),
		updatedAt: new Date('2024-01-01').toISOString(),
	},
	{
		id: 'svc3',
		name: 'Xét nghiệm nước tiểu',
		code: 'XN002',
		description: 'Xét nghiệm nước tiểu tổng quát',
		category: 'test',
		price: 150000,
		unit: 'lần',
		duration: 10,
		isActive: true,
		createdAt: new Date('2024-01-01').toISOString(),
		updatedAt: new Date('2024-01-01').toISOString(),
	},
	{
		id: 'svc4',
		name: 'Chụp X-quang',
		code: 'C001',
		description: 'Chụp X-quang chuẩn',
		category: 'imaging',
		price: 250000,
		unit: 'lần',
		duration: 20,
		isActive: true,
		createdAt: new Date('2024-01-01').toISOString(),
		updatedAt: new Date('2024-01-01').toISOString(),
	},
	{
		id: 'svc5',
		name: 'Siêu âm',
		code: 'SA001',
		description: 'Siêu âm chuẩn',
		category: 'imaging',
		price: 350000,
		unit: 'lần',
		duration: 30,
		isActive: true,
		createdAt: new Date('2024-01-01').toISOString(),
		updatedAt: new Date('2024-01-01').toISOString(),
	},
	{
		id: 'svc6',
		name: 'Chụp CT',
		code: 'CT001',
		description: 'Chụp CT Scanner',
		category: 'imaging',
		price: 1500000,
		unit: 'lần',
		duration: 60,
		isActive: true,
		createdAt: new Date('2024-01-01').toISOString(),
		updatedAt: new Date('2024-01-01').toISOString(),
	},
	{
		id: 'svc7',
		name: 'Chụp MRI',
		code: 'MRI001',
		description: 'Chụp cộng hưởng từ',
		category: 'imaging',
		price: 2500000,
		unit: 'lần',
		duration: 90,
		isActive: true,
		createdAt: new Date('2024-01-01').toISOString(),
		updatedAt: new Date('2024-01-01').toISOString(),
	},
	{
		id: 'svc8',
		name: 'Điện tim',
		code: 'ECG001',
		description: 'Điện tim đồ',
		category: 'test',
		price: 200000,
		unit: 'lần',
		duration: 15,
		isActive: true,
		createdAt: new Date('2024-01-01').toISOString(),
		updatedAt: new Date('2024-01-01').toISOString(),
	},
	{
		id: 'svc9',
		name: 'Khám nội khoa',
		code: 'K002',
		description: 'Khám nội khoa chuyên sâu',
		category: 'examination',
		price: 300000,
		unit: 'lần',
		duration: 45,
		isActive: true,
		createdAt: new Date('2024-01-01').toISOString(),
		updatedAt: new Date('2024-01-01').toISOString(),
	},
	{
		id: 'svc10',
		name: 'Khám ngoại khoa',
		code: 'K003',
		description: 'Khám ngoại khoa',
		category: 'examination',
		price: 300000,
		unit: 'lần',
		duration: 45,
		isActive: true,
		createdAt: new Date('2024-01-01').toISOString(),
		updatedAt: new Date('2024-01-01').toISOString(),
	},
];

// Mock Service Packages data
export const mockServicePackagesData: ServicePackage[] = [
	{
		id: 'pkg1',
		name: 'Gói khám sức khỏe tổng quát',
		code: 'PKG001',
		description: 'Khám sức khỏe định kỳ cơ bản',
		services: ['svc1', 'svc2', 'svc3', 'svc8'],
		price: 750000,
		discount: 10,
		isActive: true,
		createdAt: new Date('2024-01-01').toISOString(),
		updatedAt: new Date('2024-01-01').toISOString(),
	},
	{
		id: 'pkg2',
		name: 'Gói khám tim mạch',
		code: 'PKG002',
		description: 'Chuyên sâu về tim mạch',
		services: ['svc1', 'svc8', 'svc2', 'svc5'],
		price: 1000000,
		discount: 15,
		isActive: true,
		createdAt: new Date('2024-01-01').toISOString(),
		updatedAt: new Date('2024-01-01').toISOString(),
	},
	{
		id: 'pkg3',
		name: 'Gói khám tiêu hóa',
		code: 'PKG003',
		description: 'Chẩn đoán các bệnh về tiêu hóa',
		services: ['svc1', 'svc5', 'svc2', 'svc3'],
		price: 900000,
		discount: 12,
		isActive: true,
		createdAt: new Date('2024-01-01').toISOString(),
		updatedAt: new Date('2024-01-01').toISOString(),
	},
	{
		id: 'pkg4',
		name: 'Gói khám hình ảnh cơ bản',
		code: 'PKG004',
		description: 'Chẩn đoán hình ảnh cơ bản',
		services: ['svc4', 'svc5'],
		price: 550000,
		discount: 8,
		isActive: true,
		createdAt: new Date('2024-01-01').toISOString(),
		updatedAt: new Date('2024-01-01').toISOString(),
	},
	{
		id: 'pkg5',
		name: 'Gói khám hình ảnh nâng cao',
		code: 'PKG005',
		description: 'Chẩn đoán hình ảnh chuyên sâu',
		services: ['svc6', 'svc7', 'svc5'],
		price: 4000000,
		discount: 20,
		isActive: true,
		createdAt: new Date('2024-01-01').toISOString(),
		updatedAt: new Date('2024-01-01').toISOString(),
	},
];

// Mock Staff data
export const mockStaffData: Staff[] = [
	// Doctors
	{
		id: 'staff1',
		fullName: 'BS. Nguyễn Văn An',
		code: 'DOC001',
		email: 'nguyenvanan@indica.com',
		phoneNumber: '0901234567',
		dateOfBirth: '1980-05-15',
		gender: 'male',
		role: 'doctor',
		specialty: 'Nội khoa',
		position: 'Bác sĩ',
		department: 'Khoa Nội',
		address: '123 Đường ABC, Quận 1, TP.HCM',
		isActive: true,
		createdAt: new Date('2023-01-01').toISOString(),
		updatedAt: new Date('2024-01-01').toISOString(),
	},
	{
		id: 'staff2',
		fullName: 'BS. Trần Thị Bình',
		code: 'DOC002',
		email: 'tranthibinh@indica.com',
		phoneNumber: '0912345678',
		dateOfBirth: '1985-08-20',
		gender: 'female',
		role: 'doctor',
		specialty: 'Ngoại khoa',
		position: 'Bác sĩ',
		department: 'Khoa Ngoại',
		address: '456 Đường XYZ, Quận 2, TP.HCM',
		isActive: true,
		createdAt: new Date('2023-01-01').toISOString(),
		updatedAt: new Date('2024-01-01').toISOString(),
	},
	{
		id: 'staff3',
		fullName: 'BS. Lê Hoàng Cường',
		code: 'DOC003',
		email: 'lehoangcuong@indica.com',
		phoneNumber: '0923456789',
		dateOfBirth: '1978-12-10',
		gender: 'male',
		role: 'doctor',
		specialty: 'Tim mạch',
		position: 'Bác sĩ trưởng khoa',
		department: 'Khoa Tim mạch',
		address: '789 Đường DEF, Quận 3, TP.HCM',
		isActive: true,
		createdAt: new Date('2022-01-01').toISOString(),
		updatedAt: new Date('2024-01-01').toISOString(),
	},
	// Nurses
	{
		id: 'staff4',
		fullName: 'ĐD. Nguyễn Thị Hoa',
		code: 'NUR001',
		email: 'nguyenthihoa@indica.com',
		phoneNumber: '0934567890',
		dateOfBirth: '1990-03-25',
		gender: 'female',
		role: 'nurse',
		position: 'Điều dưỡng',
		department: 'Khoa Nội',
		address: '321 Đường GHI, Quận 4, TP.HCM',
		isActive: true,
		createdAt: new Date('2023-06-01').toISOString(),
		updatedAt: new Date('2024-01-01').toISOString(),
	},
	{
		id: 'staff5',
		fullName: 'ĐD. Trần Văn Nam',
		code: 'NUR002',
		email: 'tranvannam@indica.com',
		phoneNumber: '0945678901',
		dateOfBirth: '1992-07-15',
		gender: 'male',
		role: 'nurse',
		position: 'Điều dưỡng',
		department: 'Khoa Ngoại',
		address: '654 Đường JKL, Quận 5, TP.HCM',
		isActive: true,
		createdAt: new Date('2023-06-01').toISOString(),
		updatedAt: new Date('2024-01-01').toISOString(),
	},
	// Receptionists
	{
		id: 'staff6',
		fullName: 'Lễ tân Nguyễn Thị Lan',
		code: 'REC001',
		email: 'nguyenthilan@indica.com',
		phoneNumber: '0956789012',
		dateOfBirth: '1995-09-20',
		gender: 'female',
		role: 'receptionist',
		position: 'Lễ tân',
		department: 'Lễ tân',
		address: '987 Đường MNO, Quận 6, TP.HCM',
		isActive: true,
		createdAt: new Date('2023-03-01').toISOString(),
		updatedAt: new Date('2024-01-01').toISOString(),
	},
	{
		id: 'staff7',
		fullName: 'Lễ tân Phạm Văn Đức',
		code: 'REC002',
		email: 'phamvanduc@indica.com',
		phoneNumber: '0967890123',
		dateOfBirth: '1993-11-30',
		gender: 'male',
		role: 'receptionist',
		position: 'Lễ tân',
		department: 'Lễ tân',
		address: '147 Đường PQR, Quận 7, TP.HCM',
		isActive: true,
		createdAt: new Date('2023-03-01').toISOString(),
		updatedAt: new Date('2024-01-01').toISOString(),
	},
	// Admin
	{
		id: 'staff8',
		fullName: 'Quản trị viên Lê Thị Hương',
		code: 'ADM001',
		email: 'lethihuong@indica.com',
		phoneNumber: '0978901234',
		dateOfBirth: '1988-04-12',
		gender: 'female',
		role: 'admin',
		position: 'Quản trị viên',
		department: 'Hành chính',
		address: '258 Đường STU, Quận 8, TP.HCM',
		isActive: true,
		createdAt: new Date('2022-01-01').toISOString(),
		updatedAt: new Date('2024-01-01').toISOString(),
	},
];

// Mock Medication Catalog data
export const mockMedicationCatalogData: MedicationCatalog[] = [
	// Kháng sinh
	{
		id: 'med1',
		name: 'Amoxicillin',
		code: 'MED001',
		activeIngredient: 'Amoxicillin',
		strength: '500mg',
		unit: 'viên',
		category: 'antibiotic',
		manufacturer: 'Công ty Dược phẩm A',
		description:
			'Kháng sinh phổ rộng, điều trị nhiễm khuẩn đường hô hấp, tiết niệu',
		indications: 'Nhiễm khuẩn đường hô hấp, tiết niệu, da và mô mềm',
		contraindications: 'Quá mẫn với penicillin, suy gan nặng',
		sideEffects: 'Buồn nôn, tiêu chảy, phát ban',
		isActive: true,
		createdAt: new Date('2024-01-01').toISOString(),
		updatedAt: new Date('2024-01-01').toISOString(),
	},
	{
		id: 'med2',
		name: 'Azithromycin',
		code: 'MED002',
		activeIngredient: 'Azithromycin',
		strength: '500mg',
		unit: 'viên',
		category: 'antibiotic',
		manufacturer: 'Công ty Dược phẩm B',
		description: 'Kháng sinh macrolide, điều trị nhiễm khuẩn đường hô hấp',
		indications: 'Nhiễm khuẩn đường hô hấp, nhiễm khuẩn da và mô mềm',
		contraindications: 'Quá mẫn với macrolide, rối loạn nhịp tim',
		sideEffects: 'Buồn nôn, đau bụng, tiêu chảy',
		isActive: true,
		createdAt: new Date('2024-01-01').toISOString(),
		updatedAt: new Date('2024-01-01').toISOString(),
	},
	{
		id: 'med3',
		name: 'Cefuroxime',
		code: 'MED003',
		activeIngredient: 'Cefuroxime',
		strength: '250mg',
		unit: 'viên',
		category: 'antibiotic',
		manufacturer: 'Công ty Dược phẩm C',
		description: 'Kháng sinh cephalosporin thế hệ 2',
		indications: 'Nhiễm khuẩn đường hô hấp, tiết niệu',
		contraindications: 'Quá mẫn với cephalosporin',
		sideEffects: 'Tiêu chảy, buồn nôn, phát ban',
		isActive: true,
		createdAt: new Date('2024-01-01').toISOString(),
		updatedAt: new Date('2024-01-01').toISOString(),
	},
	// Giảm đau, hạ sốt
	{
		id: 'med4',
		name: 'Paracetamol',
		code: 'MED004',
		activeIngredient: 'Paracetamol',
		strength: '500mg',
		unit: 'viên',
		category: 'analgesic',
		manufacturer: 'Công ty Dược phẩm D',
		description: 'Thuốc giảm đau, hạ sốt',
		indications: 'Đau nhức, sốt',
		contraindications: 'Suy gan nặng, quá mẫn với paracetamol',
		sideEffects: 'Hiếm gặp, có thể gây tổn thương gan nếu quá liều',
		isActive: true,
		createdAt: new Date('2024-01-01').toISOString(),
		updatedAt: new Date('2024-01-01').toISOString(),
	},
	{
		id: 'med5',
		name: 'Ibuprofen',
		code: 'MED005',
		activeIngredient: 'Ibuprofen',
		strength: '400mg',
		unit: 'viên',
		category: 'analgesic',
		manufacturer: 'Công ty Dược phẩm E',
		description: 'Thuốc chống viêm không steroid, giảm đau, hạ sốt',
		indications: 'Đau nhức, viêm khớp, sốt',
		contraindications: 'Loét dạ dày, suy thận, quá mẫn với NSAID',
		sideEffects: 'Đau dạ dày, buồn nôn, chóng mặt',
		isActive: true,
		createdAt: new Date('2024-01-01').toISOString(),
		updatedAt: new Date('2024-01-01').toISOString(),
	},
	// Chống viêm
	{
		id: 'med6',
		name: 'Diclofenac',
		code: 'MED006',
		activeIngredient: 'Diclofenac',
		strength: '50mg',
		unit: 'viên',
		category: 'anti_inflammatory',
		manufacturer: 'Công ty Dược phẩm F',
		description: 'Thuốc chống viêm không steroid',
		indications: 'Viêm khớp, đau cơ xương khớp',
		contraindications: 'Loét dạ dày, suy thận, suy gan',
		sideEffects: 'Đau dạ dày, buồn nôn, chóng mặt',
		isActive: true,
		createdAt: new Date('2024-01-01').toISOString(),
		updatedAt: new Date('2024-01-01').toISOString(),
	},
	// Tiêu hóa
	{
		id: 'med7',
		name: 'Omeprazole',
		code: 'MED007',
		activeIngredient: 'Omeprazole',
		strength: '20mg',
		unit: 'viên',
		category: 'gastrointestinal',
		manufacturer: 'Công ty Dược phẩm G',
		description: 'Thuốc ức chế bơm proton, điều trị loét dạ dày',
		indications: 'Loét dạ dày, trào ngược dạ dày thực quản',
		contraindications: 'Quá mẫn với omeprazole',
		sideEffects: 'Đau đầu, tiêu chảy, buồn nôn',
		isActive: true,
		createdAt: new Date('2024-01-01').toISOString(),
		updatedAt: new Date('2024-01-01').toISOString(),
	},
	{
		id: 'med8',
		name: 'Ranitidine',
		code: 'MED008',
		activeIngredient: 'Ranitidine',
		strength: '150mg',
		unit: 'viên',
		category: 'gastrointestinal',
		manufacturer: 'Công ty Dược phẩm H',
		description: 'Thuốc kháng histamine H2, giảm tiết acid dạ dày',
		indications: 'Loét dạ dày, trào ngược dạ dày thực quản',
		contraindications: 'Quá mẫn với ranitidine',
		sideEffects: 'Đau đầu, chóng mặt, buồn nôn',
		isActive: true,
		createdAt: new Date('2024-01-01').toISOString(),
		updatedAt: new Date('2024-01-01').toISOString(),
	},
	// Hô hấp
	{
		id: 'med9',
		name: 'Codein',
		code: 'MED009',
		activeIngredient: 'Codein',
		strength: '15mg',
		unit: 'viên',
		category: 'respiratory',
		manufacturer: 'Công ty Dược phẩm I',
		description: 'Thuốc giảm ho, giảm đau',
		indications: 'Ho khan, đau nhẹ đến trung bình',
		contraindications: 'Suy hô hấp, quá mẫn với codein',
		sideEffects: 'Buồn ngủ, táo bón, buồn nôn',
		isActive: true,
		createdAt: new Date('2024-01-01').toISOString(),
		updatedAt: new Date('2024-01-01').toISOString(),
	},
	{
		id: 'med10',
		name: 'Dextromethorphan',
		code: 'MED010',
		activeIngredient: 'Dextromethorphan',
		strength: '15mg/5ml',
		unit: 'chai',
		category: 'respiratory',
		manufacturer: 'Công ty Dược phẩm J',
		description: 'Thuốc giảm ho không gây nghiện',
		indications: 'Ho khan, ho do cảm lạnh',
		contraindications: 'Quá mẫn với dextromethorphan',
		sideEffects: 'Buồn nôn, chóng mặt, buồn ngủ',
		isActive: true,
		createdAt: new Date('2024-01-01').toISOString(),
		updatedAt: new Date('2024-01-01').toISOString(),
	},
	// Tim mạch
	{
		id: 'med11',
		name: 'Amlodipine',
		code: 'MED011',
		activeIngredient: 'Amlodipine',
		strength: '5mg',
		unit: 'viên',
		category: 'cardiovascular',
		manufacturer: 'Công ty Dược phẩm K',
		description: 'Thuốc chẹn kênh canxi, điều trị tăng huyết áp',
		indications: 'Tăng huyết áp, đau thắt ngực',
		contraindications: 'Suy tim nặng, hẹp van động mạch chủ',
		sideEffects: 'Phù chân, đau đầu, chóng mặt',
		isActive: true,
		createdAt: new Date('2024-01-01').toISOString(),
		updatedAt: new Date('2024-01-01').toISOString(),
	},
	{
		id: 'med12',
		name: 'Atenolol',
		code: 'MED012',
		activeIngredient: 'Atenolol',
		strength: '50mg',
		unit: 'viên',
		category: 'cardiovascular',
		manufacturer: 'Công ty Dược phẩm L',
		description: 'Thuốc chẹn beta, điều trị tăng huyết áp',
		indications: 'Tăng huyết áp, đau thắt ngực, rối loạn nhịp tim',
		contraindications: 'Suy tim nặng, block nhĩ thất, hen phế quản',
		sideEffects: 'Mệt mỏi, chóng mặt, nhịp tim chậm',
		isActive: true,
		createdAt: new Date('2024-01-01').toISOString(),
		updatedAt: new Date('2024-01-01').toISOString(),
	},
	// Vitamin
	{
		id: 'med13',
		name: 'Vitamin C',
		code: 'MED013',
		activeIngredient: 'Ascorbic Acid',
		strength: '1000mg',
		unit: 'viên',
		category: 'vitamin',
		manufacturer: 'Công ty Dược phẩm M',
		description: 'Vitamin C tăng cường miễn dịch',
		indications: 'Thiếu vitamin C, tăng cường miễn dịch',
		contraindications: 'Quá mẫn với vitamin C',
		sideEffects: 'Tiêu chảy nếu dùng quá liều',
		isActive: true,
		createdAt: new Date('2024-01-01').toISOString(),
		updatedAt: new Date('2024-01-01').toISOString(),
	},
	{
		id: 'med14',
		name: 'Vitamin D3',
		code: 'MED014',
		activeIngredient: 'Cholecalciferol',
		strength: '2000 IU',
		unit: 'viên',
		category: 'vitamin',
		manufacturer: 'Công ty Dược phẩm N',
		description: 'Vitamin D3 bổ sung canxi, tăng cường xương',
		indications: 'Thiếu vitamin D, loãng xương',
		contraindications: 'Tăng canxi máu, tăng canxi niệu',
		sideEffects: 'Hiếm gặp, có thể gây tăng canxi máu nếu quá liều',
		isActive: true,
		createdAt: new Date('2024-01-01').toISOString(),
		updatedAt: new Date('2024-01-01').toISOString(),
	},
	// Da liễu
	{
		id: 'med15',
		name: 'Hydrocortisone cream',
		code: 'MED015',
		activeIngredient: 'Hydrocortisone',
		strength: '1%',
		unit: 'tuýp',
		category: 'dermatological',
		manufacturer: 'Công ty Dược phẩm O',
		description: 'Kem bôi chống viêm, chống dị ứng',
		indications: 'Viêm da, dị ứng, chàm',
		contraindications: 'Nhiễm trùng da, quá mẫn với hydrocortisone',
		sideEffects: 'Kích ứng da, teo da nếu dùng lâu',
		isActive: true,
		createdAt: new Date('2024-01-01').toISOString(),
		updatedAt: new Date('2024-01-01').toISOString(),
	},
	{
		id: 'med16',
		name: 'Clotrimazole cream',
		code: 'MED016',
		activeIngredient: 'Clotrimazole',
		strength: '1%',
		unit: 'tuýp',
		category: 'dermatological',
		manufacturer: 'Công ty Dược phẩm P',
		description: 'Kem bôi kháng nấm',
		indications: 'Nhiễm nấm da, nấm kẽ chân',
		contraindications: 'Quá mẫn với clotrimazole',
		sideEffects: 'Kích ứng da, đỏ da',
		isActive: true,
		createdAt: new Date('2024-01-01').toISOString(),
		updatedAt: new Date('2024-01-01').toISOString(),
	},
	// Mắt
	{
		id: 'med17',
		name: 'Chloramphenicol eye drops',
		code: 'MED017',
		activeIngredient: 'Chloramphenicol',
		strength: '0.5%',
		unit: 'chai',
		category: 'ophthalmic',
		manufacturer: 'Công ty Dược phẩm Q',
		description: 'Thuốc nhỏ mắt kháng khuẩn',
		indications: 'Viêm kết mạc, viêm giác mạc do vi khuẩn',
		contraindications: 'Quá mẫn với chloramphenicol',
		sideEffects: 'Kích ứng mắt, đỏ mắt',
		isActive: true,
		createdAt: new Date('2024-01-01').toISOString(),
		updatedAt: new Date('2024-01-01').toISOString(),
	},
	{
		id: 'med18',
		name: 'Tobramycin eye drops',
		code: 'MED018',
		activeIngredient: 'Tobramycin',
		strength: '0.3%',
		unit: 'chai',
		category: 'ophthalmic',
		manufacturer: 'Công ty Dược phẩm R',
		description: 'Thuốc nhỏ mắt kháng sinh',
		indications: 'Viêm kết mạc, viêm giác mạc do vi khuẩn',
		contraindications: 'Quá mẫn với tobramycin',
		sideEffects: 'Kích ứng mắt, đỏ mắt, chảy nước mắt',
		isActive: true,
		createdAt: new Date('2024-01-01').toISOString(),
		updatedAt: new Date('2024-01-01').toISOString(),
	},
];

// Gói khám với các dịch vụ con
export interface ExaminationPackage {
	id: string;
	name: string;
	description?: string;
	services: string[]; // Các dịch vụ con trong gói
}

export const mockExaminationPackages: ExaminationPackage[] = [
	{
		id: 'pkg1',
		name: 'Gói khám sức khỏe tổng quát',
		description: 'Khám sức khỏe định kỳ cơ bản',
		services: [
			'Khám tổng quát',
			'Xét nghiệm máu',
			'Xét nghiệm nước tiểu',
			'Điện tim',
		],
	},
	{
		id: 'pkg2',
		name: 'Gói khám tim mạch',
		description: 'Chuyên sâu về tim mạch',
		services: ['Khám tổng quát', 'Điện tim', 'Xét nghiệm máu', 'Siêu âm tim'],
	},
	{
		id: 'pkg3',
		name: 'Gói khám tiêu hóa',
		description: 'Chẩn đoán các bệnh về tiêu hóa',
		services: [
			'Khám tổng quát',
			'Siêu âm bụng',
			'Xét nghiệm máu',
			'Xét nghiệm nước tiểu',
		],
	},
	{
		id: 'pkg4',
		name: 'Gói khám hình ảnh cơ bản',
		description: 'Chẩn đoán hình ảnh cơ bản',
		services: ['Chụp X-quang', 'Siêu âm'],
	},
	{
		id: 'pkg5',
		name: 'Gói khám hình ảnh nâng cao',
		description: 'Chẩn đoán hình ảnh chuyên sâu',
		services: ['Chụp CT', 'Chụp MRI', 'Siêu âm'],
	},
	{
		id: 'pkg6',
		name: 'Gói khám xét nghiệm đầy đủ',
		description: 'Xét nghiệm toàn diện',
		services: ['Xét nghiệm máu', 'Xét nghiệm nước tiểu', 'Xét nghiệm sinh hóa'],
	},
	{
		id: 'pkg7',
		name: 'Gói khám sức khỏe cao cấp',
		description: 'Khám sức khỏe toàn diện',
		services: [
			'Khám tổng quát',
			'Xét nghiệm máu',
			'Xét nghiệm nước tiểu',
			'Chụp X-quang',
			'Siêu âm',
			'Điện tim',
		],
	},
];

// Generate mock medical records
export const generateMockRecords = (): MedicalRecord[] => {
	// Phân bố trạng thái cho appointments: 20% PENDING_CHECKIN, 30% PENDING_EXAMINATION, 30% IN_EXAMINATION, 20% COMPLETED_EXAMINATION
	const statusDistribution: Array<{
		status: MedicalRecord['status'];
		weight: number;
	}> = [
		{ status: 'PENDING_CHECKIN', weight: 0.2 },
		{ status: 'PENDING_EXAMINATION', weight: 0.3 },
		{ status: 'IN_EXAMINATION', weight: 0.3 },
		{ status: 'COMPLETED_EXAMINATION', weight: 0.2 },
	];

	const getStatusForIndex = (index: number): MedicalRecord['status'] => {
		// Create a shuffled pattern for better distribution
		// Use a pseudo-random function based on index to create deterministic but well-distributed results
		const seed = (index * 17 + 23) % 100; // 0-99
		let cumulative = 0;
		for (const item of statusDistribution) {
			cumulative += item.weight * 100;
			if (seed < cumulative) {
				return item.status;
			}
		}
		return 'PENDING_EXAMINATION'; // fallback
	};

	// Create records from appointments with mixed statuses
	const appointmentRecords: MedicalRecord[] = mockAppointments.map(
		(apt, index) => {
			const status = getStatusForIndex(index);
			const createdAt = new Date(
				`${apt.appointmentDate}T${apt.appointmentTime}`,
			);
			const updatedAt = new Date(createdAt);

			// Adjust timestamps based on status to make it realistic
			if (status === 'PENDING_CHECKIN') {
				// Recent appointments
				updatedAt.setTime(createdAt.getTime());
			} else if (status === 'PENDING_EXAMINATION') {
				// Checked in, waiting for doctor
				updatedAt.setTime(createdAt.getTime() + 15 * 60000); // 15 minutes later
			} else if (status === 'IN_EXAMINATION') {
				// Currently being examined
				updatedAt.setTime(createdAt.getTime() + 30 * 60000); // 30 minutes later
			} else if (status === 'COMPLETED_EXAMINATION') {
				// Completed
				updatedAt.setTime(createdAt.getTime() + 120 * 60000); // 2 hours later
			}

			const baseRecord: MedicalRecord = {
				id: `apt_${apt.id}`,
				receiveCode: apt.code.replace('LH', 'RC'),
				patient: {
					id: `p_apt_${index}`,
					fullName: apt.patientName,
					phoneNumber: apt.phoneNumber,
					dateOfBirth: apt.dateOfBirth,
					gender: apt.gender,
				},
				reason: apt.reason,
				requestedServices: [],
				status,
				assignedDoctor: {
					id: apt.doctorId,
					name: apt.doctor,
					specialty:
						mockDoctors.find((d) => d.id === apt.doctorId)?.specialty ||
						'Tổng quát',
				},
				createdAt: createdAt.toISOString(),
				updatedAt: updatedAt.toISOString(),
				paymentStatus:
					status === 'COMPLETED_EXAMINATION'
						? 'completed'
						: status === 'IN_EXAMINATION'
						? 'partial'
						: 'pending',
				totalAmount: Math.floor(((index * 37 + 41) % 500000) + 200000), // Deterministic random
				paidAmount: 0,
				appointmentId: apt.id,
				appointmentTime: `${apt.appointmentDate} ${apt.appointmentTime}`,
			};

			// Add diagnosis for completed or in-progress records
			if (status === 'IN_EXAMINATION' || status === 'COMPLETED_EXAMINATION') {
				if (status === 'COMPLETED_EXAMINATION') {
					baseRecord.diagnosis = 'Chẩn đoán hoàn tất, đã kê đơn thuốc';
					baseRecord.paidAmount = baseRecord.totalAmount || 0;
				} else if (status === 'IN_EXAMINATION') {
					baseRecord.diagnosis = 'Đang chẩn đoán...';
					baseRecord.paidAmount = Math.floor(
						(baseRecord.totalAmount || 0) * 0.3,
					);
				}
			}

			return baseRecord;
		},
	);

	const records: MedicalRecord[] = [
		{
			id: '1',
			receiveCode: 'RC20251105001',
			patient: {
				id: 'p1',
				fullName: 'Nguyễn Văn Anh',
				phoneNumber: '0901234567',
				dateOfBirth: '1990-05-15',
				gender: 'male',
			},
			reason: 'Đau đầu, chóng mặt',
			requestedServices: [],
			status: 'PENDING_EXAMINATION',
			assignedDoctor: mockDoctors[0],
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
			paymentStatus: 'pending',
			totalAmount: 500000,
			paidAmount: 0,
		},
		{
			id: '2',
			receiveCode: 'RC20251105002',
			patient: {
				id: 'p2',
				fullName: 'Trần Thị Bích',
				phoneNumber: '0912345678',
				dateOfBirth: '1985-08-20',
				gender: 'female',
			},
			reason: 'Khám sức khỏe định kỳ',
			requestedServices: [],
			status: 'IN_EXAMINATION',
			assignedDoctor: mockDoctors[1],
			createdAt: new Date(Date.now() - 3600000).toISOString(),
			updatedAt: new Date(Date.now() - 1800000).toISOString(),
			paymentStatus: 'partial',
			totalAmount: 800000,
			paidAmount: 400000,
			diagnosis: 'Sức khỏe tốt, cần theo dõi huyết áp',
		},
		{
			id: '3',
			receiveCode: 'RC20251105003',
			patient: {
				id: 'p3',
				fullName: 'Lê Hoàng Cường',
				phoneNumber: '0923456789',
				dateOfBirth: '1995-12-10',
				gender: 'male',
			},
			reason: 'Đau bụng, khó tiêu',
			requestedServices: [],
			status: 'IN_EXAMINATION',
			assignedDoctor: mockDoctors[0],
			createdAt: new Date(Date.now() - 7200000).toISOString(),
			updatedAt: new Date(Date.now() - 3600000).toISOString(),
			paymentStatus: 'partial',
			totalAmount: 600000,
			paidAmount: 180000,
			diagnosis: 'Nghi ngờ viêm dạ dày, cần siêu âm bụng',
		},
		{
			id: '4',
			receiveCode: 'RC20251104010',
			patient: {
				id: 'p4',
				fullName: 'Phạm Thị Dung',
				phoneNumber: '0934567890',
				dateOfBirth: '1988-03-25',
				gender: 'female',
			},
			reason: 'Ho, sốt nhẹ',
			requestedServices: [],
			status: 'COMPLETED_EXAMINATION',
			assignedDoctor: mockDoctors[2],
			createdAt: new Date(Date.now() - 86400000).toISOString(),
			updatedAt: new Date(Date.now() - 7200000).toISOString(),
			paymentStatus: 'completed',
			totalAmount: 450000,
			paidAmount: 450000,
			diagnosis: 'Viêm họng cấp, đã kê đơn thuốc',
		},
		{
			id: '5',
			receiveCode: 'RC20251104008',
			patient: {
				id: 'p5',
				fullName: 'Hoàng Văn Em',
				phoneNumber: '0945678901',
				dateOfBirth: '2015-07-15',
				gender: 'male',
			},
			reason: 'Tiêm chủng',
			requestedServices: [],
			status: 'COMPLETED_EXAMINATION',
			assignedDoctor: mockDoctors[3],
			createdAt: new Date(Date.now() - 86400000).toISOString(),
			updatedAt: new Date(Date.now() - 3600000).toISOString(),
			paymentStatus: 'completed',
			totalAmount: 200000,
			paidAmount: 200000,
			diagnosis: 'Tiêm vắc xin viêm gan B',
		},
	];

	// Combine appointment records (PENDING_CHECKIN) with regular records
	return [...appointmentRecords, ...records];
};

// Generate mock test orders
export const generateMockTestOrders = (): TestOrder[] => {
	return [
		{
			id: 't1',
			recordId: '1',
			receiveCode: 'RC20251105001',
			patientName: 'Nguyễn Văn Anh',
			testType: 'blood',
			testName: 'Xét nghiệm máu tổng quát',
			orderedBy: 'BS. Nguyễn Văn An',
			orderedAt: new Date().toISOString(),
			status: 'pending',
		},
		{
			id: 't2',
			recordId: '3',
			receiveCode: 'RC20251105003',
			patientName: 'Lê Hoàng Cường',
			testType: 'ultrasound',
			testName: 'Siêu âm bụng',
			orderedBy: 'BS. Nguyễn Văn An',
			orderedAt: new Date(Date.now() - 3600000).toISOString(),
			status: 'in_progress',
		},
		{
			id: 't3',
			recordId: '2',
			receiveCode: 'RC20251105002',
			patientName: 'Trần Thị Bích',
			testType: 'blood',
			testName: 'Xét nghiệm sinh hóa máu',
			orderedBy: 'BS. Trần Thị Bình',
			orderedAt: new Date(Date.now() - 7200000).toISOString(),
			status: 'completed',
			results: {
				values: {
					Glucose: '5.2 mmol/L',
					Cholesterol: '4.8 mmol/L',
					Triglyceride: '1.2 mmol/L',
				},
				notes: 'Kết quả bình thường',
			},
			completedAt: new Date(Date.now() - 1800000).toISOString(),
			completedBy: 'KTV. Nguyễn Thị Hoa',
		},
	];
};

// Mock medications database
const commonMedications: Array<{
	name: string;
	dosage: string;
	frequency: string[];
	duration: string[];
	unit: string;
	instructions?: string;
}> = [
	// Kháng sinh
	{
		name: 'Amoxicillin',
		dosage: '500mg',
		frequency: ['3 lần/ngày', '2 lần/ngày'],
		duration: ['7 ngày', '10 ngày'],
		unit: 'viên',
		instructions: 'Uống sau ăn',
	},
	{
		name: 'Azithromycin',
		dosage: '500mg',
		frequency: ['1 lần/ngày'],
		duration: ['3 ngày', '5 ngày'],
		unit: 'viên',
		instructions: 'Uống trước ăn 1 giờ',
	},
	{
		name: 'Cefuroxime',
		dosage: '250mg',
		frequency: ['2 lần/ngày'],
		duration: ['7 ngày'],
		unit: 'viên',
		instructions: 'Uống sau ăn',
	},
	{
		name: 'Ciprofloxacin',
		dosage: '500mg',
		frequency: ['2 lần/ngày'],
		duration: ['7 ngày', '10 ngày'],
		unit: 'viên',
		instructions: 'Uống nhiều nước',
	},

	// Giảm đau, hạ sốt
	{
		name: 'Paracetamol',
		dosage: '500mg',
		frequency: ['3-4 lần/ngày', 'Khi sốt/đau'],
		duration: ['3 ngày', '5 ngày'],
		unit: 'viên',
		instructions: 'Cách nhau ít nhất 4-6 giờ',
	},
	{
		name: 'Ibuprofen',
		dosage: '400mg',
		frequency: ['3 lần/ngày'],
		duration: ['3 ngày', '5 ngày'],
		unit: 'viên',
		instructions: 'Uống sau ăn',
	},

	// Chống viêm
	{
		name: 'Diclofenac',
		dosage: '50mg',
		frequency: ['2-3 lần/ngày'],
		duration: ['5 ngày', '7 ngày'],
		unit: 'viên',
		instructions: 'Uống sau ăn',
	},
	{
		name: 'Prednisolone',
		dosage: '5mg',
		frequency: ['1-2 lần/ngày'],
		duration: ['5 ngày', '7 ngày'],
		unit: 'viên',
		instructions: 'Uống sau ăn sáng',
	},

	// Dạ dày
	{
		name: 'Omeprazole',
		dosage: '20mg',
		frequency: ['1 lần/ngày'],
		duration: ['7 ngày', '14 ngày'],
		unit: 'viên',
		instructions: 'Uống trước ăn sáng 30 phút',
	},
	{
		name: 'Ranitidine',
		dosage: '150mg',
		frequency: ['2 lần/ngày'],
		duration: ['7 ngày', '14 ngày'],
		unit: 'viên',
		instructions: 'Uống trước ăn',
	},

	// Ho
	{
		name: 'Codein',
		dosage: '15mg',
		frequency: ['3 lần/ngày'],
		duration: ['5 ngày'],
		unit: 'viên',
		instructions: 'Uống sau ăn',
	},
	{
		name: 'Dextromethorphan',
		dosage: '15mg',
		frequency: ['3 lần/ngày'],
		duration: ['5 ngày'],
		unit: 'viên',
		instructions: 'Uống sau ăn',
	},

	// Cảm cúm
	{
		name: 'Chlorpheniramine',
		dosage: '4mg',
		frequency: ['3 lần/ngày'],
		duration: ['5 ngày'],
		unit: 'viên',
		instructions: 'Có thể gây buồn ngủ',
	},
	{
		name: 'Pseudoephedrine',
		dosage: '60mg',
		frequency: ['3 lần/ngày'],
		duration: ['5 ngày'],
		unit: 'viên',
		instructions: 'Uống sau ăn',
	},

	// Vitamin
	{
		name: 'Vitamin C',
		dosage: '1000mg',
		frequency: ['1 lần/ngày'],
		duration: ['7 ngày', '10 ngày'],
		unit: 'viên',
		instructions: 'Uống sau ăn',
	},
	{
		name: 'Vitamin D3',
		dosage: '2000 IU',
		frequency: ['1 lần/ngày'],
		duration: ['30 ngày'],
		unit: 'viên',
		instructions: 'Uống sau ăn sáng',
	},
	{
		name: 'Vitamin B Complex',
		dosage: '1 viên',
		frequency: ['1 lần/ngày'],
		duration: ['30 ngày'],
		unit: 'viên',
		instructions: 'Uống sau ăn',
	},

	// Tim mạch
	{
		name: 'Amlodipine',
		dosage: '5mg',
		frequency: ['1 lần/ngày'],
		duration: ['30 ngày'],
		unit: 'viên',
		instructions: 'Uống vào buổi sáng',
	},
	{
		name: 'Atenolol',
		dosage: '50mg',
		frequency: ['1 lần/ngày'],
		duration: ['30 ngày'],
		unit: 'viên',
		instructions: 'Uống vào buổi sáng',
	},

	// Da liễu
	{
		name: 'Hydrocortisone cream',
		dosage: '1%',
		frequency: ['2 lần/ngày'],
		duration: ['7 ngày'],
		unit: 'tuýp',
		instructions: 'Bôi mỏng lên vùng da bị tổn thương',
	},
	{
		name: 'Clotrimazole cream',
		dosage: '1%',
		frequency: ['2 lần/ngày'],
		duration: ['7 ngày', '14 ngày'],
		unit: 'tuýp',
		instructions: 'Bôi sạch vùng da',
	},

	// Mắt
	{
		name: 'Chloramphenicol eye drops',
		dosage: '0.5%',
		frequency: ['3-4 lần/ngày'],
		duration: ['7 ngày'],
		unit: 'chai',
		instructions: 'Nhỏ mắt, mỗi lần 1-2 giọt',
	},
	{
		name: 'Tobramycin eye drops',
		dosage: '0.3%',
		frequency: ['3-4 lần/ngày'],
		duration: ['7 ngày'],
		unit: 'chai',
		instructions: 'Nhỏ mắt, mỗi lần 1-2 giọt',
	},
];

// Helper functions for deterministic random
const seededRandom = (seed: number): number => {
	const x = Math.sin(seed) * 10000;
	return x - Math.floor(x);
};

const randomElement = <T>(array: T[], seed: number): T => {
	const index = Math.floor(seededRandom(seed) * array.length);
	return array[index];
};

const randomInt = (min: number, max: number, seed: number): number => {
	return Math.floor(seededRandom(seed) * (max - min + 1)) + min;
};

// Generate mock treatment plans for records
export const generateMockTreatmentPlans = (
	records: MedicalRecord[],
): TreatmentPlan[] => {
	const treatmentPlans: TreatmentPlan[] = [];

	// Only create treatment plans for records that have been examined
	const examinedRecords = records.filter(
		(r) =>
			r.status === 'COMPLETED_EXAMINATION' ||
			(r.diagnosis && r.diagnosis !== 'Đang chẩn đoán...'),
	);

	examinedRecords.forEach((record, index) => {
		// Use record ID as seed for deterministic results
		const seedBase = parseInt(record.id.replace(/\D/g, '')) || index;

		// Determine number of medications (1-4 medications)
		const numMedications = randomInt(1, 4, seedBase);
		const medications: Medication[] = [];

		// Select random medications
		const selectedMedNames = new Set<string>();
		for (let i = 0; i < numMedications; i++) {
			let med;
			let attempts = 0;
			const seed = seedBase * 17 + i * 23;
			do {
				med = randomElement(commonMedications, seed + attempts);
				attempts++;
			} while (selectedMedNames.has(med.name) && attempts < 20);

			if (med && !selectedMedNames.has(med.name)) {
				selectedMedNames.add(med.name);
				const frequency = randomElement(med.frequency, seed + 100);
				const duration = randomElement(med.duration, seed + 200);
				const quantity = randomInt(10, 30, seed + 300);

				medications.push({
					id: `med_${record.id}_${i}`,
					name: med.name,
					dosage: med.dosage,
					frequency,
					duration,
					quantity,
					unit: med.unit,
					instructions: med.instructions,
				});
			}
		}

		// Generate instructions based on diagnosis/reason
		let instructions = '';
		if (record.reason.includes('ho') || record.reason.includes('cảm')) {
			instructions =
				'Nghỉ ngơi đầy đủ, uống nhiều nước, tránh lạnh. Nếu sốt cao hoặc ho kéo dài, tái khám ngay.';
		} else if (
			record.reason.includes('đau') ||
			record.reason.includes('viêm')
		) {
			instructions =
				'Uống thuốc đúng liều, đúng giờ. Nếu đau tăng hoặc có dấu hiệu bất thường, tái khám ngay.';
		} else if (
			record.reason.includes('dạ dày') ||
			record.reason.includes('tiêu hóa')
		) {
			instructions =
				'Uống thuốc trước ăn, tránh thức ăn cay nóng, rượu bia. Ăn uống điều độ, đúng giờ.';
		} else {
			instructions =
				'Uống thuốc đúng liều, đúng giờ theo chỉ định. Nếu có phản ứng bất thường, ngừng thuốc và tái khám.';
		}

		// Generate follow-up date (7-14 days from now)
		const followUpDays = randomInt(7, 14, seedBase + 400);
		const followUpDate = new Date();
		followUpDate.setDate(followUpDate.getDate() + followUpDays);

		const followUpInstructions =
			'Tái khám để đánh giá kết quả điều trị và điều chỉnh phác đồ nếu cần.';

		// Generate notes
		const notes = `Phác đồ điều trị cho ${record.patient.fullName}. Theo dõi diễn biến và tái khám đúng hẹn.`;

		// Generate reminders based on diagnosis/reason
		const reminders: TreatmentReminder[] = [];

		// Add temperature reminder for fever/cold cases
		if (
			record.reason.includes('ho') ||
			record.reason.includes('cảm') ||
			record.reason.includes('sốt')
		) {
			reminders.push({
				id: `reminder_${record.id}_temp`,
				type: 'vital_sign',
				title: 'Cập nhật nhiệt độ',
				description:
					'Vui lòng đo và cập nhật nhiệt độ cơ thể 2 lần/ngày (sáng và chiều)',
				field: 'temperature',
				frequency: 'daily',
				enabled: true,
				priority: 'high',
			});
		}

		// Add blood pressure reminder for cardiovascular cases
		if (
			record.reason.includes('huyết áp') ||
			record.reason.includes('tim') ||
			record.diagnosis?.includes('huyết áp')
		) {
			reminders.push({
				id: `reminder_${record.id}_bp`,
				type: 'vital_sign',
				title: 'Cập nhật huyết áp',
				description: 'Vui lòng đo và cập nhật huyết áp mỗi ngày vào buổi sáng',
				field: 'bloodPressure',
				frequency: 'daily',
				enabled: true,
				priority: 'high',
			});
		}

		// Add blood sugar reminder for diabetes cases
		if (
			record.reason.includes('tiểu đường') ||
			record.reason.includes('đường huyết') ||
			record.diagnosis?.includes('tiểu đường')
		) {
			reminders.push({
				id: `reminder_${record.id}_bs`,
				type: 'vital_sign',
				title: 'Cập nhật đường huyết',
				description: 'Vui lòng đo đường huyết trước và sau ăn theo hướng dẫn',
				field: 'bloodSugar',
				frequency: 'daily',
				enabled: true,
				priority: 'high',
			});
		}

		// Add diet reminder for digestive cases
		if (
			record.reason.includes('dạ dày') ||
			record.reason.includes('tiêu hóa') ||
			record.diagnosis?.includes('dạ dày')
		) {
			reminders.push({
				id: `reminder_${record.id}_diet`,
				type: 'diet',
				title: 'Ghi nhận khẩu phần ăn',
				description:
					'Vui lòng ghi lại các bữa ăn trong ngày để bác sĩ theo dõi',
				frequency: 'daily',
				enabled: true,
				priority: 'medium',
			});
		}

		// Add weight reminder for general health monitoring
		if (
			record.reason.includes('tổng quát') ||
			record.reason.includes('sức khỏe')
		) {
			reminders.push({
				id: `reminder_${record.id}_weight`,
				type: 'vital_sign',
				title: 'Cập nhật cân nặng',
				description: 'Vui lòng cân và cập nhật cân nặng mỗi tuần vào buổi sáng',
				field: 'weight',
				frequency: 'weekly',
				enabled: true,
				priority: 'low',
			});
		}

		// Add general activity reminder
		if (record.status === 'COMPLETED_EXAMINATION' && reminders.length === 0) {
			reminders.push({
				id: `reminder_${record.id}_activity`,
				type: 'activity',
				title: 'Ghi nhận hoạt động hàng ngày',
				description:
					'Vui lòng ghi lại các hoạt động và cảm nhận về tình hình sức khỏe',
				frequency: 'daily',
				enabled: true,
				priority: 'medium',
			});
		}

		const treatmentPlan: TreatmentPlan = {
			id: `tp_${record.id}`,
			recordId: record.id,
			createdAt: record.updatedAt || record.createdAt,
			createdBy: record.assignedDoctor?.name || 'Bác sĩ',
			medications,
			instructions,
			followUpDate: followUpDate.toISOString(),
			followUpInstructions,
			notes,
			status:
				record.status === 'COMPLETED_EXAMINATION' ? 'completed' : 'active',
			updatedAt: record.updatedAt || record.createdAt,
			reminders: reminders.length > 0 ? reminders : undefined,
		};

		treatmentPlans.push(treatmentPlan);
	});

	return treatmentPlans;
};

// Generate mock treatment plans for a specific patient
export const generateMockTreatmentPlansForPatient = (
	patientName: string,
	records: MedicalRecord[],
): TreatmentPlan[] => {
	const treatmentPlans: TreatmentPlan[] = [];

	// Filter records for this patient
	let patientRecords = records.filter(
		(r) => r.patient.fullName === patientName,
	);

	// If no records exist for this patient, create a mock record
	if (patientRecords.length === 0) {
		const mockRecord: MedicalRecord = {
			id: `patient_record_${Date.now()}`,
			receiveCode: `RC${Date.now()}`,
			patient: {
				id: `patient_${Date.now()}`,
				fullName: patientName,
				phoneNumber: '0900000000',
				dateOfBirth: '1990-01-01',
				gender: 'male',
			},
			reason: 'Khám tổng quát',
			requestedServices: [],
			status: 'COMPLETED_EXAMINATION',
			assignedDoctor: {
				id: 'doc1',
				name: 'BS. Nguyễn Văn An',
				specialty: 'Nội khoa',
			},
			diagnosis: 'Khám sức khỏe tổng quát, cần theo dõi và điều trị',
			createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
			updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
			paymentStatus: 'completed',
			totalAmount: 300000,
			paidAmount: 300000,
		};
		patientRecords = [mockRecord];
	}

	// Create 1-3 treatment plans for the patient
	const numPlans = Math.min(
		patientRecords.length,
		Math.floor(Math.random() * 3) + 1,
	);

	for (let i = 0; i < numPlans; i++) {
		const record = patientRecords[i] || patientRecords[0];
		if (!record) continue;

		const seedBase = i * 1000;
		const numMedications = randomInt(2, 4, seedBase);
		const medications: Medication[] = [];

		const selectedMedNames = new Set<string>();
		for (let j = 0; j < numMedications; j++) {
			let med;
			let attempts = 0;
			const seed = seedBase * 17 + j * 23;
			do {
				med = randomElement(commonMedications, seed + attempts);
				attempts++;
			} while (selectedMedNames.has(med.name) && attempts < 20);

			if (med && !selectedMedNames.has(med.name)) {
				selectedMedNames.add(med.name);
				const frequency = randomElement(med.frequency, seed + 100);
				const duration = randomElement(med.duration, seed + 200);
				const quantity = randomInt(10, 30, seed + 300);

				medications.push({
					id: `med_patient_${i}_${j}`,
					name: med.name,
					dosage: med.dosage,
					frequency,
					duration,
					quantity,
					unit: med.unit,
					instructions: med.instructions,
				});
			}
		}

		// Generate instructions
		const instructions =
			'Uống thuốc đúng liều, đúng giờ theo chỉ định. Nếu có phản ứng bất thường, ngừng thuốc và tái khám ngay.';

		// Generate follow-up date (7-14 days from now)
		const followUpDays = randomInt(7, 14, seedBase + 400);
		const followUpDate = new Date();
		followUpDate.setDate(followUpDate.getDate() + followUpDays);

		const followUpInstructions =
			'Tái khám để đánh giá kết quả điều trị và điều chỉnh phác đồ nếu cần.';

		// Generate reminders for patient treatment plans
		const reminders: TreatmentReminder[] = [];

		// Always add temperature reminder for patient
		reminders.push({
			id: `reminder_patient_${i}_temp`,
			type: 'vital_sign',
			title: 'Cập nhật nhiệt độ',
			description: 'Vui lòng đo và cập nhật nhiệt độ cơ thể mỗi ngày',
			field: 'temperature',
			frequency: 'daily',
			enabled: true,
			priority: 'high',
		});

		// Add blood pressure reminder
		reminders.push({
			id: `reminder_patient_${i}_bp`,
			type: 'vital_sign',
			title: 'Cập nhật huyết áp',
			description: 'Vui lòng đo và cập nhật huyết áp mỗi ngày vào buổi sáng',
			field: 'bloodPressure',
			frequency: 'daily',
			enabled: true,
			priority: 'medium',
		});

		// Add diet reminder
		reminders.push({
			id: `reminder_patient_${i}_diet`,
			type: 'diet',
			title: 'Ghi nhận khẩu phần ăn',
			description: 'Vui lòng ghi lại các bữa ăn trong ngày (sáng, trưa, tối)',
			frequency: 'daily',
			enabled: true,
			priority: 'medium',
		});

		// Add weight reminder (weekly)
		reminders.push({
			id: `reminder_patient_${i}_weight`,
			type: 'vital_sign',
			title: 'Cập nhật cân nặng',
			description: 'Vui lòng cân và cập nhật cân nặng mỗi tuần vào buổi sáng',
			field: 'weight',
			frequency: 'weekly',
			enabled: true,
			priority: 'low',
		});

		const treatmentPlan: TreatmentPlan = {
			id: `tp_patient_${Date.now()}_${i}`,
			recordId: record.id,
			createdAt: new Date(
				Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000,
			).toISOString(),
			createdBy:
				record.assignedDoctor?.name ||
				mockDoctors[Math.floor(Math.random() * mockDoctors.length)].name,
			medications,
			instructions,
			followUpDate: followUpDate.toISOString(),
			followUpInstructions,
			notes: `Phác đồ điều trị cho ${patientName}. Theo dõi diễn biến và tái khám đúng hẹn.`,
			status: i === 0 ? 'active' : Math.random() > 0.5 ? 'completed' : 'active',
			updatedAt: new Date().toISOString(),
			reminders: reminders.length > 0 ? reminders : undefined,
		};

		treatmentPlans.push(treatmentPlan);
	}

	return treatmentPlans;
};

// Mock ai stats
export const generateDashboardStats = (
	records: MedicalRecord[],
): DashboardStats => {
	const today = new Date().toDateString();

	return {
		totalRecords: records.length,
		pendingCheckin: records.filter((r) => r.status === 'PENDING_CHECKIN')
			.length,
		pendingExamination: records.filter(
			(r) => r.status === 'PENDING_EXAMINATION',
		).length,
		inProgress: records.filter((r) => r.status === 'IN_EXAMINATION').length,
		completed: records.filter((r) => r.status === 'COMPLETED_EXAMINATION')
			.length,
		returned: 0,
		todayRecords: records.filter(
			(r) => new Date(r.createdAt).toDateString() === today,
		).length,
	};
};

// Generate mock notifications
export const generateMockNotifications = (
	patientName?: string,
): Notification[] => {
	const notifications: Notification[] = [];
	const now = new Date();

	// Sample notifications
	const sampleNotifications = [
		{
			title: 'Lịch hẹn đã được xác nhận',
			message:
				'Lịch hẹn của bạn vào ngày mai đã được xác nhận. Vui lòng đến đúng giờ.',
			type: 'success' as const,
			relatedType: 'appointment' as const,
		},
		{
			title: 'Nhắc nhở uống thuốc',
			message:
				'Đã đến giờ uống thuốc theo phác đồ điều trị. Vui lòng uống đúng liều lượng.',
			type: 'info' as const,
			relatedType: 'treatment' as const,
		},
		{
			title: 'Kết quả xét nghiệm đã có',
			message:
				'Kết quả xét nghiệm của bạn đã sẵn sàng. Vui lòng xem trong khách hàng y tế.',
			type: 'info' as const,
			relatedType: 'record' as const,
		},
		{
			title: 'Lịch hẹn sắp đến',
			message:
				'Bạn có lịch hẹn vào ngày mai. Vui lòng chuẩn bị và đến đúng giờ.',
			type: 'warning' as const,
			relatedType: 'appointment' as const,
		},
	];

	// Generate 5-10 notifications
	const count = Math.floor(Math.random() * 6) + 5;
	for (let i = 0; i < count; i++) {
		const sample =
			sampleNotifications[
				Math.floor(Math.random() * sampleNotifications.length)
			];
		const daysAgo = Math.floor(Math.random() * 7); // 0-6 days ago
		const createdAt = new Date(now);
		createdAt.setDate(createdAt.getDate() - daysAgo);
		createdAt.setHours(Math.floor(Math.random() * 24));
		createdAt.setMinutes(Math.floor(Math.random() * 60));

		notifications.push({
			id: `notif_${Date.now()}_${i}`,
			title: sample.title,
			message: sample.message,
			type: sample.type,
			read: Math.random() > 0.3, // 70% read
			createdAt: createdAt.toISOString(),
			relatedType: sample.relatedType,
		});
	}

	return notifications.sort(
		(a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
	);
};

// Convert mockAppointments to Appointment type
export const generateMockAppointments = (): Appointment[] => {
	return mockAppointments.map((apt) => ({
		id: apt.id,
		code: apt.code,
		patientName: apt.patientName,
		phoneNumber: apt.phoneNumber,
		dateOfBirth: apt.dateOfBirth,
		gender: apt.gender as 'male' | 'female' | 'other',
		email: apt.email,
		address: apt.address,
		customerId: apt.customerId,
		insurance: apt.insurance,
		appointmentDate: apt.appointmentDate,
		appointmentTime: apt.appointmentTime,
		services: Array.isArray(apt.services)
			? apt.services
			: [apt.services as string],
		doctor: apt.doctor,
		doctorId: apt.doctorId,
		reason: apt.reason,
		status: apt.status as 'pending' | 'confirmed' | 'cancelled' | 'completed',
		createdAt: new Date(
			`${apt.appointmentDate}T${apt.appointmentTime}`,
		).toISOString(),
		updatedAt: new Date(
			`${apt.appointmentDate}T${apt.appointmentTime}`,
		).toISOString(),
	}));
};

// Generate mock appointments for a specific patient
export const generateMockAppointmentsForPatient = (
	patientName: string,
	patientEmail?: string,
): Appointment[] => {
	const appointments: Appointment[] = [];
	const today = new Date();

	// Generate 5-8 appointments for the patient
	const appointmentCount = Math.floor(Math.random() * 4) + 5; // 5-8 appointments

	const statuses: Array<'pending' | 'confirmed' | 'cancelled' | 'completed'> = [
		'pending',
		'confirmed',
		'cancelled',
		'completed',
	];
	const reasons = [
		'Kiểm tra sức khỏe định kỳ',
		'Đau đầu, mệt mỏi',
		'Khám tổng quát',
		'Tái khám',
		'Đau bụng',
		'Sốt, ho',
		'Khám chuyên khoa',
		'Xét nghiệm',
	];

	const servicesList = [
		['Khám nội tổng quát'],
		['Khám tai mũi họng'],
		['Khám ngoại khoa'],
		['Siêu âm bụng'],
		['Xét nghiệm máu'],
		['Khám nội tổng quát', 'Xét nghiệm máu'],
		['Khám tim mạch'],
		['Khám da liễu'],
	];

	for (let i = 0; i < appointmentCount; i++) {
		// Generate dates: some in the past, some in the future
		const daysOffset = Math.floor(Math.random() * 60) - 20; // -20 to +40 days
		const appointmentDate = new Date(today);
		appointmentDate.setDate(today.getDate() + daysOffset);

		// Only future appointments can be pending or confirmed
		const isFuture = daysOffset >= 0;
		const status = isFuture
			? Math.random() > 0.3
				? 'pending'
				: 'confirmed'
			: Math.random() > 0.5
			? 'completed'
			: 'cancelled';

		const timeSlots = [
			'08:00',
			'08:30',
			'09:00',
			'09:30',
			'10:00',
			'10:30',
			'11:00',
			'11:30',
			'14:00',
			'14:30',
			'15:00',
			'15:30',
			'16:00',
			'16:30',
		];
		const appointmentTime =
			timeSlots[Math.floor(Math.random() * timeSlots.length)];

		const dateStr = appointmentDate
			.toISOString()
			.split('T')[0]
			.replace(/-/g, '');
		const code = `LH${dateStr}${String(i + 1).padStart(3, '0')}`;

		const doctor = mockDoctors[Math.floor(Math.random() * mockDoctors.length)];
		const services =
			servicesList[Math.floor(Math.random() * servicesList.length)];
		const reason = reasons[Math.floor(Math.random() * reasons.length)];

		appointments.push({
			id: `apt_patient_${Date.now()}_${i}`,
			code,
			patientName,
			phoneNumber: patientEmail || '0900000000',
			dateOfBirth: '1990-01-01',
			gender: 'male' as const,
			email: patientEmail,
			address: '',
			customerId: `KH${String(i + 1).padStart(3, '0')}`,
			insurance: '',
			appointmentDate: appointmentDate.toISOString().split('T')[0],
			appointmentTime,
			services,
			doctor: doctor.name,
			doctorId: doctor.id,
			reason,
			status,
			createdAt: new Date(
				appointmentDate.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000,
			).toISOString(),
			updatedAt: new Date(
				appointmentDate.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000,
			).toISOString(),
		});
	}

	// Sort by date (newest first)
	return appointments.sort((a, b) => {
		const dateA = new Date(`${a.appointmentDate}T${a.appointmentTime}`);
		const dateB = new Date(`${b.appointmentDate}T${b.appointmentTime}`);
		return dateB.getTime() - dateA.getTime();
	});
};

// Mock data cho các danh mục
export const mockDepartmentsData: Department[] = [
	{
		id: 'dept1',
		name: 'Khoa Nội',
		code: 'INT',
		description: 'Khoa Nội tổng quát',
		isActive: true,
		createdAt: new Date('2023-01-01').toISOString(),
		updatedAt: new Date('2024-01-01').toISOString(),
	},
	{
		id: 'dept2',
		name: 'Khoa Ngoại',
		code: 'SUR',
		description: 'Khoa Ngoại tổng quát',
		isActive: true,
		createdAt: new Date('2023-01-01').toISOString(),
		updatedAt: new Date('2024-01-01').toISOString(),
	},
	{
		id: 'dept3',
		name: 'Khoa Tim mạch',
		code: 'CAR',
		description: 'Khoa Tim mạch',
		isActive: true,
		createdAt: new Date('2023-01-01').toISOString(),
		updatedAt: new Date('2024-01-01').toISOString(),
	},
	{
		id: 'dept4',
		name: 'Khoa Nhi',
		code: 'PED',
		description: 'Khoa Nhi',
		isActive: true,
		createdAt: new Date('2023-01-01').toISOString(),
		updatedAt: new Date('2024-01-01').toISOString(),
	},
	{
		id: 'dept5',
		name: 'Khoa Sản phụ khoa',
		code: 'OBG',
		description: 'Khoa Sản phụ khoa',
		isActive: true,
		createdAt: new Date('2023-01-01').toISOString(),
		updatedAt: new Date('2024-01-01').toISOString(),
	},
];

export const mockPositionsData: Position[] = [
	{
		id: 'pos1',
		name: 'Bác sĩ',
		code: 'DOC',
		description: 'Chức vụ bác sĩ',
		isActive: true,
		createdAt: new Date('2023-01-01').toISOString(),
		updatedAt: new Date('2024-01-01').toISOString(),
	},
	{
		id: 'pos2',
		name: 'Bác sĩ trưởng khoa',
		code: 'HOD',
		description: 'Bác sĩ trưởng khoa',
		isActive: true,
		createdAt: new Date('2023-01-01').toISOString(),
		updatedAt: new Date('2024-01-01').toISOString(),
	},
	{
		id: 'pos3',
		name: 'Điều dưỡng',
		code: 'NUR',
		description: 'Chức vụ điều dưỡng',
		isActive: true,
		createdAt: new Date('2023-01-01').toISOString(),
		updatedAt: new Date('2024-01-01').toISOString(),
	},
	{
		id: 'pos4',
		name: 'Điều dưỡng trưởng',
		code: 'CN',
		description: 'Điều dưỡng trưởng',
		isActive: true,
		createdAt: new Date('2023-01-01').toISOString(),
		updatedAt: new Date('2024-01-01').toISOString(),
	},
	{
		id: 'pos5',
		name: 'Lễ tân',
		code: 'REC',
		description: 'Chức vụ lễ tân',
		isActive: true,
		createdAt: new Date('2023-01-01').toISOString(),
		updatedAt: new Date('2024-01-01').toISOString(),
	},
];

export const mockSpecialtiesData: Specialty[] = [
	{
		id: 'spec1',
		name: 'Nội khoa',
		code: 'INT',
		description: 'Chuyên khoa Nội',
		isActive: true,
		createdAt: new Date('2023-01-01').toISOString(),
		updatedAt: new Date('2024-01-01').toISOString(),
	},
	{
		id: 'spec2',
		name: 'Ngoại khoa',
		code: 'SUR',
		description: 'Chuyên khoa Ngoại',
		isActive: true,
		createdAt: new Date('2023-01-01').toISOString(),
		updatedAt: new Date('2024-01-01').toISOString(),
	},
	{
		id: 'spec3',
		name: 'Tim mạch',
		code: 'CAR',
		description: 'Chuyên khoa Tim mạch',
		isActive: true,
		createdAt: new Date('2023-01-01').toISOString(),
		updatedAt: new Date('2024-01-01').toISOString(),
	},
	{
		id: 'spec4',
		name: 'Nhi khoa',
		code: 'PED',
		description: 'Chuyên khoa Nhi',
		isActive: true,
		createdAt: new Date('2023-01-01').toISOString(),
		updatedAt: new Date('2024-01-01').toISOString(),
	},
	{
		id: 'spec5',
		name: 'Sản phụ khoa',
		code: 'OBG',
		description: 'Chuyên khoa Sản phụ khoa',
		isActive: true,
		createdAt: new Date('2023-01-01').toISOString(),
		updatedAt: new Date('2024-01-01').toISOString(),
	},
	{
		id: 'spec6',
		name: 'Tai mũi họng',
		code: 'ENT',
		description: 'Chuyên khoa Tai mũi họng',
		isActive: true,
		createdAt: new Date('2023-01-01').toISOString(),
		updatedAt: new Date('2024-01-01').toISOString(),
	},
	{
		id: 'spec7',
		name: 'Mắt',
		code: 'EYE',
		description: 'Chuyên khoa Mắt',
		isActive: true,
		createdAt: new Date('2023-01-01').toISOString(),
		updatedAt: new Date('2024-01-01').toISOString(),
	},
	{
		id: 'spec8',
		name: 'Da liễu',
		code: 'DER',
		description: 'Chuyên khoa Da liễu',
		isActive: true,
		createdAt: new Date('2023-01-01').toISOString(),
		updatedAt: new Date('2024-01-01').toISOString(),
	},
];

interface Role {
	id: string;
	name: string;
	code: UserRole;
	description?: string;
	isActive: boolean;
	createdAt: string;
	updatedAt: string;
}

export const mockRolesData: Role[] = [
	{
		id: 'role1',
		name: 'Quản trị viên',
		code: 'admin',
		description: 'Vai trò quản trị hệ thống',
		isActive: true,
		createdAt: new Date('2023-01-01').toISOString(),
		updatedAt: new Date('2024-01-01').toISOString(),
	},
	{
		id: 'role2',
		name: 'Bác sĩ',
		code: 'doctor',
		description: 'Vai trò bác sĩ',
		isActive: true,
		createdAt: new Date('2023-01-01').toISOString(),
		updatedAt: new Date('2024-01-01').toISOString(),
	},
	{
		id: 'role3',
		name: 'Điều dưỡng',
		code: 'nurse',
		description: 'Vai trò điều dưỡng',
		isActive: true,
		createdAt: new Date('2023-01-01').toISOString(),
		updatedAt: new Date('2024-01-01').toISOString(),
	},
	{
		id: 'role4',
		name: 'Lễ tân',
		code: 'receptionist',
		description: 'Vai trò lễ tân',
		isActive: true,
		createdAt: new Date('2023-01-01').toISOString(),
		updatedAt: new Date('2024-01-01').toISOString(),
	},
	{
		id: 'role5',
		name: 'Khách hàng',
		code: 'patient',
		description: 'Vai trò Khách hàng',
		isActive: true,
		createdAt: new Date('2023-01-01').toISOString(),
		updatedAt: new Date('2024-01-01').toISOString(),
	},
];
