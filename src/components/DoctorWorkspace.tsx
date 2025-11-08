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
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from './ui/table';
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
import { Stethoscope, ClipboardList, Plus, Pill } from 'lucide-react';
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
	const [showExaminationDialog, setShowExaminationDialog] = useState(false);
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
		setShowExaminationDialog(true);
		toast.info('Bắt đầu khám bệnh');
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
		setShowExaminationDialog(false);

		toast.success('Hoàn thành khám bệnh');
	};

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleString('vi-VN');
	};

	// Render List View
	return (
		<div className="space-y-6 h-full overflow-y-auto">
			<div className="flex items-center justify-between">
				<div>
					<h2 className="text-2xl font-bold flex flex-col gap-2">
						<div className="flex items-center gap-2">
							<Stethoscope className="h-5 w-5" />
							Không gian làm việc - Bác sĩ
						</div>
						<p className="text-gray-600 mt-1">
							Quản lý khám bệnh và chỉ định xét nghiệm
						</p>
					</h2>
				</div>
				<div className="flex items-center gap-3">
					<div className="px-3 py-1.5 bg-white/80 backdrop-blur-sm rounded-lg border border-gray-200 shadow-sm">
						<span className="text-sm text-gray-600">Tổng:</span>
						<span className="text-sm ml-1">{totalItems}</span>
					</div>
				</div>
			</div>

			<Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
				<CardContent className="pt-6">
					<div className="space-y-4">
						{totalItems === 0 ? (
							<div className="text-center py-12 text-gray-500">
								<div className="flex flex-col items-center gap-3">
									<ClipboardList className="h-12 w-12 text-gray-300" />
									<p>Không có hồ sơ nào cần khám</p>
								</div>
							</div>
						) : (
							<>
								<div className="rounded-xl border border-gray-200 overflow-hidden">
									<Table>
										<TableHeader className="sticky top-0 z-10 bg-gray-50/95 backdrop-blur-sm">
											<TableRow className="bg-gray-50/80 hover:bg-gray-50">
												<TableHead className="w-[120px]">Mã hồ sơ</TableHead>
												<TableHead>Bệnh nhân</TableHead>
												<TableHead>Lý do khám</TableHead>
												<TableHead>Dịch vụ</TableHead>
												<TableHead className="text-right w-[200px]">
													Thao tác
												</TableHead>
											</TableRow>
										</TableHeader>
										<TableBody>
											{paginatedRecords.map((record) => (
												<TableRow
													key={record.id}
													className={`transition-colors ${
														selectedRecord?.id === record.id
															? 'bg-blue-50 hover:bg-blue-50'
															: 'hover:bg-gray-50/80'
													}`}
												>
													<TableCell>
														<span className="font-mono text-sm bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
															{record.receiveCode}
														</span>
													</TableCell>
													<TableCell>
														<Badge className="bg-blue-100 text-blue-800">
															{record.patient.fullName}
														</Badge>
													</TableCell>
													<TableCell>
														<span className="text-sm text-gray-600">
															{record.reason || 'Không có'}
														</span>
													</TableCell>
													<TableCell>
														<div className="text-sm text-gray-600">
															{record.requestedServices.slice(0, 2).join(', ')}
															{record.requestedServices.length > 2 && (
																<span className="text-xs text-gray-400">
																	{' '}
																	+{record.requestedServices.length - 2}
																</span>
															)}
														</div>
													</TableCell>
													<TableCell className="text-right">
														<div className="flex gap-2 justify-end">
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
																className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
															>
																{selectedRecord?.id === record.id
																	? 'Đang khám'
																	: 'Bắt đầu khám'}
															</Button>
														</div>
													</TableCell>
												</TableRow>
											))}
										</TableBody>
									</Table>
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

			{/* Examination Dialog */}
			<Dialog
				open={showExaminationDialog}
				onOpenChange={setShowExaminationDialog}
			>
				<DialogContent className="max-w-[95vw] lg:max-w-[90vw] xl:max-w-7xl max-h-[95vh] overflow-hidden p-0 gap-0 bg-gradient-to-br from-gray-50 to-white border-0 shadow-none">
					<div className="overflow-y-auto max-h-[95vh]">
						<div className="p-6">
							{selectedRecord && (
								<div className="space-y-6">
									{/* Header */}
									<DialogHeader>
										<DialogTitle className="flex items-center gap-2 text-2xl">
											<ClipboardList className="h-6 w-6 text-blue-600" />
											Khám bệnh - {selectedRecord.patient.fullName}
										</DialogTitle>
										<DialogDescription className="mt-2">
											Mã hồ sơ: <strong>{selectedRecord.receiveCode}</strong> -
											Bác sĩ:{' '}
											<strong>
												{selectedRecord.assignedDoctor?.name || 'Chưa gán'}
											</strong>
										</DialogDescription>
									</DialogHeader>

									{/* Patient Info */}
									<Card>
										<CardHeader>
											<CardTitle className="text-base">
												Thông tin bệnh nhân
											</CardTitle>
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
													<div className="text-sm text-gray-600">
														Số điện thoại
													</div>
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
													<div className="text-sm text-gray-600">
														Lý do khám
													</div>
													<div>{selectedRecord.reason || 'Không có'}</div>
												</div>
												<div>
													<div className="text-sm text-gray-600">
														Dịch vụ yêu cầu
													</div>
													<div className="flex flex-wrap gap-1 mt-1">
														{selectedRecord.requestedServices.map(
															(service, index) => (
																<Badge
																	key={index}
																	variant="outline"
																	className="text-xs"
																>
																	{service}
																</Badge>
															),
														)}
													</div>
												</div>
											</div>
										</CardContent>
									</Card>

									{/* Diagnosis */}
									<Card>
										<CardContent>
											<div className="space-y-2 mt-4">
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
										hideCard={true}
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
													className="hover:from-green-600 hover:to-emerald-700"
												>
													Hoàn thành khám
												</Button>
											</div>
										</CardContent>
									</Card>
								</div>
							)}
						</div>
					</div>
				</DialogContent>
			</Dialog>

			{/* Treatment Plan Dialog */}
			<Dialog
				open={showTreatmentPlanDialog}
				onOpenChange={setShowTreatmentPlanDialog}
			>
				<DialogContent className="max-w-[95vw] lg:max-w-[90vw] xl:max-w-7xl max-h-[95vh] overflow-hidden p-0 gap-0 bg-gradient-to-br from-gray-50 to-white border-0 shadow-none">
					<div className="overflow-y-auto max-h-[95vh]">
						<div className="p-6">
							{selectedRecordForTreatment && (
								<div className="space-y-6">
									{/* Header */}
									<DialogHeader>
										<DialogTitle className="flex items-center gap-2 text-2xl">
											<Pill className="h-6 w-6 text-blue-600" />
											Phác đồ điều trị
										</DialogTitle>
										<DialogDescription className="mt-2">
											Bệnh nhân:{' '}
											<strong>
												{selectedRecordForTreatment.patient.fullName}
											</strong>{' '}
											- Mã hồ sơ:{' '}
											<strong>{selectedRecordForTreatment.receiveCode}</strong>
										</DialogDescription>
									</DialogHeader>

									{/* Treatment Plan Manager */}
									<TreatmentPlanManager
										recordId={selectedRecordForTreatment.id}
										doctorName={
											selectedRecordForTreatment.assignedDoctor?.name ||
											'Bác sĩ'
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
						</div>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
}
