import React, { useState, useMemo, useRef, useEffect } from 'react';
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
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { toast } from 'sonner';
import { Gender, MedicalRecord } from '../types';
import {
	Phone,
	MapPin,
	Calendar,
	User,
	ArrowLeft,
	Upload,
	FileText,
	Heart,
	Activity,
	ClipboardList,
	PenTool,
} from 'lucide-react';
import { motion } from 'motion/react';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from './ui/command';
import { ChevronsUpDown } from 'lucide-react';
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from './ui/accordion';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Checkbox } from './ui/checkbox';
import administrativeData from '../administrative.json';

interface CustomerBookingPageProps {
	onSubmit?: (
		record: Omit<
			MedicalRecord,
			'id' | 'receiveCode' | 'createdAt' | 'updatedAt'
		>,
	) => void;
	onBack?: () => void;
}

// Interface cho form data đầy đủ
interface MedicalExaminationFormData {
	// I. THÔNG TIN HÀNH CHÍNH
	photo1: File | null;
	fullName: string;
	code: string;
	gender: Gender | '';
	yearOfBirth: string;
	age: string;
	cccdNumber: string;
	cccdIssueDate: string;
	cccdIssuePlace: string;
	permanentAddress: string;
	currentAddress: string;
	workplace: string;
	department: string;
	reason: string;
	phoneNumber: string;

	// II. TIỀN SỬ GIA ĐÌNH
	familyHasDisease: 'yes' | 'no' | '';
	familyDiseaseName: string;

	// III. TIỀN SỬ BẢN THÂN - 22 mục
	personalHistory: {
		diseaseInjury5Years: 'yes' | 'no' | '';
		neurologicalDisease: 'yes' | 'no' | '';
		eyeDisease: 'yes' | 'no' | '';
		earDisease: 'yes' | 'no' | '';
		heartDisease: 'yes' | 'no' | '';
		heartSurgery: 'yes' | 'no' | '';
		hypertension: 'yes' | 'no' | '';
		dyspnea: 'yes' | 'no' | '';
		lungDisease: 'yes' | 'no' | '';
		kidneyDisease: 'yes' | 'no' | '';
		alcoholAddiction: 'yes' | 'no' | '';
		diabetes: 'yes' | 'no' | '';
		mentalIllness: 'yes' | 'no' | '';
		lossOfConsciousness: 'yes' | 'no' | '';
		fainting: 'yes' | 'no' | '';
		digestiveDisease: 'yes' | 'no' | '';
		sleepDisorder: 'yes' | 'no' | '';
		stroke: 'yes' | 'no' | '';
		spineDisease: 'yes' | 'no' | '';
		regularAlcohol: 'yes' | 'no' | '';
		drugUse: 'yes' | 'no' | '';
		otherDisease: 'yes' | 'no' | '';
		otherDiseaseName: string;
	};

	// IV. CÂU HỎI KHÁC
	currentTreatment: 'yes' | 'no' | '';
	currentMedications: string;
	medicationDosage: string;
	hasPregnancyHistory: 'yes' | 'no' | '';
	pregnancyHistory: string;

	// V. CAM ĐOAN & CHỮ KÝ
	declarationDay: string;
	declarationMonth: string;
	declarationYear: string;
	signatureName: string;
}

