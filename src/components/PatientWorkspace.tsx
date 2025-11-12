import React from 'react';
import { User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { MedicalRecord, TreatmentPlan } from '../types';
import { PatientTreatmentPlans } from './PatientWorkspace/PatientTreatmentPlans';

interface PatientWorkspaceProps {
	activeTab: string;
	records: MedicalRecord[];
	treatmentPlans: TreatmentPlan[];
	treatmentProgress?: Record<string, any[]>;
	onUpdateTreatmentPlan: (
		planId: string,
		updates: Partial<TreatmentPlan>,
	) => void;
	onAddTreatmentProgress: (progress: {
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
	}) => void;
}

export function PatientWorkspace({
	activeTab,
	records,
	treatmentPlans,
	treatmentProgress = {},
	onUpdateTreatmentPlan,
	onAddTreatmentProgress,
}: PatientWorkspaceProps) {
	const { user } = useAuth();

	// Lọc dữ liệu theo Khách hàng hiện tại
	const patientName = user?.fullName || '';
	const patientRecords = records.filter(
		(record) => record.patient.fullName === patientName,
	);
	const patientTreatmentPlans = treatmentPlans.filter((plan) => {
		const record = records.find((r) => r.id === plan.recordId);
		return record?.patient.fullName === patientName;
	});

	// Render content based on activeTab
	const renderContent = () => {
		switch (activeTab) {
			case 'patient-treatment':
				return (
					<PatientTreatmentPlans
						treatmentPlans={patientTreatmentPlans}
						records={patientRecords}
						treatmentProgress={treatmentProgress}
						onUpdateTreatmentPlan={onUpdateTreatmentPlan}
						onAddTreatmentProgress={onAddTreatmentProgress}
					/>
				);
			default:
				return (
					<div className="text-center py-12 text-gray-500">
						<User className="h-12 w-12 mx-auto mb-3 text-gray-300" />
						<p>Chọn một menu để bắt đầu</p>
					</div>
				);
		}
	};

	return (
		<div className="space-y-6 h-full overflow-y-auto">
			<div className="flex items-center justify-between">
				<div>
					<h2 className="text-2xl font-bold flex items-center gap-2">
						<User className="h-6 w-6 text-blue-600" />
						Không gian Khách hàng
					</h2>
					<p className="text-gray-600 mt-1">Quản lý phác đồ điều trị của bạn</p>
				</div>
			</div>

			{renderContent()}
		</div>
	);
}
