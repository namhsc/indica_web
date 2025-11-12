import React, { useState, useMemo } from 'react';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '../ui/select';
import { Badge } from '../ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from '../ui/command';
import { toast } from 'sonner@2.0.3';
import { Appointment } from '../../types';
import {
	Calendar,
	Plus,
	Clock,
	User,
	CheckCircle2,
	ChevronsUpDown,
} from 'lucide-react';
import { usePagination } from '../../hooks/usePagination';
import { PaginationControls } from '../PaginationControls';
import { useAuth } from '../../contexts/AuthContext';
import { mockDoctors, mockExaminationPackages } from '../../lib/mockData';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '../ui/card';
import { DatePicker } from '../ui/date-picker';

interface PatientAppointmentsProps {
	appointments: Appointment[];
	onCreateAppointment: (
		appointment: Omit<Appointment, 'id' | 'code' | 'createdAt' | 'updatedAt'>,
	) => void;
	onUpdateAppointment: (
		appointmentId: string,
		updates: Partial<Appointment>,
	) => void;
}

type ExaminationType = 'specialty' | 'package';

const appointmentStatusLabels = {
	pending: 'Chờ xác nhận',
	confirmed: 'Đã xác nhận',
	cancelled: 'Đã hủy',
	completed: 'Hoàn thành',
};

const appointmentStatusColors = {
	pending: 'bg-yellow-100 text-yellow-800',
	confirmed: 'bg-green-100 text-green-800',
	cancelled: 'bg-red-100 text-red-800',
	completed: 'bg-blue-100 text-blue-800',
};

const timeSlots = [
	'08:00',
	'08:30',
	'09:00',
	'09:30',
	'10:00',
	'10:30',
	'11:00',
	'11:30',
	'14:00',
	'14:30',
	'15:00',
	'15:30',
	'16:00',
	'16:30',
	'17:00',
	'17:30',
];

// Danh sách chuyên khoa
const allSpecialties = [
	'Nội khoa',
	'Ngoại khoa',
	'Tim mạch',
	'Nhi khoa',
	'Sản phụ khoa',
	'Tai mũi họng',
	'Mắt',
	'Da liễu',
	'Thần kinh',
	'Chấn thương chỉnh hình',
	'Ung bướu',
	'Hồi sức cấp cứu',
	'Xét nghiệm',
	'Chẩn đoán hình ảnh',
	'Y học cổ truyền',
	'Dinh dưỡng',
	'Vật lý trị liệu',
	'Phục hồi chức năng',
	'Răng hàm mặt',
	'Tiết niệu',
	'Tiêu hóa',
	'Hô hấp',
	'Nội tiết',
];

