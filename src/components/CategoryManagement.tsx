import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
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
import { Category } from '../types';
import {
	Search,
	Plus,
	Edit,
	Trash2,
	CheckCircle2,
	XCircle,
	Building2,
	Filter,
	Download,
	Upload,
} from 'lucide-react';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import { usePagination } from '../hooks/usePagination';
import { PaginationControls } from './PaginationControls';
import { motion } from 'motion/react';
import { Checkbox } from './ui/checkbox';

interface CategoryManagementProps {
	title: string;
	icon?: React.ReactElement;
	categories: Category[];
	onCreate: (
		category: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>,
	) => void;
	onUpdate: (id: string, category: Partial<Category>) => void;
	onDelete: (id: string) => void;
}

export function CategoryManagement({
	title,
	icon,
	categories,
	onCreate,
	onUpdate,
	onDelete,
}: CategoryManagementProps) {
	const [searchTerm, setSearchTerm] = useState('');
	const [statusFilter, setStatusFilter] = useState<string>('all');
	const [showDialog, setShowDialog] = useState(false);
	const [editingCategory, setEditingCategory] = useState<Category | null>(null);
	const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

	const [formData, setFormData] = useState({
		name: '',
		description: '',
		isActive: true,
	});

	const filteredCategories = categories.filter((cat) => {
		const matchesSearch =
			cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			cat.description?.toLowerCase().includes(searchTerm.toLowerCase());

		const matchesStatus =
			statusFilter === 'all' ||
			(statusFilter === 'active' && cat.isActive) ||
			(statusFilter === 'inactive' && !cat.isActive);

		return matchesSearch && matchesStatus;
	});

	const {
		itemsPerPage,
		currentPage,
		totalPages,
		paginatedData,
		totalItems,
		startIndex,
		endIndex,
		goToPage,
	} = usePagination({
		data: filteredCategories,
		itemsPerPage: 10,
	});

	const handleOpenDialog = (category?: Category) => {
		if (category) {
			setEditingCategory(category);
			setFormData({
				name: category.name,
				description: category.description || '',
				isActive: category.isActive,
			});
		} else {
			setEditingCategory(null);
			setFormData({
				name: '',
				description: '',
				isActive: true,
			});
		}
		setShowDialog(true);
	};

	const handleCloseDialog = () => {
		setShowDialog(false);
		setEditingCategory(null);
	};

	const handleSubmit = () => {
		if (!formData.name.trim()) {
			toast.error('Vui lòng nhập tên');
			return;
		}

		const categoryData = {
			name: formData.name.trim(),
			description: formData.description.trim() || undefined,
			isActive: formData.isActive,
		};

		if (editingCategory) {
			onUpdate(editingCategory.id, categoryData);
			toast.success('Cập nhật thành công');
		} else {
			onCreate(categoryData);
			toast.success('Tạo mới thành công');
		}

		handleCloseDialog();
	};

	const handleDelete = (id: string) => {
		if (confirm('Bạn có chắc chắn muốn xóa mục này?')) {
			onDelete(id);
			toast.success('Xóa thành công');
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
			setSelectedItems(new Set(paginatedData.map((item) => item.id)));
		} else {
			setSelectedItems(new Set());
		}
	};

	const handleDeleteSelected = () => {
		if (selectedItems.size === 0) {
			toast.error('Vui lòng chọn ít nhất một mục để xóa');
			return;
		}

		if (
			confirm(`Bạn có chắc chắn muốn xóa ${selectedItems.size} mục đã chọn?`)
		) {
			selectedItems.forEach((id) => {
				onDelete(id);
			});
			setSelectedItems(new Set());
			toast.success(`Đã xóa ${selectedItems.size} mục thành công`);
		}
	};

	const isAllSelected =
		paginatedData.length > 0 &&
		paginatedData.every((item) => selectedItems.has(item.id));
	const isIndeterminate =
		selectedItems.size > 0 && selectedItems.size < paginatedData.length;

	// Export to Excel
	const handleExport = () => {
		try {
			const exportData = filteredCategories.map((cat) => ({
				Tên: cat.name,
				'Mô tả': cat.description || '',
				'Trạng thái': cat.isActive ? 'Hoạt động' : 'Ngừng hoạt động',
			}));

			const ws = XLSX.utils.json_to_sheet(exportData);
			const wb = XLSX.utils.book_new();
			XLSX.utils.book_append_sheet(wb, ws, title);

			const colWidths = [
				{ wch: 30 }, // Tên
				{ wch: 50 }, // Mô tả
				{ wch: 15 }, // Trạng thái
			];
			ws['!cols'] = colWidths;

			const fileName = `Danh_sach_${title.toLowerCase()}_${
				new Date().toISOString().split('T')[0]
			}.xlsx`;
			XLSX.writeFile(wb, fileName);
			toast.success(
				`Đã xuất ${exportData.length} ${title.toLowerCase()} ra file Excel`,
			);
		} catch (error) {
			console.error('Lỗi khi xuất file Excel:', error);
			toast.error('Có lỗi xảy ra khi xuất file Excel');
		}
	};

	// Import from Excel
	const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (!file) return;

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
					return;
				}

				const headers = jsonData[0].map((h: any) =>
					String(h).toLowerCase().trim(),
				);

				const headerMap: Record<string, keyof Category> = {
					tên: 'name',
					'mô tả': 'description',
					'trạng thái': 'isActive',
				};

				const fieldIndexes: Record<string, number> = {};
				headers.forEach((header, index) => {
					const field = headerMap[header];
					if (field) {
						fieldIndexes[field] = index;
					}
				});

				if (!fieldIndexes['name']) {
					toast.error('File Excel thiếu cột bắt buộc: Tên');
					return;
				}

				let successCount = 0;
				let errorCount = 0;
				const errors: string[] = [];

				for (let i = 1; i < jsonData.length; i++) {
					const row = jsonData[i];
					if (!row || row.every((cell) => !cell)) continue;

					try {
						const name = row[fieldIndexes['name']]?.toString().trim() || '';

						if (!name) {
							errorCount++;
							errors.push(`Dòng ${i + 1}: Thiếu tên`);
							continue;
						}

						const statusText =
							row[fieldIndexes['isActive']]?.toString().trim() || '';
						let isActive = true;
						if (statusText) {
							const statusLower = statusText.toLowerCase();
							isActive =
								statusLower.includes('hoạt động') ||
								statusLower.includes('active') ||
								statusLower === '1' ||
								statusLower === 'true';
						}

						const categoryData: Omit<
							Category,
							'id' | 'createdAt' | 'updatedAt'
						> = {
							name,
							description:
								row[fieldIndexes['description']]?.toString().trim() ||
								undefined,
							isActive,
						};

						onCreate(categoryData);
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

				event.target.value = '';

				if (successCount > 0) {
					toast.success(
						`Đã import thành công ${successCount} ${title.toLowerCase()}${
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
							{icon || <Building2 className="h-5 w-5" />}
							{title}
						</div>
						<p className="text-gray-600 mt-1 text-sm font-normal">
							Quản lý danh sách {title.toLowerCase()}
						</p>
					</h2>
				</div>
				<div className="flex items-center gap-3">
					<div className="px-3 py-1.5 bg-white/80 backdrop-blur-sm rounded-lg border border-gray-200 shadow-sm">
						<span className="text-sm text-gray-600 font-medium">Tổng:</span>
						<span className="text-sm ml-1">{totalItems}</span>
					</div>
					{selectedItems.size > 0 && (
						<Button
							onClick={handleDeleteSelected}
							variant="destructive"
							className="bg-delete-btn hover:bg-red-700 text-white border-red-600"
						>
							<Trash2 className="h-4 w-4 mr-2" />
							Xóa ({selectedItems.size})
						</Button>
					)}
					<Button
						onClick={handleExport}
						variant="outline"
						className="border-gray-300 hover:bg-gray-50"
					>
						<Download className="h-4 w-4 mr-2" />
						Xuất Excel
					</Button>
					<label>
						<input
							type="file"
							accept=".xlsx,.xls"
							onChange={handleImport}
							className="hidden"
						/>
						<Button
							asChild
							variant="outline"
							className="border-gray-300 hover:bg-gray-50"
						>
							<span>
								<Upload className="h-4 w-4 mr-2" />
								Nhập Excel
							</span>
						</Button>
					</label>
					<motion.div>
						<Button
							onClick={() => handleOpenDialog()}
							className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-lg shadow-blue-500/30"
						>
							<Plus className="h-4 w-4 mr-2" />
							Thêm mới
						</Button>
					</motion.div>
				</div>
			</div>

			<Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
				<CardHeader>
					<div className="flex flex-col md:flex-row gap-4">
						<div className="flex-1 relative">
							<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
							<Input
								placeholder="Tìm kiếm theo tên, mô tả..."
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
									<SelectItem value="active">Đang hoạt động</SelectItem>
									<SelectItem value="inactive">Ngừng hoạt động</SelectItem>
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
									<TableHead className="w-16 text-center">STT</TableHead>
									<TableHead>Tên</TableHead>
									<TableHead>Mô tả</TableHead>
									<TableHead>Trạng thái</TableHead>
									<TableHead className="text-right">Thao tác</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{paginatedData.length === 0 ? (
									<TableRow>
										<TableCell colSpan={6} className="text-center py-12">
											<div className="flex flex-col items-center gap-3 text-gray-500">
												<Building2 className="h-12 w-12 text-gray-300" />
												<p>Không tìm thấy dữ liệu nào</p>
												<Button
													onClick={() => handleOpenDialog()}
													variant="outline"
													className="mt-2"
												>
													<Plus className="h-4 w-4 mr-2" />
													Thêm mới
												</Button>
											</div>
										</TableCell>
									</TableRow>
								) : (
									paginatedData.map((category, index) => (
										<motion.tr
											key={category.id}
											initial={{ opacity: 0, y: 20 }}
											animate={{ opacity: 1, y: 0 }}
											transition={{ delay: index * 0.05 }}
											className="hover:bg-gray-50/80 transition-colors border-b border-gray-200"
										>
											<TableCell>
												<Checkbox
													checked={selectedItems.has(category.id)}
													onCheckedChange={() =>
														handleToggleSelect(category.id)
													}
												/>
											</TableCell>
											<TableCell className="text-center text-gray-500">
												{startIndex + index}
											</TableCell>
											<TableCell className="font-medium">
												{category.name}
											</TableCell>
											<TableCell className="text-gray-600 max-w-md truncate">
												{category.description || '-'}
											</TableCell>
											<TableCell>
												{category.isActive ? (
													<Badge className="bg-green-100 text-green-800 border-0">
														<CheckCircle2 className="h-3 w-3 mr-1" />
														Hoạt động
													</Badge>
												) : (
													<Badge className="bg-red-100 text-red-800 border-0">
														<XCircle className="h-3 w-3 mr-1" />
														Ngừng hoạt động
													</Badge>
												)}
											</TableCell>
											<TableCell className="text-right">
												<div className="flex justify-end gap-2">
													<Button
														variant="ghost"
														size="sm"
														onClick={() => handleOpenDialog(category)}
														className="hover:bg-blue-50 hover:text-blue-600"
													>
														<Edit className="h-4 w-4 mr-1" />
														Sửa
													</Button>
													<Button
														variant="ghost"
														size="sm"
														onClick={() => handleDelete(category.id)}
														className="text-red-600 hover:text-red-700 hover:bg-red-50"
													>
														<Trash2 className="h-4 w-4 mr-1" />
														Xóa
													</Button>
												</div>
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
					/>
				</CardContent>
			</Card>

			{/* Dialog */}
			<Dialog open={showDialog} onOpenChange={setShowDialog}>
				<DialogContent className="max-w-2xl">
					<DialogHeader>
						<DialogTitle>
							{editingCategory ? 'Chỉnh sửa' : 'Thêm mới'}
						</DialogTitle>
						<DialogDescription>
							{editingCategory
								? 'Cập nhật thông tin'
								: 'Điền thông tin để tạo mới'}
						</DialogDescription>
					</DialogHeader>
					<div className="space-y-4 mt-6">
						<div className="space-y-2">
							<Label htmlFor="name">
								Tên <span className="text-red-500">*</span>
							</Label>
							<Input
								id="name"
								value={formData.name}
								onChange={(e) =>
									setFormData({ ...formData, name: e.target.value })
								}
								placeholder="Nhập tên"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="description">Mô tả</Label>
							<Textarea
								id="description"
								value={formData.description}
								onChange={(e) =>
									setFormData({ ...formData, description: e.target.value })
								}
								placeholder="Nhập mô tả (tùy chọn)"
								rows={3}
							/>
						</div>
						<div className="flex items-center space-x-2">
							<input
								type="checkbox"
								id="isActive"
								checked={formData.isActive}
								onChange={(e) =>
									setFormData({ ...formData, isActive: e.target.checked })
								}
								className="rounded"
							/>
							<Label htmlFor="isActive">Đang hoạt động</Label>
						</div>
						<div className="flex justify-end gap-2 pt-4 border-t border-gray-200 mt-6">
							<Button variant="outline" onClick={handleCloseDialog}>
								Hủy
							</Button>
							<Button
								onClick={handleSubmit}
								className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
							>
								{editingCategory ? 'Cập nhật' : 'Tạo mới'}
							</Button>
						</div>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
}
