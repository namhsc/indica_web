import React, { useState, useEffect } from 'react';
import { Toaster } from './components/ui/sonner';
import { AIAssistant } from './components/AIAssistant';
import { ReceptionForm } from './components/ReceptionForm';
import { RecordList } from './components/RecordList';
import { DoctorWorkspace } from './components/DoctorWorkspace';
import { TechnicianWorkspace } from './components/TechnicianWorkspace';
import { PatientWorkspace } from './components/PatientWorkspace';
import { RecordReturn } from './components/RecordReturn';
import { RecordDetail } from './components/RecordDetail';
import { LoginPage } from './components/LoginPage';
import { RoleGuard } from './components/RoleGuard';
import { AppSidebar } from './components/layout/AppSidebar';
import { ServiceManagement } from './components/ServiceManagement';
import { ServicePackageManagement } from './components/ServicePackageManagement';
import { StaffManagement } from './components/StaffManagement';
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
	const [services, setServices] = useState<Service[]>([]);
	const [servicePackages, setServicePackages] = useState<ServicePackage[]>([]);
	const [staff, setStaff] = useState<Staff[]>([]);
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
						requestedServices: ['Khám tổng quát'],
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

	const handleReturnRecord = (recordId: string, signature: string) => {
		setRecords(
			records.map((r) =>
				r.id === recordId
					? {
							...r,
							status: 'RETURNED',
							signature,
							returnedAt: new Date().toISOString(),
							updatedAt: new Date().toISOString(),
					  }
					: r,
			),
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

	// Service handlers
	const handleCreateService = (
		serviceData: Omit<Service, 'id' | 'createdAt' | 'updatedAt'>,
	) => {
		const newService: Service = {
			...serviceData,
			id: `svc_${Date.now()}`,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		};
		setServices([...services, newService]);
	};

	const handleUpdateService = (id: string, updates: Partial<Service>) => {
		setServices(
			services.map((s) =>
				s.id === id
					? { ...s, ...updates, updatedAt: new Date().toISOString() }
					: s,
			),
		);
	};

	const handleDeleteService = (id: string) => {
		setServices(services.filter((s) => s.id !== id));
	};

	// Service Package handlers
	const handleCreateServicePackage = (
		packageData: Omit<ServicePackage, 'id' | 'createdAt' | 'updatedAt'>,
	) => {
		const newPackage: ServicePackage = {
			...packageData,
			id: `pkg_${Date.now()}`,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		};
		setServicePackages([...servicePackages, newPackage]);
	};

	const handleUpdateServicePackage = (
		id: string,
		updates: Partial<ServicePackage>,
	) => {
		setServicePackages(
			servicePackages.map((p) =>
				p.id === id
					? { ...p, ...updates, updatedAt: new Date().toISOString() }
					: p,
			),
		);
	};

	const handleDeleteServicePackage = (id: string) => {
		setServicePackages(servicePackages.filter((p) => p.id !== id));
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

						{activeTab === 'doctor' && (
							<RoleGuard allowedRoles={['admin', 'doctor']}>
								<DoctorWorkspace
									records={records}
									treatmentPlans={treatmentPlans}
									onUpdateRecord={handleUpdateRecord}
									onCreateTestOrder={handleCreateTestOrder}
									onCreateTreatmentPlan={handleCreateTreatmentPlan}
									onUpdateTreatmentPlan={handleUpdateTreatmentPlan}
								/>
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

						{activeTab === 'return' && (
							<RoleGuard allowedRoles={['admin', 'receptionist']}>
								<RecordReturn
									records={records}
									onReturnRecord={handleReturnRecord}
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

						{activeTab === 'services' && (
							<RoleGuard allowedRoles={['admin']}>
								<ServiceManagement
									services={services}
									onCreate={handleCreateService}
									onUpdate={handleUpdateService}
									onDelete={handleDeleteService}
								/>
							</RoleGuard>
						)}

						{activeTab === 'service-packages' && (
							<RoleGuard allowedRoles={['admin']}>
								<ServicePackageManagement
									packages={servicePackages}
									services={services}
									onCreate={handleCreateServicePackage}
									onUpdate={handleUpdateServicePackage}
									onDelete={handleDeleteServicePackage}
								/>
							</RoleGuard>
						)}

						{activeTab === 'staff' && (
							<RoleGuard allowedRoles={['admin']}>
								<StaffManagement
									staff={staff}
									onCreate={handleCreateStaff}
									onUpdate={handleUpdateStaff}
									onDelete={handleDeleteStaff}
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
