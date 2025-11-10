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
import { Service } from '../types';
import {
	Search,
	Plus,
	Edit,
	Trash2,
	CheckCircle2,
	XCircle,
	Package,
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { usePagination } from '../hooks/usePagination';
import { PaginationControls } from './PaginationControls';
import { motion } from 'motion/react';

interface ServiceManagementProps {
	services: Service[];
	onCreate: (service: Omit<Service, 'id' | 'createdAt' | 'updatedAt'>) => void;
	onUpdate: (id: string, service: Partial<Service>) => void;
	onDelete: (id: string) => void;
}

const categoryLabels: Record<Service['category'], string> = {
	examination: 'Khám',
	test: 'Xét nghiệm',
	imaging: 'Chẩn đoán hình ảnh',
	procedure: 'Thủ thuật',
	other: 'Khác',
};

const categoryColors: Record<Service['category'], string> = {
	examination: 'bg-blue-100 text-blue-800',
	test: 'bg-green-100 text-green-800',
	imaging: 'bg-purple-100 text-purple-800',
	procedure: 'bg-orange-100 text-orange-800',
	other: 'bg-gray-100 text-gray-800',
};

export function ServiceManagement({
	services,
	onCreate,
	onUpdate,
	onDelete,
}: ServiceManagementProps) {
	const [searchTerm, setSearchTerm] = useState('');
	const [categoryFilter, setCategoryFilter] = useState<string>('all');
	const [statusFilter, setStatusFilter] = useState<string>('all');
	const [showDialog, setShowDialog] = useState(false);
	const [editingService, setEditingService] = useState<Service | null>(null);

	const [formData, setFormData] = useState({
		name: '',
		code: '',
		description: '',
		category: 'examination' as Service['category'],
		price: '',
		unit: 'lần',
		duration: '',
		isActive: true,
	});

	const filteredServices = services.filter((service) => {
		const matchesSearch =
			service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			service.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
			service.description?.toLowerCase().includes(searchTerm.toLowerCase());

		const matchesCategory =
			categoryFilter === 'all' || service.category === categoryFilter;

		const matchesStatus =
			statusFilter === 'all' ||
			(statusFilter === 'active' && service.isActive) ||
			(statusFilter === 'inactive' && !service.isActive);

		return matchesSearch && matchesCategory && matchesStatus;
	});

	const { itemsPerPage, setItemsPerPage, currentPage, totalPages, paginatedData, totalItems, startIndex, endIndex, goToPage } = usePagination({
		data: filteredServices,
		itemsPerPage: 10,
	});

	const handleOpenDialog = (service?: Service) => {
		if (service) {
			setEditingService(service);
			setFormData({
				name: service.name,
				code: service.code || '',
				description: service.description || '',
				category: service.category,
				price: service.price.toString(),
				unit: service.unit || 'lần',
				duration: service.duration?.toString() || '',
				isActive: service.isActive,
			});
		} else {
			setEditingService(null);
			setFormData({
				name: '',
				code: '',
				description: '',
				category: 'examination',
				price: '',
				unit: 'lần',
				duration: '',
				isActive: true,
			});
		}
		setShowDialog(true);
	};

	const handleCloseDialog = () => {
		setShowDialog(false);
		setEditingService(null);
	};

	const handleSubmit = () => {
		if (!formData.name || !formData.price) {
			toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
			return;
		}

		const price = parseFloat(formData.price);
		if (isNaN(price) || price < 0) {
			toast.error('Giá dịch vụ không hợp lệ');
			return;
		}

		const serviceData = {
			name: formData.name,
			code: formData.code || undefined,
			description: formData.description || undefined,
			category: formData.category,
			price,
			unit: formData.unit || undefined,
			duration: formData.duration ? parseInt(formData.duration) : undefined,
			isActive: formData.isActive,
		};

		if (editingService) {
			onUpdate(editingService.id, serviceData);
			toast.success('Cập nhật dịch vụ thành công');
		} else {
			onCreate(serviceData);
			toast.success('Tạo dịch vụ thành công');
		}

		handleCloseDialog();
	};

	const handleDelete = (id: string) => {
		if (confirm('Bạn có chắc chắn muốn xóa dịch vụ này?')) {
			onDelete(id);
			toast.success('Xóa dịch vụ thành công');
		}
	};

	const formatPrice = (price: number) => {
		return new Intl.NumberFormat('vi-VN', {
			style: 'currency',
			currency: 'VND',
		}).format(price);
	};

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h2 className="text-2xl font-bold flex flex-col gap-2">
						<div className="flex items-center gap-2">
							<Package className="h-5 w-5" />
							Quản lý Dịch vụ
						</div>
						<p className="text-gray-600 mt-1">
							Quản lý danh sách các dịch vụ y tế
						</p>
					</h2>
				</div>
				<div className="flex items-center gap-3">
					<div className="px-3 py-1.5 bg-white/80 backdrop-blur-sm rounded-lg border border-gray-200 shadow-sm">
						<span className="text-sm text-gray-600">Tổng:</span>
						<span className="text-sm ml-1">{totalItems}</span>
					</div>
					<motion.div>
						<Button
							onClick={() => handleOpenDialog()}
							className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-lg shadow-blue-500/30"
						>
							<Plus className="h-4 w-4 mr-2" />
							Thêm dịch vụ
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
								placeholder="Tìm kiếm theo tên, mã dịch vụ..."
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								className="pl-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
							/>
						</div>
						<Select value={categoryFilter} onValueChange={setCategoryFilter}>
							<SelectTrigger className="w-full md:w-64 border-gray-200">
								<SelectValue placeholder="Loại dịch vụ" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">Tất cả loại</SelectItem>
								<SelectItem value="examination">Khám</SelectItem>
								<SelectItem value="test">Xét nghiệm</SelectItem>
								<SelectItem value="imaging">Chẩn đoán hình ảnh</SelectItem>
								<SelectItem value="procedure">Thủ thuật</SelectItem>
								<SelectItem value="other">Khác</SelectItem>
							</SelectContent>
						</Select>
						<Select value={statusFilter} onValueChange={setStatusFilter}>
							<SelectTrigger className="w-full md:w-64 border-gray-200">
								<SelectValue placeholder="Trạng thái" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">Tất cả</SelectItem>
								<SelectItem value="active">Đang hoạt động</SelectItem>
								<SelectItem value="inactive">Ngừng hoạt động</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</CardHeader>
				<CardContent>
					{/* Table */}
					<div className="rounded-xl border border-gray-200 overflow-hidden">
						<Table>
							<TableHeader>
								<TableRow className="bg-gray-50/80 hover:bg-gray-50">
									<TableHead>Mã</TableHead>
									<TableHead>Tên dịch vụ</TableHead>
									<TableHead>Loại</TableHead>
									<TableHead>Giá</TableHead>
									<TableHead>Đơn vị</TableHead>
									<TableHead>Thời gian (phút)</TableHead>
									<TableHead>Trạng thái</TableHead>
									<TableHead className="text-right">Thao tác</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{paginatedData.length === 0 ? (
									<TableRow>
										<TableCell colSpan={8} className="text-center py-12">
											<div className="flex flex-col items-center gap-3 text-gray-500">
												<Package className="h-12 w-12 text-gray-300" />
												<p>Không tìm thấy dịch vụ nào</p>
												<Button
													onClick={() => handleOpenDialog()}
													variant="outline"
													className="mt-2"
												>
													<Plus className="h-4 w-4 mr-2" />
													Thêm dịch vụ mới
												</Button>
											</div>
										</TableCell>
									</TableRow>
								) : (
									paginatedData.map((service, index) => (
									<motion.tr
										key={service.id}
										initial={{ opacity: 0, y: 20 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{ delay: index * 0.05 }}
										className="border-b border-gray-200 hover:bg-gray-50/80 transition-colors"
									>
											<TableCell>
												{service.code ? (
													<span className="font-mono text-sm bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
														{service.code}
													</span>
												) : (
													<span className="text-gray-400">-</span>
												)}
											</TableCell>
											<TableCell className="font-medium">
												{service.name}
											</TableCell>
											<TableCell>
												<Badge className={categoryColors[service.category]}>
													{categoryLabels[service.category]}
												</Badge>
											</TableCell>
											<TableCell className="font-medium">
												{formatPrice(service.price)}
											</TableCell>
											<TableCell className="text-gray-600">
												{service.unit || '-'}
											</TableCell>
											<TableCell className="text-gray-600">
												{service.duration || '-'}
											</TableCell>
											<TableCell>
												{service.isActive ? (
													<Badge className="bg-green-100 text-green-800 border-0">
														<CheckCircle2 className="h-3 w-3 mr-1" />
														Hoạt động
													</Badge>
												) : (
													<Badge className="bg-red-100 text-red-800 border-0">
														<XCircle className="h-3 w-3 mr-1" />
														Ngừng
													</Badge>
												)}
											</TableCell>
											<TableCell className="text-right">
												<div className="flex justify-end gap-2">
													<Button
														variant="ghost"
														size="sm"
														onClick={() => handleOpenDialog(service)}
														className="hover:bg-blue-50 hover:text-blue-600"
													>
														<Edit className="h-4 w-4 mr-1" />
														Sửa
													</Button>
													<Button
														variant="ghost"
														size="sm"
														onClick={() => handleDelete(service.id)}
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
						onItemsPerPageChange={setItemsPerPage}
					/>
				</CardContent>
			</Card>

			{/* Dialog */}
			<Dialog open={showDialog} onOpenChange={setShowDialog}>
				<DialogContent className="max-w-[95vw] lg:max-w-3xl max-h-[95vh] overflow-hidden p-0 gap-0 bg-gradient-to-br from-gray-50 to-white border-0 shadow-none">
					<div className="overflow-y-auto max-h-[95vh]">
						<div className="p-6">
							<DialogHeader>
								<DialogTitle>
									{editingService ? 'Chỉnh sửa dịch vụ' : 'Thêm dịch vụ mới'}
								</DialogTitle>
								<DialogDescription>
									{editingService
										? 'Cập nhật thông tin dịch vụ'
										: 'Điền thông tin để tạo dịch vụ mới'}
								</DialogDescription>
							</DialogHeader>
							<div className="space-y-4 mt-6">
								<div className="grid grid-cols-2 gap-4">
									<div className="space-y-2">
										<Label htmlFor="name">
											Tên dịch vụ <span className="text-red-500">*</span>
										</Label>
										<Input
											id="name"
											value={formData.name}
											onChange={(e) =>
												setFormData({ ...formData, name: e.target.value })
											}
											placeholder="Nhập tên dịch vụ"
										/>
									</div>
									<div className="space-y-2">
										<Label htmlFor="code">Mã dịch vụ</Label>
										<Input
											id="code"
											value={formData.code}
											onChange={(e) =>
												setFormData({ ...formData, code: e.target.value })
											}
											placeholder="Nhập mã dịch vụ"
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
										placeholder="Nhập mô tả dịch vụ"
										rows={3}
									/>
								</div>
								<div className="grid grid-cols-2 gap-4">
									<div className="space-y-2">
										<Label htmlFor="category">Loại dịch vụ</Label>
										<Select
											value={formData.category}
											onValueChange={(value) =>
												setFormData({
													...formData,
													category: value as Service['category'],
												})
											}
										>
											<SelectTrigger>
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="examination">Khám</SelectItem>
												<SelectItem value="test">Xét nghiệm</SelectItem>
												<SelectItem value="imaging">Chẩn đoán hình ảnh</SelectItem>
												<SelectItem value="procedure">Thủ thuật</SelectItem>
												<SelectItem value="other">Khác</SelectItem>
											</SelectContent>
										</Select>
									</div>
									<div className="space-y-2">
										<Label htmlFor="price">
											Giá <span className="text-red-500">*</span>
										</Label>
										<Input
											id="price"
											type="number"
											value={formData.price}
											onChange={(e) =>
												setFormData({ ...formData, price: e.target.value })
											}
											placeholder="Nhập giá dịch vụ"
											min="0"
										/>
									</div>
								</div>
								<div className="grid grid-cols-2 gap-4">
									<div className="space-y-2">
										<Label htmlFor="unit">Đơn vị</Label>
										<Input
											id="unit"
											value={formData.unit}
											onChange={(e) =>
												setFormData({ ...formData, unit: e.target.value })
											}
											placeholder="lần, gói, v.v."
										/>
									</div>
									<div className="space-y-2">
										<Label htmlFor="duration">Thời gian (phút)</Label>
										<Input
											id="duration"
											type="number"
											value={formData.duration}
											onChange={(e) =>
												setFormData({ ...formData, duration: e.target.value })
											}
											placeholder="Nhập thời gian"
											min="0"
										/>
									</div>
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
										{editingService ? 'Cập nhật' : 'Tạo mới'}
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