export function CustomerBookingPage({
	onSubmit,
	onBack,
}: CustomerBookingPageProps) {
	const [formData, setFormData] = useState<MedicalExaminationFormData>({
		photo1: null,
		fullName: '',
		code: '',
		gender: '',
		yearOfBirth: '',
		age: '',
		cccdNumber: '',
		cccdIssueDate: '',
		cccdIssuePlace: '',
		permanentAddress: '',
		currentAddress: '',
		workplace: '',
		department: '',
		reason: '',
		phoneNumber: '',
		familyHasDisease: 'no',
		familyDiseaseName: '',
		personalHistory: {
			diseaseInjury5Years: 'no',
			neurologicalDisease: 'no',
			eyeDisease: 'no',
			earDisease: 'no',
			heartDisease: 'no',
			heartSurgery: 'no',
			hypertension: 'no',
			dyspnea: 'no',
			lungDisease: 'no',
			kidneyDisease: 'no',
			alcoholAddiction: 'no',
			diabetes: 'no',
			mentalIllness: 'no',
			lossOfConsciousness: 'no',
			fainting: 'no',
			digestiveDisease: 'no',
			sleepDisorder: 'no',
			stroke: 'no',
			spineDisease: 'no',
			regularAlcohol: 'no',
			drugUse: 'no',
			otherDisease: 'no',
			otherDiseaseName: '',
		},
		currentTreatment: 'no',
		currentMedications: '',
		medicationDosage: '',
		hasPregnancyHistory: 'no',
		pregnancyHistory: '',
		declarationDay: '',
		declarationMonth: '',
		declarationYear: '',
		signatureName: '',
	});

	const [errors, setErrors] = useState<Record<string, boolean>>({});
	const [provinceOpen, setProvinceOpen] = useState(false);
	const [wardOpen, setWardOpen] = useState(false);
	const [provinceSearch, setProvinceSearch] = useState('');
	const [wardSearch, setWardSearch] = useState('');
	const [selectedProvinceId, setSelectedProvinceId] = useState('');
	const [selectedWardId, setSelectedWardId] = useState('');
	const dateInputRef = useRef<HTMLInputElement>(null);
	const [cursorPosition, setCursorPosition] = useState<number | null>(null);

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
			(p) => p.ID === selectedProvinceId,
		);
	}, [selectedProvinceId]);

	const wards = useMemo(() => {
		if (!selectedProvince || !selectedProvince.WARDS) return [];
		return selectedProvince.WARDS.filter(
			(w: any) =>
				w.ID !== '-1' && w.TEN.toLowerCase().includes(wardSearch.toLowerCase()),
		);
	}, [selectedProvince, wardSearch]);

	// Tính tuổi từ năm sinh
	const calculateAge = (year: string) => {
		if (!year) return '';
		const currentYear = new Date().getFullYear();
		const birthYear = parseInt(year);
		if (isNaN(birthYear)) return '';
		return (currentYear - birthYear).toString();
	};

	const handleYearOfBirthChange = (year: string) => {
		setFormData({
			...formData,
			yearOfBirth: year,
			age: calculateAge(year),
		});
	};

	const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			setFormData({ ...formData, photo1: file });
		}
	};

	// Di chuyển cursor khi cursorPosition thay đổi
	useEffect(() => {
		if (cursorPosition !== null && dateInputRef.current) {
			// Sử dụng requestAnimationFrame để đảm bảo DOM đã được render
			requestAnimationFrame(() => {
				setTimeout(() => {
					if (dateInputRef.current) {
						dateInputRef.current.setSelectionRange(
							cursorPosition,
							cursorPosition,
						);
						setCursorPosition(null); // Reset sau khi di chuyển
					}
				}, 0);
			});
		}
	}, [cursorPosition, formData.cccdIssueDate]);

	// Format ngày tự động với định dạng dd/mm/yyyy, chỉ hiển thị số và dấu "/"
	const formatDateInput = (value: string): string => {
		// Chỉ cho phép số
		const numbers = value.replace(/\D/g, '');

		// Giới hạn tối đa 8 số (ddmmyyyy)
		const limitedNumbers = numbers.slice(0, 8);

		if (limitedNumbers.length === 0) {
			return '';
		}

		// Format theo từng phần: dd/mm/yyyy
		if (limitedNumbers.length === 1) {
			// Chỉ có 1 số ngày
			return limitedNumbers;
		} else if (limitedNumbers.length === 2) {
			// Đủ 2 số ngày, hiển thị dấu "/"
			return `${limitedNumbers}/`;
		} else if (limitedNumbers.length === 3) {
			// Có ngày và 1 số tháng
			return `${limitedNumbers.slice(0, 2)}/${limitedNumbers.slice(2)}`;
		} else if (limitedNumbers.length === 4) {
			// Đủ 2 số ngày và 2 số tháng, hiển thị dấu "/" thứ 2
			return `${limitedNumbers.slice(0, 2)}/${limitedNumbers.slice(2)}/`;
		} else {
			// Có ngày, tháng và năm
			return `${limitedNumbers.slice(0, 2)}/${limitedNumbers.slice(
				2,
				4,
			)}/${limitedNumbers.slice(4)}`;
		}
	};

	// Validate và chuyển đổi ngày dd/mm/yyyy sang Date object
	const parseDateString = (dateString: string): Date | null => {
		if (!dateString || dateString.length !== 10) return null;

		const parts = dateString.split('/');
		if (parts.length !== 3) return null;

		// Parse từng phần
		const dayStr = parts[0];
		const monthStr = parts[1];
		const yearStr = parts[2];

		// Phải có đủ số trong mỗi phần
		if (dayStr.length !== 2 || monthStr.length !== 2 || yearStr.length !== 4) {
			return null;
		}

		const day = parseInt(dayStr, 10);
		const month = parseInt(monthStr, 10) - 1; // Month is 0-indexed
		const year = parseInt(yearStr, 10);

		if (isNaN(day) || isNaN(month) || isNaN(year)) return null;

		const date = new Date(year, month, day);

		// Validate ngày hợp lệ
		if (
			date.getDate() !== day ||
			date.getMonth() !== month ||
			date.getFullYear() !== year
		) {
			return null;
		}

		return date;
	};

	const handleDateInputChange = (value: string) => {
		// Lấy tất cả số từ giá trị input (loại bỏ tất cả ký tự không phải số)
		const numbers = value.replace(/\D/g, '');

		// Nếu không có số nào, đặt về rỗng
		if (numbers.length === 0) {
			setFormData({ ...formData, cccdIssueDate: '' });
			setCursorPosition(0);
			return;
		}

		// Format lại với các số đã nhập
		const formatted = formatDateInput(numbers);

		setFormData({ ...formData, cccdIssueDate: formatted });

		// Tính toán vị trí cursor mong muốn
		let desiredCursorPosition = formatted.length;

		// Khi nhập đủ 2 số (ngày), di chuyển cursor sau dấu "/" đầu tiên
		if (numbers.length === 2) {
			desiredCursorPosition = 3; // Sau "dd/"
		}
		// Khi nhập đủ 4 số (ngày + tháng), di chuyển cursor sau dấu "/" thứ 2
		else if (numbers.length === 4) {
			desiredCursorPosition = 6; // Sau "dd/mm/"
		}
		// Nếu đã nhập đủ 8 số, giữ cursor ở cuối
		else if (numbers.length === 8) {
			desiredCursorPosition = formatted.length; // Cuối "dd/mm/yyyy"
		}
		// Nếu đang nhập, cursor ở vị trí tiếp theo (sau số vừa nhập)
		else {
			desiredCursorPosition = formatted.length;
		}

		// Set cursor position để useEffect sẽ di chuyển cursor
		setCursorPosition(desiredCursorPosition);
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		// Reset errors
		const newErrors: Record<string, boolean> = {};

		// I. THÔNG TIN HÀNH CHÍNH - Validate required fields
		if (!formData.fullName.trim()) {
			newErrors.fullName = true;
		}
		if (!formData.code.trim()) {
			newErrors.code = true;
		}
		if (!formData.phoneNumber.trim()) {
			newErrors.phoneNumber = true;
		}
		if (!formData.gender) {
			newErrors.gender = true;
		}
		if (!formData.yearOfBirth) {
			newErrors.yearOfBirth = true;
		}
		if (!formData.cccdNumber.trim()) {
			newErrors.cccdNumber = true;
		}
		if (!formData.cccdIssueDate.trim()) {
			newErrors.cccdIssueDate = true;
		} else {
			const issueDate = parseDateString(formData.cccdIssueDate);
			if (!issueDate) {
				newErrors.cccdIssueDate = true;
			} else {
				const today = new Date();
				today.setHours(0, 0, 0, 0);
				if (issueDate > today) {
					newErrors.cccdIssueDate = true;
				}
			}
		}
		if (!formData.cccdIssuePlace.trim()) {
			newErrors.cccdIssuePlace = true;
		}
		if (!formData.permanentAddress.trim()) {
			newErrors.permanentAddress = true;
		}
		if (!formData.currentAddress.trim()) {
			newErrors.currentAddress = true;
		}
		if (!formData.workplace.trim()) {
			newErrors.workplace = true;
		}
		if (!formData.department.trim()) {
			newErrors.department = true;
		}
		if (!formData.reason.trim()) {
			newErrors.reason = true;
		}

		// II. TIỀN SỬ GIA ĐÌNH
		if (!formData.familyHasDisease) {
			newErrors.familyHasDisease = true;
		}
		if (
			formData.familyHasDisease === 'yes' &&
			!formData.familyDiseaseName.trim()
		) {
			newErrors.familyDiseaseName = true;
		}

		// III. TIỀN SỬ BẢN THÂN - Validate tất cả các trường
		const personalHistoryKeys: (keyof typeof formData.personalHistory)[] = [
			'diseaseInjury5Years',
			'neurologicalDisease',
			'eyeDisease',
			'earDisease',
			'heartDisease',
			'heartSurgery',
			'hypertension',
			'dyspnea',
			'lungDisease',
			'kidneyDisease',
			'alcoholAddiction',
			'diabetes',
			'mentalIllness',
			'lossOfConsciousness',
			'fainting',
			'digestiveDisease',
			'sleepDisorder',
			'stroke',
			'spineDisease',
			'regularAlcohol',
			'drugUse',
			'otherDisease',
		];
		personalHistoryKeys.forEach((key) => {
			if (!formData.personalHistory[key]) {
				newErrors[`personalHistory.${String(key)}`] = true;
			}
		});
		if (
			formData.personalHistory.otherDisease === 'yes' &&
			!formData.personalHistory.otherDiseaseName.trim()
		) {
			newErrors.otherDiseaseName = true;
		}

		// IV. CÂU HỎI KHÁC
		if (!formData.currentTreatment) {
			newErrors.currentTreatment = true;
		}
		if (
			formData.currentTreatment === 'yes' &&
			!formData.currentMedications.trim()
		) {
			newErrors.currentMedications = true;
		}
		if (!formData.hasPregnancyHistory) {
			newErrors.hasPregnancyHistory = true;
		}
		if (
			formData.hasPregnancyHistory === 'yes' &&
			!formData.pregnancyHistory.trim()
		) {
			newErrors.pregnancyHistory = true;
		}

		if (Object.keys(newErrors).length > 0) {
			setErrors(newErrors);
			toast.error(
				'Vui lòng điền đầy đủ thông tin bắt buộc và kiểm tra lại ngày cấp',
			);
			return;
		}

		// Build address
		const addressParts: string[] = [];
		if (formData.currentAddress) {
			addressParts.push(formData.currentAddress);
		}
		if (selectedProvince) {
			const selectedWard = selectedProvince.WARDS?.find(
				(w: any) => w.ID === selectedWardId,
			);
			if (selectedWard) {
				addressParts.push(selectedWard.TEN);
			}
			addressParts.push(selectedProvince.NAME);
		}

		const fullAddress =
			addressParts.length > 0
				? addressParts.join(', ')
				: formData.currentAddress;

		// Tạo dateOfBirth từ yearOfBirth
		const dateOfBirth = formData.yearOfBirth
			? `${formData.yearOfBirth}-01-01`
			: '';

		// Chuẩn bị dữ liệu form đầy đủ (không bao gồm file ảnh - sẽ xử lý riêng)
		const examinationFormData = {
			...formData,
			photo1: formData.photo1
				? {
						name: formData.photo1.name,
						size: formData.photo1.size,
						type: formData.photo1.type,
				  }
				: null,
		};

		// Lưu dữ liệu form đầy đủ vào localStorage với key duy nhất
		const formDataId = `examination_form_${Date.now()}_${Math.random()
			.toString(36)
			.substring(7)}`;
		localStorage.setItem(formDataId, JSON.stringify(examinationFormData));

		// Lưu ảnh vào localStorage nếu có (convert sang base64)
		if (formData.photo1) {
			const reader = new FileReader();
			reader.onloadend = () => {
				localStorage.setItem(`${formDataId}_photo1`, reader.result as string);
			};
			reader.readAsDataURL(formData.photo1);
		}

		if (onSubmit) {
			onSubmit({
				patient: {
					id: formData.code || `patient_${Date.now()}`,
					fullName: formData.fullName.toUpperCase(),
					phoneNumber: formData.phoneNumber,
					dateOfBirth: dateOfBirth,
					gender: formData.gender as Gender,
					address: fullAddress,
					cccdNumber: formData.cccdNumber,
					customerId: formData.code || undefined,
				},
				requestedServices: [],
				status: 'PENDING_CHECKIN',
				diagnosis: undefined,
				reason: formData.reason,
				paymentStatus: 'pending',
				// Lưu ID của form data vào appointmentId để có thể lấy lại sau
				appointmentId: formDataId,
			});
		}

		toast.success(
			'Đặt lịch khám thành công! Vui lòng chờ xác nhận từ phòng khám.',
		);
	};

	const personalHistoryItems = [
		{
			key: 'diseaseInjury5Years',
			label: 'Có bệnh hay bị thương trong 5 năm qua',
		},
		{
			key: 'neurologicalDisease',
			label: 'Có bệnh thần kinh hay bị thương ở đầu',
		},
		{
			key: 'eyeDisease',
			label: 'Bệnh mắt hoặc giảm thị lực (trừ trường hợp đeo kính thuốc)',
		},
		{ key: 'earDisease', label: 'Bệnh ở tai, giảm sức nghe hoặc thăng bằng' },
		{
			key: 'heartDisease',
			label: 'Bệnh ở tim, hoặc nhồi máu cơ tim, các bệnh tim mạch khác',
		},
		{
			key: 'heartSurgery',
			label:
				'Phẫu thuật can thiệp tim - mạch (thay van, bắc cầu nối, tạo hình mạch, máy tạo nhịp, đặt slent mạch, ghép tim)',
		},
		{ key: 'hypertension', label: 'Tăng huyết áp' },
		{ key: 'dyspnea', label: 'Khó thở' },
		{
			key: 'lungDisease',
			label: 'Bệnh phổi, hen, khí phế thũng, viêm phế quản mạn tính',
		},
		{ key: 'kidneyDisease', label: 'Bệnh thận, lọc máu' },
		{ key: 'alcoholAddiction', label: 'Nghiện rượu, bia' },
		{
			key: 'diabetes',
			label: 'Đái tháo đường hoặc kiểm soát tăng đường huyết',
		},
		{ key: 'mentalIllness', label: 'Bệnh tâm thần' },
		{ key: 'lossOfConsciousness', label: 'Mất ý thức, rối loạn ý thức' },
		{ key: 'fainting', label: 'Ngất, chóng mặt' },
		{ key: 'digestiveDisease', label: 'Bệnh tiêu hóa' },
		{
			key: 'sleepDisorder',
			label: 'Rối loạn giấc ngủ, ngừng thở khi ngủ, ngủ rũ ban ngày, ngáy to',
		},
		{ key: 'stroke', label: 'Tai biến mạch máu não hoặc liệt' },
		{ key: 'spineDisease', label: 'Bệnh hoặc tổn thương cột sống' },
		{ key: 'regularAlcohol', label: 'Sử dụng rượu thường xuyên, liên tục' },
		{ key: 'drugUse', label: 'Sử dụng ma túy và chất gây nghiện' },
		{ key: 'otherDisease', label: 'Bệnh khác (ghi rõ)' },
	];

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-4 px-2 sm:px-4">
			<div className="max-w-4xl mx-auto">
				{/* Header */}
				<motion.div
					initial={{ opacity: 0, y: -20 }}
					animate={{ opacity: 1, y: 0 }}
					className="mb-4 sm:mb-6"
				>
					{onBack && (
						<Button
							variant="ghost"
							onClick={onBack}
							className="mb-3 sm:mb-4"
							size="sm"
						>
							<ArrowLeft className="h-4 w-4 mr-2" />
							Quay lại
						</Button>
					)}
					<Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
						<CardHeader className="p-4 sm:p-6">
							<div className="flex items-center gap-2 sm:gap-3">
								<div className="p-2 sm:p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl">
									<Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
								</div>
								<div className="flex-1">
									<CardTitle className="text-lg sm:text-2xl">
										Đặt lịch khám sức khỏe
									</CardTitle>
									<p className="text-xs sm:text-sm text-gray-600 mt-1">
										Vui lòng điền đầy đủ thông tin theo form khám sức khỏe
									</p>
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
						<CardContent className="p-4 sm:p-6">
							<form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
								<Accordion
									type="multiple"
									defaultValue={[
										'section1',
										'section2',
										'section3',
										'section4',
										'section5',
									]}
									className="w-full"
								>
									{/* I. THÔNG TIN HÀNH CHÍNH */}
									<AccordionItem value="section1">
										<AccordionTrigger className="text-base sm:text-lg font-semibold">
											<div className="flex items-center gap-2">
												<span>I. THÔNG TIN CÁ NHÂN</span>
											</div>
										</AccordionTrigger>
										<AccordionContent>
											<div className="space-y-4 sm:space-y-6 pt-2">
												{/* Thông tin cơ bản */}
												<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
													<div className="space-y-2">
														<Label htmlFor="fullName">
															Họ và tên <span className="text-red-500">*</span>
														</Label>
														<div
															style={
																{
																	'--placeholder-transform': 'none',
																} as React.CSSProperties
															}
														>
															<Input
																id="fullName"
																value={formData.fullName}
																onChange={(e) => {
																	setFormData({
																		...formData,
																		fullName: e.target.value.toUpperCase(),
																	});
																	if (errors.fullName) {
																		setErrors({ ...errors, fullName: false });
																	}
																}}
																placeholder="Nhập họ và tên"
																style={{
																	textTransform: 'uppercase',
																}}
																className={`border-gray-300 focus:border-blue-500 placeholder:text-sm ${
																	errors.fullName
																		? 'border-red-500 bg-red-50'
																		: ''
																}`}
															/>
															<style>{`
																#fullName::placeholder {
																	text-transform: none !important;
																}
															`}</style>
														</div>
													</div>

													<div className="space-y-2">
														<Label htmlFor="gender">
															Giới tính <span className="text-red-500">*</span>
														</Label>
														<Select
															value={formData.gender}
															onValueChange={(value) => {
																setFormData({
																	...formData,
																	gender: value as Gender,
																});
																if (errors.gender) {
																	setErrors({ ...errors, gender: false });
																}
															}}
														>
															<SelectTrigger
																className={`border-gray-300 text-base md:text-sm ${
																	errors.gender
																		? 'border-red-500 bg-red-50'
																		: ''
																}`}
															>
																<SelectValue
																	placeholder="Chọn giới tính"
																	className="text-base md:text-sm"
																/>
															</SelectTrigger>
															<SelectContent>
																<SelectItem value="male">Nam</SelectItem>
																<SelectItem value="female">Nữ</SelectItem>
															</SelectContent>
														</Select>
													</div>

													<div className="space-y-2">
														<Label htmlFor="yearOfBirth">
															Năm sinh <span className="text-red-500">*</span>
														</Label>
														<Input
															id="yearOfBirth"
															type="number"
															value={formData.yearOfBirth}
															onChange={(e) => {
																handleYearOfBirthChange(e.target.value);
																if (errors.yearOfBirth) {
																	setErrors({ ...errors, yearOfBirth: false });
																}
															}}
															placeholder="Nhập năm sinh"
															min="1900"
															max={new Date().getFullYear()}
															className={`border-gray-300 focus:border-blue-500 placeholder:text-sm ${
																errors.yearOfBirth
																	? 'border-red-500 bg-red-50'
																	: ''
															}`}
														/>
													</div>

													<div className="space-y-2">
														<Label htmlFor="cccdNumber">
															Số CCCD/Hộ chiếu{' '}
															<span className="text-red-500">*</span>
														</Label>
														<Input
															id="cccdNumber"
															value={formData.cccdNumber}
															onChange={(e) => {
																setFormData({
																	...formData,
																	cccdNumber: e.target.value,
																});
																if (errors.cccdNumber) {
																	setErrors({ ...errors, cccdNumber: false });
																}
															}}
															placeholder="Nhập số CCCD/Hộ chiếu"
															className={`border-gray-300 focus:border-blue-500 placeholder:text-sm ${
																errors.cccdNumber
																	? 'border-red-500 bg-red-50'
																	: ''
															}`}
														/>
													</div>

													<div className="space-y-2">
														<Label htmlFor="cccdIssueDate">
															Ngày cấp <span className="text-red-500">*</span>
														</Label>
														<Input
															ref={dateInputRef}
															id="cccdIssueDate"
															type="text"
															inputMode="numeric"
															value={formData.cccdIssueDate}
															onChange={(e) => {
																handleDateInputChange(e.target.value);
															}}
															onPaste={(e) => {
																e.preventDefault();
																const pastedText =
																	e.clipboardData.getData('text');
																const numbers = pastedText
																	.replace(/\D/g, '')
																	.slice(0, 8);
																handleDateInputChange(numbers);
															}}
															placeholder="dd/mm/yyyy"
															className={`border-gray-300 focus:border-blue-500 placeholder:text-sm ${
																errors.cccdIssueDate
																	? 'border-red-500 bg-red-50'
																	: ''
															}`}
														/>
													</div>

													<div className="space-y-2">
														<Label htmlFor="cccdIssuePlace">
															Nơi cấp <span className="text-red-500">*</span>
														</Label>
														<Input
															id="cccdIssuePlace"
															value={formData.cccdIssuePlace}
															onChange={(e) => {
																setFormData({
																	...formData,
																	cccdIssuePlace: e.target.value,
																});
																if (errors.cccdIssuePlace) {
																	setErrors({
																		...errors,
																		cccdIssuePlace: false,
																	});
																}
															}}
															placeholder="Nhập nơi cấp"
															className={`border-gray-300 focus:border-blue-500 placeholder:text-sm ${
																errors.cccdIssuePlace
																	? 'border-red-500 bg-red-50'
																	: ''
															}`}
														/>
													</div>

													<div className="space-y-2 sm:col-span-2">
														<Label htmlFor="permanentAddress">
															Hộ khẩu thường trú{' '}
															<span className="text-red-500">*</span>
														</Label>
														<Textarea
															id="permanentAddress"
															value={formData.permanentAddress}
															onChange={(e) => {
																setFormData({
																	...formData,
																	permanentAddress: e.target.value,
																});
																if (errors.permanentAddress) {
																	setErrors({
																		...errors,
																		permanentAddress: false,
																	});
																}
															}}
															placeholder="Nhập địa chỉ hộ khẩu thường trú"
															className={`border-gray-300 focus:border-blue-500 resize-none placeholder:text-sm ${
																errors.permanentAddress
																	? 'border-red-500 bg-red-50'
																	: ''
															}`}
															rows={2}
														/>
													</div>

													<div className="space-y-2 sm:col-span-2">
														<Label htmlFor="currentAddress">
															Chỗ ở hiện tại{' '}
															<span className="text-red-500">*</span>
														</Label>
														<Textarea
															id="currentAddress"
															value={formData.currentAddress}
															onChange={(e) => {
																setFormData({
																	...formData,
																	currentAddress: e.target.value,
																});
																if (errors.currentAddress) {
																	setErrors({
																		...errors,
																		currentAddress: false,
																	});
																}
															}}
															placeholder="Nhập địa chỉ chỗ ở hiện tại"
															className={`border-gray-300 focus:border-blue-500 resize-none placeholder:text-sm ${
																errors.currentAddress
																	? 'border-red-500 bg-red-50'
																	: ''
															}`}
															rows={2}
														/>
													</div>

													<div className="space-y-2">
														<Label htmlFor="workplace">
															Nơi làm việc{' '}
															<span className="text-red-500">*</span>
														</Label>
														<Input
															id="workplace"
															value={formData.workplace}
															onChange={(e) => {
																setFormData({
																	...formData,
																	workplace: e.target.value,
																});
																if (errors.workplace) {
																	setErrors({ ...errors, workplace: false });
																}
															}}
															placeholder="Nhập nơi làm việc"
															className={`border-gray-300 focus:border-blue-500 placeholder:text-sm ${
																errors.workplace
																	? 'border-red-500 bg-red-50'
																	: ''
															}`}
														/>
													</div>

													<div className="space-y-2">
														<Label htmlFor="department">
															Bộ phận <span className="text-red-500">*</span>
														</Label>
														<Input
															id="department"
															value={formData.department}
															onChange={(e) => {
																setFormData({
																	...formData,
																	department: e.target.value,
																});
																if (errors.department) {
																	setErrors({ ...errors, department: false });
																}
															}}
															placeholder="Nhập bộ phận"
															className={`border-gray-300 focus:border-blue-500 placeholder:text-sm ${
																errors.department
																	? 'border-red-500 bg-red-50'
																	: ''
															}`}
														/>
													</div>

													<div className="space-y-2 sm:col-span-2">
														<Label htmlFor="reason">
															Lý do khám sức khỏe{' '}
															<span className="text-red-500">*</span>
														</Label>
														<Textarea
															id="reason"
															value={formData.reason}
															onChange={(e) => {
																setFormData({
																	...formData,
																	reason: e.target.value,
																});
																if (errors.reason) {
																	setErrors({ ...errors, reason: false });
																}
															}}
															placeholder="Nhập lý do khám sức khỏe"
															className={`border-gray-300 focus:border-blue-500 resize-none placeholder:text-sm ${
																errors.reason ? 'border-red-500 bg-red-50' : ''
															}`}
															rows={3}
														/>
													</div>

													<div className="space-y-2">
														<Label htmlFor="phoneNumber">
															Số điện thoại{' '}
															<span className="text-red-500">*</span>
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
																		setErrors({
																			...errors,
																			phoneNumber: false,
																		});
																	}
																}}
																placeholder="Nhập số điện thoại"
																className={`pl-10 border-gray-300 focus:border-blue-500 placeholder:text-sm ${
																	errors.phoneNumber
																		? 'border-red-500 bg-red-50'
																		: ''
																}`}
															/>
														</div>
													</div>
												</div>
											</div>
										</AccordionContent>
									</AccordionItem>

									{/* II. TIỀN SỬ GIA ĐÌNH */}
									<AccordionItem value="section2">
										<AccordionTrigger className="text-base sm:text-lg font-semibold">
											<div className="flex items-center gap-2">
												<span>II. TIỀN SỬ GIA ĐÌNH</span>
											</div>
										</AccordionTrigger>
										<AccordionContent>
											<div className="space-y-4 pt-2">
												<div className="space-y-2">
													<Label className="leading-loose">
														Có ai trong gia đình ông (bà) mắc một số trong các
														bệnh: Truyền nhiễm, tim mạch, đái tháo đường, lao,
														hen phế quản, ung thư, động kinh, rối loạn tâm thần,
														bệnh khác?
													</Label>
													<RadioGroup
														value={formData.familyHasDisease}
														onValueChange={(value) =>
															setFormData({
																...formData,
																familyHasDisease: value as 'yes' | 'no',
															})
														}
														className="flex flex-row gap-6"
													>
														<div className="flex items-center space-x-2">
															<RadioGroupItem value="yes" id="family-yes" />
															<Label
																htmlFor="family-yes"
																className="cursor-pointer px-2"
															>
																Có
															</Label>
														</div>
														<div className="flex items-center space-x-2">
															<RadioGroupItem value="no" id="family-no" />
															<Label
																htmlFor="family-no"
																className="cursor-pointer px-2"
															>
																Không
															</Label>
														</div>
													</RadioGroup>
												</div>

												{formData.familyHasDisease === 'yes' && (
													<div className="space-y-2">
														<Label htmlFor="familyDiseaseName">
															Ghi rõ tên bệnh
														</Label>
														<Textarea
															id="familyDiseaseName"
															value={formData.familyDiseaseName}
															onChange={(e) =>
																setFormData({
																	...formData,
																	familyDiseaseName: e.target.value,
																})
															}
															placeholder="Nhập tên bệnh gia đình mắc phải"
															className="border-gray-300 focus:border-blue-500 resize-none placeholder:text-sm"
															rows={3}
														/>
													</div>
												)}
											</div>
										</AccordionContent>
									</AccordionItem>

									{/* III. TIỀN SỬ BẢN THÂN */}
									<AccordionItem value="section3">
										<AccordionTrigger className="text-base sm:text-lg font-semibold">
											<div className="flex items-center gap-2">
												<span>III. TIỀN SỬ BẢN THÂN</span>
											</div>
										</AccordionTrigger>

										<AccordionContent>
											<div className="space-y-4 pt-2">
												{personalHistoryItems.map((item, index) => (
													<div key={item.key} className="space-y-2">
														<Label>
															{index + 1}. {item.label}
														</Label>
														<RadioGroup
															value={
																formData.personalHistory[
																	item.key as keyof typeof formData.personalHistory
																] as string
															}
															onValueChange={(value) =>
																setFormData({
																	...formData,
																	personalHistory: {
																		...formData.personalHistory,
																		[item.key]: value as 'yes' | 'no',
																	},
																})
															}
															className="flex flex-row gap-6"
														>
															<div className="flex items-center space-x-2">
																<RadioGroupItem
																	value="yes"
																	id={`${item.key}-yes`}
																/>
																<Label
																	htmlFor={`${item.key}-yes`}
																	className="cursor-pointer px-2"
																>
																	Có
																</Label>
															</div>
															<div className="flex items-center space-x-2">
																<RadioGroupItem
																	value="no"
																	id={`${item.key}-no`}
																/>
																<Label
																	htmlFor={`${item.key}-no`}
																	className="cursor-pointer px-2"
																>
																	Không
																</Label>
															</div>
														</RadioGroup>
													</div>
												))}

												{formData.personalHistory.otherDisease === 'yes' && (
													<div className="space-y-2">
														<Label htmlFor="otherDiseaseName">
															Ghi rõ bệnh khác
														</Label>
														<Textarea
															id="otherDiseaseName"
															value={formData.personalHistory.otherDiseaseName}
															onChange={(e) =>
																setFormData({
																	...formData,
																	personalHistory: {
																		...formData.personalHistory,
																		otherDiseaseName: e.target.value,
																	},
																})
															}
															placeholder="Nhập tên bệnh khác"
															className="border-gray-300 focus:border-blue-500 resize-none placeholder:text-sm"
															rows={3}
														/>
													</div>
												)}
											</div>
										</AccordionContent>
									</AccordionItem>

									{/* IV. CÂU HỎI KHÁC */}
									<AccordionItem value="section4">
										<AccordionTrigger className="text-base sm:text-lg font-semibold">
											<div className="flex items-center gap-2">
												<span>IV. CÂU HỎI KHÁC</span>
											</div>
										</AccordionTrigger>
										<AccordionContent>
											<div className="space-y-4 pt-2">
												<div className="space-y-2">
													<Label>
														a) Ông (bà) có đang điều trị bệnh gì không?
													</Label>
													<RadioGroup
														value={formData.currentTreatment}
														onValueChange={(value) =>
															setFormData({
																...formData,
																currentTreatment: value as 'yes' | 'no',
															})
														}
														className="flex flex-row gap-6"
													>
														<div className="flex items-center space-x-2">
															<RadioGroupItem value="yes" id="treatment-yes" />
															<Label
																htmlFor="treatment-yes"
																className="cursor-pointer px-2"
															>
																Có
															</Label>
														</div>
														<div className="flex items-center space-x-2">
															<RadioGroupItem value="no" id="treatment-no" />
															<Label
																htmlFor="treatment-no"
																className="cursor-pointer px-2"
															>
																Không
															</Label>
														</div>
													</RadioGroup>
												</div>

												{formData.currentTreatment === 'yes' && (
													<>
														<div className="space-y-2">
															<Label htmlFor="currentMedications">
																Liệt kê thuốc và liều lượng đang dùng
															</Label>
															<Textarea
																id="currentMedications"
																value={formData.currentMedications}
																onChange={(e) =>
																	setFormData({
																		...formData,
																		currentMedications: e.target.value,
																	})
																}
																placeholder="Nhập tên các thuốc đang dùng"
																className="border-gray-300 focus:border-blue-500 resize-none placeholder:text-sm"
																rows={3}
															/>
														</div>
													</>
												)}

												<div className="space-y-2">
													<Label>b) Tiền sử thai sản (Đối với phụ nữ)</Label>
													<RadioGroup
														value={formData.hasPregnancyHistory}
														onValueChange={(value) =>
															setFormData({
																...formData,
																hasPregnancyHistory: value as 'yes' | 'no',
															})
														}
														className="flex flex-row gap-6"
													>
														<div className="flex items-center space-x-2">
															<RadioGroupItem value="yes" id="pregnancy-yes" />
															<Label
																htmlFor="pregnancy-yes"
																className="cursor-pointer px-2"
															>
																Có
															</Label>
														</div>
														<div className="flex items-center space-x-2">
															<RadioGroupItem value="no" id="pregnancy-no" />
															<Label
																htmlFor="pregnancy-no"
																className="cursor-pointer px-2"
															>
																Không
															</Label>
														</div>
													</RadioGroup>
												</div>

												{formData.hasPregnancyHistory === 'yes' && (
													<div className="space-y-2">
														<Label htmlFor="pregnancyHistory">
															Mô tả tiền sử thai sản
														</Label>
														<Textarea
															id="pregnancyHistory"
															value={formData.pregnancyHistory}
															onChange={(e) =>
																setFormData({
																	...formData,
																	pregnancyHistory: e.target.value,
																})
															}
															placeholder="Mô tả tiền sử thai sản"
															className="border-gray-300 focus:border-blue-500 resize-none placeholder:text-sm"
															rows={3}
														/>
													</div>
												)}
											</div>
										</AccordionContent>
									</AccordionItem>
								</Accordion>

								{/* Submit Button */}
								<div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 sm:pt-6">
									<Button
										type="submit"
										className={`w-full sm:flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-lg`}
									>
										<Calendar className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
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
