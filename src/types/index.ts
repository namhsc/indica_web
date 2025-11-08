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

export type UserRole = 'receptionist' | 'doctor' | 'nurse' | 'admin';

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
