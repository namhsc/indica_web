// Types for Medical Records Management System

export type RecordStatus = 
  | 'PENDING_CHECKIN'
  | 'PENDING_EXAMINATION'
  | 'IN_EXAMINATION'
  | 'WAITING_TESTS'
  | 'WAITING_DOCTOR_REVIEW'
  | 'COMPLETED_EXAMINATION'
  | 'RETURNED';

export type Gender = 'male' | 'female' | 'other';

export type TestType = 'blood' | 'urine' | 'xray' | 'ultrasound' | 'ct' | 'mri';

export type UserRole = 'receptionist' | 'doctor' | 'nurse' | 'admin' | 'patient';

export interface Patient {
  id: string;
  fullName: string;
  phoneNumber: string;
  dateOfBirth: string;
  gender: Gender;
  address?: string;
  email?: string;
  customerId?: string;
  cccdNumber?: string;
  insurance?: string;
}

export interface MedicalRecord {
	id: string;
	receiveCode: string;
	patient: Patient;
	reason: string;
	requestedServices: string[];
	status: RecordStatus;
	assignedDoctor?: {
		id: string;
		name: string;
		specialty: string;
	};
	createdAt: string;
	updatedAt: string;
	diagnosis?: string;
	treatmentPlanId?: string; // ID của phác đồ điều trị
	paymentStatus: 'pending' | 'partial' | 'completed';
	totalAmount?: number;
	paidAmount?: number;
	signature?: string;
	returnedAt?: string;
	appointmentId?: string;
	appointmentTime?: string;
}

export interface TestOrder {
	id: string;
	recordId: string;
	receiveCode: string;
	patientName: string;
	testType: TestType;
	testName: string;
	orderedBy: string;
	orderedAt: string;
	status: 'pending' | 'in_progress' | 'completed' | 'reviewed';
	results?: {
		values?: Record<string, string>;
		files?: string[];
		notes?: string;
	};
	completedAt?: string;
	completedBy?: string;
}

export interface Medication {
	id: string;
	name: string;
	dosage: string; // Liều lượng (vd: "500mg", "1 viên")
	frequency: string; // Tần suất (vd: "2 lần/ngày", "Sau ăn")
	duration: string; // Thời gian (vd: "7 ngày", "10 ngày")
	quantity: number; // Số lượng
	unit: string; // Đơn vị (vd: "viên", "chai", "tuýp")
	instructions?: string; // Hướng dẫn thêm
}

export interface TreatmentReminderResponse {
	id: string;
	reminderId: string;
	date: string;
	status: 'completed' | 'pending' | 'skipped';
	response?: string; // Phản hồi của bệnh nhân
	value?: any; // Giá trị nếu là vital sign (ví dụ: nhiệt độ 37.5)
	createdAt: string;
}

export interface TreatmentReminder {
	id: string;
	type: 'vital_sign' | 'activity' | 'medication' | 'diet' | 'exercise' | 'other';
	title: string;
	description?: string;
	field?: string; // Field name for vital signs (e.g., 'temperature', 'bloodPressure', 'weight')
	frequency?: 'daily' | 'weekly' | 'custom'; // Tần suất nhắc nhở
	enabled: boolean;
	priority?: 'low' | 'medium' | 'high';
	responses?: TreatmentReminderResponse[]; // Phản hồi của bệnh nhân
}

export interface TreatmentPlan {
	id: string;
	recordId: string;
	createdAt: string;
	createdBy: string; // Bác sĩ tạo phác đồ
	medications: Medication[];
	instructions?: string; // Hướng dẫn điều trị chung
	followUpDate?: string; // Ngày tái khám
	followUpInstructions?: string; // Hướng dẫn tái khám
	notes?: string; // Ghi chú thêm
	status: 'active' | 'completed' | 'cancelled';
	updatedAt?: string;
	reminders?: TreatmentReminder[]; // Danh sách nhắc nhở cho bệnh nhân
}

export interface DashboardStats {
  totalRecords: number;
  pendingCheckin: number;
  pendingExamination: number;
  inProgress: number;
  completed: number;
  returned: number;
  todayRecords: number;
}

export interface Appointment {
  id: string;
  code: string;
  patientName: string;
  phoneNumber: string;
  dateOfBirth: string;
  gender: Gender;
  email?: string;
  address?: string;
  customerId?: string;
  insurance?: string;
  appointmentDate: string;
  appointmentTime: string;
  services: string[];
  doctor: string;
  doctorId: string;
  reason?: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  createdAt?: string;
  updatedAt?: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: string;
  relatedId?: string; // ID của appointment, treatment plan, etc.
  relatedType?: 'appointment' | 'treatment' | 'record';
}

export interface TreatmentProgress {
  id: string;
  treatmentPlanId: string;
  medicationId?: string; // Optional - có thể cập nhật chung cho cả phác đồ
  date: string;
  status?: 'taken' | 'missed' | 'skipped'; // Trạng thái uống thuốc
  notes?: string;
  patientFeedback?: string;
  doctorResponse?: string;
  createdAt: string;
  // Các chỉ số sức khỏe hàng ngày
  vitalSigns?: {
    bloodPressure?: {
      systolic: number; // Huyết áp tâm thu
      diastolic: number; // Huyết áp tâm trương
      time?: string; // Thời gian đo (sáng/trưa/chiều/tối)
    };
    bloodSugar?: {
      value: number; // Đường huyết (mg/dL hoặc mmol/L)
      type: 'fasting' | 'postprandial' | 'random'; // Đo lúc đói/sau ăn/ngẫu nhiên
      time?: string;
    };
    heartRate?: number; // Nhịp tim (bpm)
    weight?: number; // Cân nặng (kg)
    temperature?: number; // Nhiệt độ (°C)
    oxygenSaturation?: number; // SpO2 (%)
    painLevel?: number; // Mức độ đau (1-10)
  };
}

// Quản lý Dịch vụ
export interface Service {
  id: string;
  name: string;
  code?: string;
  description?: string;
  category: 'examination' | 'test' | 'imaging' | 'procedure' | 'other';
  price: number;
  unit?: string; // Đơn vị tính (lần, gói, v.v.)
  duration?: number; // Thời gian thực hiện (phút)
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Quản lý Gói dịch vụ
export interface ServicePackage {
  id: string;
  name: string;
  code?: string;
  description?: string;
  services: string[]; // Danh sách ID dịch vụ
  price: number; // Giá gói (có thể khác tổng giá các dịch vụ)
  discount?: number; // Phần trăm giảm giá
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Quản lý Nhân viên
export interface Staff {
  id: string;
  fullName: string;
  code?: string;
  email?: string;
  phoneNumber: string;
  dateOfBirth?: string;
  gender: Gender;
  role: UserRole;
  specialty?: string; // Chuyên khoa (cho bác sĩ)
  position?: string; // Chức vụ
  department?: string; // Phòng ban
  address?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}