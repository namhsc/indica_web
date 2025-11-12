import React, { useState, useEffect } from 'react';
import { Toaster } from './components/ui/sonner';
import { AIAssistant } from './components/AIAssistant';
import { ReceptionForm } from './components/ReceptionForm';
import { RecordList } from './components/RecordList';
import { DoctorWorkspace } from './components/DoctorWorkspace';
import { ExaminationDetail } from './components/ExaminationDetail';
import { TechnicianWorkspace } from './components/TechnicianWorkspace';
import { PatientWorkspace } from './components/PatientWorkspace';
import { RecordDetail } from './components/RecordDetail';
import { LoginPage } from './components/LoginPage';
import { RoleGuard } from './components/RoleGuard';
import { AppSidebar } from './components/layout/AppSidebar';
import { StaffManagement } from './components/StaffManagement';
import { MedicationManagement } from './components/MedicationManagement';
import { SpecialtyManagement } from './components/SpecialtyManagement';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Button } from './components/ui/button';
import { Menu } from 'lucide-react';
import {
	MedicalRecord,
	TestOrder,
	TestType,
	TreatmentPlan,
	Appointment,
	Notification,
	Service,
	ServicePackage,
	Staff,
	MedicationCatalog,
	Specialty,
} from './types';
import {
	generateMockRecords,
	generateMockTestOrders,
	generateMockTreatmentPlans,
	generateMockTreatmentPlansForPatient,
	generateDashboardStats,
	generateMockAppointments,
	generateMockAppointmentsForPatient,
	generateMockNotifications,
	mockServicesData,
	mockServicePackagesData,
	mockStaffData,
	mockMedicationCatalogData,
	mockSpecialtiesData,
} from './lib/mockData';
import { motion } from 'motion/react';
import useDualSocket from './hook/useDualSocket';

