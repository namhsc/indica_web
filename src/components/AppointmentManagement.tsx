import React, { useState, useMemo, useEffect } from 'react';
import {
	Card,
	CardContent,
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
} from './ui/dialog';
import { Appointment, Customer } from '../types';
import {
	Search,
	Plus,
	Edit,
	Trash2,
	Calendar,
	Clock,
	User,
} from 'lucide-react';
import { toast } from 'sonner';
import { usePagination } from '../hooks/usePagination';
import { PaginationControls } from './PaginationControls';
import { DatePicker } from './ui/date-picker';
import { mockDoctors, mockServices } from '../lib/mockData';

interface AppointmentManagementProps {
	appointments: Appointment[];
	customers: Customer[];
	onCreate: (appointment: Omit<Appointment, 'id' | 'code' | 'createdAt' | 'updatedAt'>) => void;
	onUpdate: (id: string, appointment: Partial<Appointment>) => void;
	onDelete: (id: string) => void;
}

const statusLabels: Record<Appointment['status'], string> = {
	pending: 'Chờ xác nhận',
	confirmed: 'Đã xác nhận',
	cancelled: 'Đã hủy',
	completed: 'Hoàn thành',
};

const statusColors: Record<Appointment['status'], string> = {
	pending: 'bg-yellow-100 text-yellow-800',
	confirmed: 'bg-blue-100 text-blue-800',
	cancelled: 'bg-red-100 text-red-800',
	completed: 'bg-green-100 text-green-800',
};

