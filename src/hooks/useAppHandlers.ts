import { useCallback } from 'react';
import {
	MedicalRecord,
	TestOrder,
	TestType,
	TreatmentPlan,
	Appointment,
	Notification,
	Staff,
	MedicationCatalog,
	Specialty,
	Customer,
} from '../types';
import { User } from '../types/auth';

interface UseAppHandlersProps {
	user: User | null;
	records: MedicalRecord[];
	setRecords: React.Dispatch<React.SetStateAction<MedicalRecord[]>>;
	testOrders: TestOrder[];
	setTestOrders: React.Dispatch<React.SetStateAction<TestOrder[]>>;
	treatmentPlans: TreatmentPlan[];
	setTreatmentPlans: React.Dispatch<React.SetStateAction<TreatmentPlan[]>>;
	appointments: Appointment[];
	setAppointments: React.Dispatch<React.SetStateAction<Appointment[]>>;
	notifications: Notification[];
	setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
	staff: Staff[];
	setStaff: React.Dispatch<React.SetStateAction<Staff[]>>;
	medications: MedicationCatalog[];
	setMedications: React.Dispatch<React.SetStateAction<MedicationCatalog[]>>;
	specialties: Specialty[];
	setSpecialties: React.Dispatch<React.SetStateAction<Specialty[]>>;
	customers: Customer[];
	setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>;
}

