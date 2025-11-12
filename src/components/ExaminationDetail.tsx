import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { MedicalRecord, TreatmentPlan } from '../types';
import { Stethoscope, ArrowLeft } from 'lucide-react';
import { TreatmentPlanManager } from './TreatmentPlanManager';

interface ExaminationDetailProps {
	record: MedicalRecord;
	treatmentPlan?: TreatmentPlan;
	doctorName: string;
	onBack: () => void;
	onCreateTreatmentPlan: (
		plan: Omit<TreatmentPlan, 'id' | 'createdAt' | 'createdBy'>,
	) => void;
	onUpdateTreatmentPlan: (plan: TreatmentPlan) => void;
	getExaminationDate: (record: MedicalRecord) => string;
	getExaminationOrder: (record: MedicalRecord) => number;
}

export function ExaminationDetail({
	record,
	treatmentPlan,
	doctorName,
	onBack,
	onCreateTreatmentPlan,
	onUpdateTreatmentPlan,
	getExaminationDate,
	getExaminationOrder,
}: ExaminationDetailProps) {
	return (
		<div className="h-full flex flex-col">
			{/* Header với nút quay lại - Cố định */}
			<div className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
				{/* Nút quay lại - Tách riêng */}
				<div className="pb-3 pt-4 px-4 border-b border-gray-100">
					<Button
						variant="ghost"
						size="default"
						onClick={onBack}
						className="hover:bg-gray-100 flex items-center gap-2"
					>
						<ArrowLeft className="h-5 w-5" />
						Quay lại
					</Button>
				</div>
				{/* Thông tin khách hàng */}
				<div className="pb-4 pt-4 px-4">
					<div className="flex flex-wrap gap-4 text-gray-600">
						<span>
							Khách hàng:{' '}
							<strong className="text-blue-600 font-bold text-3xl">
								{record.patient.fullName}
							</strong>
						</span>
						<span>
							Mã khách hàng:{' '}
							<strong className="text-blue-600 font-bold text-3xl">
								{record.receiveCode}
							</strong>
						</span>
						<span>
							Ngày khám:{' '}
							<strong className="text-blue-600 font-bold text-3xl">
								{getExaminationDate(record)}
							</strong>
						</span>
						<span>
							Số thứ tự khám:{' '}
							<strong className="text-blue-600 font-bold text-3xl">
								{getExaminationOrder(record)}
							</strong>
						</span>
					</div>
				</div>
			</div>

			{/* Treatment Plan Manager - Có thể scroll */}
			<div className="flex-1 overflow-y-auto">
				<div className="py-6">
					<Card className="border border-gray-200">
						<CardContent>
							<TreatmentPlanManager
								recordId={record.id}
								doctorName={doctorName}
								treatmentPlan={treatmentPlan}
								onSave={(plan) => {
									onCreateTreatmentPlan(plan);
									onBack();
								}}
								onUpdate={(plan) => {
									onUpdateTreatmentPlan(plan);
									onBack();
								}}
								hideCard={true}
							/>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
