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
import { Checkbox } from './ui/checkbox';
import { Service, ServicePackage } from '../types';
import {
	Search,
	Plus,
	Edit,
	Trash2,
	CheckCircle2,
	XCircle,
	Package,
	X,
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { usePagination } from '../hooks/usePagination';
import { PaginationControls } from './PaginationControls';
import { motion } from 'motion/react';

interface ServicePackageManagementProps {
	packages: ServicePackage[];
	services: Service[];
	onCreate: (
		packageData: Omit<ServicePackage, 'id' | 'createdAt' | 'updatedAt'>,
	) => void;
	onUpdate: (id: string, packageData: Partial<ServicePackage>) => void;
	onDelete: (id: string) => void;
}

export function ServicePackageManagement({
	packages,
	services,
	onCreate,
	onUpdate,
	onDelete,
}: ServicePackageManagementProps) {
	const [searchTerm, setSearchTerm] = useState('');
	const [statusFilter, setStatusFilter] = useState<string>('all');
	const [showDialog, setShowDialog] = useState(false);
	const [editingPackage, setEditingPackage] = useState<ServicePackage | null>(
		null,
	);

	const [formData, setFormData] = useState({
		name: '',
		code: '',
		description: '',
		services: [] as string[],
		price: '',
		discount: '',
		isActive: true,
	});

	const filteredPackages = packages.filter((pkg) => {
		const matchesSearch =
			pkg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			pkg.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
			pkg.description?.toLowerCase().includes(searchTerm.toLowerCase());

		const matchesStatus =
			statusFilter === 'all' ||
			(statusFilter === 'active' && pkg.isActive) ||
			(statusFilter === 'inactive' && !pkg.isActive);

		return matchesSearch && matchesStatus;
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
		data: filteredPackages,
		itemsPerPage: 10,
	});

	const handleOpenDialog = (pkg?: ServicePackage) => {
		if (pkg) {
			setEditingPackage(pkg);
			setFormData({
				name: pkg.name,
				code: pkg.code || '',
				description: pkg.description || '',
				services: pkg.services,
				price: pkg.price.toString(),
				discount: pkg.discount?.toString() || '',
				isActive: pkg.isActive,
			});
		} else {
			setEditingPackage(null);
			setFormData({
				name: '',
				code: '',
				description: '',
				services: [],
				price: '',
				discount: '',
				isActive: true,
			});
		}
		setShowDialog(true);
	};

	const handleCloseDialog = () => {
		setShowDialog(false);
		setEditingPackage(null);
	};

	const handleSubmit = () => {
		if (!formData.name || !formData.price) {
			toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
			return;
		}

		if (formData.services.length === 0) {
			toast.error('Vui lòng chọn ít nhất một dịch vụ');
			return;
		}

		const price = parseFloat(formData.price);
		if (isNaN(price) || price < 0) {
			toast.error('Giá gói không hợp lệ');
			return;
		}

		const discount = formData.discount
			? parseFloat(formData.discount)
			: undefined;
		if (discount !== undefined && (isNaN(discount) || discount < 0 || discount > 100)) {
			toast.error('Phần trăm giảm giá không hợp lệ (0-100)');
			return;
		}

		const packageData = {
			name: formData.name,
			code: formData.code || undefined,
			description: formData.description || undefined,
			services: formData.services,
			price,
			discount,
			isActive: formData.isActive,
		};

		if (editingPackage) {
			onUpdate(editingPackage.id, packageData);
			toast.success('Cập nhật gói dịch vụ thành công');
		} else {
			onCreate(packageData);
			toast.success('Tạo gói dịch vụ thành công');
		}

		handleCloseDialog();
	};

	const handleDelete = (id: string) => {
		if (confirm('Bạn có chắc chắn muốn xóa gói dịch vụ này?')) {
			onDelete(id);
			toast.success('Xóa gói dịch vụ thành công');
		}
	};

	const handleToggleService = (serviceId: string) => {
		const isSelected = formData.services.includes(serviceId);
		if (isSelected) {
			setFormData({
				...formData,
				services: formData.services.filter((id) => id !== serviceId),
			});
		} else {
			setFormData({
				...formData,
				services: [...formData.services, serviceId],
			});
		}
	};

	const formatPrice = (price: number) => {
		return new Intl.NumberFormat('vi-VN', {
			style: 'currency',
			currency: 'VND',
		}).format(price);
	};

	const calculateTotalPrice = () => {
		return formData.services.reduce((total, serviceId) => {
			const service = services.find((s) => s.id === serviceId);
			return total + (service?.price || 0);
		}, 0);
	};

	const getSelectedServices = () => {
		return services.filter((s) => formData.services.includes(s.id));
	};

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h2 className="text-2xl font-bold flex flex-col gap-2">
						<div className="flex items-center gap-2">
							<Package className="h-5 w-5" />
							Quản lý Gói dịch vụ
						</div>
						<p className="text-gray-600 mt-1">
							Quản lý các gói dịch vụ y tế
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
							Thêm gói dịch vụ
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
								placeholder="Tìm kiếm theo tên, mã gói dịch vụ..."
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								className="pl-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
							/>
						</div>
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
									<TableHead>Tên gói</TableHead>
									<TableHead>Số dịch vụ</TableHead>
									<TableHead>Giá</TableHead>
									<TableHead>Giảm giá</TableHead>
									<TableHead>Trạng thái</TableHead>
									<TableHead className="text-right">Thao tác</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{paginatedData.length === 0 ? (
									<TableRow>
										<TableCell
											colSpan={7}
											className="text-center py-12"
										>
											<div className="flex flex-col items-center gap-3 text-gray-500">
												<Package className="h-12 w-12 text-gray-300" />
												<p>Không tìm thấy gói dịch vụ nào</p>
												<Button
													onClick={() => handleOpenDialog()}
													variant="outline"
													className="mt-2"
												>
													<Plus className="h-4 w-4 mr-2" />
													Thêm gói dịch vụ mới
												</Button>
											</div>
										</TableCell>
									</TableRow>
								) : (
									paginatedData.map((pkg, index) => {
										const packageServices = services.filter((s) =>
											pkg.services.includes(s.id),
										);
										const totalServicePrice = packageServices.reduce(
											(sum, s) => sum + s.price,
											0,
										);

										return (
											<motion.tr
												key={pkg.id}
												initial={{ opacity: 0, y: 20 }}
												animate={{ opacity: 1, y: 0 }}
												transition={{ delay: index * 0.05 }}
												className="border-b border-gray-200 hover:bg-gray-50/80 transition-colors"
											>
												<TableCell>
													{pkg.code ? (
														<span className="font-mono text-sm bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
															{pkg.code}
														</span>
													) : (
														<span className="text-gray-400">-</span>
													)}
												</TableCell>
												<TableCell className="font-medium">
													{pkg.name}
												</TableCell>
												<TableCell>
													<Badge variant="outline" className="border-gray-300">
														{pkg.services.length} dịch vụ
													</Badge>
												</TableCell>
												<TableCell>
													<div className="flex flex-col">
														<span className="font-medium">{formatPrice(pkg.price)}</span>
														{pkg.discount && (
															<span className="text-xs text-gray-500">
																Giá gốc: {formatPrice(totalServicePrice)}
															</span>
														)}
													</div>
												</TableCell>
												<TableCell>
													{pkg.discount ? (
														<Badge className="bg-green-100 text-green-800 border-0">
															-{pkg.discount}%
														</Badge>
													) : (
														<span className="text-gray-400">-</span>
													)}
												</TableCell>
												<TableCell>
													{pkg.isActive ? (
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
															onClick={() => handleOpenDialog(pkg)}
															className="hover:bg-blue-50 hover:text-blue-600"
														>
															<Edit className="h-4 w-4 mr-1" />
															Sửa
														</Button>
														<Button
															variant="ghost"
															size="sm"
															onClick={() => handleDelete(pkg.id)}
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
									{editingPackage
										? 'Chỉnh sửa gói dịch vụ'
										: 'Thêm gói dịch vụ mới'}
								</DialogTitle>
								<DialogDescription>
									{editingPackage
										? 'Cập nhật thông tin gói dịch vụ'
										: 'Điền thông tin để tạo gói dịch vụ mới'}
								</DialogDescription>
							</DialogHeader>
							<div className="space-y-4 mt-6">
								<div className="grid grid-cols-2 gap-4">
									<div className="space-y-2">
										<Label htmlFor="name">
											Tên gói <span className="text-red-500">*</span>
										</Label>
										<Input
											id="name"
											value={formData.name}
											onChange={(e) =>
												setFormData({ ...formData, name: e.target.value })
											}
											placeholder="Nhập tên gói dịch vụ"
										/>
									</div>
									<div className="space-y-2">
										<Label htmlFor="code">Mã gói</Label>
										<Input
											id="code"
											value={formData.code}
											onChange={(e) =>
												setFormData({ ...formData, code: e.target.value })
											}
											placeholder="Nhập mã gói"
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
										placeholder="Nhập mô tả gói dịch vụ"
										rows={3}
									/>
								</div>
								<div className="space-y-2">
									<Label>
										Chọn dịch vụ <span className="text-red-500">*</span>
									</Label>
									<div className="border rounded-md p-4 max-h-64 overflow-y-auto border-gray-200">
										{services.length === 0 ? (
											<p className="text-sm text-gray-500">
												Chưa có dịch vụ nào. Vui lòng tạo dịch vụ trước.
											</p>
										) : (
											<div className="space-y-2">
												{services.map((service) => (
													<div
														key={service.id}
														className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded transition-colors"
													>
														<Checkbox
															id={service.id}
															checked={formData.services.includes(service.id)}
															onCheckedChange={() =>
																handleToggleService(service.id)
															}
															className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
														/>
														<Label
															htmlFor={service.id}
															className="flex-1 cursor-pointer"
														>
															<div className="flex items-center justify-between">
																<span className="font-medium">{service.name}</span>
																<span className="text-sm text-gray-500">
																	{formatPrice(service.price)}
																</span>
															</div>
														</Label>
													</div>
												))}
											</div>
										)}
									</div>
									{formData.services.length > 0 && (
										<div className="mt-2 p-2 bg-blue-50 rounded-md border border-blue-200">
											<p className="text-sm font-medium text-blue-900">
												Đã chọn {formData.services.length} dịch vụ
											</p>
											<p className="text-xs text-blue-700">
												Tổng giá: {formatPrice(calculateTotalPrice())}
											</p>
										</div>
									)}
								</div>
								<div className="grid grid-cols-2 gap-4">
									<div className="space-y-2">
										<Label htmlFor="price">
											Giá gói <span className="text-red-500">*</span>
										</Label>
										<Input
											id="price"
											type="number"
											value={formData.price}
											onChange={(e) =>
												setFormData({ ...formData, price: e.target.value })
											}
											placeholder="Nhập giá gói"
											min="0"
										/>
									</div>
									<div className="space-y-2">
										<Label htmlFor="discount">Giảm giá (%)</Label>
										<Input
											id="discount"
											type="number"
											value={formData.discount}
											onChange={(e) =>
												setFormData({ ...formData, discount: e.target.value })
											}
											placeholder="0-100"
											min="0"
											max="100"
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
										{editingPackage ? 'Cập nhật' : 'Tạo mới'}
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

