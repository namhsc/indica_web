import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Toaster } from './components/ui/sonner';
import { toast } from 'sonner';
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
import { CustomerBookingPage } from './components/CustomerBookingPage';
import { CustomerManagement } from './components/CustomerManagement';
import { AppointmentManagement } from './components/AppointmentManagement';
import { TaskManagement } from './components/TaskManagement/TaskManagement';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Button } from './components/ui/button';
import { Menu } from 'lucide-react';
import { MedicalRecord } from './types';
import { generateDashboardStats } from './lib/mockData';
import { motion } from 'motion/react';
import useDualSocket from './hooks/useDualSocket';
import { useMedicalData } from './hooks/useMedicalData';
import { useAppHandlers } from './hooks/useAppHandlers';
import { useTreatmentProgress } from './hooks/useTreatmentProgress';
import { useTaskManagement } from './hooks/useTaskManagement';

// Helper functions outside component
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

const getExaminationOrder = (
	record: MedicalRecord,
	records: MedicalRecord[],
): number => {
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

function MainApp() {
	const { user, isAuthenticated } = useAuth();
	const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(
		null,
	);
	const [examiningRecordId, setExaminingRecordId] = useState<string | null>(
		null,
	);
	const [activeTab, setActiveTab] = useState('ai');
	const [sidebarOpen, setSidebarOpen] = useState(true);
	const [showBookingPage, setShowBookingPage] = useState(false);

	// Custom hooks for data management
	const medicalData = useMedicalData(user, isAuthenticated);
	const {
		records,
		testOrders,
		treatmentPlans,
		appointments,
		notifications,
		staff,
		medications,
		specialties,
		customers,
	} = medicalData;

	const handlers = useAppHandlers({
		user,
		...medicalData,
	});

	const { treatmentProgress, handleAddTreatmentProgress } =
		useTreatmentProgress();

	const {
		messages,
		sendMessage,
		typing,
		setTyping,
		setDataSocketPlus,
		streamingMessage,
		isStreaming,
	} = useDualSocket();

	// Check for booking hash route
	useEffect(() => {
		if (window.location.hash === '#booking') {
			setShowBookingPage(true);
		}

		// Listen for hash changes
		const handleHashChange = () => {
			if (window.location.hash === '#booking') {
				setShowBookingPage(true);
			} else {
				setShowBookingPage(false);
			}
		};

		window.addEventListener('hashchange', handleHashChange);
		return () => window.removeEventListener('hashchange', handleHashChange);
	}, []);

	// Auto-select default tab based on role
	useEffect(() => {
		if (user && !showBookingPage) {
			// All roles default to AI Assistant
			setActiveTab('ai');
		}
	}, [user, showBookingPage]);

	// Memoized values
	const stats = useMemo(() => generateDashboardStats(records), [records]);

	const unreadNotificationsCount = useMemo(
		() => notifications.filter((n) => !n.read).length,
		[notifications],
	);

	const examiningRecord = useMemo(
		() => records.find((r) => r.id === examiningRecordId) || null,
		[records, examiningRecordId],
	);

	const examiningTreatmentPlan = useMemo(
		() =>
			examiningRecord
				? treatmentPlans.find((tp) => tp.recordId === examiningRecord.id)
				: undefined,
		[examiningRecord, treatmentPlans],
	);

	// Callbacks
	const handleEndDemoClick = useCallback(() => {
		// Xóa tất cả dữ liệu trong localStorage
		localStorage.clear();

		// Reload trang để reset về trạng thái ban đầu
		window.location.reload();
	}, []);

	const handleTabChange = useCallback((tab: string) => {
		setActiveTab(tab);
		if (window.innerWidth < 1024) setSidebarOpen(false);
	}, []);

	const handleToggleSidebar = useCallback(() => {
		setSidebarOpen((prev) => !prev);
	}, []);

	const handleOpenSidebar = useCallback(() => {
		setSidebarOpen(true);
	}, []);

	const handleNewRecord = useCallback(() => {
		setActiveTab('records');
	}, []);

	const handleViewRecords = useCallback(() => {
		setActiveTab('records');
	}, []);

	const handleViewTasks = useCallback(() => {
		setActiveTab('tasks');
	}, []);

	// Task management hook
	const taskManagement = useTaskManagement({
		userId: user?.id || '',
		userName: user?.name || 'Người dùng',
		userRole: user?.role || 'receptionist',
	});

	const handleCreateTask = useCallback(
		(taskData: any) => {
			taskManagement.createTask(taskData);
			toast.success('Đã tạo công việc thành công!');
		},
		[taskManagement],
	);

	const handleExamineRecord = useCallback((recordId: string) => {
		setExaminingRecordId(recordId);
	}, []);

	const handleBackFromExamination = useCallback(() => {
		setExaminingRecordId(null);
	}, []);

	const handleCloseRecordDetail = useCallback(() => {
		setSelectedRecord(null);
	}, []);

	const getExaminationDateMemo = useCallback(
		(record: MedicalRecord) => getExaminationDate(record),
		[],
	);

	const getExaminationOrderMemo = useCallback(
		(record: MedicalRecord) => getExaminationOrder(record, records),
		[records],
	);

	if (!isAuthenticated && !showBookingPage) {
		return <LoginPage />;
	}

	// Show booking page if booking query parameter exists (no auth required)
	if (showBookingPage) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
				<Toaster position="top-right" />
				<CustomerBookingPage
					onSubmit={(record) => {
						if (isAuthenticated && handlers.handleCreateRecord) {
							// Nếu đã đăng nhập, tạo record trực tiếp
							handlers.handleCreateRecord(record);
							// Note: Toast đã được hiện trong CustomerBookingPage component
							// Delay redirect để user có thể đọc thông báo
							setTimeout(() => {
								// Xóa hash và quay về trang chủ
								window.history.replaceState({}, '', window.location.pathname);
								setShowBookingPage(false);
							}, 3000); // 3 giây delay
						} else {
							// Nếu chưa đăng nhập, lưu vào localStorage để xử lý sau
							const bookingId = `booking_${Date.now()}_${Math.random()
								.toString(36)
								.substring(7)}`;
							const bookingData = {
								id: bookingId,
								record: record,
								createdAt: new Date().toISOString(),
								status: 'pending',
							};

							// Lấy danh sách booking hiện có
							const existingBookings = JSON.parse(
								localStorage.getItem('pendingBookings') || '[]',
							);
							existingBookings.push(bookingData);
							localStorage.setItem(
								'pendingBookings',
								JSON.stringify(existingBookings),
							);

							// Note: Toast đã được hiện trong CustomerBookingPage component
							// Delay redirect để user có thể đọc thông báo
							setTimeout(() => {
								// Xóa hash và quay về trang chủ
								window.history.replaceState({}, '', window.location.pathname);
								setShowBookingPage(false);
							}, 3000); // 3 giây delay
						}
					}}
					onBack={() => {
						window.history.replaceState({}, '', window.location.pathname);
						setShowBookingPage(false);
					}}
				/>
			</div>
		);
	}

	if (!isAuthenticated) {
		return <LoginPage />;
	}

	return (
		<div className="h-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 overflow-hidden">
			<Toaster position="top-right" />

			<div className="flex h-full">
				<AppSidebar
					isOpen={sidebarOpen}
					activeTab={activeTab}
					onTabChange={handleTabChange}
					onToggleSidebar={handleToggleSidebar}
					userRole={user?.role}
					unreadNotificationsCount={unreadNotificationsCount}
				/>

				{/* Main Content Area */}
				<main className="flex-1 p-4 lg:p-6 overflow-hidden flex flex-col h-full">
					{/* Nút toggle sidebar khi sidebar đóng trên mobile */}
					{!sidebarOpen && (
						<div className="mb-4 lg:hidden">
							<Button
								variant="ghost"
								size="icon"
								onClick={handleOpenSidebar}
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
									onNewRecord={handleNewRecord}
									onViewRecords={handleViewRecords}
									onViewTasks={handleViewTasks}
									onCreateTask={handleCreateTask}
									currentUser={
										user
											? { id: user.id, name: user.name, role: user.role }
											: undefined
									}
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

						{activeTab === 'tasks' && (
							<RoleGuard
								allowedRoles={[
									'admin',
									'receptionist',
									'doctor',
									'nurse',
									'patient',
								]}
							>
								<TaskManagement taskManagement={taskManagement} />
							</RoleGuard>
						)}

						{activeTab === 'records' && (
							<RoleGuard
								allowedRoles={['admin', 'receptionist', 'doctor', 'nurse']}
							>
								<RecordList
									records={records}
									onViewRecord={setSelectedRecord}
									onCreateRecord={handlers.handleCreateRecord}
								/>
							</RoleGuard>
						)}

						{activeTab === 'doctor' && !examiningRecordId && (
							<RoleGuard allowedRoles={['admin', 'doctor']}>
								<DoctorWorkspace
									records={records}
									treatmentPlans={treatmentPlans}
									onUpdateRecord={handlers.handleUpdateRecord}
									onCreateTestOrder={handlers.handleCreateTestOrder}
									onCreateTreatmentPlan={handlers.handleCreateTreatmentPlan}
									onUpdateTreatmentPlan={handlers.handleUpdateTreatmentPlan}
									onExamineRecord={handleExamineRecord}
								/>
							</RoleGuard>
						)}

						{activeTab === 'doctor' && examiningRecord && (
							<RoleGuard allowedRoles={['admin', 'doctor']}>
								<ExaminationDetail
									record={examiningRecord}
									treatmentPlan={examiningTreatmentPlan}
									doctorName={examiningRecord.assignedDoctor?.name || 'Bác sĩ'}
									onBack={handleBackFromExamination}
									onCreateTreatmentPlan={handlers.handleCreateTreatmentPlan}
									onUpdateTreatmentPlan={handlers.handleUpdateTreatmentPlan}
									getExaminationDate={getExaminationDateMemo}
									getExaminationOrder={getExaminationOrderMemo}
								/>
							</RoleGuard>
						)}

						{activeTab === 'nurse' && (
							<RoleGuard allowedRoles={['admin', 'nurse']}>
								<TechnicianWorkspace
									testOrders={testOrders}
									onUpdateTestOrder={handlers.handleUpdateTestOrder}
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
									onUpdateTreatmentPlan={
										handlers.handleUpdateTreatmentPlanForPatient
									}
									onAddTreatmentProgress={handleAddTreatmentProgress}
								/>
							</RoleGuard>
						)}

						{activeTab === 'staff' && (
							<RoleGuard allowedRoles={['admin']}>
								<StaffManagement
									staff={staff}
									specialties={specialties}
									onCreate={handlers.handleCreateStaff}
									onUpdate={handlers.handleUpdateStaff}
									onDelete={handlers.handleDeleteStaff}
								/>
							</RoleGuard>
						)}

						{activeTab === 'medications' && (
							<RoleGuard allowedRoles={['admin']}>
								<MedicationManagement
									medications={medications}
									onCreate={handlers.handleCreateMedication}
									onUpdate={handlers.handleUpdateMedication}
									onDelete={handlers.handleDeleteMedication}
								/>
							</RoleGuard>
						)}

						{activeTab === 'specialties' && (
							<RoleGuard allowedRoles={['admin']}>
								<SpecialtyManagement
									specialties={specialties}
									onCreate={handlers.handleCreateSpecialty}
									onUpdate={handlers.handleUpdateSpecialty}
									onDelete={handlers.handleDeleteSpecialty}
								/>
							</RoleGuard>
						)}

						{activeTab === 'customers' && (
							<RoleGuard allowedRoles={['admin', 'receptionist', 'doctor']}>
								<CustomerManagement
									customers={customers}
									onCreate={handlers.handleCreateCustomer}
									onUpdate={handlers.handleUpdateCustomer}
									onDelete={handlers.handleDeleteCustomer}
								/>
							</RoleGuard>
						)}

						{activeTab === 'appointments' && (
							<RoleGuard allowedRoles={['admin', 'receptionist', 'doctor']}>
								<AppointmentManagement
									appointments={appointments}
									customers={customers}
									onCreate={handlers.handleCreateAppointment}
									onUpdate={handlers.handleUpdateAppointment}
									onDelete={handlers.handleDeleteAppointment}
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
				onClose={handleCloseRecordDetail}
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