function MainApp() {
	const { user, isAuthenticated } = useAuth();
	const [records, setRecords] = useState<MedicalRecord[]>([]);
	const [testOrders, setTestOrders] = useState<TestOrder[]>([]);
	const [treatmentPlans, setTreatmentPlans] = useState<TreatmentPlan[]>([]);
	const [appointments, setAppointments] = useState<Appointment[]>([]);
	const [notifications, setNotifications] = useState<Notification[]>([]);
	const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(
		null,
	);
	const [examiningRecordId, setExaminingRecordId] = useState<string | null>(
		null,
	);
	const [services, setServices] = useState<Service[]>([]);
	const [servicePackages, setServicePackages] = useState<ServicePackage[]>([]);
	const [staff, setStaff] = useState<Staff[]>([]);
	const [medications, setMedications] = useState<MedicationCatalog[]>([]);
	const [specialties, setSpecialties] = useState<Specialty[]>([]);
	const [activeTab, setActiveTab] = useState('ai');
	const [sidebarOpen, setSidebarOpen] = useState(true);

	const {
		messages,
		sendMessage,
		typing,
		setTyping,
		setDataSocketPlus,
		streamingMessage,
		isStreaming,
	} = useDualSocket();

	// Initialize with mock data
	useEffect(() => {
		if (isAuthenticated) {
			const mockRecords = generateMockRecords();
			setRecords(mockRecords);
			setTestOrders(generateMockTestOrders());
			setServices(mockServicesData);
			setServicePackages(mockServicePackagesData);
			setStaff(mockStaffData);
		setMedications(mockMedicationCatalogData);
		setSpecialties(mockSpecialtiesData);

			// Generate appointments - if patient, generate specific appointments for them
			if (user?.role === 'patient' && user?.fullName) {
				const patientAppointments = generateMockAppointmentsForPatient(
					user.fullName,
					user.email,
				);
				// Also include some general appointments
				const generalAppointments = generateMockAppointments();
				setAppointments([...patientAppointments, ...generalAppointments]);
			} else {
				setAppointments(generateMockAppointments());
			}

			setNotifications(generateMockNotifications(user?.fullName));

			// Generate treatment plans for examined records
			let mockTreatmentPlans = generateMockTreatmentPlans(mockRecords);
			let updatedRecords = mockRecords;

			// If patient, also generate specific treatment plans for them
			if (user?.role === 'patient' && user?.fullName) {
				// Check if patient has records
				const patientRecords = mockRecords.filter(
					(r) => r.patient.fullName === user.fullName,
				);

				// If no records, we'll create a mock record in generateMockTreatmentPlansForPatient
				// But we need to add it to the records list
				const patientTreatmentPlans = generateMockTreatmentPlansForPatient(
					user.fullName,
					mockRecords,
				);

				// If patient has no records but has treatment plans, add the mock record
				if (patientRecords.length === 0 && patientTreatmentPlans.length > 0) {
					const treatmentPlan = patientTreatmentPlans[0];
					const mockRecord: MedicalRecord = {
						id: treatmentPlan.recordId,
						receiveCode: `RC${Date.now()}`,
						patient: {
							id: `patient_${Date.now()}`,
							fullName: user.fullName,
							phoneNumber: '0900000000',
							dateOfBirth: '1990-01-01',
							gender: 'male',
						},
						reason: 'Khám tổng quát',
						requestedServices: [],
						status: 'COMPLETED_EXAMINATION',
						assignedDoctor: {
							id: 'doc1',
							name: treatmentPlan.createdBy,
							specialty: 'Nội khoa',
						},
						diagnosis: 'Khám sức khỏe tổng quát, cần theo dõi và điều trị',
						createdAt: treatmentPlan.createdAt,
						updatedAt: treatmentPlan.updatedAt || treatmentPlan.createdAt,
						paymentStatus: 'completed',
						totalAmount: 300000,
						paidAmount: 300000,
					};
					updatedRecords = [...mockRecords, mockRecord];
				}

				mockTreatmentPlans = [...mockTreatmentPlans, ...patientTreatmentPlans];
			}

			setTreatmentPlans(mockTreatmentPlans);

			// Update records with treatmentPlanId
			const finalRecords = updatedRecords.map((record) => {
				const treatmentPlan = mockTreatmentPlans.find(
					(tp) => tp.recordId === record.id,
				);
				if (treatmentPlan) {
					return {
						...record,
						treatmentPlanId: treatmentPlan.id,
					};
				}
				return record;
			});
			setRecords(finalRecords);
		}
	}, [isAuthenticated, user]);

	// Auto-select default tab based on role
	useEffect(() => {
		if (user) {
			// All roles default to AI Assistant
			setActiveTab('ai');
		}
	}, [user]);

	const handleCreateRecord = (
		newRecordData: Omit<
			MedicalRecord,
			'id' | 'receiveCode' | 'createdAt' | 'updatedAt'
		>,
	) => {
		const today = new Date();
		const dateStr = today.toISOString().split('T')[0].replace(/-/g, '');
		const recordNumber = String(records.length + 1).padStart(3, '0');
		const receiveCode = `RC${dateStr}${recordNumber}`;

		const newRecord: MedicalRecord = {
			...newRecordData,
			id: String(Date.now()),
			receiveCode,
			createdAt: today.toISOString(),
			updatedAt: today.toISOString(),
		};

		setRecords([newRecord, ...records]);
	};

	const handleUpdateRecord = (
		recordId: string,
		updates: Partial<MedicalRecord>,
	) => {
		setRecords(
			records.map((r) =>
				r.id === recordId
					? { ...r, ...updates, updatedAt: new Date().toISOString() }
					: r,
			),
		);
	};

	const handleCreateTestOrder = (
		recordId: string,
		testType: TestType,
		testName: string,
	) => {
		const record = records.find((r) => r.id === recordId);
		if (!record) return;

		const newTestOrder: TestOrder = {
			id: `t${Date.now()}`,
			recordId,
			receiveCode: record.receiveCode,
			patientName: record.patient.fullName,
			testType,
			testName,
			orderedBy: user?.fullName || 'Bác sĩ',
			orderedAt: new Date().toISOString(),
			status: 'pending',
		};

		setTestOrders([newTestOrder, ...testOrders]);
	};

	const handleUpdateTestOrder = (
		orderId: string,
		updates: Partial<TestOrder>,
	) => {
		setTestOrders(
			testOrders.map((t) => (t.id === orderId ? { ...t, ...updates } : t)),
		);
	};

	const handleCreateTreatmentPlan = (
		planData: Omit<TreatmentPlan, 'id' | 'createdAt' | 'createdBy'>,
	) => {
		const newPlan: TreatmentPlan = {
			...planData,
			id: `tp_${Date.now()}`,
			createdAt: new Date().toISOString(),
			createdBy: user?.fullName || 'Bác sĩ',
		};

		setTreatmentPlans([...treatmentPlans, newPlan]);

		// Update record with treatment plan ID
		setRecords(
			records.map((r) =>
				r.id === planData.recordId
					? {
							...r,
							treatmentPlanId: newPlan.id,
							updatedAt: new Date().toISOString(),
					  }
					: r,
			),
		);
	};

	const handleUpdateTreatmentPlan = (plan: TreatmentPlan) => {
		setTreatmentPlans(
			treatmentPlans.map((tp) =>
				tp.id === plan.id
					? { ...plan, updatedAt: new Date().toISOString() }
					: tp,
			),
		);
	};

	const handleCreateAppointment = (
		appointmentData: Omit<
			Appointment,
			'id' | 'code' | 'createdAt' | 'updatedAt'
		>,
	) => {
		const today = new Date();
		const dateStr = today.toISOString().split('T')[0].replace(/-/g, '');
		const appointmentNumber = String(appointments.length + 1).padStart(3, '0');
		const code = `LH${dateStr}${appointmentNumber}`;

		const newAppointment: Appointment = {
			...appointmentData,
			id: `apt_${Date.now()}`,
			code,
			createdAt: today.toISOString(),
			updatedAt: today.toISOString(),
		};

		setAppointments([...appointments, newAppointment]);
	};

	const handleUpdateAppointment = (
		appointmentId: string,
		updates: Partial<Appointment>,
	) => {
		setAppointments(
			appointments.map((apt) =>
				apt.id === appointmentId
					? { ...apt, ...updates, updatedAt: new Date().toISOString() }
					: apt,
			),
		);
	};

	const handleUpdateTreatmentPlanForPatient = (
		planId: string,
		updates: Partial<TreatmentPlan>,
	) => {
		setTreatmentPlans(
			treatmentPlans.map((tp) =>
				tp.id === planId
					? { ...tp, ...updates, updatedAt: new Date().toISOString() }
					: tp,
			),
		);
	};

	const [treatmentProgress, setTreatmentProgress] = useState<
		Record<string, any[]>
	>({});

	const handleAddTreatmentProgress = (progress: {
		treatmentPlanId: string;
		medicationId?: string;
		date: string;
		status?: 'taken' | 'missed' | 'skipped';
		notes?: string;
		patientFeedback?: string;
		vitalSigns?: {
			bloodPressure?: {
				systolic: number;
				diastolic: number;
				time?: string;
			};
			bloodSugar?: {
				value: number;
				type: 'fasting' | 'postprandial' | 'random';
				time?: string;
			};
			heartRate?: number;
			weight?: number;
			temperature?: number;
			oxygenSaturation?: number;
			painLevel?: number;
		};
	}) => {
		// If medicationId is provided, store as medication-specific progress
		// Otherwise, store as daily update (general progress for the day)
		const key = progress.medicationId
			? `${progress.treatmentPlanId}_${progress.medicationId}`
			: `${progress.treatmentPlanId}_daily_${progress.date}`;

		const existingProgress = treatmentProgress[key] || [];

		// Check if progress for this date already exists
		const existingIndex = existingProgress.findIndex(
			(p) => p.date === progress.date,
		);

		const newProgress = {
			id: `progress_${Date.now()}`,
			...progress,
			createdAt: new Date().toISOString(),
		};

		if (existingIndex >= 0) {
			// Update existing progress
			existingProgress[existingIndex] = newProgress;
		} else {
			// Add new progress
			existingProgress.push(newProgress);
		}

		setTreatmentProgress({
			...treatmentProgress,
			[key]: existingProgress,
		});
	};

	const handleUpdateNotification = (
		notificationId: string,
		updates: Partial<Notification>,
	) => {
		setNotifications(
			notifications.map((notif) =>
				notif.id === notificationId ? { ...notif, ...updates } : notif,
			),
		);
	};

	// Staff handlers
	const handleCreateStaff = (
		staffData: Omit<Staff, 'id' | 'createdAt' | 'updatedAt'>,
	) => {
		const newStaff: Staff = {
			...staffData,
			id: `staff_${Date.now()}`,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		};
		setStaff([...staff, newStaff]);
	};

	const handleUpdateStaff = (id: string, updates: Partial<Staff>) => {
		setStaff(
			staff.map((s) =>
				s.id === id
					? { ...s, ...updates, updatedAt: new Date().toISOString() }
					: s,
			),
		);
	};

	const handleDeleteStaff = (id: string) => {
		setStaff(staff.filter((s) => s.id !== id));
	};

	// Medication handlers
	const handleCreateMedication = (
		medicationData: Omit<MedicationCatalog, 'id' | 'createdAt' | 'updatedAt'>,
	) => {
		const newMedication: MedicationCatalog = {
			...medicationData,
			id: `med_${Date.now()}`,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		};
		setMedications([...medications, newMedication]);
	};

	const handleUpdateMedication = (id: string, updates: Partial<MedicationCatalog>) => {
		setMedications(
			medications.map((m) =>
				m.id === id
					? { ...m, ...updates, updatedAt: new Date().toISOString() }
					: m,
			),
		);
	};

	const handleDeleteMedication = (id: string) => {
		setMedications(medications.filter((m) => m.id !== id));
	};

	// Specialty handlers
	const handleCreateSpecialty = (
		specialtyData: Omit<Specialty, 'id' | 'createdAt' | 'updatedAt'>,
	) => {
		const newSpecialty: Specialty = {
			...specialtyData,
			id: `spec_${Date.now()}`,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		};
		setSpecialties([...specialties, newSpecialty]);
	};

	const handleUpdateSpecialty = (id: string, updates: Partial<Specialty>) => {
		setSpecialties(
			specialties.map((s) =>
				s.id === id
					? { ...s, ...updates, updatedAt: new Date().toISOString() }
					: s,
			),
		);
	};

	const handleDeleteSpecialty = (id: string) => {
		setSpecialties(specialties.filter((s) => s.id !== id));
	};


	if (!isAuthenticated) {
		return <LoginPage />;
	}

	const stats = generateDashboardStats(records);

	const handleEndDemoClick = () => {
		// Xóa tất cả dữ liệu trong localStorage
		localStorage.clear();

		// Reload trang để reset về trạng thái ban đầu
		window.location.reload();
	};

	return (
		<div className="h-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 overflow-hidden">
			<Toaster position="top-right" />

			<div className="flex h-full">
				<AppSidebar
					isOpen={sidebarOpen}
					activeTab={activeTab}
					onTabChange={(tab) => {
						setActiveTab(tab);
						if (window.innerWidth < 1024) setSidebarOpen(false);
					}}
					onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
					userRole={user?.role}
					unreadNotificationsCount={notifications.filter((n) => !n.read).length}
				/>

				{/* Main Content Area */}
				<main className="flex-1 p-4 lg:p-6 overflow-hidden flex flex-col h-full">
					{/* Nút toggle sidebar khi sidebar đóng trên mobile */}
					{!sidebarOpen && (
						<div className="mb-4 lg:hidden">
							<Button
								variant="ghost"
								size="icon"
								onClick={() => setSidebarOpen(true)}
								className="lg:hidden"
							>
								<Menu className="h-5 w-5" />
							</Button>
						</div>
					)}
					<motion.div
						key={activeTab}
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -20 }}
						transition={{ duration: 0.3 }}
						className="flex-1 flex flex-col min-h-0 overflow-y-auto"
					>
						{activeTab === 'ai' && (
							<RoleGuard
								allowedRoles={[
									'admin',
									'receptionist',
									'doctor',
									'nurse',
									'patient',
								]}
							>
								<AIAssistant
									stats={stats}
									onNewRecord={() => setActiveTab('records')}
									onViewRecords={() => {
										setActiveTab('records');
									}}
									userRole={user?.role || 'receptionist'}
									handSendMessage={sendMessage}
									messagesAI={messages}
									isTyping={typing}
									setIsTyping={setTyping}
									streamingMessage={streamingMessage}
									isStreaming={isStreaming}
									onEndDemo={handleEndDemoClick}
								/>
							</RoleGuard>
						)}

						{activeTab === 'records' && (
							<RoleGuard
								allowedRoles={['admin', 'receptionist', 'doctor', 'nurse']}
							>
								<RecordList
									records={records}
									onViewRecord={setSelectedRecord}
									onCreateRecord={handleCreateRecord}
								/>
							</RoleGuard>
						)}

					{activeTab === 'doctor' && !examiningRecordId && (
						<RoleGuard allowedRoles={['admin', 'doctor']}>
							<DoctorWorkspace
								records={records}
								treatmentPlans={treatmentPlans}
								onUpdateRecord={handleUpdateRecord}
								onCreateTestOrder={handleCreateTestOrder}
								onCreateTreatmentPlan={handleCreateTreatmentPlan}
								onUpdateTreatmentPlan={handleUpdateTreatmentPlan}
								onExamineRecord={(recordId) => setExaminingRecordId(recordId)}
							/>
						</RoleGuard>
					)}

					{activeTab === 'doctor' && examiningRecordId && (
						<RoleGuard allowedRoles={['admin', 'doctor']}>
							{(() => {
								const record = records.find(
									(r) => r.id === examiningRecordId,
								);
								if (!record) return null;

								const getExaminationDate = (record: MedicalRecord): string => {
									const date = record.appointmentTime
										? new Date(record.appointmentTime)
										: new Date(record.createdAt);
									return date.toLocaleDateString('vi-VN', {
										day: '2-digit',
										month: '2-digit',
										year: 'numeric',
									});
								};

								const getExaminationOrder = (record: MedicalRecord): number => {
									const recordDate = record.appointmentTime
										? new Date(record.appointmentTime).toDateString()
										: new Date(record.createdAt).toDateString();

									const sameDayRecords = records.filter((r) => {
										const rDate = r.appointmentTime
											? new Date(r.appointmentTime).toDateString()
											: new Date(r.createdAt).toDateString();
										return rDate === recordDate;
									});

									const sortedRecords = sameDayRecords.sort((a, b) => {
										const aTime = a.appointmentTime
											? new Date(a.appointmentTime).getTime()
											: new Date(a.createdAt).getTime();
										const bTime = b.appointmentTime
											? new Date(b.appointmentTime).getTime()
											: new Date(b.createdAt).getTime();
										return aTime - bTime;
									});

									return sortedRecords.findIndex((r) => r.id === record.id) + 1;
								};

								return (
									<ExaminationDetail
										record={record}
										treatmentPlan={treatmentPlans.find(
											(tp) => tp.recordId === record.id,
										)}
										doctorName={
											record.assignedDoctor?.name || 'Bác sĩ'
										}
										onBack={() => setExaminingRecordId(null)}
										onCreateTreatmentPlan={handleCreateTreatmentPlan}
										onUpdateTreatmentPlan={handleUpdateTreatmentPlan}
										getExaminationDate={getExaminationDate}
										getExaminationOrder={getExaminationOrder}
									/>
								);
							})()}
						</RoleGuard>
					)}

						{activeTab === 'nurse' && (
							<RoleGuard allowedRoles={['admin', 'nurse']}>
								<TechnicianWorkspace
									testOrders={testOrders}
									onUpdateTestOrder={handleUpdateTestOrder}
								/>
							</RoleGuard>
						)}

						{(activeTab === 'patient' || activeTab === 'patient-treatment') && (
							<RoleGuard allowedRoles={['patient']}>
								<PatientWorkspace
									activeTab={activeTab}
									records={records}
									treatmentPlans={treatmentPlans}
									treatmentProgress={treatmentProgress}
									onUpdateTreatmentPlan={handleUpdateTreatmentPlanForPatient}
									onAddTreatmentProgress={handleAddTreatmentProgress}
								/>
							</RoleGuard>
						)}

						{activeTab === 'staff' && (
							<RoleGuard allowedRoles={['admin']}>
								<StaffManagement
									staff={staff}
									specialties={specialties}
									onCreate={handleCreateStaff}
									onUpdate={handleUpdateStaff}
									onDelete={handleDeleteStaff}
								/>
							</RoleGuard>
						)}

						{activeTab === 'medications' && (
							<RoleGuard allowedRoles={['admin']}>
								<MedicationManagement
									medications={medications}
									onCreate={handleCreateMedication}
									onUpdate={handleUpdateMedication}
									onDelete={handleDeleteMedication}
								/>
							</RoleGuard>
						)}

						{activeTab === 'specialties' && (
							<RoleGuard allowedRoles={['admin']}>
								<SpecialtyManagement
									specialties={specialties}
									onCreate={handleCreateSpecialty}
									onUpdate={handleUpdateSpecialty}
									onDelete={handleDeleteSpecialty}
								/>
							</RoleGuard>
						)}

					</motion.div>
				</main>
			</div>

			{/* Record Detail Modal */}
			<RecordDetail
				record={selectedRecord}
				testOrders={testOrders}
				treatmentPlans={treatmentPlans}
				onClose={() => setSelectedRecord(null)}
			/>
		</div>
	);
}

export default function App() {
	return (
		<AuthProvider>
			<MainApp />
		</AuthProvider>
	);
}
