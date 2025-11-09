import React, { useState } from 'react';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from './ui/card';
import { Button } from './ui/button';
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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from './ui/select';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Checkbox } from './ui/checkbox';
import { toast } from 'sonner@2.0.3';
import { MedicalRecord, TreatmentPlan, TestType } from '../types';
import {
	Stethoscope,
	ClipboardList,
	Pill,
	FlaskConical,
	Plus,
	Trash2,
	ChevronDown,
} from 'lucide-react';
import { usePagination } from '../hooks/usePagination';
import { PaginationControls } from './PaginationControls';
import { TreatmentPlanManager } from './TreatmentPlanManager';

interface DoctorWorkspaceProps {
	records: MedicalRecord[];
	treatmentPlans: TreatmentPlan[];
	onUpdateRecord: (recordId: string, updates: Partial<MedicalRecord>) => void;
	onCreateTreatmentPlan: (
		plan: Omit<TreatmentPlan, 'id' | 'createdAt' | 'createdBy'>,
	) => void;
	onUpdateTreatmentPlan: (plan: TreatmentPlan) => void;
	onCreateTestOrder: (
		recordId: string,
		testType: TestType,
		testName: string,
	) => void;
}

const testTypeLabels: Record<TestType, string> = {
	blood: 'Xét nghiệm máu',
	urine: 'Xét nghiệm nước tiểu',
	xray: 'Chụp X-quang',
	ultrasound: 'Siêu âm',
	ct: 'Chụp CT',
	mri: 'Chụp MRI',
};

const testNamesByType: Record<TestType, string[]> = {
	blood: [
		'Xét nghiệm máu tổng quát',
		'Xét nghiệm sinh hóa máu',
		'Xét nghiệm công thức máu',
		'Xét nghiệm đường huyết',
		'Xét nghiệm chức năng gan',
		'Xét nghiệm chức năng thận',
		'Xét nghiệm lipid máu',
		'Xét nghiệm đông máu',
		'Xét nghiệm miễn dịch',
		'Xét nghiệm viêm gan',
	],
	urine: [
		'Xét nghiệm nước tiểu tổng quát',
		'Xét nghiệm tế bào nước tiểu',
		'Xét nghiệm vi khuẩn nước tiểu',
		'Xét nghiệm protein nước tiểu',
		'Xét nghiệm đường nước tiểu',
	],
	xray: [
		'Chụp X-quang ngực',
		'Chụp X-quang xương khớp',
		'Chụp X-quang cột sống',
		'Chụp X-quang sọ não',
		'Chụp X-quang bụng',
		'Chụp X-quang răng',
	],
	ultrasound: [
		'Siêu âm bụng',
		'Siêu âm tim',
		'Siêu âm tuyến giáp',
		'Siêu âm vú',
		'Siêu âm phụ khoa',
		'Siêu âm sản khoa',
		'Siêu âm tuyến tiền liệt',
		'Siêu âm mạch máu',
	],
	ct: [
		'Chụp CT đầu',
		'Chụp CT ngực',
		'Chụp CT bụng',
		'Chụp CT xương khớp',
		'Chụp CT mạch máu',
		'Chụp CT toàn thân',
	],
	mri: [
		'Chụp MRI não',
		'Chụp MRI cột sống',
		'Chụp MRI khớp',
		'Chụp MRI bụng',
		'Chụp MRI tim',
		'Chụp MRI toàn thân',
	],
};

