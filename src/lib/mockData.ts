import { MedicalRecord, TestOrder, DashboardStats } from '../types';
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
  { id: 'doc23', name: 'BS. Phạm Văn Đông', specialty: 'Chấn thương chỉnh hình' },
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

// Mock services
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

// Generate mock medical records
export const generateMockRecords = (): MedicalRecord[] => {
  // First, create records from appointments with PENDING_CHECKIN status
  const appointmentRecords: MedicalRecord[] = mockAppointments.map((apt, index) => ({
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
    requestedServices: apt.services,
    status: 'PENDING_CHECKIN' as const,
    assignedDoctor: {
      id: apt.doctorId,
      name: apt.doctor,
      specialty: mockDoctors.find(d => d.id === apt.doctorId)?.specialty || 'Tổng quát',
    },
    createdAt: new Date(`${apt.appointmentDate}T${apt.appointmentTime}`).toISOString(),
    updatedAt: new Date(`${apt.appointmentDate}T${apt.appointmentTime}`).toISOString(),
    paymentStatus: 'pending',
    totalAmount: 0,
    paidAmount: 0,
    appointmentId: apt.id,
    appointmentTime: `${apt.appointmentDate} ${apt.appointmentTime}`,
  }));

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
      requestedServices: ['Khám tổng quát', 'Xét nghiệm máu'],
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
      requestedServices: ['Khám tổng quát', 'Xét nghiệm máu', 'Xét nghiệm nước tiểu'],
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
      requestedServices: ['Khám tổng quát', 'Siêu âm'],
      status: 'WAITING_TESTS',
      assignedDoctor: mockDoctors[0],
      createdAt: new Date(Date.now() - 7200000).toISOString(),
      updatedAt: new Date(Date.now() - 3600000).toISOString(),
      paymentStatus: 'partial',
      totalAmount: 600000,
      paidAmount: 300000,
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
      requestedServices: ['Khám tổng quát', 'Chụp X-quang'],
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
      requestedServices: ['Khám tổng quát'],
      status: 'RETURNED',
      assignedDoctor: mockDoctors[3],
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 3600000).toISOString(),
      paymentStatus: 'completed',
      totalAmount: 200000,
      paidAmount: 200000,
      diagnosis: 'Tiêm vắc xin viêm gan B',
      signature: 'data:image/png;base64,signature_data',
      returnedAt: new Date(Date.now() - 3600000).toISOString(),
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
          'Glucose': '5.2 mmol/L',
          'Cholesterol': '4.8 mmol/L',
          'Triglyceride': '1.2 mmol/L',
        },
        notes: 'Kết quả bình thường',
      },
      completedAt: new Date(Date.now() - 1800000).toISOString(),
      completedBy: 'KTV. Nguyễn Thị Hoa',
    },
  ];
};

// Mock ai stats
export const generateDashboardStats = (records: MedicalRecord[]): DashboardStats => {
  const today = new Date().toDateString();
  
  return {
    totalRecords: records.length,
    pendingCheckin: records.filter(r => r.status === 'PENDING_CHECKIN').length,
    pendingExamination: records.filter(r => r.status === 'PENDING_EXAMINATION').length,
    inProgress: records.filter(r => ['IN_EXAMINATION', 'WAITING_TESTS', 'WAITING_DOCTOR_REVIEW'].includes(r.status)).length,
    completed: records.filter(r => r.status === 'COMPLETED_EXAMINATION').length,
    returned: records.filter(r => r.status === 'RETURNED').length,
    todayRecords: records.filter(r => new Date(r.createdAt).toDateString() === today).length,
  };
};