export function AppointmentManagement({
	appointments = [],
	customers = [],
	onCreate,
	onUpdate,
	onDelete,
}: AppointmentManagementProps) {
	const [searchTerm, setSearchTerm] = useState('');
	const [statusFilter, setStatusFilter] = useState<string>('all');
	const [dateFilter, setDateFilter] = useState<string>('');
	const [showDialog, setShowDialog] = useState(false);
	const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);

	const [formData, setFormData] = useState({
		customerId: '',
		appointmentDate: '',
		appointmentTime: '',
		services: [] as string[],
		doctorId: '',
		reason: '',
		status: 'pending' as Appointment['status'],
	});

	// Generate time slots
	const timeSlots = useMemo(() => {
		const slots = [];
		for (let hour = 7; hour <= 17; hour++) {
			for (let minute = 0; minute < 60; minute += 30) {
				const timeString = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
				slots.push(timeString);
			}
		}
		return slots;
	}, []);

	// Get customer name helper
	const getCustomerName = (customerId: string) => {
		const customer = customers.find((c) => c.id === customerId);
		return customer?.fullName || 'Không tìm thấy';
	};

	// Get doctor name helper
	const getDoctorName = (doctorId: string) => {
		const doctor = mockDoctors.find((d) => d.id === doctorId);
		return doctor?.name || 'Chưa phân công';
	};

	const filteredAppointments = useMemo(() => {
		return appointments.filter((apt) => {
			const customer = customers.find((c) => c.id === apt.customerId);
			const matchesSearch =
				customer?.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
				customer?.phoneNumber.includes(searchTerm) ||
				apt.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
				getDoctorName(apt.doctorId).toLowerCase().includes(searchTerm.toLowerCase());

			const matchesStatus = statusFilter === 'all' || apt.status === statusFilter;

			const matchesDate = !dateFilter || apt.appointmentDate === dateFilter;

			return matchesSearch && matchesStatus && matchesDate;
		});
	}, [appointments, customers, searchTerm, statusFilter, dateFilter]);

	const {
		itemsPerPage,
		currentPage,
		totalPages,
		paginatedData,
		totalItems,
		startIndex,
		endIndex,
		goToPage,
	} = usePagination(filteredAppointments, 10);

	const handleOpenDialog = (appointment?: Appointment) => {
		if (appointment) {
			setEditingAppointment(appointment);
			setFormData({
				customerId: appointment.customerId,
				appointmentDate: appointment.appointmentDate,
				appointmentTime: appointment.appointmentTime,
				services: appointment.services,
				doctorId: appointment.doctorId,
				reason: appointment.reason || '',
				status: appointment.status,
			});
		} else {
			setEditingAppointment(null);
			setFormData({
				customerId: '',
				appointmentDate: '',
				appointmentTime: '',
				services: [],
				doctorId: '',
				reason: '',
				status: 'pending',
			});
		}
		setShowDialog(true);
	};

	const handleCloseDialog = () => {
		setShowDialog(false);
		setEditingAppointment(null);
	};

	const handleToggleService = (service: string) => {
		setFormData({
			...formData,
			services: formData.services.includes(service)
				? formData.services.filter((s) => s !== service)
				: [...formData.services, service],
		});
	};

	const handleSubmit = () => {
		if (!formData.customerId) {
			toast.error('Vui lòng chọn khách hàng');
			return;
		}
		if (!formData.appointmentDate) {
			toast.error('Vui lòng chọn ngày khám');
			return;
		}
		if (!formData.appointmentTime) {
			toast.error('Vui lòng chọn giờ khám');
			return;
		}
		if (!formData.doctorId) {
			toast.error('Vui lòng chọn bác sĩ');
			return;
		}

		const selectedDoctor = mockDoctors.find((d) => d.id === formData.doctorId);
		if (!selectedDoctor) {
			toast.error('Không tìm thấy bác sĩ');
			return;
		}

		const appointmentData: Omit<Appointment, 'id' | 'code' | 'createdAt' | 'updatedAt'> = {
			customerId: formData.customerId,
			appointmentDate: formData.appointmentDate,
			appointmentTime: formData.appointmentTime,
			services: formData.services,
			doctor: selectedDoctor.name,
			doctorId: formData.doctorId,
			reason: formData.reason || undefined,
			status: formData.status,
		};

		if (editingAppointment) {
			onUpdate(editingAppointment.id, appointmentData);
			toast.success('Cập nhật lịch khám thành công');
		} else {
			onCreate(appointmentData);
			toast.success('Tạo lịch khám thành công');
		}

		handleCloseDialog();
	};

	const handleDelete = (id: string) => {
		if (confirm('Bạn có chắc chắn muốn xóa lịch khám này?')) {
			onDelete(id);
			toast.success('Xóa lịch khám thành công');
		}
	};

	const handleStatusChange = (id: string, status: Appointment['status']) => {
		onUpdate(id, { status });
		toast.success('Cập nhật trạng thái thành công');
	};

	useEffect(() => {
		console.log('AppointmentManagement rendered', { 
			appointmentsCount: appointments.length,
			customersCount: customers.length 
		});
	}, [appointments.length, customers.length]);

	return (
		<div className="space-y-6" data-testid="appointment-management">
			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<div>
							<CardTitle className="text-2xl flex items-center gap-2">
								<Calendar className="h-6 w-6" />
								Quản lý Lịch khám
							</CardTitle>
							<p className="text-sm text-gray-600 mt-1">
								Quản lý lịch hẹn khám của khách hàng
							</p>
						</div>
						<Button onClick={() => handleOpenDialog()}>
							<Plus className="h-4 w-4 mr-2" />
							Thêm lịch khám
						</Button>
					</div>
				</CardHeader>
				<CardContent>
					{/* Debug info */}
					<div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
						<p className="text-sm text-blue-800">
							📊 Tổng số lịch khám: <strong>{appointments.length}</strong> | 
							Tổng số khách hàng: <strong>{customers.length}</strong>
						</p>
					</div>
					{customers.length === 0 && (
						<div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
							<p className="text-sm text-yellow-800">
								⚠️ Chưa có dữ liệu khách hàng. Vui lòng thêm khách hàng trước khi tạo lịch khám.
							</p>
						</div>
					)}

					{/* Filters */}
					<div className="mb-6 space-y-4">
						<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
							<div className="relative">
								<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
								<Input
									placeholder="Tìm kiếm theo tên, số điện thoại, mã lịch hẹn..."
									value={searchTerm}
									onChange={(e) => setSearchTerm(e.target.value)}
									className="pl-10"
								/>
							</div>
							<Select value={statusFilter} onValueChange={setStatusFilter}>
								<SelectTrigger>
									<SelectValue placeholder="Lọc theo trạng thái" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">Tất cả trạng thái</SelectItem>
									<SelectItem value="pending">Chờ xác nhận</SelectItem>
									<SelectItem value="confirmed">Đã xác nhận</SelectItem>
									<SelectItem value="cancelled">Đã hủy</SelectItem>
									<SelectItem value="completed">Hoàn thành</SelectItem>
								</SelectContent>
							</Select>
							<DatePicker
								date={dateFilter}
								onStringChange={setDateFilter}
								placeholder="Lọc theo ngày"
							/>
						</div>
					</div>

					{/* Table */}
					<div className="rounded-md border">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Mã lịch hẹn</TableHead>
									<TableHead>Khách hàng</TableHead>
									<TableHead>Ngày khám</TableHead>
									<TableHead>Giờ khám</TableHead>
									<TableHead>Bác sĩ</TableHead>
									<TableHead>Dịch vụ</TableHead>
									<TableHead>Trạng thái</TableHead>
									<TableHead className="text-right">Thao tác</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{paginatedData.length === 0 ? (
									<TableRow>
										<TableCell colSpan={8} className="text-center py-8">
											<p className="text-gray-500">Không có dữ liệu</p>
										</TableCell>
									</TableRow>
								) : (
									paginatedData.map((appointment) => (
										<TableRow key={appointment.id}>
											<TableCell className="font-medium">
												{appointment.code}
											</TableCell>
											<TableCell>
												<div className="flex items-center gap-2">
													<User className="h-4 w-4 text-gray-400" />
													{getCustomerName(appointment.customerId)}
												</div>
											</TableCell>
											<TableCell>
												{new Date(appointment.appointmentDate).toLocaleDateString(
													'vi-VN',
												)}
											</TableCell>
											<TableCell>
												<div className="flex items-center gap-2">
													<Clock className="h-4 w-4 text-gray-400" />
													{appointment.appointmentTime}
												</div>
											</TableCell>
											<TableCell>{getDoctorName(appointment.doctorId)}</TableCell>
											<TableCell>
												<div className="flex flex-wrap gap-1">
													{appointment.services.length > 0 ? (
														appointment.services.slice(0, 2).map((service) => (
															<Badge key={service} variant="secondary" className="text-xs">
																{service}
															</Badge>
														))
													) : (
														<span className="text-gray-400">-</span>
													)}
													{appointment.services.length > 2 && (
														<Badge variant="secondary" className="text-xs">
															+{appointment.services.length - 2}
														</Badge>
													)}
												</div>
											</TableCell>
											<TableCell>
												<Badge className={statusColors[appointment.status]}>
													{statusLabels[appointment.status]}
												</Badge>
											</TableCell>
											<TableCell className="text-right">
												<div className="flex items-center justify-end gap-2">
													<Select
														value={appointment.status}
														onValueChange={(value) =>
															handleStatusChange(
																appointment.id,
																value as Appointment['status'],
															)
														}
													>
														<SelectTrigger className="w-32 h-8">
															<SelectValue />
														</SelectTrigger>
														<SelectContent>
															<SelectItem value="pending">Chờ xác nhận</SelectItem>
															<SelectItem value="confirmed">Đã xác nhận</SelectItem>
															<SelectItem value="cancelled">Đã hủy</SelectItem>
															<SelectItem value="completed">Hoàn thành</SelectItem>
														</SelectContent>
													</Select>
													<Button
														variant="ghost"
														size="icon"
														onClick={() => handleOpenDialog(appointment)}
													>
														<Edit className="h-4 w-4" />
													</Button>
													<Button
														variant="ghost"
														size="icon"
														onClick={() => handleDelete(appointment.id)}
													>
														<Trash2 className="h-4 w-4 text-red-500" />
													</Button>
												</div>
											</TableCell>
										</TableRow>
									))
								)}
							</TableBody>
						</Table>
					</div>

					{/* Pagination */}
					{paginatedData.length > 0 && (
						<div className="mt-4">
							<PaginationControls
								currentPage={currentPage}
								totalPages={totalPages}
								onPageChange={goToPage}
								startIndex={startIndex}
								endIndex={endIndex}
								totalItems={totalItems}
							/>
						</div>
					)}
				</CardContent>
			</Card>

			{/* Dialog */}
			<Dialog open={showDialog} onOpenChange={setShowDialog}>
				<DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle>
							{editingAppointment
								? 'Chỉnh sửa lịch khám'
								: 'Thêm lịch khám mới'}
						</DialogTitle>
					</DialogHeader>
					<div className="space-y-4">
						{/* Chọn khách hàng */}
						<div className="space-y-2">
							<Label>
								Khách hàng <span className="text-red-500">*</span>
							</Label>
							<Select
								value={formData.customerId}
								onValueChange={(value) =>
									setFormData({ ...formData, customerId: value })
								}
							>
								<SelectTrigger>
									<SelectValue placeholder="Chọn khách hàng" />
								</SelectTrigger>
								<SelectContent>
									{customers.map((customer) => (
										<SelectItem key={customer.id} value={customer.id}>
											{customer.fullName} - {customer.phoneNumber}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						{/* Ngày và giờ khám */}
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label>
									Ngày khám <span className="text-red-500">*</span>
								</Label>
								<DatePicker
									date={formData.appointmentDate}
									onStringChange={(date) =>
										setFormData({ ...formData, appointmentDate: date })
									}
									placeholder="Chọn ngày khám"
									minDate={new Date().toISOString().split('T')[0]}
								/>
							</div>

							<div className="space-y-2">
								<Label>
									Giờ khám <span className="text-red-500">*</span>
								</Label>
								<Select
									value={formData.appointmentTime}
									onValueChange={(value) =>
										setFormData({ ...formData, appointmentTime: value })
									}
								>
									<SelectTrigger>
										<SelectValue placeholder="Chọn giờ khám" />
									</SelectTrigger>
									<SelectContent>
										{timeSlots.map((time) => (
											<SelectItem key={time} value={time}>
												{time}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
						</div>

						{/* Bác sĩ */}
						<div className="space-y-2">
							<Label>
								Bác sĩ <span className="text-red-500">*</span>
							</Label>
							<Select
								value={formData.doctorId}
								onValueChange={(value) =>
									setFormData({ ...formData, doctorId: value })
								}
							>
								<SelectTrigger>
									<SelectValue placeholder="Chọn bác sĩ" />
								</SelectTrigger>
								<SelectContent>
									{mockDoctors.map((doctor) => (
										<SelectItem key={doctor.id} value={doctor.id}>
											{doctor.name} - {doctor.specialty}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						{/* Dịch vụ */}
						<div className="space-y-2">
							<Label>Dịch vụ khám</Label>
							<div className="grid grid-cols-2 md:grid-cols-3 gap-2">
								{mockServices.map((service) => (
									<button
										key={service}
										type="button"
										onClick={() => handleToggleService(service)}
										className={`p-3 rounded-lg border-2 transition-all text-sm ${
											formData.services.includes(service)
												? 'border-blue-500 bg-blue-50 text-blue-700'
												: 'border-gray-200 hover:border-gray-300 bg-white'
										}`}
									>
										{service}
									</button>
								))}
							</div>
						</div>

						{/* Lý do khám */}
						<div className="space-y-2">
							<Label>Lý do khám</Label>
							<Textarea
								value={formData.reason}
								onChange={(e) =>
									setFormData({ ...formData, reason: e.target.value })
								}
								placeholder="Nhập lý do khám bệnh..."
								rows={3}
							/>
						</div>

						{/* Trạng thái (chỉ khi chỉnh sửa) */}
						{editingAppointment && (
							<div className="space-y-2">
								<Label>Trạng thái</Label>
								<Select
									value={formData.status}
									onValueChange={(value) =>
										setFormData({
											...formData,
											status: value as Appointment['status'],
										})
									}
								>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="pending">Chờ xác nhận</SelectItem>
										<SelectItem value="confirmed">Đã xác nhận</SelectItem>
										<SelectItem value="cancelled">Đã hủy</SelectItem>
										<SelectItem value="completed">Hoàn thành</SelectItem>
									</SelectContent>
								</Select>
							</div>
						)}

						<div className="flex justify-end gap-2 pt-4">
							<Button variant="outline" onClick={handleCloseDialog}>
								Hủy
							</Button>
							<Button onClick={handleSubmit}>
								{editingAppointment ? 'Cập nhật' : 'Tạo mới'}
							</Button>
						</div>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
}

