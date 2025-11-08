import React, { useState } from 'react';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from './ui/card';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
} from './ui/dialog';
import { Label } from './ui/label';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from './ui/select';
import { toast } from 'sonner@2.0.3';
import { MedicalRecord, TestType, TreatmentPlan } from '../types';
import {
	Stethoscope,
	ClipboardList,
	Plus,
	Pill,
	ArrowLeft,
} from 'lucide-react';
import { usePagination } from '../hooks/usePagination';
import { PaginationControls } from './PaginationControls';
import { TreatmentPlanManager } from './TreatmentPlanManager';

interface DoctorWorkspaceProps {
	records: MedicalRecord[];
	treatmentPlans: TreatmentPlan[];
	onUpdateRecord: (recordId: string, updates: Partial<MedicalRecord>) => void;
	onCreateTestOrder: (
		recordId: string,
		testType: TestType,
		testName: string,
	) => void;
	onCreateTreatmentPlan: (
		plan: Omit<TreatmentPlan, 'id' | 'createdAt' | 'createdBy'>,
	) => void;
	onUpdateTreatmentPlan: (plan: TreatmentPlan) => void;
}

const testTypes: { value: TestType; label: string; examples: string[] }[] = [
	{
		value: 'blood',
		label: 'Xét nghiệm máu',
		examples: ['Công thức máu', 'Sinh hóa máu', 'Đông máu'],
	},
	{
		value: 'urine',
		label: 'Xét nghiệm nước tiểu',
		examples: ['Tổng phân tích nước tiểu', 'Vi sinh nước tiểu'],
	},
	{
		value: 'xray',
		label: 'Chụp X-quang',
		examples: ['X-quang phổi', 'X-quang xương khớp'],
	},
	{
		value: 'ultrasound',
		label: 'Siêu âm',
		examples: ['Siêu âm bụng', 'Siêu âm tim'],
	},
	{ value: 'ct', label: 'Chụp CT', examples: ['CT não', 'CT ngực'] },
	{ value: 'mri', label: 'Chụp MRI', examples: ['MRI não', 'MRI cột sống'] },
];

