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

export interface DashboardStats {
  totalRecords: number;
  pendingCheckin: number;
  pendingExamination: number;
  inProgress: number;
  completed: number;
  returned: number;
  todayRecords: number;
}
