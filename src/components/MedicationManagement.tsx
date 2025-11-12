import React, { useState } from 'react';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from './ui/card';
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
import { MedicationCatalog } from '../types';
import {
	Search,
	Plus,
	Edit,
	Trash2,
	CheckCircle2,
	XCircle,
	Pill,
	Filter,
	Download,
	Upload,
} from 'lucide-react';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import { usePagination } from '../hooks/usePagination';
import { PaginationControls } from './PaginationControls';
import { motion } from 'motion/react';

interface MedicationManagementProps {
	medications: MedicationCatalog[];
	onCreate: (
		medication: Omit<MedicationCatalog, 'id' | 'createdAt' | 'updatedAt'>,
	) => void;
	onUpdate: (id: string, medication: Partial<MedicationCatalog>) => void;
	onDelete: (id: string) => void;
}

const categoryLabels: Record<MedicationCatalog['category'], string> = {
	antibiotic: 'Kháng sinh',
	analgesic: 'Giảm đau, hạ sốt',
	anti_inflammatory: 'Chống viêm',
	gastrointestinal: 'Tiêu hóa',
	respiratory: 'Hô hấp',
	cardiovascular: 'Tim mạch',
	vitamin: 'Vitamin',
	dermatological: 'Da liễu',
	ophthalmic: 'Mắt',
	other: 'Khác',
};

const categoryColors: Record<MedicationCatalog['category'], string> = {
	antibiotic: 'bg-blue-100 text-blue-800',
	analgesic: 'bg-red-100 text-red-800',
	anti_inflammatory: 'bg-orange-100 text-orange-800',
	gastrointestinal: 'bg-green-100 text-green-800',
	respiratory: 'bg-cyan-100 text-cyan-800',
	cardiovascular: 'bg-pink-100 text-pink-800',
	vitamin: 'bg-yellow-100 text-yellow-800',
	dermatological: 'bg-purple-100 text-purple-800',
	ophthalmic: 'bg-indigo-100 text-indigo-800',
	other: 'bg-gray-100 text-gray-800',
};

const dosageFormLabels: Record<MedicationCatalog['dosageForm'], string> = {
	tablet: 'Viên nén',
	capsule: 'Viên nang',
	syrup: 'Sirô',
	injection: 'Tiêm',
	cream: 'Kem',
	drops: 'Nhỏ giọt',
	other: 'Khác',
};