export function DoctorWorkspace({
	records,
	treatmentPlans,
	onUpdateRecord,
	onCreateTestOrder,
	onCreateTreatmentPlan,
	onUpdateTreatmentPlan,
}: DoctorWorkspaceProps) {
	const [viewMode, setViewMode] = useState<'list' | 'examination'>('list');
	const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(
		null,
	);
	const [diagnosis, setDiagnosis] = useState('');
	const [showTestDialog, setShowTestDialog] = useState(false);
	const [selectedTestType, setSelectedTestType] = useState<TestType>('blood');
	const [selectedTestName, setSelectedTestName] = useState('');
	const [showTreatmentPlanDialog, setShowTreatmentPlanDialog] = useState(false);
	const [selectedRecordForTreatment, setSelectedRecordForTreatment] =
		useState<MedicalRecord | null>(null);

	const pendingRecords = records.filter(
		(r) =>
			r.status === 'PENDING_EXAMINATION' ||
			r.status === 'IN_EXAMINATION' ||
			r.status === 'WAITING_DOCTOR_REVIEW',
	);

	const [itemsPerPage, setItemsPerPage] = useState(10);
	const {
		currentPage,
		totalPages,
		paginatedData: paginatedRecords,
		totalItems,
		startIndex,
		endIndex,
		goToPage,
	} = usePagination({
		data: pendingRecords,
		itemsPerPage,
	});

	const handleStartExamination = (record: MedicalRecord) => {
		setSelectedRecord(record);
		setDiagnosis(record.diagnosis || '');
		onUpdateRecord(record.id, { status: 'IN_EXAMINATION' });
		setViewMode('examination');
		toast.info('Bắt đầu khám bệnh');
	};

	const handleBackToList = () => {
		setViewMode('list');
		// Giữ selectedRecord để có thể quay lại tiếp tục khám
	};

	const handleSaveDiagnosis = () => {
		if (!selectedRecord) return;

		onUpdateRecord(selectedRecord.id, {
			diagnosis,
			updatedAt: new Date().toISOString(),
		});

		toast.success('Đã lưu chẩn đoán');
	};

	const handleAddTest = () => {
		if (!selectedRecord || !selectedTestName) {
			toast.error('Vui lòng chọn loại xét nghiệm');
			return;
		}

		onCreateTestOrder(selectedRecord.id, selectedTestType, selectedTestName);
		onUpdateRecord(selectedRecord.id, { status: 'WAITING_TESTS' });

		setShowTestDialog(false);
		setSelectedTestName('');

		toast.success('Đã tạo chỉ định xét nghiệm');
	};

	const handleCompleteExamination = () => {
		if (!selectedRecord) return;

		if (!diagnosis.trim()) {
			toast.error('Vui lòng nhập chẩn đoán');
			return;
		}

		onUpdateRecord(selectedRecord.id, {
			diagnosis,
			status: 'COMPLETED_EXAMINATION',
			updatedAt: new Date().toISOString(),
		});

		setSelectedRecord(null);
		setDiagnosis('');
		setViewMode('list');

		toast.success('Hoàn thành khám bệnh');
	};

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleString('vi-VN');
	};

	// Render Examination View
	if (viewMode === 'examination' && selectedRecord) {
		return (
			<div className="space-y-6 h-full overflow-y-auto">
				{/* Header with Back Button */}
				<Card>
					<CardHeader>
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-3">
								<Button
									variant="outline"
									size="sm"
									onClick={handleBackToList}
									className="flex items-center gap-2"
								>
									<ArrowLeft className="h-4 w-4" />
									Quay lại danh sách
								</Button>
								<div>
									<CardTitle className="text-2xl font-bold flex items-center gap-2">
										<ClipboardList className="h-6 w-6 text-blue-600" />
										Khám bệnh - {selectedRecord.patient.fullName}
									</CardTitle>
									<CardDescription className="mt-1">
										Mã hồ sơ: <strong>{selectedRecord.receiveCode}</strong> -
										Bác sĩ:{' '}
										<strong>
											{selectedRecord.assignedDoctor?.name || 'Chưa gán'}
										</strong>
									</CardDescription>
								</div>
							</div>
						</div>
					</CardHeader>
				</Card>

				<div className="space-y-6">
					{/* Patient Info */}
					<Card>
						<CardHeader>
							<CardTitle className="text-base">Thông tin bệnh nhân</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="grid grid-cols-2 gap-4">
								<div>
									<div className="text-sm text-gray-600">Họ và tên</div>
									<div className="font-medium">
										{selectedRecord.patient.fullName}
									</div>
								</div>
								<div>
									<div className="text-sm text-gray-600">Số điện thoại</div>
									<div>{selectedRecord.patient.phoneNumber}</div>
								</div>
								<div>
									<div className="text-sm text-gray-600">Ngày sinh</div>
									<div>
										{new Date(
											selectedRecord.patient.dateOfBirth,
										).toLocaleDateString('vi-VN')}
									</div>
								</div>
								<div>
									<div className="text-sm text-gray-600">Giới tính</div>
									<div>
										{selectedRecord.patient.gender === 'male'
											? 'Nam'
											: selectedRecord.patient.gender === 'female'
											? 'Nữ'
											: 'Khác'}
									</div>
								</div>
								<div>
									<div className="text-sm text-gray-600">Lý do khám</div>
									<div>{selectedRecord.reason || 'Không có'}</div>
								</div>
								<div>
									<div className="text-sm text-gray-600">Dịch vụ yêu cầu</div>
									<div className="flex flex-wrap gap-1 mt-1">
										{selectedRecord.requestedServices.map((service, index) => (
											<Badge key={index} variant="outline" className="text-xs">
												{service}
											</Badge>
										))}
									</div>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Diagnosis */}
					<Card>
						<CardHeader>
							<CardTitle className="text-base">Chẩn đoán</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="space-y-2">
								<Label>Chẩn đoán</Label>
								<Textarea
									value={diagnosis}
									onChange={(e) => setDiagnosis(e.target.value)}
									placeholder="Nhập chẩn đoán của bác sĩ..."
									rows={4}
								/>
							</div>
						</CardContent>
					</Card>

					{/* Treatment Plan Manager */}
					<TreatmentPlanManager
						recordId={selectedRecord.id}
						doctorName={selectedRecord.assignedDoctor?.name || 'Bác sĩ'}
						treatmentPlan={treatmentPlans.find(
							(tp) => tp.recordId === selectedRecord.id,
						)}
						onSave={onCreateTreatmentPlan}
						onUpdate={onUpdateTreatmentPlan}
					/>

					{/* Actions */}
					<Card>
						<CardContent className="pt-6">
							<div className="flex gap-3 justify-end">
								<Button onClick={handleSaveDiagnosis} variant="outline">
									Lưu chẩn đoán
								</Button>
								<Button
									onClick={() => setShowTestDialog(true)}
									variant="outline"
								>
									<Plus className="h-4 w-4 mr-2" />
									Chỉ định xét nghiệm
								</Button>
								<Button
									onClick={handleCompleteExamination}
									className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
								>
									Hoàn thành khám
								</Button>
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Test Dialog - Keep as dialog for now */}
				<Dialog open={showTestDialog} onOpenChange={setShowTestDialog}>
					<DialogContent className="!max-w-[99vw] !w-[99vw] max-h-[98vh] overflow-y-auto p-6">
						<DialogHeader>
							<DialogTitle>Chỉ định xét nghiệm / hình ảnh</DialogTitle>
							<DialogDescription>
								Chọn loại và tên xét nghiệm cần thực hiện cho bệnh nhân
							</DialogDescription>
						</DialogHeader>
						<div className="space-y-4">
							<div className="space-y-2">
								<Label>Loại xét nghiệm</Label>
								<Select
									value={selectedTestType}
									onValueChange={(value: TestType) => {
										setSelectedTestType(value);
										setSelectedTestName('');
									}}
								>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										{testTypes.map((type) => (
											<SelectItem key={type.value} value={type.value}>
												{type.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>

							<div className="space-y-2">
								<Label>Tên xét nghiệm</Label>
								<Select
									value={selectedTestName}
									onValueChange={setSelectedTestName}
								>
									<SelectTrigger>
										<SelectValue placeholder="Chọn xét nghiệm" />
									</SelectTrigger>
									<SelectContent>
										{testTypes
											.find((t) => t.value === selectedTestType)
											?.examples.map((example) => (
												<SelectItem key={example} value={example}>
													{example}
												</SelectItem>
											))}
									</SelectContent>
								</Select>
							</div>

							<div className="flex gap-3">
								<Button onClick={handleAddTest} className="flex-1">
									Tạo chỉ định
								</Button>
								<Button
									variant="outline"
									onClick={() => setShowTestDialog(false)}
								>
									Hủy
								</Button>
							</div>
						</div>
					</DialogContent>
				</Dialog>

				{/* Treatment Plan Dialog - Keep as dialog for now */}
				<Dialog
					open={showTreatmentPlanDialog}
					onOpenChange={setShowTreatmentPlanDialog}
				>
					<DialogContent className="!max-w-[99vw] !w-[99vw] max-h-[98vh] overflow-y-auto p-6">
						<DialogHeader>
							<DialogTitle className="flex items-center gap-2">
								<Pill className="h-5 w-5" />
								Phác đồ điều trị
							</DialogTitle>
							<DialogDescription>
								{selectedRecordForTreatment && (
									<span>
										Bệnh nhân:{' '}
										<strong>
											{selectedRecordForTreatment.patient.fullName}
										</strong>{' '}
										- Mã hồ sơ:{' '}
										<strong>{selectedRecordForTreatment.receiveCode}</strong>
									</span>
								)}
							</DialogDescription>
						</DialogHeader>
						{selectedRecordForTreatment && (
							<div className="mt-4">
								<TreatmentPlanManager
									recordId={selectedRecordForTreatment.id}
									doctorName={
										selectedRecordForTreatment.assignedDoctor?.name || 'Bác sĩ'
									}
									treatmentPlan={treatmentPlans.find(
										(tp) => tp.recordId === selectedRecordForTreatment.id,
									)}
									onSave={(plan) => {
										onCreateTreatmentPlan(plan);
										setShowTreatmentPlanDialog(false);
										setSelectedRecordForTreatment(null);
									}}
									onUpdate={(plan) => {
										onUpdateTreatmentPlan(plan);
										setShowTreatmentPlanDialog(false);
										setSelectedRecordForTreatment(null);
									}}
									hideCard={true}
								/>
							</div>
						)}
					</DialogContent>
				</Dialog>
			</div>
		);
	}

	// Render List View
	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<CardTitle className="text-2xl font-bold">
						<div className="flex items-center gap-2">
							<Stethoscope className="h-5 w-5" />
							Không gian làm việc - Bác sĩ
						</div>
					</CardTitle>
					<CardDescription>
						Quản lý khám bệnh và chỉ định xét nghiệm
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						{totalItems === 0 ? (
							<div className="text-center py-8 text-gray-500">
								Không có hồ sơ nào cần khám
							</div>
						) : (
							<>
								<div className="space-y-3">
									{paginatedRecords.map((record) => (
										<div
											key={record.id}
											className={`p-4 border rounded-lg ${
												selectedRecord?.id === record.id
													? 'border-blue-500 bg-blue-50'
													: 'border-gray-200'
											}`}
										>
											<div className="flex justify-between items-start">
												<div className="space-y-2">
													<div className="flex items-center gap-3">
														<span>{record.receiveCode}</span>
														<Badge className="bg-blue-100 text-blue-800">
															{record.patient.fullName}
														</Badge>
													</div>
													<div className="text-sm text-gray-600">
														<div>Lý do: {record.reason || 'Không có'}</div>
														<div>
															Dịch vụ: {record.requestedServices.join(', ')}
														</div>
														<div>Thời gian: {formatDate(record.createdAt)}</div>
													</div>
												</div>
												<div className="flex gap-2">
													<Button
														size="sm"
														variant="outline"
														onClick={() => {
															setSelectedRecordForTreatment(record);
															setShowTreatmentPlanDialog(true);
														}}
														className="flex items-center gap-1"
													>
														<Pill className="h-3 w-3" />
														Phác đồ
													</Button>
													<Button
														size="sm"
														onClick={() => handleStartExamination(record)}
														disabled={selectedRecord?.id === record.id}
													>
														{selectedRecord?.id === record.id
															? 'Đang khám'
															: 'Bắt đầu khám'}
													</Button>
												</div>
											</div>
										</div>
									))}
								</div>
								<PaginationControls
									currentPage={currentPage}
									totalPages={totalPages}
									totalItems={totalItems}
									itemsPerPage={itemsPerPage}
									startIndex={startIndex}
									endIndex={endIndex}
									onPageChange={goToPage}
									onItemsPerPageChange={setItemsPerPage}
								/>
							</>
						)}
					</div>
				</CardContent>
			</Card>

			{/* Test Dialog */}
			<Dialog open={showTestDialog} onOpenChange={setShowTestDialog}>
				<DialogContent className="!max-w-[99vw] !w-[99vw] max-h-[98vh] overflow-y-auto p-6">
					<DialogHeader>
						<DialogTitle>Chỉ định xét nghiệm / hình ảnh</DialogTitle>
						<DialogDescription>
							Chọn loại và tên xét nghiệm cần thực hiện cho bệnh nhân
						</DialogDescription>
					</DialogHeader>
					<div className="space-y-4">
						<div className="space-y-2">
							<Label>Loại xét nghiệm</Label>
							<Select
								value={selectedTestType}
								onValueChange={(value: TestType) => {
									setSelectedTestType(value);
									setSelectedTestName('');
								}}
							>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{testTypes.map((type) => (
										<SelectItem key={type.value} value={type.value}>
											{type.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						<div className="space-y-2">
							<Label>Tên xét nghiệm</Label>
							<Select
								value={selectedTestName}
								onValueChange={setSelectedTestName}
							>
								<SelectTrigger>
									<SelectValue placeholder="Chọn xét nghiệm" />
								</SelectTrigger>
								<SelectContent>
									{testTypes
										.find((t) => t.value === selectedTestType)
										?.examples.map((example) => (
											<SelectItem key={example} value={example}>
												{example}
											</SelectItem>
										))}
								</SelectContent>
							</Select>
						</div>

						<div className="flex gap-3">
							<Button onClick={handleAddTest} className="flex-1">
								Tạo chỉ định
							</Button>
							<Button
								variant="outline"
								onClick={() => setShowTestDialog(false)}
							>
								Hủy
							</Button>
						</div>
					</div>
				</DialogContent>
			</Dialog>

			{/* Treatment Plan Dialog */}
			<Dialog
				open={showTreatmentPlanDialog}
				onOpenChange={setShowTreatmentPlanDialog}
				className="!max-w-[99vw] !w-[99vw] max-h-[98vh] overflow-y-auto p-6"
			>
				<DialogContent className="!max-w-[99vw] !w-[99vw] max-h-[98vh] overflow-y-auto p-6">
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2">
							<Pill className="h-5 w-5" />
							Phác đồ điều trị
						</DialogTitle>
						<DialogDescription>
							{selectedRecordForTreatment && (
								<span>
									Bệnh nhân:{' '}
									<strong>{selectedRecordForTreatment.patient.fullName}</strong>{' '}
									- Mã hồ sơ:{' '}
									<strong>{selectedRecordForTreatment.receiveCode}</strong>
								</span>
							)}
						</DialogDescription>
					</DialogHeader>
					{selectedRecordForTreatment && (
						<div className="mt-4">
							<TreatmentPlanManager
								recordId={selectedRecordForTreatment.id}
								doctorName={
									selectedRecordForTreatment.assignedDoctor?.name || 'Bác sĩ'
								}
								treatmentPlan={treatmentPlans.find(
									(tp) => tp.recordId === selectedRecordForTreatment.id,
								)}
								onSave={(plan) => {
									onCreateTreatmentPlan(plan);
									setShowTreatmentPlanDialog(false);
									setSelectedRecordForTreatment(null);
								}}
								onUpdate={(plan) => {
									onUpdateTreatmentPlan(plan);
									setShowTreatmentPlanDialog(false);
									setSelectedRecordForTreatment(null);
								}}
								hideCard={true}
							/>
						</div>
					)}
				</DialogContent>
			</Dialog>
		</div>
	);
}