export function useAppHandlers({
	user,
	records,
	setRecords,
	testOrders,
	setTestOrders,
	treatmentPlans,
	setTreatmentPlans,
	appointments,
	setAppointments,
	notifications,
	setNotifications,
	staff,
	setStaff,
	medications,
	setMedications,
	specialties,
	setSpecialties,
	customers,
	setCustomers,
}: UseAppHandlersProps) {
	const handleCreateRecord = useCallback(
		(
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

			setRecords((prev) => [newRecord, ...prev]);
		},
		[records.length, setRecords],
	);

	const handleUpdateRecord = useCallback(
		(recordId: string, updates: Partial<MedicalRecord>) => {
			setRecords((prev) =>
				prev.map((r) =>
					r.id === recordId
						? { ...r, ...updates, updatedAt: new Date().toISOString() }
						: r,
				),
			);
		},
		[setRecords],
	);

	const handleCreateTestOrder = useCallback(
		(recordId: string, testType: TestType, testName: string) => {
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

			setTestOrders((prev) => [newTestOrder, ...prev]);
		},
		[records, user?.fullName, setTestOrders],
	);

	const handleUpdateTestOrder = useCallback(
		(orderId: string, updates: Partial<TestOrder>) => {
			setTestOrders((prev) =>
				prev.map((t) => (t.id === orderId ? { ...t, ...updates } : t)),
			);
		},
		[setTestOrders],
	);

	const handleCreateTreatmentPlan = useCallback(
		(planData: Omit<TreatmentPlan, 'id' | 'createdAt' | 'createdBy'>) => {
			const newPlan: TreatmentPlan = {
				...planData,
				id: `tp_${Date.now()}`,
				createdAt: new Date().toISOString(),
				createdBy: user?.fullName || 'Bác sĩ',
			};

			setTreatmentPlans((prev) => [...prev, newPlan]);

			// Update record with treatment plan ID
			setRecords((prev) =>
				prev.map((r) =>
					r.id === planData.recordId
						? {
								...r,
								treatmentPlanId: newPlan.id,
								updatedAt: new Date().toISOString(),
						  }
						: r,
				),
			);
		},
		[user?.fullName, setTreatmentPlans, setRecords],
	);

	const handleUpdateTreatmentPlan = useCallback(
		(plan: TreatmentPlan) => {
			setTreatmentPlans((prev) =>
				prev.map((tp) =>
					tp.id === plan.id
						? { ...plan, updatedAt: new Date().toISOString() }
						: tp,
				),
			);
		},
		[setTreatmentPlans],
	);

	const handleCreateAppointment = useCallback(
		(
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

			setAppointments((prev) => [...prev, newAppointment]);
		},
		[appointments.length, setAppointments],
	);

	const handleUpdateAppointment = useCallback(
		(appointmentId: string, updates: Partial<Appointment>) => {
			setAppointments((prev) =>
				prev.map((apt) =>
					apt.id === appointmentId
						? { ...apt, ...updates, updatedAt: new Date().toISOString() }
						: apt,
				),
			);
		},
		[setAppointments],
	);

	const handleUpdateTreatmentPlanForPatient = useCallback(
		(planId: string, updates: Partial<TreatmentPlan>) => {
			setTreatmentPlans((prev) =>
				prev.map((tp) =>
					tp.id === planId
						? { ...tp, ...updates, updatedAt: new Date().toISOString() }
						: tp,
				),
			);
		},
		[setTreatmentPlans],
	);

	const handleUpdateNotification = useCallback(
		(notificationId: string, updates: Partial<Notification>) => {
			setNotifications((prev) =>
				prev.map((notif) =>
					notif.id === notificationId ? { ...notif, ...updates } : notif,
				),
			);
		},
		[setNotifications],
	);

	// Staff handlers
	const handleCreateStaff = useCallback(
		(staffData: Omit<Staff, 'id' | 'createdAt' | 'updatedAt'>) => {
			const newStaff: Staff = {
				...staffData,
				id: `staff_${Date.now()}`,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			};
			setStaff((prev) => [...prev, newStaff]);
		},
		[setStaff],
	);

	const handleUpdateStaff = useCallback(
		(id: string, updates: Partial<Staff>) => {
			setStaff((prev) =>
				prev.map((s) =>
					s.id === id
						? { ...s, ...updates, updatedAt: new Date().toISOString() }
						: s,
				),
			);
		},
		[setStaff],
	);

	const handleDeleteStaff = useCallback(
		(id: string) => {
			setStaff((prev) => prev.filter((s) => s.id !== id));
		},
		[setStaff],
	);

	// Medication handlers
	const handleCreateMedication = useCallback(
		(
			medicationData: Omit<
				MedicationCatalog,
				'id' | 'createdAt' | 'updatedAt'
			>,
		) => {
			const newMedication: MedicationCatalog = {
				...medicationData,
				id: `med_${Date.now()}`,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			};
			setMedications((prev) => [...prev, newMedication]);
		},
		[setMedications],
	);

	const handleUpdateMedication = useCallback(
		(id: string, updates: Partial<MedicationCatalog>) => {
			setMedications((prev) =>
				prev.map((m) =>
					m.id === id
						? { ...m, ...updates, updatedAt: new Date().toISOString() }
						: m,
				),
			);
		},
		[setMedications],
	);

	const handleDeleteMedication = useCallback(
		(id: string) => {
			setMedications((prev) => prev.filter((m) => m.id !== id));
		},
		[setMedications],
	);

	// Specialty handlers
	const handleCreateSpecialty = useCallback(
		(specialtyData: Omit<Specialty, 'id' | 'createdAt' | 'updatedAt'>) => {
			const newSpecialty: Specialty = {
				...specialtyData,
				id: `spec_${Date.now()}`,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			};
			setSpecialties((prev) => [...prev, newSpecialty]);
		},
		[setSpecialties],
	);

	const handleUpdateSpecialty = useCallback(
		(id: string, updates: Partial<Specialty>) => {
			setSpecialties((prev) =>
				prev.map((s) =>
					s.id === id
						? { ...s, ...updates, updatedAt: new Date().toISOString() }
						: s,
				),
			);
		},
		[setSpecialties],
	);

	const handleDeleteSpecialty = useCallback(
		(id: string) => {
			setSpecialties((prev) => prev.filter((s) => s.id !== id));
		},
		[setSpecialties],
	);

	// Customer handlers
	const handleCreateCustomer = useCallback(
		(customerData: Omit<Customer, 'id'>) => {
			const newCustomer: Customer = {
				...customerData,
				id: `customer_${Date.now()}`,
			};
			setCustomers((prev) => [...prev, newCustomer]);
		},
		[setCustomers],
	);

	const handleUpdateCustomer = useCallback(
		(id: string, updates: Partial<Customer>) => {
			setCustomers((prev) =>
				prev.map((c) => (c.id === id ? { ...c, ...updates } : c)),
			);
		},
		[setCustomers],
	);

	const handleDeleteCustomer = useCallback(
		(id: string) => {
			setCustomers((prev) => prev.filter((c) => c.id !== id));
		},
		[setCustomers],
	);

	const handleDeleteAppointment = useCallback(
		(id: string) => {
			setAppointments((prev) => prev.filter((apt) => apt.id !== id));
		},
		[setAppointments],
	);

	return {
		handleCreateRecord,
		handleUpdateRecord,
		handleCreateTestOrder,
		handleUpdateTestOrder,
		handleCreateTreatmentPlan,
		handleUpdateTreatmentPlan,
		handleCreateAppointment,
		handleUpdateAppointment,
		handleDeleteAppointment,
		handleUpdateTreatmentPlanForPatient,
		handleUpdateNotification,
		handleCreateStaff,
		handleUpdateStaff,
		handleDeleteStaff,
		handleCreateMedication,
		handleUpdateMedication,
		handleDeleteMedication,
		handleCreateSpecialty,
		handleUpdateSpecialty,
		handleDeleteSpecialty,
		handleCreateCustomer,
		handleUpdateCustomer,
		handleDeleteCustomer,
	};
}