export function MedicationManagement({
	medications,
	onCreate,
	onUpdate,
	onDelete,
}: MedicationManagementProps) {
	const [searchTerm, setSearchTerm] = useState('');
	const [categoryFilter, setCategoryFilter] = useState<string>('all');
	const [statusFilter, setStatusFilter] = useState<string>('all');
	const [showDialog, setShowDialog] = useState(false);
	const [editingMedication, setEditingMedication] =
		useState<MedicationCatalog | null>(null);

	const [formData, setFormData] = useState({
		name: '',
		code: '',
		activeIngredient: '',
		dosageForm: 'tablet' as MedicationCatalog['dosageForm'],
		strength: '',
		unit: 'viên',
		category: 'antibiotic' as MedicationCatalog['category'],
		manufacturer: '',
		price: '',
		stock: '',
		minStock: '',
		description: '',
		indications: '',
		contraindications: '',
		sideEffects: '',
		isActive: true,
	});

	const filteredMedications = medications.filter((medication) => {
		const matchesSearch =
			medication.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			medication.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
			medication.activeIngredient
				?.toLowerCase()
				.includes(searchTerm.toLowerCase()) ||
			medication.manufacturer?.toLowerCase().includes(searchTerm.toLowerCase());

		const matchesCategory =
			categoryFilter === 'all' || medication.category === categoryFilter;

		const matchesStatus =
			statusFilter === 'all' ||
			(statusFilter === 'active' && medication.isActive) ||
			(statusFilter === 'inactive' && !medication.isActive);

		return matchesSearch && matchesCategory && matchesStatus;
	});

	const {
		itemsPerPage,
		setItemsPerPage,
		currentPage,
		totalPages,
		paginatedData,
		totalItems,
		startIndex,
		endIndex,
		goToPage,
	} = usePagination({
		data: filteredMedications,
		itemsPerPage: 10,
	});

	const handleOpenDialog = (medication?: MedicationCatalog) => {
		if (medication) {
			setEditingMedication(medication);
			setFormData({
				name: medication.name,
				code: medication.code || '',
				activeIngredient: medication.activeIngredient || '',
				dosageForm: medication.dosageForm,
				strength: medication.strength || '',
				unit: medication.unit,
				category: medication.category,
				manufacturer: medication.manufacturer || '',
				price: medication.price?.toString() || '',
				stock: medication.stock?.toString() || '',
				minStock: medication.minStock?.toString() || '',
				description: medication.description || '',
				indications: medication.indications || '',
				contraindications: medication.contraindications || '',
				sideEffects: medication.sideEffects || '',
				isActive: medication.isActive,
			});
		} else {
			setEditingMedication(null);
			setFormData({
				name: '',
				code: '',
				activeIngredient: '',
				dosageForm: 'tablet',
				strength: '',
				unit: 'viên',
				category: 'antibiotic',
				manufacturer: '',
				price: '',
				stock: '',
				minStock: '',
				description: '',
				indications: '',
				contraindications: '',
				sideEffects: '',
				isActive: true,
			});
		}
		setShowDialog(true);
	};

	const handleCloseDialog = () => {
		setShowDialog(false);
		setEditingMedication(null);
	};

	const handleSubmit = () => {
		if (!formData.name || !formData.unit) {
			toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
			return;
		}

		const medicationData = {
			name: formData.name,
			code: formData.code || undefined,
			activeIngredient: formData.activeIngredient || undefined,
			dosageForm: formData.dosageForm,
			strength: formData.strength || undefined,
			unit: formData.unit,
			category: formData.category,
			manufacturer: formData.manufacturer || undefined,
			price: formData.price ? parseFloat(formData.price) : undefined,
			stock: formData.stock ? parseInt(formData.stock) : undefined,
			minStock: formData.minStock ? parseInt(formData.minStock) : undefined,
			description: formData.description || undefined,
			indications: formData.indications || undefined,
			contraindications: formData.contraindications || undefined,
			sideEffects: formData.sideEffects || undefined,
			isActive: formData.isActive,
		};

		if (editingMedication) {
			onUpdate(editingMedication.id, medicationData);
			toast.success('Cập nhật thuốc thành công');
		} else {
			onCreate(medicationData);
			toast.success('Tạo thuốc thành công');
		}

		handleCloseDialog();
	};

	const handleDelete = (id: string) => {
		if (confirm('Bạn có chắc chắn muốn xóa thuốc này?')) {
			onDelete(id);
			toast.success('Xóa thuốc thành công');
		}
	};

	const formatPrice = (price?: number) => {
		if (!price) return '-';
		return new Intl.NumberFormat('vi-VN', {
			style: 'currency',
			currency: 'VND',
		}).format(price);
	};

	const getStockStatus = (stock?: number, minStock?: number) => {
		if (stock === undefined) return null;
		if (minStock === undefined) return null;
		if (stock <= 0)
			return { label: 'Hết hàng', color: 'bg-red-100 text-red-800' };
		if (stock <= minStock)
			return { label: 'Sắp hết', color: 'bg-orange-100 text-orange-800' };
		return { label: 'Còn hàng', color: 'bg-green-100 text-green-800' };
	};

	// Export to Excel
	const handleExport = () => {
		try {
			const exportData = filteredMedications.map((m) => ({
				Mã: m.code || '',
				Tên: m.name,
				'Hoạt chất': m.activeIngredient || '',
				'Dạng bào chế': dosageFormLabels[m.dosageForm],
				'Hàm lượng': m.strength || '',
				'Đơn vị': m.unit,
				'Phân loại': categoryLabels[m.category],
				'Nhà sản xuất': m.manufacturer || '',
				'Giá bán': m.price || '',
				'Số lượng': m.stock || '',
				'Tồn tối thiểu': m.minStock || '',
				'Chỉ định': m.indications || '',
				'Chống chỉ định': m.contraindications || '',
				'Tác dụng phụ': m.sideEffects || '',
				'Trạng thái': m.isActive ? 'Hoạt động' : 'Ngừng hoạt động',
			}));

			const ws = XLSX.utils.json_to_sheet(exportData);
			const wb = XLSX.utils.book_new();
			XLSX.utils.book_append_sheet(wb, ws, 'Thuốc');

			const colWidths = [
				{ wch: 15 }, // Mã
				{ wch: 30 }, // Tên
				{ wch: 20 }, // Hoạt chất
				{ wch: 15 }, // Dạng bào chế
				{ wch: 15 }, // Hàm lượng
				{ wch: 10 }, // Đơn vị
				{ wch: 20 }, // Phân loại
				{ wch: 25 }, // Nhà sản xuất
				{ wch: 15 }, // Giá bán
				{ wch: 12 }, // Số lượng
				{ wch: 15 }, // Tồn tối thiểu
				{ wch: 50 }, // Chỉ định
				{ wch: 50 }, // Chống chỉ định
				{ wch: 50 }, // Tác dụng phụ
				{ wch: 15 }, // Trạng thái
			];
			ws['!cols'] = colWidths;

			const fileName = `Danh_sach_thuoc_${
				new Date().toISOString().split('T')[0]
			}.xlsx`;
			XLSX.writeFile(wb, fileName);
			toast.success(`Đã xuất ${exportData.length} thuốc ra file Excel`);
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

				const headerMap: Record<string, keyof MedicationCatalog> = {
					mã: 'code',
					tên: 'name',
					'hoạt chất': 'activeIngredient',
					'dạng bào chế': 'dosageForm',
					'hàm lượng': 'strength',
					'đơn vị': 'unit',
					'phân loại': 'category',
					'nhà sản xuất': 'manufacturer',
					'giá bán': 'price',
					'số lượng': 'stock',
					'tồn tối thiểu': 'minStock',
					'chỉ định': 'indications',
					'chống chỉ định': 'contraindications',
					'tác dụng phụ': 'sideEffects',
					'trạng thái': 'isActive',
				};

				const fieldIndexes: Record<string, number> = {};
				headers.forEach((header, index) => {
					const field = headerMap[header];
					if (field) {
						fieldIndexes[field] = index;
					}
				});

				if (!fieldIndexes['name'] || !fieldIndexes['unit']) {
					toast.error('File Excel thiếu các cột bắt buộc: Tên và Đơn vị');
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
						const unit = row[fieldIndexes['unit']]?.toString().trim() || '';

						if (!name || !unit) {
							errorCount++;
							errors.push(`Dòng ${i + 1}: Thiếu tên hoặc đơn vị`);
							continue;
						}

						const dosageFormText =
							row[fieldIndexes['dosageForm']]?.toString().trim() || '';
						let dosageForm: MedicationCatalog['dosageForm'] = 'tablet';
						if (dosageFormText) {
							const formLower = dosageFormText.toLowerCase();
							if (
								formLower.includes('viên nén') ||
								formLower.includes('tablet')
							) {
								dosageForm = 'tablet';
							} else if (
								formLower.includes('viên nang') ||
								formLower.includes('capsule')
							) {
								dosageForm = 'capsule';
							} else if (
								formLower.includes('sirô') ||
								formLower.includes('syrup')
							) {
								dosageForm = 'syrup';
							} else if (
								formLower.includes('tiêm') ||
								formLower.includes('injection')
							) {
								dosageForm = 'injection';
							} else if (
								formLower.includes('kem') ||
								formLower.includes('cream')
							) {
								dosageForm = 'cream';
							} else if (
								formLower.includes('nhỏ giọt') ||
								formLower.includes('drops')
							) {
								dosageForm = 'drops';
							}
						}

						const categoryText =
							row[fieldIndexes['category']]?.toString().trim() || '';
						let category: MedicationCatalog['category'] = 'other';
						if (categoryText) {
							const catLower = categoryText.toLowerCase();
							if (
								catLower.includes('kháng sinh') ||
								catLower.includes('antibiotic')
							) {
								category = 'antibiotic';
							} else if (
								catLower.includes('giảm đau') ||
								catLower.includes('analgesic')
							) {
								category = 'analgesic';
							} else if (
								catLower.includes('chống viêm') ||
								catLower.includes('anti_inflammatory')
							) {
								category = 'anti_inflammatory';
							} else if (
								catLower.includes('tiêu hóa') ||
								catLower.includes('gastrointestinal')
							) {
								category = 'gastrointestinal';
							} else if (
								catLower.includes('hô hấp') ||
								catLower.includes('respiratory')
							) {
								category = 'respiratory';
							} else if (
								catLower.includes('tim mạch') ||
								catLower.includes('cardiovascular')
							) {
								category = 'cardiovascular';
							} else if (catLower.includes('vitamin')) {
								category = 'vitamin';
							} else if (
								catLower.includes('da liễu') ||
								catLower.includes('dermatological')
							) {
								category = 'dermatological';
							} else if (
								catLower.includes('mắt') ||
								catLower.includes('ophthalmic')
							) {
								category = 'ophthalmic';
							}
						}

						const priceValue = row[fieldIndexes['price']];
						const price = priceValue
							? typeof priceValue === 'number'
								? priceValue
								: parseFloat(String(priceValue).replace(/[^\d.-]/g, ''))
							: undefined;

						const stockValue = row[fieldIndexes['stock']];
						const stock =
							stockValue !== undefined && stockValue !== ''
								? typeof stockValue === 'number'
									? stockValue
									: parseInt(String(stockValue).replace(/[^\d.-]/g, ''), 10)
								: undefined;

						const minStockValue = row[fieldIndexes['minStock']];
						const minStock =
							minStockValue !== undefined && minStockValue !== ''
								? typeof minStockValue === 'number'
									? minStockValue
									: parseInt(String(minStockValue).replace(/[^\d.-]/g, ''), 10)
								: undefined;

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

						const medicationData: Omit<
							MedicationCatalog,
							'id' | 'createdAt' | 'updatedAt'
						> = {
							name,
							code: row[fieldIndexes['code']]?.toString().trim() || undefined,
							activeIngredient:
								row[fieldIndexes['activeIngredient']]?.toString().trim() ||
								undefined,
							dosageForm,
							strength:
								row[fieldIndexes['strength']]?.toString().trim() || undefined,
							unit,
							category,
							manufacturer:
								row[fieldIndexes['manufacturer']]?.toString().trim() ||
								undefined,
							price: price && !isNaN(price) ? price : undefined,
							stock: stock !== undefined && !isNaN(stock) ? stock : undefined,
							minStock:
								minStock !== undefined && !isNaN(minStock)
									? minStock
									: undefined,
							indications:
								row[fieldIndexes['indications']]?.toString().trim() ||
								undefined,
							contraindications:
								row[fieldIndexes['contraindications']]?.toString().trim() ||
								undefined,
							sideEffects:
								row[fieldIndexes['sideEffects']]?.toString().trim() ||
								undefined,
							isActive,
						};

						onCreate(medicationData);
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
						`Đã import thành công ${successCount} thuốc${
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
							<Pill className="h-5 w-5" />
							Danh mục Thuốc
						</div>
						<p className="text-gray-600 mt-1">
							Quản lý danh sách thuốc của phòng khám
						</p>
					</h2>
				</div>
				<div className="flex items-center gap-3">
					<div className="px-3 py-1.5 bg-white/80 backdrop-blur-sm rounded-lg border border-gray-200 shadow-sm">
						<span className="text-sm text-gray-600">Tổng:</span>
						<span className="text-sm ml-1">{totalItems}</span>
					</div>
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
							Thêm thuốc
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
								placeholder="Tìm kiếm theo tên, mã, hoạt chất, nhà sản xuất..."
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								className="pl-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
							/>
						</div>
						<div className="w-full md:w-64 relative">
							<Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none z-10" />
							<Select value={categoryFilter} onValueChange={setCategoryFilter}>
								<SelectTrigger className="pl-10 border-gray-200">
									<SelectValue placeholder="Phân loại" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">Tất cả phân loại</SelectItem>
									<SelectItem value="antibiotic">Kháng sinh</SelectItem>
									<SelectItem value="analgesic">Giảm đau, hạ sốt</SelectItem>
									<SelectItem value="anti_inflammatory">Chống viêm</SelectItem>
									<SelectItem value="gastrointestinal">Tiêu hóa</SelectItem>
									<SelectItem value="respiratory">Hô hấp</SelectItem>
									<SelectItem value="cardiovascular">Tim mạch</SelectItem>
									<SelectItem value="vitamin">Vitamin</SelectItem>
									<SelectItem value="dermatological">Da liễu</SelectItem>
									<SelectItem value="ophthalmic">Mắt</SelectItem>
									<SelectItem value="other">Khác</SelectItem>
								</SelectContent>
							</Select>
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
									<SelectItem value="inactive">
										Ngừng hoạt động hoạt động
									</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>
				</CardHeader>
				<CardContent>
					{/* Table */}
					<div className="rounded-xl border border-gray-200 overflow-hidden">
						<Table>
							<TableHeader>
								<TableRow className="bg-gray-50/80 hover:bg-gray-50">
									<TableHead>Mã</TableHead>
									<TableHead>Tên thuốc</TableHead>
									<TableHead>Hoạt chất</TableHead>
									<TableHead>Dạng bào chế</TableHead>
									<TableHead>Hàm lượng</TableHead>
									<TableHead>Phân loại</TableHead>
									<TableHead>Tồn kho</TableHead>
									<TableHead>Giá</TableHead>
									<TableHead>Trạng thái</TableHead>
									<TableHead className="text-right">Thao tác</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{paginatedData.length === 0 ? (
									<TableRow>
										<TableCell colSpan={10} className="text-center py-12">
											<div className="flex flex-col items-center gap-3 text-gray-500">
												<Pill className="h-12 w-12 text-gray-300" />
												<p>Không tìm thấy thuốc nào</p>
												<Button
													onClick={() => handleOpenDialog()}
													variant="outline"
													className="mt-2"
												>
													<Plus className="h-4 w-4 mr-2" />
													Thêm thuốc mới
												</Button>
											</div>
										</TableCell>
									</TableRow>
								) : (
									paginatedData.map((medication, index) => {
										const stockStatus = getStockStatus(
											medication.stock,
											medication.minStock,
										);
										return (
											<motion.tr
												key={medication.id}
												initial={{ opacity: 0, y: 20 }}
												animate={{ opacity: 1, y: 0 }}
												transition={{ delay: index * 0.05 }}
												className="hover:bg-gray-50/80 transition-colors border-b border-gray-200"
											>
												<TableCell>
													{medication.code ? (
														<span className="font-mono text-sm bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
															{medication.code}
														</span>
													) : (
														<span className="text-gray-400">-</span>
													)}
												</TableCell>
												<TableCell className="font-medium">
													{medication.name}
												</TableCell>
												<TableCell className="text-gray-600">
													{medication.activeIngredient || '-'}
												</TableCell>
												<TableCell>
													<Badge variant="outline">
														{dosageFormLabels[medication.dosageForm]}
													</Badge>
												</TableCell>
												<TableCell className="text-gray-600">
													{medication.strength || '-'}
												</TableCell>
												<TableCell>
													<Badge
														className={categoryColors[medication.category]}
													>
														{categoryLabels[medication.category]}
													</Badge>
												</TableCell>
												<TableCell>
													{stockStatus ? (
														<div className="flex flex-col gap-1">
															<span className="text-sm font-medium">
																{medication.stock !== undefined
																	? `${medication.stock} ${medication.unit}`
																	: '-'}
															</span>
															<Badge className={stockStatus.color}>
																{stockStatus.label}
															</Badge>
														</div>
													) : (
														<span className="text-gray-400">-</span>
													)}
												</TableCell>
												<TableCell className="font-medium">
													{formatPrice(medication.price)}
												</TableCell>
												<TableCell>
													{medication.isActive ? (
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
															onClick={() => handleOpenDialog(medication)}
															className="hover:bg-blue-50 hover:text-blue-600"
														>
															<Edit className="h-4 w-4 mr-1" />
															Sửa
														</Button>
														<Button
															variant="ghost"
															size="sm"
															onClick={() => handleDelete(medication.id)}
															className="text-red-600 hover:text-red-700 hover:bg-red-50"
														>
															<Trash2 className="h-4 w-4 mr-1" />
															Xóa
														</Button>
													</div>
												</TableCell>
											</motion.tr>
										);
									})
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

			{/* Dialog */}
			<Dialog open={showDialog} onOpenChange={setShowDialog}>
				<DialogContent className="max-w-[95vw] lg:max-w-4xl max-h-[95vh] overflow-hidden p-0 gap-0 bg-gradient-to-br from-gray-50 to-white border-0 shadow-none">
					<div className="overflow-y-auto max-h-[95vh]">
						<div className="p-6">
							<DialogHeader>
								<DialogTitle>
									{editingMedication ? 'Chỉnh sửa thuốc' : 'Thêm thuốc mới'}
								</DialogTitle>
								<DialogDescription>
									{editingMedication
										? 'Cập nhật thông tin thuốc'
										: 'Điền thông tin để tạo thuốc mới'}
								</DialogDescription>
							</DialogHeader>
							<div className="space-y-4 mt-6">
								<div className="grid grid-cols-2 gap-4">
									<div className="space-y-2">
										<Label htmlFor="name">
											Tên thuốc <span className="text-red-500">*</span>
										</Label>
										<Input
											id="name"
											value={formData.name}
											onChange={(e) =>
												setFormData({ ...formData, name: e.target.value })
											}
											placeholder="Nhập tên thuốc"
										/>
									</div>
									<div className="space-y-2">
										<Label htmlFor="code">Mã thuốc</Label>
										<Input
											id="code"
											value={formData.code}
											onChange={(e) =>
												setFormData({ ...formData, code: e.target.value })
											}
											placeholder="Nhập mã thuốc"
										/>
									</div>
								</div>
								<div className="grid grid-cols-2 gap-4">
									<div className="space-y-2">
										<Label htmlFor="activeIngredient">Hoạt chất</Label>
										<Input
											id="activeIngredient"
											value={formData.activeIngredient}
											onChange={(e) =>
												setFormData({
													...formData,
													activeIngredient: e.target.value,
												})
											}
											placeholder="Nhập hoạt chất"
										/>
									</div>
									<div className="space-y-2">
										<Label htmlFor="manufacturer">Nhà sản xuất</Label>
										<Input
											id="manufacturer"
											value={formData.manufacturer}
											onChange={(e) =>
												setFormData({
													...formData,
													manufacturer: e.target.value,
												})
											}
											placeholder="Nhập nhà sản xuất"
										/>
									</div>
								</div>
								<div className="grid grid-cols-3 gap-4">
									<div className="space-y-2">
										<Label htmlFor="dosageForm">Dạng bào chế</Label>
										<Select
											value={formData.dosageForm}
											onValueChange={(value) =>
												setFormData({
													...formData,
													dosageForm: value as MedicationCatalog['dosageForm'],
												})
											}
										>
											<SelectTrigger>
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="tablet">Viên nén</SelectItem>
												<SelectItem value="capsule">Viên nang</SelectItem>
												<SelectItem value="syrup">Sirô</SelectItem>
												<SelectItem value="injection">Tiêm</SelectItem>
												<SelectItem value="cream">Kem</SelectItem>
												<SelectItem value="drops">Nhỏ giọt</SelectItem>
												<SelectItem value="other">Khác</SelectItem>
											</SelectContent>
										</Select>
									</div>
									<div className="space-y-2">
										<Label htmlFor="strength">Hàm lượng</Label>
										<Input
											id="strength"
											value={formData.strength}
											onChange={(e) =>
												setFormData({ ...formData, strength: e.target.value })
											}
											placeholder="vd: 500mg, 1%"
										/>
									</div>
									<div className="space-y-2">
										<Label htmlFor="unit">
											Đơn vị <span className="text-red-500">*</span>
										</Label>
										<Input
											id="unit"
											value={formData.unit}
											onChange={(e) =>
												setFormData({ ...formData, unit: e.target.value })
											}
											placeholder="viên, chai, tuýp..."
										/>
									</div>
								</div>
								<div className="grid grid-cols-2 gap-4">
									<div className="space-y-2">
										<Label htmlFor="category">Phân loại</Label>
										<Select
											value={formData.category}
											onValueChange={(value) =>
												setFormData({
													...formData,
													category: value as MedicationCatalog['category'],
												})
											}
										>
											<SelectTrigger>
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="antibiotic">Kháng sinh</SelectItem>
												<SelectItem value="analgesic">
													Giảm đau, hạ sốt
												</SelectItem>
												<SelectItem value="anti_inflammatory">
													Chống viêm
												</SelectItem>
												<SelectItem value="gastrointestinal">
													Tiêu hóa
												</SelectItem>
												<SelectItem value="respiratory">Hô hấp</SelectItem>
												<SelectItem value="cardiovascular">Tim mạch</SelectItem>
												<SelectItem value="vitamin">Vitamin</SelectItem>
												<SelectItem value="dermatological">Da liễu</SelectItem>
												<SelectItem value="ophthalmic">Mắt</SelectItem>
												<SelectItem value="other">Khác</SelectItem>
											</SelectContent>
										</Select>
									</div>
									<div className="space-y-2">
										<Label htmlFor="price">Giá bán</Label>
										<Input
											id="price"
											type="number"
											value={formData.price}
											onChange={(e) =>
												setFormData({ ...formData, price: e.target.value })
											}
											placeholder="Nhập giá bán"
											min="0"
										/>
									</div>
								</div>
								<div className="grid grid-cols-2 gap-4">
									<div className="space-y-2">
										<Label htmlFor="stock">Tồn kho</Label>
										<Input
											id="stock"
											type="number"
											value={formData.stock}
											onChange={(e) =>
												setFormData({ ...formData, stock: e.target.value })
											}
											placeholder="Nhập số lượng tồn kho"
											min="0"
										/>
									</div>
									<div className="space-y-2">
										<Label htmlFor="minStock">Tồn kho tối thiểu</Label>
										<Input
											id="minStock"
											type="number"
											value={formData.minStock}
											onChange={(e) =>
												setFormData({ ...formData, minStock: e.target.value })
											}
											placeholder="Nhập tồn kho tối thiểu"
											min="0"
										/>
									</div>
								</div>
								<div className="space-y-2">
									<Label htmlFor="description">Mô tả</Label>
									<Textarea
										id="description"
										value={formData.description}
										onChange={(e) =>
											setFormData({ ...formData, description: e.target.value })
										}
										placeholder="Nhập mô tả thuốc"
										rows={2}
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="indications">Chỉ định</Label>
									<Textarea
										id="indications"
										value={formData.indications}
										onChange={(e) =>
											setFormData({ ...formData, indications: e.target.value })
										}
										placeholder="Nhập chỉ định sử dụng"
										rows={2}
									/>
								</div>
								<div className="grid grid-cols-2 gap-4">
									<div className="space-y-2">
										<Label htmlFor="contraindications">Chống chỉ định</Label>
										<Textarea
											id="contraindications"
											value={formData.contraindications}
											onChange={(e) =>
												setFormData({
													...formData,
													contraindications: e.target.value,
												})
											}
											placeholder="Nhập chống chỉ định"
											rows={2}
										/>
									</div>
									<div className="space-y-2">
										<Label htmlFor="sideEffects">Tác dụng phụ</Label>
										<Textarea
											id="sideEffects"
											value={formData.sideEffects}
											onChange={(e) =>
												setFormData({
													...formData,
													sideEffects: e.target.value,
												})
											}
											placeholder="Nhập tác dụng phụ"
											rows={2}
										/>
									</div>
								</div>
								<div className="flex items-center space-x-2 gap-2">
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
										{editingMedication ? 'Cập nhật' : 'Tạo mới'}
									</Button>
								</div>
							</div>
						</div>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
}
