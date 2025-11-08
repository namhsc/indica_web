import React from 'react';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '../ui/select';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
	CheckCircle2,
	UserPlus,
	Phone,
	MapPin,
	Mail,
	Shield,
} from 'lucide-react';
import { motion } from 'motion/react';
import { Gender } from '../../types';
import { mockDoctors, mockServices } from '../../lib/mockData';

interface ManualInputFormProps {
	formData: {
		fullName: string;
		phoneNumber: string;
		dateOfBirth: string;
		gender: Gender;
		address: string;
		email: string;
		customerId: string;
		insurance: string;
		reason: string;
		selectedServices: string[];
		assignedDoctorId: string;
	};
	onFormDataChange: (
		updates: Partial<ManualInputFormProps['formData']>,
	) => void;
	onSubmit: () => void;
	hasPatientSelected: boolean;
}

export function ManualInputForm({
	formData,
	onFormDataChange,
	onSubmit,
	hasPatientSelected,
}: ManualInputFormProps) {
	const handleToggleService = (service: string) => {
		onFormDataChange({
			selectedServices: formData.selectedServices.includes(service)
				? formData.selectedServices.filter((s) => s !== service)
				: [...formData.selectedServices, service],
		});
	};

	return (
		<>
			<form
				onSubmit={(e) => {
					e.preventDefault();
					onSubmit();
				}}
				className="space-y-6"
			>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div className="space-y-2">
						<Label htmlFor="fullName">
							Họ và tên <span className="text-red-500">*</span>
						</Label>
						<Input
							id="fullName"
							value={formData.fullName}
							onChange={(e) => onFormDataChange({ fullName: e.target.value })}
							placeholder="Nhập họ tên"
							className="border-gray-300 focus:border-blue-500"
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
								onChange={(e) =>
									onFormDataChange({ phoneNumber: e.target.value })
								}
								placeholder="Nhập số điện thoại"
								className="pl-10 border-gray-300 focus:border-blue-500"
							/>
						</div>
					</div>

					<div className="space-y-2">
						<Label htmlFor="dateOfBirth">Ngày sinh</Label>
						<Input
							id="dateOfBirth"
							type="date"
							value={formData.dateOfBirth}
							onChange={(e) =>
								onFormDataChange({ dateOfBirth: e.target.value })
							}
							className="border-gray-300 focus:border-blue-500"
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="gender">Giới tính</Label>
						<Select
							value={formData.gender}
							onValueChange={(value) =>
								onFormDataChange({ gender: value as Gender })
							}
						>
							<SelectTrigger className="border-gray-300">
								<SelectValue placeholder="Chọn giới tính" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="male">Nam</SelectItem>
								<SelectItem value="female">Nữ</SelectItem>
								<SelectItem value="other">Khác</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</div>

				<div className="space-y-2">
					<Label htmlFor="address">Địa chỉ</Label>
					<div className="relative">
						<MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
						<Textarea
							id="address"
							value={formData.address}
							onChange={(e) => onFormDataChange({ address: e.target.value })}
							placeholder="Nhập địa chỉ"
							className="pl-10 border-gray-300 focus:border-blue-500 resize-none"
							rows={2}
						/>
					</div>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div className="space-y-2">
						<Label htmlFor="email">Email</Label>
						<div className="relative">
							<Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
							<Input
								id="email"
								type="email"
								value={formData.email}
								onChange={(e) => onFormDataChange({ email: e.target.value })}
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
									onFormDataChange({ insurance: e.target.value })
								}
								placeholder="Mã thẻ BHYT"
								className="pl-10 border-gray-300 focus:border-blue-500"
							/>
						</div>
					</div>
				</div>

				<div className="space-y-2">
					<Label className="flex items-center gap-2">
						Dịch vụ khám <span className="text-red-500">*</span>
						{hasPatientSelected && formData.selectedServices.length === 0 && (
							<Badge variant="destructive" className="animate-pulse">
								Chưa chọn
							</Badge>
						)}
					</Label>
					<div className="grid grid-cols-2 md:grid-cols-3 gap-2">
						{mockServices.map((service) => (
							<button
								key={service}
								type="button"
								onClick={() => handleToggleService(service)}
								className={`p-3 rounded-lg border-2 transition-all text-sm cursor-pointer ${
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

				<div className="space-y-2">
					<Label htmlFor="assignedDoctorId" className="flex items-center gap-2">
						Bác sĩ phụ trách
						{hasPatientSelected && !formData.assignedDoctorId && (
							<Badge variant="outline" className="text-gray-600">
								Tùy chọn
							</Badge>
						)}
					</Label>
					<Select
						value={formData.assignedDoctorId}
						onValueChange={(value) =>
							onFormDataChange({ assignedDoctorId: value })
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

				<div className="space-y-2">
					<Label htmlFor="reason">Lý do khám *</Label>
					<Textarea
						id="reason"
						value={formData.reason}
						onChange={(e) => onFormDataChange({ reason: e.target.value })}
						placeholder="Nhập lý do khám bệnh..."
						className="border-gray-300 focus:border-blue-500 resize-none"
						rows={3}
					/>
				</div>

				<Button
					type="submit"
					className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-lg"
				>
					<UserPlus className="h-5 w-5 mr-2" />
					Tiếp nhận khách hàng
				</Button>
			</form>
		</>
	);
}
