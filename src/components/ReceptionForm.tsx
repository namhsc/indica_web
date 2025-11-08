import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from './ui/select';
import { Badge } from './ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from './ui/command';
import { toast } from 'sonner@2.0.3';
import { MedicalRecord, Gender } from '../types';
import { mockDoctors, mockServices } from '../lib/mockData';
import { mockExistingPatients } from '../lib/mockPatients';
import administrativeData from '../administrative.json';
import {
	UserPlus,
	QrCode,
	Camera,
	CreditCard,
	Calendar,
	Upload,
	Users,
	Keyboard,
	Zap,
	CheckCircle2,
	Search,
	Clock,
	User,
	Phone,
	MapPin,
	Hash,
	Shield,
	Download,
	X,
	Sparkles,
	ScanLine,
	ChevronsUpDown,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ReceptionFormProps {
	onSubmit: (
		record: Omit<
			MedicalRecord,
			'id' | 'receiveCode' | 'createdAt' | 'updatedAt'
		>,
	) => void;
}

type InputMethod =
	| 'manual'
	| 'qr-cccd'
	| 'self-checkin'
	| 'face'
	| 'insurance'
	| 'group';

export function ReceptionForm({ onSubmit }: ReceptionFormProps) {
	const [inputMethod, setInputMethod] = useState<InputMethod>('manual');
	const [formData, setFormData] = useState({
		fullName: '',
		phoneNumber: '',
		dateOfBirth: '',
		gender: '' as Gender,
		address: '',
		addressDetail: '',
		provinceId: '',
		wardId: '',
		customerId: '',
		cccdNumber: '',
		insurance: '',
		reason: '',
		selectedServices: [] as string[],
		assignedDoctorId: '',
		specialty: '',
	});

	// Administrative data states
	const [provinceOpen, setProvinceOpen] = useState(false);
	const [wardOpen, setWardOpen] = useState(false);
	const [provinceSearch, setProvinceSearch] = useState('');
	const [wardSearch, setWardSearch] = useState('');
	const [specialtyOpen, setSpecialtyOpen] = useState(false);
	const [specialtySearch, setSpecialtySearch] = useState('');

	// Danh sách chuyên khoa đầy đủ cho bệnh viện đa khoa
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
		'Tâm thần',
		'Chấn thương chỉnh hình',
		'Ung bướu',
		'Hồi sức cấp cứu',
		'Gây mê hồi sức',
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
		'Dị ứng miễn dịch',
		'Huyết học',
		'Lão khoa',
		'Y học thể thao',
		'Y học gia đình',
		'Thận học',
		'Gan mật',
		'Dịch tễ học',
		'Y tế công cộng',
		'Giải phẫu bệnh',
		'Vi sinh',
		'Hóa sinh',
		'Huyết học truyền máu',
		'Giải phẫu',
		'Sinh lý bệnh',
	];

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

	const filteredSpecialties = useMemo(() => {
		return allSpecialties.filter((s) =>
			s.toLowerCase().includes(specialtySearch.toLowerCase()),
		);
	}, [specialtySearch]);

	// Filter doctors by selected specialty
	const availableDoctors = useMemo(() => {
		if (!formData.specialty) {
			return mockDoctors;
		}
		return mockDoctors.filter(
			(doctor) => doctor.specialty === formData.specialty,
		);
	}, [formData.specialty]);

	// Autocomplete states
	const [showSuggestions, setShowSuggestions] = useState(false);
	const [suggestions, setSuggestions] = useState<typeof mockExistingPatients>(
		[],
	);
	const [searchTerm, setSearchTerm] = useState('');

	// QR/Scanning states
	const [isScanning, setIsScanning] = useState(false);
	const [scanningType, setScanningType] = useState<
		'qr' | 'face' | 'insurance' | null
	>(null);

	// Self check-in
	const [showQRPortal, setShowQRPortal] = useState(false);
	const [portalUrl, setPortalUrl] = useState('');

	// Group import
	const [excelFile, setExcelFile] = useState<File | null>(null);
	const [groupRecords, setGroupRecords] = useState<any[]>([]);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const inputMethods = [
		{
			id: 'manual',
			name: 'Nhập thủ công',
			shortName: 'Thủ công',
			icon: Keyboard,
			color: 'text-blue-600',
			description: 'Có gợi ý khách cũ',
		},
		{
			id: 'qr-cccd',
			name: 'Quét CCCD',
			shortName: 'CCCD',
			icon: QrCode,
			color: 'text-emerald-600',
			description: 'QR trên CCCD chip',
		},
		{
			id: 'self-checkin',
			name: 'Khách tự nhập',
			shortName: 'Self Check-in',
			icon: Sparkles,
			color: 'text-violet-600',
			description: 'Web form/Zalo',
		},
		{
			id: 'face',
			name: 'Nhận diện mặt',
			shortName: 'Face ID',
			icon: Camera,
			color: 'text-pink-600',
			description: 'AI Camera',
		},
		{
			id: 'insurance',
			name: 'Thẻ BHYT',
			shortName: 'BHYT',
			icon: CreditCard,
			color: 'text-orange-600',
			description: 'Quét barcode',
		},
		{
			id: 'group',
			name: 'Nhập đoàn',
			shortName: 'Nhập đoàn',
			icon: Users,
			color: 'text-gray-600',
			description: 'File Excel',
		},
	];

	// Search patient handler
	useEffect(() => {
		if (searchTerm.length >= 2) {
			const filtered = mockExistingPatients.filter(
				(p) =>
					p.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
					p.phoneNumber.includes(searchTerm) ||
					p.customerId.toLowerCase().includes(searchTerm.toLowerCase()),
			);
			setSuggestions(filtered);
			setShowSuggestions(filtered.length > 0);
		} else {
			setSuggestions([]);
			setShowSuggestions(false);
		}
	}, [searchTerm]);

	const handleSelectPatient = (patient: (typeof mockExistingPatients)[0]) => {
		setFormData({
			...formData,
			fullName: patient.fullName,
			phoneNumber: patient.phoneNumber,
			dateOfBirth: patient.dateOfBirth,
			gender: patient.gender,
			address: patient.address,
			addressDetail: '',
			provinceId: '',
			wardId: '',
			customerId: patient.customerId,
			cccdNumber: patient.cccdNumber || '',
			insurance: patient.insurance || '',
		});
		setSearchTerm(patient.fullName);
		setShowSuggestions(false);
		toast.success(`Đã load thông tin của ${patient.fullName}`);
	};

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

		if (
			!formData.fullName ||
			!formData.phoneNumber ||
			formData.selectedServices.length === 0
		) {
			toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
			return;
		}

		// Build full address from components
		const addressParts: string[] = [];
		if (formData.addressDetail) addressParts.push(formData.addressDetail);
		if (formData.wardId && selectedProvince) {
			const selectedWard = selectedProvince.WARDS?.find(
				(w: any) => w.ID === formData.wardId,
			);
			if (selectedWard) addressParts.push(selectedWard.TEN);
		}
		if (selectedProvince) addressParts.push(selectedProvince.NAME);
		const fullAddress =
			addressParts.length > 0 ? addressParts.join(', ') : formData.address;

		const assignedDoctor = formData.assignedDoctorId
			? mockDoctors.find((d) => d.id === formData.assignedDoctorId)
			: undefined;

		onSubmit({
			patient: {
				id: formData.customerId || `patient_${Date.now()}`,
				fullName: formData.fullName,
				phoneNumber: formData.phoneNumber,
				dateOfBirth: formData.dateOfBirth,
				gender: formData.gender,
				address: fullAddress,
				customerId: formData.customerId,
				cccdNumber: formData.cccdNumber,
				insurance: formData.insurance,
			},
			requestedServices: formData.selectedServices,
			assignedDoctor: assignedDoctor
				? {
						id: assignedDoctor.id,
						name: assignedDoctor.name,
						specialty: assignedDoctor.specialty,
				  }
				: undefined,
			status: 'PENDING_EXAMINATION',
			diagnosis: undefined,
			reason: formData.reason,
			paymentStatus: 'pending',
		});

		toast.success('Tiếp nhận hồ sơ thành công!');
	};

	// QR CCCD Handler
	const handleStartQRScan = () => {
		setIsScanning(true);
		setScanningType('qr');
		setTimeout(() => {
			// Mock QR scan success - Random patient from database
			const randomPatient =
				mockExistingPatients[
					Math.floor(Math.random() * mockExistingPatients.length)
				];
			setFormData({
				...formData,
				fullName: randomPatient.fullName,
				phoneNumber: randomPatient.phoneNumber,
				dateOfBirth: randomPatient.dateOfBirth,
				gender: randomPatient.gender,
				address: randomPatient.address,
				addressDetail: '',
				provinceId: '',
				wardId: '',
				customerId: randomPatient.customerId,
				cccdNumber: randomPatient.cccdNumber || '',
				insurance: randomPatient.insurance,
			});
			setIsScanning(false);
			setScanningType(null);
			setSearchTerm(randomPatient.fullName);
			toast.success(
				`✅ Quét CCCD thành công! Nhận diện: ${randomPatient.fullName}`,
			);
		}, 2000);
	};

	// Self Check-in Handler
	const handleGenerateQRPortal = () => {
		const url = `https://indica-clinic.com/check-in/${Math.random()
			.toString(36)
			.substring(7)}`;
		setPortalUrl(url);
		setShowQRPortal(true);
		toast.success('QR Code đã được tạo! Khách hàng có thể quét để tự nhập.');
	};

	// Face Recognition Handler
	const handleStartFaceRecognition = () => {
		setIsScanning(true);
		setScanningType('face');
		setTimeout(() => {
			const randomPatient =
				mockExistingPatients[
					Math.floor(Math.random() * mockExistingPatients.length)
				];
			setFormData({
				...formData,
				fullName: randomPatient.fullName,
				phoneNumber: randomPatient.phoneNumber,
				dateOfBirth: randomPatient.dateOfBirth,
				gender: randomPatient.gender,
				address: randomPatient.address,
				addressDetail: '',
				provinceId: '',
				wardId: '',
				customerId: randomPatient.customerId,
				cccdNumber: randomPatient.cccdNumber || '',
				insurance: randomPatient.insurance,
			});
			setIsScanning(false);
			setScanningType(null);
			setSearchTerm(randomPatient.fullName);
			toast.success(
				`✅ Nhận diện khuôn mặt thành công! ${randomPatient.fullName} - Đã khám ${randomPatient.visitCount} lần`,
			);
		}, 3000);
	};

	// Insurance Card Handler
	const handleScanInsurance = () => {
		setIsScanning(true);
		setScanningType('insurance');
		setTimeout(() => {
			// Mock scan insurance - Find patient with insurance or random one
			const patientsWithInsurance = mockExistingPatients.filter(
				(p) => p.insurance,
			);
			const randomPatient =
				patientsWithInsurance.length > 0
					? patientsWithInsurance[
							Math.floor(Math.random() * patientsWithInsurance.length)
					  ]
					: mockExistingPatients[
							Math.floor(Math.random() * mockExistingPatients.length)
					  ];

			setFormData({
				...formData,
				fullName: randomPatient.fullName,
				phoneNumber: randomPatient.phoneNumber,
				dateOfBirth: randomPatient.dateOfBirth,
				gender: randomPatient.gender,
				address: randomPatient.address,
				addressDetail: '',
				provinceId: '',
				wardId: '',
				customerId: randomPatient.customerId,
				cccdNumber: randomPatient.cccdNumber || '',
				insurance: randomPatient.insurance,
			});
			setIsScanning(false);
			setScanningType(null);
			setSearchTerm(randomPatient.fullName);
			toast.success(
				`✅ Quét thẻ BHYT thành công! Nhận diện: ${randomPatient.fullName}`,
			);
		}, 2000);
	};

	// Group Import Handler
	const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			setExcelFile(file);
			// Mock parse Excel
			const mockRecords = [
				{
					fullName: 'Nguyễn A',
					phoneNumber: '0901111111',
					service: 'Khám tổng quát',
				},
				{
					fullName: 'Trần B',
					phoneNumber: '0902222222',
					service: 'Xét nghiệm máu',
				},
				{ fullName: 'Lê C', phoneNumber: '0903333333', service: 'Siêu âm' },
			];
			setGroupRecords(mockRecords);
			toast.success(`Đã load ${mockRecords.length} hồ sơ từ file Excel`);
		}
	};

	const handleSubmitGroupRecords = () => {
		groupRecords.forEach((record, index) => {
			setTimeout(() => {
				const doctor = mockDoctors[index % mockDoctors.length];
				onSubmit({
					patient: {
						id: `GROUP${Date.now()}${index}`,
						fullName: record.fullName,
						phoneNumber: record.phoneNumber,
						dateOfBirth: '',
						gender: 'male',
						address: '',
						customerId: `GROUP${Date.now()}${index}`,
						cccdNumber: '',
						insurance: '',
					},
					requestedServices: [record.service],
					assignedDoctor: {
						id: doctor.id,
						name: doctor.name,
						specialty: doctor.specialty,
					},
					status: 'PENDING_EXAMINATION',
					diagnosis: undefined,
					reason: 'Khám đoàn',
					paymentStatus: 'pending',
				});
			}, index * 100);
		});
		toast.success(`Đã tiếp nhận ${groupRecords.length} hồ sơ!`);
		setExcelFile(null);
		setGroupRecords([]);
	};

	return (
		<div className="space-y-4">
			<Tabs
				value={inputMethod}
				onValueChange={(value) => setInputMethod(value as InputMethod)}
				className="w-full"
			>
				<TabsList className="w-full h-auto p-1 bg-gray-100/80 backdrop-blur-sm grid grid-cols-3 lg:grid-cols-6 gap-1">
					{inputMethods.map((method) => {
						const Icon = method.icon;
						return (
							<TabsTrigger
								key={method.id}
								value={method.id}
								className="flex flex-col gap-1 py-2 px-1 data-[state=active]:bg-white data-[state=active]:shadow-sm min-h-[60px]"
							>
								<Icon className={`h-5 w-5 ${method.color}`} />
								<span className="text-xs leading-tight text-center">
									{method.shortName}
								</span>
							</TabsTrigger>
						);
					})}
				</TabsList>

				<AnimatePresence mode="wait">
					<motion.div
						key={inputMethod}
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -10 }}
						transition={{ duration: 0.2 }}
						className="mt-6"
					>
						{/* Manual Input */}
						<TabsContent value="manual" className="mt-0">
							{formData.fullName && searchTerm && (
								<motion.div
									initial={{ opacity: 0, height: 0 }}
									animate={{ opacity: 1, height: 'auto' }}
									className="mb-4 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl p-4"
								>
									<div className="flex items-center gap-2 mb-2">
										<CheckCircle2 className="h-5 w-5 text-green-600" />
										<p className="text-green-700">
											✅ Thông tin bệnh nhân đã được tự động điền - Vui lòng
											chọn <strong>Dịch vụ khám</strong> và{' '}
											<strong>Bác sĩ</strong>
										</p>
									</div>
								</motion.div>
							)}

							<form onSubmit={handleSubmit} className="space-y-6">
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div className="space-y-2">
										<Label htmlFor="fullName">Họ và tên *</Label>
										<Input
											id="fullName"
											value={formData.fullName}
											onChange={(e) =>
												setFormData({ ...formData, fullName: e.target.value })
											}
											placeholder="Nhập họ tên"
											className="border-gray-300 focus:border-blue-500"
										/>
									</div>

									<div className="space-y-2">
										<Label htmlFor="phoneNumber">Số điện thoại *</Label>
										<div className="relative">
											<Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
											<Input
												id="phoneNumber"
												value={formData.phoneNumber}
												onChange={(e) =>
													setFormData({
														...formData,
														phoneNumber: e.target.value,
													})
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
												setFormData({
													...formData,
													dateOfBirth: e.target.value,
												})
											}
											className="border-gray-300 focus:border-blue-500"
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

								<div className="space-y-4">
									{/* Số căn cước công dân và Bảo hiểm y tế - cùng 1 hàng */}
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<div className="space-y-2">
											<Label htmlFor="cccdNumber">Số căn cước công dân</Label>
											<div className="relative">
												<Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
												<Input
													id="cccdNumber"
													value={formData.cccdNumber}
													onChange={(e) =>
														setFormData({
															...formData,
															cccdNumber: e.target.value,
														})
													}
													placeholder="Nhập số CCCD"
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
														setFormData({
															...formData,
															insurance: e.target.value,
														})
													}
													placeholder="Mã thẻ BHYT"
													className="pl-10 border-gray-300 focus:border-blue-500"
												/>
											</div>
										</div>
									</div>

									{/* Tỉnh/Thành phố và Xã/Phường - cùng 1 hàng */}
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										{/* Tỉnh/Thành phố */}
										<div className="space-y-2">
											<Label className="text-sm text-gray-600">
												Tỉnh/Thành phố
											</Label>
											<Popover
												open={provinceOpen}
												onOpenChange={setProvinceOpen}
											>
												<PopoverTrigger asChild>
													<Button
														variant="outline"
														role="combobox"
														aria-expanded={provinceOpen}
														className="w-full justify-between border-gray-300 focus:border-blue-500"
													>
														{formData.provinceId && selectedProvince
															? selectedProvince.NAME
															: 'Chọn tỉnh/thành phố...'}
														<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
													</Button>
												</PopoverTrigger>
												<PopoverContent
													className="w-[400px] p-0 !h-[80px] !max-h-[80px] "
													style={{
														height: '280px',
														maxheight: '280px',
														overflow: 'hidden',
													}}
													align="start"
												>
													<Command className="h-full flex flex-col overflow-hidden">
														<CommandInput
															placeholder="Tìm kiếm tỉnh/thành phố..."
															value={provinceSearch}
															onValueChange={setProvinceSearch}
														/>
														<CommandList
															className="!max-h-[50px] flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-gray-400"
															style={{
																scrollbarWidth: 'thin',
																scrollbarColor: '#cbd5e1 #f1f5f9',
																maxHeight: '50px !important',
																height: '50px',
																overflowY: 'auto',
															}}
														>
															<CommandEmpty>
																Không tìm thấy tỉnh/thành phố.
															</CommandEmpty>
															<CommandGroup>
																{provinces.map((province) => (
																	<CommandItem
																		key={province.ID}
																		value={province.NAME}
																		className="cursor-pointer hover:bg-blue-50 hover:text-blue-700 transition-colors"
																		onSelect={() => {
																			setFormData({
																				...formData,
																				provinceId: province.ID,
																				wardId: '', // Reset ward when province changes
																			});
																			setProvinceOpen(false);
																			setProvinceSearch('');
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

										{/* Xã/Phường */}
										<div className="space-y-2">
											<Label className="text-sm text-gray-600">Xã/Phường</Label>
											<Popover open={wardOpen} onOpenChange={setWardOpen}>
												<PopoverTrigger asChild>
													<Button
														variant="outline"
														role="combobox"
														aria-expanded={wardOpen}
														disabled={!formData.provinceId}
														className="w-full justify-between border-gray-300 focus:border-blue-500 disabled:opacity-50"
													>
														{formData.wardId && selectedProvince
															? selectedProvince.WARDS?.find(
																	(w: any) => w.ID === formData.wardId,
															  )?.TEN || 'Chọn xã/phường...'
															: 'Chọn xã/phường...'}
														<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
													</Button>
												</PopoverTrigger>
												<PopoverContent
													className="w-[400px] p-0 !h-[80px] !max-h-[80px]"
													style={{
														height: '280px',
														maxheight: '280px',
														overflow: 'hidden',
													}}
													align="start"
												>
													<Command className="h-full flex flex-col overflow-hidden">
														<CommandInput
															placeholder="Tìm kiếm xã/phường..."
															value={wardSearch}
															onValueChange={setWardSearch}
														/>
														<CommandList
															className="!max-h-[50px] flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-gray-400"
															style={{
																scrollbarWidth: 'thin',
																scrollbarColor: '#cbd5e1 #f1f5f9',
																maxHeight: '50px !important',
																height: '50px',
																overflowY: 'auto',
															}}
														>
															<CommandEmpty>
																Không tìm thấy xã/phường.
															</CommandEmpty>
															<CommandGroup>
																{wards.map((ward: any) => (
																	<CommandItem
																		key={ward.ID}
																		value={ward.TEN}
																		className="cursor-pointer hover:bg-blue-50 hover:text-blue-700 transition-colors"
																		onSelect={() => {
																			setFormData({
																				...formData,
																				wardId: ward.ID,
																			});
																			setWardOpen(false);
																			setWardSearch('');
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
									</div>

									{/* Địa chỉ chi tiết */}
									<div className="space-y-2">
										<Label
											htmlFor="addressDetail"
											className="text-sm text-gray-600"
										>
											Địa chỉ chi tiết
										</Label>
										<Textarea
											id="addressDetail"
											value={formData.addressDetail}
											onChange={(e) =>
												setFormData({
													...formData,
													addressDetail: e.target.value,
												})
											}
											placeholder="Ví dụ: 123 Đường ABC"
											className="border-gray-300 focus:border-blue-500 resize-none"
											rows={2}
										/>
									</div>
								</div>

								<div className="space-y-2">
									<Label className="flex items-center gap-2">
										Dịch vụ khám *
										{formData.fullName &&
											searchTerm &&
											formData.selectedServices.length === 0 && (
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

								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div className="space-y-2">
										<Label
											htmlFor="specialty"
											className="flex items-center gap-2"
										>
											Khám chuyên khoa
										</Label>
										<Popover
											open={specialtyOpen}
											onOpenChange={setSpecialtyOpen}
										>
											<PopoverTrigger asChild>
												<Button
													variant="outline"
													role="combobox"
													aria-expanded={specialtyOpen}
													className="w-full justify-between border-gray-300 focus:border-blue-500"
												>
													{formData.specialty || 'Chọn chuyên khoa...'}
													<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
												</Button>
											</PopoverTrigger>
											<PopoverContent
												className="w-[400px] p-0 !h-[80px] !max-h-[80px]"
												style={{
													height: '280px',
													maxheight: '280px',
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
													<CommandList
														className="!max-h-[50px] flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-gray-400"
														style={{
															scrollbarWidth: 'thin',
															scrollbarColor: '#cbd5e1 #f1f5f9',
															maxHeight: '50px !important',
															height: '50px',
															overflowY: 'auto',
														}}
													>
														<CommandEmpty>
															Không tìm thấy chuyên khoa.
														</CommandEmpty>
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
																			assignedDoctorId: '', // Reset doctor when specialty changes
																		});
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
											{formData.fullName &&
												searchTerm &&
												!formData.assignedDoctorId && (
													<Badge variant="outline" className="text-gray-600">
														Tùy chọn
													</Badge>
												)}
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

								<div className="space-y-2">
									<Label htmlFor="reason">Lý do khám</Label>
									<Textarea
										id="reason"
										value={formData.reason}
										onChange={(e) =>
											setFormData({ ...formData, reason: e.target.value })
										}
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
									Tiếp nhận hồ sơ
								</Button>
							</form>
						</TabsContent>

						{/* QR CCCD */}
						<TabsContent value="qr-cccd" className="mt-0">
							<div className="space-y-6 text-center py-8">
								{!formData.fullName && (
									<>
										<div className="flex justify-center mb-6">
											<motion.div
												animate={isScanning ? { scale: [1, 1.05, 1] } : {}}
												transition={{
													duration: 2,
													repeat: isScanning ? Infinity : 0,
												}}
												className={`p-6 rounded-3xl bg-gradient-to-br ${
													isScanning
														? 'from-emerald-500 to-teal-500'
														: 'from-blue-500 to-indigo-500'
												} shadow-none`}
											>
												<QrCode className="h-16 w-16 text-white" />
											</motion.div>
										</div>

										<h3 className="text-xl">
											{isScanning
												? 'Đang quét QR Code...'
												: 'Quét CCCD gắn chip'}
										</h3>
										<p className="text-gray-600 mb-6">
											{isScanning
												? 'Vui lòng giữ CCCD ổn định'
												: 'Đặt mã QR trên CCCD vào vùng quét camera'}
										</p>

										{!isScanning && (
											<Button
												onClick={handleStartQRScan}
												className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
											>
												<ScanLine className="h-5 w-5 mr-2" />
												Bắt đầu quét
											</Button>
										)}
									</>
								)}

								{formData.fullName && !isScanning && (
									<motion.div
										initial={{ opacity: 0, y: 20 }}
										animate={{ opacity: 1, y: 0 }}
										className="mt-6 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 rounded-2xl p-6 max-w-2xl mx-auto"
									>
										<CheckCircle2 className="h-10 w-10 text-green-600 mx-auto mb-4" />
										<h4 className="text-xl mb-4 text-green-700">
											✅ Nhận diện thành công!
										</h4>

										<div className="bg-white rounded-xl p-4 mb-4 border border-green-200">
											<h5 className="text-sm mb-3 text-gray-700">
												📋 Thông tin bệnh nhân đã được tự động điền:
											</h5>
											<div className="grid grid-cols-2 gap-3 text-sm">
												<div>
													<span className="text-gray-500">Họ tên:</span>
													<p className="text-gray-900">{formData.fullName}</p>
												</div>
												<div>
													<span className="text-gray-500">SĐT:</span>
													<p className="text-gray-900">
														{formData.phoneNumber}
													</p>
												</div>
												<div>
													<span className="text-gray-500">Ngày sinh:</span>
													<p className="text-gray-900">
														{formData.dateOfBirth}
													</p>
												</div>
												<div>
													<span className="text-gray-500">Giới tính:</span>
													<p className="text-gray-900">
														{formData.gender === 'male'
															? 'Nam'
															: formData.gender === 'female'
															? 'Nữ'
															: 'Khác'}
													</p>
												</div>
												{formData.insurance && (
													<div className="col-span-2">
														<span className="text-gray-500">Bảo hiểm:</span>
														<p className="text-gray-900">
															{formData.insurance}
														</p>
													</div>
												)}
											</div>
										</div>

										<div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
											<p className="text-sm text-blue-700">
												💡 <strong>Bước tiếp theo:</strong> Chọn dịch vụ khám và
												bác sĩ phụ trách
											</p>
										</div>

										<div className="flex gap-3">
											<Button
												variant="outline"
												onClick={() => {
													setFormData({
														fullName: '',
														phoneNumber: '',
														dateOfBirth: '',
														gender: '' as Gender,
														address: '',
														addressDetail: '',
														provinceId: '',
														wardId: '',
														customerId: '',
														cccdNumber: '',
														insurance: '',
														reason: '',
														selectedServices: [],
														assignedDoctorId: '',
														specialty: '',
													});
													setSearchTerm('');
												}}
												className="flex-1 border-green-300 text-green-700 hover:bg-green-50"
											>
												<QrCode className="h-4 w-4 mr-2" />
												Quét lại
											</Button>
											<Button
												onClick={() => setInputMethod('manual')}
												className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
											>
												Chọn dịch vụ & Bác sĩ →
											</Button>
										</div>
									</motion.div>
								)}
							</div>
						</TabsContent>

						{/* Self Check-in */}
						<TabsContent value="self-checkin" className="mt-0">
							<div className="space-y-6 text-center py-8">
								<div className="flex justify-center mb-6">
									<div className="p-6 rounded-3xl bg-gradient-to-br from-violet-500 to-purple-500 shadow-none">
										<Sparkles className="h-16 w-16 text-white" />
									</div>
								</div>

								<h3 className="text-xl">Khách hàng tự check-in</h3>
								<p className="text-gray-600 mb-6">
									Tạo mã QR để khách hàng tự nhập thông tin qua điện thoại
								</p>

								{!showQRPortal ? (
									<Button
										onClick={handleGenerateQRPortal}
										className="bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600"
									>
										<Zap className="h-5 w-5 mr-2" />
										Tạo QR Code
									</Button>
								) : (
									<motion.div
										initial={{ opacity: 0, scale: 0.9 }}
										animate={{ opacity: 1, scale: 1 }}
										className="bg-white border-2 border-violet-200 rounded-2xl p-6 max-w-md mx-auto"
									>
										<div className="w-48 h-48 bg-gray-200 rounded-xl mx-auto mb-4 flex items-center justify-center">
											<QrCode className="h-32 w-32 text-gray-400" />
										</div>
										<p className="text-sm text-gray-600 mb-4">
											Khách hàng quét mã QR này để tự nhập thông tin
										</p>
										<code className="block text-xs bg-gray-100 p-2 rounded mb-4 break-all">
											{portalUrl}
										</code>
										<Button variant="outline" size="sm">
											<Download className="h-4 w-4 mr-2" />
											Tải QR Code
										</Button>
									</motion.div>
								)}
							</div>
						</TabsContent>

						{/* Face Recognition */}
						<TabsContent value="face" className="mt-0">
							<div className="space-y-6 text-center py-8">
								{!formData.fullName && (
									<>
										<div className="flex justify-center mb-6">
											<motion.div
												animate={isScanning ? { scale: [1, 1.05, 1] } : {}}
												transition={{
													duration: 2,
													repeat: isScanning ? Infinity : 0,
												}}
												className={`p-6 rounded-3xl bg-gradient-to-br ${
													isScanning
														? 'from-pink-500 to-rose-500'
														: 'from-blue-500 to-indigo-500'
												} shadow-none`}
											>
												<Camera className="h-16 w-16 text-white" />
											</motion.div>
										</div>

										<h3 className="text-xl">
											{isScanning
												? 'Đang nhận diện khuôn mặt...'
												: 'Nhận diện khuôn mặt khách hàng'}
										</h3>
										<p className="text-gray-600 mb-6">
											{isScanning
												? 'Vui lòng nhìn thẳng vào camera'
												: 'Sử dụng AI để nhận diện khách hàng cũ'}
										</p>

										{!isScanning && (
											<Button
												onClick={handleStartFaceRecognition}
												className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600"
											>
												<Camera className="h-5 w-5 mr-2" />
												Bắt đầu nhận diện
											</Button>
										)}
									</>
								)}

								{formData.fullName && !isScanning && (
									<motion.div
										initial={{ opacity: 0, y: 20 }}
										animate={{ opacity: 1, y: 0 }}
										className="mt-6 bg-gradient-to-br from-pink-50 to-rose-50 border-2 border-pink-300 rounded-2xl p-6 max-w-2xl mx-auto"
									>
										<CheckCircle2 className="h-10 w-10 text-pink-600 mx-auto mb-4" />
										<h4 className="text-xl mb-4 text-pink-700">
											✅ Nhận diện khuôn mặt thành công!
										</h4>

										<div className="bg-white rounded-xl p-4 mb-4 border border-pink-200">
											<h5 className="text-sm mb-3 text-gray-700">
												📋 Thông tin bệnh nhân đã được tự động điền:
											</h5>
											<div className="grid grid-cols-2 gap-3 text-sm">
												<div>
													<span className="text-gray-500">Họ tên:</span>
													<p className="text-gray-900">{formData.fullName}</p>
												</div>
												<div>
													<span className="text-gray-500">SĐT:</span>
													<p className="text-gray-900">
														{formData.phoneNumber}
													</p>
												</div>
												<div>
													<span className="text-gray-500">Ngày sinh:</span>
													<p className="text-gray-900">
														{formData.dateOfBirth}
													</p>
												</div>
												<div>
													<span className="text-gray-500">Giới tính:</span>
													<p className="text-gray-900">
														{formData.gender === 'male'
															? 'Nam'
															: formData.gender === 'female'
															? 'Nữ'
															: 'Khác'}
													</p>
												</div>
												{formData.insurance && (
													<div className="col-span-2">
														<span className="text-gray-500">Bảo hiểm:</span>
														<p className="text-gray-900">
															{formData.insurance}
														</p>
													</div>
												)}
											</div>
										</div>

										<div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
											<p className="text-sm text-blue-700">
												💡 <strong>Bước tiếp theo:</strong> Chọn dịch vụ khám và
												bác sĩ phụ trách
											</p>
										</div>

										<div className="flex gap-3">
											<Button
												variant="outline"
												onClick={() => {
													setFormData({
														fullName: '',
														phoneNumber: '',
														dateOfBirth: '',
														gender: '' as Gender,
														address: '',
														addressDetail: '',
														provinceId: '',
														wardId: '',
														customerId: '',
														cccdNumber: '',
														insurance: '',
														reason: '',
														selectedServices: [],
														assignedDoctorId: '',
														specialty: '',
													});
													setSearchTerm('');
												}}
												className="flex-1 border-pink-300 text-pink-700 hover:bg-pink-50"
											>
												<Camera className="h-4 w-4 mr-2" />
												Nhận diện lại
											</Button>
											<Button
												onClick={() => setInputMethod('manual')}
												className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
											>
												Chọn dịch vụ & Bác sĩ →
											</Button>
										</div>
									</motion.div>
								)}
							</div>
						</TabsContent>

						{/* Insurance Card */}
						<TabsContent value="insurance" className="mt-0">
							<div className="space-y-6 text-center py-8">
								{!formData.fullName && (
									<>
										<div className="flex justify-center mb-6">
											<motion.div
												animate={isScanning ? { scale: [1, 1.05, 1] } : {}}
												transition={{
													duration: 2,
													repeat: isScanning ? Infinity : 0,
												}}
												className={`p-6 rounded-3xl bg-gradient-to-br ${
													isScanning
														? 'from-orange-500 to-amber-500'
														: 'from-blue-500 to-indigo-500'
												} shadow-none`}
											>
												<CreditCard className="h-16 w-16 text-white" />
											</motion.div>
										</div>

										<h3 className="text-xl">
											{isScanning
												? 'Đang quét thẻ BHYT...'
												: 'Quét thẻ bảo hiểm y tế'}
										</h3>
										<p className="text-gray-600 mb-6">
											{isScanning
												? 'Đang đọc thông tin từ thẻ'
												: 'Đặt thẻ BHYT vào đầu đọc hoặc quét QR/Barcode'}
										</p>

										{!isScanning && (
											<Button
												onClick={handleScanInsurance}
												className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
											>
												<ScanLine className="h-5 w-5 mr-2" />
												Quét thẻ BHYT
											</Button>
										)}
									</>
								)}

								{formData.insurance && !isScanning && (
									<motion.div
										initial={{ opacity: 0, y: 20 }}
										animate={{ opacity: 1, y: 0 }}
										className="mt-6 bg-gradient-to-br from-orange-50 to-amber-50 border-2 border-orange-300 rounded-2xl p-6 max-w-2xl mx-auto"
									>
										<CheckCircle2 className="h-10 w-10 text-orange-600 mx-auto mb-4" />
										<h4 className="text-xl mb-4 text-orange-700">
											✅ Quét thẻ BHYT thành công!
										</h4>

										<div className="bg-white rounded-xl p-4 mb-4 border border-orange-200">
											<h5 className="text-sm mb-3 text-gray-700">
												📋 Thông tin bệnh nhân đã được tự động điền:
											</h5>
											<div className="grid grid-cols-2 gap-3 text-sm">
												<div>
													<span className="text-gray-500">Họ tên:</span>
													<p className="text-gray-900">{formData.fullName}</p>
												</div>
												<div>
													<span className="text-gray-500">SĐT:</span>
													<p className="text-gray-900">
														{formData.phoneNumber}
													</p>
												</div>
												<div>
													<span className="text-gray-500">Ngày sinh:</span>
													<p className="text-gray-900">
														{formData.dateOfBirth}
													</p>
												</div>
												<div>
													<span className="text-gray-500">Giới tính:</span>
													<p className="text-gray-900">
														{formData.gender === 'male'
															? 'Nam'
															: formData.gender === 'female'
															? 'Nữ'
															: 'Khác'}
													</p>
												</div>
												<div className="col-span-2">
													<span className="text-gray-500">Mã BHYT:</span>
													<p className="text-gray-900">{formData.insurance}</p>
												</div>
											</div>
										</div>

										<div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
											<p className="text-sm text-blue-700">
												💡 <strong>Bước tiếp theo:</strong> Chọn dịch vụ khám và
												bác sĩ phụ trách
											</p>
										</div>

										<div className="flex gap-3">
											<Button
												variant="outline"
												onClick={() => {
													setFormData({
														fullName: '',
														phoneNumber: '',
														dateOfBirth: '',
														gender: '' as Gender,
														address: '',
														addressDetail: '',
														provinceId: '',
														wardId: '',
														customerId: '',
														cccdNumber: '',
														insurance: '',
														reason: '',
														selectedServices: [],
														assignedDoctorId: '',
														specialty: '',
													});
													setSearchTerm('');
												}}
												className="flex-1 border-orange-300 text-orange-700 hover:bg-orange-50"
											>
												<CreditCard className="h-4 w-4 mr-2" />
												Quét lại thẻ
											</Button>
											<Button
												onClick={() => setInputMethod('manual')}
												className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
											>
												Chọn dịch vụ & Bác sĩ →
											</Button>
										</div>
									</motion.div>
								)}
							</div>
						</TabsContent>

						{/* Group Import */}
						<TabsContent value="group" className="mt-0">
							<div className="space-y-6 py-4">
								<div className="text-center mb-6">
									<div className="flex justify-center mb-4">
										<div className="p-6 rounded-3xl bg-gradient-to-br from-gray-700 to-slate-700 shadow-none">
											<Users className="h-16 w-16 text-white" />
										</div>
									</div>
									<h3 className="text-xl mb-2">Nhập hàng loạt (Khám đoàn)</h3>
									<p className="text-gray-600">
										Upload file Excel chứa danh sách khách hàng
									</p>
								</div>

								<div className="max-w-2xl mx-auto">
									{!excelFile ? (
										<div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:border-blue-400 transition-colors">
											<input
												ref={fileInputRef}
												type="file"
												accept=".xlsx,.xls"
												onChange={handleFileUpload}
												className="hidden"
											/>
											<Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
											<p className="text-gray-600 mb-4">
												Kéo thả file Excel hoặc click để chọn
											</p>
											<Button
												onClick={() => fileInputRef.current?.click()}
												variant="outline"
											>
												<Upload className="h-4 w-4 mr-2" />
												Chọn file Excel
											</Button>
										</div>
									) : (
										<motion.div
											initial={{ opacity: 0, y: 20 }}
											animate={{ opacity: 1, y: 0 }}
											className="space-y-4"
										>
											<div className="bg-green-50 border-2 border-green-200 rounded-2xl p-4">
												<div className="flex items-center gap-3">
													<CheckCircle2 className="h-6 w-6 text-green-600" />
													<div className="flex-1">
														<p className="text-sm mb-1">{excelFile.name}</p>
														<p className="text-xs text-gray-600">
															Đã load {groupRecords.length} hồ sơ
														</p>
													</div>
													<button
														onClick={() => {
															setExcelFile(null);
															setGroupRecords([]);
														}}
														className="text-gray-400 hover:text-gray-600"
													>
														<X className="h-5 w-5" />
													</button>
												</div>
											</div>

											<div className="border border-gray-200 rounded-xl overflow-hidden">
												<div className="bg-gray-50 p-3 border-b border-gray-200">
													<h4 className="text-sm">Danh sách hồ sơ</h4>
												</div>
												<div className="divide-y divide-gray-200">
													{groupRecords.map((record, index) => (
														<div
															key={index}
															className="p-3 flex items-center gap-3 hover:bg-gray-50"
														>
															<div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center text-white text-xs">
																{index + 1}
															</div>
															<div className="flex-1">
																<p className="text-sm">{record.fullName}</p>
																<p className="text-xs text-gray-600">
																	{record.phoneNumber} • {record.service}
																</p>
															</div>
														</div>
													))}
												</div>
											</div>

											<Button
												onClick={handleSubmitGroupRecords}
												className="w-full bg-gradient-to-r from-gray-700 to-slate-700"
											>
												<Zap className="h-4 w-4 mr-2" />
												Tiếp nhận {groupRecords.length} hồ sơ
											</Button>
										</motion.div>
									)}
								</div>
							</div>
						</TabsContent>
					</motion.div>
				</AnimatePresence>
			</Tabs>
		</div>
	);
}
