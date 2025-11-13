import { useState, useEffect, useMemo } from 'react';
import {
	MedicalRecord,
	TestOrder,
	TreatmentPlan,
	Appointment,
	Notification,
	Service,
	ServicePackage,
	Staff,
	MedicationCatalog,
	Specialty,
} from '../types';
import {
	generateMockRecords,
	generateMockTestOrders,
	generateMockTreatmentPlans,
	generateMockTreatmentPlansForPatient,
	generateMockAppointments,
	generateMockAppointmentsForPatient,
	generateMockNotifications,
	mockServicesData,
	mockServicePackagesData,
	mockStaffData,
	mockMedicationCatalogData,
	mockSpecialtiesData,
} from '../lib/mockData';
import { User } from '../types/auth';

export function useMedicalData(user: User | null, isAuthenticated: boolean) {
	const [records, setRecords] = useState<MedicalRecord[]>([]);
	const [testOrders, setTestOrders] = useState<TestOrder[]>([]);
	const [treatmentPlans, setTreatmentPlans] = useState<TreatmentPlan[]>([]);
	const [appointments, setAppointments] = useState<Appointment[]>([]);
	const [notifications, setNotifications] = useState<Notification[]>([]);
	const [services, setServices] = useState<Service[]>([]);
	const [servicePackages, setServicePackages] = useState<ServicePackage[]>([]);
	const [staff, setStaff] = useState<Staff[]>([]);
	const [medications, setMedications] = useState<MedicationCatalog[]>([]);
	const [specialties, setSpecialties] = useState<Specialty[]>([]);

	// Initialize with mock data
	useEffect(() => {
		if (!isAuthenticated) return;

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
			const patientRecords = mockRecords.filter(
				(r) => r.patient.fullName === user.fullName,
			);

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
	}, [isAuthenticated, user]);

	return {
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
		services,
		setServices,
		servicePackages,
		setServicePackages,
		staff,
		setStaff,
		medications,
		setMedications,
		specialties,
		setSpecialties,
	};
}

