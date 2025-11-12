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
import { Checkbox } from './ui/checkbox';
import { toast } from 'sonner';
import { MedicalRecord, TreatmentPlan } from '../types';
import { Stethoscope, ClipboardList, Trash2 } from 'lucide-react';
import { usePagination } from '../hooks/usePagination';
import { PaginationControls } from './PaginationControls';

interface DoctorWorkspaceProps {
	records: MedicalRecord[];
	treatmentPlans: TreatmentPlan[];
	onUpdateRecord: (recordId: string, updates: Partial<MedicalRecord>) => void;
	onCreateTreatmentPlan: (
		plan: Omit<TreatmentPlan, 'id' | 'createdAt' | 'createdBy'>,
	) => void;
	onUpdateTreatmentPlan: (plan: TreatmentPlan) => void;
	onCreateTestOrder?: (
		recordId: string,
		testType: any,
		testName: string,
	) => void;
	onDeleteRecord?: (id: string) => void;
	onExamineRecord?: (recordId: string) => void;
}

export function DoctorWorkspace({
	records,
	treatmentPlans,
	onUpdateRecord,
	onCreateTreatmentPlan,
	onUpdateTreatmentPlan,
	onCreateTestOrder,
	onDeleteRecord,
	onExamineRecord,
}: DoctorWorkspaceProps) {
	const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

	const pendingRecords = records.filter(
		(r) => r.status === 'PENDING_EXAMINATION' || r.status === 'IN_EXAMINATION',
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

		// Đếm số record có cùng ngày và có createdAt sớm hơn hoặc bằng
		const sameDayRecords = records.filter((r) => {
			const rDate = r.appointmentTime
				? new Date(r.appointmentTime).toDateString()
				: new Date(r.createdAt).toDateString();
			return rDate === recordDate;
		});

		// Sắp xếp theo thời gian tạo và tìm vị trí
		const sortedRecords = sameDayRecords.sort((a, b) => {
			const aTime = a.appointmentTime
				? new Date(a.appointmentTime).getTime()
				: new Date(a.createdAt).getTime();
			const bTime = b.appointmentTime
				? new Date(b.appointmentTime).getTime()
				: new Date(b.createdAt).getTime();
			return aTime - bTime;
		});

		const order = sortedRecords.findIndex((r) => r.id === record.id) + 1;
		return order;
	};

	const handleOpenExamination = (record: MedicalRecord) => {
		if (onExamineRecord) {
			onExamineRecord(record.id);
		}
	};

	const handleToggleSelect = (id: string) => {
		const newSelected = new Set(selectedItems);
		if (newSelected.has(id)) {
			newSelected.delete(id);
		} else {
			newSelected.add(id);
		}
		setSelectedItems(newSelected);
	};

	const handleSelectAll = (checked: boolean) => {
		if (checked) {
			setSelectedItems(new Set(paginatedRecords.map((item) => item.id)));
		} else {
			setSelectedItems(new Set());
		}
	};

	const handleDeleteSelected = () => {
		if (!onDeleteRecord) return;

		if (selectedItems.size === 0) {
			toast.error('Vui lòng chọn ít nhất một mục để xóa');
			return;
		}

		if (
			confirm(
				`Bạn có chắc chắn muốn xóa ${selectedItems.size} khách hàng đã chọn?`,
			)
		) {
			selectedItems.forEach((id) => {
				onDeleteRecord(id);
			});
			setSelectedItems(new Set());
			toast.success(`Đã xóa ${selectedItems.size} khách hàng thành công`);
		}
	};

	const isAllSelected =
		paginatedRecords.length > 0 &&
		paginatedRecords.every((item) => selectedItems.has(item.id));
	const isIndeterminate =
		selectedItems.size > 0 && selectedItems.size < paginatedRecords.length;

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
					{onDeleteRecord && selectedItems.size > 0 && (
						<Button
							onClick={handleDeleteSelected}
							variant="destructive"
							className="bg-delete-btn hover:bg-red-700 text-white border-red-600"
						>
							<Trash2 className="h-4 w-4 mr-2" />
							Xóa ({selectedItems.size})
						</Button>
					)}
				</div>
			</div>

			<Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
				<CardContent className="pt-6">
					<div className="space-y-4">
						{totalItems === 0 ? (
							<div className="text-center py-12 text-gray-500">
								<div className="flex flex-col items-center gap-3">
									<ClipboardList className="h-12 w-12 text-gray-300" />
									<p>Không có khách hàng nào cần khám</p>
								</div>
							</div>
						) : (
							<>
								<div className="rounded-xl border border-gray-200 overflow-hidden">
									<Table>
										<TableHeader className="sticky top-0 z-10 bg-gray-50/95 backdrop-blur-sm">
											<TableRow className="bg-gray-50/80 hover:bg-gray-50">
												{onDeleteRecord && (
													<TableHead className="w-12">
														<Checkbox
															checked={isAllSelected}
															onCheckedChange={handleSelectAll}
															ref={(el) => {
																if (el) {
																	el.indeterminate = isIndeterminate;
																}
															}}
														/>
													</TableHead>
												)}
												<TableHead className="w-16 text-center">STT</TableHead>
												<TableHead className="w-[120px]">
													Mã khách hàng
												</TableHead>
												<TableHead>Khách hàng</TableHead>
												<TableHead>Lý do khám</TableHead>
												<TableHead className="text-right w-[200px]">
													Thao tác
												</TableHead>
											</TableRow>
										</TableHeader>
										<TableBody>
											{paginatedRecords.map((record, index) => (
												<TableRow
													key={record.id}
													className="transition-colors hover:bg-gray-50/80"
												>
													{onDeleteRecord && (
														<TableCell>
															<Checkbox
																checked={selectedItems.has(record.id)}
																onCheckedChange={() =>
																	handleToggleSelect(record.id)
																}
															/>
														</TableCell>
													)}
													<TableCell className="text-center text-gray-500">
														{startIndex + index}
													</TableCell>
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
													<TableCell className="text-right">
														<div className="flex gap-2 justify-end">
															<Button
																size="sm"
																variant="outline"
																onClick={() => handleOpenExamination(record)}
																className="flex items-center gap-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white hover:text-black"
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
		</div>
	);
}