export function PatientAppointments({
	appointments,
	onCreateAppointment,
	onUpdateAppointment,
}: PatientAppointmentsProps) {
	const { user } = useAuth();
	const [formData, setFormData] = useState({
		appointmentDate: '',
		appointmentTime: '',
		examinationType: 'specialty' as ExaminationType,
		selectedPackage: '',
		assignedDoctorId: '',
		specialty: '',
		reason: '',
	});

	const [specialtyOpen, setSpecialtyOpen] = useState(false);
	const [specialtySearch, setSpecialtySearch] = useState('');
	const [errors, setErrors] = useState<Record<string, boolean>>({});

	const [itemsPerPage, setItemsPerPage] = useState(10);
	const {
		currentPage,
		totalPages,
		paginatedData: paginatedAppointments,
		totalItems,
		startIndex,
		endIndex,
		goToPage,
	} = usePagination({
		data: appointments.sort((a, b) => {
			const dateA = new Date(`${a.appointmentDate}T${a.appointmentTime}`);
			const dateB = new Date(`${b.appointmentDate}T${b.appointmentTime}`);
			return dateB.getTime() - dateA.getTime();
		}),
		itemsPerPage,
	});

	// Filter specialties based on search
	const filteredSpecialties = useMemo(() => {
		if (!specialtySearch) return allSpecialties;
		return allSpecialties.filter((specialty) =>
			specialty.toLowerCase().includes(specialtySearch.toLowerCase()),
		);
	}, [specialtySearch]);

	// Get available doctors based on specialty
	const availableDoctors = useMemo(() => {
		if (formData.examinationType === 'specialty' && formData.specialty) {
			return mockDoctors.filter((d) => d.specialty === formData.specialty);
		}
		return mockDoctors;
	}, [formData.examinationType, formData.specialty]);

	// Get services from package
	const getServicesFromPackage = (packageId: string): string[] => {
		const pkg = mockExaminationPackages.find((p) => p.id === packageId);
		return pkg ? pkg.services : [];
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		// Reset errors
		const newErrors: Record<string, boolean> = {};

		// Validation
		if (!formData.appointmentDate) {
			newErrors.appointmentDate = true;
		}
		if (!formData.appointmentTime) {
			newErrors.appointmentTime = true;
		}
		if (!formData.examinationType) {
			newErrors.examinationType = true;
		}
		if (formData.examinationType === 'specialty' && !formData.specialty) {
			newErrors.specialty = true;
		}
		if (formData.examinationType === 'package' && !formData.selectedPackage) {
			newErrors.selectedPackage = true;
		}
		if (!formData.reason) {
			newErrors.reason = true;
		}

		if (Object.keys(newErrors).length > 0) {
			setErrors(newErrors);
			toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
			return;
		}

		// Determine services and doctor
		let services: string[] = [];
		let doctor = '';
		let doctorId = '';

		if (formData.examinationType === 'package') {
			services = getServicesFromPackage(formData.selectedPackage);
		} else if (formData.examinationType === 'specialty') {
			services = [`Khám ${formData.specialty}`];
			if (formData.assignedDoctorId) {
				const selectedDoctor = mockDoctors.find(
					(d) => d.id === formData.assignedDoctorId,
				);
				if (selectedDoctor) {
					doctor = selectedDoctor.name;
					doctorId = selectedDoctor.id;
				}
			}
		}

		const today = new Date();
		const dateStr = today.toISOString().split('T')[0].replace(/-/g, '');
		const appointmentNumber = String(appointments.length + 1).padStart(3, '0');
		const code = `LH${dateStr}${appointmentNumber}`;

		const newAppointment: Omit<
			Appointment,
			'id' | 'code' | 'createdAt' | 'updatedAt'
		> = {
			patientName: user?.fullName || '',
			phoneNumber: user?.email || '',
			dateOfBirth: '',
			gender: 'male',
			appointmentDate: formData.appointmentDate,
			appointmentTime: formData.appointmentTime,
			services,
			doctor,
			doctorId,
			reason: formData.reason,
			status: 'pending',
		};

		onCreateAppointment(newAppointment);

		// Reset form
		setFormData({
			appointmentDate: '',
			appointmentTime: '',
			examinationType: 'specialty',
			selectedPackage: '',
			assignedDoctorId: '',
			specialty: '',
			reason: '',
		});
		setErrors({});
		toast.success('Đã đặt lịch hẹn thành công');
	};

	const handleCancelAppointment = (appointmentId: string) => {
		onUpdateAppointment(appointmentId, { status: 'cancelled' });
		toast.success('Đã hủy lịch hẹn');
	};

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString('vi-VN', {
			weekday: 'long',
			year: 'numeric',
			month: 'long',
			day: 'numeric',
		});
	};

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between pb-4 border-b border-gray-200">
				<h2 className="text-2xl font-semibold text-gray-900">Đặt lịch hẹn</h2>
			</div>

			{/* Form đặt lịch */}
			<form onSubmit={handleSubmit} className="space-y-6">
				{/* Thông tin Khách hàng - tự động điền */}
				<div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
					<div className="flex items-center gap-2 mb-3">
						<User className="h-5 w-5 text-blue-600" />
						<Label className="text-base font-semibold text-blue-900">
							Thông tin Khách hàng
						</Label>
					</div>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<Label className="text-sm text-gray-600">Họ và tên</Label>
							<p className="font-medium">
								{user?.fullName || 'Chưa có thông tin'}
							</p>
						</div>
						<div>
							<Label className="text-sm text-gray-600">Email</Label>
							<p className="font-medium">
								{user?.email || 'Chưa có thông tin'}
							</p>
						</div>
					</div>
				</div>

				{/* Ngày và giờ khám */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div className="space-y-2">
						<Label
							htmlFor="appointmentDate"
							className="flex items-center gap-2"
						>
							Ngày khám *
							{!formData.appointmentDate && errors.appointmentDate && (
								<Badge variant="destructive" className="animate-pulse">
									Chưa chọn
								</Badge>
							)}
						</Label>
						<DatePicker
							date={formData.appointmentDate}
							onStringChange={(date) => {
								setFormData({ ...formData, appointmentDate: date });
								if (errors.appointmentDate) {
									setErrors({ ...errors, appointmentDate: false });
								}
							}}
							placeholder="Chọn ngày khám"
							minDate={new Date()}
							className={`${
								errors.appointmentDate ? 'border-red-500 bg-red-50' : ''
							}`}
						/>
					</div>

					<div className="space-y-2">
						<Label
							htmlFor="appointmentTime"
							className="flex items-center gap-2"
						>
							Giờ khám *
							{!formData.appointmentTime && errors.appointmentTime && (
								<Badge variant="destructive" className="animate-pulse">
									Chưa chọn
								</Badge>
							)}
						</Label>
						<Select
							value={formData.appointmentTime}
							onValueChange={(value) => {
								setFormData({ ...formData, appointmentTime: value });
								if (errors.appointmentTime) {
									setErrors({ ...errors, appointmentTime: false });
								}
							}}
						>
							<SelectTrigger
								className={`border-gray-300 focus:border-blue-500 ${
									errors.appointmentTime ? 'border-red-500 bg-red-50' : ''
								}`}
							>
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

				{/* Chọn loại khám */}
				<div className="space-y-3">
					<Label className="flex items-center gap-2">
						Loại khám *
						{!formData.examinationType && errors.examinationType && (
							<Badge variant="destructive" className="animate-pulse">
								Chưa chọn
							</Badge>
						)}
					</Label>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
						{/* Khám chuyên khoa */}
						<button
							type="button"
							onClick={() => {
								setFormData({
									...formData,
									examinationType: 'specialty',
									selectedPackage: '',
									assignedDoctorId: '',
								});
								if (errors.examinationType) {
									setErrors({ ...errors, examinationType: false });
								}
							}}
							className={`p-4 rounded-lg border-2 transition-all text-left cursor-pointer ${
								formData.examinationType === 'specialty'
									? 'border-blue-500 bg-blue-50 text-blue-700'
									: errors.examinationType
									? 'border-red-500 bg-red-50'
									: 'border-gray-200 hover:border-gray-300 bg-white'
							}`}
						>
							<div className="flex items-center gap-3">
								{formData.examinationType === 'specialty' ? (
									<CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0" />
								) : (
									<div className="h-5 w-5 flex-shrink-0 rounded-full border-2 border-gray-300" />
								)}
								<div>
									<div className="font-medium">Khám chuyên khoa</div>
									<div className="text-xs text-gray-600 mt-1">
										Chọn chuyên khoa để khám
									</div>
								</div>
							</div>
						</button>

						{/* Khám theo gói */}
						<button
							type="button"
							onClick={() => {
								setFormData({
									...formData,
									examinationType: 'package',
									specialty: '',
									assignedDoctorId: '',
								});
								if (errors.examinationType) {
									setErrors({ ...errors, examinationType: false });
								}
							}}
							className={`p-4 rounded-lg border-2 transition-all text-left cursor-pointer ${
								formData.examinationType === 'package'
									? 'border-blue-500 bg-blue-50 text-blue-700'
									: errors.examinationType
									? 'border-red-500 bg-red-50'
									: 'border-gray-200 hover:border-gray-300 bg-white'
							}`}
						>
							<div className="flex items-center gap-3">
								{formData.examinationType === 'package' ? (
									<CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0" />
								) : (
									<div className="h-5 w-5 flex-shrink-0 rounded-full border-2 border-gray-300" />
								)}
								<div>
									<div className="font-medium">Khám theo gói</div>
									<div className="text-xs text-gray-600 mt-1">
										Chọn gói khám có sẵn
									</div>
								</div>
							</div>
						</button>
					</div>
				</div>

				{/* Hiển thị form theo loại khám đã chọn */}
				{formData.examinationType === 'package' && (
					<div className="space-y-2">
						<Label className="flex items-center gap-2">
							Chọn gói khám *
							{!formData.selectedPackage && (
								<Badge variant="destructive" className="animate-pulse">
									Chưa chọn
								</Badge>
							)}
						</Label>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
							{mockExaminationPackages.map((pkg) => {
								const isSelected = formData.selectedPackage === pkg.id;
								return (
									<button
										key={pkg.id}
										type="button"
										onClick={() => {
											setFormData({ ...formData, selectedPackage: pkg.id });
											if (errors.selectedPackage) {
												setErrors({ ...errors, selectedPackage: false });
											}
										}}
										className={`p-4 rounded-lg border-2 transition-all text-left cursor-pointer ${
											isSelected
												? 'border-blue-500 bg-blue-50 text-blue-700'
												: errors.selectedPackage
												? 'border-red-500 bg-red-50'
												: 'border-gray-200 hover:border-gray-300 bg-white'
										}`}
									>
										<div className="flex items-start gap-3">
											{isSelected ? (
												<CheckCircle2 className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
											) : (
												<div className="h-5 w-5 mt-0.5 flex-shrink-0 rounded-full border-2 border-gray-300" />
											)}
											<div className="flex-1">
												<div className="font-medium mb-1">{pkg.name}</div>
												{pkg.description && (
													<div className="text-xs text-gray-600 mb-2">
														{pkg.description}
													</div>
												)}
												<div className="flex flex-wrap gap-1 mt-2">
													{pkg.services.map((service, idx) => (
														<Badge
															key={idx}
															variant="outline"
															className="text-xs"
														>
															{service}
														</Badge>
													))}
												</div>
											</div>
										</div>
									</button>
								);
							})}
						</div>
					</div>
				)}

				{formData.examinationType === 'specialty' && (
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label htmlFor="specialty" className="flex items-center gap-2">
								Chọn chuyên khoa *
								{!formData.specialty ? (
									<Badge variant="destructive" className="animate-pulse">
										Chưa chọn
									</Badge>
								) : (
									<Badge
										variant="outline"
										className="bg-green-50 text-green-700 border-green-300"
									>
										Đã chọn
									</Badge>
								)}
							</Label>
							<Popover open={specialtyOpen} onOpenChange={setSpecialtyOpen}>
								<PopoverTrigger asChild>
									<Button
										variant="outline"
										role="combobox"
										aria-expanded={specialtyOpen}
										className={`w-full justify-between border-gray-300 focus:border-blue-500 ${
											errors.specialty ? 'border-red-500 bg-red-50' : ''
										}`}
									>
										{formData.specialty || 'Chọn chuyên khoa...'}
										<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
									</Button>
								</PopoverTrigger>
								<PopoverContent
									className="w-[400px] p-0"
									style={{
										height: '280px',
										maxHeight: '280px',
										overflow: 'hidden',
									}}
									align="start"
								>
									<Command className="h-full flex flex-col overflow-hidden">
										<CommandInput
											placeholder="Tìm kiếm chuyên khoa..."
											value={specialtySearch}
											onValueChange={setSpecialtySearch}
										/>
										<CommandList className="flex-1 overflow-y-auto">
											<CommandEmpty>Không tìm thấy chuyên khoa.</CommandEmpty>
											<CommandGroup>
												{filteredSpecialties.map((specialty) => (
													<CommandItem
														key={specialty}
														value={specialty}
														className="cursor-pointer hover:bg-blue-50 hover:text-blue-700 transition-colors"
														onSelect={() => {
															setFormData({
																...formData,
																specialty: specialty,
																assignedDoctorId: '',
															});
															if (errors.specialty) {
																setErrors({ ...errors, specialty: false });
															}
															setSpecialtyOpen(false);
															setSpecialtySearch('');
														}}
													>
														{specialty}
													</CommandItem>
												))}
											</CommandGroup>
										</CommandList>
									</Command>
								</PopoverContent>
							</Popover>
						</div>

						<div className="space-y-2">
							<Label
								htmlFor="assignedDoctorId"
								className="flex items-center gap-2"
							>
								Bác sĩ phụ trách
								<Badge variant="outline" className="text-gray-600">
									Tùy chọn
								</Badge>
							</Label>
							<Select
								value={formData.assignedDoctorId}
								onValueChange={(value) =>
									setFormData({ ...formData, assignedDoctorId: value })
								}
								disabled={!formData.specialty}
							>
								<SelectTrigger className="border-gray-300">
									<SelectValue
										placeholder={
											formData.specialty
												? 'Chọn bác sĩ hoặc để hệ thống tự phân công'
												: 'Vui lòng chọn chuyên khoa trước'
										}
									/>
								</SelectTrigger>
								<SelectContent>
									{availableDoctors.length > 0 ? (
										availableDoctors.map((doctor) => (
											<SelectItem key={doctor.id} value={doctor.id}>
												{doctor.name} - {doctor.specialty}
											</SelectItem>
										))
									) : (
										<SelectItem value="" disabled>
											Không có bác sĩ nào cho chuyên khoa này
										</SelectItem>
									)}
								</SelectContent>
							</Select>
						</div>
					</div>
				)}

				<div className="space-y-2">
					<Label htmlFor="reason">Lý do khám *</Label>
					<Textarea
						id="reason"
						value={formData.reason}
						onChange={(e) => {
							setFormData({ ...formData, reason: e.target.value });
							if (errors.reason) {
								setErrors({ ...errors, reason: false });
							}
						}}
						placeholder="Nhập lý do khám bệnh..."
						className={`border-gray-300 focus:border-blue-500 resize-none ${
							errors.reason ? 'border-red-500 bg-red-50' : ''
						}`}
						rows={3}
					/>
				</div>

				<div className="flex gap-2 justify-end">
					<Button
						type="submit"
						size="sm"
						className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-lg"
					>
						<Calendar className="h-4 w-4 mr-2" />
						Đặt lịch hẹn
					</Button>
				</div>
			</form>

			{/* Danh sách lịch hẹn */}
			<div className="mt-8">
				<div className="flex items-center justify-between mb-4">
					<h3 className="text-xl font-semibold">Lịch hẹn của tôi</h3>
					<Badge variant="outline" className="text-sm">
						Tổng: {totalItems}
					</Badge>
				</div>

				{totalItems === 0 ? (
					<Card>
						<CardContent className="pt-6">
							<div className="text-center py-12 text-gray-500">
								<Calendar className="h-12 w-12 mx-auto mb-3 text-gray-300" />
								<p>Bạn chưa có lịch hẹn nào</p>
							</div>
						</CardContent>
					</Card>
				) : (
					<div className="space-y-4">
						{paginatedAppointments.map((appointment) => (
							<Card
								key={appointment.id}
								className="border-l-4 border-l-blue-500"
							>
								<CardHeader>
									<div className="flex items-start justify-between">
										<div className="flex-1">
											<CardTitle className="flex items-center gap-2">
												<Calendar className="h-5 w-5 text-blue-600" />
												{appointment.code}
											</CardTitle>
											<CardDescription className="mt-2">
												<div className="flex items-center gap-4 flex-wrap">
													<div className="flex items-center gap-2">
														<Clock className="h-4 w-4 text-gray-400" />
														<span>
															{formatDate(appointment.appointmentDate)} -{' '}
															{appointment.appointmentTime}
														</span>
													</div>
													{appointment.doctor && (
														<div className="flex items-center gap-2">
															<User className="h-4 w-4 text-gray-400" />
															<span>{appointment.doctor}</span>
														</div>
													)}
												</div>
											</CardDescription>
										</div>
										<Badge
											className={appointmentStatusColors[appointment.status]}
										>
											{appointmentStatusLabels[appointment.status]}
										</Badge>
									</div>
								</CardHeader>
								<CardContent>
									<div className="space-y-3">
										<div>
											<span className="text-sm font-medium text-gray-600">
												Dịch vụ:
											</span>
											<div className="flex flex-wrap gap-2 mt-1">
												{appointment.services.map((service, index) => (
													<Badge key={index} variant="outline">
														{service}
													</Badge>
												))}
											</div>
										</div>
										{appointment.reason && (
											<div>
												<span className="text-sm font-medium text-gray-600">
													Lý do khám:
												</span>
												<p className="text-sm mt-1">{appointment.reason}</p>
											</div>
										)}
										{appointment.status === 'pending' ||
										appointment.status === 'confirmed' ? (
											<div className="flex gap-2 pt-2">
												<Button
													variant="outline"
													size="sm"
													onClick={() =>
														handleCancelAppointment(appointment.id)
													}
												>
													Hủy lịch hẹn
												</Button>
											</div>
										) : null}
									</div>
								</CardContent>
							</Card>
						))}
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
					</div>
				)}
			</div>
		</div>
	);
}