export function DoctorWorkspace({
	records,
	treatmentPlans,
	onUpdateRecord,
	onCreateTreatmentPlan,
	onUpdateTreatmentPlan,
	onCreateTestOrder,
}: DoctorWorkspaceProps) {
	const [showTreatmentPlanDialog, setShowTreatmentPlanDialog] = useState(false);
	const [selectedRecordForTreatment, setSelectedRecordForTreatment] =
		useState<MedicalRecord | null>(null);
	const [testOrders, setTestOrders] = useState<
		Array<{ id: string; testType: TestType | ''; testNames: string[] }>
	>([{ id: '1', testType: '', testNames: [] }]);

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

	const handleOpenTreatmentDialog = (record: MedicalRecord) => {
		setSelectedRecordForTreatment(record);
		setTestOrders([{ id: '1', testType: '', testNames: [] }]);
		setShowTreatmentPlanDialog(true);
	};

	const handleAddTestOrderRow = () => {
		const newId = String(Date.now());
		setTestOrders([...testOrders, { id: newId, testType: '', testNames: [] }]);
	};

	const handleRemoveTestOrderRow = (id: string) => {
		if (testOrders.length > 1) {
			setTestOrders(testOrders.filter((order) => order.id !== id));
		}
	};

	const handleUpdateTestOrder = (
		id: string,
		field: 'testType',
		value: string,
	) => {
		setTestOrders(
			testOrders.map((order) => {
				if (order.id === id) {
					// Khi thay đổi loại xét nghiệm, reset tên xét nghiệm
					return { ...order, testType: value as TestType, testNames: [] };
				}
				return order;
			}),
		);
	};

	const handleToggleTestName = (orderId: string, testName: string) => {
		setTestOrders(
			testOrders.map((order) => {
				if (order.id === orderId) {
					const isSelected = order.testNames.includes(testName);
					if (isSelected) {
						return {
							...order,
							testNames: order.testNames.filter((name) => name !== testName),
						};
					}
					return {
						...order,
						testNames: [...order.testNames, testName],
					};
				}
				return order;
			}),
		);
	};

	const handleCreateAllTestOrders = () => {
		if (!selectedRecordForTreatment) return;

		let totalOrders = 0;
		testOrders.forEach((order) => {
			if (order.testType && order.testNames.length > 0) {
				order.testNames.forEach((testName) => {
					onCreateTestOrder(
						selectedRecordForTreatment.id,
						order.testType as TestType,
						testName.trim(),
					);
					totalOrders++;
				});
			}
		});

		if (totalOrders === 0) {
			toast.error('Vui lòng chọn ít nhất một tên chỉ định');
			return;
		}

		toast.success(`Đã thêm ${totalOrders} chỉ định xét nghiệm`);
		setTestOrders([{ id: '1', testType: '', testNames: [] }]);
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
													className="transition-colors hover:bg-gray-50/80"
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
																onClick={() =>
																	handleOpenTreatmentDialog(record)
																}
																className="flex items-center gap-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white"
															>
																Bắt đầu khám
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
											<Stethoscope className="h-5 w-5" />
											Khám bệnh
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

									{/* Thêm chỉ định xét nghiệm */}
									<Card className="border border-gray-200">
										<CardHeader>
											<CardTitle className="flex items-center gap-2 text-lg">
												<FlaskConical className="h-5 w-5 text-blue-600" />
												Chỉ định
											</CardTitle>
										</CardHeader>
										<CardContent>
											<div className="space-y-4">
												<div className="space-y-3">
													{testOrders.map((order, index) => (
														<div
															key={order.id}
															className="flex flex-col md:flex-row gap-3 items-end"
														>
															<div className="flex-1 min-w-0 space-y-2">
																<Label htmlFor={`testType-${order.id}`}>
																	Loại xét nghiệm
																</Label>
																<Select
																	value={order.testType}
																	onValueChange={(value) =>
																		handleUpdateTestOrder(
																			order.id,
																			'testType',
																			value,
																		)
																	}
																>
																	<SelectTrigger id={`testType-${order.id}`}>
																		<SelectValue placeholder="Chọn loại xét nghiệm" />
																	</SelectTrigger>
																	<SelectContent>
																		{Object.entries(testTypeLabels).map(
																			([value, label]) => (
																				<SelectItem key={value} value={value}>
																					{label}
																				</SelectItem>
																			),
																		)}
																	</SelectContent>
																</Select>
															</div>

															<div className="flex-1 min-w-0 space-y-2">
																<Label htmlFor={`testName-${order.id}`}>
																	Tên chỉ định
																</Label>
																<Popover>
																	<PopoverTrigger asChild>
																		<Button
																			variant="outline"
																			className="w-full justify-between text-left font-normal"
																			disabled={!order.testType}
																		>
																			<span className="truncate">
																				{order.testNames.length === 0
																					? order.testType
																						? 'Chọn tên chỉ định'
																						: 'Chọn loại xét nghiệm trước'
																					: order.testNames.length === 1
																					? order.testNames[0]
																					: `Đã chọn ${order.testNames.length} chỉ định`}
																			</span>
																			<ChevronDown className="h-4 w-4 opacity-50 ml-2 flex-shrink-0" />
																		</Button>
																	</PopoverTrigger>
																	<PopoverContent
																		className="w-[400px] p-0"
																		align="start"
																	>
																		<div className="max-h-[300px] overflow-y-auto p-2">
																			{order.testType ? (
																				<div className="space-y-1">
																					{testNamesByType[
																						order.testType as TestType
																					]?.map((name) => {
																						const isSelected =
																							order.testNames.includes(name);
																						return (
																							<label
																								key={name}
																								className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-all duration-200 ${
																									isSelected
																										? 'bg-blue-50 border border-blue-200 hover:bg-blue-100'
																										: 'hover:bg-gray-50 border border-transparent'
																								}`}
																							>
																								<Checkbox
																									checked={isSelected}
																									onCheckedChange={() =>
																										handleToggleTestName(
																											order.id,
																											name,
																										)
																									}
																									className="mr-2 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
																								/>
																								<span
																									className={`text-sm flex-1 transition-colors ${
																										isSelected
																											? 'text-blue-900 font-medium'
																											: 'text-gray-700'
																									}`}
																								>
																									{name}
																								</span>
																							</label>
																						);
																					})}
																				</div>
																			) : (
																				<div className="p-4 text-center text-gray-500 text-sm">
																					Vui lòng chọn loại xét nghiệm trước
																				</div>
																			)}
																		</div>
																	</PopoverContent>
																</Popover>
															</div>

															<Button
																type="button"
																variant="outline"
																size="icon"
																onClick={() =>
																	handleRemoveTestOrderRow(order.id)
																}
																disabled={testOrders.length === 1}
																className="h-10 w-10 flex-shrink-0 text-red-600 hover:text-red-700 hover:bg-red-50 disabled:opacity-50"
																title="Xóa dòng"
															>
																<Trash2 className="h-4 w-4" />
															</Button>
														</div>
													))}
												</div>

												<button
													type="button"
													onClick={handleAddTestOrderRow}
													className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1 mt-2 transition-colors"
												>
													<Plus className="h-4 w-4" />
													Thêm chỉ định
												</button>
											</div>
										</CardContent>
									</Card>

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
											setTestOrders([{ id: '1', testType: '', testNames: [] }]);
										}}
										onUpdate={(plan) => {
											onUpdateTreatmentPlan(plan);
											setShowTreatmentPlanDialog(false);
											setSelectedRecordForTreatment(null);
											setTestOrders([{ id: '1', testType: '', testNames: [] }]);
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
