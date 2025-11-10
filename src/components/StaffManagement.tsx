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
import { Staff, UserRole, Gender } from '../types';
import {
	Search,
	Plus,
	Edit,
	Trash2,
	CheckCircle2,
	XCircle,
	Users,
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { usePagination } from '../hooks/usePagination';
import { PaginationControls } from './PaginationControls';
import { motion } from 'motion/react';

interface StaffManagementProps {
	staff: Staff[];
	onCreate: (staff: Omit<Staff, 'id' | 'createdAt' | 'updatedAt'>) => void;
	onUpdate: (id: string, staff: Partial<Staff>) => void;
	onDelete: (id: string) => void;
}

const roleLabels: Record<UserRole, string> = {
	admin: 'Quản trị viên',
	doctor: 'Bác sĩ',
	nurse: 'Điều dưỡng',
	receptionist: 'Lễ tân',
	patient: 'Bệnh nhân',
};

const roleColors: Record<UserRole, string> = {
	admin: 'bg-purple-100 text-purple-800',
	doctor: 'bg-blue-100 text-blue-800',
	nurse: 'bg-green-100 text-green-800',
	receptionist: 'bg-orange-100 text-orange-800',
	patient: 'bg-gray-100 text-gray-800',
};

const genderLabels: Record<Gender, string> = {
	male: 'Nam',
	female: 'Nữ',
	other: 'Khác',
};

export function StaffManagement({
	staff,
	onCreate,
	onUpdate,
	onDelete,
}: StaffManagementProps) {
	const [searchTerm, setSearchTerm] = useState('');
	const [roleFilter, setRoleFilter] = useState<string>('all');
	const [statusFilter, setStatusFilter] = useState<string>('all');
	const [showDialog, setShowDialog] = useState(false);
	const [editingStaff, setEditingStaff] = useState<Staff | null>(null);

	const [formData, setFormData] = useState({
		fullName: '',
		code: '',
		email: '',
		phoneNumber: '',
		dateOfBirth: '',
		gender: 'male' as Gender,
		role: 'receptionist' as UserRole,
		specialty: '',
		position: '',
		department: '',
		address: '',
		isActive: true,
	});

	const filteredStaff = staff.filter((s) => {
		const matchesSearch =
			s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
			s.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
			s.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
			s.phoneNumber.includes(searchTerm);

		const matchesRole = roleFilter === 'all' || s.role === roleFilter;

		const matchesStatus =
			statusFilter === 'all' ||
			(statusFilter === 'active' && s.isActive) ||
			(statusFilter === 'inactive' && !s.isActive);

		return matchesSearch && matchesRole && matchesStatus;
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
		data: filteredStaff,
		itemsPerPage: 10,
	});

	const handleOpenDialog = (staffMember?: Staff) => {
		if (staffMember) {
			setEditingStaff(staffMember);
			setFormData({
				fullName: staffMember.fullName,
				code: staffMember.code || '',
				email: staffMember.email || '',
				phoneNumber: staffMember.phoneNumber,
				dateOfBirth: staffMember.dateOfBirth || '',
				gender: staffMember.gender,
				role: staffMember.role,
				specialty: staffMember.specialty || '',
				position: staffMember.position || '',
				department: staffMember.department || '',
				address: staffMember.address || '',
				isActive: staffMember.isActive,
			});
		} else {
			setEditingStaff(null);
			setFormData({
				fullName: '',
				code: '',
				email: '',
				phoneNumber: '',
				dateOfBirth: '',
				gender: 'male',
				role: 'receptionist',
				specialty: '',
				position: '',
				department: '',
				address: '',
				isActive: true,
			});
		}
		setShowDialog(true);
	};

	const handleCloseDialog = () => {
		setShowDialog(false);
		setEditingStaff(null);
	};

	const handleSubmit = () => {
		if (!formData.fullName || !formData.phoneNumber) {
			toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
			return;
		}

		const staffData = {
			fullName: formData.fullName,
			code: formData.code || undefined,
			email: formData.email || undefined,
			phoneNumber: formData.phoneNumber,
			dateOfBirth: formData.dateOfBirth || undefined,
			gender: formData.gender,
			role: formData.role,
			specialty: formData.specialty || undefined,
			position: formData.position || undefined,
			department: formData.department || undefined,
			address: formData.address || undefined,
			isActive: formData.isActive,
		};

		if (editingStaff) {
			onUpdate(editingStaff.id, staffData);
			toast.success('Cập nhật nhân viên thành công');
		} else {
			onCreate(staffData);
			toast.success('Tạo nhân viên thành công');
		}

		handleCloseDialog();
	};

	const handleDelete = (id: string) => {
		if (confirm('Bạn có chắc chắn muốn xóa nhân viên này?')) {
			onDelete(id);
			toast.success('Xóa nhân viên thành công');
		}
	};

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h2 className="text-2xl font-bold flex flex-col gap-2">
						<div className="flex items-center gap-2">
							<Users className="h-5 w-5" />
							Quản lý Nhân viên
						</div>
						<p className="text-gray-600 mt-1">
							Quản lý danh sách nhân viên phòng khám
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
							Thêm nhân viên
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
								placeholder="Tìm kiếm theo tên, mã, email, số điện thoại..."
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								className="pl-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
							/>
						</div>
						<Select value={roleFilter} onValueChange={setRoleFilter}>
							<SelectTrigger className="w-full md:w-64 border-gray-200">
								<SelectValue placeholder="Vai trò" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">Tất cả vai trò</SelectItem>
								<SelectItem value="admin">Quản trị viên</SelectItem>
								<SelectItem value="doctor">Bác sĩ</SelectItem>
								<SelectItem value="nurse">Điều dưỡng</SelectItem>
								<SelectItem value="receptionist">Lễ tân</SelectItem>
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
									<TableHead>Họ tên</TableHead>
									<TableHead>Vai trò</TableHead>
									<TableHead>Chuyên khoa</TableHead>
									<TableHead>Điện thoại</TableHead>
									<TableHead>Email</TableHead>
									<TableHead>Trạng thái</TableHead>
									<TableHead className="text-right">Thao tác</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{paginatedData.length === 0 ? (
									<TableRow>
										<TableCell
											colSpan={8}
											className="text-center py-12"
										>
											<div className="flex flex-col items-center gap-3 text-gray-500">
												<Users className="h-12 w-12 text-gray-300" />
												<p>Không tìm thấy nhân viên nào</p>
												<Button
													onClick={() => handleOpenDialog()}
													variant="outline"
													className="mt-2"
												>
													<Plus className="h-4 w-4 mr-2" />
													Thêm nhân viên mới
												</Button>
											</div>
										</TableCell>
									</TableRow>
								) : (
									paginatedData.map((staffMember, index) => (
									<motion.tr
										key={staffMember.id}
										initial={{ opacity: 0, y: 20 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{ delay: index * 0.05 }}
										className="border-b border-gray-200 hover:bg-gray-50/80 transition-colors"
									>
											<TableCell>
												{staffMember.code ? (
													<span className="font-mono text-sm bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
														{staffMember.code}
													</span>
												) : (
													<span className="text-gray-400">-</span>
												)}
											</TableCell>
											<TableCell className="font-medium">
												{staffMember.fullName}
											</TableCell>
											<TableCell>
												<Badge className={roleColors[staffMember.role]}>
													{roleLabels[staffMember.role]}
												</Badge>
											</TableCell>
											<TableCell className="text-gray-600">
												{staffMember.specialty || '-'}
											</TableCell>
											<TableCell className="text-gray-600">{staffMember.phoneNumber}</TableCell>
											<TableCell className="text-gray-600">{staffMember.email || '-'}</TableCell>
											<TableCell>
												{staffMember.isActive ? (
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
														onClick={() => handleOpenDialog(staffMember)}
														className="hover:bg-blue-50 hover:text-blue-600"
													>
														<Edit className="h-4 w-4 mr-1" />
														Sửa
													</Button>
													<Button
														variant="ghost"
														size="sm"
														onClick={() => handleDelete(staffMember.id)}
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
				<DialogContent className="max-w-[95vw] lg:max-w-4xl max-h-[95vh] overflow-hidden p-0 gap-0 bg-gradient-to-br from-gray-50 to-white border-0 shadow-none">
					<div className="overflow-y-auto max-h-[95vh]">
						<div className="p-6">
							<DialogHeader>
								<DialogTitle>
									{editingStaff ? 'Chỉnh sửa nhân viên' : 'Thêm nhân viên mới'}
								</DialogTitle>
								<DialogDescription>
									{editingStaff
										? 'Cập nhật thông tin nhân viên'
										: 'Điền thông tin để tạo nhân viên mới'}
								</DialogDescription>
							</DialogHeader>
							<div className="space-y-4 mt-6">
								<div className="grid grid-cols-2 gap-4">
									<div className="space-y-2">
										<Label htmlFor="fullName">
											Họ tên <span className="text-red-500">*</span>
										</Label>
										<Input
											id="fullName"
											value={formData.fullName}
											onChange={(e) =>
												setFormData({ ...formData, fullName: e.target.value })
											}
											placeholder="Nhập họ tên"
										/>
									</div>
									<div className="space-y-2">
										<Label htmlFor="code">Mã nhân viên</Label>
										<Input
											id="code"
											value={formData.code}
											onChange={(e) =>
												setFormData({ ...formData, code: e.target.value })
											}
											placeholder="Nhập mã nhân viên"
										/>
									</div>
								</div>
								<div className="grid grid-cols-2 gap-4">
									<div className="space-y-2">
										<Label htmlFor="phoneNumber">
											Điện thoại <span className="text-red-500">*</span>
										</Label>
										<Input
											id="phoneNumber"
											value={formData.phoneNumber}
											onChange={(e) =>
												setFormData({ ...formData, phoneNumber: e.target.value })
											}
											placeholder="Nhập số điện thoại"
										/>
									</div>
									<div className="space-y-2">
										<Label htmlFor="email">Email</Label>
										<Input
											id="email"
											type="email"
											value={formData.email}
											onChange={(e) =>
												setFormData({ ...formData, email: e.target.value })
											}
											placeholder="Nhập email"
										/>
									</div>
								</div>
								<div className="grid grid-cols-3 gap-4">
									<div className="space-y-2">
										<Label htmlFor="dateOfBirth">Ngày sinh</Label>
										<Input
											id="dateOfBirth"
											type="date"
											value={formData.dateOfBirth}
											onChange={(e) =>
												setFormData({ ...formData, dateOfBirth: e.target.value })
											}
										/>
									</div>
									<div className="space-y-2">
										<Label htmlFor="gender">Giới tính</Label>
										<Select
											value={formData.gender}
											onValueChange={(value) =>
												setFormData({ ...formData, gender: value as Gender })
											}
										>
											<SelectTrigger>
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="male">Nam</SelectItem>
												<SelectItem value="female">Nữ</SelectItem>
												<SelectItem value="other">Khác</SelectItem>
											</SelectContent>
										</Select>
									</div>
									<div className="space-y-2">
										<Label htmlFor="role">Vai trò</Label>
										<Select
											value={formData.role}
											onValueChange={(value) =>
												setFormData({ ...formData, role: value as UserRole })
											}
										>
											<SelectTrigger>
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="admin">Quản trị viên</SelectItem>
												<SelectItem value="doctor">Bác sĩ</SelectItem>
												<SelectItem value="nurse">Điều dưỡng</SelectItem>
												<SelectItem value="receptionist">Lễ tân</SelectItem>
											</SelectContent>
										</Select>
									</div>
								</div>
								{formData.role === 'doctor' && (
									<div className="space-y-2">
										<Label htmlFor="specialty">Chuyên khoa</Label>
										<Input
											id="specialty"
											value={formData.specialty}
											onChange={(e) =>
												setFormData({ ...formData, specialty: e.target.value })
											}
											placeholder="Nhập chuyên khoa"
										/>
									</div>
								)}
								<div className="grid grid-cols-2 gap-4">
									<div className="space-y-2">
										<Label htmlFor="position">Chức vụ</Label>
										<Input
											id="position"
											value={formData.position}
											onChange={(e) =>
												setFormData({ ...formData, position: e.target.value })
											}
											placeholder="Nhập chức vụ"
										/>
									</div>
									<div className="space-y-2">
										<Label htmlFor="department">Phòng ban</Label>
										<Input
											id="department"
											value={formData.department}
											onChange={(e) =>
												setFormData({ ...formData, department: e.target.value })
											}
											placeholder="Nhập phòng ban"
										/>
									</div>
								</div>
								<div className="space-y-2">
									<Label htmlFor="address">Địa chỉ</Label>
									<Textarea
										id="address"
										value={formData.address}
										onChange={(e) =>
											setFormData({ ...formData, address: e.target.value })
										}
										placeholder="Nhập địa chỉ"
										rows={2}
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
										{editingStaff ? 'Cập nhật' : 'Tạo mới'}
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

