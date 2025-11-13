import React, { useState, useMemo, useEffect } from 'react';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from './ui/select';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { DatePicker } from './ui/date-picker';
import { toast } from 'sonner';
import { Gender, MedicalRecord } from '../types';
import { mockDoctors, mockServices } from '../lib/mockData';
import administrativeData from '../administrative.json';
import {
	UserPlus,
	Phone,
	MapPin,
	Mail,
	Shield,
	Calendar,
	Clock,
	User,
	CheckCircle2,
	ArrowLeft,
} from 'lucide-react';
import { motion } from 'motion/react';
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from './ui/popover';
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from './ui/command';
import { ChevronsUpDown } from 'lucide-react';

interface CustomerBookingPageProps {
	onSubmit?: (
		record: Omit<
			MedicalRecord,
			'id' | 'receiveCode' | 'createdAt' | 'updatedAt'
		>,
	) => void;
	onBack?: () => void;
}

export function CustomerBookingPage({
	onSubmit,
	onBack,
}: CustomerBookingPageProps) {
	const [formData, setFormData] = useState({
		fullName: '',
		phoneNumber: '',
		dateOfBirth: '',
		gender: '' as Gender,
		address: '',
		addressDetail: '',
		provinceId: '',
		wardId: '',
		email: '',
		customerId: '',
		cccdNumber: '',
		insurance: '',
		reason: '',
		appointmentDate: '',
		appointmentTime: '',
		selectedServices: [] as string[],
		assignedDoctorId: '',
	});

	const [errors, setErrors] = useState<Record<string, boolean>>({});
	const [provinceOpen, setProvinceOpen] = useState(false);
	const [wardOpen, setWardOpen] = useState(false);
	const [provinceSearch, setProvinceSearch] = useState('');
	const [wardSearch, setWardSearch] = useState('');

	// Filter administrative data
	const provinces = useMemo(() => {
		return (administrativeData as any[]).filter(
			(p) =>
				p.ID !== '-1' &&
				p.NAME.toLowerCase().includes(provinceSearch.toLowerCase()),
		);
	}, [provinceSearch]);

	const selectedProvince = useMemo(() => {
		return (administrativeData as any[]).find(
			(p) => p.ID === formData.provinceId,
		);
	}, [formData.provinceId]);

	const wards = useMemo(() => {
		if (!selectedProvince || !selectedProvince.WARDS) return [];
		return selectedProvince.WARDS.filter(
			(w: any) =>
				w.ID !== '-1' && w.TEN.toLowerCase().includes(wardSearch.toLowerCase()),
		);
	}, [selectedProvince, wardSearch]);


	const handleToggleService = (service: string) => {
		setFormData({
			...formData,
			selectedServices: formData.selectedServices.includes(service)
				? formData.selectedServices.filter((s) => s !== service)
				: [...formData.selectedServices, service],
		});
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		// Reset errors
		const newErrors: Record<string, boolean> = {};

		// Validate required fields
		if (!formData.fullName.trim()) {
			newErrors.fullName = true;
		}
		if (!formData.phoneNumber.trim()) {
			newErrors.phoneNumber = true;
		}
		if (!formData.dateOfBirth) {
			newErrors.dateOfBirth = true;
		}
		if (!formData.gender) {
			newErrors.gender = true;
		}
		if (!formData.reason.trim()) {
			newErrors.reason = true;
		}
		if (!formData.appointmentDate) {
			newErrors.appointmentDate = true;
		}
		if (!formData.appointmentTime) {
			newErrors.appointmentTime = true;
		}

		if (Object.keys(newErrors).length > 0) {
			setErrors(newErrors);
			toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
			return;
		}

		// Build address
		const addressParts: string[] = [];
		if (formData.addressDetail) {
			addressParts.push(formData.addressDetail);
		}
		if (selectedProvince) {
			const selectedWard = selectedProvince.WARDS?.find(
				(w: any) => w.ID === formData.wardId,
			);
			if (selectedWard) {
				addressParts.push(selectedWard.TEN);
			}
			addressParts.push(selectedProvince.NAME);
		}
		if (formData.address) {
			addressParts.push(formData.address);
		}

		const fullAddress =
			addressParts.length > 0 ? addressParts.join(', ') : formData.address;

		// Combine appointment date and time
		const appointmentDateTime = formData.appointmentDate && formData.appointmentTime
			? `${formData.appointmentDate}T${formData.appointmentTime}:00`
			: undefined;

		if (onSubmit) {
			onSubmit({
				patient: {
					id: formData.customerId || `patient_${Date.now()}`,
					fullName: formData.fullName,
					phoneNumber: formData.phoneNumber,
					dateOfBirth: formData.dateOfBirth,
					gender: formData.gender,
					address: fullAddress,
					email: formData.email || undefined,
					customerId: formData.customerId || undefined,
					cccdNumber: formData.cccdNumber || undefined,
					insurance: formData.insurance || undefined,
				},
				requestedServices: formData.selectedServices,
				assignedDoctor: formData.assignedDoctorId
					? mockDoctors.find((d) => d.id === formData.assignedDoctorId)
					: undefined,
				status: 'PENDING_CHECKIN',
				diagnosis: undefined,
				reason: formData.reason,
				paymentStatus: 'pending',
				appointmentTime: appointmentDateTime,
			});
		} else {
			toast.success('Đặt lịch khám thành công! Vui lòng chờ xác nhận từ phòng khám.');
		}

		// Reset form
		setFormData({
			fullName: '',
			phoneNumber: '',
			dateOfBirth: '',
			gender: '' as Gender,
			address: '',
			addressDetail: '',
			provinceId: '',
			wardId: '',
			email: '',
			customerId: '',
			cccdNumber: '',
			insurance: '',
			reason: '',
			appointmentDate: '',
			appointmentTime: '',
			selectedServices: [],
			assignedDoctorId: '',
		});
		setErrors({});
	};

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

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8 px-4">
			<div className="max-w-4xl mx-auto">
				{/* Header */}
				<motion.div
					initial={{ opacity: 0, y: -20 }}
					animate={{ opacity: 1, y: 0 }}
					className="mb-8"
				>
					{onBack && (
						<Button
							variant="ghost"
							onClick={onBack}
							className="mb-4"
						>
							<ArrowLeft className="h-4 w-4 mr-2" />
							Quay lại
						</Button>
					)}
					<Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
						<CardHeader>
							<div className="flex items-center gap-3">
								<div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl">
									<Calendar className="h-6 w-6 text-white" />
								</div>
								<div className="flex-1">
									<CardTitle className="text-2xl">Đặt lịch khám</CardTitle>
									<p className="text-gray-600 mt-1">
										Vui lòng điền đầy đủ thông tin để đặt lịch khám
									</p>
									<div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
										<p className="text-xs text-blue-700">
											💡 <strong>Lưu ý:</strong> Mã QR này có thể được nhiều khách hàng sử dụng. 
											Mỗi lần điền form và gửi sẽ tạo một đặt lịch riêng biệt.
										</p>
									</div>
								</div>
							</div>
						</CardHeader>
					</Card>
				</motion.div>

				{/* Form */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.1 }}
				>
					<Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
						<CardContent className="p-6">
							<form onSubmit={handleSubmit} className="space-y-6">
								{/* Thông tin cá nhân */}
								<div>
									<h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
										<User className="h-5 w-5 text-blue-600" />
										Thông tin cá nhân
									</h3>
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<div className="space-y-2">
											<Label htmlFor="fullName">
												Họ và tên <span className="text-red-500">*</span>
											</Label>
											<Input
												id="fullName"
												value={formData.fullName}
												onChange={(e) => {
													setFormData({ ...formData, fullName: e.target.value });
													if (errors.fullName) {
														setErrors({ ...errors, fullName: false });
													}
												}}
												placeholder="Nhập họ tên"
												className={`border-gray-300 focus:border-blue-500 ${
													errors.fullName ? 'border-red-500 bg-red-50' : ''
												}`}
											/>
										</div>

										<div className="space-y-2">
											<Label htmlFor="phoneNumber">
												Số điện thoại <span className="text-red-500">*</span>
											</Label>
											<div className="relative">
												<Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
												<Input
													id="phoneNumber"
													value={formData.phoneNumber}
													onChange={(e) => {
														setFormData({
															...formData,
															phoneNumber: e.target.value,
														});
														if (errors.phoneNumber) {
															setErrors({ ...errors, phoneNumber: false });
														}
													}}
													placeholder="Nhập số điện thoại"
													className={`pl-10 border-gray-300 focus:border-blue-500 ${
														errors.phoneNumber ? 'border-red-500 bg-red-50' : ''
													}`}
												/>
											</div>
										</div>

										<div className="space-y-2">
											<Label htmlFor="dateOfBirth">
												Ngày sinh <span className="text-red-500">*</span>
											</Label>
											<DatePicker
												date={formData.dateOfBirth}
												onStringChange={(date) => {
													setFormData({ ...formData, dateOfBirth: date });
													if (errors.dateOfBirth) {
														setErrors({ ...errors, dateOfBirth: false });
													}
												}}
												placeholder="Chọn ngày sinh"
												className={`${
													errors.dateOfBirth ? 'border-red-500 bg-red-50' : ''
												}`}
											/>
										</div>

										<div className="space-y-2">
											<Label htmlFor="gender">
												Giới tính <span className="text-red-500">*</span>
											</Label>
											<Select
												value={formData.gender}
												onValueChange={(value) => {
													setFormData({ ...formData, gender: value as Gender });
													if (errors.gender) {
														setErrors({ ...errors, gender: false });
													}
												}}
											>
												<SelectTrigger
													className={`border-gray-300 ${
														errors.gender ? 'border-red-500 bg-red-50' : ''
													}`}
												>
													<SelectValue placeholder="Chọn giới tính" />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="male">Nam</SelectItem>
													<SelectItem value="female">Nữ</SelectItem>
												</SelectContent>
											</Select>
										</div>

										<div className="space-y-2">
											<Label htmlFor="email">Email</Label>
											<div className="relative">
												<Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
												<Input
													id="email"
													type="email"
													value={formData.email}
													onChange={(e) =>
														setFormData({ ...formData, email: e.target.value })
													}
													placeholder="Nhập email"
													className="pl-10 border-gray-300 focus:border-blue-500"
												/>
											</div>
										</div>

										<div className="space-y-2">
											<Label htmlFor="insurance">Bảo hiểm y tế</Label>
											<div className="relative">
												<Shield className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
												<Input
													id="insurance"
													value={formData.insurance}
													onChange={(e) =>
														setFormData({ ...formData, insurance: e.target.value })
													}
													placeholder="Mã thẻ BHYT"
													className="pl-10 border-gray-300 focus:border-blue-500"
												/>
											</div>
										</div>
									</div>
								</div>

								{/* Địa chỉ */}
								<div>
									<h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
										<MapPin className="h-5 w-5 text-blue-600" />
										Địa chỉ
									</h3>
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<div className="space-y-2">
											<Label htmlFor="province">Tỉnh/Thành phố</Label>
											<Popover open={provinceOpen} onOpenChange={setProvinceOpen}>
												<PopoverTrigger asChild>
													<Button
														variant="outline"
														role="combobox"
														aria-expanded={provinceOpen}
														className="w-full justify-between border-gray-300"
													>
														{formData.provinceId && selectedProvince
															? selectedProvince.NAME
															: 'Chọn tỉnh/thành phố...'}
														<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
													</Button>
												</PopoverTrigger>
												<PopoverContent className="w-[400px] p-0" align="start">
													<Command>
														<CommandInput
															placeholder="Tìm kiếm tỉnh/thành phố..."
															value={provinceSearch}
															onValueChange={setProvinceSearch}
														/>
														<CommandList>
															<CommandEmpty>
																Không tìm thấy tỉnh/thành phố.
															</CommandEmpty>
															<CommandGroup>
																{provinces.map((province) => (
																	<CommandItem
																		key={province.ID}
																		value={province.NAME}
																		onSelect={() => {
																			setFormData({
																				...formData,
																				provinceId: province.ID,
																				wardId: '',
																			});
																			setProvinceOpen(false);
																		}}
																	>
																		{province.NAME}
																	</CommandItem>
																))}
															</CommandGroup>
														</CommandList>
													</Command>
												</PopoverContent>
											</Popover>
										</div>

										<div className="space-y-2">
											<Label htmlFor="ward">Xã/Phường</Label>
											<Popover open={wardOpen} onOpenChange={setWardOpen}>
												<PopoverTrigger asChild>
													<Button
														variant="outline"
														role="combobox"
														aria-expanded={wardOpen}
														disabled={!formData.provinceId}
														className="w-full justify-between border-gray-300"
													>
														{formData.wardId && selectedProvince
															? selectedProvince.WARDS?.find(
																	(w: any) => w.ID === formData.wardId,
															  )?.TEN || 'Chọn xã/phường...'
															: 'Chọn xã/phường...'}
														<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
													</Button>
												</PopoverTrigger>
												<PopoverContent className="w-[400px] p-0" align="start">
													<Command>
														<CommandInput
															placeholder="Tìm kiếm xã/phường..."
															value={wardSearch}
															onValueChange={setWardSearch}
														/>
														<CommandList>
															<CommandEmpty>
																Không tìm thấy xã/phường.
															</CommandEmpty>
															<CommandGroup>
																{wards.map((ward: any) => (
																	<CommandItem
																		key={ward.ID}
																		value={ward.TEN}
																		onSelect={() => {
																			setFormData({
																				...formData,
																				wardId: ward.ID,
																			});
																			setWardOpen(false);
																		}}
																	>
																		{ward.TEN}
																	</CommandItem>
																))}
															</CommandGroup>
														</CommandList>
													</Command>
												</PopoverContent>
											</Popover>
										</div>

										<div className="md:col-span-2 space-y-2">
											<Label htmlFor="addressDetail">Địa chỉ chi tiết</Label>
											<Input
												id="addressDetail"
												value={formData.addressDetail}
												onChange={(e) =>
													setFormData({
														...formData,
														addressDetail: e.target.value,
													})
												}
												placeholder="Ví dụ: 123 Đường ABC"
												className="border-gray-300 focus:border-blue-500"
											/>
										</div>
									</div>
								</div>

								{/* Ngày và giờ khám */}
								<div>
									<h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
										<Clock className="h-5 w-5 text-blue-600" />
										Ngày và giờ khám
									</h3>
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<div className="space-y-2">
											<Label htmlFor="appointmentDate">
												Ngày khám <span className="text-red-500">*</span>
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
												minDate={new Date().toISOString().split('T')[0]}
												className={`${
													errors.appointmentDate ? 'border-red-500 bg-red-50' : ''
												}`}
											/>
										</div>

										<div className="space-y-2">
											<Label htmlFor="appointmentTime">
												Giờ khám <span className="text-red-500">*</span>
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
													className={`border-gray-300 ${
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
								</div>

								{/* Dịch vụ khám */}
								<div>
									<h3 className="text-lg font-semibold mb-4">Dịch vụ khám</h3>
									<div className="grid grid-cols-2 md:grid-cols-3 gap-2">
										{mockServices.map((service) => (
											<button
												key={service}
												type="button"
												onClick={() => handleToggleService(service)}
												className={`p-3 rounded-lg border-2 transition-all text-sm ${
													formData.selectedServices.includes(service)
														? 'border-blue-500 bg-blue-50 text-blue-700'
														: 'border-gray-200 hover:border-gray-300 bg-white'
												}`}
											>
												<div className="flex items-center gap-2">
													{formData.selectedServices.includes(service) && (
														<CheckCircle2 className="h-4 w-4 text-blue-600" />
													)}
													<span>{service}</span>
												</div>
											</button>
										))}
									</div>
								</div>

								{/* Bác sĩ phụ trách */}
								<div>
									<h3 className="text-lg font-semibold mb-4">Bác sĩ phụ trách</h3>
									<Select
										value={formData.assignedDoctorId}
										onValueChange={(value) =>
											setFormData({ ...formData, assignedDoctorId: value })
										}
									>
										<SelectTrigger className="border-gray-300">
											<SelectValue placeholder="Chọn bác sĩ hoặc để hệ thống tự phân công" />
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

								{/* Lý do khám */}
								<div>
									<h3 className="text-lg font-semibold mb-4">Lý do khám</h3>
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

								{/* Submit Button */}
								<div className="flex gap-4 pt-4">
									{onBack && (
										<Button
											type="button"
											variant="outline"
											onClick={onBack}
											className="flex-1"
										>
											Hủy
										</Button>
									)}
									<Button
										type="submit"
										className={`${onBack ? 'flex-1' : 'w-full'} bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-lg`}
									>
										<Calendar className="h-5 w-5 mr-2" />
										Đặt lịch khám
									</Button>
								</div>
							</form>
						</CardContent>
					</Card>
				</motion.div>
			</div>
		</div>
	);
}

