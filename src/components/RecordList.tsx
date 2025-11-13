import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from './ui/card';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from './ui/table';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from './ui/select';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
} from './ui/dialog';
import { MedicalRecord, RecordStatus } from '../types';
import {
	Search,
	Eye,
	FileText,
	Filter,
	Plus,
	Zap,
	Calendar,
	Clock,
	ClipboardList,
	Trash2,
	Download,
	Upload,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { motion, AnimatePresence } from 'motion/react';
import { ReceptionForm } from './ReceptionForm';
import { useAuth } from '../contexts/AuthContext';
import { usePagination } from '../hooks/usePagination';
import { PaginationControls } from './PaginationControls';
import { Checkbox } from './ui/checkbox';
import { toast } from 'sonner';

interface RecordListProps {
	records: MedicalRecord[];
	onViewRecord: (record: MedicalRecord) => void;
	onCreateRecord?: (
		record: Omit<
			MedicalRecord,
			'id' | 'receiveCode' | 'createdAt' | 'updatedAt'
		>,
	) => void;
	onDeleteRecord?: (id: string) => void;
}

const statusLabels: Record<RecordStatus, string> = {
	PENDING_CHECKIN: 'Chưa check-in',
	PENDING_EXAMINATION: 'Chờ khám',
	IN_EXAMINATION: 'Đang khám',
	COMPLETED_EXAMINATION: 'Hoàn thành',
};

const statusGradients: Record<RecordStatus, string> = {
	PENDING_CHECKIN: 'from-yellow-500 to-amber-500',
	PENDING_EXAMINATION: 'from-amber-500 to-orange-500',
	IN_EXAMINATION: 'from-blue-500 to-cyan-500',
	COMPLETED_EXAMINATION: 'from-emerald-500 to-teal-500',
};

export function RecordList({
	records,
	onViewRecord,
	onCreateRecord,
	onDeleteRecord,
}: RecordListProps) {
	const { user } = useAuth();
	const [searchTerm, setSearchTerm] = useState('');
	const [statusFilter, setStatusFilter] = useState<string>('all');
	const [showReceptionDialog, setShowReceptionDialog] = useState(false);
	const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

	const canCreateRecord = user && ['admin', 'receptionist'].includes(user.role);
	const canDeleteRecord =
		onDeleteRecord && user && ['admin', 'receptionist'].includes(user.role);

	const filteredRecords = records.filter((record) => {
		const matchesSearch =
			record.receiveCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
			record.patient.fullName
				.toLowerCase()
				.includes(searchTerm.toLowerCase()) ||
			record.patient.phoneNumber.includes(searchTerm);

		const matchesStatus =
			statusFilter === 'all' || record.status === statusFilter;

		return matchesSearch && matchesStatus;
	});

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
		data: filteredRecords,
		itemsPerPage,
	});

	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		return date.toLocaleDateString('vi-VN', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
		});
	};

	const handleCreateRecord = (
		record: Omit<
			MedicalRecord,
			'id' | 'receiveCode' | 'createdAt' | 'updatedAt'
		>,
	) => {
		if (onCreateRecord) {
			onCreateRecord(record);
			setShowReceptionDialog(false);
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

	// Export to Excel
	const handleExport = () => {
		try {
			// Chuẩn bị dữ liệu để export
			const exportData = filteredRecords.map((record) => ({
				'Mã khách hàng': record.receiveCode,
				'Họ tên': record.patient.fullName,
				'Số điện thoại': record.patient.phoneNumber,
				'Ngày sinh': record.patient.dateOfBirth || '',
				'Giới tính': record.patient.gender === 'male' ? 'Nam' : 'Nữ',
				'Địa chỉ': record.patient.address || '',
				'CCCD/CMND': record.patient.cccdNumber || '',
				'Bảo hiểm': record.patient.insurance || '',
				'Lý do khám': record.reason || '',
				'Trạng thái': statusLabels[record.status],
				'Ngày tiếp nhận': formatDate(record.createdAt),
			}));

			// Tạo workbook và worksheet
			const ws = XLSX.utils.json_to_sheet(exportData);
			const wb = XLSX.utils.book_new();
			XLSX.utils.book_append_sheet(wb, ws, 'Khách hàng');

			// Đặt độ rộng cột
			const colWidths = [
				{ wch: 18 }, // Mã khách hàng
				{ wch: 25 }, // Họ tên
				{ wch: 15 }, // Số điện thoại
				{ wch: 12 }, // Ngày sinh
				{ wch: 10 }, // Giới tính
				{ wch: 40 }, // Địa chỉ
				{ wch: 15 }, // CCCD/CMND
				{ wch: 20 }, // Bảo hiểm
				{ wch: 30 }, // Lý do khám
				{ wch: 20 }, // Trạng thái
				{ wch: 20 }, // Ngày tiếp nhận
			];
			ws['!cols'] = colWidths;

			// Xuất file
			const fileName = `Danh_sach_khach_hang_${
				new Date().toISOString().split('T')[0]
			}.xlsx`;
			XLSX.writeFile(wb, fileName);
			toast.success(`Đã xuất ${exportData.length} khách hàng ra file Excel`);
		} catch (error) {
			console.error('Lỗi khi xuất file Excel:', error);
			toast.error('Có lỗi xảy ra khi xuất file Excel');
		}
	};

	// Import from Excel
	const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (!file) return;

		if (!onCreateRecord) {
			toast.error('Không có quyền tạo khách hàng mới');
			event.target.value = '';
			return;
		}

		// Kiểm tra định dạng file
		const validExtensions = [
			'.xlsx',
			'.xls',
			'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
			'application/vnd.ms-excel',
		];
		const fileExtension = file.name.substring(file.name.lastIndexOf('.'));
		const isValidFile =
			validExtensions.includes(fileExtension) ||
			validExtensions.includes(file.type);

		if (!isValidFile) {
			toast.error('Vui lòng chọn file Excel (.xlsx hoặc .xls)');
			event.target.value = '';
			return;
		}

		const reader = new FileReader();
		reader.onload = (e) => {
			try {
				const data = new Uint8Array(e.target?.result as ArrayBuffer);
				const workbook = XLSX.read(data, { type: 'array' });
				const firstSheetName = workbook.SheetNames[0];
				const worksheet = workbook.Sheets[firstSheetName];
				const jsonData = XLSX.utils.sheet_to_json(worksheet, {
					header: 1,
					defval: '',
				}) as any[][];

				if (jsonData.length < 2) {
					toast.error('File Excel không có dữ liệu hoặc thiếu header');
					event.target.value = '';
					return;
				}

				// Lấy header (dòng đầu tiên)
				const headers = jsonData[0].map((h: any) =>
					String(h).toLowerCase().trim(),
				);

				// Mapping header tiếng Việt sang field name
				const headerMap: Record<string, string> = {
					'mã khách hàng': 'receiveCode',
					'họ tên': 'fullName',
					'số điện thoại': 'phoneNumber',
					'ngày sinh': 'dateOfBirth',
					'giới tính': 'gender',
					'địa chỉ': 'address',
					'cccd/cmnd': 'cccdNumber',
					'bảo hiểm': 'insurance',
					'lý do khám': 'reason',
					'trạng thái': 'status',
				};

				// Tìm index của các cột cần thiết
				const fieldIndexes: Record<string, number> = {};
				headers.forEach((header, index) => {
					const field = headerMap[header];
					if (field) {
						fieldIndexes[field] = index;
					}
				});

				// Kiểm tra các trường bắt buộc
				if (!fieldIndexes['fullName'] || !fieldIndexes['phoneNumber']) {
					toast.error(
						'File Excel thiếu các cột bắt buộc: Họ tên và Số điện thoại',
					);
					event.target.value = '';
					return;
				}

				// Xử lý dữ liệu từ dòng 2 trở đi
				let successCount = 0;
				let errorCount = 0;
				const errors: string[] = [];

				for (let i = 1; i < jsonData.length; i++) {
					const row = jsonData[i];
					if (!row || row.every((cell) => !cell)) continue; // Bỏ qua dòng trống

					try {
						// Lấy giá trị từ các cột
						const fullName =
							row[fieldIndexes['fullName']]?.toString().trim() || '';
						const phoneNumber =
							row[fieldIndexes['phoneNumber']]?.toString().trim() || '';

						if (!fullName || !phoneNumber) {
							errorCount++;
							errors.push(`Dòng ${i + 1}: Thiếu Họ tên hoặc Số điện thoại`);
							continue;
						}

						// Xử lý giới tính
						const genderText =
							row[fieldIndexes['gender']]?.toString().trim() || '';
						const gender =
							genderText.toLowerCase().includes('nữ') ||
							genderText.toLowerCase().includes('female')
								? 'female'
								: 'male';

						// Xử lý ngày sinh
						let dateOfBirth = '';
						const dobValue = row[fieldIndexes['dateOfBirth']];
						if (dobValue) {
							if (typeof dobValue === 'number') {
								// Excel date serial number
								try {
									const excelDate = XLSX.SSF.parse_date_code(dobValue);
									if (excelDate) {
										dateOfBirth = `${excelDate.y}-${String(
											excelDate.m,
										).padStart(2, '0')}-${String(excelDate.d).padStart(
											2,
											'0',
										)}`;
									}
								} catch {
									dateOfBirth = dobValue.toString().trim();
								}
							} else {
								dateOfBirth = dobValue.toString().trim();
							}
						}

						// Xử lý trạng thái
						const statusText =
							row[fieldIndexes['status']]?.toString().trim() || '';
						let status: RecordStatus = 'PENDING_EXAMINATION';
						if (statusText) {
							const statusLower = statusText.toLowerCase();
							if (statusLower.includes('chờ khám')) {
								status = 'PENDING_EXAMINATION';
							} else if (statusLower.includes('đang khám')) {
								status = 'IN_EXAMINATION';
							} else if (statusLower.includes('hoàn thành')) {
								status = 'COMPLETED_EXAMINATION';
							}
						}

						const recordData: Omit<
							MedicalRecord,
							'id' | 'receiveCode' | 'createdAt' | 'updatedAt'
						> = {
							patient: {
								id: `patient_${Date.now()}_${i}`,
								fullName,
								phoneNumber,
								dateOfBirth: dateOfBirth || undefined,
								gender,
								address:
									row[fieldIndexes['address']]?.toString().trim() || undefined,
								cccdNumber:
									row[fieldIndexes['cccdNumber']]?.toString().trim() ||
									undefined,
								insurance:
									row[fieldIndexes['insurance']]?.toString().trim() ||
									undefined,
							},
							requestedServices: [],
							assignedDoctor: undefined,
							status,
							diagnosis: undefined,
							reason: row[fieldIndexes['reason']]?.toString().trim() || '',
							paymentStatus: 'pending',
						};

						onCreateRecord(recordData);
						successCount++;
					} catch (error) {
						errorCount++;
						errors.push(
							`Dòng ${i + 1}: ${
								error instanceof Error ? error.message : 'Lỗi không xác định'
							}`,
						);
					}
				}

				// Reset input file
				event.target.value = '';

				if (successCount > 0) {
					toast.success(
						`Đã import thành công ${successCount} khách hàng${
							errorCount > 0 ? `, ${errorCount} lỗi` : ''
						}`,
					);
				}

				if (errorCount > 0 && errors.length > 0) {
					console.error('Các lỗi khi import:', errors);
					if (errors.length <= 10) {
						toast.error(`Lỗi: ${errors.join('; ')}`);
					} else {
						toast.error(
							`Có ${errors.length} lỗi. Vui lòng kiểm tra console để xem chi tiết.`,
						);
					}
				}
			} catch (error) {
				console.error('Lỗi khi đọc file Excel:', error);
				toast.error('Có lỗi xảy ra khi đọc file Excel');
				event.target.value = '';
			}
		};

		reader.readAsArrayBuffer(file);
	};

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h2 className="text-2xl font-bold flex flex-col gap-2">
						<div className="flex items-center gap-2">
							<ClipboardList className="h-5 w-5" />
							Danh sách khách hàng
						</div>
						<p className="text-gray-600 mt-1">
							Quản lý, tra cứu và tiếp nhận khách hàng
						</p>
					</h2>
				</div>
				<div className="flex items-center gap-3">
					<div className="px-3 py-1.5 bg-white/80 backdrop-blur-sm rounded-lg border border-gray-200 shadow-sm">
						<span className="text-sm text-gray-600 font-medium">Tổng:</span>
						<span className="text-sm ml-1">{totalItems}</span>
					</div>
					{canDeleteRecord && selectedItems.size > 0 && (
						<Button
							onClick={handleDeleteSelected}
							variant="destructive"
							className="bg-delete-btn hover:bg-red-700 text-white border-red-600"
						>
							<Trash2 className="h-4 w-4 mr-2" />
							Xóa ({selectedItems.size})
						</Button>
					)}
					<motion.div className="flex items-center gap-2">
						<Button
							variant="outline"
							onClick={handleExport}
							className="border-gray-200 hover:bg-gray-50"
						>
							<Download className="h-4 w-4 mr-2" />
							Xuất Excel
						</Button>
						{canCreateRecord && (
							<>
								<label>
									<input
										type="file"
										accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
										onChange={handleImport}
										className="hidden"
									/>
									<Button
										variant="outline"
										asChild
										className="border-gray-200 hover:bg-gray-50 cursor-pointer"
									>
										<span>
											<Upload className="h-4 w-4 mr-2" />
											Nhập Excel
										</span>
									</Button>
								</label>
								<Button
									onClick={() => setShowReceptionDialog(true)}
									className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-lg shadow-blue-500/30"
								>
									<Plus className="h-4 w-4 mr-2" />
									Tiếp nhận khách hàng
								</Button>
							</>
						)}
					</motion.div>
				</div>
			</div>

			<Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
				<CardHeader>
					<div className="flex flex-col md:flex-row gap-4">
						<div className="flex-1 relative">
							<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
							<Input
								placeholder="Tìm kiếm theo mã khách hàng, tên, số điện thoại..."
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								className="pl-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
							/>
						</div>
						<div className="w-full md:w-64 relative">
							<Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none z-10" />
							<Select value={statusFilter} onValueChange={setStatusFilter}>
								<SelectTrigger className="pl-10 border-gray-200">
									<SelectValue placeholder="Lọc theo trạng thái" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">Tất cả trạng thái</SelectItem>
									{Object.entries(statusLabels).map(([value, label]) => (
										<SelectItem key={value} value={value}>
											{label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					</div>
				</CardHeader>
				<CardContent>
					<div className="rounded-xl border border-gray-200 overflow-hidden">
						<Table>
							<TableHeader>
								<TableRow className="bg-gray-50/80 hover:bg-gray-50">
									{canDeleteRecord && (
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
									<TableHead>Mã khách hàng</TableHead>
									<TableHead>Khách hàng</TableHead>
									<TableHead>Ngày tiếp nhận</TableHead>
									<TableHead>Lý do khám</TableHead>
									<TableHead>Trạng thái</TableHead>
									<TableHead className="text-right">Thao tác</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{filteredRecords.length === 0 ? (
									<TableRow>
										<TableCell
											colSpan={canDeleteRecord ? 8 : 7}
											className="text-center py-12"
										>
											<div className="flex flex-col items-center gap-3 text-gray-500">
												<FileText className="h-12 w-12 text-gray-300" />
												<p>Không tìm thấy khách hàng nào</p>
												{canCreateRecord && (
													<Button
														onClick={() => setShowReceptionDialog(true)}
														variant="outline"
														className="mt-2"
													>
														<Plus className="h-4 w-4 mr-2" />
														Tiếp nhận khách hàng mới
													</Button>
												)}
											</div>
										</TableCell>
									</TableRow>
								) : (
									paginatedRecords.map((record, index) => (
										<motion.tr
											key={record.id}
											initial={{ opacity: 0, y: 20 }}
											animate={{ opacity: 1, y: 0 }}
											transition={{ delay: index * 0.05 }}
											className="hover:bg-gray-50/80 transition-colors border-b border-gray-200"
										>
											{canDeleteRecord && (
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
												<div>
													<div className="text-sm">
														{record.patient.fullName}
													</div>
													<div className="text-xs text-gray-500">
														{record.patient.phoneNumber}
													</div>
												</div>
											</TableCell>
											<TableCell>
												<div className="text-sm text-gray-600">
													{record.appointmentTime &&
													record.status === 'PENDING_CHECKIN' ? (
														<div className="flex items-center gap-1">
															<Clock className="h-3 w-3 text-indigo-600" />
															<span className="text-indigo-600">
																{formatDate(record.createdAt)}
															</span>
														</div>
													) : (
														formatDate(record.createdAt)
													)}
												</div>
											</TableCell>
											<TableCell>
												<div
													className="text-sm text-gray-600 max-w-xs truncate"
													title={record.reason}
												>
													{record.reason || '-'}
												</div>
											</TableCell>
											<TableCell>
												<Badge
													className={`bg-gradient-to-r ${
														statusGradients[record.status]
													} text-white border-0 shadow-sm`}
												>
													{statusLabels[record.status]}
												</Badge>
											</TableCell>
											<TableCell className="text-right">
												<Button
													variant="ghost"
													size="sm"
													onClick={() => onViewRecord(record)}
													className="hover:bg-blue-50 hover:text-blue-600"
												>
													<Eye className="h-4 w-4 mr-1" />
													Xem
												</Button>
											</TableCell>
										</motion.tr>
									))
								)}
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
				</CardContent>
			</Card>

			{/* Floating Action Button for Mobile */}
			{canCreateRecord && (
				<motion.div
					initial={{ scale: 0 }}
					animate={{ scale: 1 }}
					className="fixed bottom-6 right-6 md:hidden z-40"
				>
					<motion.button
						whileHover={{ scale: 1.1 }}
						whileTap={{ scale: 0.9 }}
						onClick={() => setShowReceptionDialog(true)}
						className="w-14 h-14 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full shadow-none shadow-blue-500/50 flex items-center justify-center text-white cursor-pointer"
					>
						<Plus className="h-6 w-6" />
					</motion.button>
				</motion.div>
			)}

			{/* Reception Dialog */}
			<Dialog open={showReceptionDialog} onOpenChange={setShowReceptionDialog}>
				<DialogContent className="max-w-[95vw] lg:max-w-[90vw] xl:max-w-7xl max-h-[95vh] overflow-hidden p-0 gap-0 bg-gradient-to-br from-gray-50 to-white border-0 shadow-none">
					<div className="overflow-y-auto max-h-[95vh]">
						<div className="p-6">
							<ReceptionForm
								onSubmit={handleCreateRecord}
								onClose={() => setShowReceptionDialog(false)}
							/>
						</div>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
}
